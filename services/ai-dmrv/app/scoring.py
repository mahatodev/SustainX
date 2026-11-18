import math
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Section 4 PRD: Baseline-Adjusted, Per-Capita Normalized, Temporal Momentum
# Formula:
# S_total(u, t) = lambda * S_total(u, t-1) + (1 - lambda) * 1000 * sum(w_k * sigmoid(Z_k) * C_k * M_AQI * I_fraud)
# ---------------------------------------------------------------------------

LAMBDA_MOMENTUM = 0.85

# Emission factors (ported & updated from legacy Carbon Footprint Tracker app.py)
# Legacy had: Transportation: 0.14, Electricity: 0.82 (updated to CEA Grid 0.716), Waste: 0.10 (updated to 1.50)
EMISSION_FACTORS: Dict[str, float] = {
    "TRANSPORTATION": 0.14,  # kg CO2 / passenger-km (Metro/Bus vs standard private ICE car)
    "ELECTRICITY": 0.716,    # kg CO2 / kWh (CEA India National Grid Average Baseline)
    "WASTE": 1.50,           # kg CO2 / kg segregated dry plastic/recyclable + 1 EPR credit
    "WATER": 0.00034,        # kg CO2 / Liter (0.34 kg CO2e per 1000 Liters treated/pumped)
    "AFFORESTATION": 21.77,  # kg CO2 / sapling / year sequestered on maturity
}

# Domain weights w_k (sum to 1.0)
DOMAIN_WEIGHTS: Dict[str, float] = {
    "ELECTRICITY": 0.30,
    "WASTE": 0.25,
    "TRANSIT": 0.20,
    "WATER": 0.15,
    "AFFORESTATION": 0.10,
}

# Regional Per-Capita Monthly Baselines (Salt Lake / Kolkata Urban Sector benchmark)
REGIONAL_BASELINES = {
    "ELECTRICITY": {"mean": 150.0, "sigma": 45.0},   # kWh / month / household
    "WASTE": {"mean": 18.0, "sigma": 5.0},           # kg / month / household
    "TRANSIT": {"mean": 60.0, "sigma": 20.0},        # km / month / commuter
    "WATER": {"mean": 4500.0, "sigma": 1200.0},      # Liters / month / household
    "AFFORESTATION": {"mean": 2.0, "sigma": 1.0},    # saplings / drive
}

# Verification Confidence Weights C_k in [0.2, 1.0]
CONFIDENCE_MULTIPLIERS: Dict[str, float] = {
    "IOT_SIGNED": 1.00,  # Cryptographically signed HMAC-SHA256 ESP32 packet
    "BBPS_API": 1.00,    # Bharat Connect API verified utility invoice
    "QR_TICKET": 0.90,   # SHA-256 hashed DMRC/Kolkata Metro QR ticket
    "CV_PHOTO": 0.75,    # MobileNetV3 + pHash uniqueness + GPS tag
    "MANUAL": 0.20,      # Self-declared slider entry (unverified)
}

def sigmoid(z: float) -> float:
    """Logistic sigmoid mapping: R -> (0, 1)"""
    try:
        return 1.0 / (1.0 + math.exp(-z))
    except OverflowError:
        return 0.0 if z < 0 else 1.0

def compute_aqi_multiplier(aqi_level: int) -> float:
    """
    Ported from legacy AQI website code/script.js:
    AQI 1-3: 1.0x baseline
    AQI 4 (Poor): 1.25x Dynamic Bounty Multiplier
    AQI 5 (Very Poor): 1.50x Dynamic Bounty Multiplier
    """
    if aqi_level >= 5:
        return 1.50
    elif aqi_level >= 4:
        return 1.25
    return 1.00

def get_tier_from_score(score: int) -> str:
    """ERC-5192 Soulbound Civic Tier thresholds"""
    if score >= 850:
        return "PLATINUM"
    elif score >= 600:
        return "GOLD"
    elif score >= 300:
        return "SILVER"
    return "BRONZE"

