// AI Suggestion Badge Component
// Displays inline AI suggestions with reasoning tooltips and apply actions

import React, { useState } from 'react';
import { Sparkles, Check, X, Info } from 'lucide-react';
import { TaskPriority } from '../../services/taskManagementService';

export type SuggestionType = 'priority' | 'assignee' | 'deadline' | 'risk' | 'completion';

export interface AiSuggestionBadgeProps {
  type: SuggestionType;
  suggestion: any;
  reasoning: string;
  confidence?: number;
  onApply: () => void;
  onDismiss?: () => void;
  className?: string;
}

const AiSuggestionBadge: React.FC<AiSuggestionBadgeProps> = ({
  type,
  suggestion,
  reasoning,
  confidence,
  onApply,
  onDismiss,
  className = '',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  // Get display text based on suggestion type
  const getSuggestionText = () => {
    switch (type) {
      case 'priority':
        return `Priority: ${suggestion}`;
      case 'assignee':
        return `Assign to: ${suggestion.name || suggestion}`;
      case 'deadline':
        return `Due: ${suggestion}`;
      case 'risk':
        return `Risk: ${suggestion}`;
      case 'completion':
        return suggestion.isCompletelyDone ? 'Ready to close' : 'Not ready';
      default:
        return 'AI Suggestion';
    }
  };

  // Get badge color based on type and confidence
  const getBadgeStyle = () => {
    const baseClasses = 'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200';

    if (confidence !== undefined && confidence < 60) {
      return `${baseClasses} bg-yellow-50 text-yellow-700 border border-yellow-200`;
    }

    switch (type) {
      case 'priority':
        return `${baseClasses} bg-blue-50 text-blue-700 border border-blue-200`;
      case 'assignee':
        return `${baseClasses} bg-purple-50 text-purple-700 border border-purple-200`;
      case 'deadline':
        return `${baseClasses} bg-orange-50 text-orange-700 border border-orange-200`;
      case 'risk':
        const riskLevel = suggestion.toLowerCase();
        if (riskLevel === 'critical' || riskLevel === 'high') {
          return `${baseClasses} bg-red-50 text-red-700 border border-red-200`;
        }
        return `${baseClasses} bg-yellow-50 text-yellow-700 border border-yellow-200`;
      case 'completion':
        return suggestion.isCompletelyDone
          ? `${baseClasses} bg-green-50 text-green-700 border border-green-200`
          : `${baseClasses} bg-orange-50 text-orange-700 border border-orange-200`;
      default:
        return `${baseClasses} bg-gray-50 text-gray-700 border border-gray-200`;
    }
  };

  // Handle apply action with loading state
  const handleApply = async () => {
    setIsApplying(true);
    try {
      await onApply();
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className={getBadgeStyle()}>
        {/* AI Sparkle Icon */}
        <Sparkles className="w-4 h-4" />

        {/* Suggestion Text */}
        <span>{getSuggestionText()}</span>

        {/* Confidence Score */}
        {confidence !== undefined && (
          <span className="text-xs opacity-70">({confidence}%)</span>
        )}

        {/* Info Icon with Tooltip */}
        <button
          className="p-0.5 rounded hover:bg-white/50 transition-colors"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={(e) => {
            e.stopPropagation();
            setShowTooltip(!showTooltip);
          }}
          aria-label="Show reasoning"
        >
          <Info className="w-3.5 h-3.5" />
        </button>

        {/* Apply Button */}
        <button
          onClick={handleApply}
          disabled={isApplying}
          className="p-1 rounded-full bg-white hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Apply suggestion"
        >
          {isApplying ? (
            <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5 text-green-600" />
          )}
        </button>

        {/* Dismiss Button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 rounded-full bg-white hover:bg-gray-100 transition-colors"
            title="Dismiss suggestion"
          >
            <X className="w-3.5 h-3.5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Reasoning Tooltip */}
      {showTooltip && (
        <div className="absolute z-50 mt-2 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg max-w-xs">
          <div className="font-semibold mb-1">AI Reasoning:</div>
          <div className="text-gray-300">{reasoning}</div>
          {/* Tooltip arrow */}
          <div className="absolute -top-2 left-6 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-gray-900" />
        </div>
      )}
    </div>
  );
};

export default AiSuggestionBadge;
