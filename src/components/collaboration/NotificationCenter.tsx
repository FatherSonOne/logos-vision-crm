/**
 * NotificationCenter Component
 * ============================
 * A comprehensive notification center with real-time updates,
 * notification grouping, and preference management.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Bell, 
  BellOff, 
  Check, 
  CheckCheck, 
  MessageSquare, 
  AtSign, 
  UserPlus, 
  Calendar, 
  AlertTriangle,
  Settings,
  Archive,
  Trash2,
  X,
  ChevronRight,
  Clock,
  Filter
} from 'lucide-react';
import { Button } from '../ui/Button';
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  archiveNotification,
  subscribeToNotifications,
} from '../../services/collaborationService';
import type { Notification, NotificationType, TeamMember } from '../../types';

interface NotificationCenterProps {
  currentUser: TeamMember;
  onNavigate?: (url: string) => void;
  className?: string;
}

// Notification type icons and colors
const notificationConfig: Record<NotificationType, { icon: React.ReactNode; color: string; label: string }> = {
  mention: { icon: <AtSign className="w-4 h-4" />, color: 'var(--aurora-pink)', label: 'Mention' },
  comment: { icon: <MessageSquare className="w-4 h-4" />, color: 'var(--aurora-teal)', label: 'Comment' },
  reply: { icon: <MessageSquare className="w-4 h-4" />, color: 'var(--aurora-cyan)', label: 'Reply' },
  assignment: { icon: <UserPlus className="w-4 h-4" />, color: 'var(--aurora-green)', label: 'Assignment' },
  unassignment: { icon: <UserPlus className="w-4 h-4" />, color: 'var(--cmf-text-muted)', label: 'Unassigned' },
  status_change: { icon: <ChevronRight className="w-4 h-4" />, color: 'var(--aurora-amber)', label: 'Status Change' },
  due_date: { icon: <Calendar className="w-4 h-4" />, color: 'var(--aurora-amber)', label: 'Due Date' },
  overdue: { icon: <AlertTriangle className="w-4 h-4" />, color: '#ef4444', label: 'Overdue' },
  completion: { icon: <Check className="w-4 h-4" />, color: 'var(--aurora-green)', label: 'Completed' },
  approval_request: { icon: <Clock className="w-4 h-4" />, color: 'var(--aurora-pink)', label: 'Approval Needed' },
  approval_response: { icon: <Check className="w-4 h-4" />, color: 'var(--aurora-green)', label: 'Approval' },
  system: { icon: <Bell className="w-4 h-4" />, color: 'var(--cmf-text-muted)', label: 'System' },
};

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  currentUser,
  onNavigate,
  className = '',
}) => {
  // State
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<NotificationType | 'all'>('all');
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const LIMIT = 20;

  // Refs
  const panelRef = useRef<HTMLDivElement>(null);

  // Load notifications
  const loadNotifications = useCallback(async (reset = false) => {
    const currentOffset = reset ? 0 : offset;
    setIsLoading(true);

    try {
      const data = await getNotifications(currentUser.id, {
        limit: LIMIT,
        offset: currentOffset,
        types: filter !== 'all' ? [filter] : undefined,
      });

      setNotifications(prev => reset ? data : [...prev, ...data]);
      setHasMore(data.length === LIMIT);
      setOffset(currentOffset + data.length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser.id, filter, offset]);

  // Load unread count
  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadNotificationCount(currentUser.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  }, [currentUser.id]);

  // Initial load
  useEffect(() => {
    loadNotifications(true);
    loadUnreadCount();

    // Subscribe to real-time notifications
    const unsubscribe = subscribeToNotifications(currentUser.id, (newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => unsubscribe();
  }, [currentUser.id]);

  // Reload when filter changes
  useEffect(() => {
    loadNotifications(true);
  }, [filter]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Mark as read
  const handleMarkRead = async (notification: Notification) => {
    if (notification.isRead) return;

    try {
      await markNotificationRead(notification.id);
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead(currentUser.id);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Archive notification
  const handleArchive = async (notification: Notification) => {
    try {
      await archiveNotification(notification.id);
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
      if (!notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error archiving notification:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    handleMarkRead(notification);
    if (notification.actionUrl && onNavigate) {
      onNavigate(notification.actionUrl);
      setIsOpen(false);
    }
  };

  // Format relative time
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  // Group notifications by date
  const groupedNotifications = notifications.reduce((groups, notification) => {
    const date = new Date(notification.createdAt).toDateString();
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    let label: string;
    if (date === today) {
      label = 'Today';
    } else if (date === yesterday) {
      label = 'Yesterday';
    } else {
      label = date;
    }

    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(notification);
    return groups;
  }, {} as Record<string, Notification[]>);

  return (
    <div className={`relative ${className}`} ref={panelRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" style={{ color: 'var(--cmf-text)' }} />
        {unreadCount > 0 && (
          <span 
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-xs font-bold rounded-full px-1"
            style={{ 
              backgroundColor: 'var(--aurora-pink)',
              color: '#0f172a'
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-2 w-96 max-h-[70vh] rounded-xl shadow-2xl overflow-hidden z-50"
          style={{ 
            backgroundColor: 'var(--cmf-surface)',
            border: '1px solid var(--cmf-border)',
          }}
        >
          {/* Header */}
          <div 
            className="px-4 py-3 flex items-center justify-between"
            style={{ borderBottom: '1px solid var(--cmf-border)' }}
          >
            <div className="flex items-center gap-2">
              <h3 className="font-semibold" style={{ color: 'var(--cmf-text)' }}>
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span 
                  className="px-2 py-0.5 text-xs rounded-full"
                  style={{ backgroundColor: 'var(--aurora-pink)', color: '#0f172a' }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllRead}
                  title="Mark all as read"
                >
                  <CheckCheck className="w-4 h-4" />
                </Button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-4 h-4" style={{ color: 'var(--cmf-text-muted)' }} />
              </button>
            </div>
          </div>

          {/* Filter */}
          <div 
            className="px-4 py-2 flex gap-1 overflow-x-auto"
            style={{ borderBottom: '1px solid var(--cmf-border)' }}
          >
            <FilterButton
              active={filter === 'all'}
              onClick={() => setFilter('all')}
            >
              All
            </FilterButton>
            <FilterButton
              active={filter === 'mention'}
              onClick={() => setFilter('mention')}
            >
              @Mentions
            </FilterButton>
            <FilterButton
              active={filter === 'comment'}
              onClick={() => setFilter('comment')}
            >
              Comments
            </FilterButton>
            <FilterButton
              active={filter === 'assignment'}
              onClick={() => setFilter('assignment')}
            >
              Assigned
            </FilterButton>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-[50vh]">
            {isLoading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div 
                  className="animate-spin w-6 h-6 border-2 border-current border-t-transparent rounded-full"
                  style={{ color: 'var(--aurora-teal)' }}
                />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <BellOff className="w-12 h-12 mb-3" style={{ color: 'var(--cmf-text-faint)' }} />
                <p style={{ color: 'var(--cmf-text-muted)' }}>No notifications yet</p>
                <p className="text-sm text-center mt-1" style={{ color: 'var(--cmf-text-faint)' }}>
                  You'll see notifications here when someone mentions you or updates your tasks.
                </p>
              </div>
            ) : (
              Object.entries(groupedNotifications).map(([date, items]) => (
                <div key={date}>
                  <div 
                    className="px-4 py-2 text-xs font-medium uppercase tracking-wide sticky top-0"
                    style={{ 
                      backgroundColor: 'var(--cmf-surface-2)',
                      color: 'var(--cmf-text-muted)'
                    }}
                  >
                    {date}
                  </div>
                  {items.map(notification => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={() => handleNotificationClick(notification)}
                      onArchive={() => handleArchive(notification)}
                      formatTime={formatTime}
                    />
                  ))}
                </div>
              ))
            )}

            {/* Load More */}
            {hasMore && notifications.length > 0 && (
              <div className="p-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadNotifications()}
                  disabled={isLoading}
                  isLoading={isLoading}
                  fullWidth
                >
                  Load more
                </Button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div 
            className="px-4 py-2 flex justify-center"
            style={{ borderTop: '1px solid var(--cmf-border)' }}
          >
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Settings className="w-4 h-4" />}
            >
              Notification Settings
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Filter Button Component
const FilterButton: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1 text-sm rounded-full whitespace-nowrap transition-colors ${
      active ? '' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
    }`}
    style={{
      backgroundColor: active ? 'var(--aurora-teal)' : 'transparent',
      color: active ? '#0f172a' : 'var(--cmf-text-muted)',
    }}
  >
    {children}
  </button>
);

// Notification Item Component
const NotificationItem: React.FC<{
  notification: Notification;
  onClick: () => void;
  onArchive: () => void;
  formatTime: (date: string) => string;
}> = ({ notification, onClick, onArchive, formatTime }) => {
  const [showActions, setShowActions] = useState(false);
  const config = notificationConfig[notification.type] || notificationConfig.system;

  return (
    <div
      className={`
        px-4 py-3 flex items-start gap-3 cursor-pointer transition-colors
        hover:bg-gray-50 dark:hover:bg-gray-800/50
        ${!notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}
      `}
      onClick={onClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Icon */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${config.color}20`, color: config.color }}
      >
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p 
            className={`text-sm ${!notification.isRead ? 'font-medium' : ''}`}
            style={{ color: 'var(--cmf-text)' }}
          >
            {notification.title}
          </p>
          <span 
            className="text-xs whitespace-nowrap"
            style={{ color: 'var(--cmf-text-muted)' }}
          >
            {formatTime(notification.createdAt)}
          </span>
        </div>
        {notification.message && (
          <p 
            className="text-sm mt-0.5 line-clamp-2"
            style={{ color: 'var(--cmf-text-muted)' }}
          >
            {notification.message}
          </p>
        )}
        {notification.actorName && (
          <p 
            className="text-xs mt-1"
            style={{ color: 'var(--cmf-text-faint)' }}
          >
            by {notification.actorName}
          </p>
        )}
      </div>

      {/* Unread Indicator */}
      {!notification.isRead && (
        <div 
          className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
          style={{ backgroundColor: 'var(--aurora-pink)' }}
        />
      )}

      {/* Actions */}
      {showActions && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onArchive();
          }}
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 flex-shrink-0"
          title="Archive"
        >
          <Archive className="w-4 h-4" style={{ color: 'var(--cmf-text-muted)' }} />
        </button>
      )}
    </div>
  );
};

// Notification Bell Component (for header integration)
export const NotificationBell: React.FC<{
  currentUser: TeamMember;
  onNavigate?: (url: string) => void;
}> = ({ currentUser, onNavigate }) => {
  return (
    <NotificationCenter
      currentUser={currentUser}
      onNavigate={onNavigate}
    />
  );
};

export default NotificationCenter;
