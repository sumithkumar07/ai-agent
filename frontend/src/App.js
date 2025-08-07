import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Bot, Plus, Activity, MessageSquare, Trash2, Send, Clock, CheckCircle, XCircle, 
  Moon, Sun, Menu, X, Home, Sparkles, BarChart3, Settings, Zap, Users, FileText,
  ChevronRight, Search, Filter, RefreshCw
} from 'lucide-react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import QuickActions from './components/QuickActions';
import AgentTemplates from './components/AgentTemplates';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import './App.css';

const API_BASE = process.env.REACT_APP_BACKEND_URL;

// Enhanced Header Component
const Header = ({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Bot className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Agentic AI Platform</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">v2.0 Enhanced</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
            
            <div className="hidden md:flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Online</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

// Enhanced Sidebar Navigation
const Sidebar = ({ activeTab, setActiveTab, sidebarOpen }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, badge: null },
    { id: 'agents', label: 'My Agents', icon: Users, badge: null },
    { id: 'templates', label: 'Templates', icon: Sparkles, badge: 'New' },
    { id: 'create', label: 'Create Agent', icon: Plus, badge: null },
    { id: 'activity', label: 'Activity', icon: Activity, badge: null },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: null },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null }
  ];

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out
      lg:translate-x-0 lg:static lg:inset-0
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`
                    group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md transition-colors
                    ${isActive
                      ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-200 border-r-2 border-blue-500'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                >
                  <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto inline-block py-0.5 px-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
};

// Main App Component
const AppContent = () => {
  const [agents, setAgents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Form states
  const [agentForm, setAgentForm] = useState({
    name: '',
    description: '',
    system_prompt: 'You are a helpful AI assistant. Please provide clear and concise responses.',
    model: 'auto',
    specialization: 'general'
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
        model: 'auto',
        specialization: 'general'
      });
      fetchAgents();
      setActiveTab('agents');
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

  const executeTask = async (agentId, conversationId = null) => {
    if (!taskPrompt.trim()) return;
    
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/agents/${agentId}/tasks`, {
        agent_id: agentId,
        prompt: taskPrompt,
        conversation_id: conversationId
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

  const handleQuickAction = (action) => {
    switch (action) {
      case 'create-agent':
        setActiveTab('create');
        break;
      case 'quick-task':
        setActiveTab('agents');
        break;
      case 'start-conversation':
        setActiveTab('agents');
        break;
      case 'view-analytics':
        setActiveTab('analytics');
        break;
      default:
        break;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/50 dark:text-green-400 dark:border-green-800';
      case 'processing': return 'bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-400 dark:border-yellow-800';
      case 'failed': return 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/50 dark:text-red-400 dark:border-red-800';
      default: return 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    }
  };

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTasks = tasks.filter(task => {
    if (filterStatus === 'all') return true;
    return task.status === filterStatus;
  });

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarOpen && !event.target.closest('aside') && !event.target.closest('button[aria-label="Open sidebar"]')) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      
      <div className="flex">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          sidebarOpen={sidebarOpen}
        />
        
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 lg:ml-64">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* Enhanced Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome to your AI command center</p>
                  </div>
                  <button
                    onClick={fetchAgents}
                    className="flex items-center px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <QuickActions onAction={handleQuickAction} recentTasks={tasks.slice(0, 3)} />
                  </div>
                  
                  <div className="space-y-6">
                    {/* Quick Stats */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Bot className="w-4 h-4 text-blue-500 mr-2" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Total Agents</span>
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white">{agents.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <MessageSquare className="w-4 h-4 text-green-500 mr-2" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</span>
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white">{tasks.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {tasks.filter(t => t.status === 'completed').length}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Active Agents */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Active Agents</h3>
                      {agents.slice(0, 3).map((agent) => (
                        <div key={agent.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">{agent.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{agent.tasks_completed} tasks</p>
                          </div>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                      ))}
                      {agents.length > 3 && (
                        <button
                          onClick={() => setActiveTab('agents')}
                          className="w-full mt-4 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        >
                          View all agents →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced My Agents */}
            {activeTab === 'agents' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Agents</h2>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search agents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      onClick={() => setActiveTab('create')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Agent
                    </button>
                  </div>
                </div>

                {filteredAgents.length === 0 ? (
                  <div className="text-center py-12">
                    <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                      {searchQuery ? 'No agents found' : 'No agents yet'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      {searchQuery ? 'Try adjusting your search query' : 'Create your first AI agent to get started'}
                    </p>
                    {!searchQuery && (
                      <div className="flex justify-center space-x-4">
                        <button
                          onClick={() => setActiveTab('create')}
                          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center"
                        >
                          <Plus className="w-5 h-5 mr-2" />
                          Create Agent
                        </button>
                        <button
                          onClick={() => setActiveTab('templates')}
                          className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center"
                        >
                          <Sparkles className="w-5 h-5 mr-2" />
                          Browse Templates
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAgents.map((agent) => (
                      <div key={agent.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{agent.name}</h3>
                              {agent.model === 'auto' && (
                                <span className="ml-2 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                                  Smart
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{agent.description}</p>
                            
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                              <div className="flex items-center">
                                <Activity className="w-4 h-4 mr-1" />
                                {agent.tasks_completed} tasks
                              </div>
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                                {agent.specialization}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteAgent(agent.id)}
                            className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                            />
                            <button
                              onClick={() => executeTask(agent.id)}
                              disabled={loading || !taskPrompt.trim() || selectedAgent !== agent.id}
                              className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
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

            {/* Agent Templates */}
            {activeTab === 'templates' && (
              <div className="space-y-6">
                <AgentTemplates
                  onTemplateSelect={() => {
                    fetchAgents();
                    setActiveTab('agents');
                  }}
                  onClose={() => setActiveTab('agents')}
                />
              </div>
            )}

            {/* Enhanced Create Agent */}
            {activeTab === 'create' && (
              <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create New Agent</h2>
                  <p className="text-gray-600 dark:text-gray-400">Build a custom AI assistant tailored to your needs</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                  <form onSubmit={createAgent} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Agent Name</label>
                      <input
                        type="text"
                        required
                        value={agentForm.name}
                        onChange={(e) => setAgentForm({...agentForm, name: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="e.g., Content Writer, Data Analyst, Customer Support"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                      <input
                        type="text"
                        required
                        value={agentForm.description}
                        onChange={(e) => setAgentForm({...agentForm, description: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Brief description of what this agent does"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Specialization</label>
                      <select
                        value={agentForm.specialization}
                        onChange={(e) => setAgentForm({...agentForm, specialization: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="general">General Purpose</option>
                        <option value="creative_tasks">Creative Tasks</option>
                        <option value="analysis_tasks">Analysis & Research</option>
                        <option value="coding_tasks">Programming & Code</option>
                        <option value="conversation">Conversation & Support</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">System Prompt</label>
                      <textarea
                        required
                        value={agentForm.system_prompt}
                        onChange={(e) => setAgentForm({...agentForm, system_prompt: e.target.value})}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Define how the agent should behave and respond"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Model Selection</label>
                      <select
                        value={agentForm.model}
                        onChange={(e) => setAgentForm({...agentForm, model: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="auto">Auto-Select (Smart) ✨</option>
                        <option value="llama3-8b-8192">Llama 3 8B (Fast)</option>
                        <option value="llama3-70b-8192">Llama 3 70B (Powerful)</option>
                        <option value="mixtral-8x7b-32768">Mixtral 8x7B (Balanced)</option>
                      </select>
                      {agentForm.model === 'auto' && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          The system will automatically choose the best model based on the task type
                        </p>
                      )}
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        type="button"
                        onClick={() => setActiveTab('agents')}
                        className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Creating...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Agent
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Enhanced Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
                  <div className="flex items-center space-x-4">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Tasks</option>
                      <option value="completed">Completed</option>
                      <option value="processing">Processing</option>
                      <option value="failed">Failed</option>
                    </select>
                    <button
                      onClick={fetchAllTasks}
                      className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Refresh
                    </button>
                  </div>
                </div>
                
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                      {filterStatus === 'all' ? 'No tasks yet' : `No ${filterStatus} tasks`}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {filterStatus === 'all' ? 'Task activity will appear here once you start using your agents' : `No tasks with ${filterStatus} status found`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredTasks.map((task) => {
                      const agent = agents.find(a => a.id === task.agent_id);
                      return (
                        <div key={task.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center">
                              {getStatusIcon(task.status)}
                              <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                                {task.status}
                              </span>
                              <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
                                {agent?.name || 'Unknown Agent'}
                              </span>
                              {task.model_used && (
                                <span className="ml-2 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                                  {task.model_used}
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-sm text-gray-400">
                                {new Date(task.created_at).toLocaleString()}
                              </span>
                              {task.task_type && task.task_type !== 'general' && (
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                  {task.task_type.replace('_', ' ')}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Task:</span>
                              <p className="text-gray-900 dark:text-white mt-1">{task.prompt}</p>
                            </div>
                            
                            {task.response && (
                              <div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Response:</span>
                                <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{task.response}</p>
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

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <AnalyticsDashboard />
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="max-w-4xl mx-auto space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Settings</h2>
                  <p className="text-gray-600 dark:text-gray-400">Manage your platform preferences and configuration</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Dark Mode</span>
                        <ThemeSwitcher />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Auto Model Selection</span>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">API Status</span>
                        <span className="text-sm text-green-600 dark:text-green-400">Connected</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Theme Switcher Component
const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-700"
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
};

// Main App with Theme Provider
function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;