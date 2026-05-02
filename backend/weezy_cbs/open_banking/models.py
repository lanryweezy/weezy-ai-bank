from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLAlchemyEnum, Text, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from weezy_cbs.database import Base

class ConsentStatusEnum(enum.Enum):
    AWAITING_AUTHORIZATION = "AWAITING_AUTHORIZATION"
    AUTHORIZED = "AUTHORIZED"
    REVOKED = "REVERSED"
    EXPIRED = "EXPIRED"

class ThirdPartyApp(Base):
    """External fintech apps that connect to Weezy Bank via Open Banking."""
    __tablename__ = "open_banking_apps"

    id = Column(Integer, primary_key=True, index=True)
    app_name = Column(String(100), nullable=False)
    client_id = Column(String(50), unique=True, index=True, nullable=False)
    client_secret_hashed = Column(String(255), nullable=False)
    
    redirect_uris = Column(JSON, nullable=True)
    is_trusted = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class OpenBankingConsent(Base):
    """User-granted permissions for 3rd party apps."""
    __tablename__ = "open_banking_consents"

    id = Column(Integer, primary_key=True, index=True)
    consent_id = Column(String(50), unique=True, index=True, nullable=False)
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    app_id = Column(Integer, ForeignKey("open_banking_apps.id"), nullable=False)
    
    permissions = Column(JSON, nullable=False) # e.g. ["READ_ACCOUNTS", "READ_TRANSACTIONS"]
    status = Column(SQLAlchemyEnum(ConsentStatusEnum), default=ConsentStatusEnum.AWAITING_AUTHORIZATION)
    
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    app = relationship("ThirdPartyApp")
