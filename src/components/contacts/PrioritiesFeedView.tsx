/**
 * PrioritiesFeedView Component
 * Main priorities feed with AI-driven action queue
 * Phase 2: Priorities Feed Implementation
 */

import React, { useState, useEffect } from 'react';
import type { RecommendedAction } from '../../types/pulseContacts';
import { ActionCard } from './ActionCard';
import { mockRecommendedActions } from './mockPrioritiesData';
import { pulseContactService } from '../../services/pulseContactService';
import { logger } from '../../utils/logger';

type FilterType = 'all' | 'overdue' | 'today' | 'week' | 'high-value';

interface CompletedAction extends RecommendedAction {
  completed: true;
  completedAt: string;
}

interface Contact {
  id: string;
  name: string;
  email?: string;
  [key: string]: any;
}

interface PrioritiesFeedViewProps {
  contacts?: Contact[];
  onViewProfile?: (contact: Contact) => void;
}

export function PrioritiesFeedView({ contacts = [], onViewProfile }: PrioritiesFeedViewProps = {}) {
  const [actions, setActions] = useState<RecommendedAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [completedToday, setCompletedToday] = useState<CompletedAction[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load actions on mount
  useEffect(() => {
    async function loadActions() {
      setLoading(true);
      setError(null);

      try {
        // Try to load from Pulse service
        const fetchedActions = await pulseContactService.getRecommendedActions();

        if (fetchedActions && fetchedActions.length > 0) {
          setActions(fetchedActions);
        } else {
          // Fallback to mock data
          setActions(mockRecommendedActions);
        }
      } catch (err) {
        logger.warn('Failed to load recommended actions, using sample data', err);
        setError('Failed to load priorities. Using sample data.');
        // Fallback to mock data on error
        setActions(mockRecommendedActions);
      } finally {
        setLoading(false);
      }
    }

    loadActions();
  }, []);

  // Filter actions based on selected filter
  const filteredActions = actions.filter(action => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekFromNow = new Date(today.getTime() + 7 * 86400000);

    switch (filter) {
      case 'overdue':
        if (!action.due_date) return false;
        return new Date(action.due_date) < today;

      case 'today':
        if (!action.due_date) return false;
        const dueDate = new Date(action.due_date);
        const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
        return dueDateOnly.getTime() === today.getTime();

      case 'week':
        if (!action.due_date) return false;
        const actionDueDate = new Date(action.due_date);
        return actionDueDate >= today && actionDueDate <= weekFromNow;

      case 'high-value':
        return action.value_indicator.includes('High') || action.value_indicator.includes('Very High');

      default:
        return true;
    }
  });

  // Sort by priority (high > medium > low > opportunity) and then by due date
  const sortedActions = [...filteredActions].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2, opportunity: 3 };

    // First sort by priority
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Then sort by due date (earliest first)
    if (a.due_date && b.due_date) {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    }
    if (a.due_date) return -1;
    if (b.due_date) return 1;

    return 0;
  });

  // Handle action completion
  const handleCompleteAction = (actionId: string) => {
    const action = actions.find(a => a.id === actionId);
    if (!action) return;

    // Move to completed
    const completedAction: CompletedAction = {
      ...action,
      completed: true,
      completedAt: new Date().toISOString()
    };

    setCompletedToday([...completedToday, completedAction]);

    // Remove from active actions
    setActions(actions.filter(a => a.id !== actionId));

    logger.debug(`Action completed: ${action.contact_name}`);
  };

  // Handle view profile navigation
  const handleViewProfile = (contactId: string) => {
    if (!onViewProfile) {
      logger.debug(`Navigate to contact profile: ${contactId}`);
      return;
    }

    // Find the contact by ID
    const contact = contacts.find(c => c.id === contactId);

    if (contact) {
      onViewProfile(contact);
    } else {
      logger.warn(`Contact not found: ${contactId}`);
    }
  };

  // Filter chip component
  const FilterChip = ({ value, label, count }: { value: FilterType; label: string; count?: number }) => {
    const isActive = filter === value;

    return (
      <button
        onClick={() => setFilter(value)}
        className={`
          px-4 py-2 rounded-full text-sm font-medium transition-all
          ${isActive
            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 dark:shadow-blue-500/50'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }
        `}
      >
        {label}
        {count !== undefined && (
          <span className={`ml-2 ${isActive ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
            ({count})
          </span>
        )}
      </button>
    );
  };

  // Calculate filter counts
  const filterCounts = {
    all: actions.length,
    overdue: actions.filter(a => a.due_date && new Date(a.due_date) < new Date()).length,
    today: actions.filter(a => {
      if (!a.due_date) return false;
      const dueDate = new Date(a.due_date);
      const today = new Date();
      return dueDate.toDateString() === today.toDateString();
    }).length,
    week: actions.filter(a => {
      if (!a.due_date) return false;
      const dueDate = new Date(a.due_date);
      const today = new Date();
      const weekFromNow = new Date(today.getTime() + 7 * 86400000);
      return dueDate >= today && dueDate <= weekFromNow;
    }).length,
    highValue: actions.filter(a =>
      a.value_indicator.includes('High') || a.value_indicator.includes('Very High')
    ).length
  };

  return (
    <div className="priorities-feed-view max-w-4xl mx-auto py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your Priorities</h2>
            <p className="text-gray-600 dark:text-gray-400">
              AI-powered action queue to strengthen relationships and maximize impact
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/50 rounded-lg">
              <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-sm text-amber-700 dark:text-amber-300">{error}</span>
            </div>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
          <FilterChip value="all" label="All" count={filterCounts.all} />
          <FilterChip value="overdue" label="Overdue" count={filterCounts.overdue} />
          <FilterChip value="today" label="Today" count={filterCounts.today} />
          <FilterChip value="week" label="This Week" count={filterCounts.week} />
          <FilterChip value="high-value" label="High Value" count={filterCounts.highValue} />
        </div>
      </div>

      {/* Loading State with Skeletons */}
      {loading && (
        <div className="space-y-4 page-transition">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-card animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="skeleton-circle w-16 h-16"></div>
                <div className="flex-1 space-y-2">
                  <div className="skeleton-text w-3/4 h-5"></div>
                  <div className="skeleton-text w-1/2 h-4"></div>
                </div>
              </div>
              <div className="skeleton-text w-full h-20 mb-3"></div>
              <div className="skeleton-text w-2/3 h-4"></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && sortedActions.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-card page-transition">
            <div className="empty-state-icon" aria-hidden="true">
              {filter === 'all' ? '🎉' : '🔍'}
            </div>
            <h3 className="empty-state-title">
              {filter === 'all' ? 'All Caught Up!' : 'No Actions Found'}
            </h3>
            <p className="empty-state-description">
              {filter === 'all'
                ? "You have no pending actions. Great work! Check back later for AI-recommended outreach opportunities."
                : `No actions match the "${filter}" filter. Try selecting a different filter or view all actions.`
              }
            </p>
            {filter !== 'all' && (
              <button
                type="button"
                onClick={() => setFilter('all')}
                className="btn btn-primary"
                aria-label="View all actions"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                View All Actions
              </button>
            )}
          </div>
        </div>
      )}

      {/* Actions Feed */}
      {!loading && sortedActions.length > 0 && (
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              {sortedActions.length} {sortedActions.length === 1 ? 'Action' : 'Actions'}
            </h3>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              Sorted by priority and due date
            </div>
          </div>

          {sortedActions.map(action => (
            <ActionCard
              key={action.id}
              action={action}
              onComplete={() => handleCompleteAction(action.id)}
              onViewProfile={() => handleViewProfile(action.contact_id)}
            />
          ))}
        </div>
      )}

      {/* Completed Today Section */}
      {completedToday.length > 0 && (
        <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>✅</span>
            <span>Completed Today ({completedToday.length})</span>
          </h3>

          <div className="space-y-3">
            {completedToday.map(action => (
              <div
                key={action.id}
                className="bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-500/30 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-200 dark:bg-green-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>

                  <div>
                    <h4 className="text-gray-900 dark:text-white font-medium">{action.contact_name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{action.reason}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleViewProfile(action.contact_id)}
                  className="btn btn-secondary btn-sm"
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      {!loading && sortedActions.length > 0 && (
        <div className="mt-8 bg-blue-100 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <p className="font-medium text-blue-700 dark:text-blue-300 mb-1">Pro Tip:</p>
              <p>
                Focus on high-priority actions first. Check off suggested actions as you complete them,
                then mark the entire action as complete when finished.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
