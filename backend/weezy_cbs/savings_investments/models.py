from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Enum as SQLAlchemyEnum, Text, JSON, Boolean, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from weezy_cbs.database import Base

class SavingsTypeEnum(enum.Enum):
    GOAL_SAVINGS = "GOAL_SAVINGS" # e.g. "Buy a Car"
    FIXED_DEPOSIT = "FIXED_DEPOSIT" # Locked for a period
    TREASURY_BILL = "TREASURY_BILL"
    MUTUAL_FUND = "MUTUAL_FUND"

class SavingsStatusEnum(enum.Enum):
    ACTIVE = "ACTIVE"
    LOCKED = "LOCKED"
    MATURED = "MATURED"
    LIQUIDATED = "LURIDATED"
    CANCELLED = "CANCELLED"

class SavingsGoal(Base):
    __tablename__ = "savings_goals"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    
    name = Column(String(100), nullable=False) # e.g. "Rent 2026"
    target_amount = Column(Numeric(precision=18, scale=2), nullable=False)
    current_balance = Column(Numeric(precision=18, scale=2), default=0.00)
    
    start_date = Column(Date, server_default=func.current_date())
    target_date = Column(Date, nullable=False)
    
    savings_type = Column(SQLAlchemyEnum(SavingsTypeEnum), default=SavingsTypeEnum.GOAL_SAVINGS)
    status = Column(SQLAlchemyEnum(SavingsStatusEnum), default=SavingsStatusEnum.ACTIVE)
    
    interest_rate = Column(Numeric(precision=5, scale=4), default=0.08) # e.g. 8% per annum
    
    # Automated Savings
    is_automated = Column(Boolean, default=False)
    auto_save_amount = Column(Numeric(precision=18, scale=2), nullable=True)
    auto_save_frequency = Column(String(20), nullable=True) # DAILY, WEEKLY, MONTHLY
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    customer = relationship("Customer")

class InvestmentProduct(Base):
    __tablename__ = "investment_products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False) # e.g. Weezy High-Yield Fixed Deposit
    product_type = Column(SQLAlchemyEnum(SavingsTypeEnum))
    
    minimum_amount = Column(Numeric(precision=18, scale=2), default=10000.00)
    interest_rate_pa = Column(Numeric(precision=5, scale=4), nullable=False) # Per Annum
    tenure_days = Column(Integer, nullable=False) # e.g. 90, 180, 365
    
    is_active = Column(Boolean, default=True)
    description = Column(Text, nullable=True)
