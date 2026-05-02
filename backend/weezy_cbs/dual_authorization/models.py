from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLAlchemyEnum, Text, JSON, Boolean, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from weezy_cbs.database import Base

class ApprovalStatusEnum(enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"

class ApprovalRequest(Base):
    """
    Maker-Checker Approval Requests (Dual Control).
    Standard requirement for Nigerian corporate banking.
    """
    __tablename__ = "approval_requests"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(String(50), unique=True, index=True, nullable=False) # For external ref
    
    action_type = Column(String(100), nullable=False) # e.g. "LARGE_TRANSFER", "SYSTEM_SETTING_CHANGE"
    payload_json = Column(JSON, nullable=False) # The serialized action to be executed
    
    status = Column(SQLAlchemyEnum(ApprovalStatusEnum), default=ApprovalStatusEnum.PENDING)
    
    # Maker details
    maker_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    maker_name = Column(String(100), nullable=True)
    
    # Checker details
    checker_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    checker_name = Column(String(100), nullable=True)
    checker_comments = Column(Text, nullable=True)
    
    expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True), nullable=True)

    maker = relationship("User", foreign_keys=[maker_id])
    checker = relationship("User", foreign_keys=[checker_id])

class ApprovalPolicy(Base):
    """
    Defines threshold and rules for dual control.
    """
    __tablename__ = "approval_policies"

    id = Column(Integer, primary_key=True, index=True)
    action_code = Column(String(50), unique=True, nullable=False) # e.g. TRANSFER
    
    min_amount = Column(Numeric(precision=18, scale=2), default=0.00)
    requires_dual_control = Column(Boolean, default=True)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
