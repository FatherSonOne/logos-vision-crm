// Real-Time Service - Handles Supabase real-time subscriptions
import { supabase } from './supabaseClient';
import type { RealtimeChannel, REALTIME_SUBSCRIBE_STATES } from '@supabase/supabase-js';

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

export interface RealtimePayload<T = any> {
  eventType: RealtimeEvent;
  new: T;
  old: T;
  table: string;
}

export type RealtimeCallback<T = any> = (payload: RealtimePayload<T>) => void;

export type ConnectionState = 'connected' | 'connecting' | 'disconnected' | 'error';

interface ChannelSubscription {
  channel: RealtimeChannel;
  callbacks: Set<RealtimeCallback>;
  state: ConnectionState;
  retryCount: number;
  retryTimeout?: NodeJS.Timeout;
}

interface RealtimeServiceConfig {
  maxRetries: number;
  retryDelayMs: number;
  connectionTimeout: number;
  enableConnectionPooling: boolean;
}

class RealtimeService {
  private channels: Map<string, ChannelSubscription> = new Map();
  private isDevelopmentMode = false;
  private config: RealtimeServiceConfig = {
    maxRetries: 5,
    retryDelayMs: 1000,
    connectionTimeout: 10000,
    enableConnectionPooling: true
  };
  private connectionStateListeners: Set<(state: ConnectionState) => void> = new Set();

  constructor() {
    // Check if we're in dev mode
    this.isDevelopmentMode = import.meta.env.VITE_DEV_MODE === 'true';

    if (this.isDevelopmentMode) {
      console.log('🔧 Real-time Service: Running in development mode (subscriptions disabled)');
    }
  }

