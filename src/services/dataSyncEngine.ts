// src/services/dataSyncEngine.ts
// Robust bidirectional data sync engine for Logos <-> Pulse integration
// Handles queuing, retries, conflict resolution, and real-time updates

import { supabase } from './supabaseClient';

// ============================================
// TYPES
// ============================================

export type SyncDirection = 'to_pulse' | 'from_pulse' | 'bidirectional';
export type SyncStatus = 'pending' | 'syncing' | 'success' | 'failed' | 'conflict';
export type ConflictResolution = 'logos_wins' | 'pulse_wins' | 'newest_wins' | 'manual';
export type EntityType = 'project' | 'client' | 'activity' | 'document' | 'team_member' | 'meeting' | 'case' | 'task';

export interface SyncQueueItem {
  id: string;
  entityType: EntityType;
  entityId: string;
  direction: SyncDirection;
  operation: 'create' | 'update' | 'delete';
  data: any;
  priority: number;
  retryCount: number;
  maxRetries: number;
  status: SyncStatus;
  error?: string;
  createdAt: string;
  lastAttemptAt?: string;
}

export interface EntityMapping {
  id: string;
  logosEntityType: string;
  logosEntityId: string;
  pulseEntityType: string;
  pulseEntityId: string;
  lastLogosUpdate?: string;
  lastPulseUpdate?: string;
  lastSyncedAt?: string;
  syncStatus: SyncStatus;
}

export interface SyncResult {
  success: boolean;
  itemsProcessed: number;
  itemsSucceeded: number;
  itemsFailed: number;
  conflicts: SyncConflict[];
  errors: string[];
  duration: number;
}

export interface SyncConflict {
  entityType: EntityType;
  entityId: string;
  logosData: any;
  pulseData: any;
  logosUpdatedAt: string;
  pulseUpdatedAt: string;
  resolution?: 'logos' | 'pulse' | 'merged' | 'skipped';
}

export interface SyncConfig {
  conflictResolution: ConflictResolution;
  batchSize: number;
  maxRetries: number;
  retryDelayMs: number;
  enableRealtime: boolean;
  syncIntervalMs: number;
}

// ============================================
// PULSE API CONFIGURATION
// ============================================

const PULSE_SUPABASE_URL = import.meta.env.VITE_PULSE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const PULSE_SUPABASE_KEY = import.meta.env.VITE_PULSE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

// ============================================
// DATA SYNC ENGINE CLASS
// ============================================

class DataSyncEngine {
  private queue: SyncQueueItem[] = [];
  private isProcessing = false;
  private config: SyncConfig;
  private listeners: ((event: string, data: any) => void)[] = [];
  private syncInterval: NodeJS.Timeout | null = null;
  private websocket: WebSocket | null = null;

  constructor() {
    this.config = {
      conflictResolution: 'newest_wins',
      batchSize: 50,
      maxRetries: 3,
      retryDelayMs: 5000,
      enableRealtime: true,
      syncIntervalMs: 300000, // 5 minutes
    };

    // Load queue from localStorage
    const savedQueue = localStorage.getItem('dataSyncQueue');
    if (savedQueue) {
      this.queue = JSON.parse(savedQueue);
    }
  }

  // ==========================================
  // CONFIGURATION
  // ==========================================

  setConfig(config: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...config };

