from sqlalchemy import Column, Integer, String, DateTime, Boolean, Numeric, ForeignKey, Enum as SQLAlchemyEnum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from weezy_cbs.database import Base

class AgentTierEnum(enum.Enum):
    AGGREGATOR = "AGGREGATOR"
    SUPER_AGENT = "SUPER_AGENT"
    RETAIL_AGENT = "RETAIL_AGENT"

class AgentStatusEnum(enum.Enum):
    PENDING = "PENDING"
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"
    INACTIVE = "INACTIVE"

class AgentProfile(Base):
    __tablename__ = "agent_profiles"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), unique=True, nullable=False)
    agent_code = Column(String(20), unique=True, nullable=False, index=True) # e.g. WZY-AG-001
    business_name = Column(String(150), nullable=False)
    
    tier = Column(SQLAlchemyEnum(AgentTierEnum), default=AgentTierEnum.RETAIL_AGENT)
    status = Column(SQLAlchemyEnum(AgentStatusEnum), default=AgentStatusEnum.PENDING)
    
    # Financials
    float_account_number = Column(String(10), nullable=False) # NUBAN for operational float
    commission_account_number = Column(String(10), nullable=False) # NUBAN for earnings
    
    # Location (Nigeria SANEF Standards)
    state = Column(String(50), nullable=False)
    lga = Column(String(50), nullable=False)
    address = Column(Text, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    customer = relationship("Customer")
    terminals = relationship("AgentTerminal", back_populates="agent")

class AgentTerminal(Base):
    __tablename__ = "agent_terminals"
    
    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agent_profiles.id"), nullable=False)
    terminal_id = Column(String(50), unique=True, nullable=False, index=True) # POS Terminal ID
    serial_number = Column(String(100), unique=True, nullable=False)
    
    is_active = Column(Boolean, default=True)
    last_heartbeat = Column(DateTime(timezone=True), nullable=True)
    
    agent = relationship("AgentProfile", back_populates="terminals")

class AgentCommissionLog(Base):
    __tablename__ = "agent_commission_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agent_profiles.id"), nullable=False)
    transaction_id = Column(String, ForeignKey("financial_transactions.id"), nullable=False)
    
    amount = Column(Numeric(precision=18, scale=2), nullable=False)
    commission_type = Column(String(50)) # e.g. "CASH_IN", "CASH_OUT"
    status = Column(String(20), default="EARNED") # EARNED, SETTLED
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
