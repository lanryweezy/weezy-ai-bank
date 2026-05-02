from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import date, datetime
import decimal
from .models import SavingsTypeEnum, SavingsStatusEnum

class SavingsGoalBase(BaseModel):
    name: str
    target_amount: decimal.Decimal
    target_date: date
    savings_type: SavingsTypeEnum = SavingsTypeEnum.GOAL_SAVINGS
    is_automated: bool = False
    auto_save_amount: Optional[decimal.Decimal] = None
    auto_save_frequency: Optional[str] = None

class SavingsGoalCreate(SavingsGoalBase):
    customer_id: int

class SavingsGoalResponse(SavingsGoalBase):
    id: int
    current_balance: decimal.Decimal
    interest_rate: decimal.Decimal
    status: SavingsStatusEnum
    created_at: datetime

    class Config:
        orm_mode = True

class InvestmentProductResponse(BaseModel):
    id: int
    name: str
    product_type: SavingsTypeEnum
    minimum_amount: decimal.Decimal
    interest_rate_pa: decimal.Decimal
    tenure_days: int
    description: Optional[str]

    class Config:
        orm_mode = True
