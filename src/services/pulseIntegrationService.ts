// src/services/pulseIntegrationService.ts
// Comprehensive Pulse Integration Service for Logos Vision CRM
// Handles bidirectional sync between Logos Vision and Pulse Communication Platform

import { syncAll } from './logosSync';
import { syncPulseToLogosAll } from './pulseToLogosSync';

// Pulse Supabase configuration - loaded from environment variables
const PULSE_SUPABASE_URL = import.meta.env.VITE_PULSE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const PULSE_SUPABASE_KEY = import.meta.env.VITE_PULSE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

// Integration configuration
export interface PulseIntegrationConfig {
  isEnabled: boolean;
  syncDirection: 'logos_to_pulse' | 'pulse_to_logos' | 'bidirectional';
  syncFrequency: 'realtime' | 'manual' | '5min' | '15min' | 'hourly';
  autoSyncOnLoad: boolean;
  conflictResolution: 'logos_wins' | 'pulse_wins' | 'newest_wins';
  syncTeamMembers: boolean;
  syncProjects: boolean;
  syncClients: boolean;
  syncActivities: boolean;
  syncMeetings: boolean;
  syncDocuments: boolean;
}

// Sync log entry
export interface SyncLogEntry {
  id: string;
  timestamp: string;
  direction: 'logos_to_pulse' | 'pulse_to_logos' | 'bidirectional';
  status: 'success' | 'partial' | 'failed';
  itemsSynced: number;
  itemsFailed: number;
  duration: number; // milliseconds
  details?: string;
  error?: string;
}

// Sync status
export interface SyncStatus {
  isConnected: boolean;
  lastSyncTime: string | null;
  nextScheduledSync: string | null;
  isSyncing: boolean;
  syncProgress: number; // 0-100
  currentOperation: string;
  recentLogs: SyncLogEntry[];
  statistics: {
    totalSyncs: number;
    successfulSyncs: number;
    failedSyncs: number;
    itemsSynced: number;
  };
}

// Pulse message from unified inbox
export interface PulseMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  source: 'pulse' | 'slack' | 'email' | 'sms';
  isRead: boolean;
  attachments?: { name: string; url: string; type: string }[];
}

// Pulse channel/room
export interface PulseChannel {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  unreadCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
  linkedProjectId?: string;
  linkedClientId?: string;
}

// Pulse meeting
export interface PulseMeeting {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  attendees: string[];
  roomUrl: string;
  recordingUrl?: string;
  notes?: string;
  linkedProjectId?: string;
  linkedActivityId?: string;
}

// Default configuration
const DEFAULT_CONFIG: PulseIntegrationConfig = {
  isEnabled: true,
  syncDirection: 'bidirectional',
  syncFrequency: 'manual',
  autoSyncOnLoad: true,
  conflictResolution: 'newest_wins',
  syncTeamMembers: true,
  syncProjects: true,
  syncClients: true,
  syncActivities: true,
  syncMeetings: true,
  syncDocuments: false,
};

class PulseIntegrationService {
  private config: PulseIntegrationConfig;
  private syncStatus: SyncStatus;
  private syncLogs: SyncLogEntry[] = [];
  private syncInterval: NodeJS.Timeout | null = null;
  private listeners: ((status: SyncStatus) => void)[] = [];

  constructor() {
    // Load config from localStorage or use defaults
    const savedConfig = localStorage.getItem('pulseIntegrationConfig');
    this.config = savedConfig ? JSON.parse(savedConfig) : DEFAULT_CONFIG;

    // Load sync logs from localStorage
    const savedLogs = localStorage.getItem('pulseSyncLogs');
    this.syncLogs = savedLogs ? JSON.parse(savedLogs) : [];

    this.syncStatus = {
      isConnected: false,
      lastSyncTime: localStorage.getItem('pulseLastSyncTime'),
      nextScheduledSync: null,
      isSyncing: false,
      syncProgress: 0,
      currentOperation: '',
      recentLogs: this.syncLogs.slice(0, 10),
      statistics: this.calculateStatistics(),
    };

    // Check connection on init
    this.checkConnection();
  }

  // Get current configuration
  getConfig(): PulseIntegrationConfig {
    return { ...this.config };
  }

