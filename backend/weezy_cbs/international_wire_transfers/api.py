from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
import decimal

from weezy_cbs.database import get_db
from . import schemas, services, models
from .services import wire_service
from weezy_cbs.core_infrastructure_config_engine.api import get_current_active_user, get_current_active_superuser

router = APIRouter(
    tags=["International Wire & SWIFT"],
)

@router.post("/initiate", response_model=schemas.WireTransferResponse)
async def initiate_international_wire(
    wire_in: schemas.WireTransferCreate,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Initiates a new international wire request."""
    return wire_service.initiate_wire(db, wire_in)

@router.get("/history", response_model=List[schemas.WireTransferResponse])
async def get_my_wire_history(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Returns a list of all wire transfers requested by the user."""
    from weezy_cbs.customer_identity_management.models import Customer
    customer = db.query(Customer).first() # Demo
    return wire_service.get_customer_wires(db, customer.id)

@router.post("/{wire_id}/generate-mt103")
async def generate_swift_message(
    wire_id: int,
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """Admin tool to generate a SWIFT MT103 message for a wire."""
    raw = await wire_service.generate_mt103(db, wire_id)
    return {"mt103_raw": raw}

@router.post("/{wire_id}/execute")
async def execute_swift_wire(
    wire_id: int,
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """Admin tool to execute the final SWIFT outbound transfer."""
    return await wire_service.execute_swift_outbound(db, wire_id)
