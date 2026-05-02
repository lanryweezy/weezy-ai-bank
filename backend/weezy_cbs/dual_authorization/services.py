import decimal
import uuid
import json
import logging
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from . import models, schemas
from weezy_cbs.core_infrastructure_config_engine.models import User

logger = logging.getLogger(__name__)

class DualAuthorizationService:
    
    def create_request(self, db: Session, action_type: str, payload: Dict[str, Any], maker: User) -> models.ApprovalRequest:
        """
        Creates a new dual-control approval request.
        """
        request_id = f"REQ-{uuid.uuid4().hex[:10].upper()}"
        
        db_req = models.ApprovalRequest(
            request_id=request_id,
            action_type=action_type,
            payload_json=payload,
            maker_id=maker.id,
            maker_name=maker.username, # Or full name
            status=models.ApprovalStatusEnum.PENDING,
            expires_at=datetime.utcnow() + timedelta(hours=48)
        )
        db.add(db_req)
        db.commit()
        db.refresh(db_req)
        return db_req

    def get_pending_requests(self, db: Session) -> List[models.ApprovalRequest]:
        return db.query(models.ApprovalRequest).filter(
            models.ApprovalRequest.status == models.ApprovalStatusEnum.PENDING
        ).order_by(models.ApprovalRequest.created_at.desc()).all()

    async def authorize_request(self, db: Session, request_id: str, checker: User) -> models.ApprovalRequest:
        """
        Approves and EXECUTED the stored action.
        """
        req = db.query(models.ApprovalRequest).filter(models.ApprovalRequest.request_id == request_id).first()
        if not req:
            raise Exception("Approval request not found")
        
        if req.status != models.ApprovalStatusEnum.PENDING:
            raise Exception(f"Request is already {req.status.value}")
            
        if req.maker_id == checker.id:
            raise Exception("Maker cannot be the Checker (Dual Control rule violation)")

        # 1. MARK AS APPROVED
        req.status = models.ApprovalStatusEnum.APPROVED
        req.checker_id = checker.id
        req.checker_name = checker.username
        req.processed_at = datetime.utcnow()
        
        # 2. EXECUTE THE PAYLOAD
        # In a production system, we'd have a registry of executors.
        # For this MVP, we'll route based on action_type.
        try:
            await self._execute_payload(db, req.action_type, req.payload_json)
            db.commit()
        except Exception as e:
            db.rollback()
            req.status = models.ApprovalStatusEnum.PENDING # Reset or fail
            raise Exception(f"Execution failed: {str(e)}")

        return req

    async def reject_request(self, db: Session, request_id: str, checker: User, reason: str) -> models.ApprovalRequest:
        req = db.query(models.ApprovalRequest).filter(models.ApprovalRequest.request_id == request_id).first()
        if not req:
            raise Exception("Approval request not found")
            
        req.status = models.ApprovalStatusEnum.REJECTED
        req.checker_id = checker.id
        req.checker_name = checker.username
        req.checker_comments = reason
        req.processed_at = datetime.utcnow()
        
        db.commit()
        return req

    async def _execute_payload(self, db: Session, action_type: str, payload: Dict[str, Any]):
        """
        Core router that executes the actual banking logic after approval.
        """
        if action_type == "DISBURSE_LOAN":
            from weezy_cbs.loan_management_module.services import approve_loan_application
            # Assuming payload has application_id
            approve_loan_application(db, application_id=payload["application_id"])
            
        elif action_type == "LARGE_TRANSFER":
            from weezy_cbs.transaction_management.services import initiate_transaction
            from weezy_cbs.transaction_management.schemas import TransactionCreateRequest
            # Payload is a serialized TransactionCreateRequest
            txn_req = TransactionCreateRequest(**payload)
            await initiate_transaction(db, txn_req)
            
        elif action_type == "SYSTEM_SETTING_CHANGE":
            # Logic to update system settings
            pass
            
        else:
            raise Exception(f"No executor defined for action type: {action_type}")

dual_auth_service = DualAuthorizationService()