  /**
   * Configure the real-time service
   */
  configure(config: Partial<RealtimeServiceConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Listen to global connection state changes
   */
  onConnectionStateChange(listener: (state: ConnectionState) => void): () => void {
    this.connectionStateListeners.add(listener);
    return () => this.connectionStateListeners.delete(listener);
  }

  /**
   * Notify connection state listeners
   */
  private notifyConnectionStateChange(state: ConnectionState) {
    this.connectionStateListeners.forEach(listener => listener(state));
  }

  /**
   * Subscribe to changes on a specific table with connection pooling
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

    // Check if channel already exists (connection pooling)
    const existingSubscription = this.channels.get(channelName);
    if (existingSubscription && this.config.enableConnectionPooling) {
      console.log(`♻️ Reusing existing channel: ${channelName}`);
      existingSubscription.callbacks.add(callback);

      // Return unsubscribe function that only removes this callback
      return () => {
        existingSubscription.callbacks.delete(callback);

        // If no more callbacks, unsubscribe from channel
        if (existingSubscription.callbacks.size === 0) {
          this.unsubscribe(channelName);
        }
      };
    }

    // Create new subscription
    const subscription: ChannelSubscription = {
      channel: null as any, // Will be set below
      callbacks: new Set([callback]),
      state: 'connecting',
      retryCount: 0
    };

    // Create and configure channel
    const channel = this.createChannel(table, channelName, filter, subscription);
    subscription.channel = channel;

    // Subscribe to channel with error handling
    this.subscribeChannel(channelName, subscription);

    this.channels.set(channelName, subscription);
    this.notifyConnectionStateChange('connecting');

    // Return unsubscribe function
    return () => {
      subscription.callbacks.delete(callback);

      // If no more callbacks, unsubscribe from channel
      if (subscription.callbacks.size === 0) {
        this.unsubscribe(channelName);
      }
    };
  }

  /**
   * Create a real-time channel with event handlers
   */
  private createChannel<T = any>(
    table: string,
    channelName: string,
    filter: { column: string; value: string | number } | undefined,
    subscription: ChannelSubscription
  ): RealtimeChannel {
    let channel = supabase.channel(channelName);

    // Event handler
    const eventHandler = (payload: any) => {
      const eventType = payload.eventType as RealtimeEvent;
      const realtimePayload: RealtimePayload<T> = {
        eventType,
        new: payload.new,
        old: payload.old,
        table
      };

      // Call all registered callbacks
      subscription.callbacks.forEach(callback => {
        try {
          callback(realtimePayload);
        } catch (error) {
          console.error(`❌ Error in callback for ${channelName}:`, error);
        }
      });
    };

    // Configure channel with filter if provided
    if (filter) {
      channel = channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: `${filter.column}=eq.${filter.value}`
        },
        eventHandler
      );
    } else {
      channel = channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table
        },
        eventHandler
      );
    }

    return channel;
  }

  /**
   * Subscribe channel with retry logic
   */
  private subscribeChannel(channelName: string, subscription: ChannelSubscription) {
    subscription.channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`✅ Subscribed to real-time updates: ${channelName}`);
        subscription.state = 'connected';
        subscription.retryCount = 0;
        this.notifyConnectionStateChange('connected');
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`❌ Error subscribing to ${channelName}`);
        subscription.state = 'error';
        this.notifyConnectionStateChange('error');

        // Attempt to reconnect
        this.handleReconnection(channelName, subscription);
      } else if (status === 'TIMED_OUT') {
        console.warn(`⏱️ Subscription timeout for ${channelName}`);
        subscription.state = 'error';
        this.notifyConnectionStateChange('error');

        // Attempt to reconnect
        this.handleReconnection(channelName, subscription);
      } else if (status === 'CLOSED') {
        console.log(`🔌 Channel closed: ${channelName}`);
        subscription.state = 'disconnected';
        this.notifyConnectionStateChange('disconnected');
      }
    });
  }

  /**
   * Handle reconnection logic with exponential backoff
   */
  private handleReconnection(channelName: string, subscription: ChannelSubscription) {
    if (subscription.retryCount >= this.config.maxRetries) {
      console.error(`❌ Max retries reached for ${channelName}`);
      subscription.state = 'error';
      this.notifyConnectionStateChange('error');
      return;
    }

    subscription.retryCount++;

    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    const delay = Math.min(
      this.config.retryDelayMs * Math.pow(2, subscription.retryCount - 1),
      16000
    );

    console.log(
      `🔄 Reconnecting ${channelName} in ${delay}ms (attempt ${subscription.retryCount}/${this.config.maxRetries})`
    );

    // Clear existing timeout
    if (subscription.retryTimeout) {
      clearTimeout(subscription.retryTimeout);
    }

    // Schedule reconnection
    subscription.retryTimeout = setTimeout(() => {
      console.log(`🔄 Attempting to reconnect ${channelName}...`);
      subscription.state = 'connecting';
      this.notifyConnectionStateChange('connecting');

      // Unsubscribe old channel
      supabase.removeChannel(subscription.channel);

      // Create new channel
      const table = channelName.split(':')[0];
      const filterMatch = channelName.match(/:(.+)=(.+)/);
      const filter = filterMatch
        ? { column: filterMatch[1], value: filterMatch[2] }
        : undefined;

      subscription.channel = this.createChannel(table, channelName, filter, subscription);

      // Subscribe to new channel
      this.subscribeChannel(channelName, subscription);
    }, delay);
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
    const subscription = this.channels.get(channelName);
    if (subscription) {
      // Clear retry timeout if exists
      if (subscription.retryTimeout) {
        clearTimeout(subscription.retryTimeout);
      }

      // Remove channel
      supabase.removeChannel(subscription.channel);
      this.channels.delete(channelName);
      console.log(`🔌 Unsubscribed from: ${channelName}`);

      // Update connection state if no more channels
      if (this.channels.size === 0) {
        this.notifyConnectionStateChange('disconnected');
      }
    }
  }

  /**
   * Unsubscribe from all channels
   */
  unsubscribeAll(): void {
    this.channels.forEach((subscription, channelName) => {
      if (subscription.retryTimeout) {
        clearTimeout(subscription.retryTimeout);
      }
      supabase.removeChannel(subscription.channel);
    });
    this.channels.clear();
    console.log('🔌 Unsubscribed from all real-time channels');
    this.notifyConnectionStateChange('disconnected');
  }

  /**
   * Get active subscriptions count
   */
  getActiveSubscriptionsCount(): number {
    return this.channels.size;
  }

  /**
   * Get connection state for a specific channel
   */
  getChannelState(channelName: string): ConnectionState | null {
    const subscription = this.channels.get(channelName);
    return subscription?.state || null;
  }

  /**
   * Get overall connection health
   */
  getConnectionHealth(): {
    totalChannels: number;
    connectedChannels: number;
    errorChannels: number;
    overallState: ConnectionState;
  } {
    let connectedCount = 0;
    let errorCount = 0;

    this.channels.forEach(subscription => {
      if (subscription.state === 'connected') connectedCount++;
      if (subscription.state === 'error') errorCount++;
    });

    const totalChannels = this.channels.size;

    let overallState: ConnectionState = 'disconnected';
    if (totalChannels === 0) {
      overallState = 'disconnected';
    } else if (errorCount > 0) {
      overallState = 'error';
    } else if (connectedCount === totalChannels) {
      overallState = 'connected';
    } else {
      overallState = 'connecting';
    }

    return {
      totalChannels,
      connectedChannels: connectedCount,
      errorChannels: errorCount,
      overallState
    };
  }

  /**
   * Manually reconnect a specific channel
   */
  reconnectChannel(channelName: string): void {
    const subscription = this.channels.get(channelName);
    if (!subscription) {
      console.warn(`⚠️ Cannot reconnect - channel not found: ${channelName}`);
      return;
    }

    // Reset retry count for manual reconnection
    subscription.retryCount = 0;

    // Trigger reconnection
    this.handleReconnection(channelName, subscription);
  }

  /**
   * Manually reconnect all channels
   */
  reconnectAll(): void {
    console.log('🔄 Reconnecting all channels...');
    this.channels.forEach((_, channelName) => {
      this.reconnectChannel(channelName);
    });
  }
}

// Export singleton instance
export const realtimeService = new RealtimeService();
