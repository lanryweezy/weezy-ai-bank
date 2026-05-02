import os
import decimal
import json
import logging
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date, timedelta
import google.generativeai as genai

from . import models, schemas
from weezy_cbs.accounts_ledger_management.models import Account, AccountStatusEnum
from weezy_cbs.transaction_management.models import FinancialTransaction, TransactionStatusEnum

logger = logging.getLogger(__name__)

class TreasuryLiquidityService:
    
    def __init__(self):
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.ai_model = genai.GenerativeModel('gemini-1.5-pro')
        else:
            self.ai_model = None

    def calculate_current_cash_position(self, db: Session) -> Dict[str, Any]:
        """
        Calculates the bank's total cash position across all internal GLs vs Customer Liabilities.
        """
        # 1. Total Customer Deposits (Liabilities)
        total_deposits = db.query(func.sum(Account.ledger_balance)).filter(
            Account.status == AccountStatusEnum.ACTIVE
        ).scalar() or 0

        # 2. Bank Assets (Vault + CBN + Nostro)
        # (Simplified: assuming specific GL account ranges or models)
        # Using the BankCashPosition table for the latest snapshot
        latest_pos = db.query(models.BankCashPosition).order_by(models.BankCashPosition.position_date.desc()).first()
        
        assets = 0
        if latest_pos:
            assets = float(latest_pos.total_cash_at_vault + latest_pos.total_cash_at_cbn + latest_pos.total_cash_at_correspondent_banks)

        # 3. Liquidity Ratio (Nigerian Standard min 30% for Commercial Banks)
        liquidity_ratio = (assets / float(total_deposits) * 100) if total_deposits > 0 else 100.0

        return {
            "customer_liabilities": float(total_deposits),
            "bank_liquid_assets": assets,
            "liquidity_ratio": round(liquidity_ratio, 2),
            "crr_position": float(latest_pos.total_cash_at_cbn) if latest_pos else 0, # Cash Reserve Ratio
            "currency": "NGN",
            "is_compliant": liquidity_ratio >= 30.0
        }

    async def generate_ai_liquidity_forecast(self, db: Session) -> models.AILiquidityForecast:
        """
        Uses Gemini to predict liquidity trends based on historical transaction volume.
        """
        if not self.ai_model:
            raise Exception("AI Engine offline")

        # 1. Gather historical data (Last 30 days of inflows/outflows)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        txns = db.query(
            func.date(FinancialTransaction.initiated_at).label('day'),
            func.sum(FinancialTransaction.amount).label('total')
        ).filter(
            FinancialTransaction.status == TransactionStatusEnum.SUCCESSFUL,
            FinancialTransaction.initiated_at >= thirty_days_ago
        ).group_by('day').all()

        history = [{"date": str(t.day), "volume": float(t.total)} for t in txns]

        prompt = f"""
        You are 'Weezy Treasury Strategist' for a Nigerian bank.
        Analyze the following 30-day transaction history and forecast liquidity needs for the next 7 days.
        Consider Nigerian market factors: End-of-month salary spikes, weekend cash-out velocity at Agents.
        
        HISTORICAL DATA:
        {json.dumps(history)}
        
        Respond ONLY with a structured JSON object:
        {{
          "predicted_outflow_next_7d": float,
          "predicted_inflow_next_7d": float,
          "risk_analysis": "string",
          "confidence_score": 0.0-1.0,
          "recommendation": "Borrow from Repo" | "Invest in T-Bills" | "Maintain Position"
        }}
        """

        try:
            response = await self.ai_model.generate_content_async(prompt)
            result_text = response.text
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0].strip()
            
            report = json.loads(result_text)
            
            # Save Forecast
            forecast = models.AILiquidityForecast(
                forecast_date=date.today(),
                predicted_outflow=decimal.Decimal(str(report["predicted_outflow_next_7d"])),
                predicted_inflow=decimal.Decimal(str(report["predicted_inflow_next_7d"])),
                confidence_score=report["confidence_score"],
                ai_report_json=report,
                status="COMPLETED",
                completed_at=datetime.utcnow()
            )
            db.add(forecast)
            db.commit()
            db.refresh(forecast)
            return forecast

        except Exception as e:
            logger.error(f"Treasury AI Error: {str(e)}")
            raise e

    def get_latest_investments(self, db: Session) -> Dict[str, List[Any]]:
        t_bills = db.query(models.TreasuryBillInvestment).filter(models.models.TreasuryBillInvestment.status == "ACTIVE").all()
        placements = db.query(models.InterbankPlacement).filter(models.models.InterbankPlacement.status == "ACTIVE").all()
        return {"treasury_bills": t_bills, "interbank_placements": placements}

treasury_service = TreasuryLiquidityService()
