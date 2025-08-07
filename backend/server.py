from fastapi import FastAPI, HTTPException, UploadFile, File, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from dotenv import load_dotenv
import uuid
from datetime import datetime, timedelta
import re
import json
from groq import Groq
import redis.asyncio as redis
import httpx
from bs4 import BeautifulSoup
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from fastapi.responses import Response
import psutil
import time

load_dotenv()

# Initialize metrics
REQUEST_COUNT = Counter('requests_total', 'Total requests', ['method', 'endpoint'])
REQUEST_DURATION = Histogram('request_duration_seconds', 'Request duration')
TASK_COUNT = Counter('tasks_total', 'Total tasks', ['status', 'model'])

app = FastAPI(title="Agentic AI Platform", description="Enhanced AI Platform with Performance & Features", version="2.1.0")

# Rate limiting setup
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Slow API middleware for rate limiting
app.add_middleware(SlowAPIMiddleware)

# MongoDB connection with optimization
client = AsyncIOMotorClient(
    os.getenv("MONGO_URL"),
    maxPoolSize=50,
    minPoolSize=5,
    maxIdleTimeMS=30000,
    serverSelectionTimeoutMS=5000,
)
db = client.agentic_ai

# Redis connection for caching
redis_client = None

async def get_redis():
    global redis_client
    if not redis_client:
        redis_client = redis.from_url(
            os.getenv("REDIS_URL", "redis://localhost:6379"),
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5,
        )
    return redis_client

# Groq client setup
groq_client = Groq(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url=os.getenv("GROQ_BASE_URL", "https://api.groq.com")
)

# Enhanced Model Selection Configuration for 2025
MODEL_SELECTION_CONFIG = {
    "creative_tasks": "llama3-70b-8192",
    "analysis_tasks": "llama-3.3-70b-versatile",
    "fast_responses": "llama-3.1-8b-instant",
    "coding_tasks": "llama3-70b-8192",
    "conversation": "llama-3.1-8b-instant",
    "web_scraping": "llama3-70b-8192",
    "data_analysis": "llama-3.3-70b-versatile",
    "default": "llama-3.1-8b-instant"
}

# Task Classification Keywords (Enhanced)
TASK_KEYWORDS = {
    "creative_tasks": ["write", "create", "generate", "compose", "design", "brainstorm", "story", "content", "marketing", "blog"],
    "analysis_tasks": ["analyze", "compare", "evaluate", "assess", "examine", "study", "research", "review", "summarize", "insights"],
    "coding_tasks": ["code", "program", "develop", "build", "debug", "fix", "api", "function", "algorithm", "script"],
    "conversation": ["chat", "talk", "discuss", "conversation", "explain", "help", "assist"],
    "web_scraping": ["scrape", "extract", "fetch", "crawl", "web", "website", "url", "html", "data"],
    "data_analysis": ["chart", "graph", "visualization", "plot", "statistics", "trends", "data", "metrics"]
}

def classify_task_type(prompt: str) -> str:
    """Enhanced task classification with new categories"""
    prompt_lower = prompt.lower()
    scores = {task_type: 0 for task_type in TASK_KEYWORDS}
    
    for task_type, keywords in TASK_KEYWORDS.items():
        for keyword in keywords:
            if keyword in prompt_lower:
                scores[task_type] += 1
    
    max_score_type = max(scores, key=scores.get)
    return max_score_type if scores[max_score_type] > 0 else "fast_responses"

def select_optimal_model(task_type: str, complexity_score: int = 1) -> str:
    """Enhanced model selection with new task types"""
    base_model = MODEL_SELECTION_CONFIG.get(task_type, MODEL_SELECTION_CONFIG["default"])
    
    if complexity_score > 3:
        if base_model == "llama-3.1-8b-instant":
            return "llama3-70b-8192"
        elif base_model == "llama3-70b-8192":
            return "llama-3.3-70b-versatile"
    
    return base_model

# Enhanced Pydantic models
class Agent(BaseModel):
    id: str
    name: str
    description: str
    system_prompt: str
    model: str = "auto"
    status: str = "active"
    created_at: datetime
    tasks_completed: int = 0
    conversation_memory: List[Dict[str, Any]] = []
    specialization: str = "general"
    settings: Dict[str, Any] = {}
    performance_metrics: Dict[str, Any] = {}

