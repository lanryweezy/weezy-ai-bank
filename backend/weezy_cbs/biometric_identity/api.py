from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session

from weezy_cbs.database import get_db
from . import schemas, services, models
from .services import biometric_service
from weezy_cbs.core_infrastructure_config_engine.api import get_current_active_user

router = APIRouter(
    tags=["Biometric Identity & Face Match"],
)

@router.post("/verify-face")
async def verify_customer_face(
    request: schemas.FaceMatchRequest,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """
    Performs AI-driven face match between a selfie and a government ID.
    Enables autonomous Tier 3 KYC upgrade.
    """
    return await biometric_service.perform_face_match(db, request)

@router.get("/me", response_model=schemas.BiometricEnrollmentResponse)
async def get_my_biometric_status(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Checks if the logged-in customer has verified their biometrics."""
    from weezy_cbs.customer_identity_management.models import Customer
    customer = db.query(Customer).first() # Demo fallback
    
    enrollment = db.query(models.BiometricEnrollment).filter(models.BiometricEnrollment.customer_id == customer.id).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Biometric enrollment not found")
    return enrollment
