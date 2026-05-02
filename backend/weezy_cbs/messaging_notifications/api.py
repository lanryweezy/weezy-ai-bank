from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session

from weezy_cbs.database import get_db
from . import schemas, services, models
from .services import notification_engine
from weezy_cbs.core_infrastructure_config_engine.api import get_current_active_user, get_current_active_superuser

router = APIRouter(
    tags=["Messaging & Notifications"],
)

@router.get("/me/logs", response_model=List[schemas.NotificationLogResponse])
async def get_my_notification_logs(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_active_user)
):
    """Returns a history of all SMS and Emails sent to the current user."""
    return db.query(models.NotificationLog).filter(models.NotificationLog.customer_id == current_user.id).order_by(models.NotificationLog.created_at.desc()).limit(50).all()

@router.post("/send-manual")
async def send_manual_alert(
    req: schemas.SendManualNotification,
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """Admin tool to send manual SMS/Email alerts to customers."""
    return await notification_engine.send_notification(db, req.customer_id, req.channel, "ADMIN_MANUAL", req.message, req.subject)
