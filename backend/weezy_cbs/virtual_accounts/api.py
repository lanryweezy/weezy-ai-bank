from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from sqlalchemy import func
import decimal

from weezy_cbs.database import get_db
from . import schemas, services, models
from .services import virtual_account_service
from weezy_cbs.core_infrastructure_config_engine.api import get_current_active_user

router = APIRouter(
    tags=["Virtual Accounts & Collections"],
)

@router.post("/create", response_model=schemas.VirtualAccountResponse)
async def create_virtual_account(
    va_in: schemas.VirtualAccountCreate,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Generates a new dedicated Virtual NUBAN for business payments."""
    try:
        return virtual_account_service.create_virtual_account(db, va_in)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me", response_model=List[schemas.VirtualAccountResponse])
async def list_my_virtual_accounts(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Lists all virtual accounts for the current user/business."""
    from weezy_cbs.customer_identity_management.models import Customer
    customer = db.query(Customer).first() # Demo fallback
    return virtual_account_service.get_customer_virtual_accounts(db, customer.id)

@router.get("/dashboard")
async def get_va_dashboard(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Returns collection volume and recent payments to virtual accounts."""
    from weezy_cbs.customer_identity_management.models import Customer
    customer = db.query(Customer).first() # Demo fallback
    
    vas = virtual_account_service.get_customer_virtual_accounts(db, customer.id)
    va_ids = [v.id for v in vas]
    
    recent_payments = db.query(models.VirtualAccountIncomingPayment).filter(
        models.VirtualAccountIncomingPayment.virtual_account_id.in_(va_ids) if va_ids else False
    ).order_by(models.VirtualAccountIncomingPayment.created_at.desc()).limit(10).all()
    
    total_vol = db.query(func.sum(models.VirtualAccountIncomingPayment.amount)).filter(
        models.VirtualAccountIncomingPayment.virtual_account_id.in_(va_ids) if va_ids else False
    ).scalar() or 0
    
    return {
        "total_collections": float(total_vol),
        "active_accounts_count": len(vas),
        "recent_payments": recent_payments
    }

@router.post("/simulate-payment")
async def simulate_va_payment(
    account_number: str = Body(..., embed=True),
    amount: decimal.Decimal = Body(..., embed=True),
    sender_name: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    """Utility endpoint to simulate an incoming NIP transfer to a virtual account."""
    return await virtual_account_service.simulate_incoming_payment(db, account_number, amount, sender_name)
