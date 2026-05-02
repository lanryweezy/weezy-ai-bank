from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Enum as SQLAlchemyEnum, Text, Boolean, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from weezy_cbs.database import Base

class SIFrequencyEnum(enum.Enum):
    DAILY = "DAILY"
    WEEKLY = "WEEKLY"
    BI_WEEKLY = "BI_WEEKLY"
    MONTHLY = "MONTHLY"
    QUARTERLY = "QUARTERLY"
    ANNUALLY = "ANNUALLY"

class SIStatusEnum(enum.Enum):
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class StandingInstruction(Base):
    """
    Automated recurring transfer instructions from a customer's account.
    """
    __tablename__ = "standing_instructions"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    
    # Source & Destination
    source_account_number = Column(String(10), nullable=False)
    destination_account_number = Column(String(10), nullable=False)
    destination_bank_code = Column(String(10), default="999") # 999 for internal, others for NIP
    destination_account_name = Column(String(150), nullable=True)
    
    amount = Column(Numeric(precision=18, scale=2), nullable=False)
    currency = Column(String(3), default="NGN")
    narration = Column(String(200), nullable=False)
    
    # Scheduling
    frequency = Column(SQLAlchemyEnum(SIFrequencyEnum), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True) # None for indefinite
    
    next_run_date = Column(Date, nullable=False, index=True)
    last_run_date = Column(Date, nullable=True)
    
    status = Column(SQLAlchemyEnum(SIStatusEnum), default=SIStatusEnum.ACTIVE, index=True)
    
    # Retry logic if balance was insufficient
    retry_on_failure = Column(Boolean, default=True)
    consecutive_failures = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    customer = relationship("Customer")

class SIExecutionLog(Base):
    """
    History of every time a Standing Instruction was triggered.
    """
    __tablename__ = "si_execution_logs"

    id = Column(Integer, primary_key=True, index=True)
    si_id = Column(Integer, ForeignKey("standing_instructions.id"), nullable=False)
    
    execution_date = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String(20)) # SUCCESS, FAILED
    
    transaction_id = Column(String(50), nullable=True) # Reference to financial_transactions
    error_details = Column(Text, nullable=True)
    
    si = relationship("StandingInstruction")
