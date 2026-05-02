from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session

from weezy_cbs.database import get_db
from . import schemas, services, models
from .services import risk_profiling_service
from weezy_cbs.core_infrastructure_config_engine.api import get_current_active_superuser

router = APIRouter(
    tags=["Customer Risk & AML Profiling"],
)

@router.get("/{customer_id}", response_model=schemas.CustomerRiskProfileResponse)
async def get_customer_risk_profile(
    customer_id: int,
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """Fetches the risk profile and AI assessment for a specific customer."""
    return await risk_profiling_service.get_or_create_risk_profile(db, customer_id)

@router.post("/{customer_id}/assess", response_model=schemas.CustomerRiskProfileResponse)
async def trigger_risk_assessment(
    customer_id: int,
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """Triggers a Gemini-powered AI risk assessment based on transaction history and KYC."""
    return await risk_profiling_service.run_ai_risk_assessment(db, customer_id)

@router.get("/alerts/elevated")
async def list_high_risk_alerts(
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """Returns a list of recent high-risk events flagged by the AI system."""
    return db.query(models.RiskEvent).order_by(models.RiskEvent.created_at.desc()).limit(50).all()
