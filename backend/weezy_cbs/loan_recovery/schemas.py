from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import decimal
from .models import CollectionStageEnum

class RecoveryActionResponse(BaseModel):
    id: int
    loan_account_id: int
    stage: CollectionStageEnum
    action_type: str
    ai_drafted_message: Optional[str]
    status: str
    created_at: datetime

    class Config:
        orm_mode = True

class PromiseRequest(BaseModel):
    loan_account_id: int
    promised_amount: decimal.Decimal
    promised_date: datetime

class RecoveryDashboardStats(BaseModel):
    total_delinquent_volume: decimal.Decimal
    active_recovery_tasks: int
    repayment_promises_kept_rate: float
    ai_conversion_rate: float # How many AI messages led to repayment
