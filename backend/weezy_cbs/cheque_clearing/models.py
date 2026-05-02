from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Enum as SQLAlchemyEnum, Text, Boolean, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from weezy_cbs.database import Base

class ChequeStatusEnum(enum.Enum):
    PENDING = "PENDING"
    IN_CLEARING = "IN_CLEARING"
    CLEARED = "CLEARED"
    BOUNCED = "BOUNCED"
    CANCELLED = "CANCELLED"

class ChequeDeposit(Base):
    """
    Logs cheque deposits into Weezy Bank accounts.
    Follows NIBSS Automated Clearing System (NACS) flow.
    """
    __tablename__ = "cheque_deposits"

    id = Column(Integer, primary_key=True, index=True)
    deposit_reference = Column(String(50), unique=True, index=True, nullable=False)
    
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    target_account_number = Column(String(10), nullable=False) # NUBAN to credit
    
    cheque_number = Column(String(20), nullable=False)
    issuing_bank_code = Column(String(10), nullable=False) # The bank that issued the cheque
    issuing_bank_name = Column(String(150), nullable=True)
    
    amount = Column(Numeric(precision=18, scale=2), nullable=False)
    status = Column(SQLAlchemyEnum(ChequeStatusEnum), default=ChequeStatusEnum.PENDING)
    
    # NACS Metadata
    clearing_cycle = Column(Integer, default=1) # Cycle 1, 2, or 3
    micr_code = Column(String(50), nullable=True) # Magnetic Ink Character Recognition
    
    bounced_reason = Column(String(100), nullable=True) # e.g. "Drawers Attention Required"
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    cleared_at = Column(DateTime(timezone=True), nullable=True)

    customer = relationship("Customer")

class ChequeBookRequest(Base):
    __tablename__ = "cheque_book_requests"

    id = Column(Integer, primary_key=True, index=True)
    account_number = Column(String(10), nullable=False)
    leaf_count = Column(Integer, default=25) # 25, 50, 100
    
    delivery_address = Column(Text, nullable=True)
    status = Column(String(20), default="REQUESTED") # REQUESTED, PRINTING, DISPATCHED, DELIVERED
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
