import decimal
import random
import string
import logging
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
    async def nip_name_enquiry(bank_code: str, account_number: str) -> Dict[str, Any]:
        """
        Simulates NIBSS NIP Name Enquiry.
        """
        if len(account_number) != 10:
            return {"status": "error", "message": "Invalid Account Number"}
        
        # Mock logic: return a name based on the account number
        # In a real app, this calls NIBSS NIP Soap/REST service
        return {
            "status": "success",
            "account_name": "SULAIMAN OLANREWAJU ADEBAYO",
            "account_number": account_number,
            "bank_code": bank_code,
            "bank_name": NigerianMarketUtils.get_bank_name(bank_code),
            "session_id": f"NIP-ENQ-{uuid.uuid4().hex[:12].upper()}"
        }

    @staticmethod
    async def nip_outbound_transfer(
        source_account: str, 
        dest_bank_code: str, 
        dest_account: str, 
        amount: decimal.Decimal,
        narration: str
    ) -> Dict[str, Any]:
        """
        Simulates NIBSS NIP Outbound Transfer.
        """
        # Simulated delay for inter-bank communication
        await asyncio.sleep(1)
        
        return {
            "status": "success",
            "response_code": "00", # Approved
            "response_message": "Transaction Approved",
            "transaction_reference": f"NIP-TXN-{uuid.uuid4().hex[:16].upper()}",
            "amount": amount,
            "session_id": f"NIP-SESS-{uuid.uuid4().hex[:12].upper()}"
        }

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
