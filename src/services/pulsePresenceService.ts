// src/services/pulsePresenceService.ts
// Handles real-time presence and notification sync between Logos and Pulse

import { supabase } from './supabaseClient';

// ============================================
// TYPES
// ============================================

export type UserStatus = 'online' | 'away' | 'busy' | 'offline';

export interface UserPresence {
  id: string;
  userId: string;
  userType: 'team_member' | 'client' | 'volunteer';
  userName?: string;
  userAvatar?: string;
  status: UserStatus;
  statusMessage?: string;
  statusEmoji?: string;
  lastActiveAt: string;
  lastSeenPage?: string;
  pulseUserId?: string;
  pulseStatus?: UserStatus;
  pulseLastActive?: string;
  updatedAt: string;
}

export interface CrossAppNotification {
  id: string;
  targetApp: 'logos' | 'pulse';
  targetUserId: string;
  notificationType: NotificationType;
  title: string;
  body?: string;
  icon?: string;
  url?: string;
  sourceApp: 'logos' | 'pulse';
  sourceEntityType?: string;
  sourceEntityId?: string;
  status: NotificationStatus;
  priority: NotificationPriority;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  createdAt: string;
  expiresAt: string;
}

export type NotificationType =
  | 'message'
  | 'mention'
  | 'meeting_reminder'
  | 'meeting_started'
  | 'task_assigned'
  | 'task_due'
  | 'case_update'
  | 'document_shared'
  | 'project_update'
  | 'activity_logged';

export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface PresenceUpdateEvent {
  userId: string;
  status: UserStatus;
  statusMessage?: string;
  timestamp: string;
}

// ============================================
// PULSE API CONFIGURATION
// ============================================

const PULSE_SUPABASE_URL = 'https://ucaeuszgoihoyrvhewxk.supabase.co';
const PULSE_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjYWV1c3pnb2lob3lydmhld3hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMjg5ODYsImV4cCI6MjA4MDgwNDk4Nn0.0VGjpsPBYjyk6QTG5rAQX4_NcpfBTyR85ofE5jiHTKo';

// ============================================
// SERVICE CLASS
// ============================================

class PulsePresenceService {
  private currentUserId: string | null = null;
  private presenceUpdateInterval: NodeJS.Timeout | null = null;
  private listeners: ((event: string, data: any) => void)[] = [];
  private localPresence: Map<string, UserPresence> = new Map();
  private websocket: WebSocket | null = null;

  // ==========================================
  // INITIALIZATION
  // ==========================================

  initialize(userId: string): void {
    this.currentUserId = userId;
    this.startPresenceUpdates();
    this.connectToRealtimePresence();
  }

  cleanup(): void {
    this.stopPresenceUpdates();
    this.disconnectFromRealtimePresence();
    this.currentUserId = null;
  }

  // ==========================================
  // EVENT LISTENERS
  // ==========================================

