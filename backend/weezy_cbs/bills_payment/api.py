from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session

from weezy_cbs.database import get_db
from . import schemas, services, models
from .services import bills_service
from weezy_cbs.core_infrastructure_config_engine.api import get_current_active_user

router = APIRouter(
    tags=["Utility & Bills Payment"],
)

@router.get("/billers", response_model=List[schemas.BillerResponse])
async def list_billers(
    category: Optional[models.BillerCategoryEnum] = None,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Returns a list of active Nigerian Billers (Airtime, Electricity, etc)."""
    return bills_service.get_billers_by_category(db, category)

@router.post("/validate")
async def validate_biller_customer(
    request: schemas.BillValidationRequest,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Validates a Meter number or Smartcard ID before payment."""
    return await bills_service.validate_customer(db, request)

@router.post("/pay")
async def pay_bill(
    request: schemas.BillPaymentRequest,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Processes a bill payment and debits the user's account."""
    # current_user would have a customer_id link
    from weezy_cbs.customer_identity_management.models import Customer
    customer = db.query(Customer).first() # Demo fallback
    if not customer:
        raise HTTPException(status_code=404, detail="Customer profile not found")
        
    return await bills_service.process_bill_payment(db, customer.id, request)

@router.post("/seed")
async def seed_billers(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Admin tool to populate common Nigerian billers."""
    bills_service.seed_nigerian_billers(db)
    return {"message": "Nigerian Billers seeded successfully."}
