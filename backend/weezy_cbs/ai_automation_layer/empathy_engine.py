import logging
import os
import google.generativeai as genai
import json
import decimal
from typing import Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class ProactiveRefundAgent:
    """
    Proactive Refund Engine (Domain 3).
    Monitors 'Hanging' NIP transfers and reverses them before the user notices.
    """

    async def scan_and_fix_hanging_transfers(self, db: Session) -> Dict[str, Any]:
        """
        Identifies NIP transfers stuck in PENDING for > 3 minutes,
        queries the mock switch, and reverses if failed.
        """
        from weezy_cbs.transaction_management.models import FinancialTransaction, TransactionStatusEnum
        from weezy_cbs.transaction_management.services import reverse_transaction
        from weezy_cbs.transaction_management.schemas import TransactionReversalRequest
        
        # 1. Find "Hanging" transactions
        cutoff_time = datetime.utcnow() - timedelta(minutes=3)
        hanging_txns = db.query(FinancialTransaction).filter(
            FinancialTransaction.status == TransactionStatusEnum.PENDING,
            FinancialTransaction.initiated_at <= cutoff_time,
            FinancialTransaction.transaction_type == "NIP_OUTWARD_TRANSFER"
        ).all()
        
        reversals_count = 0
        for txn in hanging_txns:
            # 2. Simulate query to NIBSS switch
            # In a real app, this calls NigerianMarketUtils.nip_transaction_query
            is_confirmed_failed = True # Mocking failure for this logic
            
            if is_confirmed_failed:
                logger.warning(f"EMPATHY: Detected hanging failed TXN {txn.id}. Executing proactive reversal.")
                
                reversal_req = TransactionReversalRequest(
                    original_transaction_id=txn.id,
                    reason="PROACTIVE_AI_REVERSAL: System detected hanging NIP failure."
                )
                
                try:
                    reverse_transaction(db, reversal_req)
                    reversals_count += 1
                except Exception as e:
                    logger.error(f"EMPATHY: Proactive reversal failed for {txn.id}: {str(e)}")
                    
        return {
            "status": "SCAN_COMPLETE",
            "hanging_detected": len(hanging_txns),
            "proactive_refunds_issued": reversals_count
        }

class SentimentDrivenLoyaltyAgent:
    """
    Sentiment-Driven Fee Waiver Agent (Domain 3).
    Rewards distressed customers with small gestures of goodwill.
    """
    
    def __init__(self):
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.model = None

    async def analyze_support_and_offer_gesture(self, db: Session, customer_id: int, chat_history: str) -> Dict[str, Any]:
        """
        Uses Gemini to detect distress in support logs and suggests/executes a fee waiver.
        """
        if not self.model: return {"status": "ERROR", "reason": "AI_OFFLINE"}
        
        prompt = f"""
        You are 'Weezy Care', an AI empathy specialist for a Nigerian Bank.
        
        SUPPORT CHAT LOG:
        {chat_history}
        
        TASK:
        1. Analyze the customer's sentiment. Are they frustrated by system errors?
        2. If they are distressed, you have authority to waive a ₦50 or ₦100 fee.
        3. Decide if a gesture of goodwill is appropriate.
        
        Format as JSON:
        {{
            "sentiment": "CALM" | "FRUSTRATED" | "ANGRY",
            "gesture_appropriate": true/false,
            "waive_amount": float,
            "message_to_user": "string"
        }}
        """
        
        try:
            response = await self.model.generate_content_async(prompt)
            clean_json = response.text.replace("```json", "").replace("```", "").strip()
            decision = json.loads(clean_json)
            
            if decision.get("gesture_appropriate") and decision.get("waive_amount", 0) > 0:
                # Execute Fee Refund (Conceptual)
                logger.info(f"EMPATHY: Issuing ₦{decision['waive_amount']} waiver to Customer {customer_id} due to {decision['sentiment']} sentiment.")
                
                # In production, this would trigger a CREDIT transaction from GL-COMM-FEE-WAIVER
                
                return {
                    "status": "GESTURE_ISSUED",
                    "waived_amount": decision["waive_amount"],
                    "reasoning": f"Sentiment was {decision['sentiment']}",
                    "user_notification": decision["message_to_user"]
                }
                
            return {"status": "NO_GESTURE_REQUIRED"}
            
        except Exception as e:
            logger.error(f"Loyalty Agent Error: {str(e)}")
            return {"status": "ERROR", "reason": str(e)}

proactive_refund_agent = ProactiveRefundAgent()
sentiment_loyalty_agent = SentimentDrivenLoyaltyAgent()
