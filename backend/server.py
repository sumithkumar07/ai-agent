from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from dotenv import load_dotenv
import uuid
from datetime import datetime
import re
import json
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
groq_client = Groq(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url=os.getenv("GROQ_BASE_URL", "https://api.groq.com")
)

# Smart Model Selection Configuration
MODEL_SELECTION_CONFIG = {
    "creative_tasks": "llama3-70b-8192",  # Creative writing, content generation
    "analysis_tasks": "mixtral-8x7b-32768",  # Data analysis, complex reasoning
    "fast_responses": "llama3-8b-8192",  # Quick responses, simple tasks
    "coding_tasks": "llama3-70b-8192",  # Code generation, technical tasks
    "conversation": "llama3-8b-8192",  # Multi-turn conversations
    "default": "llama3-8b-8192"
}

# Task Classification Keywords
TASK_KEYWORDS = {
    "creative_tasks": ["write", "create", "generate", "compose", "design", "brainstorm", "story", "content", "marketing", "blog"],
    "analysis_tasks": ["analyze", "compare", "evaluate", "assess", "examine", "study", "research", "review", "summarize", "insights"],
    "coding_tasks": ["code", "program", "develop", "build", "debug", "fix", "api", "function", "algorithm", "script"],
    "conversation": ["chat", "talk", "discuss", "conversation", "explain", "help", "assist"]
}

def classify_task_type(prompt: str) -> str:
    """Classify task type based on prompt content for smart model selection"""
    prompt_lower = prompt.lower()
    
    scores = {task_type: 0 for task_type in TASK_KEYWORDS}
    
    for task_type, keywords in TASK_KEYWORDS.items():
        for keyword in keywords:
            if keyword in prompt_lower:
                scores[task_type] += 1
    
    # Return task type with highest score, default to 'fast_responses'
    max_score_type = max(scores, key=scores.get)
    return max_score_type if scores[max_score_type] > 0 else "fast_responses"

def select_optimal_model(task_type: str, complexity_score: int = 1) -> str:
    """Select optimal Groq model based on task type and complexity"""
    base_model = MODEL_SELECTION_CONFIG.get(task_type, MODEL_SELECTION_CONFIG["default"])
    
    # Upgrade to more powerful model for complex tasks
    if complexity_score > 3:
        if base_model == "llama3-8b-8192":
            return "llama3-70b-8192"
        elif base_model == "llama3-70b-8192":
            return "mixtral-8x7b-32768"
    
    return base_model

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