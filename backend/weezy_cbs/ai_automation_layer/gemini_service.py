import os
import logging
import google.generativeai as genai
from typing import Dict, Any, Optional
from . import models

logger = logging.getLogger(__name__)

class GeminiAgentService:
    """
    Service responsible for executing AI Agent tasks using Google's Gemini API.
    """
    
    def __init__(self):
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-pro')
        else:
            logger.warning("GEMINI_API_KEY not found in environment. AI Agent calls will fail.")
            self.model = None

    async def execute_task(self, agent: models.AIAgentConfig, task: models.Task) -> Dict[str, Any]:
        """
        Executes a specific banking task using the configured agent's personality and Gemini.
        """
        if not self.model:
            return {"error": "AI Engine not configured", "status": "failed"}

        # Construct the prompt
        prompt = f"""
        You are an AI Banking Agent named {agent.agent_name}.
        Your role: {agent.role_description}
        Your goal: {agent.goal_description}
        
        Backstory: {agent.backstory or 'No specific backstory provided.'}
        
        Task: {task.step_name_in_workflow}
        Input Data: {task.input_data_json}
        
        Please process this data and provide a structured JSON response.
        Ensure your response includes a 'status' (e.g., 'success', 'needs_review', 'failed') 
         and a 'summary' of your findings.
        """

        try:
            # Call Gemini
            response = await self.model.generate_content_async(prompt)
            text = response.text
            
            # Simple heuristic to extract JSON if LLM wraps it in backticks
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].split("```")[0].strip()
            
            # Log the raw response for debugging
            logger.info(f"Gemini Response for {agent.agent_name}: {text}")
            
            # We would typically use a proper JSON parser here
            # For now, return the text or try to parse it
            return {"ai_output": text, "agent_name": agent.agent_name}
            
        except Exception as e:
            logger.error(f"Error calling Gemini for {agent.agent_name}: {str(e)}")
            return {"error": str(e), "status": "failed"}

gemini_agent_service = GeminiAgentService()
