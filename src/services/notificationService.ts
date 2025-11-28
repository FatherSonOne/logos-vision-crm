// Notification Service - Handles all notification operations
import { supabase } from './supabaseClient';
import { realtimeService } from './realtimeService';

export type NotificationType =
  | 'task_assigned'
  | 'task_completed'
  | 'task_due_soon'
  | 'case_assigned'
  | 'case_updated'
  | 'case_comment'
  | 'project_updated'
  | 'mention'
  | 'meeting_scheduled'
  | 'document_uploaded'
  | 'activity_shared'
  | 'system';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  action_url?: string;
  action_label?: string;
  related_entity_type?: string;
  related_entity_id?: string;
  actor_id?: string;
  actor_name?: string;
  actor_avatar_url?: string;
  is_read: boolean;
  read_at?: string;
  priority: NotificationPriority;
  metadata: Record<string, any>;
  created_at: string;
  expires_at?: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  type_preferences: Record<NotificationType, boolean>;
  quiet_hours_enabled: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  quiet_hours_timezone: string;
  daily_digest_enabled: boolean;
  daily_digest_time: string;
  weekly_digest_enabled: boolean;
  weekly_digest_day: number;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationParams {
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  related_entity_type?: string;
  related_entity_id?: string;
  actor_id?: string;
  priority?: NotificationPriority;
  action_url?: string;
  action_label?: string;
  expires_at?: string;
}

class NotificationService {
  /**
   * Get all notifications for the current user
   */
  async getNotifications(options?: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
  }): Promise<{ data: Notification[]; count: number }> {
    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (options?.unreadOnly) {
      query = query.eq('is_read', false);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      return { data: [], count: 0 };
    }

    return { data: data || [], count: count || 0 };
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    const { data, error } = await supabase.rpc('get_unread_notification_count');

    if (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }

    return data || 0;
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    const { error } = await supabase.rpc('mark_notification_read', {
      p_notification_id: notificationId,
    });

    if (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }

    return true;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<number> {
    const { data, error } = await supabase.rpc('mark_all_notifications_read');

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return 0;
    }

    return data || 0;
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('Error deleting notification:', error);
      return false;
    }

    return true;
  }

  /**
   * Create a notification (requires proper permissions)
   */
  async createNotification(params: CreateNotificationParams): Promise<string | null> {
    const { data, error } = await supabase.rpc('create_notification', {
      p_user_id: params.user_id,
      p_type: params.type,
      p_title: params.title,
      p_message: params.message,
      p_related_entity_type: params.related_entity_type,
      p_related_entity_id: params.related_entity_id,
      p_actor_id: params.actor_id,
      p_priority: params.priority || 'normal',
      p_action_url: params.action_url,
      p_action_label: params.action_label,
      p_expires_at: params.expires_at,
    });

    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }

    return data;
  }

  /**
   * Get notification preferences for current user
   */
  async getPreferences(): Promise<NotificationPreferences | null> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .single();

    if (error) {
      // If no preferences exist, create default ones
      if (error.code === 'PGRST116') {
        const { data: user } = await supabase.auth.getUser();
        if (user.user) {
          const { data: newPrefs } = await supabase
            .from('notification_preferences')
            .insert({ user_id: user.user.id })
            .select()
            .single();
          return newPrefs;
        }
      }
      console.error('Error fetching preferences:', error);
      return null;
    }

    return data;
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(
    preferences: Partial<NotificationPreferences>
  ): Promise<boolean> {
    const { error } = await supabase
      .from('notification_preferences')
      .update(preferences)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id || '');

    if (error) {
      console.error('Error updating preferences:', error);
      return false;
    }

    return true;
  }

  /**
   * Subscribe to new notifications for current user
   */
  subscribeToNotifications(
    callback: (notification: Notification) => void
  ): () => void {
    return realtimeService.subscribeToInserts<Notification>('notifications', (record) => {
      // Only process if it's for the current user
      callback(record);
    });
  }

  /**
   * Subscribe to notification updates (e.g., mark as read)
   */
  subscribeToNotificationUpdates(
    callback: (notification: Notification) => void
  ): () => void {
    return realtimeService.subscribeToUpdates<Notification>(
      'notifications',
      (newRecord) => {
        callback(newRecord);
      }
    );
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
