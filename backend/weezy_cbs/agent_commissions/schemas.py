from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import decimal
from .models import CommissionStatusEnum

class CommissionConfigCreate(BaseModel):
    transaction_type: str
    bank_share_pct: decimal.Decimal
    agent_share_pct: decimal.Decimal
    super_agent_share_pct: decimal.Decimal

class CommissionConfigResponse(BaseModel):
    id: int
    transaction_type: str
    bank_share_pct: decimal.Decimal
    agent_share_pct: decimal.Decimal
    super_agent_share_pct: decimal.Decimal
    is_active: bool
    
    class Config:
        orm_mode = True

class CommissionLogResponse(BaseModel):
    id: int
    financial_transaction_id: str
    total_fee_collected: decimal.Decimal
    bank_amount: decimal.Decimal
    agent_amount: decimal.Decimal
    super_agent_amount: decimal.Decimal
    status: CommissionStatusEnum
    created_at: datetime
    
    class Config:
        orm_mode = True

class AgentWalletResponse(BaseModel):
    wallet_account_number: str
    current_balance: decimal.Decimal
    total_lifetime_earned: decimal.Decimal
    last_payout_at: Optional[datetime]
    
    class Config:
        orm_mode = True
