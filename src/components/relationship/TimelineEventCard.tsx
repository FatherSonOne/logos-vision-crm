import React from 'react';
import {
  Phone,
  Mail,
  Users,
  FileText,
  CheckCircle,
  Circle,
  DollarSign,
  Flag,
  Clock,
  User,
  Paperclip,
  MessageSquare,
  Handshake,
} from 'lucide-react';
import type { UnifiedTimelineEvent } from '../../types';

interface TimelineEventCardProps {
  event: UnifiedTimelineEvent;
  onClick?: (event: UnifiedTimelineEvent) => void;
}

// Icon mapping for event types
const getEventIcon = (eventType: string, source: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'call': <Phone className="w-4 h-4" />,
    'email': <Mail className="w-4 h-4" />,
    'meeting': <Users className="w-4 h-4" />,
    'note': <FileText className="w-4 h-4" />,
    'task_completed': <CheckCircle className="w-4 h-4" />,
    'task_created': <Circle className="w-4 h-4" />,
    'donation': <DollarSign className="w-4 h-4" />,
    'milestone': <Flag className="w-4 h-4" />,
    'touchpoint': <Handshake className="w-4 h-4" />,
  };

  return iconMap[eventType.toLowerCase()] || <FileText className="w-4 h-4" />;
};

// Color mapping for event sources
const getSourceColor = (source: string) => {
  const colorMap: Record<string, { border: string; bg: string; text: string }> = {
    'activity': {
      border: 'border-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-700 dark:text-blue-300',
    },
    'touchpoint': {
      border: 'border-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      text: 'text-purple-700 dark:text-purple-300',
    },
    'task': {
      border: 'border-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-700 dark:text-amber-300',
    },
    'donation': {
      border: 'border-green-500',
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-700 dark:text-green-300',
    },
    'project_milestone': {
      border: 'border-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      text: 'text-emerald-700 dark:text-emerald-300',
    },
    'communication_log': {
      border: 'border-pink-500',
      bg: 'bg-pink-50 dark:bg-pink-900/20',
      text: 'text-pink-700 dark:text-pink-300',
    },
    'calendar_event': {
      border: 'border-cyan-500',
      bg: 'bg-cyan-50 dark:bg-cyan-900/20',
      text: 'text-cyan-700 dark:text-cyan-300',
    },
  };

  return colorMap[source] || {
    border: 'border-slate-500',
    bg: 'bg-slate-50 dark:bg-slate-900/20',
    text: 'text-slate-700 dark:text-slate-300',
  };
};

// Priority color mapping
const getPriorityColor = (priority?: string) => {
  const colorMap: Record<string, string> = {
    'critical': 'text-red-600 dark:text-red-400',
    'high': 'text-orange-600 dark:text-orange-400',
    'medium': 'text-yellow-600 dark:text-yellow-400',
    'low': 'text-gray-600 dark:text-gray-400',
  };

  return priority ? colorMap[priority] || 'text-gray-600 dark:text-gray-400' : '';
};

// Format timestamp for display
const formatTimestamp = (timestamp: Date): string => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return timestamp.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } else if (diffDays === 1) {
    return `Yesterday ${timestamp.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })}`;
  } else if (diffDays < 7) {
    return timestamp.toLocaleDateString('en-US', {
      weekday: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } else {
    return timestamp.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: timestamp.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
};

export const TimelineEventCard: React.FC<TimelineEventCardProps> = ({ event, onClick }) => {
  const colors = getSourceColor(event.source);
  const icon = getEventIcon(event.eventType, event.source);

  return (
    <div
      onClick={() => onClick?.(event)}
      className={`
        bg-white dark:bg-slate-800 rounded-lg p-4 mb-3
        border-l-4 ${colors.border}
        hover:shadow-lg transition-all duration-200 cursor-pointer
        transform hover:-translate-y-0.5
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`p-2 rounded-full ${colors.bg} ${colors.text} flex-shrink-0`}>
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title & Status */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-semibold text-slate-900 dark:text-white flex-1">
              {event.title}
            </h4>
            {event.status && (
              <span className={`
                text-xs px-2 py-1 rounded-full flex-shrink-0
                ${event.status === 'Completed' || event.status === 'Done'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : event.status === 'In Progress' || event.status === 'InProgress'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300'
                }
              `}>
                {event.status}
              </span>
            )}
          </div>

          {/* Timestamp & Priority */}
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2">
            <Clock className="w-3 h-3" />
            <span>{formatTimestamp(event.timestamp)}</span>
            {event.priority && (
              <>
                <span>•</span>
                <Flag className={`w-3 h-3 ${getPriorityColor(event.priority)}`} />
                <span className="capitalize">{event.priority}</span>
              </>
            )}
            {event.source && (
              <>
                <span>•</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                  {event.source.replace('_', ' ')}
                </span>
              </>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
              {event.description}
            </p>
          )}

          {/* Sentiment & Engagement (for touchpoints) */}
          {(event.sentiment || event.engagementLevel) && (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
              {event.sentiment && (
                <span className={`
                  px-2 py-1 rounded
                  ${event.sentiment === 'positive'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : event.sentiment === 'negative'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300'
                  }
                `}>
                  Sentiment: {event.sentiment}
                </span>
              )}
              {event.engagementLevel && (
                <span className={`
                  px-2 py-1 rounded
                  ${event.engagementLevel === 'high'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : event.engagementLevel === 'medium'
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300'
                  }
                `}>
                  Engagement: {event.engagementLevel}
                </span>
              )}
            </div>
          )}

          {/* Metadata Footer */}
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            {event.createdByName && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{event.createdByName}</span>
              </div>
            )}

            {event.attachments && event.attachments > 0 && (
              <div className="flex items-center gap-1">
                <Paperclip className="w-3 h-3" />
                <span>{event.attachments}</span>
              </div>
            )}

            {event.comments && event.comments > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                <span>{event.comments}</span>
              </div>
            )}

            {event.amount && (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold">
                <DollarSign className="w-3 h-3" />
                <span>${event.amount.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
