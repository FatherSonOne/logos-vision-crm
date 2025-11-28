// useNotifications Hook - Easy notification management in React components
import { useState, useEffect, useCallback } from 'react';
import {
  notificationService,
  type Notification,
  type NotificationPreferences,
  type CreateNotificationParams,
} from '../services/notificationService';

/**
 * Hook for managing user notifications
 */
export function useNotifications(options?: {
  limit?: number;
  unreadOnly?: boolean;
  autoRefresh?: boolean;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    const { data, count } = await notificationService.getNotifications({
      limit: options?.limit || 20,
      unreadOnly: options?.unreadOnly,
    });
    setNotifications(data);
    setTotalCount(count);
    setLoading(false);
  }, [options?.limit, options?.unreadOnly]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    const count = await notificationService.getUnreadCount();
    setUnreadCount(count);
  }, []);

  // Mark as read
  const markAsRead = useCallback(async (notificationId: string) => {
    const success = await notificationService.markAsRead(notificationId);
    if (success) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    return success;
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    const count = await notificationService.markAllAsRead();
    if (count > 0) {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    }
    return count;
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    const success = await notificationService.deleteNotification(notificationId);
    if (success) {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      setTotalCount((prev) => prev - 1);
    }
    return success;
  }, []);

  // Create notification
  const createNotification = useCallback(async (params: CreateNotificationParams) => {
    return await notificationService.createNotification(params);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (options?.autoRefresh !== false) {
      const unsubscribeNew = notificationService.subscribeToNotifications((notification) => {
        setNotifications((prev) => [notification, ...prev]);
        if (!notification.is_read) {
          setUnreadCount((prev) => prev + 1);
        }
        setTotalCount((prev) => prev + 1);
      });

      const unsubscribeUpdate = notificationService.subscribeToNotificationUpdates(
        (notification) => {
          setNotifications((prev) =>
            prev.map((n) => (n.id === notification.id ? notification : n))
          );
        }
      );

      return () => {
        unsubscribeNew();
        unsubscribeUpdate();
      };
    }
  }, [options?.autoRefresh]);

  return {
    notifications,
    unreadCount,
    totalCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    refetch: fetchNotifications,
  };
}

/**
 * Hook for managing notification preferences
 */
export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch preferences
  const fetchPreferences = useCallback(async () => {
    setLoading(true);
    const prefs = await notificationService.getPreferences();
    setPreferences(prefs);
    setLoading(false);
  }, []);

  // Update preferences
  const updatePreferences = useCallback(
    async (updates: Partial<NotificationPreferences>) => {
      const success = await notificationService.updatePreferences(updates);
      if (success && preferences) {
        setPreferences({ ...preferences, ...updates });
      }
      return success;
    },
    [preferences]
  );

  // Initial fetch
  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    preferences,
    loading,
    updatePreferences,
    refetch: fetchPreferences,
  };
}

/**
 * Simple hook to just get the unread count
 */
export function useUnreadNotificationCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      const unreadCount = await notificationService.getUnreadCount();
      setCount(unreadCount);
    };

    fetchCount();

    // Subscribe to updates
    const unsubscribe = notificationService.subscribeToNotifications((notification) => {
      if (!notification.is_read) {
        setCount((prev) => prev + 1);
      }
    });

    return unsubscribe;
  }, []);

  return count;
}
