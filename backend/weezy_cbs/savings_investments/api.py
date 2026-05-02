from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
import decimal

from weezy_cbs.database import get_db
from . import schemas, services, models
from .services import savings_service
from weezy_cbs.core_infrastructure_config_engine.api import get_current_active_user

router = APIRouter(
    tags=["Savings & Investments"],
)

@router.post("/goals", response_model=schemas.SavingsGoalResponse)
async def create_savings_goal(
    goal_in: schemas.SavingsGoalCreate,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Creates a new savings goal (e.g. Target Savings)."""
    return savings_service.create_goal(db, goal_in)

@router.get("/goals", response_model=List[schemas.SavingsGoalResponse])
async def list_savings_goals(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Lists all active savings goals for the current customer."""
    from weezy_cbs.customer_identity_management.models import Customer
    customer = db.query(Customer).first() # Demo fallback
    return savings_service.get_customer_goals(db, customer.id)

@router.post("/goals/{goal_id}/topup")
async def top_up_savings_goal(
    goal_id: int,
    amount: decimal.Decimal = Body(..., embed=True),
    source_account: str = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Adds funds to a savings goal from a primary bank account."""
    return await savings_service.top_up_goal(db, goal_id, amount, source_account)

@router.get("/ai-advice")
async def get_investment_advice(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Triggers the Gemini AI Investment Advisor."""
    from weezy_cbs.customer_identity_management.models import Customer
    customer = db.query(Customer).first() # Demo fallback
    reply = await savings_service.get_ai_investment_advice(db, customer.id)
    return {"advice": reply}

@router.get("/products", response_model=List[schemas.InvestmentProductResponse])
async def list_investment_products(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Returns available investment products (Fixed Deposits, T-Bills)."""
    return db.query(models.InvestmentProduct).filter(models.InvestmentProduct.is_active == True).all()
