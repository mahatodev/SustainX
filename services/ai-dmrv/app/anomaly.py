import numpy as np
from typing import List, Optional
from pydantic import BaseModel
from sklearn.ensemble import IsolationForest

class AnomalyCheckRequest(BaseModel):
    user_id: str
    rolling_7d_submission_count: int
    avg_hours_between_submissions: float
    variance_reported_savings: float
    recent_submissions_per_hour: Optional[int] = 1

class AnomalyCheckResponse(BaseModel):
    user_id: str
    is_anomaly: bool
    fraud_penalty_multiplier: float  # 0.0 for fraud, 1.0 for normal
    anomaly_score: float
    rejection_reason: Optional[str] = None

class BehavioralAnomalyDetector:
    def __init__(self):
        # Features: [rolling_7d_count, avg_hours_between, variance_savings, recent_rate_per_hour]
        # Seed realistic baseline distribution
        np.random.seed(42)
        normal_counts = np.random.normal(loc=12, scale=4, size=200).clip(1, 30)
        normal_hours = np.random.normal(loc=14, scale=6, size=200).clip(2, 48)
        normal_variance = np.random.normal(loc=25, scale=10, size=200).clip(5, 80)
        normal_rate = np.random.choice([0, 1, 2], size=200)

        X_train = np.column_stack([normal_counts, normal_hours, normal_variance, normal_rate])
        self.model = IsolationForest(contamination=0.08, random_state=42)
        self.model.fit(X_train)

    def evaluate_submission(self, req: AnomalyCheckRequest) -> AnomalyCheckResponse:
        # Extreme heuristic gate for instantaneous bot floods
        if req.recent_submissions_per_hour > 10 or req.avg_hours_between_submissions < 0.05:
            return AnomalyCheckResponse(
                user_id=req.user_id,
                is_anomaly=True,
                fraud_penalty_multiplier=0.0,
                anomaly_score=-0.85,
                rejection_reason="ERR_BOT_BURST_DETECTED: Over 10 actions/hour or sub-3-minute frequency detected."
            )

        features = np.array([[
            req.rolling_7d_submission_count,
            req.avg_hours_between_submissions,
            req.variance_reported_savings,
            req.recent_submissions_per_hour or 1
        ]])

        prediction = self.model.predict(features)[0]  # 1: normal, -1: anomaly
        score = float(self.model.decision_function(features)[0])

        is_anomaly = (prediction == -1)
        reason = "ERR_ISOLATION_FOREST_OUTLIER: High submission frequency and variance divergence flagged." if is_anomaly else None

        return AnomalyCheckResponse(
            user_id=req.user_id,
            is_anomaly=is_anomaly,
            fraud_penalty_multiplier=0.0 if is_anomaly else 1.0,
            anomaly_score=round(score, 4),
            rejection_reason=reason
        )

detector = BehavioralAnomalyDetector()
