import React from 'react';
import { Plus, Zap, MessageSquare, BarChart3, Settings, FileText } from 'lucide-react';

const QuickActions = ({ onAction, recentTasks = [] }) => {
  const quickActions = [
    {
      id: 'create-agent',
      title: 'Create Agent',
      subtitle: 'Build a new AI assistant',
      icon: Plus,
      color: 'bg-blue-500',
      action: () => onAction('create-agent')
    },
    {
      id: 'quick-task',
      title: 'Quick Task',
      subtitle: 'Execute a one-off task',
      icon: Zap,
      color: 'bg-green-500',
      action: () => onAction('quick-task')
    },
    {
      id: 'start-conversation',
      title: 'Start Chat',
      subtitle: 'Begin multi-turn dialogue',
      icon: MessageSquare,
      color: 'bg-purple-500',
      action: () => onAction('start-conversation')
    },
    {
      id: 'view-analytics',
      title: 'Analytics',
      subtitle: 'View performance insights',
      icon: BarChart3,
      color: 'bg-orange-500',
      action: () => onAction('view-analytics')
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
        <Settings className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300" />
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => {
          const IconComponent = action.icon;
          return (
            <button
              key={action.id}
              onClick={action.action}
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all group text-left"
            >
              <div className="flex items-start">
                <div className={`${action.color} p-2 rounded-lg mr-3 group-hover:scale-110 transition-transform`}>
                  <IconComponent className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{action.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{action.subtitle}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {recentTasks.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Recent Tasks</h4>
          <div className="space-y-2">
            {recentTasks.slice(0, 3).map((task) => (
              <div key={task.id} className="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                <FileText className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white truncate">{task.prompt}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(task.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickActions;