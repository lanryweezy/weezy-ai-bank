import logging
import os
import google.generativeai as genai
from typing import Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime

logger = logging.getLogger(__name__)

class LiquidityRebalancingAgent:
    """
    Autonomous Liquidity Rebalancing Agent.
    Monitors settlement GLs and autonomously transfers funds between 
    bank-owned accounts to maintain optimal liquidity ratios and minimize fees.
    """
    
    def __init__(self):
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.model = None

    async def optimize_liquidity(self, db: Session) -> Dict[str, Any]:
        """
        Analyzes GL balances and generates/executes a rebalancing strategy.
        """
        if not self.model: return {"status": "ERROR", "reason": "AI_OFFLINE"}
        
        from weezy_cbs.accounts_ledger_management.models import GeneralLedgerAccount
        from weezy_cbs.transaction_management.services import initiate_transaction
        from weezy_cbs.transaction_management.schemas import TransactionCreateRequest
        
        # 1. Gather Current Liquidity State
        # Fetch key settlement GLs (e.g., NIBSS Settlement, Interswitch Settlement, Central Vault)
        key_gl_codes = [
            "GL-ASSET-NIBSS-SETTLEMENT-001",
            "GL-ASSET-INTERSWITCH-SETTLEMENT-001",
            "GL-ASSET-CENTRAL-VAULT-001"
        ]
        
        gl_balances = {}
        for code in key_gl_codes:
            gl = db.query(GeneralLedgerAccount).filter(GeneralLedgerAccount.gl_code == code).first()
            if gl:
                gl_balances[code] = float(gl.current_balance)
            else:
                gl_balances[code] = 0.0
                
        # 2. Ask Gemini for Rebalancing Strategy
        prompt = f"""
        You are 'Weezy Treasury', the AI Chief Financial Officer.
        Optimize the bank's liquidity across its settlement accounts.
        
        CURRENT BALANCES (NGN):
        {gl_balances}
        
        RULES:
        1. NIBSS Settlement should ideally be around 50,000,000 NGN to handle outbound NIP transfers.
        2. Interswitch Settlement should be around 20,000,000 NGN.
        3. Excess funds should be moved to the Central Vault.
        4. If a settlement account is below threshold, draw from Central Vault.
        
        Provide ONE specific transfer instruction to optimize liquidity, or indicate no action is needed.
        
        Format as JSON:
        {{
            "action_required": true/false,
            "transfer": {{
                "from_gl": "string",
                "to_gl": "string",
                "amount": float,
                "reasoning": "string"
            }}
        }}
        """
        
        try:
            import json
            import decimal
            response = await self.model.generate_content_async(prompt)
            clean_json = response.text.replace("```json", "").replace("```", "").strip()
            strategy = json.loads(clean_json)
            
            if strategy.get("action_required") and strategy.get("transfer"):
                transfer = strategy["transfer"]
                logger.info(f"LIQUIDITY: Executing rebalance. Moving {transfer['amount']} from {transfer['from_gl']} to {transfer['to_gl']}")
                
                # 3. Execute the Transfer
                txn_req = TransactionCreateRequest(
                    transaction_type="LIQUIDITY_REBALANCE",
                    channel="SYSTEM_TREASURY",
                    amount=decimal.Decimal(str(transfer['amount'])),
                    currency="NGN",
                    debit_account_number=transfer["from_gl"],
                    credit_account_number=transfer["to_gl"],
                    narration=f"AI Treasury Optimization: {transfer['reasoning']}"
                )
                
                await initiate_transaction(db, txn_req, initiated_by_customer_id=1) # Using 1 as System User
                
                return {"status": "REBALANCED", "details": transfer}
                
            return {"status": "OPTIMAL", "details": "No rebalancing required."}
            
        except Exception as e:
            logger.error(f"Liquidity Agent Error: {str(e)}")
            return {"status": "ERROR", "reason": str(e)}

liquidity_agent = LiquidityRebalancingAgent()
