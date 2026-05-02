from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import decimal
from .models import BillerCategoryEnum

class BillerItemResponse(BaseModel):
    id: int
    name: str
    item_code: str
    amount: Optional[decimal.Decimal]
    is_fixed_amount: bool

    class Config:
        orm_mode = True

class BillerResponse(BaseModel):
    id: int
    name: str
    biller_code: str
    category: BillerCategoryEnum
    logo_url: Optional[str]
    requires_validation: bool
    items: List[BillerItemResponse]

    class Config:
        orm_mode = True

class BillValidationRequest(BaseModel):
    biller_code: str
    customer_identifier: str

class BillPaymentRequest(BaseModel):
    biller_code: str
    item_code: Optional[str] = None
    amount: decimal.Decimal
    customer_identifier: str # Phone, Meter, or Smartcard ID
    account_number: str # User's bank account to debit
    narration: Optional[str] = None
