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
            
        # Credit Risk Assessor Template
        credit_risk_id = "credit-risk-assessor-logic"
        existing = db.query(models.AIModelMetadata).filter(models.AIModelMetadata.source_identifier == credit_risk_id).first()
        if not existing:
            print(f"Seeding '{credit_risk_id}'...")
            template = models.AIModelMetadata(
                model_name="AI Credit Risk Assessor",
                model_type=models.AIModelTypeEnum.CREDIT_SCORING_ML,
                version="1.0.0",
                description="Analyzes transaction history and KYC tiers to predict default risk and suggest loan limits.",
                source_type="INTERNAL_LOGIC",
                source_identifier=credit_risk_id,
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

def seed_demo_workflow(db: Session):
    existing = db.query(models.Workflow).filter(models.Workflow.name == "Standard Loan Application").first()
    if not existing:
        print("Seeding Standard Loan Application Workflow...")
        
        # Get the agent template IDs
        checker_template = db.query(models.AIModelMetadata).filter(models.AIModelMetadata.source_identifier == "loan-checker-logic").first()
        risk_template = db.query(models.AIModelMetadata).filter(models.AIModelMetadata.source_identifier == "credit-risk-assessor-logic").first()
        
        # Create agents
        checker_agent = models.AIAgentConfig(
            agent_name="Document Verification Agent",
            template_id=checker_template.id if checker_template else None,
            role_description="Automated loan document verification",
            goal_description="Verify all documents are present and valid",
            is_active=True
        )
        db.add(checker_agent)
        
        risk_agent = models.AIAgentConfig(
            agent_name="Credit Risk Analysis Agent",
            template_id=risk_template.id if risk_template else None,
            role_description="Senior Credit Risk Analyst for the Nigerian Market",
            goal_description="Analyze transaction history to determine credit worthiness, calculate debt-to-income ratio, and approve/reject loan requests based on CBN guidelines.",
            backstory="You are an expert in the Nigerian financial sector. You understand the nuances of NUBAN activity, salary inflows, and common default patterns in the region.",
            is_active=True
        )
        db.add(risk_agent)
        db.flush()
        
        definition = {
            "steps": [
                {
                    "name": "document_verification",
                    "type": "agent_execution",
                    "agent_id": str(checker_agent.id)
                },
                {
                    "name": "ai_credit_scoring",
                    "type": "agent_execution",
                    "agent_id": str(risk_agent.id)
                },
                {
                    "name": "credit_analyst_review",
                    "type": "human_review",
                    "assigned_role": "credit_analyst"
                },
                {
                    "name": "final_disbursement",
                    "type": "agent_execution",
                    "agent_id": str(checker_agent.id) # Reusing checker as a simple automated executor for now
                }
            ]
        }
        
        workflow = models.Workflow(
            name="Standard Loan Application",
            description="End-to-end automated loan process with AI credit scoring and human review.",
            definition_json=definition,
            is_active=True
        )
        db.add(workflow)
        db.commit()

if __name__ == "__main__":
    db = SessionLocal()
    seed_agent_templates()
    seed_demo_workflow(db)
    db.close()

