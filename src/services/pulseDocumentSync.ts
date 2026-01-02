// src/services/pulseDocumentSync.ts
// Handles document synchronization between Logos Vision and Pulse

import { supabase } from './supabaseClient';

// ============================================
// TYPES
// ============================================

export interface DocumentSyncStatus {
  id: string;
  logosDocumentId: string;
  pulseFileId?: string;
  pulseFileUrl?: string;
  syncDirection: 'logos_to_pulse' | 'pulse_to_logos' | 'bidirectional';
  lastSyncedAt?: string;
  syncStatus: 'synced' | 'pending' | 'error' | 'conflict';
  logosVersion: number;
  pulseVersion: number;
  logosHash?: string;
  pulseHash?: string;
  sharedInChannels: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PulseFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  uploadedById: string;
  uploadedByName: string;
  channelId?: string;
  messageId?: string;
  createdAt: string;
}

export interface DocumentShareOptions {
  channelIds?: string[];
  messageText?: string;
  notifyUsers?: boolean;
}

// ============================================
// PULSE API CONFIGURATION
// ============================================

// Use environment variables for security - these should be set in .env.local
const PULSE_SUPABASE_URL = import.meta.env.VITE_PULSE_SUPABASE_URL || '';
const PULSE_SUPABASE_KEY = import.meta.env.VITE_PULSE_SUPABASE_ANON_KEY || import.meta.env.VITE_PULSE_SUPABASE_KEY || '';

// Path to local Pulse directory for file system sync
const PULSE_LOCAL_PATH = import.meta.env.VITE_PULSE_LOCAL_PATH || 'F:\\pulse';

// Check if Pulse integration is configured
const isPulseConfigured = () => Boolean(PULSE_SUPABASE_URL && PULSE_SUPABASE_KEY);

// ============================================
// SERVICE
// ============================================

