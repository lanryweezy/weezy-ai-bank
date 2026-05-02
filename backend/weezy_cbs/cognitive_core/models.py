from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLAlchemyEnum, Text, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from weezy_cbs.database import Base

class CognitiveIntentEnum(enum.Enum):
    TRANSFER = "TRANSFER"
    PAYROLL = "PAYROLL"
    FX_SWAP = "FX_SWAP"
    OPEN_ACCOUNT = "OPEN_ACCOUNT"
    LOAN_REQUEST = "LOAN_REQUEST"
    CUSTOMER_SUPPORT = "CUSTOMER_SUPPORT"
    COMPLIANCE_REVIEW = "COMPLIANCE_REVIEW"
    UNKNOWN = "UNKNOWN"

class CognitiveSession(Base):
    """
    Logs sessions where the user is interacting with the Cognitive Core.
    """
    __tablename__ = "cognitive_sessions"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True) # None if it's a staff member
    staff_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    session_id = Column(String(50), unique=True, index=True, nullable=False)
    
    context_data = Column(JSON, nullable=True) # Stored context (e.g. accounts, recent txns)
    
    status = Column(String(20), default="ACTIVE")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_interaction_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class CognitiveActionLog(Base):
    """
    Logs every action the Cognitive Core decided to take on behalf of the user.
    """
    __tablename__ = "cognitive_action_logs"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(50), ForeignKey("cognitive_sessions.session_id"), nullable=False)
    
    user_prompt = Column(Text, nullable=False)
    detected_intent = Column(SQLAlchemyEnum(CognitiveIntentEnum), default=CognitiveIntentEnum.UNKNOWN)
    
    # What the AI actually executed
    executed_tools = Column(JSON, nullable=True) # e.g. [{"tool": "perform_transfer", "args": {"amount": 5000}}]
    system_response = Column(Text, nullable=False)
    
    requires_human_approval = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    session = relationship("CognitiveSession")
