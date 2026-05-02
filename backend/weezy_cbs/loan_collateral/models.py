from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Enum as SQLAlchemyEnum, Text, Boolean, Date, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from weezy_cbs.database import Base

class CollateralTypeEnum(enum.Enum):
    CASH_DEPOSIT = "CASH_DEPOSIT"
    LAND_PROPERTY = "LAND_PROPERTY"
    VEHICLE = "VEHICLE"
    MARKETABLE_SECURITIES = "MARKETABLE_SECURITIES" # Stocks/Bonds
    INVENTORY_COMMODITY = "INVENTORY_COMMODITY"
    GUARANTOR_FORM = "GUARANTOR_FORM"

class CollateralStatusEnum(enum.Enum):
    PENDING_VALUATION = "PENDING_VALUATION"
    ACTIVE_PLEDGED = "ACTIVE_PLEDGED"
    RELEASED = "RELEASED"
    LIQUIDATED = "LIQUIDATED" # If loan defaulted and asset sold

class Collateral(Base):
    """
    Assets pledged against loan applications or active loans.
    """
    __tablename__ = "loan_collaterals"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    application_id = Column(Integer, ForeignKey("loan_applications.id"), nullable=True) # Linked during origination
    loan_account_id = Column(Integer, ForeignKey("loan_accounts.id"), nullable=True) # Linked after disbursement
    
    collateral_type = Column(SQLAlchemyEnum(CollateralTypeEnum), nullable=False)
    description = Column(Text, nullable=False) # e.g. "Toyota Camry 2018, White, VIN:..."
    
    # Valuation
    estimated_market_value = Column(Numeric(precision=18, scale=2), nullable=False)
    forced_sale_value = Column(Numeric(precision=18, scale=2), nullable=True) # Usually 70-80% of market value
    valuation_date = Column(Date, nullable=True)
    
    status = Column(SQLAlchemyEnum(CollateralStatusEnum), default=CollateralStatusEnum.PENDING_VALUATION)
    
    # Custody
    document_reference = Column(String(100), nullable=True) # e.g. C of O number, Logbook Ref
    physical_custody_location = Column(String(200), nullable=True) # e.g. "HQ Strongroom"
    
    ai_asset_analysis = Column(JSON, nullable=True) # AI interpretation of asset value/risk
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    customer = relationship("Customer")

class CollateralValuationHistory(Base):
    """Tracks re-valuations of an asset over time."""
    __tablename__ = "collateral_valuation_history"

    id = Column(Integer, primary_key=True, index=True)
    collateral_id = Column(Integer, ForeignKey("loan_collaterals.id"), nullable=False)
    
    valued_amount = Column(Numeric(precision=18, scale=2), nullable=False)
    valued_by_id = Column(Integer, ForeignKey("users.id"), nullable=True) # External valuer or internal staff
    
    comments = Column(Text, nullable=True)
    valuation_date = Column(DateTime(timezone=True), server_default=func.now())
