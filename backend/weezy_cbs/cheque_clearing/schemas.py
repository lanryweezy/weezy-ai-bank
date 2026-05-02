from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import decimal
from .models import ChequeStatusEnum

class ChequeDepositCreate(BaseModel):
    customer_id: int
    target_account_number: str
    cheque_number: str
    issuing_bank_code: str
    amount: decimal.Decimal

class ChequeDepositResponse(BaseModel):
    id: int
    deposit_reference: str
    cheque_number: str
    issuing_bank_name: str
    amount: decimal.Decimal
    status: ChequeStatusEnum
    created_at: datetime
    cleared_at: Optional[datetime]

    class Config:
        orm_mode = True

class ChequeBookRequestSchema(BaseModel):
    account_number: str
    leaf_count: int
    delivery_address: str
