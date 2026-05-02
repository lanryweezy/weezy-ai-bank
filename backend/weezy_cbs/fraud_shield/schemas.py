from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from .models import FraudRiskLevelEnum, FraudStatusEnum

class FraudAlertResponse(BaseModel):
    id: int
    transaction_id: Optional[str]
    customer_id: int
    risk_score: float
    risk_level: FraudRiskLevelEnum
    status: FraudStatusEnum
    ai_analysis_report: Optional[Dict[str, Any]]
    created_at: datetime

    class Config:
        orm_mode = True

class FraudReviewRequest(BaseModel):
    alert_id: int
    decision: FraudStatusEnum
    notes: str
