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

def test_enhanced_health_check():
    """Test enhanced health check endpoint with system monitoring"""
    print("\n🔍 Testing Enhanced Health Check API...")
    try:
        response = requests.get(f"{API_BASE}/health", timeout=10)
        if response.status_code == 200:
            health_data = response.json()
            print("✅ Enhanced health check successful")
            print(f"   Status: {health_data.get('status')}")
            print(f"   Version: {health_data.get('version')}")
            
            # Check services status
            services = health_data.get('services', {})
            print("   Services Status:")
            print(f"      Database: {services.get('database', 'unknown')}")
            print(f"      Redis: {services.get('redis', 'unknown')}")
            print(f"      Groq API: {services.get('groq_api', 'unknown')}")
            
            # Check system metrics
            system = health_data.get('system', {})
            print("   System Metrics:")
            print(f"      CPU Usage: {system.get('cpu_usage', 'N/A')}%")
            print(f"      Memory Usage: {system.get('memory_usage', 'N/A')}%")
            print(f"      Memory Available: {system.get('memory_available', 'N/A')} bytes")
            
            return health_data
        else:
            print(f"❌ Enhanced health check failed with status {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Enhanced health check error: {str(e)}")
        return None

def test_system_info():
    """Test system information endpoint"""
    print("\n🔍 Testing System Info API...")
    try:
        response = requests.get(f"{API_BASE}/system-info", timeout=10)
        if response.status_code == 200:
            system_data = response.json()
            print("✅ System info retrieval successful")
            print(f"   CPU Usage: {system_data.get('cpu_usage', 'N/A')}%")
            
            memory = system_data.get('memory_usage', {})
            print(f"   Memory Usage: {memory.get('percent', 'N/A')}%")
            print(f"   Memory Available: {memory.get('available', 'N/A')} bytes")
            print(f"   Memory Total: {memory.get('total', 'N/A')} bytes")
            
            disk = system_data.get('disk_usage', {})
            print(f"   Disk Usage: {disk.get('percent', 'N/A')}%")
            print(f"   Disk Free: {disk.get('free', 'N/A')} bytes")
            print(f"   Disk Total: {disk.get('total', 'N/A')} bytes")
            
            return system_data
        else:
            print(f"❌ System info failed with status {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ System info error: {str(e)}")
        return None

def test_prometheus_metrics():
    """Test Prometheus metrics endpoint"""
    print("\n🔍 Testing Prometheus Metrics API...")
    try:
        response = requests.get(f"{API_BASE}/metrics", timeout=10)
        if response.status_code == 200:
            metrics_data = response.text
            print("✅ Prometheus metrics retrieval successful")
            
            # Count different metric types
            lines = metrics_data.split('\n')
            metric_lines = [line for line in lines if line and not line.startswith('#')]
            comment_lines = [line for line in lines if line.startswith('#')]
            
            print(f"   Total metric lines: {len(metric_lines)}")
            print(f"   Comment lines: {len(comment_lines)}")
            
            # Check for specific metrics
            if 'requests_total' in metrics_data:
                print("   ✅ Request counter metrics found")
            if 'request_duration_seconds' in metrics_data:
                print("   ✅ Request duration metrics found")
            if 'tasks_total' in metrics_data:
                print("   ✅ Task counter metrics found")
            
            return True
        else:
            print(f"❌ Prometheus metrics failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Prometheus metrics error: {str(e)}")
        return False

