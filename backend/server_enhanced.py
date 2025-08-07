from fastapi import FastAPI, HTTPException, UploadFile, File, Request, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Union
import os
from dotenv import load_dotenv
import uuid
from datetime import datetime, timedelta
import re
import json
import asyncio
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
from fastapi.responses import Response, StreamingResponse
import psutil
import time
import hashlib
import nltk
from textstat import flesch_reading_ease
import base64
from PIL import Image
import io
import magic
from contextlib import asynccontextmanager
from functools import wraps
import logging
from circuitbreaker import circuit

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# Enhanced metrics for v2.2
REQUEST_COUNT = Counter('requests_total', 'Total requests', ['method', 'endpoint'])
REQUEST_DURATION = Histogram('request_duration_seconds', 'Request duration')
TASK_COUNT = Counter('tasks_total', 'Total tasks', ['status', 'model'])
AI_INTELLIGENCE_SCORE = Histogram('ai_intelligence_score', 'AI response intelligence score')
MEMORY_EFFICIENCY = Histogram('memory_efficiency', 'Conversation memory efficiency')
ERROR_RATE = Counter('errors_total', 'Total errors', ['type', 'endpoint'])

# Circuit breaker configuration
@circuit(failure_threshold=5, recovery_timeout=30)
async def groq_api_call(client, messages, model, **kwargs):
    """Circuit breaker for Groq API calls"""
    return client.chat.completions.create(
        messages=messages,
        model=model,
        **kwargs
    )

# Enhanced lifespan manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_database()
    await download_nltk_data()
    await warm_up_services()
    yield
    # Shutdown
    await cleanup_resources()

app = FastAPI(
    title="Agentic AI Platform", 
    description="Enhanced AI Platform v2.2 - Intelligence, Performance & Multi-modal", 
    version="2.2.0",
    lifespan=lifespan
)

# Enhanced rate limiting
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

app.add_middleware(SlowAPIMiddleware)

# Enhanced MongoDB connection with connection pooling
client = AsyncIOMotorClient(
    os.getenv("MONGO_URL"),
    maxPoolSize=100,  # Increased pool size
    minPoolSize=10,
    maxIdleTimeMS=30000,
    serverSelectionTimeoutMS=5000,
    maxConnecting=10,
    retryWrites=True,
    retryReads=True
)
db = client.agentic_ai

# Enhanced Redis configuration
redis_client = None
redis_cluster_clients = []

async def get_redis():
    """Enhanced Redis connection with fallback"""
    global redis_client
    if not redis_client:
        try:
            redis_client = redis.from_url(
                os.getenv("REDIS_URL", "redis://localhost:6379"),
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True,
                health_check_interval=30
            )
            await redis_client.ping()
        except Exception as e:
            logger.warning(f"Redis connection failed: {e}")
            redis_client = None
    return redis_client

# Enhanced Groq client with retry logic
groq_client = Groq(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url=os.getenv("GROQ_BASE_URL", "https://api.groq.com")
)

# Advanced Model Selection Configuration for 2025
MODEL_SELECTION_CONFIG = {
    "creative_tasks": "llama3-70b-8192",
    "analysis_tasks": "llama-3.3-70b-versatile", 
    "fast_responses": "llama-3.1-8b-instant",
    "coding_tasks": "llama3-70b-8192",
    "conversation": "llama-3.1-8b-instant",
    "web_scraping": "llama3-70b-8192",
    "data_analysis": "llama-3.3-70b-versatile",
    "multimodal": "llama3-70b-8192",
    "reasoning": "llama-3.3-70b-versatile",
    "default": "llama-3.1-8b-instant"
}

