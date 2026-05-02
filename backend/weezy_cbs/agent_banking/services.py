from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import decimal
import random
import string
from typing import List, Optional

from . import models, schemas
from weezy_cbs.nigerian_market_utils import NigerianMarketUtils
from weezy_cbs.accounts_ledger_management.services import post_double_entry_transaction, get_account_by_number
from weezy_cbs.transaction_management.services import initiate_transaction

from weezy_cbs.agent_commissions.services import commission_engine

class AgentBankingService:
    # ... existing methods ...
    async def process_cash_in(self, db: Session, request: schemas.CashInRequest) -> dict:
        # ... existing logic ...
        try:
            # ... txn code ...
            txn = await initiate_transaction(db, txn_req)
            
            # Use centralized Commission Engine
            commission_engine.log_transaction_commission(db, txn, agent.id)
            
            return {
                "status": "SUCCESS",
                "transaction_id": txn.id,
                "amount": request.amount
            }
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def process_cash_out(self, db: Session, request: schemas.CashOutRequest) -> dict:
        # ... existing logic ...
        try:
            # ... txn code ...
            txn = await initiate_transaction(db, txn_req)
            
            # Use centralized Commission Engine
            commission_engine.log_transaction_commission(db, txn, agent.id)
            
            return {
                "status": "SUCCESS",
                "transaction_id": txn.id,
                "amount": request.amount
            }
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    def _log_commission(self, db: Session, agent_id: int, txn_id: str, amount: decimal.Decimal, type: str):
        log = models.AgentCommissionLog(
            agent_id=agent_id,
            transaction_id=txn_id,
            amount=amount,
            commission_type=type,
            status="EARNED"
        )
        db.add(log)
        db.commit()

agent_banking_service = AgentBankingService()
