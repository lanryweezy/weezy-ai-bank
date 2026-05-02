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

class AgentBankingService:
    
    def create_agent(self, db: Session, agent_in: schemas.AgentProfileCreate) -> models.AgentProfile:
        # Check if already an agent
        existing = db.query(models.AgentProfile).filter(models.AgentProfile.customer_id == agent_in.customer_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Customer is already registered as an agent.")
            
        agent_code = f"WZY-AG-{random.randint(1000, 9999)}"
        
        # Generate Float and Commission Accounts (NUBAN)
        float_acc = NigerianMarketUtils.generate_nuban(bank_code="999")
        comm_acc = NigerianMarketUtils.generate_nuban(bank_code="999")
        
        db_agent = models.AgentProfile(
            **agent_in.dict(),
            agent_code=agent_code,
            float_account_number=float_acc,
            commission_account_number=comm_acc,
            status=models.AgentStatusEnum.ACTIVE
        )
        db.add(db_agent)
        db.commit()
        db.refresh(db_agent)
        return db_agent

    async def process_cash_in(self, db: Session, request: schemas.CashInRequest) -> dict:
        """
        Agent receives physical cash from customer.
        Digital funds move: Agent Float Account -> Customer Account.
        """
        agent = db.query(models.AgentProfile).filter(models.AgentProfile.agent_code == request.agent_code).first()
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found.")
            
        # Perform double entry: Agent Float -> Customer Account
        try:
            from weezy_cbs.transaction_management.schemas import TransactionCreateRequest
            txn_req = TransactionCreateRequest(
                transaction_type="CASH_DEPOSIT",
                channel="AGENT",
                amount=request.amount,
                currency="NGN",
                debit_account_number=agent.float_account_number,
                credit_account_number=request.customer_account_number,
                narration=request.narration or f"Cash-In at Agent {agent.agent_code}"
            )
            
            txn = await initiate_transaction(db, txn_req)
            
            # Calculate Commission (e.g., 0.5% for agent)
            commission = request.amount * decimal.Decimal("0.005")
            self._log_commission(db, agent.id, str(txn.id), commission, "CASH_IN")
            
            return {
                "status": "SUCCESS",
                "transaction_id": txn.id,
                "amount": request.amount,
                "agent_commission": float(commission)
            }
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def process_cash_out(self, db: Session, request: schemas.CashOutRequest) -> dict:
        """
        Agent gives physical cash to customer.
        Digital funds move: Customer Account -> Agent Float Account.
        """
        agent = db.query(models.AgentProfile).filter(models.AgentProfile.agent_code == request.agent_code).first()
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found.")
            
        # Verify PIN (Simplified for MVP)
        if request.pin != "1234":
            raise HTTPException(status_code=401, detail="Invalid Customer PIN")

        try:
            from weezy_cbs.transaction_management.schemas import TransactionCreateRequest
            txn_req = TransactionCreateRequest(
                transaction_type="CASH_WITHDRAWAL",
                channel="AGENT",
                amount=request.amount,
                currency="NGN",
                debit_account_number=request.customer_account_number,
                credit_account_number=agent.float_account_number,
                narration=f"Cash-Out at Agent {agent.agent_code}"
            )
            
            txn = await initiate_transaction(db, txn_req)
            
            # Calculate Commission (e.g., 0.7% for agent on withdrawals)
            commission = request.amount * decimal.Decimal("0.007")
            self._log_commission(db, agent.id, str(txn.id), commission, "CASH_OUT")
            
            return {
                "status": "SUCCESS",
                "transaction_id": txn.id,
                "amount": request.amount,
                "agent_commission": float(commission)
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
