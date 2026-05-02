from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Enum as SQLAlchemyEnum, Text, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from weezy_cbs.database import Base

class QRTypeEnum(enum.Enum):
    STATIC = "STATIC" # Fixed account, flexible amount
    DYNAMIC = "DYNAMIC" # Fixed account, fixed amount

class QRCode(Base):
    """
    Metadata for generated QR codes.
    Follows simulated NIBSS NQR standards.
    """
    __tablename__ = "qr_codes"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    account_number = Column(String(10), nullable=False) # The NUBAN to be credited
    
    qr_type = Column(SQLAlchemyEnum(QRTypeEnum), default=QRTypeEnum.STATIC)
    qr_payload = Column(Text, unique=True, index=True, nullable=False) # The actual string in the QR
    
    amount = Column(Numeric(precision=18, scale=2), nullable=True) # Only for dynamic
    narration = Column(String(150), nullable=True)
    
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    customer = relationship("Customer")

class QRPaymentLog(Base):
    __tablename__ = "qr_payment_logs"

    id = Column(Integer, primary_key=True, index=True)
    qr_code_id = Column(Integer, ForeignKey("qr_codes.id"), nullable=False)
    transaction_id = Column(String, ForeignKey("financial_transactions.id"), nullable=False)
    
    sender_account = Column(String(20), nullable=True)
    amount = Column(Numeric(precision=18, scale=2), nullable=False)
    
    status = Column(String(20), default="SUCCESSFUL")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    qr_code = relationship("QRCode")
