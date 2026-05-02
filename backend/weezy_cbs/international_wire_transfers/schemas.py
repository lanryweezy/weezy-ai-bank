from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import decimal
from .models import WireStatusEnum

class WireTransferBase(BaseModel):
    beneficiary_name: str
    beneficiary_account: str
    beneficiary_bank_name: str
    beneficiary_bank_swift_bic: str = Field(..., max_length=11)
    
    amount: decimal.Decimal
    currency: str = "USD"
    purpose_of_payment: str
    source_account_number: str

class WireTransferCreate(WireTransferBase):
    customer_id: int
    pta_bta_eligible: bool = False

class WireTransferResponse(WireTransferBase):
    id: int
    reference_number: str
    status: WireStatusEnum
    created_at: datetime
    processed_at: Optional[datetime]

    class Config:
        orm_mode = True

class SWIFTMessageResponse(BaseModel):
    reference: str
    mt103_raw: str
    status: str
