import React, { useState, useEffect } from 'react';
import { GuidedTour, TourStep } from './GuidedTour';

/**
 * Onboarding Flow Component
 *
 * Features:
 * - Welcome modal for first-time users
 * - Guided tour of key features
 * - Progressive disclosure of features
 * - Tracks completion status
 * - Skippable at any time
 */

// ============================================
// TYPES
// ============================================

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: () => void;
  actionLabel?: string;
}

interface OnboardingFlowProps {
  userName?: string;
  onComplete: () => void;
  onStartTour: () => void;
  onSkip: () => void;
}

// ============================================
// ICONS
// ============================================

const WaveIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 36 36" fill="none">
    <path d="M4.861 9.147c.94-.657 2.357-.531 3.201.166l-.968-1.407c-.779-1.111-.5-2.313.612-3.093 1.112-.777 4.263 1.312 4.263 1.312-.786-1.122-.639-2.544.483-3.331a2.483 2.483 0 0 1 3.456.611l10.42 14.72L25 31l-15-9-6.451-9.323c-.786-1.108-.519-2.62.593-3.397a2.483 2.483 0 0 1 .719-.133z" fill="#EF9645"/>
    <path d="M2.695 17.336s-1.132-1.65.519-2.781c1.649-1.131 2.78.518 2.78.518l5.251 7.658c.181-.302.379-.6.6-.894L4.861 11.423s-1.133-1.65.519-2.781c1.649-1.131 2.78.518 2.78.518l6.06 8.839c.201-.271.418-.539.657-.8l-6.394-9.323s-1.131-1.649.519-2.78c1.649-1.131 2.78.518 2.78.518l6.899 10.062c.199-.24.407-.466.622-.681l-6.471-9.431s-1.131-1.65.519-2.78 2.78.518 2.78.518l7.018 10.2" stroke="#EF9645" strokeWidth="2"/>
  </svg>
);

const RocketIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

const HeartIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// ============================================
// STORAGE
// ============================================

const ONBOARDING_KEY = 'onboarding_completed';

export const hasCompletedOnboarding = (): boolean => {
  return localStorage.getItem(ONBOARDING_KEY) === 'true';
};

export const markOnboardingComplete = (): void => {
  localStorage.setItem(ONBOARDING_KEY, 'true');
};

export const resetOnboarding = (): void => {
  localStorage.removeItem(ONBOARDING_KEY);
};

// ============================================
// TOUR STEPS
// ============================================

export const tourSteps: TourStep[] = [
  {
    selector: '#main-sidebar',
    title: 'Navigation',
    content: 'Use the sidebar to navigate between different sections of your CRM. Everything you need is organized here.',
    position: 'right'
  },
  {
    selector: '#global-search',
    title: 'Global Search',
    content: 'Press Ctrl+K or / to quickly search across all your data - contacts, projects, donations, and more.',
    position: 'bottom'
  },
  {
    selector: '#dashboard-stats',
    title: 'Dashboard Overview',
    content: 'Your key metrics at a glance. Track donations, active projects, and team activity.',
    position: 'bottom'
  },
  {
    selector: '#quick-actions',
    title: 'Quick Actions',
    content: 'Common actions are just one click away. Add contacts, log activities, or create projects.',
    position: 'left'
  },
];

// ============================================
// WELCOME MODAL
// ============================================

interface WelcomeModalProps {
  userName?: string;
  onGetStarted: () => void;
  onTakeTour: () => void;
  onSkip: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({
  userName,
  onGetStarted,
  onTakeTour,
  onSkip,
}) => {
  const features = [
    { icon: <UsersIcon />, title: 'Donor Management', description: 'Track and nurture your donor relationships' },
    { icon: <ChartIcon />, title: 'Impact Reporting', description: 'Visualize and share your organization\'s impact' },
    { icon: <HeartIcon />, title: 'Donation Tracking', description: 'Manage gifts, pledges, and campaigns' },
    { icon: <CheckCircleIcon />, title: 'Task Management', description: 'Stay organized with projects and tasks' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-fade-in">
      <div className="w-full max-w-2xl mx-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 px-8 py-12 text-center text-white">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10" />
          <div className="relative">
            <div className="inline-flex mb-4">
              <WaveIcon />
            </div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome{userName ? `, ${userName}` : ''}!
            </h1>
            <p className="text-lg text-white/90">
              Let's get you started with Logos Vision CRM
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="px-8 py-6">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
            What you can do
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700"
              >
                <div className="flex-shrink-0 p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="px-8 py-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onTakeTour}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl font-medium shadow-lg shadow-cyan-500/25 transition-all"
            >
              <RocketIcon />
              Take the Tour
            </button>
            <button
              onClick={onGetStarted}
              className="flex-1 px-6 py-3 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl font-medium transition-all"
            >
              Get Started
            </button>
          </div>
          <button
            onClick={onSkip}
            className="w-full mt-4 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            I've used this before, skip setup
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  userName,
  onComplete,
  onStartTour,
  onSkip,
}) => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTour, setShowTour] = useState(false);

  // Check if user needs onboarding
  useEffect(() => {
    if (!hasCompletedOnboarding()) {
      // Small delay to let the app render first
      const timer = setTimeout(() => {
        setShowWelcome(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleGetStarted = () => {
    setShowWelcome(false);
    markOnboardingComplete();
    onComplete();
  };

  const handleTakeTour = () => {
    setShowWelcome(false);
    setShowTour(true);
    onStartTour();
  };

  const handleSkip = () => {
    setShowWelcome(false);
    markOnboardingComplete();
    onSkip();
  };

  const handleTourComplete = () => {
    setShowTour(false);
    markOnboardingComplete();
    onComplete();
  };

  return (
    <>
      {showWelcome && (
        <WelcomeModal
          userName={userName}
          onGetStarted={handleGetStarted}
          onTakeTour={handleTakeTour}
          onSkip={handleSkip}
        />
      )}

      <GuidedTour
        steps={tourSteps}
        isOpen={showTour}
        onClose={handleTourComplete}
      />
    </>
  );
};

// Hook to manage onboarding state
export const useOnboarding = () => {
  const [isComplete, setIsComplete] = useState(hasCompletedOnboarding);

  const complete = () => {
    markOnboardingComplete();
    setIsComplete(true);
  };

  const reset = () => {
    resetOnboarding();
    setIsComplete(false);
  };

  return {
    isComplete,
    complete,
    reset,
    tourSteps,
  };
};

export default OnboardingFlow;
