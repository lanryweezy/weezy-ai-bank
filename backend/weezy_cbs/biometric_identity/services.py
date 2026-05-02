import os
import json
import logging
import base64
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime
import google.generativeai as genai

from . import models, schemas
from weezy_cbs.customer_identity_management.models import Customer

logger = logging.getLogger(__name__)

class BiometricAIService:
    
    def __init__(self):
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            # Using Pro Vision capabilities for image analysis
            self.ai_model = genai.GenerativeModel('gemini-1.5-pro')
        else:
            self.ai_model = None

    async def perform_face_match(self, db: Session, request: schemas.FaceMatchRequest) -> Dict[str, Any]:
        """
        Uses Gemini Vision to compare a selfie against a government ID.
        Simulates high-integrity biometric verification for the Nigerian market.
        """
        if not self.ai_model:
            return {"status": "error", "message": "Biometric engine offline"}

        # 1. Prepare images for Gemini
        # (In a real app, we'd handle bytes directly, but for this simulation we use b64)
        try:
            selfie_part = {
                "mime_type": "image/jpeg",
                "data": base64.b64decode(request.selfie_b64.split(",")[-1]) if "," in request.selfie_b64 else base64.b64decode(request.selfie_b64)
            }
            doc_part = {
                "mime_type": "image/jpeg",
                "data": base64.b64decode(request.document_b64.split(",")[-1]) if "," in request.document_b64 else base64.b64decode(request.document_b64)
            }
        except Exception as e:
            return {"status": "error", "message": f"Image decoding failed: {str(e)}"}

        prompt = f"""
        You are 'Weezy Biometric Auditor'. 
        Task: Perform a Face Match between the two provided images (Selfie and Government ID).
        Document Type: {request.document_type.value}
        
        NIGERIAN COMPLIANCE:
        - Verify if the ID is a valid {request.document_type.value} (Nigerian NIN, License, or Passport).
        - Extract Name, DOB, and ID Number from the document.
        - Determine if the person in the selfie is the SAME person as in the ID.
        
        Respond ONLY with a structured JSON object:
        {{
          "match_confirmed": true/false,
          "confidence_score": 0.0-1.0,
          "extracted_data": {{
            "full_name": "string",
            "dob": "YYYY-MM-DD",
            "id_number": "string"
          }},
          "reasoning": "Brief explanation of match or mismatch",
          "id_validity": "VALID" | "SUSPICIOUS" | "EXPIRED"
        }}
        """

        try:
            # Call Gemini with two images
            response = await self.ai_model.generate_content_async([prompt, selfie_part, doc_part])
            result_text = response.text
            
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0].strip()
            
            report = json.loads(result_text)
            
            # 2. Update/Create Enrollment Record
            enrollment = db.query(models.BiometricEnrollment).filter(models.BiometricEnrollment.customer_id == request.customer_id).first()
            if not enrollment:
                enrollment = models.BiometricEnrollment(customer_id=request.customer_id)
                db.add(enrollment)
            
            enrollment.verification_status = models.BiometricVerificationStatusEnum.VERIFIED if report["match_confirmed"] else models.BiometricVerificationStatusEnum.MATCH_FAILED
            enrollment.face_match_confidence = report["confidence_score"]
            enrollment.document_type = request.document_type
            enrollment.document_number = report["extracted_data"].get("id_number")
            enrollment.ai_analysis_json = report
            
            if report["match_confirmed"]:
                enrollment.verified_at = datetime.utcnow()
                # Automatically upgrade customer tier if verified
                customer = db.query(Customer).filter(Customer.id == request.customer_id).first()
                if customer:
                    from weezy_cbs.customer_identity_management.models import CBNSupportedAccountTier
                    customer.account_tier = CBNSupportedAccountTier.TIER_3
            
            db.commit()
            return report

        except Exception as e:
            logger.error(f"Biometric AI Error: {str(e)}")
            return {"status": "error", "message": "AI analysis failed during face match."}

biometric_service = BiometricAIService()
