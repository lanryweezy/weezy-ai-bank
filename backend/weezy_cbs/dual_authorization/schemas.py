from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import decimal
from .models import ApprovalStatusEnum

class ApprovalRequestResponse(BaseModel):
    id: int
    request_id: str
    action_type: str
    payload_json: Dict[str, Any]
    status: ApprovalStatusEnum
    maker_name: str
    created_at: datetime

    class Config:
        orm_mode = True

class ApprovalDecisionRequest(BaseModel):
    reason: Optional[str] = None
