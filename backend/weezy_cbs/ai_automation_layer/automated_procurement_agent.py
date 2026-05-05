import logging
import os
import google.generativeai as genai
import json
from typing import Dict, Any
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

class AutomatedProcurementAgent:
    """
    AI that monitors physical and digital stock (Cloud Credits, POS terminals, Server capacity).
    Autonomously generates purchase orders or provisions cloud resources when levels are critical.
    """
    
    def __init__(self):
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.model = None

    async def monitor_and_procure(self, db: Session, simulated_inventory: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyzes current inventory vs burn rate to make autonomous procurement decisions.
        """
        if not self.model: return {"status": "ERROR", "reason": "AI_OFFLINE"}
        
        prompt = f"""
        You are 'Weezy Ops', an autonomous procurement AI for a fast-growing Nigerian bank.
        
        CURRENT INVENTORY LEVELS:
        {json.dumps(simulated_inventory)}
        
        RULES:
        1. If AWS Credits drop below $5,000, we must issue a PO for $50,000 immediately to prevent outage.
        2. If unassigned POS Terminals drop below 50, order 500 more from the hardware vendor.
        3. If Twilio SMS credits drop below 10,000 units, top up by 100,000 units.
        
        Analyze the inventory and generate a list of required actions.
        Format as JSON:
        {{
            "actions_required": [
                {{
                    "item": "string",
                    "action": "ORDER_HARDWARE" | "PROVISION_CLOUD",
                    "quantity": int,
                    "estimated_cost_usd": float,
                    "urgency": "HIGH" | "MEDIUM" | "LOW"
                }}
            ]
        }}
        """
        
        try:
            response = await self.model.generate_content_async(prompt)
            clean_json = response.text.replace("```json", "").replace("```", "").strip()
            procurement_plan = json.loads(clean_json)
            
            executed_actions = []
            
            for action in procurement_plan.get("actions_required", []):
                # In a real system, this would call AWS/Twilio API or generate a PDF PO.
                logger.warning(f"PROCUREMENT: Autonomously executing {action['action']} for {action['quantity']} {action['item']}. Est Cost: ${action['estimated_cost_usd']}")
                executed_actions.append(action)
                
            return {
                "status": "MONITORING_COMPLETE",
                "actions_executed": executed_actions
            }
            
        except Exception as e:
            logger.error(f"Procurement Agent Error: {str(e)}")
            return {"status": "ERROR", "reason": str(e)}

procurement_agent = AutomatedProcurementAgent()
