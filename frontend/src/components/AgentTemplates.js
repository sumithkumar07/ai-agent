import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, ArrowRight, Check } from 'lucide-react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_BACKEND_URL;

const AgentTemplates = ({ onTemplateSelect, onClose }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [agentName, setAgentName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/agent-templates`);
      setTemplates(response.data.templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
    setLoading(false);
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setAgentName(template.name);
  };

  const createAgentFromTemplate = async () => {
    if (!selectedTemplate || !agentName.trim()) return;

    setCreating(true);
    try {
      const templateKey = selectedTemplate.name.toLowerCase().replace(' ', '');
      await axios.post(`${API_BASE}/api/agents/from-template/${templateKey}?agent_name=${encodeURIComponent(agentName)}`);
      onTemplateSelect && onTemplateSelect();
      onClose && onClose();
    } catch (error) {
      console.error('Error creating agent:', error);
      alert('Failed to create agent from template');
    }
    setCreating(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading templates...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Choose a Template</h2>
        <p className="text-gray-600 dark:text-gray-400">Get started quickly with pre-built AI agents</p>
      </div>

      {!selectedTemplate ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.name}
              onClick={() => handleTemplateSelect(template)}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all group"
            >
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">{template.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {template.name}
                </h3>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
                {template.description}
              </p>
              
              <div className="flex items-center justify-between text-xs">
                <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                  {template.category}
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">{selectedTemplate.icon}</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {selectedTemplate.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">{selectedTemplate.description}</p>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Agent Name
              </label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter a name for your agent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                System Prompt Preview
              </label>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400 max-h-32 overflow-y-auto">
                {selectedTemplate.system_prompt}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                Specialization: <span className="font-medium">{selectedTemplate.specialization}</span>
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                Model: <span className="font-medium">{selectedTemplate.suggested_model}</span>
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setSelectedTemplate(null)}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Back to Templates
            </button>
            <button
              onClick={createAgentFromTemplate}
              disabled={!agentName.trim() || creating}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Create Agent
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentTemplates;