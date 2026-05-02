from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Enum as SQLAlchemyEnum, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from weezy_cbs.database import Base

class FXCurrencyEnum(enum.Enum):
    NGN = "NGN"
    USD = "USD"
    EUR = "EUR"
    GBP = "GBP"

class FXRate(Base):
    """Stores real-time (simulated) exchange rates."""
    __tablename__ = "fx_rates"

    id = Column(Integer, primary_key=True, index=True)
    base_currency = Column(SQLAlchemyEnum(FXCurrencyEnum), default=FXCurrencyEnum.NGN)
    target_currency = Column(SQLAlchemyEnum(FXCurrencyEnum))
    
    buy_rate = Column(Numeric(precision=18, scale=4), nullable=False) # Rate bank buys target CCY
    sell_rate = Column(Numeric(precision=18, scale=4), nullable=False) # Rate bank sells target CCY
    
    is_active = Column(Boolean, default=True)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class DomiciliaryAccount(Base):
    """
    Foreign currency accounts for customers.
    """
    __tablename__ = "domiciliary_accounts"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    ledger_account_id = Column(Integer, ForeignKey("accounts.id"), unique=True, nullable=False)
    
    currency = Column(SQLAlchemyEnum(FXCurrencyEnum), nullable=False)
    balance = Column(Numeric(precision=18, scale=2), default=0.00)
    
    status = Column(String(20), default="ACTIVE")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    customer = relationship("Customer")
    ledger_account = relationship("Account")

class FXTransaction(Base):
    """Logs currency exchange (Swap) transactions."""
    __tablename__ = "fx_transactions"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String, ForeignKey("financial_transactions.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    
    source_currency = Column(SQLAlchemyEnum(FXCurrencyEnum))
    target_currency = Column(SQLAlchemyEnum(FXCurrencyEnum))
    
    source_amount = Column(Numeric(precision=18, scale=2))
    target_amount = Column(Numeric(precision=18, scale=2))
    applied_rate = Column(Numeric(precision=18, scale=4))
    
    status = Column(String(20), default="COMPLETED")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
