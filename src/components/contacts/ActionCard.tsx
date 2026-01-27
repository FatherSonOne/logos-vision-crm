/**
 * ActionCard Component
 * Individual action card with AI recommendations for the Priorities Feed
 * Phase 2: Priorities Feed Implementation
 */

import React, { useState } from 'react';
import type { RecommendedAction } from '../../types/pulseContacts';
import { TrendIndicator } from './TrendIndicator';
import { RelationshipScoreCircle } from './RelationshipScoreCircle';

interface ActionCardProps {
  action: RecommendedAction;
  onComplete: () => void;
  onViewProfile: () => void;
}

export function ActionCard({ action, onComplete, onViewProfile }: ActionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  // Priority configuration with colors and icons
  const priorityConfig = {
    high: {
      bg: 'bg-red-200/80 dark:bg-red-500/20',
      text: 'text-red-700 dark:text-red-300',
      border: 'border-red-400 dark:border-red-500/50',
      icon: '🔥',
      label: 'High Priority'
    },
    medium: {
      bg: 'bg-amber-200/80 dark:bg-amber-500/20',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-400 dark:border-amber-500/50',
      icon: '⚡',
      label: 'Medium Priority'
    },
    low: {
      bg: 'bg-blue-200/80 dark:bg-blue-500/20',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-400 dark:border-blue-500/50',
      icon: '📋',
      label: 'Low Priority'
    },
    opportunity: {
      bg: 'bg-purple-200/80 dark:bg-purple-500/20',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-400 dark:border-purple-500/50',
      icon: '💡',
      label: 'Opportunity'
    }
  };

  const config = priorityConfig[action.priority];

  // Handle checkbox toggle
  const toggleCheckbox = (index: number) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedItems(newChecked);
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date';

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} days`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else if (diffDays <= 7) {
      return `Due in ${diffDays} days`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format last interaction date
  const formatLastInteraction = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  // Check if overdue
  const isOverdue = action.due_date && new Date(action.due_date) < new Date();

  return (
    <div className={`
      action-card bg-white/90 dark:bg-gray-800/50 backdrop-blur-sm border-2 rounded-lg p-6
      ${config.border} hover:border-gray-400 dark:hover:border-gray-600 transition-all animate-slide-up
      shadow-md dark:shadow-none
    `}>
      {/* Priority Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className={`
            badge ${config.bg} ${config.text} border ${config.border}
            px-3 py-1 text-sm font-medium
          `}>
            <span className="mr-1" aria-hidden="true">{config.icon}</span>
            {config.label}
          </span>

          {isOverdue && (
            <span className="badge badge-danger px-2 py-0.5 text-xs">
              Overdue
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          aria-label={expanded ? 'Hide details' : 'Show details'}
          aria-expanded={expanded ? 'true' : 'false'}
          aria-controls={`action-details-${action.profile_id}`}
        >
          <svg
            className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Contact Info */}
      <div className="flex items-center gap-4 mb-4">
        <RelationshipScoreCircle score={action.contact_score} size="md" />

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{action.contact_name}</h3>
            <TrendIndicator trend={action.contact_trend} />
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            {action.contact_company && (
              <span>{action.contact_company}</span>
            )}
            {action.contact_company && action.donor_stage && (
              <span>•</span>
            )}
            {action.donor_stage && (
              <span className="font-medium text-blue-600 dark:text-blue-300">{action.donor_stage}</span>
            )}
          </div>
        </div>
      </div>

      {/* AI Recommendation Panel */}
      <div className="bg-blue-100 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-500/30 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-2 mb-2">
          <span className="text-blue-600 dark:text-blue-400 text-lg">🤖</span>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">AI Recommendation</h4>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{action.reason}</p>
          </div>
        </div>
      </div>

      {/* Suggested Actions Checklist */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Suggested Actions:</h4>
        <div className="space-y-2">
          {action.suggested_actions.map((suggestedAction, index) => (
            <label
              key={index}
              className="flex items-start gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                className="checkbox mt-0.5"
                checked={checkedItems.has(index)}
                onChange={() => toggleCheckbox(index)}
              />
              <span className={`
                text-sm text-gray-700 dark:text-gray-300 flex-1 leading-relaxed transition-all
                ${checkedItems.has(index) ? 'line-through text-gray-500 dark:text-gray-500' : 'group-hover:text-gray-900 dark:group-hover:text-white'}
              `}>
                {suggestedAction}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Expanded Metadata */}
      {expanded && (
        <div id={`action-details-${action.profile_id}`} className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4 animate-fade-in">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Last Contact:</span>
              <span className="ml-2 text-gray-900 dark:text-white font-medium">
                {formatLastInteraction(action.last_interaction_date)}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Lifetime Giving:</span>
              <span className="ml-2 text-green-600 dark:text-green-400 font-medium">
                {formatCurrency(action.lifetime_giving || 0)}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Sentiment:</span>
              <span className="ml-2 text-gray-900 dark:text-white font-medium">
                {Math.round(action.sentiment * 100)}% Positive
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Due Date:</span>
              <span className={`ml-2 font-medium ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                {formatDate(action.due_date)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={onComplete}
          className="btn btn-success btn-sm flex-1 min-w-[140px]"
          aria-label={`Complete action: ${action.action_description} for ${action.contact_name}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Mark Complete</span>
        </button>

        <button
          type="button"
          className="btn btn-secondary btn-sm flex-1 min-w-[120px]"
          title="Draft email with AI-generated content"
          aria-label={`Draft email for ${action.contact_name}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span>Draft Email</span>
        </button>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          title="Schedule follow-up"
          aria-label={`Schedule follow-up with ${action.contact_name}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>

        <button
          type="button"
          onClick={onViewProfile}
          className="btn btn-secondary btn-sm"
          title="View contact profile"
          aria-label={`View contact profile for ${action.contact_name}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      </div>

      {/* Value Indicator Badge */}
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-gray-600 dark:text-gray-500">
          Score: {action.contact_score}/100
        </span>
        <span className={`
          px-2 py-1 rounded-full font-medium
          ${action.value_indicator.includes('Very High') || action.value_indicator.includes('High')
            ? 'bg-green-200 dark:bg-green-500/20 text-green-700 dark:text-green-300 border border-green-400 dark:border-green-500/30'
            : 'bg-gray-200 dark:bg-gray-600/20 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600/30'
          }
        `}>
          {action.value_indicator}
        </span>
      </div>
    </div>
  );
}
