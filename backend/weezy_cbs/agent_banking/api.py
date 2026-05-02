from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session

from weezy_cbs.database import get_db
from . import schemas, services, models
from .services import agent_banking_service
from weezy_cbs.core_infrastructure_config_engine.api import get_current_active_superuser

router = APIRouter(
    tags=["Agent Banking (SANEF)"],
)

@router.post("/register", response_model=schemas.AgentProfileResponse)
async def register_agent(
    agent_in: schemas.AgentProfileCreate,
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """Admin endpoint to register a new retail agent."""
    return agent_banking_service.create_agent(db, agent_in)

@router.post("/cash-in")
async def agent_cash_in(
    request: schemas.CashInRequest,
    db: Session = Depends(get_db)
):
    """Agent endpoint: Customer gives physical cash, agent credits customer account."""
    return await agent_banking_service.process_cash_in(db, request)

@router.post("/cash-out")
async def agent_cash_out(
    request: schemas.CashOutRequest,
    db: Session = Depends(get_db)
):
    """Agent endpoint: Agent gives physical cash, agent debits customer account."""
    return await agent_banking_service.process_cash_out(db, request)

@router.get("/commissions/{agent_code}")
async def get_agent_commissions(
    agent_code: str,
    db: Session = Depends(get_db)
):
    """Returns the total earned commissions for an agent."""
    agent = db.query(models.AgentProfile).filter(models.AgentProfile.agent_code == agent_code).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
        
    total = db.query(models.AgentCommissionLog).filter(models.AgentCommissionLog.agent_id == agent.id).with_entities(models.func.sum(models.AgentCommissionLog.amount)).scalar() or 0
    return {"agent_code": agent_code, "total_commission": float(total), "currency": "NGN"}
