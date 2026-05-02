from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Enum as SQLAlchemyEnum, Text, Boolean, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from weezy_cbs.database import Base

class AssetStatusEnum(enum.Enum):
    ACTIVE = "ACTIVE"
    FULLY_DEPRECIATED = "FULLY_DEPRECIATED"
    DISPOSED = "DISPOSED"
    WRITTEN_OFF = "WRITTEN_OFF"

class AssetCategory(Base):
    """
    Configuration for asset classes (e.g. IT Equipment, Office Furniture).
    Defines the depreciation rate and method.
    """
    __tablename__ = "asset_categories"

    id = Column(Integer, primary_key=True, index=True)
    category_name = Column(String(100), unique=True, nullable=False)
    
    # Depreciation Config
    annual_depreciation_pct = Column(Numeric(precision=5, scale=2), nullable=False) # e.g. 20%
    depreciation_method = Column(String(50), default="STRAIGHT_LINE") # STRAIGHT_LINE, REDUCING_BALANCE
    
    # GL Mappings
    asset_gl_code = Column(String(20), nullable=False) # The balance sheet GL (Asset)
    depreciation_expense_gl_code = Column(String(20), nullable=False) # The P&L GL (Expense)
    accumulated_depr_gl_code = Column(String(20), nullable=False) # The Contra-Asset GL
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class FixedAsset(Base):
    """
    Individual physical assets owned by the bank.
    """
    __tablename__ = "fixed_assets"

    id = Column(Integer, primary_key=True, index=True)
    asset_tag = Column(String(50), unique=True, index=True, nullable=False) # e.g. WZY/HQ/IT/2026/001
    name = Column(String(200), nullable=False)
    category_id = Column(Integer, ForeignKey("asset_categories.id"), nullable=False)
    
    purchase_price = Column(Numeric(precision=18, scale=2), nullable=False)
    purchase_date = Column(Date, nullable=False)
    
    current_book_value = Column(Numeric(precision=18, scale=2), nullable=False)
    accumulated_depreciation = Column(Numeric(precision=18, scale=2), default=0.00)
    
    status = Column(SQLAlchemyEnum(AssetStatusEnum), default=AssetStatusEnum.ACTIVE)
    location = Column(String(200), nullable=True) # e.g. "Lagos Branch - IT Room"
    serial_number = Column(String(100), nullable=True)
    
    last_depreciation_date = Column(Date, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    category = relationship("AssetCategory")

class AssetDepreciationLog(Base):
    """
    Records every depreciation entry posted to the GL.
    """
    __tablename__ = "asset_depreciation_logs"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("fixed_assets.id"), nullable=False)
    
    depreciation_amount = Column(Numeric(precision=18, scale=2), nullable=False)
    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)
    
    gl_reference = Column(String(50), nullable=True) # Link to ledger entry
    created_at = Column(DateTime(timezone=True), server_default=func.now())
