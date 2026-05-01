from fastapi import FastAPI, HTTPException
from typing import List
from .schemas import Task, Agent
from .tasks import TaskName
from ..agents.kyc_onboarding_agent.main import KycOnboardingAgent

app = FastAPI()

# In-memory storage for tasks and agents
tasks: List[Task] = []
agents: List[Agent] = [
    Agent(id=1, name="kyc_onboarding_agent", description="Handles KYC and customer onboarding tasks.")
]

@app.post("/tasks/", response_model=Task)
async def create_task(task_name: TaskName, payload: dict):
    if task_name == TaskName.KYC_ONBOARDING:
        agent = next((a for a in agents if a.name == "kyc_onboarding_agent"), None)
        if agent:
            task_id = len(tasks) + 1
            new_task = Task(id=task_id, name=task_name, status="pending", agent_id=agent.id, payload=payload)
            tasks.append(new_task)
            # In a real system, this would be an async call
            kyc_agent = KycOnboardingAgent()
            result = kyc_agent.run(payload)
            new_task.status = result["status"]
            return new_task
    raise HTTPException(status_code=400, detail="Invalid task name")

@app.get("/tasks/", response_model=List[Task])
async def get_tasks():
    return tasks

@app.get("/agents/", response_model=List[Agent])
async def get_agents():
    return agents
