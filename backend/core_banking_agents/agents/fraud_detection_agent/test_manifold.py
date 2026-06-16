import logging
import asyncio
import torch
import json
import os
import sys

# Add parent directory to path to allow relative imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "..")))

from core_banking_agents.agents.fraud_detection_agent.tools import sovereign_manifold_tool

async def test_manifold_direct():
    logging.basicConfig(level=logging.INFO)
    print("--- Testing Sovereign Manifold Tool Directly ---")
    
    test_cases = [
        "Send 5k naira sharp sharp",
        "NIN update urgent verify OTP",
        "Payment for groceries",
        "Gift for my mother",
        "Transfer to suspicious account for illegal mining"
    ]
    
    for text in test_cases:
        print(f"\nNarrative: '{text}'")
        res = sovereign_manifold_tool.run({"transaction_description": text})
        print(f"Result: {json.dumps(res, indent=2)}")

if __name__ == "__main__":
    asyncio.run(test_manifold_direct())