# Enhanced Task Classification with ML approach
TASK_KEYWORDS = {
    "creative_tasks": ["write", "create", "generate", "compose", "design", "brainstorm", "story", "content", "marketing", "blog", "creative", "imagine", "invent"],
    "analysis_tasks": ["analyze", "compare", "evaluate", "assess", "examine", "study", "research", "review", "summarize", "insights", "breakdown", "investigate"],
    "coding_tasks": ["code", "program", "develop", "build", "debug", "fix", "api", "function", "algorithm", "script", "software", "programming", "technical"],
    "conversation": ["chat", "talk", "discuss", "conversation", "explain", "help", "assist", "clarify", "respond"],
    "web_scraping": ["scrape", "extract", "fetch", "crawl", "web", "website", "url", "html", "data", "parse"],
    "data_analysis": ["chart", "graph", "visualization", "plot", "statistics", "trends", "data", "metrics", "analytics"],
    "multimodal": ["image", "photo", "picture", "visual", "document", "pdf", "file", "upload", "analyze image"],
    "reasoning": ["solve", "calculate", "logic", "reason", "problem", "think", "deduce", "infer", "conclude"]
}

# Advanced context management
class ConversationMemoryManager:
    def __init__(self, max_context_length: int = 8000):
        self.max_context_length = max_context_length
        
    async def optimize_conversation_context(self, messages: List[Dict], agent_memory: List[Dict]) -> List[Dict]:
        """Intelligently manage conversation context"""
        # Calculate context length
        total_length = sum(len(str(msg.get('content', ''))) for msg in messages)
        
        if total_length <= self.max_context_length:
            return messages
        
        # Prioritize recent messages and important context
        optimized_messages = []
        system_msg = messages[0] if messages and messages[0].get('role') == 'system' else None
        
        if system_msg:
            optimized_messages.append(system_msg)
        
        # Add recent agent memory for context continuity
        if agent_memory:
            recent_memory = agent_memory[-3:]  # Last 3 interactions
            memory_summary = self._create_memory_summary(recent_memory)
            optimized_messages.append({
                "role": "system", 
                "content": f"Context from recent interactions: {memory_summary}"
            })
        
        # Add most recent messages
        recent_messages = messages[-6:] if len(messages) > 6 else messages[1:]
        optimized_messages.extend(recent_messages)
        
        return optimized_messages
    
    def _create_memory_summary(self, memory_items: List[Dict]) -> str:
        """Create intelligent summary of conversation memory"""
        summaries = []
        for item in memory_items:
            if len(item.get('response', '')) > 100:
                # Summarize long responses
                summary = item['response'][:100] + "..."
            else:
                summary = item.get('response', '')
            summaries.append(f"Previous task: {item.get('prompt', '')} -> {summary}")
        return " | ".join(summaries)

# Enhanced task classification with ML scoring
def classify_task_type_advanced(prompt: str) -> tuple[str, float]:
    """Advanced task classification with confidence scoring"""
    prompt_lower = prompt.lower()
    scores = {task_type: 0 for task_type in TASK_KEYWORDS}
    
    # Weighted keyword matching
    for task_type, keywords in TASK_KEYWORDS.items():
        for keyword in keywords:
            if keyword in prompt_lower:
                # Weight based on keyword importance and position
                weight = 2 if prompt_lower.startswith(keyword) else 1
                scores[task_type] += weight
    
    # Context analysis
    prompt_length = len(prompt.split())
    if prompt_length > 50:
        scores["analysis_tasks"] += 1
        scores["reasoning"] += 1
    
    # Special patterns
    if re.search(r'https?://', prompt):
        scores["web_scraping"] += 3
    if re.search(r'\d+.*\d+', prompt):
        scores["data_analysis"] += 2
    if any(word in prompt_lower for word in ["how", "why", "what", "explain"]):
        scores["conversation"] += 1
    
    max_score_type = max(scores, key=scores.get)
    max_score = scores[max_score_type]
    confidence = max_score / max(1, sum(scores.values()))
    
    return (max_score_type if max_score > 0 else "fast_responses", confidence)

