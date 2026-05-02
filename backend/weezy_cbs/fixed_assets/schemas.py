from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date
import decimal
from .models import AssetStatusEnum

class AssetCategoryCreate(BaseModel):
    category_name: str
    annual_depreciation_pct: decimal.Decimal
    depreciation_method: str = "STRAIGHT_LINE"
    asset_gl_code: str
    depreciation_expense_gl_code: str
    accumulated_depr_gl_code: str

class FixedAssetCreate(BaseModel):
    name: str
    category_id: int
    purchase_price: decimal.Decimal
    purchase_date: date
    location: Optional[str] = None
    serial_number: Optional[str] = None

class FixedAssetResponse(BaseModel):
    id: int
    asset_tag: str
    name: str
    purchase_price: decimal.Decimal
    current_book_value: decimal.Decimal
    accumulated_depreciation: decimal.Decimal
    status: AssetStatusEnum
    location: Optional[str]
    purchase_date: date
    
    class Config:
        orm_mode = True

class AssetCategoryResponse(BaseModel):
    id: int
    category_name: str
    annual_depreciation_pct: decimal.Decimal
    
    class Config:
        orm_mode = True

class DepreciationBatchStats(BaseModel):
    assets_processed: int
    total_depreciation_posted: decimal.Decimal
    status: str = "SUCCESS"
