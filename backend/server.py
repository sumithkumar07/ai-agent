from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
import uuid
from datetime import datetime
from groq import Groq

load_dotenv()

app = FastAPI(title="Agentic AI Platform")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
client = AsyncIOMotorClient(os.getenv("MONGO_URL"))
db = client.agentic_ai

# Groq client setup
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Pydantic models
class Agent(BaseModel):
    id: str
    name: str
    description: str
    system_prompt: str
    model: str = "llama3-8b-8192"
    status: str = "active"
    created_at: datetime
    tasks_completed: int = 0

class Task(BaseModel):
    id: str
    agent_id: str
    prompt: str
    response: Optional[str] = None
    status: str = "pending"
    created_at: datetime
    completed_at: Optional[datetime] = None

class CreateAgentRequest(BaseModel):
    name: str
    description: str
    system_prompt: str
    model: str = "llama3-8b-8192"

class CreateTaskRequest(BaseModel):
    agent_id: str
    prompt: str

@app.get("/")
async def root():
    return {"message": "Agentic AI Platform API"}

@app.get("/api/agents")
async def get_agents():
    agents = []
    async for agent in db.agents.find():
        agent["_id"] = str(agent["_id"])
        agents.append(agent)
    return agents

@app.post("/api/agents")
async def create_agent(request: CreateAgentRequest):
    agent = Agent(
        id=str(uuid.uuid4()),
        name=request.name,
        description=request.description,
        system_prompt=request.system_prompt,
        model=request.model,
        created_at=datetime.utcnow()
    )
    
    await db.agents.insert_one(agent.dict())
    return agent

@app.get("/api/agents/{agent_id}")
async def get_agent(agent_id: str):
    agent = await db.agents.find_one({"id": agent_id})
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    agent["_id"] = str(agent["_id"])
    return agent

@app.post("/api/agents/{agent_id}/tasks")
async def create_task(agent_id: str, request: CreateTaskRequest):
    # Check if agent exists
    agent = await db.agents.find_one({"id": agent_id})
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    task = Task(
        id=str(uuid.uuid4()),
        agent_id=agent_id,
        prompt=request.prompt,
        status="processing",
        created_at=datetime.utcnow()
    )
    
    # Insert task first
    await db.tasks.insert_one(task.dict())
    
    try:
        # Execute task with Groq
        response = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": agent["system_prompt"]},
                {"role": "user", "content": request.prompt}
            ],
            model=agent["model"]
        )
        
        task_response = response.choices[0].message.content
        
        # Update task with response
        await db.tasks.update_one(
            {"id": task.id},
            {
                "$set": {
                    "response": task_response,
                    "status": "completed",
                    "completed_at": datetime.utcnow()
                }
            }
        )
        
        # Update agent task count
        await db.agents.update_one(
            {"id": agent_id},
            {"$inc": {"tasks_completed": 1}}
        )
        
        task.response = task_response
        task.status = "completed"
        task.completed_at = datetime.utcnow()
        
        return task
        
    except Exception as e:
        # Update task with error
        await db.tasks.update_one(
            {"id": task.id},
            {
                "$set": {
                    "response": f"Error: {str(e)}",
                    "status": "failed",
                    "completed_at": datetime.utcnow()
                }
            }
        )
        raise HTTPException(status_code=500, detail=f"Task execution failed: {str(e)}")

@app.get("/api/agents/{agent_id}/tasks")
async def get_agent_tasks(agent_id: str):
    tasks = []
    async for task in db.tasks.find({"agent_id": agent_id}).sort("created_at", -1):
        task["_id"] = str(task["_id"])
        tasks.append(task)
    return tasks

@app.get("/api/tasks")
async def get_all_tasks():
    tasks = []
    async for task in db.tasks.find().sort("created_at", -1):
        task["_id"] = str(task["_id"])
        tasks.append(task)
    return tasks

@app.delete("/api/agents/{agent_id}")
async def delete_agent(agent_id: str):
    # Delete agent
    result = await db.agents.delete_one({"id": agent_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Delete associated tasks
    await db.tasks.delete_many({"agent_id": agent_id})
    
    return {"message": "Agent and associated tasks deleted"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)