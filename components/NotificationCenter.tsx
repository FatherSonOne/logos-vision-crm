import React, { useState, useEffect, useRef } from 'react';

/**
 * Notification Center Component
 *
 * Features:
 * - Bell icon with badge count
 * - Dropdown with categorized notifications
 * - Mark as read/unread
 * - Quick actions from notifications
 * - Real-time updates support
 */

// ============================================
// TYPES
// ============================================

export type NotificationType = 'task' | 'donation' | 'mention' | 'system' | 'reminder' | 'alert';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: NotificationPriority;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDismiss: (id: string) => void;
  onClearAll: () => void;
  onAction?: (notification: Notification) => void;
}

// ============================================
// ICONS
// ============================================

const BellIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const getTypeIcon = (type: NotificationType) => {
  switch (type) {
    case 'task':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'donation':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'mention':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
      );
    case 'reminder':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'alert':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      );
    case 'system':
    default:
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
      );
  }
};

const getTypeColor = (type: NotificationType, priority: NotificationPriority) => {
  if (priority === 'urgent') return 'text-red-500 bg-red-50 dark:bg-red-900/20';
  if (priority === 'high') return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20';

  switch (type) {
    case 'task':
      return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
    case 'donation':
      return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
    case 'mention':
      return 'text-purple-500 bg-purple-50 dark:bg-purple-900/20';
    case 'reminder':
      return 'text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20';
    case 'alert':
      return 'text-amber-500 bg-amber-50 dark:bg-amber-900/20';
    case 'system':
    default:
      return 'text-slate-500 bg-slate-50 dark:bg-slate-900/20';
  }
};

// ============================================
// TIME FORMATTING
// ============================================

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

// ============================================
// NOTIFICATION ITEM
// ============================================

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onAction?: (notification: Notification) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDismiss,
  onAction,
}) => {
  const { id, type, title, message, timestamp, isRead, priority, actionLabel } = notification;

  return (
    <div
      className={`
        relative p-4 border-b border-slate-100 dark:border-slate-700
        hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors
        ${!isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}
      `}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 p-2 rounded-lg ${getTypeColor(type, priority)}`}>
          {getTypeIcon(type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`text-sm font-medium ${!isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
              {title}
            </h4>
            <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
              {formatTimeAgo(timestamp)}
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
            {message}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-2">
            {actionLabel && onAction && (
              <button
                onClick={() => onAction(notification)}
                className="text-xs font-medium text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300"
              >
                {actionLabel}
              </button>
            )}
            {!isRead && (
              <button
                onClick={() => onMarkAsRead(id)}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1"
              >
                <CheckIcon />
                Mark read
              </button>
            )}
          </div>
        </div>

        {/* Dismiss button */}
        <button
          onClick={() => onDismiss(id)}
          className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          aria-label="Dismiss notification"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Unread indicator */}
      {!isRead && (
        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-500" />
      )}
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss,
  onClearAll,
  onAction,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<NotificationType | 'all'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = notifications.filter(
    n => filter === 'all' || n.type === filter
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const filterTabs: Array<{ id: NotificationType | 'all'; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'task', label: 'Tasks' },
    { id: 'donation', label: 'Donations' },
    { id: 'mention', label: 'Mentions' },
    { id: 'system', label: 'System' },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-full text-slate-700 dark:text-slate-200 bg-gradient-to-b from-white/50 to-white/20 dark:from-white/20 dark:to-transparent border border-white/30 dark:border-white/10 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full shadow-lg animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-h-[70vh] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-fade-in">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Notifications
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-medium"
                  >
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={onClearAll}
                    className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 mt-3 overflow-x-auto scrollbar-hide">
              {filterTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                    filter === tab.id
                      ? 'bg-cyan-500 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-[50vh] overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  <BellIcon />
                </div>
                <p className="text-slate-500 dark:text-slate-400">
                  {notifications.length === 0
                    ? 'No notifications yet'
                    : 'No notifications in this category'}
                </p>
              </div>
            ) : (
              filteredNotifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={onMarkAsRead}
                  onDismiss={onDismiss}
                  onAction={onAction}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
              <button className="w-full text-center text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-medium">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================
// SAMPLE NOTIFICATIONS (for testing)
// ============================================

export const sampleNotifications: Notification[] = [
  {
    id: '1',
    type: 'donation',
    title: 'New Donation Received',
    message: 'Sarah Johnson donated $500 to the Annual Fund campaign.',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 mins ago
    isRead: false,
    priority: 'normal',
    actionLabel: 'View Donation',
    actionUrl: '/donations/1',
  },
  {
    id: '2',
    type: 'task',
    title: 'Task Due Today',
    message: 'Follow up with Community Foundation about grant proposal deadline.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
    isRead: false,
    priority: 'high',
    actionLabel: 'View Task',
    actionUrl: '/tasks/2',
  },
  {
    id: '3',
    type: 'mention',
    title: 'You were mentioned',
    message: 'Mike Thompson mentioned you in a comment on "Spring Gala Planning".',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isRead: false,
    priority: 'normal',
    actionLabel: 'View Comment',
    actionUrl: '/projects/3',
  },
  {
    id: '4',
    type: 'reminder',
    title: 'Meeting in 1 hour',
    message: 'Board Meeting at 3:00 PM in Conference Room A.',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    isRead: true,
    priority: 'normal',
    actionLabel: 'View Calendar',
    actionUrl: '/calendar',
  },
  {
    id: '5',
    type: 'system',
    title: 'Weekly Report Ready',
    message: 'Your weekly donation summary report is ready to download.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    isRead: true,
    priority: 'low',
    actionLabel: 'Download Report',
    actionUrl: '/reports',
  },
  {
    id: '6',
    type: 'alert',
    title: 'Payment Failed',
    message: 'Recurring donation from John Smith failed due to expired card.',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    isRead: true,
    priority: 'urgent',
    actionLabel: 'Contact Donor',
    actionUrl: '/donors/6',
  },
];

export default NotificationCenter;
