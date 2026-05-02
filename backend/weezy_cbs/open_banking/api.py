from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session

from weezy_cbs.database import get_db
from . import schemas, services, models
from .services import open_banking_service
from weezy_cbs.core_infrastructure_config_engine.api import get_current_active_user

router = APIRouter(
    tags=["Nigerian Open Banking Standard"],
)

@router.post("/consents", response_model=Dict[str, Any])
async def request_app_consent(
    app_id: int = Body(..., embed=True),
    permissions: List[str] = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Initiates a consent request from a 3rd party app."""
    consent = open_banking_service.create_consent_request(db, app_id, current_user.id, permissions)
    return {
        "consent_id": consent.consent_id,
        "status": consent.status.value,
        "authorization_url": f"http://localhost:8080/open-banking/authorize/{consent.consent_id}"
    }

@router.post("/consents/{consent_id}/authorize")
async def authorize_app_consent(
    consent_id: str,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """User endpoint to grant permission to an app."""
    return open_banking_service.authorize_consent(db, consent_id)

@router.get("/accounts")
async def open_banking_list_accounts(
    consent_id: str,
    db: Session = Depends(get_db)
):
    """External API: Fetches account details using an authorized consent ID."""
    try:
        return open_banking_service.get_authorized_accounts(db, consent_id)
    except Exception as e:
        raise HTTPException(status_code=403, detail=str(e))

@router.get("/apps", response_model=List[Dict[str, Any]])
async def list_registered_apps(
    db: Session = Depends(get_db)
):
    """Returns a list of fintech apps registered on the Weezy Open Banking platform."""
    return db.query(models.ThirdPartyApp).all()
