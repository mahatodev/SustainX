from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from .scoring import (
    ScoreCalculationRequest,
    ScoreCalculationResponse,
    calculate_ecological_score
)
from .vision_dmrv import (
    VisionVerifyResponse,
    verify_image_proof
)
from .qr_transit import (
    QRTransitRequest,
    QRTransitResponse,
    verify_and_claim_transit_qr
)
from .anomaly import (
    AnomalyCheckRequest,
    AnomalyCheckResponse,
    detector
)

app = FastAPI(
    title="SustainX 2.0 AI dMRV & Scoring Protocol Service",
    version="2.0.0",
    description="Micro-dMRV Anti-Spoofing and Baseline-Adjusted Ecological Credit Scoring Engine"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "sustainx-ai-dmrv",
        "version": "2.0.0",
        "protocols": ["dMRV-v2", "ERC-5192-SBT", "ERC-1155-Impact"]
    }

@app.post("/api/score/calculate", response_model=ScoreCalculationResponse)
def calculate_score_endpoint(request: ScoreCalculationRequest):
    try:
        return calculate_ecological_score(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/vision/verify", response_model=VisionVerifyResponse)
async def verify_vision_endpoint(
    image: UploadFile = File(...),
    action_id: Optional[str] = Form("action-demo")
):
    try:
        contents = await image.read()
        return verify_image_proof(contents, action_id=action_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/transit/verify-qr", response_model=QRTransitResponse)
def verify_qr_endpoint(request: QRTransitRequest):
    try:
        return verify_and_claim_transit_qr(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/anomaly/check", response_model=AnomalyCheckResponse)
def check_anomaly_endpoint(request: AnomalyCheckRequest):
    try:
        return detector.evaluate_submission(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