class Task(BaseModel):
    id: str
    agent_id: str
    prompt: str
    response: Optional[str] = None
    status: str = "pending"
    created_at: datetime
    completed_at: Optional[datetime] = None
    task_type: str = "general"
    model_used: str = "llama3-8b-8192"
    conversation_id: Optional[str] = None
    metadata: Dict[str, Any] = {}
    performance_data: Dict[str, Any] = {}

class Conversation(BaseModel):
    id: str
    agent_id: str
    messages: List[Dict[str, Any]] = []
    created_at: datetime
    updated_at: datetime
    status: str = "active"

class CreateAgentRequest(BaseModel):
    name: str
    description: str
    system_prompt: str
    model: str = "auto"
    specialization: str = "general"
    settings: Dict[str, Any] = {}

class CreateTaskRequest(BaseModel):
    agent_id: str
    prompt: str
    conversation_id: Optional[str] = None
    enable_web_scraping: bool = False
    enable_visualization: bool = False

class WebScrapingRequest(BaseModel):
    url: str
    agent_id: str
    prompt: str

class ModelComparisonRequest(BaseModel):
    prompt: str
    models: List[str]
    agent_id: str

class AgentTemplate(BaseModel):
    name: str
    description: str
    system_prompt: str
    specialization: str
    suggested_model: str
    icon: str = "🤖"
    category: str = "general"

# Enhanced Agent Templates
AGENT_TEMPLATES = [
    AgentTemplate(
        name="Content Writer",
        description="Creates engaging blog posts, articles, and marketing content",
        system_prompt="You are an expert content writer specializing in creating engaging, SEO-optimized content. Write in a clear, conversational tone and provide actionable insights.",
        specialization="creative_tasks",
        suggested_model="llama3-70b-8192",
        icon="✍️",
        category="content"
    ),
    AgentTemplate(
        name="Data Analyst", 
        description="Analyzes data, creates insights, and provides recommendations",
        system_prompt="You are a skilled data analyst. Provide clear, data-driven insights with actionable recommendations. Create visualizations when helpful and explain statistical findings clearly.",
        specialization="analysis_tasks",
        suggested_model="llama-3.3-70b-versatile",
        icon="📊",
        category="analysis"
    ),
    AgentTemplate(
        name="Code Assistant",
        description="Helps with programming, debugging, and technical solutions",
        system_prompt="You are an expert programmer. Provide clean, efficient code with clear explanations. Focus on best practices and maintainable solutions.",
        specialization="coding_tasks", 
        suggested_model="llama3-70b-8192",
        icon="💻",
        category="development"
    ),
    AgentTemplate(
        name="Web Researcher",
        description="Scrapes and analyzes web content for insights",
        system_prompt="You are a web research specialist. Extract key information from websites, analyze content trends, and provide comprehensive summaries with citations.",
        specialization="web_scraping",
        suggested_model="llama3-70b-8192",
        icon="🌐",
        category="research"
    ),
    AgentTemplate(
        name="Data Visualizer",
        description="Creates charts and graphs from data analysis",
        system_prompt="You are a data visualization expert. Transform raw data into clear, insightful charts and graphs. Explain patterns and trends in the data.",
        specialization="data_analysis",
        suggested_model="llama-3.3-70b-versatile",
        icon="📈",
        category="visualization"
    ),
    AgentTemplate(
        name="Customer Support",
        description="Provides helpful, empathetic customer service responses",
        system_prompt="You are a friendly customer support representative. Be helpful, empathetic, and solution-focused. Always maintain a professional yet warm tone.",
        specialization="conversation",
        suggested_model="llama-3.1-8b-instant",
        icon="🎧",
        category="support"
    )
]

# Middleware for request metrics
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    REQUEST_COUNT.labels(method=request.method, endpoint=request.url.path).inc()
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    REQUEST_DURATION.observe(process_time)
    response.headers["X-Process-Time"] = str(process_time)
    
    return response

