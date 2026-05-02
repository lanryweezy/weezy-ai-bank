from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session

from weezy_cbs.database import get_db
from . import schemas, services, models
from .services import commission_engine
from weezy_cbs.core_infrastructure_config_engine.api import get_current_active_user, get_current_active_superuser

router = APIRouter(
    tags=["Agent Commissions & Revenue Sharing"],
)

@router.get("/me/wallet", response_model=schemas.AgentWalletResponse)
async def get_my_revenue_wallet(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Returns the current revenue balance for the logged-in agent."""
    from weezy_cbs.agent_banking.models import Agent
    agent = db.query(Agent).filter(Agent.user_id == current_user.id).first()
    if not agent:
        raise HTTPException(status_code=403, detail="User is not an active agent.")
        
    wallet = commission_engine.get_agent_wallet(db, agent.id)
    if not wallet:
        return {"wallet_account_number": "N/A", "current_balance": 0, "total_lifetime_earned": 0, "last_payout_at": None}
    return wallet

@router.get("/me/logs", response_model=List[schemas.CommissionLogResponse])
async def get_my_commission_history(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Returns a breakdown of commissions earned by the agent."""
    from weezy_cbs.agent_banking.models import Agent
    agent = db.query(Agent).filter(Agent.user_id == current_user.id).first()
    if not agent: return []
    
    return db.query(models.CommissionLog).filter(models.CommissionLog.agent_id == agent.id).order_by(models.CommissionLog.created_at.desc()).limit(50).all()

@router.post("/admin/settle-batch")
async def trigger_commission_settlement(
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """Admin tool to push all pending commissions into agent revenue wallets."""
    count = await commission_engine.settle_pending_commissions(db)
    return {"message": f"Successfully settled {count} commission records."}

@router.get("/admin/configs", response_model=List[schemas.CommissionConfigResponse])
async def list_revenue_configs(
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """Returns the current revenue split rules for all transaction types."""
    return db.query(models.CommissionConfig).all()
