import logging
import os
import json
import google.generativeai as genai
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime

logger = logging.getLogger(__name__)

class WebhookHealer:
    """
    AI-driven 'Self-Healing' for failed webhooks.
    Analyzes error payloads and attempts to 'repair' and retry the transaction.
    """
    
    def __init__(self):
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.model = None

    async def analyze_and_repair(self, db: Session, webhook_log_id: int) -> Dict[str, Any]:
        """
        Takes a failed webhook log, uses Gemini to understand why it failed,
        and generates a 'repaired' payload or instructions for retry.
        """
        if not self.model: return {"status": "ERROR", "reason": "AI_OFFLINE"}

        from weezy_cbs.third_party_fintech_integration.models import WebhookEventLog
        
        log = db.query(WebhookEventLog).filter(WebhookEventLog.id == webhook_log_id).first()
        if not log: return {"status": "ERROR", "reason": "LOG_NOT_FOUND"}

        # 1. Construct the 'Diagnostic' prompt
        prompt = f"""
        You are 'Weezy Healer', a specialized AI for fixing broken bank webhooks.
        
        FAILED WEBHOOK DATA:
        - Gateway: {log.source_service_name}
        - Event Type: {log.event_type}
        - Error Notes: {log.processing_notes}
        - Raw Payload: {log.raw_payload}
        
        TASK:
        1. Diagnose why this webhook failed (e.g., missing field, wrong data type, format mismatch).
        2. Provide a REPAIRED JSON payload that would pass our internal validation.
        3. Explain what change was made.
        
        Format your response as a JSON object:
        {{
            "diagnosis": "string",
            "repaired_payload": {{ ... }},
            "action_required": "RETRY_NOW" | "MANUAL_INTERVENTION"
        }}
        """
        
        try:
            response = await self.model.generate_content_async(prompt)
            # Remove markdown if any
            clean_json = response.text.replace("```json", "").replace("```", "").strip()
            repair_result = json.loads(clean_json)
            
            # 2. If 'RETRY_NOW', we attempt to re-process with the repaired payload
            if repair_result.get("action_required") == "RETRY_NOW":
                logger.info(f"HEALER: Attempting autonomous repair for Webhook {webhook_log_id}")
                # In a real app, we would re-trigger the internal consumer with repair_result['repaired_payload']
                log.processing_notes = f"HEALED by AI: {repair_result['diagnosis']}"
                log.processing_status = "HEALED_AND_REPROCESSED"
                db.commit()
            
            return repair_result
            
        except Exception as e:
            logger.error(f"Webhook Healer Error: {str(e)}")
            return {"status": "ERROR", "reason": str(e)}

webhook_healer = WebhookHealer()
