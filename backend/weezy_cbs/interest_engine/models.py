from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Enum as SQLAlchemyEnum, Text, Boolean, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from weezy_cbs.database import Base

class InterestTypeEnum(enum.Enum):
    SAVINGS = "SAVINGS"
    FIXED_DEPOSIT = "FIXED_DEPOSIT"
    LOAN_PENALTY = "LOAN_PENALTY"

class InterestAccrual(Base):
    """
    Logs daily interest calculations.
    Daily Accrual -> Monthly Capitalization (Payout).
    """
    __tablename__ = "interest_accruals"

    id = Column(Integer, primary_key=True, index=True)
    account_number = Column(String(20), index=True, nullable=False)
    
    amount_accrued = Column(Numeric(precision=18, scale=4), nullable=False)
    principal_balance_at_time = Column(Numeric(precision=18, scale=2), nullable=False)
    
    interest_rate_applied = Column(Numeric(precision=5, scale=4), nullable=False)
    accrual_date = Column(Date, server_default=func.current_date())
    
    interest_type = Column(SQLAlchemyEnum(InterestTypeEnum))
    status = Column(String(20), default="ACCRUED") # ACCRUED, CAPITALIZED (PAID), REVERSED
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class InterestPayout(Base):
    """Logs the final payout of interest to customer accounts."""
    __tablename__ = "interest_payouts"

    id = Column(Integer, primary_key=True, index=True)
    account_number = Column(String(20), index=True, nullable=False)
    transaction_id = Column(String, ForeignKey("financial_transactions.id"), nullable=False)
    
    total_amount_paid = Column(Numeric(precision=18, scale=2), nullable=False)
    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
