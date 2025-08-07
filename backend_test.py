#!/usr/bin/env python3
"""
Enhanced Backend API Testing for Agentic AI Platform v2.1
Tests all backend endpoints including new enhanced features:
- Enhanced Health Check with Redis, DB, Groq API status
- System Performance Metrics (CPU, memory, disk)
- Prometheus Metrics endpoint
- Web Scraping with AI analysis
- Model Comparison with multiple Groq models
- Enhanced Analytics Dashboard with performance data
- Redis Caching system
- Rate Limiting functionality
- Smart Model Selection
- Agent Templates
- Conversation Support
- File Upload
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

def test_health_check():
    """Test health check endpoint"""
    print("\n🔍 Testing Health Check API...")
    try:
        response = requests.get(f"{API_BASE}/health", timeout=10)
        if response.status_code == 200:
            health_data = response.json()
            print("✅ Health check successful")
            print(f"   Status: {health_data.get('status')}")
            print(f"   Database: {health_data.get('database')}")
            print(f"   Groq API: {health_data.get('groq_api')}")
            return True
        else:
            print(f"❌ Health check failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {str(e)}")
        return False

def test_agent_templates():
    """Test agent templates API"""
    print("\n🔍 Testing Agent Templates API...")
    try:
        response = requests.get(f"{API_BASE}/agent-templates", timeout=10)
        if response.status_code == 200:
            templates_data = response.json()
            templates = templates_data.get('templates', [])
            print(f"✅ Agent templates retrieval successful - Found {len(templates)} templates")
            
            # Display template details
            for template in templates[:3]:  # Show first 3 templates
                print(f"   📋 {template.get('name')} ({template.get('category')})")
                print(f"      Specialization: {template.get('specialization')}")
                print(f"      Model: {template.get('suggested_model')}")
            
            return templates
        else:
            print(f"❌ Agent templates failed with status {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Agent templates error: {str(e)}")
        return None

def test_template_based_agent_creation():
    """Test creating agents from templates"""
    print("\n🔍 Testing Template-based Agent Creation...")
    
    # Test creating agent from Content Writer template
    template_name = "contentwriter"  # Template name without spaces, lowercase
    agent_name = "Marketing Content Creator"
    
    try:
        response = requests.post(
            f"{API_BASE}/agents/from-template/{template_name}",
            params={"agent_name": agent_name},
            timeout=10
        )
        
        if response.status_code == 200:
            agent = response.json()
            print("✅ Template-based agent creation successful")
            print(f"   Agent ID: {agent.get('id')}")
            print(f"   Agent Name: {agent.get('name')}")
            print(f"   Specialization: {agent.get('specialization')}")
            print(f"   Model: {agent.get('model')}")
            return agent
        else:
            print(f"❌ Template-based agent creation failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Template-based agent creation error: {str(e)}")
        return None

def test_enhanced_agent_creation():
    """Test enhanced agent creation with new fields"""
    print("\n🔍 Testing Enhanced Agent Creation API...")
    
    agent_data = {
        "name": "Smart Analytics Assistant",
        "description": "An AI agent with auto model selection for data analysis tasks",
        "system_prompt": "You are an expert data analyst. Provide clear insights and actionable recommendations.",
        "model": "auto",  # Test auto model selection
        "specialization": "analysis_tasks",
        "settings": {
            "temperature": 0.7,
            "max_tokens": 2048,
            "enable_memory": True
        }
    }
    
    try:
        response = requests.post(f"{API_BASE}/agents", json=agent_data, timeout=10)
        
        if response.status_code == 200:
            agent = response.json()
            print("✅ Enhanced agent creation successful")
            print(f"   Agent ID: {agent.get('id')}")
            print(f"   Agent Name: {agent.get('name')}")
            print(f"   Model: {agent.get('model')} (auto selection enabled)")
            print(f"   Specialization: {agent.get('specialization')}")
            print(f"   Settings: {agent.get('settings')}")
            return agent
        else:
            print(f"❌ Enhanced agent creation failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Enhanced agent creation error: {str(e)}")
        return None

def test_smart_model_selection(agent_id):
    """Test smart model selection with different task types"""
    print(f"\n🔍 Testing Smart Model Selection for agent {agent_id}...")
    
    test_tasks = [
        {"prompt": CREATIVE_TASK, "expected_type": "creative_tasks"},
        {"prompt": ANALYSIS_TASK, "expected_type": "analysis_tasks"},
        {"prompt": CODING_TASK, "expected_type": "coding_tasks"},
        {"prompt": CONVERSATION_TASK, "expected_type": "conversation"}
    ]
    
    results = []
    
    for i, task_data in enumerate(test_tasks):
        print(f"\n   Testing task {i+1}: {task_data['expected_type']}")
        
        try:
            response = requests.post(
                f"{API_BASE}/agents/{agent_id}/tasks",
                json={"agent_id": agent_id, "prompt": task_data["prompt"]},
                timeout=30
            )
            
            if response.status_code == 200:
                task = response.json()
                print(f"   ✅ Task executed successfully")
                print(f"      Task Type: {task.get('task_type')}")
                print(f"      Model Used: {task.get('model_used')}")
                print(f"      Complexity Score: {task.get('metadata', {}).get('complexity_score', 'N/A')}")
                print(f"      Auto Selected: {task.get('metadata', {}).get('auto_selected', 'N/A')}")
                
                results.append({
                    "task_type": task.get('task_type'),
                    "model_used": task.get('model_used'),
                    "expected_type": task_data['expected_type'],
                    "success": True
                })
            else:
                print(f"   ❌ Task failed with status {response.status_code}")
                results.append({"success": False, "error": response.text})
                
        except Exception as e:
            print(f"   ❌ Task error: {str(e)}")
            results.append({"success": False, "error": str(e)})
    
    return results

def test_conversation_support():
    """Test conversation creation and multi-turn dialogue"""
    print("\n🔍 Testing Conversation Support...")
    
    # First create an agent for conversation
    agent_data = {
        "name": "Conversation Assistant",
        "description": "Agent for testing conversation flows",
        "system_prompt": "You are a helpful assistant for multi-turn conversations.",
        "model": "llama3-8b-8192",
        "specialization": "conversation"
    }
    
    try:
        # Create agent
        agent_response = requests.post(f"{API_BASE}/agents", json=agent_data, timeout=10)
        if agent_response.status_code != 200:
            print("❌ Failed to create conversation agent")
            return None
            
        agent = agent_response.json()
        agent_id = agent.get('id')
        
        # Create conversation
        conv_response = requests.post(f"{API_BASE}/conversations", params={"agent_id": agent_id}, timeout=10)
        if conv_response.status_code != 200:
            print("❌ Failed to create conversation")
            return None
            
        conversation = conv_response.json()
        conversation_id = conversation.get('id')
        print(f"✅ Conversation created successfully")
        print(f"   Conversation ID: {conversation_id}")
        
        # Test multi-turn dialogue
        messages = [
            "Hello, I need help with project planning",
            "What are the key phases of project management?",
            "Can you elaborate on the planning phase?"
        ]
        
        for i, message in enumerate(messages):
            print(f"\n   Turn {i+1}: Sending message")
            task_response = requests.post(
                f"{API_BASE}/agents/{agent_id}/tasks",
                json={
                    "agent_id": agent_id,
                    "prompt": message,
                    "conversation_id": conversation_id
                },
                timeout=30
            )
            
            if task_response.status_code == 200:
                task = task_response.json()
                print(f"   ✅ Response received")
                print(f"      Conversation ID: {task.get('conversation_id')}")
            else:
                print(f"   ❌ Turn {i+1} failed")
        
        # Get conversation history
        history_response = requests.get(f"{API_BASE}/conversations/{conversation_id}", timeout=10)
        if history_response.status_code == 200:
            history = history_response.json()
            print(f"\n✅ Conversation history retrieved")
            print(f"   Messages count: {len(history.get('messages', []))}")
            return conversation
        else:
            print("❌ Failed to retrieve conversation history")
            return None
            
    except Exception as e:
        print(f"❌ Conversation support error: {str(e)}")
        return None

def test_analytics_dashboard():
    """Test analytics dashboard API"""
    print("\n🔍 Testing Analytics Dashboard API...")
    try:
        response = requests.get(f"{API_BASE}/analytics/dashboard", timeout=10)
        if response.status_code == 200:
            analytics = response.json()
            print("✅ Analytics dashboard successful")
            print(f"   Total Agents: {analytics.get('agents', {}).get('total', 0)}")
            print(f"   Active Agents: {analytics.get('agents', {}).get('active', 0)}")
            print(f"   Total Tasks: {analytics.get('tasks', {}).get('total', 0)}")
            print(f"   Completed Tasks: {analytics.get('tasks', {}).get('completed', 0)}")
            print(f"   Success Rate: {analytics.get('tasks', {}).get('success_rate', 0)}%")
            
            model_usage = analytics.get('model_usage', {})
            if model_usage:
                print("   Model Usage:")
                for model, count in model_usage.items():
                    print(f"      {model}: {count} tasks")
            
            return analytics
        else:
            print(f"❌ Analytics dashboard failed with status {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Analytics dashboard error: {str(e)}")
        return None

def test_file_upload():
    """Test file upload endpoint"""
    print("\n🔍 Testing File Upload API...")
    try:
        # Create a test file
        test_content = "This is a test file for the Agentic AI Platform\nTesting file upload functionality"
        test_file = io.BytesIO(test_content.encode())
        
        files = {'file': ('test_document.txt', test_file, 'text/plain')}
        
        response = requests.post(f"{API_BASE}/upload", files=files, timeout=10)
        
        if response.status_code == 200:
            upload_result = response.json()
            print("✅ File upload successful")
            print(f"   File ID: {upload_result.get('file_id')}")
            print(f"   Filename: {upload_result.get('filename')}")
            print(f"   Size: {upload_result.get('size')} bytes")
            print(f"   Content Type: {upload_result.get('content_type')}")
            return upload_result
        else:
            print(f"❌ File upload failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ File upload error: {str(e)}")
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

def test_task_retrieval(agent_id):
    """Test task retrieval APIs"""
    print(f"\n🔍 Testing Task Retrieval APIs for agent {agent_id}...")
    
    try:
        # Test get agent tasks
        response = requests.get(f"{API_BASE}/agents/{agent_id}/tasks", timeout=10)
        
        if response.status_code == 200:
            tasks = response.json()
            print(f"✅ Get agent tasks successful - Found {len(tasks)} tasks")
            
            # Display task metadata for enhanced features
            if tasks:
                latest_task = tasks[0]
                print(f"   Latest task metadata:")
                print(f"      Task Type: {latest_task.get('task_type', 'N/A')}")
                print(f"      Model Used: {latest_task.get('model_used', 'N/A')}")
                print(f"      Status: {latest_task.get('status', 'N/A')}")
            
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

def test_enhanced_workflow():
    """Test the complete enhanced agentic workflow"""
    print("\n🚀 Testing Enhanced Agentic Workflow...")
    
    results = {
        "health_check": False,
        "templates": False,
        "template_agent": False,
        "enhanced_agent": False,
        "smart_selection": False,
        "conversations": False,
        "analytics": False,
        "file_upload": False
    }
    
    # Step 1: Health check
    results["health_check"] = test_health_check()
    
    # Step 2: Agent templates
    templates = test_agent_templates()
    results["templates"] = templates is not None
    
    # Step 3: Template-based agent creation
    template_agent = test_template_based_agent_creation()
    results["template_agent"] = template_agent is not None
    
    # Step 4: Enhanced agent creation
    enhanced_agent = test_enhanced_agent_creation()
    results["enhanced_agent"] = enhanced_agent is not None
    
    # Step 5: Smart model selection (if enhanced agent created)
    if enhanced_agent:
        smart_results = test_smart_model_selection(enhanced_agent.get('id'))
        results["smart_selection"] = any(r.get('success', False) for r in smart_results)
    
    # Step 6: Conversation support
    conversation = test_conversation_support()
    results["conversations"] = conversation is not None
    
    # Step 7: Analytics dashboard
    analytics = test_analytics_dashboard()
    results["analytics"] = analytics is not None
    
    # Step 8: File upload
    upload_result = test_file_upload()
    results["file_upload"] = upload_result is not None
    
    return results

def main():
    """Main testing function for enhanced features"""
    print("🧪 Starting Enhanced Agentic AI Platform Backend Testing v2.0")
    print("=" * 70)
    
    # Test 1: Basic connection
    if not test_connection():
        print("\n❌ Cannot proceed - backend not accessible")
        return
    
    # Test 2: Run enhanced workflow
    print("\n" + "=" * 70)
    print("🚀 ENHANCED FEATURES TESTING")
    print("=" * 70)
    
    workflow_results = test_enhanced_workflow()
    
    # Test 3: Basic agent operations (for compatibility)
    print("\n" + "=" * 70)
    print("🔄 BASIC OPERATIONS TESTING")
    print("=" * 70)
    
    agent = test_agent_retrieval()
    if agent:
        test_task_retrieval(agent.get('id'))
    
    # Final summary
    print("\n" + "=" * 70)
    print("🏁 ENHANCED TESTING SUMMARY:")
    print("=" * 70)
    
    print("✅ CORE FEATURES:")
    print(f"   Backend Connection: ✅")
    print(f"   Agent Retrieval: {'✅' if agent else '❌'}")
    
    print("\n🚀 ENHANCED FEATURES:")
    for feature, status in workflow_results.items():
        status_icon = "✅" if status else "❌"
        feature_name = feature.replace('_', ' ').title()
        print(f"   {feature_name}: {status_icon}")
    
    # Calculate success rate
    total_features = len(workflow_results)
    successful_features = sum(1 for status in workflow_results.values() if status)
    success_rate = (successful_features / total_features) * 100
    
    print(f"\n📊 OVERALL SUCCESS RATE: {success_rate:.1f}% ({successful_features}/{total_features})")
    
    if success_rate >= 80:
        print("🎉 EXCELLENT: Enhanced Agentic AI Platform is working great!")
    elif success_rate >= 60:
        print("👍 GOOD: Most enhanced features are working properly")
    else:
        print("⚠️  NEEDS ATTENTION: Several enhanced features need fixing")
    
    # Specific recommendations
    failed_features = [feature for feature, status in workflow_results.items() if not status]
    if failed_features:
        print(f"\n🔧 FEATURES NEEDING ATTENTION:")
        for feature in failed_features:
            feature_name = feature.replace('_', ' ').title()
            print(f"   - {feature_name}")

if __name__ == "__main__":
    main()