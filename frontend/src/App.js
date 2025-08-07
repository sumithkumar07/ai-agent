import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Bot, Plus, Activity, MessageSquare, Trash2, Send, Clock, CheckCircle, XCircle, 
  Moon, Sun, Menu, X, Home, Sparkles, BarChart3, Settings, Zap, Users, FileText,
  ChevronRight, Search, Filter, RefreshCw, Globe, GitCompare, TrendingUp, AlertCircle,
  Brain, Upload, Star, Lightbulb
} from 'lucide-react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import EnhancedQuickActions from './components/EnhancedQuickActions';
import OnboardingGuide from './components/OnboardingGuide';
import EnhancedTaskInterface from './components/EnhancedTaskInterface';
import AgentTemplates from './components/AgentTemplates';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import AccessibleButton from './components/AccessibleButton';
import AccessibleInput from './components/AccessibleInput';
import ModelComparison from './components/ModelComparison';
import WebScrapingTool from './components/WebScrapingTool';
import DataVisualization from './components/DataVisualization';
import './App.css';

const API_BASE = process.env.REACT_APP_BACKEND_URL;

// Skip Navigation Component for Accessibility
const SkipNavigation = () => (
  <div className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 z-50">
    <a
      href="#main-content"
      className="bg-blue-600 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
    >
      Skip to main content
    </a>
  </div>
);

