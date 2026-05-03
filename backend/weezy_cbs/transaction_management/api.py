from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session

from weezy_cbs.database import get_db
from . import schemas, services, models
from weezy_cbs.core_infrastructure_config_engine.api import get_current_active_user
from weezy_cbs.core_infrastructure_config_engine.models import User as CoreUser

router = APIRouter(
    tags=["Transaction Management"],
)

@router.post("/initiate", response_model=schemas.TransactionResponse)
async def initiate_new_transaction(
    transaction_in: schemas.TransactionCreateRequest,
    db: Session = Depends(get_db),
    current_user: CoreUser = Depends(get_current_active_user)
):
    try:
        # In a real app, we'd link current_user.customer_id if it's a customer portal
        return services.initiate_transaction(db, transaction_in)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/history", response_model=List[schemas.TransactionResponse])
async def get_transaction_history(
    account_number: Optional[str] = None,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: CoreUser = Depends(get_current_active_user)
):
    # This is a simplified fetch from the master FinancialTransaction table
    query = db.query(models.FinancialTransaction)
    if account_number:
        query = query.filter(
            (models.FinancialTransaction.debit_account_number == account_number) |
            (models.FinancialTransaction.credit_account_number == account_number)
        )
    
    return query.order_by(models.FinancialTransaction.initiated_at.desc()).limit(limit).all()

@router.get("/summary")
async def get_transaction_summary(
    db: Session = Depends(get_db),
    current_user: CoreUser = Depends(get_current_active_user)
):
    """Returns a summary of transactions for the dashboard."""
    # Mock summary for now, but querying real table
    total_count = db.query(models.FinancialTransaction).count()
    successful_count = db.query(models.FinancialTransaction).filter(models.FinancialTransaction.status == "SUCCESSFUL").count()
    
    return {
        "total_transactions": total_count,
        "successful_transactions": successful_count,
        "recent_activity": [] # Could add more stats here
    }

@router.post("/{transaction_id}/dispute")
async def log_transaction_dispute(
    transaction_id: str,
    reason: str = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: CoreUser = Depends(get_current_active_user)
):
    """Logs a formal dispute for a specific transaction."""
    txn = db.query(models.FinancialTransaction).filter(models.FinancialTransaction.id == transaction_id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    dispute = models.TransactionDispute(
        financial_transaction_id=transaction_id,
        customer_id=current_user.id,
        dispute_reason=reason,
        status="OPEN",
        logged_by_user_id=str(current_user.id)
    )
    db.add(dispute)
    db.commit()
    db.refresh(dispute)
    return dispute
