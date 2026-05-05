import xml.etree.ElementTree as ET
from datetime import datetime
import uuid
from typing import Dict, Any, Optional

class NIPMessageFormatter:
    """
    Handles the generation and parsing of ISO-20022 compliant XML messages
    for NIBSS Instant Payments (NIP).
    """

    @staticmethod
    def format_name_enquiry_request(bank_code: str, account_number: str, channel_code: str = "1") -> str:
        """
        Generates the XML for a NIP Name Enquiry Request.
        """
        root = ET.Element("NameEnquiryRequest")
        ET.SubElement(root, "SessionID").text = f"999{datetime.now().strftime('%y%m%d%H%M%S')}{uuid.uuid4().hex[:12].upper()}"
        ET.SubElement(root, "DestinationInstitutionCode").text = bank_code
        ET.SubElement(root, "AccountNumber").text = account_number
        ET.SubElement(root, "ChannelCode").text = channel_code
        
        return ET.tostring(root, encoding='unicode', method='xml')

    @staticmethod
    def parse_name_enquiry_response(xml_data: str) -> Dict[str, Any]:
        """
        Parses the XML response from a NIP Name Enquiry.
        """
        try:
            root = ET.fromstring(xml_data)
            return {
                "session_id": root.findtext("SessionID"),
                "account_name": root.findtext("AccountName"),
                "account_number": root.findtext("AccountNumber"),
                "bank_code": root.findtext("DestinationInstitutionCode"),
                "response_code": root.findtext("ResponseCode"),
                "status": "success" if root.findtext("ResponseCode") == "00" else "error"
            }
        except Exception as e:
            return {"status": "error", "message": f"XML Parsing Error: {str(e)}"}

    @staticmethod
    def format_funds_transfer_request(
        session_id: str,
        name_enquiry_ref: str,
        source_account: str,
        source_name: str,
        dest_account: str,
        dest_name: str,
        bank_code: str,
        amount: float,
        narration: str,
        channel_code: str = "1"
    ) -> str:
        """
        Generates the XML for a NIP Funds Transfer Request (Credit Advertisement).
        """
        root = ET.Element("FTRequest")
        ET.SubElement(root, "SessionID").text = session_id
        ET.SubElement(root, "NameEnquiryRef").text = name_enquiry_ref
        ET.SubElement(root, "ChannelCode").text = channel_code
        ET.SubElement(root, "Amount").text = f"{amount:.2f}"
        ET.SubElement(root, "DestinationInstitutionCode").text = bank_code
        ET.SubElement(root, "BeneficiaryAccountName").text = dest_name
        ET.SubElement(root, "BeneficiaryAccountNumber").text = dest_account
        ET.SubElement(root, "OriginatorAccountName").text = source_name
        ET.SubElement(root, "OriginatorAccountNumber").text = source_account
        ET.SubElement(root, "Narration").text = narration
        ET.SubElement(root, "PaymentReference").text = f"WZY-{uuid.uuid4().hex[:12].upper()}"
        
        return ET.tostring(root, encoding='unicode', method='xml')

    @staticmethod
    def parse_funds_transfer_response(xml_data: str) -> Dict[str, Any]:
        """
        Parses the XML response from a NIP Funds Transfer.
        """
        try:
            root = ET.fromstring(xml_data)
            return {
                "session_id": root.findtext("SessionID"),
                "response_code": root.findtext("ResponseCode"),
                "transaction_reference": root.findtext("PaymentReference"),
                "status": "success" if root.findtext("ResponseCode") == "00" else "error"
            }
        except Exception as e:
            return {"status": "error", "message": f"XML Parsing Error: {str(e)}"}
