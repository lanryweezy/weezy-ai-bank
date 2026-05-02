from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Enum as SQLAlchemyEnum, Text, Boolean, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from weezy_cbs.database import Base

class CommissionStatusEnum(enum.Enum):
    PENDING = "PENDING"
    SETTLED = "SETTLED"
    CANCELLED = "CANCELLED"

class RevenueParticipantEnum(enum.Enum):
    BANK = "BANK"
    AGENT = "AGENT"
    SUPER_AGENT = "SUPER_AGENT"
    PLATFORM_FEE = "PLATFORM_FEE"

class CommissionConfig(Base):
    """
    Rules for splitting fees collected on transactions.
    Example: CASH_WITHDRAWAL fee of N100: 
    - Bank: 40%
    - Agent: 50%
    - Super Agent: 10%
    """
    __tablename__ = "commission_configs"

    id = Column(Integer, primary_key=True, index=True)
    transaction_type = Column(String(50), unique=True, index=True, nullable=False) # e.g. "CASH_WITHDRAWAL", "BILL_PAYMENT"
    
    bank_share_pct = Column(Numeric(precision=5, scale=2), default=40.00)
    agent_share_pct = Column(Numeric(precision=5, scale=2), default=50.00)
    super_agent_share_pct = Column(Numeric(precision=5, scale=2), default=10.00)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class CommissionLog(Base):
    """
    Detailed breakdown of shared revenue for a specific transaction.
    """
    __tablename__ = "commission_logs"

    id = Column(Integer, primary_key=True, index=True)
    financial_transaction_id = Column(String(50), ForeignKey("financial_transactions.id"), nullable=False)
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=True) # Linked to the agent who performed txn
    
    total_fee_collected = Column(Numeric(precision=18, scale=2), nullable=False)
    
    bank_amount = Column(Numeric(precision=18, scale=2), default=0.00)
    agent_amount = Column(Numeric(precision=18, scale=2), default=0.00)
    super_agent_amount = Column(Numeric(precision=18, scale=2), default=0.00)
    
    status = Column(SQLAlchemyEnum(CommissionStatusEnum), default=CommissionStatusEnum.PENDING)
    settled_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AgentWallet(Base):
    """
    Dedicated revenue wallet for an agent.
    Commissions are settled here daily.
    """
    __tablename__ = "agent_wallets"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"), unique=True, nullable=False)
    
    wallet_account_number = Column(String(10), unique=True, nullable=False) # Internal NUBAN for payout
    current_balance = Column(Numeric(precision=18, scale=2), default=0.00)
    
    total_lifetime_earned = Column(Numeric(precision=18, scale=2), default=0.00)
    
    last_payout_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