# Database initialization with indexes
async def init_database():
    """Initialize database with optimized indexes"""
    try:
        # Agents collection indexes
        await db.agents.create_index([("id", 1)], unique=True)
        await db.agents.create_index([("status", 1)])
        await db.agents.create_index([("specialization", 1)])
        await db.agents.create_index([("created_at", -1)])
        
        # Tasks collection indexes
        await db.tasks.create_index([("id", 1)], unique=True)
        await db.tasks.create_index([("agent_id", 1)])
        await db.tasks.create_index([("status", 1)])
        await db.tasks.create_index([("created_at", -1)])
        await db.tasks.create_index([("agent_id", 1), ("status", 1)])
        await db.tasks.create_index([("task_type", 1)])
        
        # Conversations collection indexes
        await db.conversations.create_index([("id", 1)], unique=True)
        await db.conversations.create_index([("agent_id", 1)])
        await db.conversations.create_index([("updated_at", -1)])
        
        print("Database indexes created successfully")
    except Exception as e:
        print(f"Error creating indexes: {e}")

@app.on_event("startup")
async def startup_event():
    await init_database()
    # Warm up Redis connection
    try:
        redis_conn = await get_redis()
        await redis_conn.ping()
        print("Redis connection established")
    except Exception as e:
        print(f"Redis connection failed: {e}")

# Utility functions
async def cache_get(key: str):
    """Get value from cache"""
    try:
        redis_conn = await get_redis()
        return await redis_conn.get(key)
    except:
        return None

async def cache_set(key: str, value: str, expire: int = 300):
    """Set value in cache with expiration"""
    try:
        redis_conn = await get_redis()
        await redis_conn.setex(key, expire, value)
    except:
        pass

async def scrape_website(url: str) -> str:
    """Scrape website content"""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url)
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style"]):
                script.extract()
            
            # Get text and clean it
            text = soup.get_text()
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text = ' '.join(chunk for chunk in chunks if chunk)
            
            return text[:5000]  # Limit to 5000 characters
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to scrape website: {str(e)}")

def create_visualization(data: Dict[str, Any], chart_type: str = "bar") -> Dict[str, Any]:
    """Create data visualization"""
    try:
        if chart_type == "bar" and "labels" in data and "values" in data:
            fig = go.Figure(data=[go.Bar(x=data["labels"], y=data["values"])])
            fig.update_layout(title=data.get("title", "Data Visualization"))
            return {"chart": fig.to_json(), "type": "bar"}
        elif chart_type == "line" and "x" in data and "y" in data:
            fig = go.Figure(data=go.Scatter(x=data["x"], y=data["y"], mode='lines+markers'))
            fig.update_layout(title=data.get("title", "Trend Analysis"))
            return {"chart": fig.to_json(), "type": "line"}
        else:
            return {"error": "Invalid data format for visualization"}
    except Exception as e:
        return {"error": f"Visualization creation failed: {str(e)}"}

# API Endpoints

@app.get("/")
async def root():
    return {"message": "Agentic AI Platform API v2.1 - Enhanced with Performance & Features"}

@app.get("/api/metrics")
async def get_metrics():
    """Prometheus metrics endpoint"""
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

@app.get("/api/system-info")
async def get_system_info():
    """Get system performance information"""
    cpu_percent = psutil.cpu_percent()
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    
    return {
        "cpu_usage": cpu_percent,
        "memory_usage": {
            "percent": memory.percent,
            "available": memory.available,
            "total": memory.total
        },
        "disk_usage": {
            "percent": disk.percent,
            "free": disk.free,
            "total": disk.total
        },
        "timestamp": datetime.utcnow()
    }

@app.get("/api/agent-templates")
@limiter.limit("100/minute")
async def get_agent_templates(request: Request):
    """Get all available agent templates"""
    cache_key = "agent_templates"
    cached = await cache_get(cache_key)
    
    if cached:
        return json.loads(cached)
    
    result = {"templates": AGENT_TEMPLATES}
    await cache_set(cache_key, json.dumps(result, default=str), expire=3600)
    return result

@app.post("/api/agents/from-template/{template_name}")
@limiter.limit("20/minute")
async def create_agent_from_template(request: Request, template_name: str, agent_name: str):
    """Create an agent from a template"""
    template = next((t for t in AGENT_TEMPLATES if t.name.lower().replace(" ", "") == template_name.lower()), None)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    agent = Agent(
        id=str(uuid.uuid4()),
        name=agent_name,
        description=template.description,
        system_prompt=template.system_prompt,
        model=template.suggested_model,
        specialization=template.specialization,
        created_at=datetime.utcnow(),
        performance_metrics={
            "avg_response_time": 0,
            "success_rate": 100,
            "total_tasks": 0
        }
    )
    
    await db.agents.insert_one(agent.dict())
    
    # Invalidate cache
    redis_conn = await get_redis()
    try:
        await redis_conn.delete("agents_list")
    except:
        pass
    
    return agent

