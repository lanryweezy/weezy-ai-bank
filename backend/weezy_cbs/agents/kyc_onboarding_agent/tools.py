from langchain_core.tools import tool

@tool
def document_verification_tool(document_text: str, customer_name: str) -> dict:
    """
    Verifies a customer's identification document.
    """
    # In a real system, this would involve more sophisticated checks.
    # For now, we'll just check for the presence of the customer's name.
    if customer_name.lower() in document_text.lower():
        return {"status": "success", "message": "Document verified successfully."}
    else:
        return {"status": "failed", "message": "Document verification failed."}
