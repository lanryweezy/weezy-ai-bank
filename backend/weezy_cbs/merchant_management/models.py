from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Enum as SQLAlchemyEnum, Text, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from weezy_cbs.database import Base

class MerchantTierEnum(enum.Enum):
    RETAIL = "RETAIL"
    ENTERPRISE = "ENTERPRISE"
    PARTNER = "PARTNER"

class MerchantStatusEnum(enum.Enum):
    PENDING = "PENDING"
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"

class MerchantProfile(Base):
    __tablename__ = "merchant_profiles"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), unique=True, nullable=False)
    
    business_name = Column(String(150), nullable=False)
    merchant_id = Column(String(20), unique=True, index=True, nullable=False) # e.g. WZY-MER-12345
    
    tier = Column(SQLAlchemyEnum(MerchantTierEnum), default=MerchantTierEnum.RETAIL)
    status = Column(SQLAlchemyEnum(MerchantStatusEnum), default=MerchantStatusEnum.PENDING)
    
    # Settlement Settings (Nigerian T+1 Standard)
    settlement_account_number = Column(String(10), nullable=False) # NUBAN
    settlement_bank_code = Column(String(10), default="999")
    
    # Configuration
    transaction_fee_flat = Column(Numeric(precision=18, scale=2), default=0.00)
    transaction_fee_percent = Column(Numeric(precision=5, scale=4), default=0.015) # 1.5% Cap at N2000 standard
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    customer = relationship("Customer")
    terminals = relationship("POSTerminal", back_populates="merchant")

class POSTerminal(Base):
    __tablename__ = "pos_terminals"

    id = Column(Integer, primary_key=True, index=True)
    merchant_id = Column(Integer, ForeignKey("merchant_profiles.id"), nullable=False)
    
    terminal_id = Column(String(16), unique=True, index=True, nullable=False) # 8 or 16 digit ID
    serial_number = Column(String(50), unique=True, nullable=False)
    model = Column(String(50), nullable=True) # e.g. PAX S90
    
    is_active = Column(Boolean, default=True)
    last_interaction_at = Column(DateTime(timezone=True), nullable=True)
    
    merchant = relationship("MerchantProfile", back_populates="terminals")

class POSSettlement(Base):
    """Tracks daily settlements to merchants."""
    __tablename__ = "pos_settlements"

    id = Column(Integer, primary_key=True, index=True)
    merchant_id = Column(Integer, ForeignKey("merchant_profiles.id"), nullable=False)
    
    settlement_date = Column(DateTime(timezone=True), server_default=func.now())
    total_volume = Column(Numeric(precision=18, scale=2), nullable=False)
    total_fees = Column(Numeric(precision=18, scale=2), nullable=False)
    net_amount = Column(Numeric(precision=18, scale=2), nullable=False)
    
    transaction_ids_json = Column(JSON, nullable=False) # List of FT IDs included
    settlement_reference = Column(String(50), unique=True)
    
    status = Column(String(20), default="PENDING") # PENDING, PROCESSED, FAILED
