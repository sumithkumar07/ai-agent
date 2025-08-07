import React, { useState, useEffect } from 'react';
import { 
  X, ChevronRight, ChevronLeft, Play, Sparkles, 
  Brain, MessageSquare, BarChart3, CheckCircle, 
  ArrowRight, Lightbulb, Star, Zap
} from 'lucide-react';
import AccessibleButton from './AccessibleButton';

const OnboardingGuide = ({ isOpen, onClose, onActionTrigger }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to Enhanced AI Platform v2.2',
      content: 'Experience the next generation of AI with enhanced intelligence, better conversation memory, and multi-modal processing capabilities.',
      icon: Brain,
      color: 'from-purple-500 to-blue-600',
      action: null,
      tips: [
        '🧠 Advanced AI Intelligence with smart model selection',
        '💬 Enhanced conversation memory and context understanding',
        '📁 Multi-modal processing for images and documents',
        '📊 Real-time intelligence scoring and analytics'
      ]
    },
    {
      id: 'create-agent',
      title: 'Create Your First Smart Agent',
      content: 'Start by creating an AI agent with enhanced capabilities. Choose from templates or create custom agents with specialized intelligence.',
      icon: Sparkles,
      color: 'from-emerald-500 to-teal-600',
      action: 'create-agent',
      actionText: 'Create Agent Now',
      tips: [
        '✨ Use "auto" model selection for optimal performance',
        '🎯 Choose specializations for better task classification',
        '⚡ Enable context optimization for smarter conversations',
        '📈 Monitor intelligence scores in real-time'
      ]
    },
    {
      id: 'enhanced-tasks',
      title: 'Execute Enhanced Tasks',
      content: 'Run intelligent tasks with your agents. Enable features like web scraping, multi-modal processing, and reasoning mode.',
      icon: Zap,
      color: 'from-orange-500 to-red-600',
      action: 'quick-task',
      actionText: 'Try Enhanced Task',
      tips: [
        '🔍 Enable web scraping for real-time data analysis',
        '📸 Upload images and documents for AI processing',
        '🧠 Use reasoning mode for complex problem solving',
        '💾 Benefit from intelligent conversation memory'
      ]
    },
    {
      id: 'multimodal',
      title: 'Multi-modal Processing',
      content: 'Upload and process images, PDFs, and documents with AI. Get intelligent analysis and insights from visual content.',
      icon: MessageSquare,
      color: 'from-pink-500 to-purple-600',
      action: 'multimodal-upload',
      actionText: 'Upload File',
      tips: [
        '📷 Process images with intelligent visual analysis',
        '📄 Extract insights from PDF documents',
        '🔤 Analyze text content with enhanced understanding',
        '📊 Generate visualizations from your data'
      ]
    },
    {
      id: 'analytics',
      title: 'Intelligence Analytics',
      content: 'Monitor AI performance with advanced analytics. Track intelligence scores, memory efficiency, and system health.',
      icon: BarChart3,
      color: 'from-blue-500 to-indigo-600',
      action: 'view-analytics',
      actionText: 'View Analytics',
      tips: [
        '📈 Track intelligence scores across all tasks',
        '⚡ Monitor response times and performance',
        '🧠 Analyze memory efficiency and optimization',
        '🎯 View task classification accuracy'
      ]
    }
  ];

  useEffect(() => {
    const savedProgress = localStorage.getItem('onboarding_progress');
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      setCompletedSteps(progress.completedSteps || []);
      setCurrentStep(progress.currentStep || 0);
    }
  }, []);

  const saveProgress = (step, completed) => {
    const progress = {
      currentStep: step,
      completedSteps: completed
    };
    localStorage.setItem('onboarding_progress', JSON.stringify(progress));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        const newStep = currentStep + 1;
        setCurrentStep(newStep);
        const newCompleted = [...completedSteps, steps[currentStep].id];
        setCompletedSteps(newCompleted);
        saveProgress(newStep, newCompleted);
        setIsAnimating(false);
      }, 300);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const goToStep = (stepIndex) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(stepIndex);
      setIsAnimating(false);
    }, 300);
  };

  const handleAction = () => {
    const step = steps[currentStep];
    if (step.action) {
      onActionTrigger(step.action);
      // Mark step as completed
      const newCompleted = [...completedSteps, step.id];
      setCompletedSteps(newCompleted);
      saveProgress(currentStep, newCompleted);
    }
  };

  const completeOnboarding = () => {
    localStorage.setItem('onboarding_completed', 'true');
    const allCompleted = steps.map(s => s.id);
    setCompletedSteps(allCompleted);
    saveProgress(currentStep, allCompleted);
    onClose();
  };

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;
  const isCompleted = completedSteps.includes(currentStepData.id);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className={`
          bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden
          transform transition-all duration-500 ease-out
          ${isAnimating ? 'scale-95 opacity-90' : 'scale-100 opacity-100'}
        `}>
          {/* Header */}
          <div className={`relative p-8 bg-gradient-to-r ${currentStepData.color} text-white overflow-hidden`}>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16" />
            
            <div className="relative flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <h2 className="text-2xl font-bold">{currentStepData.title}</h2>
                    {isCompleted && (
                      <CheckCircle className="w-6 h-6 text-green-300" />
                    )}
                  </div>
                  <p className="text-white/90 text-lg">{currentStepData.content}</p>
                </div>
              </div>
              
              <AccessibleButton
                variant="ghost"
                size="sm"
                onClick={onClose}
                ariaLabel="Close onboarding guide"
                className="text-white hover:bg-white/20"
              >
                <X className="w-6 h-6" />
              </AccessibleButton>
            </div>

            {/* Progress Indicator */}
            <div className="mt-8">
              <div className="flex justify-between text-sm mb-2">
                <span>Step {currentStep + 1} of {steps.length}</span>
                <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-500"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Tips Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                  Key Features
                </h3>
                <div className="space-y-3">
                  {currentStepData.tips.map((tip, index) => (
                    <div 
                      key={index}
                      className="flex items-start p-3 bg-gray-50 dark:bg-gray-800 rounded-xl transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animation: 'fadeInLeft 0.5s ease-out forwards'
                      }}
                    >
                      <div className="text-lg mr-3">{tip.split(' ')[0]}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {tip.split(' ').slice(1).join(' ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Section */}
              <div className="flex flex-col justify-center">
                {currentStepData.action && (
                  <div className="text-center mb-6">
                    <div className="mb-4">
                      <div className="inline-flex p-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl">
                        <Icon className="w-16 h-16 text-gray-600 dark:text-gray-300" />
                      </div>
                    </div>
                    <AccessibleButton
                      onClick={handleAction}
                      className={`
                        px-8 py-4 text-lg font-semibold rounded-2xl
                        bg-gradient-to-r ${currentStepData.color}
                        text-white shadow-lg transform transition-all duration-200
                        hover:scale-105 hover:shadow-xl
                        focus:scale-105 focus:shadow-xl
                      `}
                      ariaLabel={`${currentStepData.actionText} - ${currentStepData.title}`}
                    >
                      <Play className="w-5 h-5 mr-2" />
                      {currentStepData.actionText}
                    </AccessibleButton>
                  </div>
                )}

                {/* Step Navigation Dots */}
                <div className="flex justify-center space-x-2 mb-6">
                  {steps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToStep(index)}
                      className={`
                        w-3 h-3 rounded-full transition-all duration-300
                        ${index === currentStep 
                          ? 'bg-blue-500 scale-125' 
                          : completedSteps.includes(steps[index].id)
                          ? 'bg-green-500'
                          : 'bg-gray-300 dark:bg-gray-600'
                        }
                        hover:scale-110
                      `}
                      aria-label={`Go to step ${index + 1}: ${steps[index].title}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center">
              <AccessibleButton
                variant="secondary"
                onClick={prevStep}
                disabled={currentStep === 0}
                ariaLabel="Previous step"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </AccessibleButton>

              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {completedSteps.length} of {steps.length} features explored
                </p>
              </div>

              {currentStep === steps.length - 1 ? (
                <AccessibleButton
                  onClick={completeOnboarding}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                  ariaLabel="Complete onboarding"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Setup
                </AccessibleButton>
              ) : (
                <AccessibleButton
                  onClick={nextStep}
                  ariaLabel="Next step"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </AccessibleButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// CSS animations
const styles = `
  @keyframes fadeInLeft {
    from {
      opacity: 0;
      transform: translateX(-10px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  if (!document.head.querySelector(`style[data-onboarding="true"]`)) {
    styleSheet.setAttribute('data-onboarding', 'true');
    document.head.appendChild(styleSheet);
  }
}

export default OnboardingGuide;