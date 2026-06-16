import { WorkflowDefinitionInput } from '@/types/workflows';

export const NIGERIAN_BANKING_TEMPLATES: Record<string, WorkflowDefinitionInput> = {
  CBN_KYC_TIERING: {
    name: "CBN KYC Tiering & Onboarding",
    description: "Standardized 3-tier KYC flow following CBN regulations. Handles BVN/NIN verification and document auditing.",
    is_active: true,
    version: 1,
    definition_json: {
      start_step: "identity_verification",
      steps: [
        {
          name: "identity_verification",
          type: "agent_execution",
          description: "Verify BVN and NIN against national databases.",
          agent_core_logic_identifier: "onboarding_agent_v1",
          transitions: [
            { to: "tier_assessment", description: "Identity Confirmed" },
            { to: "manual_compliance_review", description: "Verification Failed" }
          ]
        },
        {
          name: "tier_assessment",
          type: "decision",
          description: "Assess customer tier based on provided data.",
          transitions: [
            { to: "tier_1_activation", description: "Low Value / Basic" },
            { to: "document_audit", description: "Medium/High Value" }
          ]
        },
        {
          name: "document_audit",
          type: "agent_execution",
          description: "AI Audit of Utility Bills and Gov IDs for Tier 2/3.",
          agent_core_logic_identifier: "document_agent_v1",
          transitions: [
            { to: "tier_3_activation", description: "Docs Verified" },
            { to: "manual_compliance_review", description: "Docs Flagged" }
          ]
        },
        {
          name: "manual_compliance_review",
          type: "human_review",
          description: "Compliance officer manual intervention for flagged accounts.",
          assigned_role: "COMPLIANCE_OFFICER",
          transitions: [
            { to: "tier_1_activation", description: "Approve as Tier 1" },
            { to: "rejection_node", description: "Reject Onboarding" }
          ]
        },
        {
          name: "tier_1_activation",
          type: "end",
          final_status: "approved",
          description: "Activate Tier 1 Account (₦50k limit)."
        },
        {
          name: "tier_3_activation",
          type: "end",
          final_status: "approved",
          description: "Activate Tier 3 Account (Unlimited)."
        },
        {
          name: "rejection_node",
          type: "end",
          final_status: "rejected",
          description: "Onboarding Rejected."
        }
      ]
    }
  },
  NIP_SETTLEMENT_RECONCILER: {
    name: "NIP Settlement Reconciler",
    description: "Automated reconciliation for NIBSS Instant Payments. Handles ambiguous transaction statuses.",
    is_active: true,
    version: 1,
    definition_json: {
      start_step: "fetch_nibss_status",
      steps: [
        {
          name: "fetch_nibss_status",
          type: "external_api_call",
          description: "Query NIBSS for the true status of the transaction session.",
          external_api_call_config: {
            url_template: "https://api.nibss-plc.com.ng/nip/status/{{context.session_id}}",
            method: "GET"
          },
          transitions: [
            { to: "analyze_discrepancy", description: "Data Fetched" }
          ]
        },
        {
          name: "analyze_discrepancy",
          type: "agent_execution",
          description: "AI Ledger Forensics to compare internal vs NIBSS state.",
          agent_core_logic_identifier: "reconciler_agent_v1",
          transitions: [
            { to: "auto_settle", description: "Resolution Found" },
            { to: "treasury_review", description: "Complex Mismatch" }
          ]
        },
        {
          name: "auto_settle",
          type: "agent_execution",
          description: "Execute automated ledger correction.",
          agent_core_logic_identifier: "ledger_agent_v1",
          transitions: [
            { to: "settlement_complete" }
          ]
        },
        {
          name: "treasury_review",
          type: "human_review",
          description: "Treasury head review for high-value settlement discrepancy.",
          assigned_role: "TREASURY_HEAD",
          transitions: [
            { to: "settlement_complete", description: "Manually Settle" }
          ]
        },
        {
          name: "settlement_complete",
          type: "end",
          final_status: "completed",
          description: "NIP Transaction Reconciled."
        }
      ]
    }
  },
  LOAN_DTI_ENFORCER: {
    name: "Loan DTI & Risk Enforcer",
    description: "Strict Debt-to-Income (DTI) enforcement and risk analysis for personal loans.",
    is_active: true,
    version: 1,
    definition_json: {
      start_step: "aggregate_financials",
      steps: [
        {
          name: "aggregate_financials",
          type: "agent_execution",
          description: "Pull CRC Credit Bureau and bank statements.",
          agent_core_logic_identifier: "credit_analyst_v1",
          transitions: [
            { to: "calculate_dti" }
          ]
        },
        {
          name: "calculate_dti",
          type: "decision",
          description: "Enforce 33.3% DTI rule per regulatory guidelines.",
          transitions: [
            { to: "ai_risk_scoring", description: "DTI < 33%" },
            { to: "auto_reject", description: "DTI > 33%" }
          ]
        },
        {
          name: "ai_risk_scoring",
          type: "agent_execution",
          description: "Deep neural risk scoring and repayment probability.",
          agent_core_logic_identifier: "risk_agent_v1",
          transitions: [
            { to: "disbursement_approval", description: "High Score" },
            { to: "credit_manager_review", description: "Borderline" }
          ]
        },
        {
          name: "credit_manager_review",
          type: "human_review",
          description: "Manual override by Credit Manager.",
          assigned_role: "CREDIT_MANAGER",
          transitions: [
            { to: "disbursement_approval", description: "Override Approve" },
            { to: "auto_reject", description: "Uphold Reject" }
          ]
        },
        {
          name: "disbursement_approval",
          type: "end",
          final_status: "approved",
          description: "Loan Approved for Disbursement."
        },
        {
          name: "auto_reject",
          type: "end",
          final_status: "rejected",
          description: "Loan Rejected due to High Risk/DTI."
        }
      ]
    }
  },
  NFIU_AML_MONITOR: {
    name: "AML/CFT Suspicious Activity Monitor (NFIU)",
    description: "Real-time Anti-Money Laundering monitor. Automatically flags transactions above ₦5M (Individual) or ₦10M (Corporate) for NFIU reporting.",
    is_active: true,
    version: 1,
    definition_json: {
      start_step: "threshold_check",
      steps: [
        {
          name: "threshold_check",
          type: "decision",
          description: "Check if transaction meets NFIU mandatory reporting threshold.",
          transitions: [
            { to: "sanction_scan", description: "Above Threshold" },
            { to: "behavioral_analysis", description: "Below Threshold" }
          ]
        },
        {
          name: "sanction_scan",
          type: "agent_execution",
          description: "Scan against UN, OFAC, and Nigerian Local Sanction Lists.",
          agent_core_logic_identifier: "aml_agent_v1",
          transitions: [
            { to: "nfiu_auto_report", description: "Sanction Match" },
            { to: "behavioral_analysis", description: "Clear" }
          ]
        },
        {
          name: "behavioral_analysis",
          type: "agent_execution",
          description: "Analyze for structuring (smurfing) or rapid movement of funds.",
          agent_core_logic_identifier: "fraud_brain_v1",
          transitions: [
            { to: "compliance_officer_review", description: "Anomalous" },
            { to: "standard_processing", description: "Benign" }
          ]
        },
        {
          name: "nfiu_auto_report",
          type: "external_api_call",
          description: "Direct secure transmission to NFIU goAML portal.",
          external_api_call_config: {
            url_template: "https://reports.nfiu.gov.ng/api/v1/sar",
            method: "POST"
          },
          transitions: [
            { to: "hold_funds" }
          ]
        },
        {
          name: "compliance_officer_review",
          type: "human_review",
          description: "Urgent AML review for flagged suspicious behavior.",
          assigned_role: "AML_COMPLIANCE_HEAD",
          transitions: [
            { to: "nfiu_auto_report", description: "Confirm SAR" },
            { to: "standard_processing", description: "False Positive" }
          ]
        },
        {
          name: "hold_funds",
          type: "end",
          final_status: "failed",
          description: "Funds Held for Investigation."
        },
        {
          name: "standard_processing",
          type: "end",
          final_status: "completed",
          description: "Compliance Verified."
        }
      ]
    }
  },
  NDIC_PREMIUM_CALCULATOR: {
    name: "NDIC Deposit Insurance Audit",
    description: "Automated calculation of NDIC premiums based on daily deposit balances and asset quality.",
    is_active: true,
    version: 1,
    definition_json: {
      start_step: "aggregate_deposits",
      steps: [
        {
          name: "aggregate_deposits",
          type: "agent_execution",
          description: "Calculate total insured vs uninsured deposits.",
          agent_core_logic_identifier: "accounting_agent_v1",
          transitions: [
            { to: "apply_premium_rate" }
          ]
        },
        {
          name: "apply_premium_rate",
          type: "decision",
          description: "Apply risk-based premium rating (DIF).",
          transitions: [
            { to: "generate_ndic_report" }
          ]
        },
        {
          name: "generate_ndic_report",
          type: "agent_execution",
          description: "Synthesize quarterly NDIC asset/liability report.",
          agent_core_logic_identifier: "regulatory_reporter_v1",
          transitions: [
            { to: "cfo_review" }
          ]
        },
        {
          name: "cfo_review",
          type: "human_review",
          description: "Final CFO sign-off on NDIC premium filing.",
          assigned_role: "CFO",
          transitions: [
            { to: "submission_complete" }
          ]
        },
        {
          name: "submission_complete",
          type: "end",
          final_status: "completed",
          description: "NDIC Filing Archived."
        }
      ]
    }
  }
};
