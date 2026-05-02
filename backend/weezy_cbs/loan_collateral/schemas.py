from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date
import decimal
from .models import CollateralTypeEnum, CollateralStatusEnum

class CollateralCreate(BaseModel):
    customer_id: int
    application_id: Optional[int] = None
    collateral_type: CollateralTypeEnum
    description: str
    estimated_market_value: decimal.Decimal
    document_reference: Optional[str] = None
    physical_custody_location: Optional[str] = None

class CollateralResponse(BaseModel):
    id: int
    collateral_type: CollateralTypeEnum
    description: str
    estimated_market_value: decimal.Decimal
    forced_sale_value: Optional[decimal.Decimal]
    status: CollateralStatusEnum
    document_reference: Optional[str]
    created_at: datetime
    
    class Config:
        orm_mode = True

class ValuationUpdateRequest(BaseModel):
    valued_amount: decimal.Decimal
    comments: str