// Enhanced Header Component with Accessibility
const Header = ({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header 
      className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40"
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <AccessibleButton
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              ariaLabel={sidebarOpen ? "Close navigation menu" : "Open navigation menu"}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </AccessibleButton>
            
            <div className="flex items-center ml-2 lg:ml-0">
              <div className="p-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mr-3">
                <Bot className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Agentic AI Platform</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                  v2.2 Enhanced • Intelligence & Performance
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <AccessibleButton
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              ariaLabel={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </AccessibleButton>
            
            <div className="hidden md:flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" aria-hidden="true"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Online</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

// Enhanced Sidebar Navigation with Accessibility
const Sidebar = ({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, badge: null, description: 'Main dashboard overview' },
    { id: 'agents', label: 'My Agents', icon: Users, badge: null, description: 'Manage your AI agents' },
    { id: 'templates', label: 'Templates', icon: Sparkles, badge: 'New', description: 'Pre-built agent templates' },
    { id: 'create', label: 'Create Agent', icon: Plus, badge: null, description: 'Create a new AI agent' },
    { id: 'activity', label: 'Activity', icon: Activity, badge: null, description: 'Recent task activity' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: null, description: 'Performance analytics' },
    { id: 'web-scraping', label: 'Web Scraping', icon: Globe, badge: 'New', description: 'Extract data from websites' },
    { id: 'model-comparison', label: 'Model Compare', icon: GitCompare, badge: 'New', description: 'Compare AI model responses' },
    { id: 'data-viz', label: 'Data Visualization', icon: TrendingUp, badge: 'New', description: 'Create charts and graphs' },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null, description: 'Platform settings' }
  ];

  const handleNavigation = (itemId) => {
    setActiveTab(itemId);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const handleKeyDown = (e, itemId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleNavigation(itemId);
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <nav className="mt-5 flex-1 px-2 space-y-1" role="list">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <div
                    key={item.id}
                    role="listitem"
                    tabIndex={0}
                    onClick={() => handleNavigation(item.id)}
                    onKeyDown={(e) => handleKeyDown(e, item.id)}
                    className={`
                      group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                      ${isActive
                        ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-200 border-r-2 border-blue-500'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                      }
                    `}
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={`${item.label} - ${item.description}`}
                  >
                    <Icon 
                      className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`}
                      aria-hidden="true"
                    />
                    {item.label}
                    {item.badge && (
                      <span className="ml-auto inline-block py-0.5 px-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight className="ml-auto h-4 w-4" aria-hidden="true" />}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center p-8">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We're sorry, but something unexpected happened. Please refresh the page.
            </p>
            <AccessibleButton
              onClick={() => window.location.reload()}
              ariaLabel="Reload page"
            >
              Reload Page
            </AccessibleButton>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

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
  const [error, setError] = useState('');
  const [systemHealth, setSystemHealth] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [enhancedFeatures, setEnhancedFeatures] = useState({
    intelligenceScore: 0,
    memoryEfficiency: 0,
    multimodalCount: 0
  });
  
  // Form states
  const [agentForm, setAgentForm] = useState({
    name: '',
    description: '',
    system_prompt: 'You are a helpful AI assistant. Please provide clear and concise responses.',
    model: 'auto',
    specialization: 'general'
  });
  const [taskPrompt, setTaskPrompt] = useState('');

  // Refs for focus management
  const mainContentRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    fetchAgents();
    fetchAllTasks();
    checkSystemHealth();
    fetchEnhancedFeatures();
    
    // Check if user has completed onboarding
    const onboardingCompleted = localStorage.getItem('onboarding_completed');
    if (!onboardingCompleted) {
      setShowOnboarding(true);
    }
  }, []);

  const fetchEnhancedFeatures = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/analytics/enhanced`);
      setEnhancedFeatures({
        intelligenceScore: response.data.intelligence_metrics?.average_intelligence_score || 0,
        memoryEfficiency: response.data.memory_efficiency?.average_efficiency || 0,
        multimodalCount: response.data.multimodal_usage?.total_files_processed || 0
      });
    } catch (error) {
      console.error('Error fetching enhanced features:', error);
    }
  };

  // Focus management when changing tabs
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.focus();
    }
  }, [activeTab]);

  const checkSystemHealth = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/health/enhanced`);
      setSystemHealth(response.data);
    } catch (error) {
      console.error('Health check failed:', error);
      setSystemHealth({ status: 'unhealthy', error: 'Connection failed' });
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/agents`);
      setAgents(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching agents:', error);
      setError('Failed to load agents. Please check your connection.');
    }
  };

  const fetchAllTasks = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks. Please check your connection.');
    }
  };

  const createAgent = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
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
      setError('Failed to create agent. Please try again.');
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
        setError('');
      } catch (error) {
        console.error('Error deleting agent:', error);
        setError('Failed to delete agent. Please try again.');
      }
    }
  };

  const executeTask = async (agentId, conversationId = null) => {
    if (!taskPrompt.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      await axios.post(`${API_BASE}/api/agents/${agentId}/tasks`, {
        agent_id: agentId,
        prompt: taskPrompt,
        conversation_id: conversationId,
        enable_web_scraping: true,
        enable_visualization: true
      });
      setTaskPrompt('');
      fetchAllTasks();
      fetchAgents();
    } catch (error) {
      console.error('Error executing task:', error);
      setError('Failed to execute task. Please try again.');
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
    const iconProps = { className: "w-4 h-4", 'aria-hidden': true };
    switch (status) {
      case 'completed': return <CheckCircle {...iconProps} className="w-4 h-4 text-green-500" />;
      case 'processing': return <Clock {...iconProps} className="w-4 h-4 text-yellow-500" />;
      case 'failed': return <XCircle {...iconProps} className="w-4 h-4 text-red-500" />;
      default: return <Clock {...iconProps} className="w-4 h-4 text-gray-400" />;
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

  // Alert for system issues
  const SystemAlert = () => {
    if (!systemHealth || systemHealth.status === 'healthy') return null;
    
    return (
      <div 
        role="alert" 
        className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6"
      >
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
          <div>
            <h3 className="font-medium text-red-800 dark:text-red-200">System Issue Detected</h3>
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">
              Some services may be unavailable. {systemHealth.error}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SkipNavigation />
      
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
          setSidebarOpen={setSidebarOpen}
        />

        <main 
          id="main-content"
          ref={mainContentRef}
          className="flex-1 lg:ml-64 focus:outline-none"
          tabIndex="-1"
          role="main"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <SystemAlert />
            
            {error && (
              <div role="alert" className="mb-6 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                  <AccessibleButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setError('')}
                    ariaLabel="Dismiss error"
                    className="ml-auto"
                  >
                    <X className="w-4 h-4" />
                  </AccessibleButton>
                </div>
              </div>
            )}
            
            {/* Enhanced Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome to your AI command center</p>
                  </div>
                  <AccessibleButton
                    variant="secondary"
                    onClick={() => {
                      fetchAgents();
                      fetchAllTasks();
                      checkSystemHealth();
                    }}
                    icon={RefreshCw}
                    ariaLabel="Refresh dashboard data"
                  >
                    Refresh
                  </AccessibleButton>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <QuickActions onAction={handleQuickAction} recentTasks={tasks.slice(0, 3)} />
                  </div>
                  
                  <div className="space-y-6">
                    {/* Quick Stats */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
                      <div className="space-y-4" role="list">
                        <div className="flex items-center justify-between" role="listitem">
                          <div className="flex items-center">
                            <Bot className="w-4 h-4 text-blue-500 mr-2" aria-hidden="true" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Total Agents</span>
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white" aria-label={`${agents.length} total agents`}>
                            {agents.length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between" role="listitem">
                          <div className="flex items-center">
                            <MessageSquare className="w-4 h-4 text-green-500 mr-2" aria-hidden="true" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</span>
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white" aria-label={`${tasks.length} total tasks`}>
                            {tasks.length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between" role="listitem">
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" aria-hidden="true" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white" aria-label={`${tasks.filter(t => t.status === 'completed').length} completed tasks`}>
                            {tasks.filter(t => t.status === 'completed').length}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Active Agents */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Active Agents</h3>
                      <div role="list">
                        {agents.slice(0, 3).map((agent) => (
                          <div key={agent.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0" role="listitem">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white text-sm">{agent.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{agent.tasks_completed} tasks</p>
                            </div>
                            <div className="w-2 h-2 bg-green-500 rounded-full" aria-label="Agent active"></div>
                          </div>
                        ))}
                      </div>
                      {agents.length > 3 && (
                        <AccessibleButton
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveTab('agents')}
                          ariaLabel="View all agents"
                          className="w-full mt-4"
                        >
                          View all agents →
                        </AccessibleButton>
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
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" aria-hidden="true" />
                      <AccessibleInput
                        ref={searchInputRef}
                        id="agent-search"
                        name="search"
                        placeholder="Search agents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        inputClassName="pl-10 pr-4 py-2"
                        ariaLabel="Search agents by name or description"
                      />
                    </div>
                    <AccessibleButton
                      onClick={() => setActiveTab('create')}
                      icon={Plus}
                      ariaLabel="Create new agent"
                    >
                      New Agent
                    </AccessibleButton>
                  </div>
                </div>

                {filteredAgents.length === 0 ? (
                  <div className="text-center py-12">
                    <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" aria-hidden="true" />
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                      {searchQuery ? 'No agents found' : 'No agents yet'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      {searchQuery ? 'Try adjusting your search query' : 'Create your first AI agent to get started'}
                    </p>
                    {!searchQuery && (
                      <div className="flex justify-center space-x-4">
                        <AccessibleButton
                          onClick={() => setActiveTab('create')}
                          icon={Plus}
                          ariaLabel="Create your first agent"
                        >
                          Create Agent
                        </AccessibleButton>
                        <AccessibleButton
                          variant="secondary"
                          onClick={() => setActiveTab('templates')}
                          icon={Sparkles}
                          ariaLabel="Browse agent templates"
                        >
                          Browse Templates
                        </AccessibleButton>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
                    {filteredAgents.map((agent) => (
                      <div key={agent.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow" role="listitem">
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
                                <Activity className="w-4 h-4 mr-1" aria-hidden="true" />
                                <span aria-label={`${agent.tasks_completed} tasks completed`}>
                                  {agent.tasks_completed} tasks
                                </span>
                              </div>
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-1" aria-hidden="true"></div>
                                {agent.specialization}
                              </div>
                            </div>
                          </div>
                          <AccessibleButton
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteAgent(agent.id)}
                            ariaLabel={`Delete agent ${agent.name}`}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </AccessibleButton>
                        </div>

                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <AccessibleInput
                              id={`task-${agent.id}`}
                              name={`task-${agent.id}`}
                              placeholder="Give this agent a task..."
                              value={selectedAgent === agent.id ? taskPrompt : ''}
                              onChange={(e) => {
                                setTaskPrompt(e.target.value);
                                setSelectedAgent(agent.id);
                              }}
                              onFocus={() => setSelectedAgent(agent.id)}
                              inputClassName="flex-1 text-sm"
                              ariaLabel={`Enter task for ${agent.name}`}
                            />
                            <AccessibleButton
                              onClick={() => executeTask(agent.id)}
                              disabled={loading || !taskPrompt.trim() || selectedAgent !== agent.id}
                              icon={Send}
                              size="sm"
                              ariaLabel={`Execute task for ${agent.name}`}
                            />
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
                  <form onSubmit={createAgent} className="space-y-6" noValidate>
                    <AccessibleInput
                      id="agent-name"
                      name="name"
                      label="Agent Name"
                      value={agentForm.name}
                      onChange={(e) => setAgentForm({...agentForm, name: e.target.value})}
                      placeholder="e.g., Content Writer, Data Analyst, Customer Support"
                      required
                      helperText="Choose a descriptive name for your AI agent"
                    />

                    <AccessibleInput
                      id="agent-description"
                      name="description"
                      label="Description"
                      value={agentForm.description}
                      onChange={(e) => setAgentForm({...agentForm, description: e.target.value})}
                      placeholder="Brief description of what this agent does"
                      required
                      helperText="Explain the agent's purpose and capabilities"
                    />

                    <div>
                      <label htmlFor="agent-specialization" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Specialization
                      </label>
                      <select
                        id="agent-specialization"
                        value={agentForm.specialization}
                        onChange={(e) => setAgentForm({...agentForm, specialization: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        aria-describedby="specialization-help"
                      >
                        <option value="general">General Purpose</option>
                        <option value="creative_tasks">Creative Tasks</option>
                        <option value="analysis_tasks">Analysis & Research</option>
                        <option value="coding_tasks">Programming & Code</option>
                        <option value="conversation">Conversation & Support</option>
                        <option value="web_scraping">Web Research & Scraping</option>
                        <option value="data_analysis">Data Analysis & Visualization</option>
                      </select>
                      <p id="specialization-help" className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Choose the area where this agent will excel
                      </p>
                    </div>

                    <div>
                      <label htmlFor="agent-prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        System Prompt
                      </label>
                      <textarea
                        id="agent-prompt"
                        value={agentForm.system_prompt}
                        onChange={(e) => setAgentForm({...agentForm, system_prompt: e.target.value})}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Define how the agent should behave and respond"
                        required
                        aria-describedby="prompt-help"
                      />
                      <p id="prompt-help" className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        This defines the agent's personality and behavior
                      </p>
                    </div>

                    <div>
                      <label htmlFor="agent-model" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Model Selection
                      </label>
                      <select
                        id="agent-model"
                        value={agentForm.model}
                        onChange={(e) => setAgentForm({...agentForm, model: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        aria-describedby="model-help"
                      >
                        <option value="auto">Auto-Select (Smart) ✨</option>
                        <option value="llama-3.1-8b-instant">Llama 3.1 8B (Fast)</option>
                        <option value="llama3-70b-8192">Llama 3 70B (Powerful)</option>
                        <option value="llama-3.3-70b-versatile">Llama 3.3 70B (Versatile)</option>
                        <option value="mixtral-8x7b-32768">Mixtral 8x7B (Balanced)</option>
                      </select>
                      {agentForm.model === 'auto' && (
                        <p id="model-help" className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          The system will automatically choose the best model based on the task type
                        </p>
                      )}
                    </div>

                    <div className="flex gap-4 pt-4">
                      <AccessibleButton
                        type="button"
                        variant="secondary"
                        onClick={() => setActiveTab('agents')}
                        ariaLabel="Cancel agent creation"
                        className="flex-1"
                      >
                        Cancel
                      </AccessibleButton>
                      <AccessibleButton
                        type="submit"
                        disabled={loading || !agentForm.name.trim() || !agentForm.description.trim()}
                        ariaLabel="Create new agent"
                        className="flex-1"
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
                      </AccessibleButton>
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
                      aria-label="Filter tasks by status"
                    >
                      <option value="all">All Tasks</option>
                      <option value="completed">Completed</option>
                      <option value="processing">Processing</option>
                      <option value="failed">Failed</option>
                    </select>
                    <AccessibleButton
                      variant="secondary"
                      size="sm"
                      onClick={fetchAllTasks}
                      icon={RefreshCw}
                      ariaLabel="Refresh activity"
                    >
                      Refresh
                    </AccessibleButton>
                  </div>
                </div>
                
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" aria-hidden="true" />
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                      {filterStatus === 'all' ? 'No tasks yet' : `No ${filterStatus} tasks`}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {filterStatus === 'all' ? 'Task activity will appear here once you start using your agents' : `No tasks with ${filterStatus} status found`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4" role="list">
                    {filteredTasks.map((task) => {
                      const agent = agents.find(a => a.id === task.agent_id);
                      return (
                        <div key={task.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow" role="listitem">
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
                              <time className="text-sm text-gray-400" dateTime={task.created_at}>
                                {new Date(task.created_at).toLocaleString()}
                              </time>
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

            {/* Web Scraping Tab */}
            {activeTab === 'web-scraping' && (
              <div className="space-y-6">
                <WebScrapingTool agents={agents} />
              </div>
            )}

            {/* Model Comparison Tab */}
            {activeTab === 'model-comparison' && (
              <div className="space-y-6">
                <ModelComparison agents={agents} />
              </div>
            )}

            {/* Data Visualization Tab */}
            {activeTab === 'data-viz' && (
              <div className="space-y-6">
                <DataVisualization />
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
                        <label htmlFor="theme-toggle" className="text-sm text-gray-700 dark:text-gray-300">
                          Dark Mode
                        </label>
                        <ThemeSwitcher />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">High Contrast</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Coming Soon</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Auto Model Selection</span>
                        <div className="w-2 h-2 bg-green-500 rounded-full" aria-label="Active"></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">System Status</span>
                        <span className={`text-sm ${systemHealth?.status === 'healthy' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {systemHealth?.status || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Cache Status</span>
                        <span className="text-sm text-green-600 dark:text-green-400">
                          {systemHealth?.services?.redis === 'connected' ? 'Connected' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Accessibility Settings */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Accessibility</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Screen Reader Support</span>
                        <div className="w-2 h-2 bg-green-500 rounded-full" aria-label="Enabled"></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Keyboard Navigation</span>
                        <div className="w-2 h-2 bg-green-500 rounded-full" aria-label="Enabled"></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">ARIA Labels</span>
                        <div className="w-2 h-2 bg-green-500 rounded-full" aria-label="Enabled"></div>
                      </div>
                    </div>
                  </div>

                  {/* Performance Settings */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Response Caching</span>
                        <div className="w-2 h-2 bg-green-500 rounded-full" aria-label="Enabled"></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Rate Limiting</span>
                        <div className="w-2 h-2 bg-green-500 rounded-full" aria-label="Active"></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Metrics Collection</span>
                        <div className="w-2 h-2 bg-green-500 rounded-full" aria-label="Active"></div>
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
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="loading-title"
        >
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p id="loading-title" className="text-gray-600 dark:text-gray-400">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Theme Switcher Component with Accessibility
const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-700"
      role="switch"
      aria-checked={theme === 'dark'}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
};

// Main App with Error Boundary and Theme Provider
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;