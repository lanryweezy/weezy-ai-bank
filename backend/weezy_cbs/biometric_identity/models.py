from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLAlchemyEnum, Text, JSON, Boolean, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from weezy_cbs.database import Base

class IDDocumentTypeEnum(enum.Enum):
    NIN_SLIP = "NIN_SLIP"
    VOTERS_CARD = "VOTERS_CARD"
    DRIVERS_LICENSE = "DRIVERS_LICENSE"
    INTERNATIONAL_PASSPORT = "INTERNATIONAL_PASSPORT"

class BiometricVerificationStatusEnum(enum.Enum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    MATCH_FAILED = "MATCH_FAILED"
    DOCUMENT_REJECTED = "DOCUMENT_REJECTED"

class BiometricEnrollment(Base):
    __tablename__ = "biometric_enrollments"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), unique=True, nullable=False)
    
    # Storage paths for demo (In production, these are secure S3/Blob links)
    selfie_image_path = Column(String(255), nullable=True)
    identity_document_path = Column(String(255), nullable=True)
    
    document_type = Column(SQLAlchemyEnum(IDDocumentTypeEnum), nullable=True)
    document_number = Column(String(50), nullable=True)
    
    # Results
    face_match_confidence = Column(Float, default=0.0)
    verification_status = Column(SQLAlchemyEnum(BiometricVerificationStatusEnum), default=BiometricVerificationStatusEnum.PENDING)
    
    ai_analysis_json = Column(JSON, nullable=True) # Full details from Gemini
    
    verified_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    customer = relationship("Customer")

class BiometricAuditLog(Base):
    __tablename__ = "biometric_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    enrollment_id = Column(Integer, ForeignKey("biometric_enrollments.id"), nullable=False)
    
    action = Column(String(50), nullable=False) # e.g. FACE_MATCH_ATTEMPT, ID_EXTRACTION
    result = Column(String(50), nullable=False) # SUCCESS, FAIL
    details = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
