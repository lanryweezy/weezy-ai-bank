from sqlalchemy.orm import Session
from weezy_cbs.database import SessionLocal, engine
from weezy_cbs.ai_automation_layer import models, services
import uuid

def seed_agent_templates():
    db = SessionLocal()
    try:
        # Loan Checker Template
        loan_checker_id = "loan-checker-logic"
        existing = db.query(models.AIModelMetadata).filter(models.AIModelMetadata.source_identifier == loan_checker_id).first()
        if not existing:
            print(f"Seeding '{loan_checker_id}'...")
            template = models.AIModelMetadata(
                model_name="Loan Document & Basic Worthiness Checker",
                model_type=models.AIModelTypeEnum.LLM_TASK_AUTOMATION,
                version="1.0.0",
                description="Checks for required loan documents and evaluates basic worthiness rules.",
                source_type="INTERNAL_LOGIC",
                source_identifier=loan_checker_id,
                input_schema_json={
                    "type": "object",
                    "properties": {
                        "customer_id": {"type": "string"},
                        "requested_amount": {"type": "number"}
                    }
                },
                status=models.AIModelStatusEnum.ACTIVE
            )
            db.add(template)
        
        # Data Extractor Template
        extractor_id = "data-extractor-logic"
        existing = db.query(models.AIModelMetadata).filter(models.AIModelMetadata.source_identifier == extractor_id).first()
        if not existing:
            print(f"Seeding '{extractor_id}'...")
            template = models.AIModelMetadata(
                model_name="Data Extraction Agent",
                model_type=models.AIModelTypeEnum.OCR_DOCUMENT_PARSING,
                version="1.0.0",
                description="Extracts structured data from documents using AI.",
                source_type="INTERNAL_LOGIC",
                source_identifier=extractor_id,
                status=models.AIModelStatusEnum.ACTIVE
            )
            db.add(template)
            
        db.commit()
        print("Seeding complete.")
    except Exception as e:
        print(f"Error seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_agent_templates()
