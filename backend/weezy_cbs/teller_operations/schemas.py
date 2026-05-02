from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import decimal
from .models import TillStatusEnum

class TellerPostingCreate(BaseModel):
    customer_account_number: str
    posting_type: str = Field(..., description="CASH_DEPOSIT or CASH_WITHDRAWAL")
    amount: decimal.Decimal
    depositor_name: Optional[str] = None
    depositor_phone: Optional[str] = None
    narration: str

class TellerPostingResponse(BaseModel):
    id: int
    reference: str
    till_id: int
    customer_account_number: str
    posting_type: str
    amount: decimal.Decimal
    narration: str
    status: str
    created_at: datetime
    
    class Config:
        orm_mode = True

class VaultTransactionRequest(BaseModel):
    transaction_type: str = Field(..., description="VAULT_TO_TILL or TILL_TO_VAULT")
    amount: decimal.Decimal
    
class TillStatusResponse(BaseModel):
    till_id: int
    branch_name: str
    status: TillStatusEnum
    current_cash_balance: decimal.Decimal
    max_holding_limit: decimal.Decimal
    
    class Config:
        orm_mode = True