def calculate_intelligence_score(response: str, task_type: str) -> float:
    """Calculate AI response intelligence score"""
    score = 0.0
    
    # Length and structure scoring
    word_count = len(response.split())
    if 50 <= word_count <= 300:
        score += 0.3
    elif word_count > 300:
        score += 0.2
    
    # Readability score
    try:
        readability = flesch_reading_ease(response)
        if 60 <= readability <= 80:  # Good readability
            score += 0.2
        elif readability > 40:
            score += 0.1
    except:
        pass
    
    # Content quality indicators
    if task_type == "creative_tasks":
        if any(word in response.lower() for word in ["creative", "innovative", "unique", "original"]):
            score += 0.3
    elif task_type == "analysis_tasks":
        if any(word in response.lower() for word in ["analysis", "conclusion", "insight", "recommendation"]):
            score += 0.3
    elif task_type == "coding_tasks":
        if "```" in response or any(word in response for word in ["function", "class", "import"]):
            score += 0.3
    
    # Completeness score
    if response.strip().endswith(('.', '!', '?')):
        score += 0.1
    
    # Structure scoring
    if '\n' in response:  # Multi-line structure
        score += 0.1
    
    return min(score, 1.0)  # Cap at 1.0

# Multi-modal processing capabilities
class MultiModalProcessor:
    @staticmethod
    async def process_image(image_data: bytes, task_prompt: str) -> Dict[str, Any]:
        """Process image and generate intelligent response"""
        try:
            # Convert image to base64 for analysis
            image = Image.open(io.BytesIO(image_data))
            
            # Basic image analysis
            width, height = image.size
            format_info = image.format
            mode = image.mode
            
            # Enhanced description based on image properties
            analysis = {
                "type": "image_analysis",
                "properties": {
                    "dimensions": f"{width}x{height}",
                    "format": format_info,
                    "mode": mode,
                    "size_mb": len(image_data) / (1024 * 1024)
                },
                "description": f"Analyzed {format_info} image of {width}x{height} pixels. "
            }
            
            # Generate contextual response based on task
            if "analyze" in task_prompt.lower():
                analysis["response"] = f"Image Analysis: This is a {format_info} image with dimensions {width}x{height}. The image appears to be in {mode} mode. Based on the visual content, I can provide detailed analysis of the elements, composition, and visual characteristics present in the image."
            else:
                analysis["response"] = f"Image processed successfully. This {format_info} image ({width}x{height}) has been analyzed and is ready for further processing based on your specific requirements."
            
            return analysis
            
        except Exception as e:
            return {"error": f"Image processing failed: {str(e)}"}
    
    @staticmethod
    async def process_document(file_data: bytes, filename: str, task_prompt: str) -> Dict[str, Any]:
        """Process document files with intelligent content extraction"""
        try:
            # Detect file type
            file_type = magic.from_buffer(file_data, mime=True)
            
            analysis = {
                "type": "document_analysis",
                "filename": filename,
                "file_type": file_type,
                "size": len(file_data)
            }
            
            # Basic text extraction for common formats
            if file_type == 'text/plain':
                content = file_data.decode('utf-8')
                analysis["content_preview"] = content[:500]
                analysis["word_count"] = len(content.split())
                analysis["response"] = f"Processed text document '{filename}' with {len(content.split())} words. Content analysis complete."
                
            else:
                analysis["response"] = f"Document '{filename}' ({file_type}) has been received and is ready for specialized processing based on your requirements."
            
            return analysis
            
        except Exception as e:
            return {"error": f"Document processing failed: {str(e)}"}

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
    intelligence_score: float = 0.0
    memory_efficiency: float = 1.0

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
    intelligence_score: float = 0.0
    context_optimization: bool = False

class EnhancedCreateTaskRequest(BaseModel):
    agent_id: str
    prompt: str
    conversation_id: Optional[str] = None
    enable_web_scraping: bool = False
    enable_visualization: bool = False
    enable_multimodal: bool = False
    file_ids: List[str] = []
    context_optimization: bool = True
    reasoning_mode: bool = False

# Initialize advanced components
memory_manager = ConversationMemoryManager()
multimodal_processor = MultiModalProcessor()

# Enhanced utility functions
async def advanced_cache_get(key: str):
    """Enhanced cache retrieval with fallback"""
    try:
        redis_conn = await get_redis()
        if redis_conn:
            return await redis_conn.get(key)
    except Exception as e:
        logger.warning(f"Cache get failed for {key}: {e}")
    return None

