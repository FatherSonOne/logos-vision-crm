// Real-Time Service - Handles Supabase real-time subscriptions
import { supabase } from './supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

export interface RealtimePayload<T = any> {
  eventType: RealtimeEvent;
  new: T;
  old: T;
  table: string;
}

export type RealtimeCallback<T = any> = (payload: RealtimePayload<T>) => void;

class RealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private isDevelopmentMode = false;

  constructor() {
    // Check if we're in dev mode
    this.isDevelopmentMode = import.meta.env.VITE_DEV_MODE === 'true';

    if (this.isDevelopmentMode) {
      console.log('🔧 Real-time Service: Running in development mode (subscriptions disabled)');
    }
  }

  /**
   * Subscribe to changes on a specific table
   */
  subscribe<T = any>(
    table: string,
    callback: RealtimeCallback<T>,
    filter?: { column: string; value: string | number }
  ): () => void {
    // Skip real-time in dev mode
    if (this.isDevelopmentMode) {
      console.log(`🔧 Skipping real-time subscription for table: ${table} (dev mode)`);
      return () => {}; // Return no-op unsubscribe
    }

    const channelName = filter
      ? `${table}:${filter.column}=${filter.value}`
      : table;

    // Remove existing channel if it exists
    if (this.channels.has(channelName)) {
      this.unsubscribe(channelName);
    }

    // Create channel
    let channel = supabase.channel(channelName);

    // Add filter if provided
    if (filter) {
      channel = channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: `${filter.column}=eq.${filter.value}`
        },
        (payload: any) => {
          const eventType = payload.eventType as RealtimeEvent;
          callback({
            eventType,
            new: payload.new,
            old: payload.old,
            table
          });
        }
      );
    } else {
      channel = channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table
        },
        (payload: any) => {
          const eventType = payload.eventType as RealtimeEvent;
          callback({
            eventType,
            new: payload.new,
            old: payload.old,
            table
          });
        }
      );
    }

    // Subscribe to channel
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`✅ Subscribed to real-time updates: ${channelName}`);
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`❌ Error subscribing to ${channelName}`);
      }
    });

    this.channels.set(channelName, channel);

    // Return unsubscribe function
    return () => this.unsubscribe(channelName);
  }

  /**
   * Subscribe to INSERT events only
   */
  subscribeToInserts<T = any>(
    table: string,
    callback: (record: T) => void
  ): () => void {
    return this.subscribe<T>(table, (payload) => {
      if (payload.eventType === 'INSERT') {
        callback(payload.new);
      }
    });
  }

  /**
   * Subscribe to UPDATE events only
   */
  subscribeToUpdates<T = any>(
    table: string,
    callback: (record: T, oldRecord: T) => void
  ): () => void {
    return this.subscribe<T>(table, (payload) => {
      if (payload.eventType === 'UPDATE') {
        callback(payload.new, payload.old);
      }
    });
  }

  /**
   * Subscribe to DELETE events only
   */
  subscribeToDeletes<T = any>(
    table: string,
    callback: (oldRecord: T) => void
  ): () => void {
    return this.subscribe<T>(table, (payload) => {
      if (payload.eventType === 'DELETE') {
        callback(payload.old);
      }
    });
  }

  /**
   * Unsubscribe from a channel
   */
  unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
      console.log(`🔌 Unsubscribed from: ${channelName}`);
    }
  }

  /**
   * Unsubscribe from all channels
   */
  unsubscribeAll(): void {
    this.channels.forEach((_, channelName) => {
      this.unsubscribe(channelName);
    });
    console.log('🔌 Unsubscribed from all real-time channels');
  }

  /**
   * Get active subscriptions count
   */
  getActiveSubscriptionsCount(): number {
    return this.channels.size;
  }
}

// Export singleton instance
export const realtimeService = new RealtimeService();