  on(callback: (event: string, data: any) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private emit(event: string, data: any): void {
    this.listeners.forEach(callback => callback(event, data));
  }

  // ==========================================
  // PRESENCE MANAGEMENT
  // ==========================================

  async updatePresence(
    status: UserStatus,
    options?: { statusMessage?: string; statusEmoji?: string; currentPage?: string }
  ): Promise<void> {
    if (!this.currentUserId) return;

    const now = new Date().toISOString();

    const { error } = await supabase
      .from('user_presence')
      .upsert({
        user_id: this.currentUserId,
        user_type: 'team_member',
        status,
        status_message: options?.statusMessage,
        status_emoji: options?.statusEmoji,
        last_active_at: now,
        last_seen_page: options?.currentPage,
        updated_at: now,
      }, {
        onConflict: 'user_id,user_type',
      });

    if (error) {
      console.error('Failed to update presence:', error);
      return;
    }

    // Sync to Pulse
    await this.syncPresenceToPulse(status, options?.statusMessage);

    this.emit('presence:updated', { userId: this.currentUserId, status });
  }

  async getPresence(userId: string): Promise<UserPresence | null> {
    const { data, error } = await supabase
      .from('user_presence')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;

    return this.mapPresenceRow(data);
  }

  async getAllPresences(): Promise<UserPresence[]> {
    const { data, error } = await supabase
      .from('user_presence')
      .select('*')
      .order('last_active_at', { ascending: false });

    if (error) {
      console.error('Failed to get presences:', error);
      return [];
    }

    return (data || []).map(this.mapPresenceRow);
  }

  async getOnlineUsers(): Promise<UserPresence[]> {
    const { data, error } = await supabase
      .from('user_presence')
      .select('*')
      .in('status', ['online', 'away', 'busy'])
      .order('last_active_at', { ascending: false });

    if (error) return [];
    return (data || []).map(this.mapPresenceRow);
  }

  private mapPresenceRow(row: any): UserPresence {
    return {
      id: row.id,
      userId: row.user_id,
      userType: row.user_type,
      userName: row.user_name,
      userAvatar: row.user_avatar,
      status: row.status,
      statusMessage: row.status_message,
      statusEmoji: row.status_emoji,
      lastActiveAt: row.last_active_at,
      lastSeenPage: row.last_seen_page,
      pulseUserId: row.pulse_user_id,
      pulseStatus: row.pulse_status,
      pulseLastActive: row.pulse_last_active,
      updatedAt: row.updated_at,
    };
  }

  // ==========================================
  // AUTOMATIC PRESENCE UPDATES
  // ==========================================

  private startPresenceUpdates(): void {
    // Update presence every 30 seconds
    this.presenceUpdateInterval = setInterval(() => {
      if (this.currentUserId) {
        this.updatePresence('online');
      }
    }, 30000);

    // Set initial status
    this.updatePresence('online');

    // Handle visibility change
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }

    // Handle before unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', this.handleBeforeUnload);
    }
  }

  private stopPresenceUpdates(): void {
    if (this.presenceUpdateInterval) {
      clearInterval(this.presenceUpdateInterval);
      this.presenceUpdateInterval = null;
    }

    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this.handleBeforeUnload);
    }
  }

  private handleVisibilityChange = (): void => {
    if (document.hidden) {
      this.updatePresence('away');
    } else {
      this.updatePresence('online');
    }
  };

  private handleBeforeUnload = (): void => {
    // Use sendBeacon for reliable offline status update
    if (this.currentUserId && navigator.sendBeacon) {
      const data = JSON.stringify({
        user_id: this.currentUserId,
        status: 'offline',
        updated_at: new Date().toISOString(),
      });
      navigator.sendBeacon(`${PULSE_SUPABASE_URL}/rest/v1/user_presence`, data);
    }
  };

  // ==========================================
  // PULSE SYNC
  // ==========================================

  private async syncPresenceToPulse(status: UserStatus, statusMessage?: string): Promise<void> {
    if (!this.currentUserId) return;

    try {
      await fetch(`${PULSE_SUPABASE_URL}/rest/v1/user_presence?on_conflict=user_id`, {
        method: 'POST',
        headers: {
          'apikey': PULSE_SUPABASE_KEY,
          'Authorization': `Bearer ${PULSE_SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          user_id: this.currentUserId,
          status,
          status_message: statusMessage,
          last_active_at: new Date().toISOString(),
          source: 'logos',
        }),
      });
    } catch (error) {
      console.error('Failed to sync presence to Pulse:', error);
    }
  }

  async syncPresenceFromPulse(): Promise<void> {
    try {
      const response = await fetch(`${PULSE_SUPABASE_URL}/rest/v1/user_presence?source=eq.pulse`, {
        headers: {
          'apikey': PULSE_SUPABASE_KEY,
          'Authorization': `Bearer ${PULSE_SUPABASE_KEY}`,
        },
      });

      if (!response.ok) return;

      const pulsePresences = await response.json();

      for (const pp of pulsePresences) {
        await supabase
          .from('user_presence')
          .upsert({
            user_id: pp.user_id,
            pulse_user_id: pp.user_id,
            pulse_status: pp.status,
            pulse_last_active: pp.last_active_at,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,user_type',
          });
      }
    } catch (error) {
      console.error('Failed to sync presence from Pulse:', error);
    }
  }

  // ==========================================
  // REAL-TIME PRESENCE (WebSocket)
  // ==========================================

  private connectToRealtimePresence(): void {
    // Subscribe to presence changes via Supabase Realtime
    const channel = supabase
      .channel('presence-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_presence' },
        (payload) => {
          const presence = this.mapPresenceRow(payload.new);
          this.localPresence.set(presence.userId, presence);
          this.emit('presence:changed', presence);
        }
      )
      .subscribe();

    // Also try WebSocket to Pulse
    this.connectPulseWebSocket();
  }

  private disconnectFromRealtimePresence(): void {
    supabase.removeAllChannels();
    this.disconnectPulseWebSocket();
  }

  private connectPulseWebSocket(): void {
    // Note: This would connect to Pulse's realtime presence system
    // Implementation depends on Pulse's WebSocket API
    console.log('🔗 Connecting to Pulse presence WebSocket...');
  }

  private disconnectPulseWebSocket(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }

  // ==========================================
  // NOTIFICATIONS
  // ==========================================

  async sendNotification(notification: {
    targetApp: 'logos' | 'pulse';
    targetUserId: string;
    type: NotificationType;
    title: string;
    body?: string;
    icon?: string;
    url?: string;
    sourceEntityType?: string;
    sourceEntityId?: string;
    priority?: NotificationPriority;
  }): Promise<string> {
    const { data, error } = await supabase
      .from('notification_queue')
      .insert({
        target_app: notification.targetApp,
        target_user_id: notification.targetUserId,
        notification_type: notification.type,
        title: notification.title,
        body: notification.body,
        icon: notification.icon,
        url: notification.url,
        source_app: 'logos',
        source_entity_type: notification.sourceEntityType,
        source_entity_id: notification.sourceEntityId,
        status: 'pending',
        priority: notification.priority || 'normal',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // If sending to Pulse, push immediately
    if (notification.targetApp === 'pulse') {
      await this.pushNotificationToPulse(data);
    }

    return data.id;
  }

  private async pushNotificationToPulse(notification: any): Promise<void> {
    try {
      await fetch(`${PULSE_SUPABASE_URL}/rest/v1/notifications`, {
        method: 'POST',
        headers: {
          'apikey': PULSE_SUPABASE_KEY,
          'Authorization': `Bearer ${PULSE_SUPABASE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: notification.target_user_id,
          type: notification.notification_type,
          title: notification.title,
          body: notification.body,
          icon: notification.icon,
          url: notification.url,
          source: 'logos',
          source_entity_type: notification.source_entity_type,
          source_entity_id: notification.source_entity_id,
          created_at: notification.created_at,
        }),
      });

      // Update status
      await supabase
        .from('notification_queue')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', notification.id);

    } catch (error) {
      console.error('Failed to push notification to Pulse:', error);

      await supabase
        .from('notification_queue')
        .update({ status: 'failed' })
        .eq('id', notification.id);
    }
  }

  async getPendingNotifications(userId: string): Promise<CrossAppNotification[]> {
    const { data, error } = await supabase
      .from('notification_queue')
      .select('*')
      .eq('target_user_id', userId)
      .eq('target_app', 'logos')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) return [];

    return (data || []).map(this.mapNotificationRow);
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    await supabase
      .from('notification_queue')
      .update({
        status: 'read',
        read_at: new Date().toISOString(),
      })
      .eq('id', notificationId);
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await supabase
      .from('notification_queue')
      .update({
        status: 'read',
        read_at: new Date().toISOString(),
      })
      .eq('target_user_id', userId)
      .eq('target_app', 'logos')
      .eq('status', 'pending');
  }

  private mapNotificationRow(row: any): CrossAppNotification {
    return {
      id: row.id,
      targetApp: row.target_app,
      targetUserId: row.target_user_id,
      notificationType: row.notification_type,
      title: row.title,
      body: row.body,
      icon: row.icon,
      url: row.url,
      sourceApp: row.source_app,
      sourceEntityType: row.source_entity_type,
      sourceEntityId: row.source_entity_id,
      status: row.status,
      priority: row.priority,
      sentAt: row.sent_at,
      deliveredAt: row.delivered_at,
      readAt: row.read_at,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
    };
  }

  // ==========================================
  // SYNC FROM PULSE NOTIFICATIONS
  // ==========================================

  async syncNotificationsFromPulse(): Promise<number> {
    try {
      const response = await fetch(
        `${PULSE_SUPABASE_URL}/rest/v1/notifications?target_app=eq.logos&status=eq.pending`,
        {
          headers: {
            'apikey': PULSE_SUPABASE_KEY,
            'Authorization': `Bearer ${PULSE_SUPABASE_KEY}`,
          },
        }
      );

      if (!response.ok) return 0;

      const pulseNotifications = await response.json();
      let synced = 0;

      for (const pn of pulseNotifications) {
        const { error } = await supabase
          .from('notification_queue')
          .insert({
            target_app: 'logos',
            target_user_id: pn.user_id,
            notification_type: pn.type,
            title: pn.title,
            body: pn.body,
            icon: pn.icon,
            url: pn.url,
            source_app: 'pulse',
            source_entity_type: pn.source_entity_type,
            source_entity_id: pn.source_entity_id,
            status: 'delivered',
            priority: pn.priority || 'normal',
            created_at: pn.created_at,
            delivered_at: new Date().toISOString(),
          });

        if (!error) synced++;
      }

      return synced;
    } catch (error) {
      console.error('Failed to sync notifications from Pulse:', error);
      return 0;
    }
  }

  // ==========================================
  // HELPER NOTIFICATIONS
  // ==========================================

  async notifyMention(
    mentionedUserId: string,
    mentionedBy: string,
    context: string,
    url: string
  ): Promise<void> {
    await this.sendNotification({
      targetApp: 'pulse',
      targetUserId: mentionedUserId,
      type: 'mention',
      title: `${mentionedBy} mentioned you`,
      body: context,
      url,
      priority: 'high',
    });
  }

  async notifyMeetingReminder(
    userId: string,
    meetingTitle: string,
    startTime: string,
    meetingUrl: string
  ): Promise<void> {
    await this.sendNotification({
      targetApp: 'pulse',
      targetUserId: userId,
      type: 'meeting_reminder',
      title: 'Meeting starting soon',
      body: `${meetingTitle} starts at ${new Date(startTime).toLocaleTimeString()}`,
      url: meetingUrl,
      priority: 'high',
    });
  }

  async notifyTaskAssigned(
    userId: string,
    taskTitle: string,
    assignedBy: string,
    taskUrl: string
  ): Promise<void> {
    await this.sendNotification({
      targetApp: 'pulse',
      targetUserId: userId,
      type: 'task_assigned',
      title: 'New task assigned',
      body: `${assignedBy} assigned you: ${taskTitle}`,
      url: taskUrl,
      priority: 'normal',
    });
  }

  async notifyDocumentShared(
    userId: string,
    documentName: string,
    sharedBy: string,
    documentUrl: string
  ): Promise<void> {
    await this.sendNotification({
      targetApp: 'pulse',
      targetUserId: userId,
      type: 'document_shared',
      title: 'Document shared with you',
      body: `${sharedBy} shared: ${documentName}`,
      url: documentUrl,
      priority: 'normal',
    });
  }

  // ==========================================
  // UTILITIES
  // ==========================================

  getStatusColor(status: UserStatus): string {
    const colors: Record<UserStatus, string> = {
      online: 'bg-green-500',
      away: 'bg-amber-500',
      busy: 'bg-red-500',
      offline: 'bg-gray-400',
    };
    return colors[status];
  }

  getStatusLabel(status: UserStatus): string {
    const labels: Record<UserStatus, string> = {
      online: 'Online',
      away: 'Away',
      busy: 'Do Not Disturb',
      offline: 'Offline',
    };
    return labels[status];
  }

  isOnline(presence: UserPresence): boolean {
    return presence.status === 'online' || presence.status === 'away' || presence.status === 'busy';
  }

  getLastActiveText(lastActiveAt: string): string {
    const now = new Date();
    const lastActive = new Date(lastActiveAt);
    const diffMinutes = Math.floor((now.getTime() - lastActive.getTime()) / 60000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  }
}

// Export singleton instance
export const pulsePresenceService = new PulsePresenceService();

export default pulsePresenceService;
