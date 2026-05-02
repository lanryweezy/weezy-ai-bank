from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from .models import RiskLevelEnum

class RiskEventResponse(BaseModel):
    id: int
    event_type: str
    description: str
    severity: RiskLevelEnum
    created_at: datetime

    class Config:
        orm_mode = True

class CustomerRiskProfileResponse(BaseModel):
    id: int
    customer_id: int
    risk_level: RiskLevelEnum
    risk_score: float
    ai_assessment_report: Optional[Dict[str, Any]]
    is_pep: bool
    sanction_list_match: bool
    unusual_transaction_velocity: bool
    last_assessment_date: datetime
    risk_events: List[RiskEventResponse]

    class Config:
        orm_mode = True

class RiskAssessmentRequest(BaseModel):
    customer_id: int
    force_refresh: bool = False
