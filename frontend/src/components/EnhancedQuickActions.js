import React, { useState, useEffect } from 'react';
import { 
  Plus, MessageSquare, Sparkles, BarChart3, Upload, 
  ArrowRight, CheckCircle, Clock, Zap, Brain, 
  TrendingUp, FileText, Lightbulb, Star, Activity
} from 'lucide-react';
import AccessibleButton from './AccessibleButton';

const EnhancedQuickActions = ({ onAction, recentTasks = [], agents = [] }) => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    avgIntelligence: 0,
    completionRate: 0,
    activeAgents: 0
  });
  const [hoveredAction, setHoveredAction] = useState(null);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(true);

  useEffect(() => {
    // Calculate enhanced stats
    const totalTasks = recentTasks.length;
    const completedTasks = recentTasks.filter(t => t.status === 'completed').length;
    const avgIntelligence = recentTasks
      .filter(t => t.intelligence_score)
      .reduce((acc, t) => acc + (t.intelligence_score || 0), 0) / Math.max(1, recentTasks.length);
    
    setStats({
      totalTasks,
      avgIntelligence: Math.round(avgIntelligence * 100) / 100,
      completionRate: Math.round((completedTasks / Math.max(1, totalTasks)) * 100),
      activeAgents: agents.filter(a => a.status === 'active').length
    });

    // Hide welcome animation after 2 seconds
    const timer = setTimeout(() => setShowWelcomeAnimation(false), 2000);
    return () => clearTimeout(timer);
  }, [recentTasks, agents]);

  const quickActions = [
    {
      id: 'create-agent',
      title: 'Create Smart Agent',
      description: 'Build an AI assistant with enhanced intelligence',
      icon: Brain,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
      badge: 'AI Enhanced',
      badgeColor: 'bg-purple-100 text-purple-700'
    },
    {
      id: 'quick-task',
      title: 'Execute Task',
      description: 'Run intelligent tasks with your agents',
      icon: Zap,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      badge: 'Fast',
      badgeColor: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'multimodal-upload',
      title: 'Upload & Process',
      description: 'Process images, documents with AI',
      icon: Upload,
      color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      hoverColor: 'hover:from-emerald-600 hover:to-emerald-700',
      badge: 'Multi-modal',
      badgeColor: 'bg-emerald-100 text-emerald-700'
    },
    {
      id: 'start-conversation',
      title: 'Smart Chat',
      description: 'Begin enhanced conversation with memory',
      icon: MessageSquare,
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
      hoverColor: 'hover:from-orange-600 hover:to-orange-700',
      badge: 'Memory',
      badgeColor: 'bg-orange-100 text-orange-700'
    },
    {
      id: 'view-analytics',
      title: 'Intelligence Analytics',
      description: 'View AI performance and insights',
      icon: BarChart3,
      color: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      hoverColor: 'hover:from-indigo-600 hover:to-indigo-700',
      badge: 'Insights',
      badgeColor: 'bg-indigo-100 text-indigo-700'
    },
    {
      id: 'browse-templates',
      title: 'Smart Templates',
      description: 'Choose from intelligent agent templates',
      icon: Sparkles,
      color: 'bg-gradient-to-br from-pink-500 to-pink-600',
      hoverColor: 'hover:from-pink-600 hover:to-pink-700',
      badge: 'Templates',
      badgeColor: 'bg-pink-100 text-pink-700'
    }
  ];

  const handleActionClick = (actionId) => {
    // Add smooth feedback
    const button = document.getElementById(`action-${actionId}`);
    if (button) {
      button.classList.add('animate-pulse');
      setTimeout(() => button.classList.remove('animate-pulse'), 200);
    }
    onAction(actionId);
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Welcome Section with Animation */}
      <div className={`transition-all duration-1000 ${showWelcomeAnimation ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-purple-500/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="relative">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mr-4">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  Welcome to Enhanced AI Platform
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Advanced intelligence, better conversations, multi-modal processing
                </p>
              </div>
            </div>

            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.activeAgents}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Smart Agents</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.totalTasks}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.avgIntelligence.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Avg Intelligence</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {stats.completionRate}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Quick Actions Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Lightbulb className="w-4 h-4 mr-1" />
            Enhanced with AI
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            const isHovered = hoveredAction === action.id;
            
            return (
              <div
                key={action.id}
                id={`action-${action.id}`}
                className={`
                  group relative p-6 rounded-2xl border border-gray-200 dark:border-gray-700 
                  cursor-pointer transition-all duration-300 ease-out transform
                  ${action.color} ${action.hoverColor}
                  hover:scale-105 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-gray-800/50
                  ${isHovered ? 'scale-102' : ''}
                `}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: showWelcomeAnimation ? `fadeInUp 0.6s ease-out forwards` : 'none'
                }}
                onClick={() => handleActionClick(action.id)}
                onMouseEnter={() => setHoveredAction(action.id)}
                onMouseLeave={() => setHoveredAction(null)}
                role="button"
                tabIndex={0}
                aria-label={`${action.title}: ${action.description}`}
              >
                <div className="relative">
                  {/* Icon and Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className={`
                      px-2 py-1 text-xs font-medium rounded-lg
                      ${action.badgeColor}
                      transition-all duration-300
                      ${isHovered ? 'scale-110' : ''}
                    `}>
                      {action.badge}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-white mb-2">
                      {action.title}
                    </h4>
                    <p className="text-white/80 text-sm leading-relaxed">
                      {action.description}
                    </p>
                  </div>

                  {/* Action Arrow */}
                  <div className={`
                    flex items-center text-white/80 transition-all duration-300
                    ${isHovered ? 'translate-x-2 text-white' : ''}
                  `}>
                    <span className="text-sm font-medium mr-2">Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className={`
                    absolute inset-0 bg-white/10 rounded-2xl transition-opacity duration-300
                    ${isHovered ? 'opacity-100' : 'opacity-0'}
                  `} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Enhanced Recent Activity */}
      {recentTasks.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Activity className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
            </div>
            <AccessibleButton
              variant="ghost"
              size="sm"
              onClick={() => onAction('view-activity')}
              ariaLabel="View all activity"
            >
              View All
            </AccessibleButton>
          </div>

          <div className="space-y-3">
            {recentTasks.slice(0, 3).map((task, index) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className={`
                    p-2 rounded-lg
                    ${task.status === 'completed' ? 'bg-green-100 dark:bg-green-900' : 
                      task.status === 'processing' ? 'bg-yellow-100 dark:bg-yellow-900' : 
                      'bg-gray-100 dark:bg-gray-800'}
                  `}>
                    {task.status === 'completed' ? (
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {task.prompt.length > 50 ? `${task.prompt.substring(0, 50)}...` : task.prompt}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(task.created_at).toLocaleDateString()}
                      </span>
                      {task.intelligence_score && (
                        <div className="flex items-center">
                          <Star className="w-3 h-3 text-yellow-500 mr-1" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {(task.intelligence_score * 100).toFixed(0)}% intelligent
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`
                    px-2 py-1 text-xs font-medium rounded-lg
                    ${task.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                      task.status === 'processing' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}
                  `}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Helpful Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 p-6">
        <div className="flex items-start">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-4">
            <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Platform Enhancement Tips
            </h4>
            <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <li>• Use "auto" model selection for optimal AI performance</li>
              <li>• Enable context optimization for better conversation memory</li>
              <li>• Try multi-modal uploads for image and document processing</li>
              <li>• Check intelligence scores to monitor AI response quality</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add CSS animations
const styles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default EnhancedQuickActions;