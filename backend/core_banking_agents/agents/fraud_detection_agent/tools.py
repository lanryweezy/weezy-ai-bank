# Tools for Fraud Detection Agent

from crewai.tools import tool
from typing import Dict, Any, List, Optional
import random
import logging
import torch
from sentence_transformers import SentenceTransformer
from .manifold_model import SovereignEncoder
from .leech_search import EmpireLeechEngine
import os
from datetime import datetime, timedelta, timezone

logger = logging.getLogger(__name__)

# --- Sovereign Manifold & Leech Engine Initialization ---
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
ST_MODEL = SentenceTransformer('all-MiniLM-L6-v2', device=DEVICE)
SOVEREIGN_ENCODER = SovereignEncoder().to(DEVICE)
LEECH_ENGINE = EmpireLeechEngine()

# Load weights (path relative to this file)
WEIGHTS_PATH = os.path.join(os.path.dirname(__file__), "sovereign_encoder_weights.pth")
if os.path.exists(WEIGHTS_PATH):
    SOVEREIGN_ENCODER.load_state_dict(torch.load(WEIGHTS_PATH, map_location=DEVICE, weights_only=True))
    SOVEREIGN_ENCODER.eval()
    logger.info("Sovereign Encoder weights loaded successfully in Fraud Detection Agent.")
    
    # Pre-register known high-value fraud patterns into the O(1) Leech Knowledge Base
    fraud_patterns = [
        "Fix your NIN now or account block",
        "Urgent: Verify your OTP to prevent suspension",
        "Send 5k naira for emergency medical bill",
        "Win 50k prize, click link to claim",
        "Account upgrade required, provide login details"
    ]
    for pattern in fraud_patterns:
        LEECH_ENGINE.register_fraud_pattern(pattern, SOVEREIGN_ENCODER, ST_MODEL)
    logger.info(f"Registered {len(fraud_patterns)} fraud patterns in O(1) Leech Knowledge Base.")
else:
    logger.warning(f"Sovereign Encoder weights not found at {WEIGHTS_PATH}. Manifold screening will be degraded.")

