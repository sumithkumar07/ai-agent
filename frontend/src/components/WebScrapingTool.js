import React, { useState } from 'react';
import { Globe, Search, Download, AlertTriangle, CheckCircle } from 'lucide-react';
import AccessibleButton from './AccessibleButton';
import AccessibleInput from './AccessibleInput';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_BACKEND_URL;

const WebScrapingTool = ({ agents = [] }) => {
  const [selectedAgent, setSelectedAgent] = useState('');
  const [url, setUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleScrapeAndAnalyze = async () => {
    if (!selectedAgent || !url.trim() || !prompt.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (!isValidUrl(url)) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post(`${API_BASE}/api/web-scraping`, {
        url: url.trim(),
        agent_id: selectedAgent,
        prompt: prompt.trim()
      });
      
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Web scraping failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadResult = () => {
    if (!result) return;
    
    const dataStr = JSON.stringify(result, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `web-scraping-result-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Globe className="w-8 h-8 text-blue-500 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Web Scraping Tool</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Extract and analyze content from websites with AI assistance
        </p>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Scraping Configuration
        </h3>
        
        <div className="space-y-6">
          {/* Agent Selection */}
          <div>
            <label htmlFor="scraping-agent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Agent
            </label>
            <select
              id="scraping-agent"
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose an agent...</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} - {agent.specialization}
                </option>
              ))}
            </select>
          </div>

          {/* URL Input */}
          <AccessibleInput
            id="scraping-url"
            name="url"
            type="url"
            label="Website URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            helperText="Enter the full URL including https://"
            required
            error={url && !isValidUrl(url) ? 'Please enter a valid URL' : ''}
          />

          {/* Analysis Prompt */}
          <AccessibleInput
            id="scraping-prompt"
            name="prompt"
            label="Analysis Prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="What would you like the AI to analyze from this website?"
            helperText="Describe what you want to extract or analyze from the scraped content"
            required
            inputClassName="min-h-[100px]"
          />

          {/* Warning Notice */}
          <div className="flex items-start p-4 bg-yellow-50 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Important Notice
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Please respect website terms of service and robots.txt. Only scrape public content and avoid overloading servers.
              </p>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div role="alert" className="p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Action Button */}
          <AccessibleButton
            onClick={handleScrapeAndAnalyze}
            disabled={loading || !selectedAgent || !url.trim() || !prompt.trim() || (url && !isValidUrl(url))}
            icon={Search}
            ariaLabel="Start web scraping and analysis"
          >
            {loading ? 'Scraping & Analyzing...' : 'Scrape & Analyze'}
          </AccessibleButton>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              Scraping Results
            </h3>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Processing time: {result.processing_time?.toFixed(2)}s
              </span>
              <AccessibleButton
                variant="secondary"
                size="sm"
                onClick={downloadResult}
                icon={Download}
                ariaLabel="Download results as JSON"
              >
                Download
              </AccessibleButton>
            </div>
          </div>

          <div className="space-y-6">
            {/* URL Info */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Source URL:</h4>
              <a 
                href={result.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline break-all"
              >
                {result.url}
              </a>
            </div>

            {/* Scraped Content Preview */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Content Preview:</h4>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-48 overflow-y-auto">
                <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {result.scraped_content}
                </pre>
              </div>
            </div>

            {/* AI Analysis */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">AI Analysis:</h4>
              <div className="bg-blue-50 dark:bg-blue-900/50 rounded-lg p-4">
                <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {result.analysis}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
          <span className="text-gray-600 dark:text-gray-400">Scraping and analyzing website...</span>
        </div>
      )}
    </div>
  );
};

export default WebScrapingTool;