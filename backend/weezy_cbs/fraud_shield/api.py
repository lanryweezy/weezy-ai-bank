from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session

from weezy_cbs.database import get_db
from . import schemas, services, models
from .services import fraud_shield_service
from weezy_cbs.core_infrastructure_config_engine.api import get_current_active_superuser

router = APIRouter(
    tags=["AI Fraud Shield"],
)

@router.get("/alerts", response_model=List[schemas.FraudAlertResponse])
async def list_fraud_alerts(
    status: Optional[models.FraudStatusEnum] = None,
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """Lists all fraud alerts flagged by the AI engine."""
    query = db.query(models.FraudAlert)
    if status:
        query = query.filter(models.FraudAlert.status == status)
    return query.order_by(models.FraudAlert.created_at.desc()).all()

@router.post("/review")
async def review_fraud_alert(
    review: schemas.FraudReviewRequest,
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """Allows a security officer to approve or block a flagged transaction."""
    try:
        return fraud_shield_service.update_alert_decision(
            db, alert_id=review.alert_id, 
            decision=review.decision, 
            user_id=current_admin.id, 
            notes=review.notes
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/stats")
async def get_fraud_shield_stats(
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """Returns real-time fraud monitoring statistics."""
    total = db.query(models.FraudAlert).count()
    blocked = db.query(models.FraudAlert).filter(models.FraudAlert.status == models.FraudStatusEnum.BLOCKED_FRAUD).count()
    pending = db.query(models.FraudAlert).filter(models.FraudAlert.status == models.FraudStatusEnum.PENDING_REVIEW).count()
    
    return {
        "total_alerts": total,
        "active_blocks": blocked,
        "awaiting_review": pending,
        "shield_status": "OPERATIONAL"
    }