@tool("SovereignManifoldTool")
def sovereign_manifold_tool(transaction_description: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Uses the Sovereign Manifold Encoder (24D) and Leech Lattice O(1) Search 
    to screen transaction descriptions for cultural fraud patterns.

    Args:
        transaction_description (str): The narrative or note attached to the transaction.
        metadata (Optional[Dict[str, Any]]): Additional context (beneficiary info, etc.)

    Returns:
        Dict[str, Any]: Manifold analysis including 'manifold_risk_score' (0-1) and 'detected_pattern'.
    """
    logger.info(f"SovereignManifoldTool: Screening narrative: '{transaction_description}'")
    
    # 1. Generate 384D Embedding
    emb_384 = ST_MODEL.encode([transaction_description], convert_to_tensor=True).to(torch.float32)
    
    # 2. Project to 24D Sovereign Manifold
    with torch.no_grad():
        proj_24, resid = SOVEREIGN_ENCODER(emb_384)
    
    proj_24_np = proj_24.cpu().numpy()[0]
    
    # 3. O(1) Leech Lattice Search
    is_match, matched_pattern = LEECH_ENGINE.instant_check(proj_24_np)
    
    highest_risk = 0.0
    detected_pattern = "Clear"
    
    if is_match:
        highest_risk = 0.95
        detected_pattern = f"LEECH_MATCH: {matched_pattern}"
    else:
        # Fallback to heuristic/semantic red flags if no direct lattice hit
        red_flags = ["urgent", "block", "NIN", "sharp sharp", "send am", "verify", "OTP"]
        if any(flag in transaction_description.lower() for flag in red_flags):
            highest_risk = 0.65 

    # 4. Residual Precision check: Nuance detection
    resid_norm = torch.norm(resid).item()
    if resid_norm > 1.8: # Very high nuance difference (adversarial?)
        highest_risk = min(highest_risk + 0.15, 1.0)

    return {
        "manifold_risk_score": round(highest_risk, 3),
        "detected_pattern": detected_pattern,
        "residual_entropy": round(resid_norm, 4),
        "manifold_dimension": 24,
        "status": "Success"
    }

# --- Mock Data for Tools ---
MOCK_CUSTOMER_PROFILES = {
    "CUST-SAFE-001": {
        "avg_txn_amount_ngn": 15000.00,
        "usual_countries": ["NG"],
        "usual_channels": ["MobileApp", "WebApp"],
        "last_txn_timestamp": (datetime.utcnow() - timedelta(days=1)).isoformat(),
        "is_new_device_behavior": False, # Simulates if current device is unusual
        "high_risk_beneficiary_count_last_30d": 0,
        "successful_logins_last_7d": 5,
        "failed_logins_last_24h": 0,
    },
    "CUST-RISKY-002": {
        "avg_txn_amount_ngn": 250000.00, # Higher avg
        "usual_countries": ["NG", "GB", "US"], # International
        "usual_channels": ["WebApp", "ThirdPartyAPI"],
        "last_txn_timestamp": (datetime.utcnow() - timedelta(hours=2)).isoformat(),
        "is_new_device_behavior": True,
        "high_risk_beneficiary_count_last_30d": 2,
        "successful_logins_last_7d": 20, # High activity
        "failed_logins_last_24h": 3, # Some failed attempts
    },
    "CUST-DORMANT-003": {
        "avg_txn_amount_ngn": 5000.00,
        "usual_countries": ["NG"],
        "usual_channels": ["USSD"],
        "last_txn_timestamp": (datetime.utcnow() - timedelta(days=90)).isoformat(), # Dormant
        "is_new_device_behavior": False,
        "high_risk_beneficiary_count_last_30d": 0,
        "successful_logins_last_7d": 1,
        "failed_logins_last_24h": 0,
    }
}

MOCK_FRAUD_RULES = [
    {"rule_id": "VELOCITY_001", "rule_name": "High Transaction Velocity", "description": "More than 5 transactions in the last hour.", "score_impact": 20},
    {"rule_id": "AMOUNT_001", "rule_name": "Unusually High Transaction Amount", "description": "Transaction amount > 5x customer's average.", "score_impact": 30},
    {"rule_id": "LOCATION_001", "rule_name": "Transaction from New/Unusual Country", "description": "Transaction country not in usual list for customer.", "score_impact": 25},
    {"rule_id": "LOCATION_003", "rule_name": "Transaction from Known High-Risk IP/Geolocation", "description": "IP address is on a watchlist or from a high-risk region.", "score_impact": 40},
    {"rule_id": "BENEF_001", "rule_name": "Transfer to New Beneficiary (High Value)", "description": "High value transfer to a beneficiary added recently.", "score_impact": 15},
    {"rule_id": "DEVICE_001", "rule_name": "Transaction from New Device", "description": "Device ID not seen before for this customer.", "score_impact": 10},
    {"rule_id": "DORMANT_001", "rule_name": "Activity on Dormant Account", "description": "Significant transaction on an account with no activity for >60 days.", "score_impact": 35},
]

@tool("TransactionProfileTool")
def transaction_profile_tool(customer_id: Optional[str] = None, account_number: Optional[str] = None) -> Dict[str, Any]:
    """
    Simulates fetching historical transaction profile and behavior for a customer or account.
    In a real system, this would query a data store or feature store.

    Args:
        customer_id (Optional[str]): The customer's unique identifier.
        account_number (Optional[str]): The account number.

    Returns:
        Dict[str, Any]: A dictionary containing the customer's profile data.
                        Returns an empty dict if no profile is found or inputs are missing.
    """
    # In a real system, you might prioritize customer_id, then lookup account_number if needed, or vice-versa.
    profile_key = customer_id or account_number # Simplified lookup for mock

    if not profile_key:
        logger.warning("TransactionProfileTool: customer_id or account_number must be provided.")
        return {"status": "Error", "message": "Customer/Account identifier missing."}

    logger.info(f"TransactionProfileTool: Fetching profile for identifier '{profile_key}'")

    profile = MOCK_CUSTOMER_PROFILES.get(profile_key)
    if profile:
        return {"status": "Success", "profile_found": True, "profile_data": profile}
    else:
        logger.info(f"TransactionProfileTool: No profile found for '{profile_key}'. Returning default/new customer profile.")
        # Simulate a default profile for a new or unknown customer
        return {
            "status": "Success",
            "profile_found": False, # Indicate it's a default/new profile
            "profile_data": {
                "avg_txn_amount_ngn": 0, "usual_countries": ["NG"], "usual_channels": [],
                "last_txn_timestamp": None, "is_new_device_behavior": True,
                "high_risk_beneficiary_count_last_30d": 0,
                "successful_logins_last_7d": 0, "failed_logins_last_24h": 0,
            }
        }

@tool("RuleEngineTool")
def rule_engine_tool(transaction_event: Dict[str, Any], customer_profile: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Simulates checking a transaction against a predefined set of fraud rules.

    Args:
        transaction_event (Dict[str, Any]): The transaction data (parsed from TransactionEventInput).
        customer_profile (Optional[Dict[str, Any]]): The customer's historical profile data from TransactionProfileTool.

    Returns:
        Dict[str, Any]: A dictionary with 'triggered_rules': List of rules that matched.
                        Each rule dict has 'rule_id', 'rule_name', 'score_impact'.
    """
    logger.info(f"RuleEngineTool: Applying rules to transaction_id '{transaction_event.get('transaction_id')}'")
    triggered_rules: List[Dict[str, Any]] = []
    profile_data = (customer_profile or {}).get("profile_data") or {}

    # Rule 1: High Value Transaction (AMOUNT_001)
    avg_amount = profile_data.get("avg_txn_amount_ngn", 0)
    if avg_amount > 0 and transaction_event.get("amount", 0) > 5 * avg_amount:
        triggered_rules.append(next(rule for rule in MOCK_FRAUD_RULES if rule["rule_id"] == "AMOUNT_001"))

    # Rule 2: Transaction from New/Unusual Country (LOCATION_001)
    geo_info = transaction_event.get("geolocation_info") or {}
    tx_country = geo_info.get("country_code")
    if tx_country and tx_country not in profile_data.get("usual_countries", ["NG"]):
        triggered_rules.append(next(rule for rule in MOCK_FRAUD_RULES if rule["rule_id"] == "LOCATION_001"))

    # Rule 3: Transaction from Known High-Risk IP/Geolocation (LOCATION_003)
    if geo_info.get("city") == "RiskyVille":
         triggered_rules.append(next(rule for rule in MOCK_FRAUD_RULES if rule["rule_id"] == "LOCATION_003"))

    # Rule 4: Transfer to New Beneficiary (High Value) (BENEF_001)
    metadata = transaction_event.get("metadata") or {}
    if transaction_event.get("transaction_type", "").lower().startswith("transfer") and \
       transaction_event.get("amount", 0) > 200000 and \
       metadata.get("beneficiary_added_recently", False):
        triggered_rules.append(next(rule for rule in MOCK_FRAUD_RULES if rule["rule_id"] == "BENEF_001"))

    # Rule 5: Transaction from New Device (DEVICE_001)
    if profile_data.get("is_new_device_behavior", False) or metadata.get("is_new_device_for_customer", False):
         triggered_rules.append(next(rule for rule in MOCK_FRAUD_RULES if rule["rule_id"] == "DEVICE_001"))

    # Rule 6: Activity on Dormant Account (DORMANT_001)
    last_txn_ts_str = profile_data.get("last_txn_timestamp")
    if last_txn_ts_str:
        last_txn_dt = datetime.fromisoformat(last_txn_ts_str.replace("Z", "+00:00")) 
        if not last_txn_dt.tzinfo:
            last_txn_dt = last_txn_dt.replace(tzinfo=timezone.utc)
        if (datetime.now(timezone.utc) - last_txn_dt).days > 60 and transaction_event.get("amount",0) > 10000: # Dormant if >60 days
            triggered_rules.append(next(rule for rule in MOCK_FRAUD_RULES if rule["rule_id"] == "DORMANT_001"))


    logger.info(f"RuleEngineTool: {len(triggered_rules)} rules triggered for transaction '{transaction_event.get('transaction_id')}'.")
    return {"triggered_rules": triggered_rules}


@tool("AnomalyDetectionTool")
def anomaly_detection_tool(transaction_event: Dict[str, Any], customer_profile: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Simulates an ML model providing an anomaly score for the transaction.

    Args:
        transaction_event (Dict[str, Any]): The transaction data.
        customer_profile (Optional[Dict[str, Any]]): The customer's profile data.

    Returns:
        Dict[str, Any]: With 'anomaly_score' (float 0-1) and 'contributing_factors' (List[str]).
    """
    logger.info(f"AnomalyDetectionTool: Scoring transaction_id '{transaction_event.get('transaction_id')}'")

    score = random.uniform(0.01, 0.99) # Random score for mock
    factors: List[str] = []

    amount = transaction_event.get("amount", 0)
    profile_data = (customer_profile or {}).get("profile_data") or {}
    avg_amount = profile_data.get("avg_txn_amount_ngn", 1) # Avoid div by zero

    geo_info = transaction_event.get("geolocation_info") or {}
    metadata = transaction_event.get("metadata") or {}

    if amount > 10 * avg_amount:
        factors.append("Amount significantly higher than average.")
        score = max(score, 0.7) # Boost score
    if geo_info.get("country_code") != "NG" and "NG" in profile_data.get("usual_countries", ["NG"]):
        factors.append("Transaction from international location, unusual for customer.")
        score = max(score, 0.6)
    if profile_data.get("is_new_device_behavior"):
        factors.append("Transaction from a device not typically associated with the customer.")
        score = max(score, 0.5)
    if not factors:
        factors.append("General transaction pattern analysis.")
        if score < 0.3: factors.append("Transaction appears normal based on ML model.")

    return {"anomaly_score": round(score, 3), "contributing_factors": factors, "model_version": "MockAnomalyNet_v2.1"}


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    print("--- Testing FraudDetectionAgent Tools ---")

    sample_customer_id = "CUST-SAFE-001"
    sample_risky_customer_id = "CUST-RISKY-002"

    print("\n1. Testing TransactionProfileTool:")
    profile1 = transaction_profile_tool.run({"customer_id": sample_customer_id})
    print(f"  Profile for {sample_customer_id}: Found={profile1.get('profile_found')}, AvgAmount={profile1.get('profile_data',{}).get('avg_txn_amount_ngn')}")
    profile2 = transaction_profile_tool.run({"customer_id": "CUST-UNKNOWN-999"})
    print(f"  Profile for UNKNOWN: Found={profile2.get('profile_found')}, IsNewDevice={profile2.get('profile_data',{}).get('is_new_device_behavior')}")

    print("\n2. Testing RuleEngineTool:")
    # Event that should trigger some rules for CUST-SAFE-001
    event_safe_high_value = {
        "transaction_id": "TRN001", "amount": 200000, "customer_id": sample_customer_id,
        "geolocation_info": {"country_code": "NG"},
        "metadata": {"beneficiary_added_recently": True} # New beneficiary for high value
    }
    rules_res1 = rule_engine_tool.run({"transaction_event": event_safe_high_value, "customer_profile": profile1})
    print(f"  Rules for SafeCustHighVal: {len(rules_res1['triggered_rules'])} triggered. IDs: {[r['rule_id'] for r in rules_res1['triggered_rules']]}")

    # Event from risky customer, new device, unusual country for them (if profile says NG only)
    event_risky_foreign = {
        "transaction_id": "TRN002", "amount": 50000, "customer_id": sample_risky_customer_id,
        "geolocation_info": {"country_code": "US", "city": "RiskyVille"}, # RiskyVille should trigger LOCATION_003
        "metadata": {"is_new_device_for_customer": True} # Should trigger DEVICE_001
    }
    profile_risky = transaction_profile_tool.run({"customer_id": sample_risky_customer_id})
    # Temporarily modify risky profile to make US unusual for this test run
    if profile_risky.get('profile_data'): profile_risky['profile_data']['usual_countries'] = ['NG']

    rules_res2 = rule_engine_tool.run({"transaction_event": event_risky_foreign, "customer_profile": profile_risky})
    print(f"  Rules for RiskyCustForeign: {len(rules_res2['triggered_rules'])} triggered. IDs: {[r['rule_id'] for r in rules_res2['triggered_rules']]}")

    print("\n3. Testing AnomalyDetectionTool:")
    anomaly_res1 = anomaly_detection_tool.run({"transaction_event": event_safe_high_value, "customer_profile": profile1})
    print(f"  Anomaly for SafeCustHighVal: Score={anomaly_res1['anomaly_score']}, Factors: {anomaly_res1['contributing_factors']}")

    anomaly_res2 = anomaly_detection_tool.run({"transaction_event": event_risky_foreign, "customer_profile": profile_risky}) # Using the modified profile_risky
    print(f"  Anomaly for RiskyCustForeign: Score={anomaly_res2['anomaly_score']}, Factors: {anomaly_res2['contributing_factors']}")

    print("\nFraud Detection Agent tools implemented with mocks.")
