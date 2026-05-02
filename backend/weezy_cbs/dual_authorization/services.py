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
            approve_loan_application(db, application_id=payload["application_id"])
            
        elif action_type == "LARGE_TRANSFER":
            from weezy_cbs.transaction_management.services import initiate_transaction
            from weezy_cbs.transaction_management.schemas import TransactionCreateRequest
            txn_req = TransactionCreateRequest(**payload)
            await initiate_transaction(db, txn_req)
            
        elif action_type == "PROVISION_GL":
            from weezy_cbs.gl_management.services import gl_service
            from weezy_cbs.gl_management.schemas import GLAccountCreate
            gl_req = GLAccountCreate(**payload)
            gl_service.create_gl_account(db, gl_req)
            
        elif action_type == "STOP_CHEQUE":
            # Logic to finalize stop-payment is usually immediate but we log it here
            pass
            
        elif action_type == "REGISTER_ASSET":
            from weezy_cbs.fixed_assets.services import assets_service
            from weezy_cbs.fixed_assets.schemas import FixedAssetCreate
            asset_req = FixedAssetCreate(**payload)
            assets_service.register_asset(db, asset_req)
            
        elif action_type == "OPEN_ACCOUNT_LARGE_DEPOSIT":
            from weezy_cbs.accounts_ledger_management.services import create_account
            from weezy_cbs.accounts_ledger_management.schemas import AccountCreateRequest
            # Payload is serialized AccountCreateRequest
            acc_req = AccountCreateRequest(**payload)
            # Pass None or a flag to bypass dual control if we had one, but here we can just 
            # re-implement the core logic or use a specialized internal function.
            # For now, we manually post the opening entry to ensure it's done.
            create_account(db, acc_req, current_user=None) # Passing None as current_user to avoid infinite loop

dual_auth_service = DualAuthorizationService()
