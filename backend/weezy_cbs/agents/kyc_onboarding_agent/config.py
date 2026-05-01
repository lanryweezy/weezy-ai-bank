import os

class KycOnboardingConfig:
    API_KEY = os.environ.get("OPENAI_API_KEY", "your-default-api-key")
    MODEL_NAME = "gpt-4"
