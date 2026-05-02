from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import decimal
from .models import AgentTierEnum, AgentStatusEnum

class AgentProfileBase(BaseModel):
    business_name: str
    state: str
    lga: str
    address: str
    tier: AgentTierEnum = AgentTierEnum.RETAIL_AGENT

class AgentProfileCreate(AgentProfileBase):
    customer_id: int

class AgentProfileResponse(AgentProfileBase):
    id: int
    agent_code: str
    status: AgentStatusEnum
    float_account_number: str
    commission_account_number: str
    created_at: datetime

    class Config:
        orm_mode = True

class CashInRequest(BaseModel):
    agent_code: str
    customer_account_number: str
    amount: decimal.Decimal
    narration: Optional[str] = None
    terminal_id: Optional[str] = None

class CashOutRequest(BaseModel):
    agent_code: str
    customer_account_number: str
    amount: decimal.Decimal
    pin: str # Customer's withdrawal PIN
    terminal_id: Optional[str] = None