@app.get("/api/agents")
@limiter.limit("100/minute")
async def get_agents(request: Request):
    """Get all agents with caching"""
    cache_key = "agents_list"
    cached = await cache_get(cache_key)
    
    if cached:
        return json.loads(cached)
    
    agents = []
    async for agent in db.agents.find():
        agent["_id"] = str(agent["_id"])
        agents.append(agent)
    
    await cache_set(cache_key, json.dumps(agents, default=str), expire=60)
    return agents

@app.post("/api/agents")
@limiter.limit("20/minute")
async def create_agent(request: Request, agent_request: CreateAgentRequest):
    """Create a new agent"""
    agent = Agent(
        id=str(uuid.uuid4()),
        name=agent_request.name,
        description=agent_request.description,
        system_prompt=agent_request.system_prompt,
        model=agent_request.model,
        specialization=agent_request.specialization,
        settings=agent_request.settings,
        created_at=datetime.utcnow(),
        performance_metrics={
            "avg_response_time": 0,
            "success_rate": 100,
            "total_tasks": 0
        }
    )
    
    await db.agents.insert_one(agent.dict())
    
    # Invalidate cache
    try:
        redis_conn = await get_redis()
        await redis_conn.delete("agents_list")
    except:
        pass
    
    return agent

@app.get("/api/agents/{agent_id}")
@limiter.limit("200/minute")
async def get_agent(request: Request, agent_id: str):
    """Get agent by ID with caching"""
    cache_key = f"agent_{agent_id}"
    cached = await cache_get(cache_key)
    
    if cached:
        return json.loads(cached)
    
    agent = await db.agents.find_one({"id": agent_id})
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    agent["_id"] = str(agent["_id"])
    await cache_set(cache_key, json.dumps(agent, default=str), expire=300)
    return agent

@app.post("/api/web-scraping")
@limiter.limit("10/minute")
async def scrape_and_analyze(request: Request, scraping_request: WebScrapingRequest):
    """Scrape website and analyze with AI"""
    start_time = time.time()
    
    try:
        # Scrape website
        content = await scrape_website(scraping_request.url)
        
        # Get agent
        agent = await db.agents.find_one({"id": scraping_request.agent_id})
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        # Prepare prompt with scraped content
        enhanced_prompt = f"""
        Analyze the following web content from {scraping_request.url}:
        
        Content: {content}
        
        Task: {scraping_request.prompt}
        """
        
        # Process with AI
        messages = [
            {"role": "system", "content": agent["system_prompt"]},
            {"role": "user", "content": enhanced_prompt}
        ]
        
        response = groq_client.chat.completions.create(
            messages=messages,
            model="llama3-70b-8192",
            temperature=0.7,
            max_tokens=2048
        )
        
        result = {
            "url": scraping_request.url,
            "scraped_content": content[:500] + "..." if len(content) > 500 else content,
            "analysis": response.choices[0].message.content,
            "processing_time": time.time() - start_time
        }
        
        TASK_COUNT.labels(status="completed", model="llama3-70b-8192").inc()
        return result
        
    except Exception as e:
        TASK_COUNT.labels(status="failed", model="llama3-70b-8192").inc()
        raise HTTPException(status_code=500, detail=f"Web scraping failed: {str(e)}")

