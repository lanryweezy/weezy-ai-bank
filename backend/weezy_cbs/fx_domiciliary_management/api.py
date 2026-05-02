from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
import decimal

from weezy_cbs.database import get_db
from . import schemas, services, models
from .services import fx_dom_service
from weezy_cbs.core_infrastructure_config_engine.api import get_current_active_user

router = APIRouter(
    tags=["International FX & Domiciliary"],
)

@router.get("/rates", response_model=List[schemas.FXRateResponse])
async def list_fx_rates(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Returns active exchange rates (NGN to USD/EUR/GBP)."""
    return fx_dom_service.get_active_rates(db)

@router.post("/accounts/open", response_model=schemas.DomAccountResponse)
async def open_dom_account(
    currency: models.FXCurrencyEnum = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Opens a new USD, EUR, or GBP domiciliary account."""
    from weezy_cbs.customer_identity_management.models import Customer
    customer = db.query(Customer).first() # Demo
    return fx_dom_service.open_dom_account(db, customer.id, currency)

@router.post("/swap")
async def swap_currency(
    request: schemas.FXSwapRequest,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Instantly swaps funds between Naira and Domiciliary accounts."""
    from weezy_cbs.customer_identity_management.models import Customer
    customer = db.query(Customer).first() # Demo
    return await fx_dom_service.perform_currency_swap(db, customer.id, request)

@router.get("/accounts/me", response_model=List[schemas.DomAccountResponse])
async def list_my_dom_accounts(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Lists all domiciliary accounts for the user."""
    from weezy_cbs.customer_identity_management.models import Customer
    customer = db.query(Customer).first()
    return db.query(models.DomiciliaryAccount).filter(models.DomiciliaryAccount.customer_id == customer.id).all()
