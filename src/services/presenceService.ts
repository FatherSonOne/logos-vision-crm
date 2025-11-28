// Presence Service - Track online users and their activity
import { supabase } from './supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface PresenceState {
  user_id: string;
  user_name: string;
  user_email: string;
  user_avatar?: string;
  user_role?: string;
  current_page?: string;
  current_entity_type?: string; // 'project', 'case', 'document', etc.
  current_entity_id?: string;
  last_active: string;
}

export type PresenceCallback = (presences: PresenceState[]) => void;

class PresenceService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private currentUser: PresenceState | null = null;

  /**
   * Join a presence channel (e.g., for a specific project or global)
   */
  async joinPresence(
    channelName: string,
    initialState: Partial<PresenceState>,
    onPresenceChange: PresenceCallback
  ): Promise<() => void> {
    // Get current user info
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user for presence');
      return () => {};
    }

    // Build initial presence state
    this.currentUser = {
      user_id: user.id,
      user_name: user.user_metadata?.name || user.email || 'Unknown',
      user_email: user.email || '',
      user_avatar: user.user_metadata?.avatar_url,
      user_role: user.user_metadata?.role,
      last_active: new Date().toISOString(),
      ...initialState,
    };

    // Create or get channel
    const channel = supabase.channel(`presence:${channelName}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    // Track presence
    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const presences = this.flattenPresenceState(presenceState);
        onPresenceChange(presences);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        const presenceState = channel.presenceState();
        const presences = this.flattenPresenceState(presenceState);
        onPresenceChange(presences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        const presenceState = channel.presenceState();
        const presences = this.flattenPresenceState(presenceState);
        onPresenceChange(presences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Send initial presence
          await channel.track(this.currentUser!);
          console.log(`✅ Joined presence channel: ${channelName}`);
        }
      });

    this.channels.set(channelName, channel);

    // Return unsubscribe function
    return () => this.leavePresence(channelName);
  }

  /**
   * Update current user's presence state
   */
  async updatePresence(
    channelName: string,
    updates: Partial<PresenceState>
  ): Promise<void> {
    const channel = this.channels.get(channelName);
    if (!channel || !this.currentUser) {
      console.warn(`No active presence channel: ${channelName}`);
      return;
    }

    this.currentUser = {
      ...this.currentUser,
      ...updates,
      last_active: new Date().toISOString(),
    };

    await channel.track(this.currentUser);
  }

  /**
   * Leave a presence channel
   */
  async leavePresence(channelName: string): Promise<void> {
    const channel = this.channels.get(channelName);
    if (channel) {
      await channel.untrack();
      await supabase.removeChannel(channel);
      this.channels.delete(channelName);
      console.log(`🔌 Left presence channel: ${channelName}`);
    }
  }

  /**
   * Leave all presence channels
   */
  async leaveAll(): Promise<void> {
    const promises = Array.from(this.channels.keys()).map((channelName) =>
      this.leavePresence(channelName)
    );
    await Promise.all(promises);
  }

  /**
   * Get current presences for a channel
   */
  getPresences(channelName: string): PresenceState[] {
    const channel = this.channels.get(channelName);
    if (!channel) return [];

    const presenceState = channel.presenceState();
    return this.flattenPresenceState(presenceState);
  }

  /**
   * Helper to flatten Supabase presence state
   */
  private flattenPresenceState(presenceState: any): PresenceState[] {
    const presences: PresenceState[] = [];
    Object.values(presenceState).forEach((presenceArray: any) => {
      presenceArray.forEach((presence: any) => {
        presences.push(presence as PresenceState);
      });
    });
    return presences;
  }

  /**
   * Get active channels
   */
  getActiveChannels(): string[] {
    return Array.from(this.channels.keys());
  }
}

// Export singleton instance
export const presenceService = new PresenceService();
