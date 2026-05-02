from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey, Enum as SQLAlchemyEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from weezy_cbs.database import Base

class ChannelEnum(enum.Enum):
    SMS = "SMS"
    EMAIL = "EMAIL"
    IN_APP = "IN_APP"
    WHATSAPP = "WHATSAPP"

class NotificationStatusEnum(enum.Enum):
    PENDING = "PENDING"
    SENT = "SENT"
    DELIVERED = "DELIVERED"
    FAILED = "FAILED"

class NotificationLog(Base):
    """
    Audit trail for every message sent to a customer.
    Critical for trust and compliance (e.g. proof of transaction alert).
    """
    __tablename__ = "notification_logs"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    
    channel = Column(SQLAlchemyEnum(ChannelEnum), nullable=False)
    recipient = Column(String(100), nullable=False) # Phone number or Email
    
    subject = Column(String(200), nullable=True)
    message_body = Column(Text, nullable=False)
    
    status = Column(SQLAlchemyEnum(NotificationStatusEnum), default=NotificationStatusEnum.PENDING)
    provider_reference = Column(String(100), nullable=True) # ID from Termii/SendGrid/Twilio
    
    # Metadata
    transaction_id = Column(String(50), nullable=True, index=True)
    error_details = Column(Text, nullable=True)
    
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    sent_at = Column(DateTime(timezone=True), nullable=True)

    customer = relationship("Customer")

class MessagingTemplate(Base):
    """Configurable templates for transaction alerts, OTPs, etc."""
    __tablename__ = "messaging_templates"

    id = Column(Integer, primary_key=True, index=True)
    template_name = Column(String(50), unique=True, nullable=False) # e.g. "TXN_CREDIT_ALERT"
    
    sms_content = Column(Text, nullable=True)
    email_subject = Column(String(200), nullable=True)
    email_content = Column(Text, nullable=True)
    
    is_active = Column(Boolean, default=True)
