import hashlib
import time
from typing import Optional, Set
from pydantic import BaseModel, Field

# In-memory registry of SHA-256 hashed ticket nonces to enforce zero-replay
SEEN_QR_NONCES: Set[str] = set()

EMISSION_FACTOR_TRANSIT = 0.14  # kg CO2 / km saved vs average private automobile

class QRTransitRequest(BaseModel):
    ticket_id: str = Field(..., description="Unique QR ticket serial string")
    origin_station: str = Field(..., description="e.g. Salt Lake Sector V")
    dest_station: str = Field(..., description="e.g. Sealdah")
    distance_km: float = Field(..., gt=0.1)
    timestamp: Optional[int] = Field(default=None, description="Epoch seconds on ticket")

class QRTransitResponse(BaseModel):
    valid: bool
    ticket_nonce_hash: str
    origin: str
    destination: str
    distance_km: float
    co2_saved_grams: int
    rejection_reason: Optional[str] = None

def verify_and_claim_transit_qr(req: QRTransitRequest) -> QRTransitResponse:
    # Compute SHA-256 Nonce
    raw_nonce = f"{req.ticket_id}:{req.origin_station}->{req.dest_station}"
    nonce_hash = hashlib.sha256(raw_nonce.encode("utf-8")).hexdigest()

    # Gate 1: Nonce Replay Check
    if nonce_hash in SEEN_QR_NONCES:
        return QRTransitResponse(
            valid=False,
            ticket_nonce_hash=nonce_hash,
            origin=req.origin_station,
            destination=req.dest_station,
            distance_km=req.distance_km,
            co2_saved_grams=0,
            rejection_reason=f"ERR_QR_NONCE_REPLAY: Ticket nonce '{nonce_hash[:16]}...' was already claimed."
        )

    # Gate 2: Timestamp validity check (must be within last 24h)
    curr_time = int(time.time())
    ticket_time = req.timestamp or curr_time
    if abs(curr_time - ticket_time) > 86400:
        return QRTransitResponse(
            valid=False,
            ticket_nonce_hash=nonce_hash,
            origin=req.origin_station,
            destination=req.dest_station,
            distance_km=req.distance_km,
            co2_saved_grams=0,
            rejection_reason="ERR_EXPIRED_TICKET: Transit ticket timestamp exceeds 24-hour validity window."
        )

    # Save to seen nonces
    SEEN_QR_NONCES.add(nonce_hash)

    # Calculate CO2 saved in grams
    co2_grams = int(req.distance_km * EMISSION_FACTOR_TRANSIT * 1000)

    return QRTransitResponse(
        valid=True,
        ticket_nonce_hash=nonce_hash,
        origin=req.origin_station,
        destination=req.dest_station,
        distance_km=req.distance_km,
        co2_saved_grams=co2_grams,
        rejection_reason=None
    )
