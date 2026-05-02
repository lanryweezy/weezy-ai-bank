from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session

from weezy_cbs.database import get_db
from . import schemas, services, models
from .services import treasury_service
from weezy_cbs.core_infrastructure_config_engine.api import get_current_active_superuser

router = APIRouter(
    tags=["Treasury & Liquidity Management"],
)

@router.get("/position")
async def get_bank_cash_position(
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """Returns the bank's real-time liquidity ratio and cash positions."""
    return treasury_service.calculate_current_cash_position(db)

@router.post("/forecast/generate")
async def trigger_ai_liquidity_forecast(
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """Triggers Gemini AI to forecast liquidity needs for the next 7 days."""
    return await treasury_service.generate_ai_liquidity_forecast(db)

@router.get("/forecast/latest")
async def get_latest_forecast(
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """Returns the most recent AI liquidity forecast report."""
    return db.query(models.AILiquidityForecast).order_by(models.AILiquidityForecast.created_at.desc()).first()

@router.get("/investments")
async def list_active_investments(
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """Returns the bank's active Treasury Bills and Interbank Placements."""
    return treasury_service.get_latest_investments(db)
