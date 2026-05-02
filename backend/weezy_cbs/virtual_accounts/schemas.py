from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import decimal
from .models import VirtualAccountStatusEnum

class VirtualAccountBase(BaseModel):
    label: Optional[str] = None
    account_name: str

class VirtualAccountCreate(VirtualAccountBase):
    customer_id: int
    parent_account_id: int

class VirtualAccountResponse(VirtualAccountBase):
    id: int
    account_number: str
    bank_name: str
    bank_code: str
    status: VirtualAccountStatusEnum
    created_at: datetime

    class Config:
        orm_mode = True

class VAIncomingPaymentResponse(BaseModel):
    id: int
    sender_name: Optional[str]
    amount: decimal.Decimal
    created_at: datetime

    class Config:
        orm_mode = True

class VirtualAccountDashboard(BaseModel):
    total_collections: decimal.Decimal
    active_accounts_count: int
    recent_payments: List[VAIncomingPaymentResponse]
