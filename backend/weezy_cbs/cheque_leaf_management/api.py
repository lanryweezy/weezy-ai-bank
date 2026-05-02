from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session

from weezy_cbs.database import get_db
from . import schemas, services, models
from .services import cheque_leaf_service
from weezy_cbs.core_infrastructure_config_engine.api import get_current_active_user, get_current_active_superuser

router = APIRouter(
    tags=["Cheque Leaf & Stop-Payment Management"],
)

@router.post("/issue-book", response_model=schemas.ChequeBookResponse)
async def issue_cheque_book(
    req: schemas.ChequeBookIssueRequest,
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """Admin tool to issue a new cheque book to a customer."""
    return cheque_leaf_service.issue_cheque_book(db, req)

@router.get("/my-books", response_model=List[schemas.ChequeBookResponse])
async def list_my_cheque_books(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Returns all cheque books issued to the logged-in user."""
    return db.query(models.ChequeBook).filter(models.ChequeBook.customer_id == current_user.id).all()

@router.post("/stop-payment", response_model=schemas.StopPaymentResponse)
async def request_stop_payment(
    req: schemas.StopPaymentRequest,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Customer instruction to stop a specific cheque leaf."""
    return cheque_leaf_service.stop_payment(db, current_user.id, req)

@router.get("/leaves/{cheque_number}")
async def get_leaf_status(
    cheque_number: str,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Returns the current status of a specific cheque leaf."""
    leaf = db.query(models.ChequeLeaf).filter(models.ChequeLeaf.leaf_number == cheque_number).first()
    if not leaf: raise HTTPException(status_code=404, detail="Cheque leaf not found")
    return leaf
