import React, { useState } from 'react';
import { GitCompare, Send, Clock, CheckCircle, XCircle, Copy, Loader } from 'lucide-react';
import AccessibleButton from './AccessibleButton';
import AccessibleInput from './AccessibleInput';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_BACKEND_URL;

const ModelComparison = ({ agents = [] }) => {
  const [selectedAgent, setSelectedAgent] = useState('');
  const [prompt, setPrompt] = useState('');
  const [selectedModels, setSelectedModels] = useState(['llama3-8b-8192', 'llama3-70b-8192']);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const availableModels = [
    'llama3-8b-8192',
    'llama3-70b-8192', 
    'llama-3.1-8b-instant',
    'llama-3.3-70b-versatile',
    'mixtral-8x7b-32768'
  ];

  const handleModelToggle = (model) => {
    setSelectedModels(prev => {
      if (prev.includes(model)) {
        return prev.filter(m => m !== model);
      } else if (prev.length < 4) { // Limit to 4 models for UI purposes
        return [...prev, model];
      }
      return prev;
    });
  };

  const runComparison = async () => {
    if (!selectedAgent || !prompt.trim() || selectedModels.length < 2) {
      setError('Please select an agent, enter a prompt, and choose at least 2 models');
      return;
    }

    setLoading(true);
    setError('');
    setComparison(null);

    try {
      const response = await axios.post(`${API_BASE}/api/model-comparison`, {
        prompt: prompt.trim(),
        models: selectedModels,
        agent_id: selectedAgent
      });
      
      setComparison(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Comparison failed');
    } finally {
      setLoading(false);
    }
  };

  const copyResponse = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" aria-label="Success" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" aria-label="Failed" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" aria-label="Processing" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <GitCompare className="w-8 h-8 text-blue-500 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Model Comparison</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Compare responses from different AI models side-by-side
        </p>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Configuration
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Agent Selection */}
          <div>
            <label htmlFor="agent-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Agent
            </label>
            <select
              id="agent-select"
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-describedby="agent-help"
            >
              <option value="">Choose an agent...</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} - {agent.specialization}
                </option>
              ))}
            </select>
            <p id="agent-help" className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              The agent's system prompt will be used for all models
            </p>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Models (2-4)
            </label>
            <div className="space-y-2">
              {availableModels.map((model) => (
                <label key={model} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedModels.includes(model)}
                    onChange={() => handleModelToggle(model)}
                    disabled={!selectedModels.includes(model) && selectedModels.length >= 4}
                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    aria-describedby={`${model}-desc`}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {model}
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Selected: {selectedModels.length}/4 models
            </p>
          </div>
        </div>

        {/* Prompt Input */}
        <div className="mt-6">
          <AccessibleInput
            id="comparison-prompt"
            name="prompt"
            label="Prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt to compare across models..."
            helperText="This prompt will be sent to all selected models"
            required
            inputClassName="min-h-[100px]"
          />
        </div>

        {/* Error Display */}
        {error && (
          <div role="alert" className="mt-4 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Run Comparison Button */}
        <div className="mt-6">
          <AccessibleButton
            onClick={runComparison}
            disabled={loading || !selectedAgent || !prompt.trim() || selectedModels.length < 2}
            icon={loading ? Loader : Send}
            ariaLabel="Run model comparison"
          >
            {loading ? 'Running Comparison...' : 'Compare Models'}
          </AccessibleButton>
        </div>
      </div>

      {/* Results */}
      {comparison && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Comparison Results
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Processing time: {comparison.processing_time?.toFixed(2)}s
              </div>
            </div>

            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Prompt:</h4>
              <p className="text-gray-700 dark:text-gray-300">{comparison.prompt}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(comparison.results).map(([model, result]) => (
                <div 
                  key={model} 
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                      {getStatusIcon(result.status)}
                      <span className="ml-2">{model}</span>
                    </h4>
                    
                    {result.status === 'success' && (
                      <AccessibleButton
                        variant="ghost"
                        size="sm"
                        onClick={() => copyResponse(result.response)}
                        icon={Copy}
                        ariaLabel={`Copy ${model} response`}
                      />
                    )}
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {result.response}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center p-8">
          <Loader className="w-8 h-8 animate-spin text-blue-500 mr-3" />
          <span className="text-gray-600 dark:text-gray-400">Comparing models...</span>
        </div>
      )}
    </div>
  );
};

export default ModelComparison;