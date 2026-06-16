from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Enum as SQLAlchemyEnum, Text, Boolean, Date, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from weezy_cbs.database import Base

class FDStatusEnum(enum.Enum):
    ACTIVE = "ACTIVE"
    MATURED = "MATURED"
    LIQUIDATED = "LIQUIDATED"
    CANCELLED = "CANCELLED"

class RolloverInstructionEnum(enum.Enum):
    NONE = "LIQUIDATE"
    PRINCIPAL = "ROLLOVER_PRINCIPAL"
    PRINCIPAL_AND_INTEREST = "ROLLOVER_PRINCIPAL_INTEREST"

class FixedDepositProduct(Base):
    """Configuration for FD products (e.g. '90-Day High Yield')."""
    __tablename__ = "fd_products"

    id = Column(Integer, primary_key=True, index=True)
    product_code = Column(String(20), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    
    interest_rate_pa = Column(Numeric(precision=5, scale=2), nullable=False) # e.g. 15.00
    tenor_days = Column(Integer, nullable=False) # e.g. 30, 90, 180, 365
    
    minimum_amount = Column(Numeric(precision=18, scale=2), default=100000.00)
    early_liquidation_penalty_pct = Column(Numeric(precision=5, scale=2), default=50.00) # % of accrued interest lost
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class FixedDepositAccount(Base):
    """An active investment held by a customer."""
    __tablename__ = "fd_accounts"

    id = Column(Integer, primary_key=True, index=True)
    fd_account_number = Column(String(10), unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("fd_products.id"), nullable=False)
    
    principal_amount = Column(Numeric(precision=18, scale=2), nullable=False)
    interest_rate_applied = Column(Numeric(precision=5, scale=2), nullable=False)
    
    booking_date = Column(Date, nullable=False)
    maturity_date = Column(Date, nullable=False)
    
    accrued_interest = Column(Numeric(precision=18, scale=2), default=0.00)
    status = Column(SQLAlchemyEnum(FDStatusEnum), default=FDStatusEnum.ACTIVE, index=True)
    
    rollover_instruction = Column(SQLAlchemyEnum(RolloverInstructionEnum), default=RolloverInstructionEnum.NONE)
    linked_savings_account = Column(String(10), nullable=False) # For liquidation/payout
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    liquidated_at = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        Index('idx_fd_maturity_status', 'maturity_date', 'status'),
    )

    customer = relationship("Customer")
    product = relationship("FixedDepositProduct")
