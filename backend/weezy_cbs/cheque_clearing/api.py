from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Body, BackgroundTasks
from sqlalchemy.orm import Session

from weezy_cbs.database import get_db
from . import schemas, services, models
from .services import cheque_service
from weezy_cbs.core_infrastructure_config_engine.api import get_current_active_user, get_current_active_superuser

router = APIRouter(
    tags=["Cheque Clearing (NACS)"],
)

@router.post("/deposit", response_model=schemas.ChequeDepositResponse)
async def deposit_a_cheque(
    deposit_in: schemas.ChequeDepositCreate,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Initiates a cheque deposit into a customer account."""
    return cheque_service.deposit_cheque(db, deposit_in)

@router.get("/history", response_model=List[schemas.ChequeDepositResponse])
async def list_my_cheque_deposits(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Returns a history of cheques deposited by the user."""
    from weezy_cbs.customer_identity_management.models import Customer
    customer = db.query(Customer).first() # Demo fallback
    return db.query(models.ChequeDeposit).filter(models.ChequeDeposit.customer_id == customer.id).all()

@router.post("/clearing/start-session")
async def start_nacs_session(
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """Admin tool to move all pending cheques into the NACS clearing session."""
    count = await cheque_service.process_clearing_session(db)
    return {"message": f"Clearing session started for {count} cheques."}

@router.post("/clearing/{cheque_id}/finalize")
async def finalize_cheque_clearing(
    cheque_id: int,
    is_bounced: bool = Body(False, embed=True),
    reason: Optional[str] = Body(None, embed=True),
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """Admin tool to mark a cheque as CLEARED or BOUNCED after NACS session."""
    return await cheque_service.finalize_clearing(db, cheque_id, is_bounced, reason)

@router.post("/request-book")
async def request_cheque_book(
    request: schemas.ChequeBookRequestSchema,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Requests a new cheque book for a current account."""
    return cheque_service.request_cheque_book(db, request.account_number, request.leaf_count, request.delivery_address)
