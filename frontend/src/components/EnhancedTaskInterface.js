import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Upload, Globe, Brain, Zap, FileText, 
  Image, Settings, Sparkles, Clock, CheckCircle,
  AlertCircle, Loader, Star, ArrowRight
} from 'lucide-react';
import AccessibleButton from './AccessibleButton';
import AccessibleInput from './AccessibleInput';

const EnhancedTaskInterface = ({ agent, onTaskSubmit, isLoading }) => {
  const [taskPrompt, setTaskPrompt] = useState('');
  const [enabledFeatures, setEnabledFeatures] = useState({
    webScraping: false,
    visualization: false,
    multimodal: false,
    contextOptimization: true,
    reasoningMode: false
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [typingAnimation, setTypingAnimation] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Generate intelligent suggestions based on agent specialization
    const generateSuggestions = () => {
      const baseSuggestions = {
        creative_tasks: [
          "Write a compelling blog post about AI innovations in 2025",
          "Create a marketing campaign for eco-friendly products",
          "Generate creative ideas for social media content"
        ],
        analysis_tasks: [
          "Analyze current market trends in technology",
          "Summarize key insights from industry reports",
          "Compare competitive advantages of different solutions"
        ],
        coding_tasks: [
          "Build a REST API with authentication",
          "Debug and optimize performance issues",
          "Create unit tests for critical functions"
        ],
        conversation: [
          "Help me understand complex concepts simply",
          "Provide customer support responses",
          "Explain technical topics in detail"
        ],
        general: [
          "Process uploaded documents for insights",
          "Scrape website data for analysis",
          "Create visualizations from data"
        ]
      };

      const agentType = agent?.specialization || 'general';
      setSuggestions(baseSuggestions[agentType] || baseSuggestions.general);
    };

    generateSuggestions();
  }, [agent]);

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/upload/multimodal`, {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          const result = await response.json();
          setUploadedFiles(prev => [...prev, result]);
          setEnabledFeatures(prev => ({ ...prev, multimodal: true }));
        }
      } catch (error) {
        console.error('File upload failed:', error);
      }
    }
    
    event.target.value = '';
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.file_id !== fileId));
    if (uploadedFiles.length === 1) {
      setEnabledFeatures(prev => ({ ...prev, multimodal: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskPrompt.trim() && uploadedFiles.length === 0) return;

    const taskData = {
      agent_id: agent.id,
      prompt: taskPrompt,
      enable_web_scraping: enabledFeatures.webScraping,
      enable_visualization: enabledFeatures.visualization,
      enable_multimodal: enabledFeatures.multimodal,
      context_optimization: enabledFeatures.contextOptimization,
      reasoning_mode: enabledFeatures.reasoningMode,
      file_ids: uploadedFiles.map(f => f.file_id)
    };

    setTypingAnimation(true);
    await onTaskSubmit(taskData);
    setTaskPrompt('');
    setUploadedFiles([]);
    setEnabledFeatures(prev => ({ ...prev, multimodal: false }));
    setTypingAnimation(false);
  };

  const useSuggestion = (suggestion) => {
    setTaskPrompt(suggestion);
    // Add typing animation effect
    setTaskPrompt('');
    let i = 0;
    const interval = setInterval(() => {
      if (i < suggestion.length) {
        setTaskPrompt(suggestion.substring(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 50);
  };

  const getFeatureIcon = (feature) => {
    const icons = {
      webScraping: Globe,
      visualization: Sparkles,
      multimodal: FileText,
      contextOptimization: Brain,
      reasoningMode: Zap
    };
    return icons[feature];
  };

  const getFeatureDescription = (feature) => {
    const descriptions = {
      webScraping: 'Extract and analyze web content from URLs',
      visualization: 'Generate charts and visualizations from data',
      multimodal: 'Process uploaded images and documents',
      contextOptimization: 'Use advanced memory for better context',
      reasoningMode: 'Apply step-by-step logical reasoning'
    };
    return descriptions[feature];
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Enhanced Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Enhanced Task Interface
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Interact with {agent?.name} using advanced AI features
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {agent?.intelligence_score && (
              <div className="flex items-center px-3 py-1 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mr-1" />
                <span className="text-sm text-yellow-700 dark:text-yellow-300">
                  {(agent.intelligence_score * 100).toFixed(0)}% Intelligence
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Smart Suggestions */}
        {suggestions.length > 0 && !taskPrompt && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              💡 Smart Suggestions for {agent?.specialization?.replace('_', ' ') || 'general'} tasks:
            </p>
            <div className="grid gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => useSuggestion(suggestion)}
                  className="text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                      {suggestion}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Interface */}
      <form onSubmit={handleSubmit} className="p-6">
        {/* Task Input */}
        <div className="mb-6">
          <AccessibleInput
            id="enhanced-task-prompt"
            name="taskPrompt"
            label="Task Description"
            value={taskPrompt}
            onChange={(e) => setTaskPrompt(e.target.value)}
            placeholder="Describe what you want the AI to do... (Enhanced with intelligent processing)"
            multiline
            rows={4}
            helperText="Use natural language. The AI will automatically optimize the task based on your agent's specialization."
            className="mb-4"
          />

          {/* File Upload Area */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors duration-200">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,application/pdf,.txt,.docx"
            />
            <div className="flex flex-col items-center">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Upload images, PDFs, or documents for AI analysis
              </p>
              <AccessibleButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                ariaLabel="Choose files to upload"
              >
                Choose Files
              </AccessibleButton>
            </div>
          </div>

          {/* Uploaded Files Display */}
          {uploadedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Uploaded Files ({uploadedFiles.length}):
              </h4>
              {uploadedFiles.map((file) => (
                <div key={file.file_id} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      {file.detected_type?.startsWith('image/') ? (
                        <Image className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-100 text-sm">
                        {file.filename}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        {(file.size / 1024).toFixed(1)} KB • Ready for AI processing
                      </p>
                    </div>
                  </div>
                  <AccessibleButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.file_id)}
                    ariaLabel={`Remove ${file.filename}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </AccessibleButton>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enhanced Features Toggle */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900 dark:text-white">
              Enhanced AI Features
            </h4>
            <AccessibleButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              ariaLabel={showAdvanced ? "Hide advanced features" : "Show advanced features"}
            >
              <Settings className="w-4 h-4 mr-2" />
              {showAdvanced ? 'Hide' : 'Advanced'}
            </AccessibleButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(enabledFeatures).map(([feature, enabled]) => {
              const Icon = getFeatureIcon(feature);
              const shouldShow = showAdvanced || ['contextOptimization', 'multimodal'].includes(feature);
              
              if (!shouldShow) return null;

              return (
                <div
                  key={feature}
                  className={`
                    p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                    ${enabled 
                      ? 'border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20' 
                      : 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50'
                    }
                    hover:border-blue-400 dark:hover:border-blue-500
                  `}
                  onClick={() => setEnabledFeatures(prev => ({
                    ...prev, 
                    [feature]: !prev[feature]
                  }))}
                  role="checkbox"
                  aria-checked={enabled}
                  tabIndex={0}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`
                      p-2 rounded-lg transition-colors duration-200
                      ${enabled 
                        ? 'bg-blue-100 dark:bg-blue-900' 
                        : 'bg-gray-100 dark:bg-gray-600'
                      }
                    `}>
                      <Icon className={`
                        w-4 h-4 transition-colors duration-200
                        ${enabled 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-gray-500 dark:text-gray-400'
                        }
                      `} />
                    </div>
                    <div className="flex-1">
                      <p className={`
                        font-medium text-sm transition-colors duration-200
                        ${enabled 
                          ? 'text-blue-900 dark:text-blue-100' 
                          : 'text-gray-700 dark:text-gray-300'
                        }
                      `}>
                        {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {getFeatureDescription(feature)}
                      </p>
                    </div>
                    <div className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
                      ${enabled 
                        ? 'border-blue-500 bg-blue-500' 
                        : 'border-gray-300 dark:border-gray-500'
                      }
                    `}>
                      {enabled && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {Object.values(enabledFeatures).filter(Boolean).length} enhanced features enabled
          </div>
          
          <AccessibleButton
            type="submit"
            disabled={isLoading || (!taskPrompt.trim() && uploadedFiles.length === 0)}
            className={`
              px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2
              ${isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:scale-105'
              }
              text-white shadow-lg
            `}
            ariaLabel="Execute enhanced task"
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Processing with AI...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Execute Enhanced Task</span>
              </>
            )}
          </AccessibleButton>
        </div>

        {/* Feature Status Bar */}
        {(enabledFeatures.webScraping || enabledFeatures.multimodal || enabledFeatures.reasoningMode) && (
          <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-2 text-sm text-green-800 dark:text-green-200">
              <Sparkles className="w-4 h-4" />
              <span>Enhanced processing active:</span>
              {enabledFeatures.webScraping && <span className="px-2 py-1 bg-green-100 dark:bg-green-900 rounded-lg">Web Scraping</span>}
              {enabledFeatures.multimodal && <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded-lg">Multi-modal</span>}
              {enabledFeatures.reasoningMode && <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 rounded-lg">Reasoning</span>}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default EnhancedTaskInterface;