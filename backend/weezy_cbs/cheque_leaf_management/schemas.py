from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import decimal
from .models import ChequeLeafStatusEnum, StopPaymentReasonEnum

class ChequeBookIssueRequest(BaseModel):
    customer_id: int
    account_number: str
    leaf_count: int = 25
    start_leaf_number: str

class ChequeLeafResponse(BaseModel):
    id: int
    leaf_number: str
    status: ChequeLeafStatusEnum
    used_at: Optional[datetime]
    payee_name: Optional[str]
    
    class Config:
        orm_mode = True

class ChequeBookResponse(BaseModel):
    id: int
    account_number: str
    start_leaf_number: str
    end_leaf_number: str
    total_leaves: int
    is_active: bool
    leaves: List[ChequeLeafResponse]
    
    class Config:
        orm_mode = True

class StopPaymentRequest(BaseModel):
    cheque_number: str
    account_number: str
    reason: StopPaymentReasonEnum
    details: Optional[str] = None

class StopPaymentResponse(BaseModel):
    id: int
    cheque_number: str
    status: str = "PENDING_APPROVAL"
    created_at: datetime
    
    class Config:
        orm_mode = True
