from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session

from weezy_cbs.database import get_db
from . import schemas, services, models
from .services import dual_auth_service
from weezy_cbs.core_infrastructure_config_engine.api import get_current_active_superuser
from weezy_cbs.core_infrastructure_config_engine.models import User as CoreUser

router = APIRouter(
    tags=["Dual Authorization (Maker-Checker)"],
)

@router.get("/pending", response_model=List[schemas.ApprovalRequestResponse])
async def list_pending_requests(
    db: Session = Depends(get_db),
    current_admin: CoreUser = Depends(get_current_active_superuser)
):
    """Returns all pending sensitive operations awaiting Checker approval."""
    return dual_auth_service.get_pending_requests(db)

@router.post("/{request_id}/approve", response_model=schemas.ApprovalRequestResponse)
async def approve_operation(
    request_id: str,
    db: Session = Depends(get_db),
    current_admin: CoreUser = Depends(get_current_active_superuser)
):
    """Authorizes and executes a pending sensitive operation."""
    try:
        return await dual_auth_service.authorize_request(db, request_id, current_admin)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{request_id}/reject", response_model=schemas.ApprovalRequestResponse)
async def reject_operation(
    request_id: str,
    decision: schemas.ApprovalDecisionRequest,
    db: Session = Depends(get_db),
    current_admin: CoreUser = Depends(get_current_active_superuser)
):
    """Rejects a pending sensitive operation."""
    try:
        return await dual_auth_service.reject_request(db, request_id, current_admin, decision.reason)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
