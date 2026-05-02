from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from sqlalchemy import func

from weezy_cbs.database import get_db
from . import schemas, services, models
from weezy_cbs.core_infrastructure_config_engine.api import get_current_active_superuser

router = APIRouter(
    tags=["Compliance & Regulatory Reporting"],
)

@router.post("/reports/trigger", response_model=schemas.GeneratedReportLogResponse)
async def trigger_regulatory_report(
    report_request: schemas.ReportGenerationRequest,
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """
    Triggers the generation of a specific regulatory report (e.g., CBN_CRMS).
    """
    try:
        return services.trigger_report_generation(db, report_request, current_admin.username)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/reports/logs", response_model=List[schemas.GeneratedReportLogResponse])
async def list_report_logs(
    report_name: Optional[schemas.ReportNameSchema] = None,
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """
    Returns a history of all generated regulatory reports.
    """
    # Simple list return
    return services.get_all_report_logs(db, report_name=report_name)

@router.get("/reports/logs/{report_log_id}", response_model=schemas.GeneratedReportLogResponse)
async def get_report_log_details(
    report_log_id: int,
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    """
    Returns details and download URL for a specific report.
    """
    report = services.get_report_log(db, report_log_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report log not found")
    return report

# --- AML Alert Endpoints ---
@router.get("/aml-alerts")
async def list_aml_alerts(
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_active_superuser)
):
    return db.query(models.SuspiciousActivityLog).order_by(models.SuspiciousActivityLog.flagged_at.desc()).all()
