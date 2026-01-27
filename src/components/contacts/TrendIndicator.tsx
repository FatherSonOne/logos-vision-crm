import React from 'react';

interface TrendIndicatorProps {
  trend?: 'rising' | 'stable' | 'falling' | 'new' | 'dormant';
  className?: string;
}

export function TrendIndicator({ trend, className = '' }: TrendIndicatorProps) {
  if (!trend) return null;

  const config = {
    rising: {
      icon: '↗',
      label: 'Rising',
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-200/60 dark:bg-green-400/20'
    },
    stable: {
      icon: '━',
      label: 'Stable',
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-200/60 dark:bg-blue-400/20'
    },
    falling: {
      icon: '↘',
      label: 'Falling',
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-200/60 dark:bg-orange-400/20'
    },
    new: {
      icon: '✨',
      label: 'New',
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-200/60 dark:bg-purple-400/20'
    },
    dormant: {
      icon: '💤',
      label: 'Dormant',
      color: 'text-gray-600 dark:text-gray-400',
      bg: 'bg-gray-200/60 dark:bg-gray-400/20'
    }
  };

  const { icon, label, color, bg } = config[trend];

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${bg} ${className}`}>
      <span className={`text-lg ${color}`} aria-hidden="true">{icon}</span>
      <span className={`text-sm font-medium ${color}`}>{label}</span>
      <span className="sr-only">Trend: {label}</span>
    </div>
  );
}
