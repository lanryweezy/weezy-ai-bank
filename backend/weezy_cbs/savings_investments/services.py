import os
import decimal
import json
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime, date
import google.generativeai as genai

from . import models, schemas
from weezy_cbs.customer_identity_management.models import Customer
from weezy_cbs.accounts_ledger_management.services import get_accounts_by_customer_id
from weezy_cbs.transaction_management.services import initiate_transaction
from weezy_cbs.transaction_management.schemas import TransactionCreateRequest

logger = logging.getLogger(__name__)

class SavingsInvestmentsService:
    
    def __init__(self):
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.ai_model = genai.GenerativeModel('gemini-1.5-pro')
        else:
            self.ai_model = None

    def create_goal(self, db: Session, goal_in: schemas.SavingsGoalCreate) -> models.SavingsGoal:
        db_goal = models.SavingsGoal(**goal_in.dict())
        db.add(db_goal)
        db.commit()
        db.refresh(db_goal)
        return db_goal

    def get_customer_goals(self, db: Session, customer_id: int) -> List[models.SavingsGoal]:
        return db.query(models.SavingsGoal).filter(models.SavingsGoal.customer_id == customer_id).all()

    async def top_up_goal(self, db: Session, goal_id: int, amount: decimal.Decimal, source_account: str):
        goal = db.query(models.SavingsGoal).filter(models.SavingsGoal.id == goal_id).first()
        if not goal:
            raise Exception("Goal not found")

        # 1. Debit Source Account, Credit Internal Savings GL
        txn_req = TransactionCreateRequest(
            transaction_type="SYSTEM_POSTING",
            channel="MOBILE_APP",
            amount=amount,
            currency="NGN",
            debit_account_number=source_account,
            credit_account_number="GL-SAVINGS-POOL-001",
            narration=f"Goal Top-up: {goal.name}"
        )
        
        await initiate_transaction(db, txn_req)
        
        # 2. Update Goal Balance
        goal.current_balance += amount
        db.commit()
        db.refresh(goal)
        return goal

    def run_daily_accrual(self, db: Session):
        """
        Calculates and adds daily interest to all ACTIVE savings goals.
        Called by EOD Orchestrator.
        """
        active_goals = db.query(models.SavingsGoal).filter(models.SavingsGoal.status == models.SavingsStatusEnum.ACTIVE).all()
        
        for goal in active_goals:
            # Daily: (Bal * Rate) / 365
            daily_rate = (goal.interest_rate / decimal.Decimal("365"))
            interest = goal.current_balance * daily_rate
            
            goal.current_balance += interest
            
        db.commit()
        return len(active_goals)

    async def get_ai_investment_advice(self, db: Session, customer_id: int) -> str:
        """
        AI Investment Advisor: Analyzes spending and suggests saving plans.
        """
        customer = db.query(Customer).filter(Customer.id == customer_id).first()
        accounts = get_accounts_by_customer_id(db, customer_id)
        
        balance = sum(acc.available_balance for acc in accounts)
        
        prompt = f"""
        You are 'Weezy Investment Advisor' for a Nigerian bank customer.
        The customer {customer.first_name} has a total liquid balance of ₦{balance:,.2f}.
        
        NIGERIAN INVESTMENT OPTIONS:
        1. Fixed Deposits: 12-15% PA.
        2. Treasury Bills: 10-18% PA (Low risk).
        3. Mutual Funds: 14% PA (Diversified).
        4. Goal Savings: 8% PA (Flexible).
        
        Based on their balance, suggest a saving/investment strategy. 
        Keep it professional, encouraging, and localized for Nigeria.
        """

        if not self.ai_model:
            return "Start saving today to secure your future. We offer up to 15% interest on fixed deposits."

        try:
            response = await self.ai_model.generate_content_async(prompt)
            return response.text
        except Exception as e:
            logger.error(f"AI Advisor Error: {str(e)}")
            return "Consult our investment products to see how you can grow your wealth."

savings_service = SavingsInvestmentsService()
