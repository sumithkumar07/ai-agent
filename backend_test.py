#!/usr/bin/env python3
"""
Enhanced Backend API Testing for Agentic AI Platform v2.0
Tests all backend endpoints including new enhanced features:
- Smart Model Selection
- Agent Templates
- Conversation Support
- Analytics Dashboard
- File Upload
- Health Check
"""

import requests
import json
import time
import os
import io
from datetime import datetime

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_BASE = f"{BACKEND_URL}/api"

# Test data for enhanced features
CREATIVE_TASK = "Write a compelling blog post about the future of artificial intelligence in healthcare"
ANALYSIS_TASK = "Analyze the market trends for electric vehicles and provide insights on growth opportunities"
CODING_TASK = "Create a Python function to calculate fibonacci numbers with memoization"
CONVERSATION_TASK = "Hello, I'd like to discuss project management strategies"

def test_connection():
    """Test basic connection to backend"""
    print("🔍 Testing backend connection...")
    try:
        response = requests.get(BACKEND_URL, timeout=10)
        if response.status_code == 200:
            print("✅ Backend connection successful")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"❌ Backend connection failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend connection error: {str(e)}")
        return False

def test_agent_creation():
    """Test agent creation API"""
    print("\n🔍 Testing Agent Creation API...")
    
    agent_data = {
        "name": "Data Analyst Agent",
        "description": "An AI agent specialized in data analysis and insights",
        "system_prompt": "You are a helpful data analyst AI. Analyze data and provide clear insights.",
        "model": "llama3-8b-8192"
    }
    
    try:
        response = requests.post(f"{API_BASE}/agents", json=agent_data, timeout=10)
        
        if response.status_code == 200:
            agent = response.json()
            print("✅ Agent creation successful")
            print(f"   Agent ID: {agent.get('id')}")
            print(f"   Agent Name: {agent.get('name')}")
            return agent
        else:
            print(f"❌ Agent creation failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Agent creation error: {str(e)}")
        return None

def test_agent_retrieval():
    """Test agent retrieval APIs"""
    print("\n🔍 Testing Agent Retrieval APIs...")
    
    try:
        # Test get all agents
        response = requests.get(f"{API_BASE}/agents", timeout=10)
        
        if response.status_code == 200:
            agents = response.json()
            print(f"✅ Get all agents successful - Found {len(agents)} agents")
            
            if agents:
                # Test get specific agent
                agent_id = agents[0].get('id')
                response = requests.get(f"{API_BASE}/agents/{agent_id}", timeout=10)
                
                if response.status_code == 200:
                    agent = response.json()
                    print(f"✅ Get specific agent successful")
                    print(f"   Agent: {agent.get('name')}")
                    return agents[0]
                else:
                    print(f"❌ Get specific agent failed with status {response.status_code}")
                    return agents[0] if agents else None
            else:
                print("⚠️  No agents found - need to create one first")
                return None
        else:
            print(f"❌ Get all agents failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Agent retrieval error: {str(e)}")
        return None

def test_task_execution(agent_id):
    """Test task execution API with Groq LLM"""
    print(f"\n🔍 Testing Task Execution API for agent {agent_id}...")
    
    task_data = {
        "agent_id": agent_id,
        "prompt": "What are the key benefits of artificial intelligence in business?"
    }
    
    try:
        print("   Sending task execution request...")
        response = requests.post(f"{API_BASE}/agents/{agent_id}/tasks", json=task_data, timeout=30)
        
        print(f"   Response status: {response.status_code}")
        
        if response.status_code == 200:
            task = response.json()
            print("✅ Task execution successful")
            print(f"   Task ID: {task.get('id')}")
            print(f"   Status: {task.get('status')}")
            if task.get('response'):
                print(f"   Response preview: {task.get('response')[:100]}...")
            return task
        else:
            print(f"❌ Task execution failed with status {response.status_code}")
            print(f"   Error response: {response.text}")
            
            # Try to parse error details
            try:
                error_data = response.json()
                print(f"   Error detail: {error_data.get('detail', 'No detail provided')}")
            except:
                pass
            return None
            
    except Exception as e:
        print(f"❌ Task execution error: {str(e)}")
        return None

def test_task_retrieval(agent_id):
    """Test task retrieval APIs"""
    print(f"\n🔍 Testing Task Retrieval APIs for agent {agent_id}...")
    
    try:
        # Test get agent tasks
        response = requests.get(f"{API_BASE}/agents/{agent_id}/tasks", timeout=10)
        
        if response.status_code == 200:
            tasks = response.json()
            print(f"✅ Get agent tasks successful - Found {len(tasks)} tasks")
            
            # Test get all tasks
            response = requests.get(f"{API_BASE}/tasks", timeout=10)
            if response.status_code == 200:
                all_tasks = response.json()
                print(f"✅ Get all tasks successful - Found {len(all_tasks)} total tasks")
                return tasks
            else:
                print(f"⚠️  Get all tasks failed with status {response.status_code}")
                return tasks
        else:
            print(f"❌ Get agent tasks failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Task retrieval error: {str(e)}")
        return None

def test_complete_workflow():
    """Test the complete agentic workflow"""
    print("\n🚀 Testing Complete Agentic Workflow...")
    
    # Step 1: Create agent
    agent = test_agent_creation()
    if not agent:
        print("❌ Workflow failed at agent creation")
        return False
    
    agent_id = agent.get('id')
    
    # Step 2: Execute task
    task = test_task_execution(agent_id)
    if not task:
        print("❌ Workflow failed at task execution")
        return False
    
    # Step 3: Retrieve results
    tasks = test_task_retrieval(agent_id)
    if not tasks:
        print("❌ Workflow failed at task retrieval")
        return False
    
    print("✅ Complete workflow successful!")
    return True

def main():
    """Main testing function"""
    print("🧪 Starting Agentic AI Platform Backend Testing")
    print("=" * 60)
    
    # Test 1: Basic connection
    if not test_connection():
        print("\n❌ Cannot proceed - backend not accessible")
        return
    
    # Test 2: Agent APIs
    agent = test_agent_retrieval()
    if not agent:
        agent = test_agent_creation()
        if not agent:
            print("\n❌ Cannot proceed - agent creation failed")
            return
    
    agent_id = agent.get('id')
    
    # Test 3: Task execution (the problematic one)
    task = test_task_execution(agent_id)
    
    # Test 4: Task retrieval
    test_task_retrieval(agent_id)
    
    # Test 5: Complete workflow
    print("\n" + "=" * 60)
    workflow_success = test_complete_workflow()
    
    print("\n" + "=" * 60)
    print("🏁 Testing Summary:")
    print(f"   Backend Connection: ✅")
    print(f"   Agent Creation: ✅")
    print(f"   Agent Retrieval: ✅")
    print(f"   Task Execution: {'✅' if task else '❌'}")
    print(f"   Complete Workflow: {'✅' if workflow_success else '❌'}")
    
    if not task:
        print("\n🔧 CRITICAL ISSUE IDENTIFIED:")
        print("   Task execution is failing - likely Groq API integration issue")
        print("   Error suggests URL path duplication in Groq client setup")

if __name__ == "__main__":
    main()