  // Update configuration
  setConfig(newConfig: Partial<PulseIntegrationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    localStorage.setItem('pulseIntegrationConfig', JSON.stringify(this.config));

    // Restart sync interval if frequency changed
    if (newConfig.syncFrequency) {
      this.setupSyncInterval();
    }
  }

  // Get current sync status
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  // Subscribe to status changes
  onStatusChange(callback: (status: SyncStatus) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  // Notify listeners of status change
  private notifyListeners(): void {
    const status = this.getSyncStatus();
    this.listeners.forEach(callback => callback(status));
  }

  // Update sync status
  private updateStatus(updates: Partial<SyncStatus>): void {
    this.syncStatus = { ...this.syncStatus, ...updates };
    this.notifyListeners();
  }

  // Check connection to Pulse
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${PULSE_SUPABASE_URL}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          apikey: PULSE_SUPABASE_KEY,
          Authorization: `Bearer ${PULSE_SUPABASE_KEY}`,
        },
      });

      const isConnected = response.ok;
      this.updateStatus({ isConnected });
      return isConnected;
    } catch (error) {
      console.error('Pulse connection check failed:', error);
      this.updateStatus({ isConnected: false });
      return false;
    }
  }

  // Fetch from Pulse REST API
  private async fetchFromPulse<T>(path: string, query: string = ''): Promise<T[]> {
    const url = `${PULSE_SUPABASE_URL}/rest/v1/${path}${query}`;
    const response = await fetch(url, {
      headers: {
        apikey: PULSE_SUPABASE_KEY,
        Authorization: `Bearer ${PULSE_SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Pulse fetch failed for ${path}: ${err}`);
    }

    return response.json();
  }

  // Get recent messages from Pulse
  async getRecentMessages(limit: number = 50): Promise<PulseMessage[]> {
    try {
      // This would fetch from Pulse's chat_messages or unified_inbox table
      // For now, returning empty array as placeholder
      console.log('📨 Fetching recent messages from Pulse...');
      return [];
    } catch (error) {
      console.error('Failed to fetch messages from Pulse:', error);
      return [];
    }
  }

  // Get channels/rooms from Pulse
  async getChannels(): Promise<PulseChannel[]> {
    try {
      console.log('📺 Fetching channels from Pulse...');
      // This would fetch from Pulse's channels/workspaces table
      return [];
    } catch (error) {
      console.error('Failed to fetch channels from Pulse:', error);
      return [];
    }
  }

  // Get upcoming meetings from Pulse
  async getUpcomingMeetings(): Promise<PulseMeeting[]> {
    try {
      console.log('📅 Fetching meetings from Pulse...');
      // This would fetch from Pulse's meetings table
      return [];
    } catch (error) {
      console.error('Failed to fetch meetings from Pulse:', error);
      return [];
    }
  }

  // Calculate sync statistics
  private calculateStatistics() {
    const logs = this.syncLogs;
    return {
      totalSyncs: logs.length,
      successfulSyncs: logs.filter(l => l.status === 'success').length,
      failedSyncs: logs.filter(l => l.status === 'failed').length,
      itemsSynced: logs.reduce((sum, l) => sum + l.itemsSynced, 0),
    };
  }

  // Add a sync log entry
  private addSyncLog(entry: Omit<SyncLogEntry, 'id'>): void {
    const newEntry: SyncLogEntry = {
      ...entry,
      id: `sync-${Date.now()}`,
    };

    this.syncLogs.unshift(newEntry);

    // Keep only last 100 logs
    if (this.syncLogs.length > 100) {
      this.syncLogs = this.syncLogs.slice(0, 100);
    }

    localStorage.setItem('pulseSyncLogs', JSON.stringify(this.syncLogs));

    this.updateStatus({
      recentLogs: this.syncLogs.slice(0, 10),
      statistics: this.calculateStatistics(),
    });
  }

  // Perform full bidirectional sync
  async performFullSync(
    projects: any[],
    clients: any[],
    cases: any[],
    tasks: any[],
    activities: any[]
  ): Promise<SyncLogEntry> {
    if (this.syncStatus.isSyncing) {
      throw new Error('Sync already in progress');
    }

    const startTime = Date.now();

    this.updateStatus({
      isSyncing: true,
      syncProgress: 0,
      currentOperation: 'Initializing sync...',
    });

    let itemsSynced = 0;
    let itemsFailed = 0;
    let error: string | undefined;

    try {
      // Step 1: Logos → Pulse sync (if enabled)
      if (this.config.syncDirection !== 'pulse_to_logos') {
        this.updateStatus({
          syncProgress: 10,
          currentOperation: 'Syncing Logos → Pulse...',
        });

        try {
          const result = await syncAll(projects, clients, cases, tasks, activities);
          itemsSynced += result.synced || 0;
          console.log('✅ Logos → Pulse sync complete', result);
        } catch (e) {
          console.error('❌ Logos → Pulse sync failed', e);
          itemsFailed++;
        }
      }

      this.updateStatus({ syncProgress: 50 });

      // Step 2: Pulse → Logos sync (if enabled)
      if (this.config.syncDirection !== 'logos_to_pulse') {
        this.updateStatus({
          syncProgress: 60,
          currentOperation: 'Syncing Pulse → Logos...',
        });

        try {
          const result = await syncPulseToLogosAll();
          itemsSynced += (result.clientsSynced || 0) + (result.projectsSynced || 0);
          console.log('✅ Pulse → Logos sync complete', result);
        } catch (e) {
          console.error('❌ Pulse → Logos sync failed', e);
          itemsFailed++;
        }
      }

      this.updateStatus({ syncProgress: 90 });

    } catch (e) {
      error = e instanceof Error ? e.message : 'Unknown sync error';
      console.error('❌ Full sync failed:', error);
    }

    const duration = Date.now() - startTime;
    const now = new Date().toISOString();

    localStorage.setItem('pulseLastSyncTime', now);

    const logEntry: Omit<SyncLogEntry, 'id'> = {
      timestamp: now,
      direction: this.config.syncDirection,
      status: error ? 'failed' : itemsFailed > 0 ? 'partial' : 'success',
      itemsSynced,
      itemsFailed,
      duration,
      details: `Synced ${itemsSynced} items in ${duration}ms`,
      error,
    };

    this.addSyncLog(logEntry);

    this.updateStatus({
      isSyncing: false,
      syncProgress: 100,
      currentOperation: error ? 'Sync failed' : 'Sync complete',
      lastSyncTime: now,
    });

    return { ...logEntry, id: `sync-${Date.now()}` };
  }

  // Setup automatic sync interval
  setupSyncInterval(): void {
    // Clear existing interval
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    if (!this.config.isEnabled || this.config.syncFrequency === 'manual' || this.config.syncFrequency === 'realtime') {
      this.updateStatus({ nextScheduledSync: null });
      return;
    }

    const intervals: Record<string, number> = {
      '5min': 5 * 60 * 1000,
      '15min': 15 * 60 * 1000,
      'hourly': 60 * 60 * 1000,
    };

    const interval = intervals[this.config.syncFrequency];
    if (!interval) return;

    const nextSync = new Date(Date.now() + interval).toISOString();
    this.updateStatus({ nextScheduledSync: nextSync });

    // Note: The actual sync would need access to app state (projects, clients, etc.)
    // This would typically be handled by the component that renders the sync status
    console.log(`⏰ Pulse sync scheduled every ${this.config.syncFrequency}`);
  }

  // Clear sync interval
  clearSyncInterval(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.updateStatus({ nextScheduledSync: null });
  }

  // Get sync logs
  getSyncLogs(limit: number = 10): SyncLogEntry[] {
    return this.syncLogs.slice(0, limit);
  }

  // Clear sync logs
  clearSyncLogs(): void {
    this.syncLogs = [];
    localStorage.removeItem('pulseSyncLogs');
    this.updateStatus({
      recentLogs: [],
      statistics: this.calculateStatistics(),
    });
  }

  // Open Pulse app in new window
  openPulseApp(): void {
    // This would open the Pulse app URL
    // For development, we could open localhost or the deployed URL
    window.open('http://localhost:5174', '_blank', 'width=1200,height=800');
  }

  // Generate meeting room URL
  generateMeetingUrl(projectId?: string): string {
    const roomId = projectId || `meeting-${Date.now()}`;
    // This would generate a Pulse meeting room URL
    return `http://localhost:5174/meeting/${roomId}`;
  }
}

// Export singleton instance
export const pulseIntegrationService = new PulseIntegrationService();