export const pulseDocumentSync = {
  // ==========================================
  // SYNC STATUS TRACKING
  // ==========================================

  async getSyncStatus(logosDocumentId: string): Promise<DocumentSyncStatus | null> {
    const { data, error } = await supabase
      .from('document_sync')
      .select('*')
      .eq('logos_document_id', logosDocumentId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      logosDocumentId: data.logos_document_id,
      pulseFileId: data.pulse_file_id,
      pulseFileUrl: data.pulse_file_url,
      syncDirection: data.sync_direction,
      lastSyncedAt: data.last_synced_at,
      syncStatus: data.sync_status,
      logosVersion: data.logos_version,
      pulseVersion: data.pulse_version,
      logosHash: data.logos_hash,
      pulseHash: data.pulse_hash,
      sharedInChannels: data.shared_in_channels || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async updateSyncStatus(
    logosDocumentId: string,
    updates: Partial<DocumentSyncStatus>
  ): Promise<void> {
    const updateData: Record<string, any> = {};

    if (updates.pulseFileId !== undefined) updateData.pulse_file_id = updates.pulseFileId;
    if (updates.pulseFileUrl !== undefined) updateData.pulse_file_url = updates.pulseFileUrl;
    if (updates.syncStatus !== undefined) updateData.sync_status = updates.syncStatus;
    if (updates.logosVersion !== undefined) updateData.logos_version = updates.logosVersion;
    if (updates.pulseVersion !== undefined) updateData.pulse_version = updates.pulseVersion;
    if (updates.logosHash !== undefined) updateData.logos_hash = updates.logosHash;
    if (updates.pulseHash !== undefined) updateData.pulse_hash = updates.pulseHash;
    if (updates.sharedInChannels !== undefined) updateData.shared_in_channels = updates.sharedInChannels;
    if (updates.lastSyncedAt !== undefined) updateData.last_synced_at = updates.lastSyncedAt;
    updateData.updated_at = new Date().toISOString();

    await supabase
      .from('document_sync')
      .upsert({
        logos_document_id: logosDocumentId,
        ...updateData,
      }, {
        onConflict: 'logos_document_id',
      });
  },

  // ==========================================
  // SYNC TO PULSE
  // ==========================================

  async syncDocumentToPulse(
    document: {
      id: string;
      name: string;
      fileUrl?: string;
      mimeType?: string;
      size?: number;
      projectId?: string;
      clientId?: string;
    }
  ): Promise<{ pulseFileId: string; pulseFileUrl: string }> {
    console.log(`🔄 Syncing document "${document.name}" to Pulse...`);

    try {
      // Create/update document record in Pulse
      const response = await fetch(`${PULSE_SUPABASE_URL}/rest/v1/logos_documents?on_conflict=id`, {
        method: 'POST',
        headers: {
          'apikey': PULSE_SUPABASE_KEY,
          'Authorization': `Bearer ${PULSE_SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation,resolution=merge-duplicates',
        },
        body: JSON.stringify({
          id: document.id,
          name: document.name,
          file_url: document.fileUrl,
          mime_type: document.mimeType,
          size: document.size,
          project_id: document.projectId,
          client_id: document.clientId,
          synced_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to sync document to Pulse: ${error}`);
      }

      const result = await response.json();
      const pulseDoc = result[0];

      // Update sync status
      await this.updateSyncStatus(document.id, {
        pulseFileId: pulseDoc.id,
        pulseFileUrl: pulseDoc.file_url,
        syncStatus: 'synced',
        lastSyncedAt: new Date().toISOString(),
      });

      console.log(`✅ Document synced to Pulse`);

      return {
        pulseFileId: pulseDoc.id,
        pulseFileUrl: pulseDoc.file_url,
      };
    } catch (error) {
      console.error('❌ Failed to sync document to Pulse:', error);

      await this.updateSyncStatus(document.id, {
        syncStatus: 'error',
      });

      throw error;
    }
  },

  // ==========================================
  // SYNC FROM PULSE
  // ==========================================

  async syncDocumentsFromPulse(): Promise<{ documentsSynced: number }> {
    console.log('🔄 Syncing documents from Pulse...');

    try {
      const response = await fetch(`${PULSE_SUPABASE_URL}/rest/v1/logos_documents`, {
        headers: {
          'apikey': PULSE_SUPABASE_KEY,
          'Authorization': `Bearer ${PULSE_SUPABASE_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch documents from Pulse');
      }

      const pulseDocuments = await response.json();
      let synced = 0;

      for (const doc of pulseDocuments) {
        const { error } = await supabase
          .from('lv_documents')
          .upsert({
            id: doc.id,
            title: doc.name,
            file_url: doc.file_url,
            mime_type: doc.mime_type,
            file_size: doc.size,
            project_id: doc.project_id,
            client_id: doc.client_id,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'id',
          });

        if (!error) {
          synced++;

          // Update sync tracking
          await this.updateSyncStatus(doc.id, {
            pulseFileId: doc.id,
            pulseFileUrl: doc.file_url,
            syncStatus: 'synced',
            lastSyncedAt: new Date().toISOString(),
          });
        }
      }

      console.log(`✅ Synced ${synced} documents from Pulse`);
      return { documentsSynced: synced };
    } catch (error) {
      console.error('❌ Failed to sync documents from Pulse:', error);
      return { documentsSynced: 0 };
    }
  },

  // ==========================================
  // SHARE IN CHANNEL
  // ==========================================

  async shareInChannel(
    documentId: string,
    channelId: string,
    options?: DocumentShareOptions
  ): Promise<void> {
    console.log(`📤 Sharing document in channel ${channelId}...`);

    // Get document details
    const { data: doc, error } = await supabase
      .from('lv_documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error || !doc) {
      throw new Error('Document not found');
    }

    // Ensure document is synced to Pulse
    const syncStatus = await this.getSyncStatus(documentId);
    if (!syncStatus || syncStatus.syncStatus !== 'synced') {
      await this.syncDocumentToPulse({
        id: doc.id,
        name: doc.title,
        fileUrl: doc.file_url,
        mimeType: doc.mime_type,
        size: doc.file_size,
        projectId: doc.project_id,
        clientId: doc.client_id,
      });
    }

    // Create message in Pulse channel with document attachment
    const messageText = options?.messageText || `Shared document: ${doc.title}`;

    try {
      await fetch(`${PULSE_SUPABASE_URL}/rest/v1/chat_messages`, {
        method: 'POST',
        headers: {
          'apikey': PULSE_SUPABASE_KEY,
          'Authorization': `Bearer ${PULSE_SUPABASE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel_id: channelId,
          content: messageText,
          message_type: 'file',
          attachments: [{
            type: 'document',
            id: documentId,
            name: doc.title,
            url: doc.file_url,
            mime_type: doc.mime_type,
          }],
          created_at: new Date().toISOString(),
        }),
      });

      // Update shared channels list
      const currentStatus = await this.getSyncStatus(documentId);
      const sharedChannels = currentStatus?.sharedInChannels || [];
      if (!sharedChannels.includes(channelId)) {
        sharedChannels.push(channelId);
        await this.updateSyncStatus(documentId, { sharedInChannels: sharedChannels });
      }

      console.log(`✅ Document shared in channel`);
    } catch (error) {
      console.error('❌ Failed to share document:', error);
      throw error;
    }
  },

  // ==========================================
  // MEETING NOTES TO DOCUMENTS
  // ==========================================

  async saveMeetingNotesAsDocument(
    meeting: {
      id: string;
      title: string;
      notes: string;
      actionItems?: { task: string; assigneeName?: string; dueDate?: string }[];
      recordingUrl?: string;
      transcription?: string;
      linkedProjectId?: string;
      linkedClientId?: string;
    }
  ): Promise<string> {
    console.log(`📝 Saving meeting notes as document...`);

    // Build document content
    let content = `# Meeting Notes: ${meeting.title}\n\n`;
    content += `**Date:** ${new Date().toLocaleDateString()}\n\n`;

    if (meeting.notes) {
      content += `## Notes\n\n${meeting.notes}\n\n`;
    }

    if (meeting.actionItems && meeting.actionItems.length > 0) {
      content += `## Action Items\n\n`;
      meeting.actionItems.forEach((item, index) => {
        content += `${index + 1}. ${item.task}`;
        if (item.assigneeName) content += ` (Assigned to: ${item.assigneeName})`;
        if (item.dueDate) content += ` - Due: ${item.dueDate}`;
        content += '\n';
      });
      content += '\n';
    }

    if (meeting.recordingUrl) {
      content += `## Recording\n\n[View Recording](${meeting.recordingUrl})\n\n`;
    }

    if (meeting.transcription) {
      content += `## Transcription\n\n${meeting.transcription}\n\n`;
    }

    // Create document in Logos
    const { data, error } = await supabase
      .from('lv_documents')
      .insert({
        title: `Meeting Notes - ${meeting.title}`,
        category: 'Meeting Notes',
        content_type: 'markdown',
        content,
        project_id: meeting.linkedProjectId,
        client_id: meeting.linkedClientId,
        related_id: meeting.id,
        related_type: 'meeting',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ Meeting notes saved as document`);
    return data.id;
  },

  // ==========================================
  // CHAT ARCHIVE TO DOCUMENTS
  // ==========================================

  async archiveChatAsDocument(
    channelId: string,
    channelName: string,
    dateRange?: { start: string; end: string }
  ): Promise<string> {
    console.log(`📚 Archiving chat from channel "${channelName}"...`);

    try {
      // Fetch messages from Pulse
      let url = `${PULSE_SUPABASE_URL}/rest/v1/chat_messages?channel_id=eq.${channelId}&order=created_at.asc`;

      if (dateRange) {
        url += `&created_at=gte.${dateRange.start}&created_at=lte.${dateRange.end}`;
      }

      const response = await fetch(url, {
        headers: {
          'apikey': PULSE_SUPABASE_KEY,
          'Authorization': `Bearer ${PULSE_SUPABASE_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chat messages');
      }

      const messages = await response.json();

      // Build document content
      let content = `# Chat Archive: ${channelName}\n\n`;
      content += `**Archived:** ${new Date().toLocaleString()}\n`;
      content += `**Messages:** ${messages.length}\n\n`;
      content += `---\n\n`;

      messages.forEach((msg: any) => {
        const timestamp = new Date(msg.created_at).toLocaleString();
        content += `**${msg.sender_name || 'Unknown'}** (${timestamp}):\n`;
        content += `${msg.content}\n\n`;
      });

      // Create document in Logos
      const { data, error } = await supabase
        .from('lv_documents')
        .insert({
          title: `Chat Archive - ${channelName}`,
          category: 'Chat Archive',
          content_type: 'markdown',
          content,
          created_at: new Date().toISOString(),
          metadata: {
            channelId,
            channelName,
            messageCount: messages.length,
            dateRange,
          },
        })
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ Chat archived as document`);
      return data.id;
    } catch (error) {
      console.error('❌ Failed to archive chat:', error);
      throw error;
    }
  },

  // ==========================================
  // BULK SYNC
  // ==========================================

  async syncAllDocuments(direction: 'to_pulse' | 'from_pulse' | 'both'): Promise<{
    toPulse: number;
    fromPulse: number;
  }> {
    let toPulse = 0;
    let fromPulse = 0;

    if (direction === 'to_pulse' || direction === 'both') {
      // Get all unsynced documents from Logos
      const { data: logosDocuments } = await supabase
        .from('lv_documents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      for (const doc of logosDocuments || []) {
        const syncStatus = await this.getSyncStatus(doc.id);
        if (!syncStatus || syncStatus.syncStatus !== 'synced') {
          try {
            await this.syncDocumentToPulse({
              id: doc.id,
              name: doc.title,
              fileUrl: doc.file_url,
              mimeType: doc.mime_type,
              size: doc.file_size,
              projectId: doc.project_id,
              clientId: doc.client_id,
            });
            toPulse++;
          } catch (e) {
            console.error(`Failed to sync document ${doc.id}:`, e);
          }
        }
      }
    }

    if (direction === 'from_pulse' || direction === 'both') {
      const result = await this.syncDocumentsFromPulse();
      fromPulse = result.documentsSynced;
    }

    return { toPulse, fromPulse };
  },

  // ==========================================
  // UTILITIES
  // ==========================================

  generateFileHash(content: string): string {
    // Simple hash for change detection
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  },

  async checkForChanges(documentId: string): Promise<boolean> {
    const syncStatus = await this.getSyncStatus(documentId);
    if (!syncStatus) return true; // Never synced

    // Get current document
    const { data: doc } = await supabase
      .from('lv_documents')
      .select('content, updated_at')
      .eq('id', documentId)
      .single();

    if (!doc) return false;

    const currentHash = this.generateFileHash(doc.content || '');
    return currentHash !== syncStatus.logosHash;
  },
};

export default pulseDocumentSync;
