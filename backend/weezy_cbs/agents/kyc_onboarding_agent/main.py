from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate
from .tools import document_verification_tool
from .config import KycOnboardingConfig

class KycOnboardingAgent:
    def __init__(self):
        self.llm = ChatOpenAI(api_key=KycOnboardingConfig.API_KEY, model_name=KycOnboardingConfig.MODEL_NAME)
        self.tools = [document_verification_tool]
        self.prompt = ChatPromptTemplate.from_messages(
            [
                ("system", "You are a helpful KYC onboarding assistant."),
                ("human", "{input}"),
                ("placeholder", "{agent_scratchpad}"),
            ]
        )
        self.agent = create_tool_calling_agent(self.llm, self.tools, self.prompt)
        self.agent_executor = AgentExecutor(agent=self.agent, tools=self.tools)

    def run(self, payload: dict):
        customer_name = payload.get("customer_name")
        document_text = payload.get("document_text")

        if not customer_name or not document_text:
            return {"status": "failed", "message": "Missing customer name or document text."}

        input_data = {
            "input": f"Verify the following document for customer: {customer_name}\n\nDocument text:\n{document_text}"
        }

        response = self.agent_executor.invoke(input_data)

        # In a real system, we would parse the response and update the task status accordingly.
        # For now, we'll just return a success message.
        return {"status": "completed", "message": "KYC process completed.", "agent_response": response}