    if (config.enableRealtime !== undefined) {
      if (config.enableRealtime) {
        this.connectWebSocket();
      } else {
        this.disconnectWebSocket();
      }
    }
  }

  getConfig(): SyncConfig {
    return { ...this.config };
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
  // QUEUE MANAGEMENT
  // ==========================================

  async queueSync(
    entityType: EntityType,
    entityId: string,
    direction: SyncDirection,
    operation: 'create' | 'update' | 'delete',
    data: any,
    priority: number = 5
  ): Promise<string> {
    const item: SyncQueueItem = {
      id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entityType,
      entityId,
      direction,
      operation,
      data,
      priority,
      retryCount: 0,
      maxRetries: this.config.maxRetries,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Check for existing pending item for same entity
    const existingIndex = this.queue.findIndex(
      q => q.entityType === entityType &&
           q.entityId === entityId &&
           q.status === 'pending'
    );

    if (existingIndex >= 0) {
      // Update existing item
      this.queue[existingIndex] = { ...item, id: this.queue[existingIndex].id };
    } else {
      // Add new item
      this.queue.push(item);
    }

    // Sort by priority (lower = higher priority)
    this.queue.sort((a, b) => a.priority - b.priority);

    this.saveQueue();
    this.emit('queue:added', item);

    // Process queue if not already processing
    if (!this.isProcessing) {
      this.processQueue();
    }

    return item.id;
  }

  getQueueStatus(): { pending: number; processing: number; failed: number } {
    return {
      pending: this.queue.filter(q => q.status === 'pending').length,
      processing: this.queue.filter(q => q.status === 'syncing').length,
      failed: this.queue.filter(q => q.status === 'failed').length,
    };
  }

  clearFailedItems(): void {
    this.queue = this.queue.filter(q => q.status !== 'failed');
    this.saveQueue();
    this.emit('queue:cleared', { type: 'failed' });
  }

  retryFailedItems(): void {
    this.queue.forEach(item => {
      if (item.status === 'failed' && item.retryCount < item.maxRetries) {
        item.status = 'pending';
        item.retryCount++;
      }
    });
    this.saveQueue();
    this.processQueue();
  }

  private saveQueue(): void {
    localStorage.setItem('dataSyncQueue', JSON.stringify(this.queue));
  }

  // ==========================================
  // QUEUE PROCESSING
  // ==========================================

  async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.filter(q => q.status === 'pending').length === 0) {
      return;
    }

    this.isProcessing = true;
    this.emit('sync:started', { queueLength: this.queue.length });

    const batch = this.queue
      .filter(q => q.status === 'pending')
      .slice(0, this.config.batchSize);

    for (const item of batch) {
      item.status = 'syncing';
      item.lastAttemptAt = new Date().toISOString();
      this.emit('sync:item:started', item);

      try {
        await this.syncItem(item);
        item.status = 'success';
        this.emit('sync:item:success', item);

        // Remove successful items from queue
        this.queue = this.queue.filter(q => q.id !== item.id);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        item.error = errorMessage;

        if (item.retryCount >= item.maxRetries) {
          item.status = 'failed';
          this.emit('sync:item:failed', { item, error: errorMessage });
        } else {
          item.status = 'pending';
          item.retryCount++;
          this.emit('sync:item:retry', { item, error: errorMessage });
        }
      }

      this.saveQueue();
    }

    this.isProcessing = false;
    this.emit('sync:completed', { processed: batch.length });

    // Continue processing if more items in queue
    if (this.queue.filter(q => q.status === 'pending').length > 0) {
      setTimeout(() => this.processQueue(), 100);
    }
  }

  private async syncItem(item: SyncQueueItem): Promise<void> {
    switch (item.direction) {
      case 'to_pulse':
        await this.syncToPulse(item);
        break;
      case 'from_pulse':
        await this.syncFromPulse(item);
        break;
      case 'bidirectional':
        await this.bidirectionalSync(item);
        break;
    }
  }

  // ==========================================
  // SYNC TO PULSE
  // ==========================================

  private async syncToPulse(item: SyncQueueItem): Promise<void> {
    const endpoint = this.getPulseEndpoint(item.entityType);
    const method = item.operation === 'delete' ? 'DELETE' :
                   item.operation === 'create' ? 'POST' : 'PUT';

    const url = item.operation === 'delete'
      ? `${PULSE_SUPABASE_URL}/rest/v1/${endpoint}?id=eq.${item.entityId}`
      : `${PULSE_SUPABASE_URL}/rest/v1/${endpoint}?on_conflict=id`;

    const response = await fetch(url, {
      method: method === 'PUT' ? 'POST' : method, // Supabase uses POST with upsert
      headers: {
        'apikey': PULSE_SUPABASE_KEY,
        'Authorization': `Bearer ${PULSE_SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': method === 'DELETE' ? '' : 'return=representation,resolution=merge-duplicates',
      },
      body: item.operation !== 'delete' ? JSON.stringify(this.transformToPulse(item.entityType, item.data)) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Pulse sync failed: ${error}`);
    }

    // Update entity mapping
    await this.updateEntityMapping(item);
  }

  // ==========================================
  // SYNC FROM PULSE
  // ==========================================

  private async syncFromPulse(item: SyncQueueItem): Promise<void> {
    const endpoint = this.getPulseEndpoint(item.entityType);

    const response = await fetch(
      `${PULSE_SUPABASE_URL}/rest/v1/${endpoint}?id=eq.${item.entityId}`,
      {
        headers: {
          'apikey': PULSE_SUPABASE_KEY,
          'Authorization': `Bearer ${PULSE_SUPABASE_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from Pulse');
    }

    const pulseData = await response.json();
    if (pulseData.length === 0) {
      throw new Error('Entity not found in Pulse');
    }

    const logosData = this.transformFromPulse(item.entityType, pulseData[0]);
    await this.upsertToLogos(item.entityType, logosData);
    await this.updateEntityMapping(item);
  }

  // ==========================================
  // BIDIRECTIONAL SYNC
  // ==========================================

  private async bidirectionalSync(item: SyncQueueItem): Promise<void> {
    // Get mapping to check last sync times
    const mapping = await this.getEntityMapping(item.entityType, item.entityId);

    // Get latest data from both sides
    const logosData = item.data;
    const pulseData = await this.fetchFromPulse(item.entityType, item.entityId);

    if (!pulseData) {
      // Entity doesn't exist in Pulse, create it
      await this.syncToPulse(item);
      return;
    }

    const logosUpdatedAt = new Date(logosData.updated_at || logosData.updatedAt || 0);
    const pulseUpdatedAt = new Date(pulseData.updated_at || pulseData.synced_at || 0);

    // Check for conflicts
    if (mapping && mapping.lastSyncedAt) {
      const lastSync = new Date(mapping.lastSyncedAt);

      // Both modified since last sync = conflict
      if (logosUpdatedAt > lastSync && pulseUpdatedAt > lastSync) {
        const conflict: SyncConflict = {
          entityType: item.entityType,
          entityId: item.entityId,
          logosData,
          pulseData,
          logosUpdatedAt: logosUpdatedAt.toISOString(),
          pulseUpdatedAt: pulseUpdatedAt.toISOString(),
        };

        const resolvedData = this.resolveConflict(conflict);

        if (resolvedData) {
          // Update both sides with resolved data
          await this.syncToPulse({ ...item, data: resolvedData });
          await this.upsertToLogos(item.entityType, resolvedData);
        }

        return;
      }
    }

    // No conflict - sync based on which is newer
    if (logosUpdatedAt >= pulseUpdatedAt) {
      await this.syncToPulse(item);
    } else {
      const transformedData = this.transformFromPulse(item.entityType, pulseData);
      await this.upsertToLogos(item.entityType, transformedData);
    }

    await this.updateEntityMapping(item);
  }

  // ==========================================
  // CONFLICT RESOLUTION
  // ==========================================

  private resolveConflict(conflict: SyncConflict): any | null {
    switch (this.config.conflictResolution) {
      case 'logos_wins':
        conflict.resolution = 'logos';
        return conflict.logosData;

      case 'pulse_wins':
        conflict.resolution = 'pulse';
        return this.transformFromPulse(conflict.entityType, conflict.pulseData);

      case 'newest_wins':
        if (new Date(conflict.logosUpdatedAt) >= new Date(conflict.pulseUpdatedAt)) {
          conflict.resolution = 'logos';
          return conflict.logosData;
        } else {
          conflict.resolution = 'pulse';
          return this.transformFromPulse(conflict.entityType, conflict.pulseData);
        }

      case 'manual':
        // Store conflict for manual resolution
        this.emit('sync:conflict', conflict);
        conflict.resolution = 'skipped';
        return null;

      default:
        return conflict.logosData;
    }
  }

  // ==========================================
  // DATA TRANSFORMATION
  // ==========================================

  private transformToPulse(entityType: EntityType, data: any): any {
    switch (entityType) {
      case 'project':
        return {
          id: data.id,
          name: data.name,
          description: data.description,
          status: data.status,
          client_id: data.clientId || data.client_id,
          start_date: data.startDate || data.start_date,
          due_date: data.endDate || data.end_date,
          synced_at: new Date().toISOString(),
        };

      case 'client':
        const nameParts = (data.contactPerson || data.contact_person || '').split(' ');
        return {
          id: data.id,
          first_name: nameParts[0] || data.name?.split(' ')[0] || '',
          last_name: nameParts.slice(1).join(' ') || data.name?.split(' ').slice(1).join(' ') || '',
          email: data.email,
          phone: data.phone,
          company: data.location || data.company || data.name,
          status: data.status || 'active',
          synced_at: new Date().toISOString(),
        };

      case 'activity':
        return {
          id: data.id,
          type: data.type,
          title: data.title,
          description: data.description,
          status: data.status,
          project_id: data.projectId || data.project_id,
          client_id: data.clientId || data.client_id,
          activity_date: data.activityDate || data.activity_date,
          synced_at: new Date().toISOString(),
        };

      case 'meeting':
        return {
          id: data.id,
          title: data.title,
          description: data.description,
          start_time: data.startTime || data.start_time,
          end_time: data.endTime || data.end_time,
          attendees: data.attendees,
          room_url: data.roomUrl || data.room_url,
          project_id: data.projectId || data.linked_project_id,
          synced_at: new Date().toISOString(),
        };

      default:
        return { ...data, synced_at: new Date().toISOString() };
    }
  }

  private transformFromPulse(entityType: EntityType, data: any): any {
    switch (entityType) {
      case 'project':
        return {
          id: data.id,
          name: data.name,
          description: data.description,
          status: data.status,
          clientId: data.client_id,
          startDate: data.start_date,
          endDate: data.due_date,
          updatedAt: data.synced_at || new Date().toISOString(),
        };

      case 'client':
        return {
          id: data.id,
          name: [data.first_name, data.last_name].filter(Boolean).join(' ') || data.company || 'Unknown',
          contactPerson: [data.first_name, data.last_name].filter(Boolean).join(' ') || null,
          email: data.email,
          phone: data.phone,
          location: data.company,
          status: data.status || 'active',
          updatedAt: data.synced_at || new Date().toISOString(),
        };

      case 'activity':
        return {
          id: data.id,
          type: data.type,
          title: data.title,
          description: data.description,
          status: data.status,
          projectId: data.project_id,
          clientId: data.client_id,
          activityDate: data.activity_date,
          updatedAt: data.synced_at || new Date().toISOString(),
        };

      case 'meeting':
        return {
          id: data.id,
          title: data.title,
          description: data.description,
          startTime: data.start_time,
          endTime: data.end_time,
          attendees: data.attendees,
          roomUrl: data.room_url,
          linkedProjectId: data.project_id,
          recordingUrl: data.recording_url,
          notes: data.notes,
        };

      default:
        return data;
    }
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  private getPulseEndpoint(entityType: EntityType): string {
    const endpoints: Record<EntityType, string> = {
      project: 'logos_projects',
      client: 'logos_contacts',
      activity: 'logos_activities',
      document: 'logos_documents',
      team_member: 'logos_team_members',
      meeting: 'logos_meetings',
      case: 'logos_cases',
      task: 'logos_tasks',
    };
    return endpoints[entityType] || entityType;
  }

  private async fetchFromPulse(entityType: EntityType, entityId: string): Promise<any | null> {
    const endpoint = this.getPulseEndpoint(entityType);

    try {
      const response = await fetch(
        `${PULSE_SUPABASE_URL}/rest/v1/${endpoint}?id=eq.${entityId}`,
        {
          headers: {
            'apikey': PULSE_SUPABASE_KEY,
            'Authorization': `Bearer ${PULSE_SUPABASE_KEY}`,
          },
        }
      );

      if (!response.ok) return null;

      const data = await response.json();
      return data[0] || null;
    } catch {
      return null;
    }
  }

  private async upsertToLogos(entityType: EntityType, data: any): Promise<void> {
    const tableNames: Record<EntityType, string> = {
      project: 'lv_projects',
      client: 'lv_clients',
      activity: 'lv_activities',
      document: 'lv_documents',
      team_member: 'lv_team_members',
      meeting: 'pulse_meetings',
      case: 'lv_cases',
      task: 'lv_tasks',
    };

    const table = tableNames[entityType];
    if (!table) return;

    const { error } = await supabase
      .from(table)
      .upsert(data, { onConflict: 'id' });

    if (error) {
      throw new Error(`Failed to upsert to Logos: ${error.message}`);
    }
  }

  // ==========================================
  // ENTITY MAPPING
  // ==========================================

  private async getEntityMapping(
    entityType: EntityType,
    entityId: string
  ): Promise<EntityMapping | null> {
    const { data, error } = await supabase
      .from('entity_mappings')
      .select('*')
      .eq('logos_entity_type', entityType)
      .eq('logos_entity_id', entityId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      logosEntityType: data.logos_entity_type,
      logosEntityId: data.logos_entity_id,
      pulseEntityType: data.pulse_entity_type,
      pulseEntityId: data.pulse_entity_id,
      lastLogosUpdate: data.last_logos_update,
      lastPulseUpdate: data.last_pulse_update,
      lastSyncedAt: data.last_synced_at,
      syncStatus: data.sync_status,
    };
  }

  private async updateEntityMapping(item: SyncQueueItem): Promise<void> {
    const mapping = {
      logos_entity_type: item.entityType,
      logos_entity_id: item.entityId,
      pulse_entity_type: this.getPulseEndpoint(item.entityType),
      pulse_entity_id: item.entityId,
      last_synced_at: new Date().toISOString(),
      sync_status: 'synced',
      updated_at: new Date().toISOString(),
    };

    await supabase
      .from('entity_mappings')
      .upsert(mapping, {
        onConflict: 'logos_entity_type,logos_entity_id,pulse_entity_type'
      });
  }

  // ==========================================
  // WEBSOCKET REAL-TIME SYNC
  // ==========================================

  connectWebSocket(): void {
    if (this.websocket) {
      this.websocket.close();
    }

    // Note: In production, this would connect to Pulse's realtime endpoint
    const wsUrl = `wss://${PULSE_SUPABASE_URL.replace('https://', '')}/realtime/v1/websocket`;

    try {
      this.websocket = new WebSocket(wsUrl);

      this.websocket.onopen = () => {
        console.log('🔗 WebSocket connected to Pulse');
        this.emit('websocket:connected', {});

        // Subscribe to relevant tables
        this.subscribeToChanges();
      };

      this.websocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleWebSocketMessage(message);
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('websocket:error', error);
      };

      this.websocket.onclose = () => {
        console.log('WebSocket disconnected from Pulse');
        this.emit('websocket:disconnected', {});

        // Attempt reconnection after delay
        if (this.config.enableRealtime) {
          setTimeout(() => this.connectWebSocket(), 5000);
        }
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }

  private subscribeToChanges(): void {
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) return;

    // Subscribe to changes in Pulse tables
    const subscriptions = [
      { table: 'logos_projects', event: '*' },
      { table: 'logos_contacts', event: '*' },
      { table: 'logos_meetings', event: '*' },
    ];

    subscriptions.forEach(sub => {
      this.websocket?.send(JSON.stringify({
        type: 'subscribe',
        table: sub.table,
        event: sub.event,
      }));
    });
  }

  private handleWebSocketMessage(message: any): void {
    if (message.type === 'INSERT' || message.type === 'UPDATE') {
      const entityType = this.getEntityTypeFromTable(message.table);
      if (entityType) {
        this.queueSync(
          entityType,
          message.record.id,
          'from_pulse',
          message.type === 'INSERT' ? 'create' : 'update',
          message.record,
          3 // High priority for real-time updates
        );
      }
    }
  }

  private getEntityTypeFromTable(table: string): EntityType | null {
    const mapping: Record<string, EntityType> = {
      'logos_projects': 'project',
      'logos_contacts': 'client',
      'logos_activities': 'activity',
      'logos_meetings': 'meeting',
      'logos_documents': 'document',
    };
    return mapping[table] || null;
  }

  disconnectWebSocket(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }

  // ==========================================
  // FULL SYNC
  // ==========================================

  async performFullSync(
    direction: SyncDirection,
    projects: any[],
    clients: any[],
    activities: any[],
    cases: any[],
    tasks: any[]
  ): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      success: false,
      itemsProcessed: 0,
      itemsSucceeded: 0,
      itemsFailed: 0,
      conflicts: [],
      errors: [],
      duration: 0,
    };

    this.emit('fullsync:started', { direction });

    try {
      // Queue all items
      const allItems = [
        ...clients.map(c => ({ entityType: 'client' as EntityType, data: c })),
        ...projects.map(p => ({ entityType: 'project' as EntityType, data: p })),
        ...activities.map(a => ({ entityType: 'activity' as EntityType, data: a })),
        ...cases.map(c => ({ entityType: 'case' as EntityType, data: c })),
        ...tasks.map(t => ({ entityType: 'task' as EntityType, data: t })),
      ];

      for (const item of allItems) {
        try {
          await this.queueSync(
            item.entityType,
            item.data.id,
            direction,
            'update',
            item.data,
            10 // Normal priority
          );
          result.itemsProcessed++;
        } catch (e) {
          result.itemsFailed++;
          result.errors.push(`Failed to queue ${item.entityType} ${item.data.id}`);
        }
      }

      // Wait for queue to process
      await this.waitForQueueCompletion();

      result.itemsSucceeded = result.itemsProcessed - result.itemsFailed;
      result.success = result.itemsFailed === 0;

    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    result.duration = Date.now() - startTime;
    this.emit('fullsync:completed', result);

    return result;
  }

  private waitForQueueCompletion(): Promise<void> {
    return new Promise((resolve) => {
      const check = () => {
        if (this.queue.filter(q => q.status === 'pending' || q.status === 'syncing').length === 0) {
          resolve();
        } else {
          setTimeout(check, 500);
        }
      };
      check();
    });
  }

  // ==========================================
  // SCHEDULED SYNC
  // ==========================================

  startScheduledSync(
    getData: () => { projects: any[]; clients: any[]; activities: any[]; cases: any[]; tasks: any[] }
  ): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      const data = getData();
      await this.performFullSync(
        'bidirectional',
        data.projects,
        data.clients,
        data.activities,
        data.cases,
        data.tasks
      );
    }, this.config.syncIntervalMs);

    console.log(`⏰ Scheduled sync started (every ${this.config.syncIntervalMs / 1000}s)`);
  }

  stopScheduledSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('⏹️ Scheduled sync stopped');
    }
  }
}

// Export singleton instance
export const dataSyncEngine = new DataSyncEngine();

export default dataSyncEngine;
