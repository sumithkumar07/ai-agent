import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Bot, MessageSquare, CheckCircle, XCircle, Clock, Activity } from 'lucide-react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_BACKEND_URL;

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/analytics/dashboard`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading analytics...</span>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center p-8">
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Unable to load analytics data</p>
      </div>
    );
  }

  const StatCard = ({ title, value, subtitle, icon: Icon, color = "blue" }) => {
    const colorClasses = {
      blue: "bg-blue-500",
      green: "bg-green-500", 
      orange: "bg-orange-500",
      red: "bg-red-500",
      purple: "bg-purple-500"
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`${colorClasses[color]} p-3 rounded-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <TrendingUp className="w-4 h-4 text-gray-400" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">{title}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    );
  };

  const ModelUsageBar = ({ model, count, total }) => {
    const percentage = (count / total) * 100;
    
    return (
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {model}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {count} tasks
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  const totalModelUsage = Object.values(analytics.model_usage || {}).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
        <button
          onClick={fetchAnalytics}
          className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          <Activity className="w-4 h-4 mr-1" />
          Refresh
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Agents"
          value={analytics.agents.total}
          subtitle={`${analytics.agents.active} active`}
          icon={Bot}
          color="blue"
        />
        <StatCard
          title="Total Tasks"
          value={analytics.tasks.total}
          subtitle="All time"
          icon={MessageSquare}
          color="green"
        />
        <StatCard
          title="Success Rate"
          value={`${analytics.tasks.success_rate}%`}
          subtitle={`${analytics.tasks.completed} completed`}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Failed Tasks"
          value={analytics.tasks.failed}
          subtitle="Requires attention"
          icon={XCircle}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Usage */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Model Usage
          </h3>
          {Object.keys(analytics.model_usage || {}).length > 0 ? (
            <div>
              {Object.entries(analytics.model_usage).map(([model, count]) => (
                <ModelUsageBar
                  key={model}
                  model={model}
                  count={count}
                  total={totalModelUsage}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No usage data available</p>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Recent Activity
          </h3>
          {analytics.recent_activity.length > 0 ? (
            <div className="space-y-3">
              {analytics.recent_activity.map((task) => {
                const getStatusIcon = (status) => {
                  switch (status) {
                    case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
                    case 'processing': return <Clock className="w-4 h-4 text-yellow-500" />;
                    case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
                    default: return <Clock className="w-4 h-4 text-gray-400" />;
                  }
                };

                return (
                  <div key={task.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-shrink-0 mt-0.5">
                      {getStatusIcon(task.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {task.prompt}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(task.created_at).toLocaleString()}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${{
                          'completed': 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
                          'processing': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
                          'failed': 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                        }[task.status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'}`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;