from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import decimal
from .models import PayrollStatusEnum

class PayrollItemCreate(BaseModel):
    recipient_name: str
    recipient_account: str
    recipient_bank_code: str
    amount: decimal.Decimal
    employee_id: Optional[str] = None

class PayrollBatchCreate(BaseModel):
    corporate_customer_id: int
    items: List[PayrollItemCreate]
    currency: str = "NGN"

class PayrollItemResponse(BaseModel):
    id: int
    recipient_name: str
    recipient_account: str
    amount: decimal.Decimal
    status: str
    error_message: Optional[str]

    class Config:
        orm_mode = True

class PayrollBatchResponse(BaseModel):
    id: int
    batch_reference: str
    total_amount: decimal.Decimal
    item_count: int
    status: PayrollStatusEnum
    ai_risk_score: Optional[int]
    ai_anomaly_report: Optional[Dict[str, Any]]
    created_at: datetime
    items: List[PayrollItemResponse]

    class Config:
        orm_mode = True
