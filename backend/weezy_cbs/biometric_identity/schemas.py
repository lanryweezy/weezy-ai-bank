from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from .models import IDDocumentTypeEnum, BiometricVerificationStatusEnum

class BiometricEnrollmentResponse(BaseModel):
    id: int
    customer_id: int
    verification_status: BiometricVerificationStatusEnum
    face_match_confidence: float
    document_type: Optional[IDDocumentTypeEnum]
    verified_at: Optional[datetime]
    created_at: datetime

    class Config:
        orm_mode = True

class FaceMatchRequest(BaseModel):
    customer_id: int
    selfie_b64: str # Base64 encoded selfie
    document_b64: str # Base64 encoded ID document
    document_type: IDDocumentTypeEnum

class IDVerificationResult(BaseModel):
    status: str
    confidence: float
    extracted_data: Dict[str, Any]
    message: str
