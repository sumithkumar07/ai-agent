import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bot, Plus, Activity, MessageSquare, Trash2, Send, Clock, CheckCircle, XCircle } from 'lucide-react';
import './App.css';

const API_BASE = process.env.REACT_APP_BACKEND_URL;

function App() {
  const [agents, setAgents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [agentForm, setAgentForm] = useState({
    name: '',
    description: '',
    system_prompt: 'You are a helpful AI assistant. Please provide clear and concise responses.',
    model: 'llama3-8b-8192'
  });
  const [taskPrompt, setTaskPrompt] = useState('');

  useEffect(() => {
    fetchAgents();
    fetchAllTasks();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/agents`);
      setAgents(response.data);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const fetchAllTasks = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const createAgent = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/agents`, agentForm);
      setAgentForm({
        name: '',
        description: '',
        system_prompt: 'You are a helpful AI assistant. Please provide clear and concise responses.',
        model: 'llama3-8b-8192'
      });
      fetchAgents();
      setActiveTab('dashboard');
    } catch (error) {
      console.error('Error creating agent:', error);
      alert('Failed to create agent');
    }
    setLoading(false);
  };

  const deleteAgent = async (agentId) => {
    if (window.confirm('Are you sure you want to delete this agent? This will also delete all its tasks.')) {
      try {
        await axios.delete(`${API_BASE}/api/agents/${agentId}`);
        fetchAgents();
        fetchAllTasks();
        setSelectedAgent(null);
      } catch (error) {
        console.error('Error deleting agent:', error);
        alert('Failed to delete agent');
      }
    }
  };

  const executeTask = async (agentId) => {
    if (!taskPrompt.trim()) return;
    
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/agents/${agentId}/tasks`, {
        agent_id: agentId,
        prompt: taskPrompt
      });
      setTaskPrompt('');
      fetchAllTasks();
      fetchAgents();
    } catch (error) {
      console.error('Error executing task:', error);
      alert('Failed to execute task');
    }
    setLoading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-success-500" />;
      case 'processing': return <Clock className="w-4 h-4 text-warning-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-danger-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-success-50 text-success-600 border-success-200';
      case 'processing': return 'bg-warning-50 text-warning-600 border-warning-200';
      case 'failed': return 'bg-danger-50 text-danger-600 border-danger-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Bot className="w-8 h-8 text-primary-500 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Agentic AI Platform</h1>
            </div>
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`${activeTab === 'dashboard' 
                  ? 'text-primary-600 border-primary-600' 
                  : 'text-gray-500 hover:text-gray-700 border-transparent'
                } border-b-2 pb-1 px-1 font-medium`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`${activeTab === 'create' 
                  ? 'text-primary-600 border-primary-600' 
                  : 'text-gray-500 hover:text-gray-700 border-transparent'
                } border-b-2 pb-1 px-1 font-medium`}
              >
                Create Agent
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`${activeTab === 'activity' 
                  ? 'text-primary-600 border-primary-600' 
                  : 'text-gray-500 hover:text-gray-700 border-transparent'
                } border-b-2 pb-1 px-1 font-medium`}
              >
                Activity
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Your AI Agents</h2>
              <button
                onClick={() => setActiveTab('create')}
                className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Agent
              </button>
            </div>

            {agents.length === 0 ? (
              <div className="text-center py-12">
                <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No agents yet</h3>
                <p className="text-gray-600 mb-4">Create your first AI agent to get started</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600"
                >
                  Create Agent
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.map((agent) => (
                  <div key={agent.id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
                        <p className="text-gray-600 text-sm mt-1">{agent.description}</p>
                      </div>
                      <button
                        onClick={() => deleteAgent(agent.id)}
                        className="text-gray-400 hover:text-danger-500 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Activity className="w-4 h-4 mr-1" />
                        {agent.tasks_completed} tasks completed
                      </div>
                      <div className="text-xs text-gray-400">
                        Model: {agent.model}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Give this agent a task..."
                          value={selectedAgent === agent.id ? taskPrompt : ''}
                          onChange={(e) => {
                            setTaskPrompt(e.target.value);
                            setSelectedAgent(agent.id);
                          }}
                          onFocus={() => setSelectedAgent(agent.id)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                        <button
                          onClick={() => executeTask(agent.id)}
                          disabled={loading || !taskPrompt.trim() || selectedAgent !== agent.id}
                          className="bg-primary-500 text-white px-3 py-2 rounded-lg hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Agent Tab */}
        {activeTab === 'create' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Agent</h2>
            
            <form onSubmit={createAgent} className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Agent Name</label>
                <input
                  type="text"
                  required
                  value={agentForm.name}
                  onChange={(e) => setAgentForm({...agentForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Content Writer, Data Analyst, Customer Support"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  required
                  value={agentForm.description}
                  onChange={(e) => setAgentForm({...agentForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Brief description of what this agent does"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">System Prompt</label>
                <textarea
                  required
                  value={agentForm.system_prompt}
                  onChange={(e) => setAgentForm({...agentForm, system_prompt: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Define how the agent should behave and respond"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                <select
                  value={agentForm.model}
                  onChange={(e) => setAgentForm({...agentForm, model: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="llama3-8b-8192">Llama 3 8B (Fast)</option>
                  <option value="llama3-70b-8192">Llama 3 70B (Powerful)</option>
                  <option value="mixtral-8x7b-32768">Mixtral 8x7B (Balanced)</option>
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Agent'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
            
            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
                <p className="text-gray-600">Task activity will appear here once you start using your agents</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => {
                  const agent = agents.find(a => a.id === task.agent_id);
                  return (
                    <div key={task.id} className="bg-white rounded-lg shadow-sm border p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          {getStatusIcon(task.status)}
                          <span className={`ml-2 px-2 py-1 rounded text-xs font-medium border ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                          <span className="ml-3 text-sm text-gray-600">
                            {agent?.name || 'Unknown Agent'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-400">
                          {new Date(task.created_at).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Task:</span>
                          <p className="text-gray-900 mt-1">{task.prompt}</p>
                        </div>
                        
                        {task.response && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Response:</span>
                            <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                              <p className="text-gray-900 whitespace-pre-wrap">{task.response}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;