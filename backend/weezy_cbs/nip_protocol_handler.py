import xml.etree.ElementTree as ET
from datetime import datetime
import uuid
from typing import Dict, Any, Optional

class NIPMessageFormatter:
    """
    Handles the generation and parsing of ISO-20022 compliant XML messages
    for NIBSS Instant Payments (NIP).
    """

    NIP_RESPONSE_CODES = {
        "00": "Approved or completed successfully",
        "01": "Status unknown, please wait for settlement report",
        "03": "Invalid Sender",
        "05": "Do not Honor",
        "06": "Error",
        "07": "Invalid Account",
        "08": "Invalid Batch",
        "09": "Request processing in progress",
        "12": "Invalid Transaction",
        "13": "Invalid Amount",
        "14": "Invalid Batch Number",
        "21": "No action taken",
        "25": "Unable to locate record",
        "26": "Duplicate record",
        "30": "Format Error",
        "34": "Suspected Fraud",
        "51": "Insufficient Funds",
        "57": "Transaction not permitted to sender",
        "58": "Transaction not permitted on terminal",
        "61": "Exceeds withdrawal limit",
        "63": "Security violation",
        "68": "Response received too late",
        "91": "Destination institution inoperative",
        "92": "Routing error",
        "94": "Duplicate transaction",
        "96": "System malfunction",
        "EE": "Ambiguous status, require manual reconciliation"
    }

    @staticmethod
    def format_status_inquiry_request(session_id: str, channel_code: str = "1") -> str:
        """
        Generates XML for NIP TS (Transaction Status) Inquiry.
        """
        root = ET.Element("TSQueryRequest")
        ET.SubElement(root, "SessionID").text = session_id
        ET.SubElement(root, "ChannelCode").text = channel_code
        return ET.tostring(root, encoding='unicode', method='xml')

    @staticmethod
    def parse_status_inquiry_response(xml_data: str) -> Dict[str, Any]:
        """
        Parses XML response from NIP TS Inquiry.
        """
        try:
            root = ET.fromstring(xml_data)
            response_code = root.findtext("ResponseCode")
            return {
                "session_id": root.findtext("SessionID"),
                "response_code": response_code,
                "status": "success" if response_code == "00" else "pending" if response_code in ["01", "09"] else "error",
                "message": NIPMessageFormatter.NIP_RESPONSE_CODES.get(response_code, "Unknown response code")
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