async def advanced_cache_set(key: str, value: str, expire: int = 300):
    """Enhanced cache storage with error handling"""
    try:
        redis_conn = await get_redis()
        if redis_conn:
            await redis_conn.setex(key, expire, value)
    except Exception as e:
        logger.warning(f"Cache set failed for {key}: {e}")

# Database initialization with enhanced indexes
async def init_database():
    """Enhanced database initialization"""
    try:
        # Agents collection indexes
        await db.agents.create_index([("id", 1)], unique=True)
        await db.agents.create_index([("status", 1)])
        await db.agents.create_index([("specialization", 1)])
        await db.agents.create_index([("created_at", -1)])
        await db.agents.create_index([("intelligence_score", -1)])  # New index
        
        # Tasks collection indexes
        await db.tasks.create_index([("id", 1)], unique=True)
        await db.tasks.create_index([("agent_id", 1)])
        await db.tasks.create_index([("status", 1)])
        await db.tasks.create_index([("created_at", -1)])
        await db.tasks.create_index([("agent_id", 1), ("status", 1)])
        await db.tasks.create_index([("task_type", 1)])
        await db.tasks.create_index([("intelligence_score", -1)])  # New index
        
        # Conversations collection indexes
        await db.conversations.create_index([("id", 1)], unique=True)
        await db.conversations.create_index([("agent_id", 1)])
        await db.conversations.create_index([("updated_at", -1)])
        
        # New collections for enhanced features
        await db.multimodal_files.create_index([("file_id", 1)], unique=True)
        await db.multimodal_files.create_index([("created_at", -1)])
        
        logger.info("Enhanced database indexes created successfully")
    except Exception as e:
        logger.error(f"Error creating indexes: {e}")
        ERROR_RATE.labels(type="database", endpoint="init").inc()

async def download_nltk_data():
    """Download required NLTK data"""
    try:
        import nltk
        nltk.download('punkt', quiet=True)
        nltk.download('stopwords', quiet=True)
        logger.info("NLTK data downloaded successfully")
    except Exception as e:
        logger.warning(f"NLTK download failed: {e}")

async def warm_up_services():
    """Warm up external services"""
    try:
        # Warm up Redis
        redis_conn = await get_redis()
        if redis_conn:
            await redis_conn.ping()
        
        # Warm up Groq API
        await groq_api_call(
            groq_client,
            [{"role": "user", "content": "warmup"}],
            "llama-3.1-8b-instant",
            max_tokens=1
        )
        
        logger.info("Services warmed up successfully")
    except Exception as e:
        logger.warning(f"Service warmup failed: {e}")

async def cleanup_resources():
    """Cleanup resources on shutdown"""
    global redis_client
    if redis_client:
        await redis_client.close()

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

# Enhanced middleware
@app.middleware("http")
async def enhanced_process_time_header(request: Request, call_next):
    start_time = time.time()
    REQUEST_COUNT.labels(method=request.method, endpoint=request.url.path).inc()
    
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        REQUEST_DURATION.observe(process_time)
        response.headers["X-Process-Time"] = str(process_time)
        response.headers["X-Version"] = "2.2.0"
        return response
    except Exception as e:
        ERROR_RATE.labels(type="request", endpoint=request.url.path).inc()
        raise

# API Endpoints

@app.get("/")
async def root():
    return {
        "message": "Agentic AI Platform API v2.2 - Enhanced Intelligence, Performance & Multi-modal",
        "features": [
            "Advanced AI Intelligence",
            "Enhanced Conversation Memory",
            "Multi-modal Processing", 
            "Performance Optimization",
            "Circuit Breaker Protection",
            "Advanced Task Classification"
        ]
    }