class ScoreCalculationRequest(BaseModel):
    user_id: str
    previous_score: int = Field(default=120, ge=0, le=1000)
    domain: str = Field(..., description="ELECTRICITY | WASTE | TRANSIT | WATER | AFFORESTATION")
    raw_value: float = Field(..., gt=0)
    verification_type: str = Field(default="MANUAL")
    household_size: int = Field(default=3, ge=1)
    aqi_level: int = Field(default=3, ge=1, le=5)
    is_fraud: bool = Field(default=False)
    vesting_day: Optional[int] = Field(default=1, description="Day 1 (20%), Day 30 (40%), Day 90 (40%)")

class ScoreCalculationResponse(BaseModel):
    new_composite_score: int
    tier: str
    co2_saved_grams: int
    plastic_saved_grams: int
    confidence_weight: float
    aqi_multiplier: float
    z_score: float
    sigmoid_z: float
    domain_contribution: float

def calculate_ecological_score(req: ScoreCalculationRequest) -> ScoreCalculationResponse:
    domain_key = req.domain.upper()
    if domain_key not in DOMAIN_WEIGHTS:
        raise ValueError(f"Unknown domain: {req.domain}")

    w_k = DOMAIN_WEIGHTS[domain_key]
    c_k = CONFIDENCE_MULTIPLIERS.get(req.verification_type.upper(), 0.20)
    m_aqi = compute_aqi_multiplier(req.aqi_level) if domain_key in ["TRANSIT", "AFFORESTATION"] else 1.00
    i_fraud = 0.0 if req.is_fraud else 1.0

    # Normalization & Per-Capita Z-Score calculation
    benchmark = REGIONAL_BASELINES.get(domain_key, {"mean": 100.0, "sigma": 30.0})
    per_capita_usage = req.raw_value / max(1, req.household_size)
    z_k = (benchmark["mean"] - per_capita_usage) / benchmark["sigma"]
    sig_z = sigmoid(z_k)

    # Compute CO2 and Plastic outputs
    co2_grams = 0
    plastic_grams = 0

    if domain_key == "ELECTRICITY":
        co2_grams = int(req.raw_value * EMISSION_FACTORS["ELECTRICITY"] * 1000)
    elif domain_key == "WASTE":
        co2_grams = int(req.raw_value * EMISSION_FACTORS["WASTE"] * 1000)
        plastic_grams = int(req.raw_value * 1000)
    elif domain_key == "TRANSIT":
        co2_grams = int(req.raw_value * EMISSION_FACTORS["TRANSPORTATION"] * 1000)
    elif domain_key == "WATER":
        co2_grams = int(req.raw_value * EMISSION_FACTORS["WATER"] * 1000)
    elif domain_key == "AFFORESTATION":
        vesting_ratio = 0.20 if req.vesting_day <= 1 else (0.60 if req.vesting_day <= 30 else 1.00)
        co2_grams = int(req.raw_value * EMISSION_FACTORS["AFFORESTATION"] * 1000 * vesting_ratio)

    # Single domain step reward contribution (0 to 1000 scale)
    step_reward = 1000.0 * (w_k * sig_z * c_k * m_aqi * i_fraud)

    # Apply temporal momentum (decay & habit persistence)
    new_score_float = (LAMBDA_MOMENTUM * req.previous_score) + ((1.0 - LAMBDA_MOMENTUM) * (req.previous_score + step_reward))
    new_score = max(0, min(1000, int(round(new_score_float))))
    tier = get_tier_from_score(new_score)

    return ScoreCalculationResponse(
        new_composite_score=new_score,
        tier=tier,
        co2_saved_grams=co2_grams,
        plastic_saved_grams=plastic_grams,
        confidence_weight=c_k,
        aqi_multiplier=m_aqi,
        z_score=round(z_k, 4),
        sigmoid_z=round(sig_z, 4),
        domain_contribution=round(step_reward, 2)
    )
