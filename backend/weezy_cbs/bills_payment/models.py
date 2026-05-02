from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Enum as SQLAlchemyEnum, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from weezy_cbs.database import Base

class BillerCategoryEnum(enum.Enum):
    AIRTIME = "AIRTIME"
    DATA = "DATA"
    CABLE_TV = "CABLE_TV"
    ELECTRICITY = "ELECTRICITY"
    INTERNET = "INTERNET"
    UTILITIES = "UTILITIES"
    GOVERNMENT = "GOVERNMENT"

class Biller(Base):
    __tablename__ = "billers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    biller_code = Column(String(50), unique=True, index=True, nullable=False) # e.g. MTN_VTU, DSTV
    category = Column(SQLAlchemyEnum(BillerCategoryEnum), nullable=False)
    logo_url = Column(String(255), nullable=True)
    
    is_active = Column(Boolean, default=True)
    requires_validation = Column(Boolean, default=False) # Meter numbers, Smartcard IDs
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    items = relationship("BillerItem", back_populates="biller")

class BillerItem(Base):
    """Specific plans or denominations for a biller."""
    __tablename__ = "biller_items"

    id = Column(Integer, primary_key=True, index=True)
    biller_id = Column(Integer, ForeignKey("billers.id"), nullable=False)
    name = Column(String(100), nullable=False) # e.g. MTN 1GB Monthly
    item_code = Column(String(50), nullable=False) # e.g. MTN_1GB_DATA
    
    amount = Column(Numeric(precision=18, scale=2), nullable=True) # Fixed amount or NULL for flexible
    is_fixed_amount = Column(Boolean, default=True)
    
    biller = relationship("Biller", back_populates="items")

class BillPaymentLog(Base):
    __tablename__ = "bill_payment_logs"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String, ForeignKey("financial_transactions.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    biller_id = Column(Integer, ForeignKey("billers.id"), nullable=False)
    
    customer_identifier = Column(String(100), nullable=False) # Phone number, Meter number, etc.
    amount = Column(Numeric(precision=18, scale=2), nullable=False)
    
    status = Column(String(20), default="SUCCESSFUL") # SUCCESSFUL, FAILED, PENDING
    provider_reference = Column(String(100), nullable=True) # External ref from Paystack/Interswitch
    token = Column(String(100), nullable=True) # For electricity prepaid tokens
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    biller = relationship("Biller")
    customer = relationship("Customer")
