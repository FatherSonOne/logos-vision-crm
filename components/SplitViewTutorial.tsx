import React, { useState, useEffect } from 'react';

/**
 * Split View Tutorial Overlay
 * 
 * Shows users how to use split views with:
 * - Animated hints
 * - Step-by-step guidance
 * - Visual arrows and highlights
 * - Skip/dismiss option
 */

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target: 'divider' | 'collapse-left' | 'collapse-right' | 'list' | 'detail';
  position: 'top' | 'bottom' | 'left' | 'right';
  arrow: boolean;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: '🔄 Welcome to Split View!',
    description: 'View two things side-by-side. Let me show you how it works!',
    target: 'divider',
    position: 'top',
    arrow: false
  },
  {
    id: 'drag',
    title: '👆 Drag to Resize',
    description: 'Grab this divider and drag left or right to adjust the pane sizes!',
    target: 'divider',
    position: 'top',
    arrow: true
  },
  {
    id: 'collapse',
    title: '👁️ Collapse Panes',
    description: 'Click these arrow buttons to hide a pane for focus mode!',
    target: 'collapse-left',
    position: 'bottom',
    arrow: true
  },
  {
    id: 'navigate',
    title: '📋 Click to View Details',
    description: 'Click any item in the list to see its details on the right!',
    target: 'list',
    position: 'right',
    arrow: true
  },
  {
    id: 'done',
    title: '✨ You\'re All Set!',
    description: 'Try it out! The layout will remember your preferences.',
    target: 'detail',
    position: 'left',
    arrow: false
  }
];

interface SplitViewTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const SplitViewTutorial: React.FC<SplitViewTutorialProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const step = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      setIsVisible(false);
      setTimeout(onComplete, 300);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(onSkip, 300);
  };

  const getPositionClasses = () => {
    const base = 'fixed z-50 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border-2 border-cyan-500 p-6 max-w-sm';
    
    switch (step.target) {
      case 'divider':
        return `${base} top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`;
      case 'collapse-left':
        return `${base} top-24 right-1/2 mr-8`;
      case 'collapse-right':
        return `${base} top-24 left-1/2 ml-8`;
      case 'list':
        return `${base} top-1/2 left-8 -translate-y-1/2`;
      case 'detail':
        return `${base} top-1/2 right-8 -translate-y-1/2`;
      default:
        return `${base} top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`;
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in" />

      {/* Tutorial Card */}
      <div className={`${getPositionClasses()} animate-scale-in`}>
        {/* Progress Indicator */}
        <div className="flex gap-2 mb-4">
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? 'bg-cyan-500'
                  : index < currentStep
                  ? 'bg-cyan-300 dark:bg-cyan-700'
                  : 'bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">
            {step.title}
          </h3>
          <p className="text-slate-600 dark:text-slate-300">
            {step.description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {!isLastStep && (
            <button
              onClick={handleSkip}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Skip Tutorial
            </button>
          )}
          <button
            onClick={handleNext}
            className={`${
              isLastStep ? 'w-full' : 'flex-1'
            } px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold transition-colors`}
          >
            {isLastStep ? 'Got It!' : 'Next'}
          </button>
        </div>
      </div>

      {/* Animated Arrows/Highlights */}
      {step.arrow && (
        <>
          {step.target === 'divider' && (
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40">
              <div className="relative">
                {/* Pulsing Circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-cyan-500 rounded-full animate-ping opacity-20" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-cyan-500 rounded-full opacity-40" />
                
                {/* Arrows pointing to divider */}
                <div className="absolute top-1/2 -translate-y-1/2 -left-20 text-cyan-500 animate-bounce-horizontal">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 -right-20 text-cyan-500 animate-bounce-horizontal" style={{ animationDelay: '0.1s' }}>
                  <svg className="w-8 h-8 rotate-180" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {step.target === 'collapse-left' && (
            <div className="fixed top-20 right-1/2 mr-4 pointer-events-none z-40">
              <div className="flex items-center gap-2 animate-bounce">
                <span className="text-4xl">👆</span>
                <div className="w-3 h-3 bg-cyan-500 rounded-full animate-ping" />
              </div>
            </div>
          )}

          {step.target === 'list' && (
            <div className="fixed top-1/2 left-16 -translate-y-1/2 pointer-events-none z-40">
              <div className="flex flex-col items-center gap-2 animate-bounce" style={{ animationDelay: '0.2s' }}>
                <span className="text-4xl">👆</span>
                <div className="text-cyan-500 font-bold text-sm">Click Me!</div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

/**
 * Hook to manage tutorial state
 */
export const useSplitViewTutorial = (storageKey: string = 'split-view-tutorial-completed') => {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(storageKey);
    if (!completed) {
      // Show tutorial after a brief delay
      setTimeout(() => setShowTutorial(true), 500);
    }
  }, [storageKey]);

  const handleComplete = () => {
    localStorage.setItem(storageKey, 'true');
    setShowTutorial(false);
  };

  const handleSkip = () => {
    localStorage.setItem(storageKey, 'true');
    setShowTutorial(false);
  };

  const resetTutorial = () => {
    localStorage.removeItem(storageKey);
    setShowTutorial(true);
  };

  return {
    showTutorial,
    handleComplete,
    handleSkip,
    resetTutorial
  };
};

// Add these animations to your index.html if not already there
export const tutorialAnimations = `
@keyframes bounce-horizontal {
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-10px);
  }
}

.animate-bounce-horizontal {
  animation: bounce-horizontal 1s ease-in-out infinite;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
`;
