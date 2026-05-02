from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date
import decimal
from .models import SIFrequencyEnum, SIStatusEnum

class SICreate(BaseModel):
    source_account_number: str
    destination_account_number: str
    destination_bank_code: Optional[str] = "999"
    destination_account_name: Optional[str] = None
    amount: decimal.Decimal
    narration: str
    frequency: SIFrequencyEnum
    start_date: date
    end_date: Optional[date] = None

class SIResponse(BaseModel):
    id: int
    source_account_number: str
    destination_account_number: str
    destination_account_name: Optional[str]
    amount: decimal.Decimal
    frequency: SIFrequencyEnum
    next_run_date: date
    status: SIStatusEnum
    
    class Config:
        orm_mode = True

class SIExecutionLogResponse(BaseModel):
    id: int
    execution_date: datetime
    status: str
    transaction_id: Optional[str]
    error_details: Optional[str]
    
    class Config:
        orm_mode = True
