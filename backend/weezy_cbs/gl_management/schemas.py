from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import decimal

class GLAccountCreate(BaseModel):
    gl_code: str
    name: str
    currency: str = "NGN"
    gl_type: str
    parent_gl_code: Optional[str] = None
    is_control_account: bool = False

class GLAccountUpdate(BaseModel):
    name: Optional[str] = None
    is_active: Optional[bool] = None

class GLAccountResponse(BaseModel):
    id: int
    gl_code: str
    name: str
    currency: str
    gl_type: str
    parent_gl_code: Optional[str]
    is_control_account: bool
    current_balance: decimal.Decimal
    is_active: bool
    created_at: datetime
    
    class Config:
        orm_mode = True

class ChartOfAccountsResponse(BaseModel):
    assets: List[GLAccountResponse]
    liabilities: List[GLAccountResponse]
    equity: List[GLAccountResponse]
    income: List[GLAccountResponse]
    expenses: List[GLAccountResponse]
    total_assets: decimal.Decimal
    total_liabilities: decimal.Decimal