@app.post("/api/model-comparison")
@limiter.limit("5/minute")
async def compare_models(request: Request, comparison_request: ModelComparisonRequest):
    """Compare responses from different models"""
    start_time = time.time()
    
    try:
        agent = await db.agents.find_one({"id": comparison_request.agent_id})
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        messages = [
            {"role": "system", "content": agent["system_prompt"]},
            {"role": "user", "content": comparison_request.prompt}
        ]
        
        results = {}
        
        for model in comparison_request.models:
            try:
                response = groq_client.chat.completions.create(
                    messages=messages,
                    model=model,
                    temperature=0.7,
                    max_tokens=1024
                )
                results[model] = {
                    "response": response.choices[0].message.content,
                    "status": "success"
                }
                TASK_COUNT.labels(status="completed", model=model).inc()
            except Exception as e:
                results[model] = {
                    "response": f"Error: {str(e)}",
                    "status": "failed"
                }
                TASK_COUNT.labels(status="failed", model=model).inc()
        
        return {
            "prompt": comparison_request.prompt,
            "results": results,
            "processing_time": time.time() - start_time,
            "timestamp": datetime.utcnow()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model comparison failed: {str(e)}")

@app.post("/api/agents/{agent_id}/tasks")
@limiter.limit("30/minute")
async def create_task(request: Request, agent_id: str, task_request: CreateTaskRequest):
    """Enhanced task creation with web scraping and visualization"""
    start_time = time.time()
    
    # Check if agent exists
    agent = await db.agents.find_one({"id": agent_id})
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Classify task type and select optimal model
    task_type = classify_task_type(task_request.prompt)
    complexity_score = len(task_request.prompt.split()) // 10
    
    if agent.get("model") == "auto":
        selected_model = select_optimal_model(task_type, complexity_score)
    else:
        selected_model = agent.get("model", "llama3-8b-8192")
    
    task = Task(
        id=str(uuid.uuid4()),
        agent_id=agent_id,
        prompt=task_request.prompt,
        status="processing",
        task_type=task_type,
        model_used=selected_model,
        conversation_id=task_request.conversation_id,
        created_at=datetime.utcnow(),
        metadata={
            "complexity_score": complexity_score,
            "auto_selected": agent.get("model") == "auto",
            "web_scraping_enabled": task_request.enable_web_scraping,
            "visualization_enabled": task_request.enable_visualization
        }
    )
    
    await db.tasks.insert_one(task.dict())
    
    try:
        # Prepare conversation context
        messages = [{"role": "system", "content": agent["system_prompt"]}]
        
        # Add conversation history if exists
        if task_request.conversation_id:
            conversation = await db.conversations.find_one({"id": task_request.conversation_id})
            if conversation and conversation.get("messages"):
                recent_messages = conversation["messages"][-6:]
                messages.extend(recent_messages)
        
        # Enhance prompt with web scraping if requested
        enhanced_prompt = task_request.prompt
        if task_request.enable_web_scraping:
            # Look for URLs in the prompt
            urls = re.findall(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', task_request.prompt)
            for url in urls:
                try:
                    content = await scrape_website(url)
                    enhanced_prompt += f"\n\nScraped content from {url}:\n{content}"
                except:
                    enhanced_prompt += f"\n\nNote: Could not scrape content from {url}"
        
        messages.append({"role": "user", "content": enhanced_prompt})
        
        # Execute task with selected model
        response = groq_client.chat.completions.create(
            messages=messages,
            model=selected_model,
            temperature=0.7,
            max_tokens=2048
        )
        
        task_response = response.choices[0].message.content
        processing_time = time.time() - start_time
        
        # Create visualization if requested and response contains data
        visualization_data = None
        if task_request.enable_visualization:
            # Simple pattern matching for visualization data
            if "data:" in task_response.lower() or "chart" in task_response.lower():
                # This is a simplified example - in practice, you'd parse the response more intelligently
                visualization_data = {
                    "message": "Visualization feature available - data detected in response",
                    "suggested_charts": ["bar", "line", "pie"]
                }
        
        # Update task with response
        await db.tasks.update_one(
            {"id": task.id},
            {
                "$set": {
                    "response": task_response,
                    "status": "completed",
                    "completed_at": datetime.utcnow(),
                    "performance_data": {
                        "processing_time": processing_time,
                        "model_used": selected_model,
                        "tokens_used": len(task_response.split()) * 1.3  # Rough estimate
                    },
                    "visualization_data": visualization_data
                }
            }
        )
        
        # Update conversation if part of one
        if task_request.conversation_id:
            await db.conversations.update_one(
                {"id": task_request.conversation_id},
                {
                    "$push": {
                        "messages": {
                            "$each": [
                                {"role": "user", "content": task_request.prompt},
                                {"role": "assistant", "content": task_response}
                            ]
                        }
                    },
                    "$set": {"updated_at": datetime.utcnow()}
                }
            )
        
        # Update agent performance metrics
        current_avg = agent.get("performance_metrics", {}).get("avg_response_time", 0)
        total_tasks = agent.get("tasks_completed", 0)
        new_avg = ((current_avg * total_tasks) + processing_time) / (total_tasks + 1)
        
        await db.agents.update_one(
            {"id": agent_id},
            {
                "$inc": {"tasks_completed": 1},
                "$set": {
                    "performance_metrics.avg_response_time": new_avg,
                    "performance_metrics.total_tasks": total_tasks + 1
                },
                "$push": {
                    "conversation_memory": {
                        "$each": [{
                            "task_id": task.id,
                            "prompt": task_request.prompt,
                            "response": task_response,
                            "timestamp": datetime.utcnow(),
                            "processing_time": processing_time
                        }],
                        "$slice": -10
                    }
                }
            }
        )
        
        # Invalidate relevant caches
        try:
            redis_conn = await get_redis()
            await redis_conn.delete(f"agent_{agent_id}")
            await redis_conn.delete("agents_list")
        except:
            pass
        
        # Update task object for response
        task.response = task_response
        task.status = "completed"
        task.completed_at = datetime.utcnow()
        task.performance_data = {
            "processing_time": processing_time,
            "model_used": selected_model
        }
        task.visualization_data = visualization_data
        
        TASK_COUNT.labels(status="completed", model=selected_model).inc()
        return task
        
    except Exception as e:
        # Update task with error
        await db.tasks.update_one(
            {"id": task.id},
            {
                "$set": {
                    "response": f"Error: {str(e)}",
                    "status": "failed",
                    "completed_at": datetime.utcnow(),
                    "performance_data": {
                        "processing_time": time.time() - start_time,
                        "error": str(e)
                    }
                }
            }
        )
        TASK_COUNT.labels(status="failed", model=selected_model).inc()
        raise HTTPException(status_code=500, detail=f"Task execution failed: {str(e)}")

@app.get("/api/agents/{agent_id}/tasks")
@limiter.limit("100/minute")
async def get_agent_tasks(request: Request, agent_id: str):
    """Get tasks for an agent with caching"""
    cache_key = f"agent_tasks_{agent_id}"
    cached = await cache_get(cache_key)
    
    if cached:
        return json.loads(cached)
    
    tasks = []
    async for task in db.tasks.find({"agent_id": agent_id}).sort("created_at", -1):
        task["_id"] = str(task["_id"])
        tasks.append(task)
    
    await cache_set(cache_key, json.dumps(tasks, default=str), expire=60)
    return tasks

@app.get("/api/tasks")
@limiter.limit("50/minute")
async def get_all_tasks(request: Request):
    """Get all tasks with pagination and caching"""
    cache_key = "all_tasks"
    cached = await cache_get(cache_key)
    
    if cached:
        return json.loads(cached)
    
    tasks = []
    async for task in db.tasks.find().sort("created_at", -1).limit(100):
        task["_id"] = str(task["_id"])
        tasks.append(task)
    
    await cache_set(cache_key, json.dumps(tasks, default=str), expire=30)
    return tasks

@app.get("/api/analytics/dashboard")
@limiter.limit("30/minute")
async def get_dashboard_analytics(request: Request):
    """Enhanced dashboard analytics with performance metrics"""
    cache_key = "dashboard_analytics"
    cached = await cache_get(cache_key)
    
    if cached:
        return json.loads(cached)
    
    # Basic counts
    total_agents = await db.agents.count_documents({})
    active_agents = await db.agents.count_documents({"status": "active"})
    total_tasks = await db.tasks.count_documents({})
    completed_tasks = await db.tasks.count_documents({"status": "completed"})
    failed_tasks = await db.tasks.count_documents({"status": "failed"})
    
    # Recent activity
    recent_tasks = []
    async for task in db.tasks.find().sort("created_at", -1).limit(5):
        task["_id"] = str(task["_id"])
        recent_tasks.append(task)
    
    # Model usage statistics
    model_usage = {}
    async for task in db.tasks.find({"model_used": {"$exists": True}}):
        model = task.get("model_used", "unknown")
        model_usage[model] = model_usage.get(model, 0) + 1
    
    # Performance metrics
    performance_pipeline = [
        {"$match": {"status": "completed", "performance_data.processing_time": {"$exists": True}}},
        {"$group": {
            "_id": None,
            "avg_processing_time": {"$avg": "$performance_data.processing_time"},
            "max_processing_time": {"$max": "$performance_data.processing_time"},
            "min_processing_time": {"$min": "$performance_data.processing_time"}
        }}
    ]
    
    performance_stats = {"avg_processing_time": 0, "max_processing_time": 0, "min_processing_time": 0}
    async for stat in db.tasks.aggregate(performance_pipeline):
        performance_stats = stat
        break
    
    # Task type distribution
    task_types = {}
    async for task in db.tasks.find({"task_type": {"$exists": True}}):
        task_type = task.get("task_type", "general")
        task_types[task_type] = task_types.get(task_type, 0) + 1
    
    result = {
        "agents": {
            "total": total_agents,
            "active": active_agents
        },
        "tasks": {
            "total": total_tasks,
            "completed": completed_tasks,
            "failed": failed_tasks,
            "success_rate": round((completed_tasks / max(total_tasks, 1)) * 100, 2)
        },
        "performance": {
            "avg_processing_time": round(performance_stats.get("avg_processing_time", 0), 2),
            "max_processing_time": round(performance_stats.get("max_processing_time", 0), 2),
            "min_processing_time": round(performance_stats.get("min_processing_time", 0), 2)
        },
        "recent_activity": recent_tasks,
        "model_usage": model_usage,
        "task_types": task_types
    }
    
    await cache_set(cache_key, json.dumps(result, default=str), expire=120)
    return result

@app.post("/api/conversations")
@limiter.limit("20/minute")
async def create_conversation(request: Request, agent_id: str):
    """Create a new conversation"""
    agent = await db.agents.find_one({"id": agent_id})
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    conversation = Conversation(
        id=str(uuid.uuid4()),
        agent_id=agent_id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    await db.conversations.insert_one(conversation.dict())
    return conversation

@app.get("/api/conversations/{conversation_id}")
@limiter.limit("100/minute")
async def get_conversation(request: Request, conversation_id: str):
    """Get conversation history"""
    conversation = await db.conversations.find_one({"id": conversation_id})
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    conversation["_id"] = str(conversation["_id"])
    return conversation

@app.post("/api/upload")
@limiter.limit("10/minute")
async def upload_file(request: Request, file: UploadFile = File(...)):
    """Handle file uploads for enhanced task processing"""
    try:
        content = await file.read()
        
        # Save file temporarily
        file_id = str(uuid.uuid4())
        file_path = f"/tmp/{file_id}_{file.filename}"
        
        with open(file_path, "wb") as f:
            f.write(content)
        
        result = {
            "file_id": file_id,
            "filename": file.filename,
            "size": len(content),
            "content_type": file.content_type,
            "path": file_path,
            "uploaded_at": datetime.utcnow()
        }
        
        # Cache file info
        await cache_set(f"file_{file_id}", json.dumps(result, default=str), expire=3600)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

@app.delete("/api/agents/{agent_id}")
@limiter.limit("10/minute")
async def delete_agent(request: Request, agent_id: str):
    """Delete agent and associated data"""
    result = await db.agents.delete_one({"id": agent_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Delete associated tasks and conversations
    await db.tasks.delete_many({"agent_id": agent_id})
    await db.conversations.delete_many({"agent_id": agent_id})
    
    # Invalidate caches
    try:
        redis_conn = await get_redis()
        await redis_conn.delete(f"agent_{agent_id}")
        await redis_conn.delete("agents_list")
        await redis_conn.delete(f"agent_tasks_{agent_id}")
    except:
        pass
    
    return {"message": "Agent and associated data deleted"}

@app.get("/api/health")
async def health_check():
    """Enhanced health check with system monitoring"""
    try:
        # Test database connection
        await db.agents.count_documents({})
        
        # Test Redis connection
        redis_status = "connected"
        try:
            redis_conn = await get_redis()
            await redis_conn.ping()
        except:
            redis_status = "disconnected"
        
        # Test Groq API connection
        groq_status = "connected"
        try:
            test_response = groq_client.chat.completions.create(
                messages=[{"role": "user", "content": "test"}],
                model="llama-3.1-8b-instant",
                max_tokens=1
            )
        except:
            groq_status = "disconnected"
        
        # Get system stats
        cpu_percent = psutil.cpu_percent()
        memory = psutil.virtual_memory()
        
        return {
            "status": "healthy",
            "services": {
                "database": "connected",
                "redis": redis_status,
                "groq_api": groq_status
            },
            "system": {
                "cpu_usage": cpu_percent,
                "memory_usage": memory.percent,
                "memory_available": memory.available
            },
            "timestamp": datetime.utcnow(),
            "version": "2.1.0"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow()
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)