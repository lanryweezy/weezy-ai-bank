from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Enum as SQLAlchemyEnum, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from weezy_cbs.database import Base

class VirtualAccountStatusEnum(enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    CLOSED = "CLOSED"

class VirtualAccount(Base):
    """
    Virtual Accounts for business collections (Nigerian Market Style).
    These are collection-only accounts that route funds to a parent ledger account.
    """
    __tablename__ = "virtual_accounts"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    parent_account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False) # The account where funds are settled
    
    account_number = Column(String(10), unique=True, index=True, nullable=False) # NUBAN
    account_name = Column(String(150), nullable=False) # e.g. "WeezyBank / [Business Name]"
    
    bank_name = Column(String(100), default="Weezy Bank")
    bank_code = Column(String(10), default="999")
    
    status = Column(SQLAlchemyEnum(VirtualAccountStatusEnum), default=VirtualAccountStatusEnum.ACTIVE)
    
    # Meta
    label = Column(String(100), nullable=True) # e.g. "Lagos Branch Collection"
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    customer = relationship("Customer")
    parent_account = relationship("Account")

class VirtualAccountIncomingPayment(Base):
    """Logs incoming payments specifically to virtual accounts."""
    __tablename__ = "va_incoming_payments"

    id = Column(Integer, primary_key=True, index=True)
    virtual_account_id = Column(Integer, ForeignKey("virtual_accounts.id"), nullable=False)
    transaction_id = Column(String, ForeignKey("financial_transactions.id"), nullable=False)
    
    sender_name = Column(String(150), nullable=True)
    sender_account = Column(String(20), nullable=True)
    sender_bank = Column(String(100), nullable=True)
    
    amount = Column(Numeric(precision=18, scale=2), nullable=False)
    fee_deducted = Column(Numeric(precision=18, scale=2), default=0.00)
    
    status = Column(String(20), default="SETTLED") # SETTLED, PENDING, REVERSED
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    virtual_account = relationship("VirtualAccount")
