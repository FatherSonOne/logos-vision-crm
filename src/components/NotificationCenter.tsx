import React, { useState, useEffect, useRef } from 'react';
import {
  Bell, Check, CheckCheck, X, Trash2, Mail, Calendar,
  Users, DollarSign, AlertCircle, Info, Heart, Briefcase,
  MessageSquare, Clock, ExternalLink
} from 'lucide-react';

/**
 * Notification Center
 * ===================
 * Dropdown notification panel in the header.
 *
 * Features:
 * - Bell icon with unread badge
 * - Dropdown panel with notifications
 * - Mark as read/unread
 * - Delete notifications
 * - Clear all option
 * - Notification types with icons
 * - Links to source
 * - Real-time updates (WebSocket ready)
 */

export type NotificationType =
  | 'mention'
  | 'comment'
  | 'task'
  | 'donation'
  | 'event'
  | 'contact'
  | 'project'
  | 'reminder'
  | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
  avatar?: string;
}

interface NotificationCenterProps {
  className?: string;
}

// Mock notifications - replace with real API data
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'donation',
    title: 'New Donation Received',
    message: 'Sarah Johnson donated $500 to Annual Fund',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 min ago
    read: false,
    link: '/donations'
  },
  {
    id: '2',
    type: 'task',
    title: 'Task Due Soon',
    message: 'Follow up with Michael Chen - Due in 2 hours',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    read: false,
    link: '/tasks'
  },
  {
    id: '3',
    type: 'mention',
    title: 'You were mentioned',
    message: 'Emma Davis mentioned you in "Q4 Planning"',
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    read: false,
    link: '/projects'
  },
  {
    id: '4',
    type: 'event',
    title: 'Upcoming Event',
    message: 'Board Meeting tomorrow at 2:00 PM',
    timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
    read: true,
    link: '/calendar'
  },
  {
    id: '5',
    type: 'contact',
    title: 'New Contact Added',
    message: 'James Wilson was added to Donor Database',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    read: true,
    link: '/contacts'
  }
];

const getNotificationIcon = (type: NotificationType) => {
  const iconClass = "w-4 h-4";
  switch (type) {
    case 'mention':
    case 'comment':
      return <MessageSquare className={iconClass} />;
    case 'task':
      return <Clock className={iconClass} />;
    case 'donation':
      return <DollarSign className={iconClass} />;
    case 'event':
      return <Calendar className={iconClass} />;
    case 'contact':
      return <Users className={iconClass} />;
    case 'project':
      return <Briefcase className={iconClass} />;
    case 'reminder':
      return <Bell className={iconClass} />;
    case 'system':
      return <Info className={iconClass} />;
    default:
      return <Bell className={iconClass} />;
  }
};

const getNotificationColor = (type: NotificationType): string => {
  switch (type) {
    case 'mention':
    case 'comment':
      return 'var(--aurora-violet)';
    case 'task':
      return 'var(--color-warning)';
    case 'donation':
      return 'var(--aurora-green)';
    case 'event':
      return 'var(--aurora-cyan)';
    case 'contact':
      return 'var(--aurora-teal)';
    case 'project':
      return 'var(--aurora-pink)';
    case 'reminder':
      return 'var(--color-info)';
    case 'system':
      return 'var(--cmf-text-muted)';
    default:
      return 'var(--cmf-accent)';
  }
};

const formatTimestamp = (timestamp: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - timestamp.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return timestamp.toLocaleDateString();
};

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      // Navigate to link - integrate with your routing system
      window.location.hash = notification.link;
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Bell Icon Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg transition-colors hover:bg-[var(--cmf-surface-2)]"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        title="Notifications"
        type="button"
      >
        <Bell className="w-5 h-5" style={{ color: 'var(--cmf-text-secondary)' }} aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold rounded-full border-2"
            style={{
              backgroundColor: 'var(--color-error)',
              color: 'white',
              borderColor: 'var(--cmf-bg)',
              fontSize: '11px'
            }}
            aria-label={`${unreadCount} unread notifications`}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-96 rounded-xl shadow-2xl border animate-scale-in"
          style={{
            backgroundColor: 'var(--cmf-surface)',
            borderColor: 'var(--cmf-border-strong)',
            zIndex: 'var(--z-dropdown)'
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: 'var(--cmf-border)' }}
          >
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--cmf-text)' }}>
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span
                  className="px-2 py-0.5 text-xs font-semibold rounded-full"
                  style={{
                    backgroundColor: 'var(--color-error)',
                    color: 'white'
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-1.5 rounded-lg hover:bg-[var(--cmf-surface-2)] transition-colors"
                  title="Mark all as read"
                  type="button"
                >
                  <CheckCheck className="w-4 h-4" style={{ color: 'var(--cmf-text-secondary)' }} />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="p-1.5 rounded-lg hover:bg-[var(--cmf-surface-2)] transition-colors"
                  title="Clear all"
                  type="button"
                >
                  <Trash2 className="w-4 h-4" style={{ color: 'var(--cmf-text-secondary)' }} />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[var(--cmf-surface-2)] transition-colors"
                aria-label="Close notifications"
                type="button"
              >
                <X className="w-4 h-4" style={{ color: 'var(--cmf-text-secondary)' }} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Bell className="w-12 h-12 mb-3" style={{ color: 'var(--cmf-text-faint)', opacity: 0.3 }} />
                <p className="text-sm font-medium" style={{ color: 'var(--cmf-text-muted)' }}>
                  No notifications
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--cmf-text-faint)' }}>
                  You're all caught up!
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`group relative border-b last:border-b-0 transition-colors ${
                    notification.link ? 'cursor-pointer hover:bg-[var(--cmf-surface-2)]' : ''
                  }`}
                  style={{ borderColor: 'var(--cmf-border)' }}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="px-4 py-3 flex items-start gap-3">
                    {/* Icon */}
                    <div
                      className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
                      style={{
                        backgroundColor: `${getNotificationColor(notification.type)}15`,
                        color: getNotificationColor(notification.type)
                      }}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold" style={{ color: 'var(--cmf-text)' }}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <span
                            className="flex-shrink-0 w-2 h-2 rounded-full mt-1"
                            style={{ backgroundColor: 'var(--cmf-accent)' }}
                            aria-label="Unread"
                          />
                        )}
                      </div>
                      <p className="text-sm mt-0.5 line-clamp-2" style={{ color: 'var(--cmf-text-secondary)' }}>
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs" style={{ color: 'var(--cmf-text-faint)' }}>
                          {formatTimestamp(notification.timestamp)}
                        </span>
                        {notification.link && (
                          <span className="flex items-center gap-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--cmf-accent)' }}>
                            View <ExternalLink className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className="p-1.5 rounded-lg hover:bg-[var(--cmf-surface-3)] transition-colors"
                          title="Mark as read"
                          type="button"
                        >
                          <Check className="w-3.5 h-3.5" style={{ color: 'var(--cmf-text-secondary)' }} />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-[var(--cmf-surface-3)] transition-colors"
                        title="Delete"
                        type="button"
                      >
                        <X className="w-3.5 h-3.5" style={{ color: 'var(--cmf-text-secondary)' }} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div
              className="px-4 py-3 border-t text-center"
              style={{ borderColor: 'var(--cmf-border)' }}
            >
              <button
                className="text-sm font-medium transition-colors"
                style={{ color: 'var(--cmf-accent)' }}
                onClick={() => {
                  // Navigate to full notifications page
                  window.location.hash = '/notifications';
                  setIsOpen(false);
                }}
                type="button"
              >
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
