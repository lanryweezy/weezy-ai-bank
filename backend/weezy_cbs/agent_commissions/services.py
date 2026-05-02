import logging
from decimal import Decimal
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime

from . import models, schemas
from weezy_cbs.transaction_management.models import FinancialTransaction
from weezy_cbs.agent_banking.models import Agent

logger = logging.getLogger(__name__)

class CommissionEngine:
    
    def log_transaction_commission(self, db: Session, txn: FinancialTransaction, agent_id: int):
        """
        Calculates and logs the split for a specific transaction fee.
        """
        # 1. Fetch Config for this txn type
        config = db.query(models.CommissionConfig).filter(
            models.CommissionConfig.transaction_type == txn.transaction_type,
            models.CommissionConfig.is_active == True
        ).first()
        
        if not config:
            # Fallback to default 40/50/10 split
            bank_pct, agent_pct, super_pct = Decimal("40"), Decimal("50"), Decimal("10")
        else:
            bank_pct, agent_pct, super_pct = config.bank_share_pct, config.agent_share_pct, config.super_agent_share_pct

        total_fee = txn.tax_amount # For demo, we treat the tax/fee as the pool to share
        
        bank_share = (total_fee * bank_pct) / Decimal("100")
        agent_share = (total_fee * agent_pct) / Decimal("100")
        super_share = (total_fee * super_pct) / Decimal("100")
        
        log = models.CommissionLog(
            financial_transaction_id=txn.id,
            agent_id=agent_id,
            total_fee_collected=total_fee,
            bank_amount=bank_share,
            agent_amount=agent_share,
            super_agent_amount=super_share,
            status=models.CommissionStatusEnum.PENDING
        )
        db.add(log)
        db.commit()
        return log

    async def settle_pending_commissions(self, db: Session):
        """
        Processes the PENDING logs and updates agent wallets.
        In real prod, this triggers a ledger transfer from Commission Payable GL.
        """
        pending = db.query(models.CommissionLog).filter(models.CommissionLog.status == models.CommissionStatusEnum.PENDING).all()
        
        count = 0
        for log in pending:
            # 1. Update Agent Wallet
            wallet = db.query(models.AgentWallet).filter(models.AgentWallet.agent_id == log.agent_id).first()
            if not wallet:
                # Create if missing
                import uuid
                wallet = models.AgentWallet(
                    agent_id=log.agent_id,
                    wallet_account_number=f"REV{uuid.uuid4().hex[:7].upper()}",
                    current_balance=Decimal("0.00")
                )
                db.add(wallet)
                db.flush()
                
            wallet.current_balance += log.agent_amount
            wallet.total_lifetime_earned += log.agent_amount
            
            log.status = models.CommissionStatusEnum.SETTLED
            log.settled_at = datetime.utcnow()
            count += 1
            
        db.commit()
        return count

    def get_agent_wallet(self, db: Session, agent_id: int) -> models.AgentWallet:
        return db.query(models.AgentWallet).filter(models.AgentWallet.agent_id == agent_id).first()

commission_engine = CommissionEngine()
