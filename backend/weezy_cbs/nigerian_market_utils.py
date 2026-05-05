import decimal
import random
import string
import logging
import asyncio
import uuid
from datetime import datetime
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class NigerianMarketUtils:
    """
    Utilities specifically for the Nigerian Banking Market.
    Includes NUBAN generation, BVN/NIN validation logic, and local tax (VAT/Stamp Duty).
    """

    NIGERIAN_BANKS = [
        {"name": "Access Bank", "code": "044"},
        {"name": "Citibank Nigeria", "code": "023"},
        {"name": "Ecobank Nigeria", "code": "050"},
        {"name": "Fidelity Bank", "code": "070"},
        {"name": "First Bank of Nigeria", "code": "011"},
        {"name": "First City Monument Bank", "code": "214"},
        {"name": "Guaranty Trust Bank", "code": "058"},
        {"name": "Heritage Bank", "code": "030"},
        {"name": "Keystone Bank", "code": "082"},
        {"name": "Polaris Bank", "code": "076"},
        {"name": "Providus Bank", "code": "101"},
        {"name": "Stanbic IBTC Bank", "code": "039"},
        {"name": "Standard Chartered Bank", "code": "068"},
        {"name": "Sterling Bank", "code": "030"},
        {"name": "Suntrust Bank", "code": "100"},
        {"name": "Union Bank of Nigeria", "code": "032"},
        {"name": "United Bank for Africa", "code": "033"},
        {"name": "Unity Bank", "code": "215"},
        {"name": "Wema Bank", "code": "035"},
        {"name": "Zenith Bank", "code": "057"},
        {"name": "OPay (Digital)", "code": "999992"},
        {"name": "Moniepoint (Digital)", "code": "50515"},
        {"name": "Kuda Microfinance Bank", "code": "50211"},
    ]

    @staticmethod
    def get_bank_name(bank_code: str) -> str:
        for bank in NigerianMarketUtils.NIGERIAN_BANKS:
            if bank["code"] == bank_code:
                return bank["name"]
        return "Unknown Bank"

    @staticmethod
    def get_ussd_bank_list(page: int = 1) -> str:
        """Returns a string formatted for USSD bank selection."""
        start = (page - 1) * 5
        end = start + 5
        subset = NigerianMarketUtils.NIGERIAN_BANKS[start:end]
        
        menu = ""
        for i, bank in enumerate(subset):
            menu += f"{i+1}. {bank['name']}\n"
        
        if len(NigerianMarketUtils.NIGERIAN_BANKS) > end:
            menu += "9. Next Page"
            
        return menu

    @staticmethod
    async def nip_name_enquiry(bank_code: str, account_number: str) -> Dict[str, Any]:
        """
        Executes a NIP Name Enquiry using ISO-20022 XML standards.
        """
        from .nip_protocol_handler import NIPMessageFormatter
        
        if len(account_number) != 10:
            return {"status": "error", "message": "Invalid Account Number"}
        
        # 1. Format Request XML
        request_xml = NIPMessageFormatter.format_name_enquiry_request(bank_code, account_number)
        logger.info(f"NIP: Outgoing Name Enquiry XML: {request_xml}")
        
        # 2. Simulate External Call & Response XML
        # In production, this would be an HTTP POST to NIBSS
        response_xml = f"""
        <NameEnquiryResponse>
            <SessionID>999{datetime.now().strftime('%y%m%d%H%M%S')}MOCK</SessionID>
            <AccountName>SULAIMAN OLANREWAJU ADEBAYO</AccountName>
            <AccountNumber>{account_number}</AccountNumber>
            <DestinationInstitutionCode>{bank_code}</DestinationInstitutionCode>
            <ResponseCode>00</ResponseCode>
        </NameEnquiryResponse>
        """
        
        # 3. Parse Response
        return NIPMessageFormatter.parse_name_enquiry_response(response_xml)

    @staticmethod
    async def nip_outbound_transfer(
        source_account: str,
        source_name: str,
        dest_bank_code: str, 
        dest_account: str, 
        dest_name: str,
        amount: decimal.Decimal,
        narration: str,
        name_enquiry_ref: str
    ) -> Dict[str, Any]:
        """
        Executes a NIP Funds Transfer using ISO-20022 XML standards.
        """
        from .nip_protocol_handler import NIPMessageFormatter
        
        # 1. Format Request XML
        session_id = f"999{datetime.now().strftime('%y%m%d%H%M%S')}{uuid.uuid4().hex[:12].upper()}"
        request_xml = NIPMessageFormatter.format_funds_transfer_request(
            session_id=session_id,
            name_enquiry_ref=name_enquiry_ref,
            source_account=source_account,
            source_name=source_name,
            dest_account=dest_account,
            dest_name=dest_name,
            bank_code=dest_bank_code,
            amount=float(amount),
            narration=narration
        )
        logger.info(f"NIP: Outgoing Funds Transfer XML: {request_xml}")
        
        # 2. Simulate NIBSS Processing Delay
        await asyncio.sleep(1)
        
        # 3. Simulate Response XML
        response_xml = f"""
        <FTResponse>
            <SessionID>{session_id}</SessionID>
            <ResponseCode>00</ResponseCode>
            <PaymentReference>WZY-{uuid.uuid4().hex[:12].upper()}</PaymentReference>
        </FTResponse>
        """
        
        # 4. Parse Response
        return NIPMessageFormatter.parse_funds_transfer_response(response_xml)

    @staticmethod
    def calculate_nuban_check_digit(bank_code: str, serial_number: str) -> int:
        """
        CBN NUBAN Algorithm.
        Bank Code (3 digits) + Serial (9 digits)
        Weights: 3, 7, 3, 3, 7, 3, 3, 7, 3, 3, 7, 3
        """
        if len(bank_code) != 3 or len(serial_number) != 9:
            raise ValueError("Bank code must be 3 digits and serial must be 9 digits")
        
        combined = bank_code + serial_number
        weights = [3, 7, 3, 3, 7, 3, 3, 7, 3, 3, 7, 3]
        
        total_sum = 0
        for i in range(12):
            total_sum += int(combined[i]) * weights[i]
            
        mod = total_sum % 10
        check_digit = 10 - mod
        return 0 if check_digit == 10 else check_digit

    @classmethod
    def generate_nuban(cls, bank_code: str = "999") -> str:
        """Generates a valid 10-digit NUBAN for a given bank code."""
        serial = ''.join(random.choices(string.digits, k=9))
        check_digit = cls.calculate_nuban_check_digit(bank_code, serial)
        return serial + str(check_digit)

    @staticmethod
    def calculate_stamp_duty(amount: decimal.Decimal) -> decimal.Decimal:
        """
        Nigerian Stamp Duty: N50 on all electronic transfers above N10,000.
        (Based on Finance Act guidelines)
        """
        if amount >= decimal.Decimal("10000"):
            return decimal.Decimal("50.00")
        return decimal.Decimal("0.00")

    @staticmethod
    def calculate_vat(fee_amount: decimal.Decimal) -> decimal.Decimal:
        """
        Nigerian Value Added Tax (VAT): 7.5% on service fees.
        """
        vat_rate = decimal.Decimal("0.075")
        return (fee_amount * vat_rate).quantize(decimal.Decimal("0.01"))

    @staticmethod
    async def verify_bvn(bvn: str) -> Dict[str, Any]:
        """
        Mocked BVN verification against NIBSS.
        In production, this would call the NIBSS BVN API.
        """
        if len(bvn) != 11 or not bvn.isdigit():
            return {"status": "error", "message": "Invalid BVN format"}
        
        # Simulated NIBSS Response
        return {
            "status": "success",
            "data": {
                "first_name": "SULAIMAN",
                "last_name": "ADEBAYO",
                "dob": "1990-01-01",
                "phone": "+2348137502933",
                "verification_id": "NIBSS-BVN-MOCK-12345"
            }
        }

    @staticmethod
    async def verify_nin(nin: str) -> Dict[str, Any]:
        """
        Mocked NIN verification against NIMC.
        In production, this would call the NIMC API.
        """
        if len(nin) != 11 or not nin.isdigit():
            return {"status": "error", "message": "Invalid NIN format"}
            
        return {
            "status": "success",
            "data": {
                "full_name": "Sulaiman Olanrewaju Adebayo",
                "status": "VERIFIED",
                "source": "NIMC"
            }
        }
