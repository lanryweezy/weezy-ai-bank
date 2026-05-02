from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import decimal
from .models import FXCurrencyEnum

class FXRateResponse(BaseModel):
    base_currency: FXCurrencyEnum
    target_currency: FXCurrencyEnum
    buy_rate: decimal.Decimal
    sell_rate: decimal.Decimal
    last_updated: datetime

    class Config:
        orm_mode = True

class DomAccountResponse(BaseModel):
    id: int
    currency: FXCurrencyEnum
    balance: decimal.Decimal
    status: str
    created_at: datetime

    class Config:
        orm_mode = True

class FXSwapRequest(BaseModel):
    source_currency: FXCurrencyEnum
    target_currency: FXCurrencyEnum
    amount: decimal.Decimal
