from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Enum as SQLAlchemyEnum, Text, Boolean, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from weezy_cbs.database import Base

class TillStatusEnum(enum.Enum):
    CLOSED = "CLOSED"
    OPEN = "OPEN"
    LOCKED = "LOCKED" # Due to limit breach

class Branch(Base):
    __tablename__ = "branches"

    id = Column(Integer, primary_key=True, index=True)
    branch_code = Column(String(10), unique=True, index=True, nullable=False) # e.g. "001"
    name = Column(String(100), nullable=False) # e.g. "Ikeja Main Branch"
    
    vault_gl_account = Column(String(20), nullable=False) # e.g. "GL-CASH-VAULT-001"
    address = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class TellerTill(Base):
    """A cash drawer assigned to a specific bank staff."""
    __tablename__ = "teller_tills"

    id = Column(Integer, primary_key=True, index=True)
    teller_user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=False)
    
    till_gl_account = Column(String(20), unique=True, nullable=False) # e.g. "GL-TILL-105"
    
    status = Column(SQLAlchemyEnum(TillStatusEnum), default=TillStatusEnum.CLOSED)
    
    # Risk limits for Nigerian operations
    max_holding_limit = Column(Numeric(precision=18, scale=2), default=5000000.00) # ₦5M limit before vault transfer needed
    current_cash_balance = Column(Numeric(precision=18, scale=2), default=0.00)
    
    opened_at = Column(DateTime(timezone=True), nullable=True)
    last_closed_at = Column(DateTime(timezone=True), nullable=True)

class VaultTransaction(Base):
    """Movement of cash between the Branch Vault and a Teller Till."""
    __tablename__ = "vault_transactions"

    id = Column(Integer, primary_key=True, index=True)
    till_id = Column(Integer, ForeignKey("teller_tills.id"), nullable=False)
    
    transaction_type = Column(String(20), nullable=False) # "VAULT_TO_TILL" or "TILL_TO_VAULT"
    amount = Column(Numeric(precision=18, scale=2), nullable=False)
    
    initiator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    approver_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Requires Branch Manager approval
    
    status = Column(String(20), default="PENDING") # PENDING, APPROVED, REJECTED
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class TellerPosting(Base):
    """Over-the-counter deposit or withdrawal."""
    __tablename__ = "teller_postings"

    id = Column(Integer, primary_key=True, index=True)
    reference = Column(String(50), unique=True, index=True, nullable=False)
    
    till_id = Column(Integer, ForeignKey("teller_tills.id"), nullable=False)
    customer_account_number = Column(String(10), nullable=False)
    
    posting_type = Column(String(20), nullable=False) # "CASH_DEPOSIT" or "CASH_WITHDRAWAL"
    amount = Column(Numeric(precision=18, scale=2), nullable=False)
    
    depositor_name = Column(String(100), nullable=True) # If third-party deposit
    depositor_phone = Column(String(15), nullable=True)
    
    narration = Column(String(200), nullable=False)
    status = Column(String(20), default="COMPLETED")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
