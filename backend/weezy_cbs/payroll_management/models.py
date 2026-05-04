from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Enum as SQLAlchemyEnum, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from weezy_cbs.database import Base

class PayrollStatusEnum(enum.Enum):
    PENDING = "PENDING"
    AI_SCANNING = "AI_SCANNING"
    AWAITING_APPROVAL = "AWAITING_APPROVAL"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"

class PayrollBatch(Base):
    __tablename__ = "payroll_batches"

    id = Column(Integer, primary_key=True, index=True)
    batch_reference = Column(String(50), unique=True, index=True, nullable=False)
    corporate_customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    source_account_number = Column(String(10), nullable=True) # The account funding this payroll
    
    total_amount = Column(Numeric(precision=18, scale=2), nullable=False)
    item_count = Column(Integer, nullable=False)
    currency = Column(String(3), default="NGN")
    
    status = Column(SQLAlchemyEnum(PayrollStatusEnum), default=PayrollStatusEnum.PENDING)
    
    # AI Analysis Results
    ai_anomaly_report = Column(JSON, nullable=True)
    ai_risk_score = Column(Integer, nullable=True) # 0-100
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True), nullable=True)

    items = relationship("PayrollItem", back_populates="batch", cascade="all, delete-orphan")
    corporate_customer = relationship("Customer")

class PayrollItem(Base):
    __tablename__ = "payroll_items"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("payroll_batches.id"), nullable=False)
    
    recipient_name = Column(String(150), nullable=False)
    recipient_account = Column(String(10), nullable=False)
    recipient_bank_code = Column(String(10), nullable=False) # NIP Bank Code
    
    amount = Column(Numeric(precision=18, scale=2), nullable=False)
    employee_id = Column(String(50), nullable=True)
    
    status = Column(String(20), default="PENDING") # PENDING, SUCCESS, FAILED
    transaction_id = Column(String, ForeignKey("financial_transactions.id"), nullable=True)
    error_message = Column(Text, nullable=True)

    batch = relationship("PayrollBatch", back_populates="items")