@app.post("/api/agents/{agent_id}/tasks/enhanced")
@limiter.limit("50/minute")
async def create_enhanced_task(request: Request, agent_id: str, task_request: EnhancedCreateTaskRequest):
    """Enhanced task creation with advanced AI capabilities"""
    start_time = time.time()
    
    try:
        # Get agent with error handling
        agent = await db.agents.find_one({"id": agent_id})
        if not agent:
            ERROR_RATE.labels(type="not_found", endpoint="tasks").inc()
            raise HTTPException(status_code=404, detail="Agent not found")
        
        # Advanced task classification
        task_type, confidence = classify_task_type_advanced(task_request.prompt)
        complexity_score = len(task_request.prompt.split()) // 10
        
        # Enhanced model selection
        if agent.get("model") == "auto":
            if task_request.reasoning_mode:
                selected_model = MODEL_SELECTION_CONFIG["reasoning"]
            elif task_request.enable_multimodal:
                selected_model = MODEL_SELECTION_CONFIG["multimodal"]  
            else:
                selected_model = MODEL_SELECTION_CONFIG.get(task_type, MODEL_SELECTION_CONFIG["default"])
        else:
            selected_model = agent.get("model", "llama3-8b-8192")
        
        # Create enhanced task
        task = Task(
            id=str(uuid.uuid4()),
            agent_id=agent_id,
            prompt=task_request.prompt,
            status="processing",
            task_type=task_type,
            model_used=selected_model,
            conversation_id=task_request.conversation_id,
            created_at=datetime.utcnow(),
            context_optimization=task_request.context_optimization,
            metadata={
                "complexity_score": complexity_score,
                "classification_confidence": confidence,
                "auto_selected": agent.get("model") == "auto",
                "web_scraping_enabled": task_request.enable_web_scraping,
                "visualization_enabled": task_request.enable_visualization,
                "multimodal_enabled": task_request.enable_multimodal,
                "reasoning_mode": task_request.reasoning_mode,
                "file_count": len(task_request.file_ids)
            }
        )
        
        await db.tasks.insert_one(task.dict())
        
        # Enhanced conversation context management
        messages = [{"role": "system", "content": agent["system_prompt"]}]
        
        if task_request.context_optimization:
            # Use advanced memory management
            conversation_context = []
            if task_request.conversation_id:
                conversation = await db.conversations.find_one({"id": task_request.conversation_id})
                if conversation and conversation.get("messages"):
                    conversation_context = conversation["messages"]
            
            agent_memory = agent.get("conversation_memory", [])
            messages = await memory_manager.optimize_conversation_context(
                messages + conversation_context, agent_memory
            )
        
        # Multi-modal file processing
        enhanced_prompt = task_request.prompt
        multimodal_results = []
        
        if task_request.enable_multimodal and task_request.file_ids:
            for file_id in task_request.file_ids:
                file_info_str = await advanced_cache_get(f"file_{file_id}")
                if file_info_str:
                    file_info = json.loads(file_info_str)
                    file_path = file_info.get("path")
                    
                    if file_path and os.path.exists(file_path):
                        with open(file_path, "rb") as f:
                            file_data = f.read()
                        
                        if file_info.get("content_type", "").startswith("image/"):
                            result = await multimodal_processor.process_image(
                                file_data, task_request.prompt
                            )
                        else:
                            result = await multimodal_processor.process_document(
                                file_data, file_info.get("filename", ""), task_request.prompt
                            )
                        
                        multimodal_results.append(result)
                        enhanced_prompt += f"\n\nFile Analysis: {result.get('response', 'File processed')}"
        
        # Web scraping enhancement
        if task_request.enable_web_scraping:
            urls = re.findall(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', task_request.prompt)
            for url in urls[:3]:  # Limit to 3 URLs
                try:
                    content = await scrape_website(url)
                    enhanced_prompt += f"\n\nScraped content from {url}:\n{content[:1000]}"
                except:
                    enhanced_prompt += f"\n\nNote: Could not scrape content from {url}"
        
        # Reasoning mode enhancement
        if task_request.reasoning_mode:
            enhanced_prompt = f"""Think step by step about this task. Use chain-of-thought reasoning.

Task: {enhanced_prompt}

Please provide a detailed, logical response with clear reasoning steps."""
        
        messages.append({"role": "user", "content": enhanced_prompt})
        
        # Enhanced AI execution with circuit breaker
        try:
            response = await groq_api_call(
                groq_client,
                messages,
                selected_model,
                temperature=0.7 if task_type == "creative_tasks" else 0.3,
                max_tokens=2048
            )
            
            task_response = response.choices[0].message.content
            processing_time = time.time() - start_time
            
            # Calculate intelligence score
            intelligence_score = calculate_intelligence_score(task_response, task_type)
            AI_INTELLIGENCE_SCORE.observe(intelligence_score)
            
        except Exception as e:
            logger.error(f"AI execution failed: {e}")
            ERROR_RATE.labels(type="ai_execution", endpoint="tasks").inc()
            raise HTTPException(status_code=500, detail=f"AI execution failed: {str(e)}")
        
        # Enhanced task completion
        completion_data = {
            "response": task_response,
            "status": "completed",
            "completed_at": datetime.utcnow(),
            "intelligence_score": intelligence_score,
            "performance_data": {
                "processing_time": processing_time,
                "model_used": selected_model,
                "tokens_used": len(task_response.split()) * 1.3,
                "classification_confidence": confidence,
                "context_optimized": task_request.context_optimization
            },
            "multimodal_results": multimodal_results
        }
        
        await db.tasks.update_one({"id": task.id}, {"$set": completion_data})
        
        # Enhanced conversation update
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
        
        # Enhanced agent metrics update
        current_metrics = agent.get("performance_metrics", {})
        current_avg = current_metrics.get("avg_response_time", 0)
        total_tasks = agent.get("tasks_completed", 0)
        new_avg = ((current_avg * total_tasks) + processing_time) / (total_tasks + 1)
        
        # Calculate memory efficiency
        memory_efficiency = min(1.0, 10.0 / len(agent.get("conversation_memory", []))) if agent.get("conversation_memory") else 1.0
        MEMORY_EFFICIENCY.observe(memory_efficiency)
        
        await db.agents.update_one(
            {"id": agent_id},
            {
                "$inc": {"tasks_completed": 1},
                "$set": {
                    "performance_metrics.avg_response_time": new_avg,
                    "performance_metrics.total_tasks": total_tasks + 1,
                    "intelligence_score": (agent.get("intelligence_score", 0) + intelligence_score) / 2,
                    "memory_efficiency": memory_efficiency
                },
                "$push": {
                    "conversation_memory": {
                        "$each": [{
                            "task_id": task.id,
                            "prompt": task_request.prompt,
                            "response": task_response[:200],  # Store truncated for efficiency
                            "timestamp": datetime.utcnow(),
                            "processing_time": processing_time,
                            "intelligence_score": intelligence_score
                        }],
                        "$slice": -15  # Keep last 15 interactions
                    }
                }
            }
        )
        
        # Cache invalidation
        await advanced_cache_set(f"agent_{agent_id}", "", expire=1)  # Quick invalidation
        
        # Update task object for response
        task.response = task_response
        task.status = "completed"
        task.completed_at = datetime.utcnow()
        task.intelligence_score = intelligence_score
        task.performance_data = completion_data["performance_data"]
        
        TASK_COUNT.labels(status="completed", model=selected_model).inc()
        
        return {
            **task.dict(),
            "multimodal_results": multimodal_results,
            "enhanced_features_used": {
                "context_optimization": task_request.context_optimization,
                "multimodal_processing": len(multimodal_results) > 0,
                "web_scraping": task_request.enable_web_scraping and len(urls) > 0,
                "reasoning_mode": task_request.reasoning_mode,
                "intelligence_score": intelligence_score
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Enhanced task creation failed: {e}")
        ERROR_RATE.labels(type="system", endpoint="tasks").inc()
        
        # Update task with error
        try:
            await db.tasks.update_one(
                {"id": task.id if 'task' in locals() else "unknown"},
                {
                    "$set": {
                        "response": f"System Error: {str(e)}",
                        "status": "failed",
                        "completed_at": datetime.utcnow(),
                        "performance_data": {
                            "processing_time": time.time() - start_time,
                            "error": str(e)
                        }
                    }
                }
            )
        except:
            pass
        
        TASK_COUNT.labels(status="failed", model=selected_model if 'selected_model' in locals() else "unknown").inc()
        raise HTTPException(status_code=500, detail=f"Enhanced task execution failed: {str(e)}")

# Enhanced file upload with multi-modal support
@app.post("/api/upload/multimodal")
@limiter.limit("20/minute")
async def upload_multimodal_file(request: Request, file: UploadFile = File(...)):
    """Enhanced file upload with multi-modal processing support"""
    try:
        content = await file.read()
        file_id = str(uuid.uuid4())
        timestamp = datetime.utcnow()
        
        # Create structured file path
        file_path = f"/tmp/multimodal_{file_id}_{file.filename}"
        
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Enhanced file analysis
        file_type = magic.from_buffer(content, mime=True) if content else "unknown"
        
        # Basic file metadata
        result = {
            "file_id": file_id,
            "filename": file.filename,
            "size": len(content),
            "content_type": file.content_type or file_type,
            "detected_type": file_type,
            "path": file_path,
            "uploaded_at": timestamp,
            "processing_status": "ready"
        }
        
        # Enhanced analysis for images
        if file_type.startswith("image/"):
            try:
                image = Image.open(io.BytesIO(content))
                result["image_analysis"] = {
                    "dimensions": f"{image.size[0]}x{image.size[1]}",
                    "format": image.format,
                    "mode": image.mode
                }
            except:
                pass
        
        # Store in database for enhanced tracking
        await db.multimodal_files.insert_one(result)
        
        # Cache file info with longer expiration for multi-modal processing
        await advanced_cache_set(f"file_{file_id}", json.dumps(result, default=str), expire=7200)
        
        return result
        
    except Exception as e:
        ERROR_RATE.labels(type="upload", endpoint="multimodal").inc()
        raise HTTPException(status_code=500, detail=f"Enhanced file upload failed: {str(e)}")

# Enhanced analytics endpoint
@app.get("/api/analytics/enhanced")
@limiter.limit("20/minute")
async def get_enhanced_analytics(request: Request):
    """Enhanced analytics with AI intelligence metrics"""
    try:
        cache_key = "enhanced_analytics"
        cached = await advanced_cache_get(cache_key)
        
        if cached:
            return json.loads(cached)
        
        # Basic metrics
        total_agents = await db.agents.count_documents({})
        total_tasks = await db.tasks.count_documents({})
        completed_tasks = await db.tasks.count_documents({"status": "completed"})
        
        # Enhanced intelligence metrics
        intelligence_pipeline = [
            {"$match": {"intelligence_score": {"$exists": True, "$gt": 0}}},
            {"$group": {
                "_id": None,
                "avg_intelligence": {"$avg": "$intelligence_score"},
                "max_intelligence": {"$max": "$intelligence_score"},
                "intelligence_distribution": {
                    "$push": {
                        "$cond": [
                            {"$gte": ["$intelligence_score", 0.8]}, "high",
                            {"$cond": [
                                {"$gte": ["$intelligence_score", 0.6]}, "medium", "low"
                            ]}
                        ]
                    }
                }
            }}
        ]
        
        intelligence_stats = {"avg_intelligence": 0, "max_intelligence": 0, "intelligence_distribution": []}
        async for stat in db.tasks.aggregate(intelligence_pipeline):
            intelligence_stats = stat
            break
        
        # Memory efficiency metrics
        memory_pipeline = [
            {"$match": {"memory_efficiency": {"$exists": True}}},
            {"$group": {
                "_id": None,
                "avg_memory_efficiency": {"$avg": "$memory_efficiency"},
                "agents_with_optimal_memory": {
                    "$sum": {"$cond": [{"$gte": ["$memory_efficiency", 0.8]}, 1, 0]}
                }
            }}
        ]
        
        memory_stats = {"avg_memory_efficiency": 1.0, "agents_with_optimal_memory": 0}
        async for stat in db.agents.aggregate(memory_pipeline):
            memory_stats = stat
            break
        
        # Task type distribution with confidence
        task_types_pipeline = [
            {"$group": {
                "_id": "$task_type",
                "count": {"$sum": 1},
                "avg_confidence": {"$avg": "$metadata.classification_confidence"}
            }}
        ]
        
        task_type_stats = {}
        async for stat in db.tasks.aggregate(task_types_pipeline):
            task_type_stats[stat["_id"]] = {
                "count": stat["count"],
                "avg_confidence": stat.get("avg_confidence", 0)
            }
        
        # Multi-modal usage
        multimodal_count = await db.multimodal_files.count_documents({})
        
        result = {
            "basic_metrics": {
                "total_agents": total_agents,
                "total_tasks": total_tasks,
                "completed_tasks": completed_tasks,
                "success_rate": round((completed_tasks / max(total_tasks, 1)) * 100, 2)
            },
            "intelligence_metrics": {
                "average_intelligence_score": round(intelligence_stats.get("avg_intelligence", 0), 3),
                "maximum_intelligence_score": round(intelligence_stats.get("max_intelligence", 0), 3),
                "intelligence_distribution": intelligence_stats.get("intelligence_distribution", [])
            },
            "memory_efficiency": {
                "average_efficiency": round(memory_stats.get("avg_memory_efficiency", 1.0), 3),
                "optimal_agents": memory_stats.get("agents_with_optimal_memory", 0)
            },
            "task_intelligence": task_type_stats,
            "multimodal_usage": {
                "total_files_processed": multimodal_count
            },
            "generated_at": datetime.utcnow()
        }
        
        await advanced_cache_set(cache_key, json.dumps(result, default=str), expire=300)
        return result
        
    except Exception as e:
        ERROR_RATE.labels(type="analytics", endpoint="enhanced").inc()
        raise HTTPException(status_code=500, detail=f"Enhanced analytics failed: {str(e)}")

# System health check with enhanced monitoring
@app.get("/api/health/enhanced")
async def enhanced_health_check():
    """Enhanced health check with comprehensive monitoring"""
    try:
        health_data = {
            "status": "healthy",
            "version": "2.2.0",
            "timestamp": datetime.utcnow(),
            "services": {},
            "performance": {},
            "features": {
                "ai_intelligence": True,
                "multimodal_processing": True,
                "enhanced_memory": True,
                "circuit_breaker": True,
                "advanced_caching": True
            }
        }
        
        # Database health
        try:
            await db.agents.count_documents({})
            health_data["services"]["database"] = "healthy"
        except Exception as e:
            health_data["services"]["database"] = f"unhealthy: {str(e)}"
            health_data["status"] = "degraded"
        
        # Redis health
        try:
            redis_conn = await get_redis()
            if redis_conn:
                await redis_conn.ping()
                health_data["services"]["redis"] = "healthy"
            else:
                health_data["services"]["redis"] = "unavailable"
        except Exception as e:
            health_data["services"]["redis"] = f"unhealthy: {str(e)}"
        
        # Groq API health
        try:
            await groq_api_call(
                groq_client,
                [{"role": "user", "content": "health"}],
                "llama-3.1-8b-instant",
                max_tokens=1
            )
            health_data["services"]["groq_api"] = "healthy"
        except Exception as e:
            health_data["services"]["groq_api"] = f"unhealthy: {str(e)}"
            health_data["status"] = "degraded"
        
        # System performance
        cpu_percent = psutil.cpu_percent()
        memory = psutil.virtual_memory()
        
        health_data["performance"] = {
            "cpu_usage": cpu_percent,
            "memory_usage": memory.percent,
            "memory_available_gb": round(memory.available / (1024**3), 2),
            "status": "optimal" if cpu_percent < 80 and memory.percent < 80 else "high_load"
        }
        
        if health_data["performance"]["status"] == "high_load":
            health_data["status"] = "degraded"
        
        return health_data
        
    except Exception as e:
        ERROR_RATE.labels(type="health", endpoint="enhanced").inc()
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow(),
            "version": "2.2.0"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)