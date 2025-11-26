import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'primary',
  text 
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16'
  };

  const colorClasses = {
    primary: 'border-primary-500',
    secondary: 'border-secondary-500',
    white: 'border-white'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizeClasses[size]} border-4 border-slate-200 dark:border-slate-700 border-t-transparent dark:border-t-transparent rounded-full animate-spin ${colorClasses[color as keyof typeof colorClasses] || colorClasses.primary}`}></div>
      {text && (
        <p className="text-sm text-slate-600 dark:text-slate-400 animate-pulse">{text}</p>
      )}
    </div>
  );
};

interface LoadingDotsProps {
  color?: string;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({ color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500',
    slate: 'bg-slate-500'
  };

  const dotColor = colorClasses[color as keyof typeof colorClasses] || colorClasses.primary;

  return (
    <div className="flex items-center gap-1">
      <div className={`h-2 w-2 rounded-full ${dotColor} animate-bounce`} style={{ animationDelay: '0ms' }}></div>
      <div className={`h-2 w-2 rounded-full ${dotColor} animate-bounce`} style={{ animationDelay: '150ms' }}></div>
      <div className={`h-2 w-2 rounded-full ${dotColor} animate-bounce`} style={{ animationDelay: '300ms' }}></div>
    </div>
  );
};

interface LoadingBarProps {
  progress?: number; // 0-100, undefined for indeterminate
  color?: string;
  height?: string;
}

export const LoadingBar: React.FC<LoadingBarProps> = ({ 
  progress, 
  color = 'primary',
  height = 'h-1'
}) => {
  const colorClasses = {
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500',
    success: 'bg-success-500'
  };

  const barColor = colorClasses[color as keyof typeof colorClasses] || colorClasses.primary;

  if (progress !== undefined) {
    // Determinate progress
    return (
      <div className={`w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden ${height}`}>
        <div 
          className={`${height} ${barColor} transition-all duration-500 ease-out`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    );
  }

  // Indeterminate progress
  return (
    <div className={`w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden ${height} relative`}>
      <div className={`absolute inset-0 ${barColor} animate-pulse`}></div>
      <div className={`absolute h-full w-1/3 ${barColor} opacity-75`} style={{
        animation: 'loading-bar 1.5s ease-in-out infinite'
      }}></div>
    </div>
  );
};
