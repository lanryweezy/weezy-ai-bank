from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Enum as SQLAlchemyEnum, Text, JSON, Boolean, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from weezy_cbs.database import Base

class EODStatusEnum(enum.Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    ROLLED_BACK = "REVERSED"

class SystemDate(Base):
    """Tracks the logical banking date (Business Date)."""
    __tablename__ = "system_dates"

    id = Column(Integer, primary_key=True, index=True)
    current_business_date = Column(Date, unique=True, nullable=False)
    
    is_open = Column(Boolean, default=True) # True if the banking day is still taking transactions
    last_eod_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class EODJobLog(Base):
    """Logs the execution of the End of Day batch."""
    __tablename__ = "eod_job_logs"

    id = Column(Integer, primary_key=True, index=True)
    business_date = Column(Date, nullable=False, index=True)
    
    status = Column(SQLAlchemyEnum(EODStatusEnum), default=EODStatusEnum.PENDING)
    
    # Steps completion tracking
    interest_accrued = Column(Boolean, default=False)
    fees_collected = Column(Boolean, default=False)
    loan_maturities_processed = Column(Boolean, default=False)
    trial_balance_generated = Column(Boolean, default=False)
    
    # Results
    total_debits = Column(Numeric(precision=20, scale=2), default=0.00)
    total_credits = Column(Numeric(precision=20, scale=2), default=0.00)
    imbalance_amount = Column(Numeric(precision=20, scale=2), default=0.00) # Should be 0.00
    
    ai_audit_summary = Column(Text, nullable=True)
    
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

class DailyTrialBalance(Base):
    """Snapshots of General Ledger account balances at EOD."""
    __tablename__ = "daily_trial_balances"

    id = Column(Integer, primary_key=True, index=True)
    business_date = Column(Date, nullable=False, index=True)
    
    gl_account_number = Column(String(20), nullable=False)
    gl_account_name = Column(String(150), nullable=False)
    
    opening_balance = Column(Numeric(precision=18, scale=2))
    total_debits = Column(Numeric(precision=18, scale=2))
    total_credits = Column(Numeric(precision=18, scale=2))
    closing_balance = Column(Numeric(precision=18, scale=2))
    
    currency = Column(String(3), default="NGN")
