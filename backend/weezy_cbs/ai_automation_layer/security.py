import logging
import os
import json
import google.generativeai as genai
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from fastapi import Request

logger = logging.getLogger(__name__)

class DynamicAIRateLimiter:
    """
    AI-driven security middleware.
    Dynamically adjusts API rate limits based on real-time threat assessment.
    """
    
    def __init__(self):
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.model = None
            
        # Default limits
        self.user_limits = {} # {user_id: {"limit": 100, "expiry": ts}}

    async def assess_request_risk(self, request: Request, user_id: str, db_context: Dict[str, Any]) -> int:
        """
        Uses Gemini to determine a risk-based rate limit for the user.
        Normal: 100 req/min, Suspicious: 5 req/min, Dangerous: 0 req/min.
        """
        if not self.model: return 100

        # Gather signals
        client_ip = request.client.host
        user_agent = request.headers.get("user_agent", "unknown")
        path = request.url.path
        
        prompt = f"""
        You are 'Weezy Shield', an AI security analyst for a Nigerian Bank.
        Assess the risk of this request and return ONLY a numeric rate limit (req/min).
        
        SIGNALS:
        - User ID: {user_id}
        - IP: {client_ip}
        - Path: {path}
        - User Context: {json.dumps(db_context)}
        
        THREAT LOGIC:
        - If IP is from a high-fraud region and path is '/transfer', set limit to 2.
        - If user is Tier 1 and doing high-velocity reads, set limit to 10.
        - If everything looks normal, set limit to 100.
        """
        
        try:
            response = await self.model.generate_content_async(prompt)
            limit = int(response.text.strip())
            return limit
        except:
            return 100 # Fail safe to default

ai_rate_limiter = DynamicAIRateLimiter()