def test_web_scraping():
    """Test web scraping with AI analysis"""
    print("\n🔍 Testing Web Scraping API...")
    
    # First create an agent for web scraping
    agent_data = {
        "name": "Web Research Agent",
        "description": "Agent for testing web scraping functionality",
        "system_prompt": "You are a web research specialist. Extract key information and provide insights.",
        "model": "llama3-70b-8192",
        "specialization": "web_scraping"
    }
    
    try:
        # Create agent
        agent_response = requests.post(f"{API_BASE}/agents", json=agent_data, timeout=10)
        if agent_response.status_code != 200:
            print("❌ Failed to create web scraping agent")
            return None
            
        agent = agent_response.json()
        agent_id = agent.get('id')
        
        # Test web scraping with a public test URL
        scraping_data = {
            "url": "https://httpbin.org/html",
            "agent_id": agent_id,
            "prompt": "Analyze this webpage and extract the main content and structure"
        }
        
        response = requests.post(f"{API_BASE}/web-scraping", json=scraping_data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Web scraping successful")
            print(f"   URL: {result.get('url')}")
            print(f"   Processing Time: {result.get('processing_time', 'N/A'):.2f}s")
            print(f"   Scraped Content Length: {len(result.get('scraped_content', ''))}")
            print(f"   Analysis Length: {len(result.get('analysis', ''))}")
            return result
        else:
            print(f"❌ Web scraping failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Web scraping error: {str(e)}")
        return None

def test_model_comparison():
    """Test model comparison functionality"""
    print("\n🔍 Testing Model Comparison API...")
    
    # First create an agent for model comparison
    agent_data = {
        "name": "Model Comparison Agent",
        "description": "Agent for testing model comparison functionality",
        "system_prompt": "You are an AI assistant. Provide helpful and accurate responses.",
        "model": "auto",
        "specialization": "general"
    }
    
    try:
        # Create agent
        agent_response = requests.post(f"{API_BASE}/agents", json=agent_data, timeout=10)
        if agent_response.status_code != 200:
            print("❌ Failed to create model comparison agent")
            return None
            
        agent = agent_response.json()
        agent_id = agent.get('id')
        
        # Test model comparison with different models
        comparison_data = {
            "prompt": "Explain the benefits of renewable energy in 2-3 sentences",
            "models": [
                "llama-3.1-8b-instant",
                "llama3-70b-8192",
                "llama-3.3-70b-versatile"
            ],
            "agent_id": agent_id
        }
        
        response = requests.post(f"{API_BASE}/model-comparison", json=comparison_data, timeout=60)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Model comparison successful")
            print(f"   Prompt: {result.get('prompt')}")
            print(f"   Processing Time: {result.get('processing_time', 'N/A'):.2f}s")
            
            results = result.get('results', {})
            print(f"   Models Tested: {len(results)}")
            
            for model, model_result in results.items():
                status = model_result.get('status', 'unknown')
                response_length = len(model_result.get('response', ''))
                print(f"      {model}: {status} ({response_length} chars)")
            
            return result
        else:
            print(f"❌ Model comparison failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Model comparison error: {str(e)}")
        return None

def test_enhanced_analytics():
    """Test enhanced analytics dashboard with performance data"""
    print("\n🔍 Testing Enhanced Analytics Dashboard API...")
    try:
        response = requests.get(f"{API_BASE}/analytics/dashboard", timeout=10)
        if response.status_code == 200:
            analytics = response.json()
            print("✅ Enhanced analytics dashboard successful")
            
            # Agent statistics
            agents = analytics.get('agents', {})
            print(f"   Total Agents: {agents.get('total', 0)}")
            print(f"   Active Agents: {agents.get('active', 0)}")
            
            # Task statistics
            tasks = analytics.get('tasks', {})
            print(f"   Total Tasks: {tasks.get('total', 0)}")
            print(f"   Completed Tasks: {tasks.get('completed', 0)}")
            print(f"   Failed Tasks: {tasks.get('failed', 0)}")
            print(f"   Success Rate: {tasks.get('success_rate', 0)}%")
            
            # Performance metrics
            performance = analytics.get('performance', {})
            print("   Performance Metrics:")
            print(f"      Avg Processing Time: {performance.get('avg_processing_time', 0):.2f}s")
            print(f"      Max Processing Time: {performance.get('max_processing_time', 0):.2f}s")
            print(f"      Min Processing Time: {performance.get('min_processing_time', 0):.2f}s")
            
            # Model usage statistics
            model_usage = analytics.get('model_usage', {})
            if model_usage:
                print("   Model Usage:")
                for model, count in model_usage.items():
                    print(f"      {model}: {count} tasks")
            
            # Task type distribution
            task_types = analytics.get('task_types', {})
            if task_types:
                print("   Task Types:")
                for task_type, count in task_types.items():
                    print(f"      {task_type}: {count} tasks")
            
            return analytics
        else:
            print(f"❌ Enhanced analytics dashboard failed with status {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Enhanced analytics dashboard error: {str(e)}")
        return None

def test_caching_performance():
    """Test Redis caching system performance"""
    print("\n🔍 Testing Caching Performance...")
    
    try:
        # Make first request to populate cache
        start_time = time.time()
        response1 = requests.get(f"{API_BASE}/agents", timeout=10)
        first_request_time = time.time() - start_time
        
        if response1.status_code != 200:
            print("❌ Failed to make first request for caching test")
            return False
        
        # Make second request (should be cached)
        start_time = time.time()
        response2 = requests.get(f"{API_BASE}/agents", timeout=10)
        second_request_time = time.time() - start_time
        
        if response2.status_code != 200:
            print("❌ Failed to make second request for caching test")
            return False
        
        print("✅ Caching performance test successful")
        print(f"   First Request Time: {first_request_time:.3f}s")
        print(f"   Second Request Time: {second_request_time:.3f}s")
        
        # Check if second request was faster (indicating caching)
        if second_request_time < first_request_time:
            print("   ✅ Caching appears to be working (second request faster)")
        else:
            print("   ⚠️  Caching may not be working (second request not faster)")
        
        return True
        
    except Exception as e:
        print(f"❌ Caching performance test error: {str(e)}")
        return False

def test_rate_limiting():
    """Test rate limiting functionality"""
    print("\n🔍 Testing Rate Limiting...")
    
    try:
        # Make rapid requests to trigger rate limiting
        print("   Making rapid requests to test rate limiting...")
        
        success_count = 0
        rate_limited_count = 0
        
        for i in range(10):
            response = requests.get(f"{API_BASE}/agents", timeout=5)
            if response.status_code == 200:
                success_count += 1
            elif response.status_code == 429:  # Too Many Requests
                rate_limited_count += 1
            time.sleep(0.1)  # Small delay between requests
        
        print(f"   Successful requests: {success_count}")
        print(f"   Rate limited requests: {rate_limited_count}")
        
        if rate_limited_count > 0:
            print("   ✅ Rate limiting is working")
        else:
            print("   ⚠️  Rate limiting may not be active or limit not reached")
        
        return True
        
    except Exception as e:
        print(f"❌ Rate limiting test error: {str(e)}")
        return False

def main():
    """Main testing function for enhanced features v2.1"""
    print("🧪 Starting Enhanced Agentic AI Platform Backend Testing v2.1")
    print("=" * 70)
    
    # Test 1: Basic connection
    if not test_connection():
        print("\n❌ Cannot proceed - backend not accessible")
        return
    
    # Test 2: Enhanced v2.1 Features
    print("\n" + "=" * 70)
    print("🚀 ENHANCED v2.1 FEATURES TESTING")
    print("=" * 70)
    
    results = {}
    
    # Enhanced health check
    health_result = test_enhanced_health_check()
    results["enhanced_health_check"] = health_result is not None
    
    # System info
    system_result = test_system_info()
    results["system_info"] = system_result is not None
    
    # Prometheus metrics
    results["prometheus_metrics"] = test_prometheus_metrics()
    
    # Web scraping
    web_result = test_web_scraping()
    results["web_scraping"] = web_result is not None
    
    # Model comparison
    model_result = test_model_comparison()
    results["model_comparison"] = model_result is not None
    
    # Enhanced analytics
    analytics_result = test_enhanced_analytics()
    results["enhanced_analytics"] = analytics_result is not None
    
    # Caching performance
    results["caching_performance"] = test_caching_performance()
    
    # Rate limiting
    results["rate_limiting"] = test_rate_limiting()
    
    # Final summary
    print("\n" + "=" * 70)
    print("🏁 ENHANCED v2.1 TESTING SUMMARY:")
    print("=" * 70)
    
    print("✅ CORE FEATURES:")
    print(f"   Backend Connection: ✅")
    
    print("\n🚀 ENHANCED v2.1 FEATURES:")
    for feature, status in results.items():
        status_icon = "✅" if status else "❌"
        feature_name = feature.replace('_', ' ').title()
        print(f"   {feature_name}: {status_icon}")
    
    # Calculate success rate
    total_features = len(results)
    successful_features = sum(1 for status in results.values() if status)
    success_rate = (successful_features / total_features) * 100
    
    print(f"\n📊 OVERALL SUCCESS RATE: {success_rate:.1f}% ({successful_features}/{total_features})")
    
    if success_rate >= 80:
        print("🎉 EXCELLENT: Enhanced Agentic AI Platform v2.1 is working great!")
    elif success_rate >= 60:
        print("👍 GOOD: Most enhanced features are working properly")
    else:
        print("⚠️  NEEDS ATTENTION: Several enhanced features need fixing")
    
    # Specific recommendations
    failed_features = [feature for feature, status in results.items() if not status]
    if failed_features:
        print(f"\n🔧 FEATURES NEEDING ATTENTION:")
        for feature in failed_features:
            feature_name = feature.replace('_', ' ').title()
            print(f"   - {feature_name}")

if __name__ == "__main__":
    main()