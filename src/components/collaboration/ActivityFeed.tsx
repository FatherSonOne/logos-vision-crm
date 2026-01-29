/**
 * ActivityFeed Component
 * ======================
 * A timeline-style activity feed showing all collaboration events
 * for an entity (task, project, case, etc.)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  AtSign,
  UserPlus,
  UserMinus,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Pin,
  Eye,
  EyeOff,
  ArrowRight,
  Calendar,
  Tag,
  RefreshCw,
  Filter as FilterIcon
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { getActivityLog } from '../../services/collaborationService';
import type { ActivityLogEntry, ActivityAction, CollaborationEntityType, TeamMember } from '../../types';

interface ActivityFeedProps {
  entityType: CollaborationEntityType;
  entityId: string;
  currentUser?: TeamMember;
  title?: string;
  limit?: number;
  showFilters?: boolean;
  compact?: boolean;
  className?: string;
}

// Activity action icons and labels
const actionConfig: Record<ActivityAction, { icon: React.ReactNode; color: string; label: string }> = {
  created: { icon: <CheckCircle className="w-4 h-4" />, color: 'var(--aurora-green)', label: 'Created' },
  updated: { icon: <Edit className="w-4 h-4" />, color: 'var(--aurora-cyan)', label: 'Updated' },
  deleted: { icon: <Trash2 className="w-4 h-4" />, color: '#ef4444', label: 'Deleted' },
  commented: { icon: <MessageSquare className="w-4 h-4" />, color: 'var(--aurora-teal)', label: 'Commented' },
  mentioned: { icon: <AtSign className="w-4 h-4" />, color: 'var(--aurora-pink)', label: 'Mentioned' },
  assigned: { icon: <UserPlus className="w-4 h-4" />, color: 'var(--aurora-cyan)', label: 'Assigned' },
  unassigned: { icon: <UserMinus className="w-4 h-4" />, color: 'var(--cmf-text-muted)', label: 'Unassigned' },
  status_changed: { icon: <ArrowRight className="w-4 h-4" />, color: 'var(--aurora-amber)', label: 'Status Changed' },
  priority_changed: { icon: <Tag className="w-4 h-4" />, color: 'var(--aurora-pink)', label: 'Priority Changed' },
  due_date_changed: { icon: <Calendar className="w-4 h-4" />, color: 'var(--aurora-amber)', label: 'Due Date Changed' },
  completed: { icon: <CheckCircle className="w-4 h-4" />, color: 'var(--aurora-green)', label: 'Completed' },
  reopened: { icon: <RefreshCw className="w-4 h-4" />, color: 'var(--aurora-amber)', label: 'Reopened' },
  archived: { icon: <EyeOff className="w-4 h-4" />, color: 'var(--cmf-text-muted)', label: 'Archived' },
  restored: { icon: <Eye className="w-4 h-4" />, color: 'var(--aurora-green)', label: 'Restored' },
  pinned: { icon: <Pin className="w-4 h-4" />, color: 'var(--aurora-amber)', label: 'Pinned' },
  unpinned: { icon: <Pin className="w-4 h-4" />, color: 'var(--cmf-text-muted)', label: 'Unpinned' },
  watched: { icon: <Eye className="w-4 h-4" />, color: 'var(--aurora-teal)', label: 'Started Watching' },
  unwatched: { icon: <EyeOff className="w-4 h-4" />, color: 'var(--cmf-text-muted)', label: 'Stopped Watching' },
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  entityType,
  entityId,
  currentUser,
  title = 'Activity',
  limit = 20,
  showFilters = true,
  compact = false,
  className = '',
}) => {
  // State
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [selectedActions, setSelectedActions] = useState<Set<ActivityAction>>(new Set());
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Load activities
  const loadActivities = useCallback(async (reset = false) => {
    const currentOffset = reset ? 0 : offset;
    setIsLoading(true);

    try {
      let data = await getActivityLog(entityType, entityId, {
        limit,
        offset: currentOffset,
      });

      // Apply client-side filtering if filters are active
      if (selectedActions.size > 0) {
        data = data.filter(a => selectedActions.has(a.action));
      }

      setActivities(prev => reset ? data : [...prev, ...data]);
      setHasMore(data.length === limit);
      setOffset(currentOffset + data.length);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setIsLoading(false);
    }
  }, [entityType, entityId, limit, offset, selectedActions]);

  // Initial load
  useEffect(() => {
    loadActivities(true);
  }, [entityType, entityId]);

  // Reload when filters change
  useEffect(() => {
    loadActivities(true);
  }, [selectedActions]);

  // Toggle filter
  const toggleFilter = (action: ActivityAction) => {
    setSelectedActions(prev => {
      const next = new Set(prev);
      if (next.has(action)) {
        next.delete(action);
      } else {
        next.add(action);
      }
      return next;
    });
  };

  // Clear filters
  const clearFilters = () => {
    setSelectedActions(new Set());
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  // Format change value
  const formatChangeValue = (value: unknown): string => {
    if (value === null || value === undefined) return 'none';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value instanceof Date) return value.toLocaleDateString();
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  // Render change details
  const renderChanges = (changes: Record<string, { old: unknown; new: unknown }>) => {
    return Object.entries(changes).map(([field, { old: oldVal, new: newVal }]) => (
      <div key={field} className="flex items-center gap-2 text-xs mt-1">
        <span className="font-medium capitalize">{field.replace(/_/g, ' ')}:</span>
        <span style={{ color: 'var(--cmf-text-muted)' }}>{formatChangeValue(oldVal)}</span>
        <ArrowRight className="w-3 h-3" style={{ color: 'var(--cmf-text-faint)' }} />
        <span style={{ color: 'var(--aurora-teal)' }}>{formatChangeValue(newVal)}</span>
      </div>
    ));
  };

  if (compact) {
    return (
      <div className={`space-y-2 ${className}`}>
        {activities.slice(0, 5).map(activity => (
          <CompactActivityItem key={activity.id} activity={activity} formatDate={formatDate} />
        ))}
        {activities.length > 5 && (
          <p className="text-xs text-center py-2" style={{ color: 'var(--cmf-text-muted)' }}>
            +{activities.length - 5} more activities
          </p>
        )}
      </div>
    );
  }

  return (
    <Card variant="elevated" className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {title}
          </CardTitle>
          
          {showFilters && (
            <div className="relative">
              <Button
                variant={selectedActions.size > 0 ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                leftIcon={<FilterIcon className="w-4 h-4" />}
              >
                {selectedActions.size > 0 && (
                  <span className="ml-1">({selectedActions.size})</span>
                )}
              </Button>

              {showFilterMenu && (
                <div 
                  className="absolute right-0 top-full mt-1 p-2 rounded-lg shadow-lg z-10 min-w-[200px]"
                  style={{ 
                    backgroundColor: 'var(--cmf-surface)',
                    border: '1px solid var(--cmf-border)'
                  }}
                >
                  <div className="flex items-center justify-between mb-2 pb-2" style={{ borderBottom: '1px solid var(--cmf-border)' }}>
                    <span className="text-xs font-medium" style={{ color: 'var(--cmf-text-muted)' }}>Filter by action</span>
                    {selectedActions.size > 0 && (
                      <button 
                        onClick={clearFilters}
                        className="text-xs hover:underline"
                        style={{ color: 'var(--aurora-teal)' }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {Object.entries(actionConfig).slice(0, 10).map(([action, config]) => (
                      <button
                        key={action}
                        onClick={() => toggleFilter(action as ActivityAction)}
                        className={`
                          flex items-center gap-2 px-2 py-1.5 rounded text-xs text-left transition-colors
                          ${selectedActions.has(action as ActivityAction) ? '' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}
                        `}
                        style={{
                          backgroundColor: selectedActions.has(action as ActivityAction) 
                            ? `${config.color}20` 
                            : 'transparent',
                          color: selectedActions.has(action as ActivityAction) 
                            ? config.color 
                            : 'var(--cmf-text)',
                        }}
                      >
                        {config.icon}
                        {config.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {isLoading && activities.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div 
              className="animate-spin w-6 h-6 border-2 border-current border-t-transparent rounded-full"
              style={{ color: 'var(--aurora-teal)' }}
            />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8" style={{ color: 'var(--cmf-text-muted)' }}>
            <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No activity yet</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div 
              className="absolute left-4 top-0 bottom-0 w-0.5"
              style={{ backgroundColor: 'var(--cmf-border)' }}
            />

            {/* Activity Items */}
            <div className="space-y-4">
              {activities.map((activity, index) => {
                const config = actionConfig[activity.action] || actionConfig.updated;
                const isLast = index === activities.length - 1;

                return (
                  <div key={activity.id} className="relative pl-10">
                    {/* Timeline Dot */}
                    <div 
                      className="absolute left-2 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ 
                        backgroundColor: 'var(--cmf-surface)',
                        border: `2px solid ${config.color}`,
                      }}
                    >
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: config.color }}
                      />
                    </div>

                    {/* Content */}
                    <div 
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: 'var(--cmf-surface-2)' }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span style={{ color: config.color }}>
                            {config.icon}
                          </span>
                          <span className="font-medium" style={{ color: 'var(--cmf-text)' }}>
                            {activity.actorName || 'System'}
                          </span>
                          <span style={{ color: 'var(--cmf-text-muted)' }}>
                            {config.label.toLowerCase()}
                          </span>
                        </div>
                        <span 
                          className="text-xs whitespace-nowrap"
                          style={{ color: 'var(--cmf-text-muted)' }}
                        >
                          {formatDate(activity.createdAt)}
                        </span>
                      </div>

                      {activity.description && (
                        <p 
                          className="text-sm mt-1"
                          style={{ color: 'var(--cmf-text-secondary)' }}
                        >
                          {activity.description}
                        </p>
                      )}

                      {activity.changes && Object.keys(activity.changes).length > 0 && (
                        <div className="mt-2">
                          {renderChanges(activity.changes)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadActivities()}
                  disabled={isLoading}
                  isLoading={isLoading}
                >
                  Load more activity
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Compact Activity Item
const CompactActivityItem: React.FC<{
  activity: ActivityLogEntry;
  formatDate: (date: string) => string;
}> = ({ activity, formatDate }) => {
  const config = actionConfig[activity.action] || actionConfig.updated;

  return (
    <div className="flex items-center gap-3 py-1">
      <div 
        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${config.color}20`, color: config.color }}
      >
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate" style={{ color: 'var(--cmf-text)' }}>
          <span className="font-medium">{activity.actorName || 'System'}</span>
          {' '}
          <span style={{ color: 'var(--cmf-text-muted)' }}>{config.label.toLowerCase()}</span>
        </p>
      </div>
      <span className="text-xs flex-shrink-0" style={{ color: 'var(--cmf-text-faint)' }}>
        {formatDate(activity.createdAt)}
      </span>
    </div>
  );
};

export default ActivityFeed;
