from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
import decimal
from .models import FDStatusEnum, RolloverInstructionEnum

class FDProductCreate(BaseModel):
    product_code: str
    name: str
    interest_rate_pa: decimal.Decimal
    tenor_days: int
    minimum_amount: decimal.Decimal = 100000.00
    early_liquidation_penalty_pct: decimal.Decimal = 50.00

class FDAccountCreate(BaseModel):
    product_id: int
    principal_amount: decimal.Decimal
    linked_savings_account: str
    rollover_instruction: RolloverInstructionEnum = RolloverInstructionEnum.NONE

class FDAccountResponse(BaseModel):
    id: int
    fd_account_number: str
    principal_amount: decimal.Decimal
    interest_rate_applied: decimal.Decimal
    booking_date: date
    maturity_date: date
    accrued_interest: decimal.Decimal
    status: FDStatusEnum
    rollover_instruction: RolloverInstructionEnum
    linked_savings_account: str
    created_at: datetime
    
    class Config:
        orm_mode = True

class FDProductResponse(BaseModel):
    id: int
    product_code: str
    name: str
    interest_rate_pa: decimal.Decimal
    tenor_days: int
    minimum_amount: decimal.Decimal
    is_active: bool
    
    class Config:
        orm_mode = True
