from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import decimal
from datetime import datetime
from .models import MerchantTierEnum, MerchantStatusEnum

class MerchantProfileBase(BaseModel):
    business_name: str
    settlement_account_number: str
    tier: MerchantTierEnum = MerchantTierEnum.RETAIL

class MerchantProfileCreate(MerchantProfileBase):
    customer_id: int

class MerchantProfileResponse(MerchantProfileBase):
    id: int
    merchant_id: str
    status: MerchantStatusEnum
    created_at: datetime

    class Config:
        orm_mode = True

class POSTerminalResponse(BaseModel):
    id: int
    terminal_id: str
    serial_number: str
    model: Optional[str]
    is_active: bool

    class Config:
        orm_mode = True

class POSTransactionRequest(BaseModel):
    terminal_id: str
    pan_masked: str # e.g. 5061********1234
    amount: decimal.Decimal
    currency: str = "NGN"
    pin_block: str # Simulated encrypted PIN
    narration: Optional[str] = None

class SettlementResponse(BaseModel):
    id: int
    merchant_id: int
    settlement_date: datetime
    total_volume: decimal.Decimal
    net_amount: decimal.Decimal
    status: str

    class Config:
        orm_mode = True
