from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import decimal
from .models import QRTypeEnum

class QRCodeBase(BaseModel):
    account_number: str
    qr_type: QRTypeEnum = QRTypeEnum.STATIC
    amount: Optional[decimal.Decimal] = None
    narration: Optional[str] = None

class QRCodeCreate(QRCodeBase):
    customer_id: int

class QRCodeResponse(QRCodeBase):
    id: int
    qr_payload: str
    created_at: datetime

    class Config:
        orm_mode = True

class QRScanRequest(BaseModel):
    qr_payload: str

class QRPaymentRequest(BaseModel):
    qr_payload: str
    sender_account: str
    amount: decimal.Decimal # User provides if static, matches if dynamic
    pin: str
