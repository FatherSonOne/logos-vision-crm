// Enhanced Document Service
// Unified interface for Supabase, Google Drive, and Pulse document operations

import { supabase } from './supabaseClient';
import { googleDriveService } from './googleDriveService';
import type { Document as AppDocument } from '../types';

// Types
export interface EnhancedDocument extends AppDocument {
  storage_provider?: 'supabase' | 'google_drive' | 'onedrive' | 'dropbox' | 'external';
  google_drive_id?: string;
  pulse_file_id?: string;
  pulse_synced?: boolean;
  visibility?: 'private' | 'team' | 'organization' | 'public';
  sensitivity_level?: 'public' | 'normal' | 'confidential' | 'restricted';
  tags?: string[];
  folder_id?: string;
  project_id?: string;
  client_id?: string;
  version?: number;
  thumbnail_url?: string;
}

export interface UploadOptions {
  category?: string;
  relatedId?: string;
  relatedType?: 'client' | 'project' | 'case' | 'household' | 'volunteer';
  projectId?: string;
  clientId?: string;
  folderId?: string;
  visibility?: 'private' | 'team' | 'organization' | 'public';
  sensitivityLevel?: 'public' | 'normal' | 'confidential' | 'restricted';
  tags?: string[];
  syncToGoogleDrive?: boolean;
  syncToPulse?: boolean;
}

export interface DocumentAccessLog {
  id: string;
  document_id: string;
  user_id: string;
  action: string;
  details?: Record<string, any>;
  created_at: string;
}

export interface SecurityPolicy {
  id: string;
  name: string;
  applies_to: string;
  can_view: boolean;
  can_download: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_share: boolean;
}

// Helper: Convert DB format to app format
function dbToDocument(dbDoc: any): EnhancedDocument {
  return {
    id: dbDoc.id,
    name: dbDoc.name,
    category: dbDoc.category || 'Internal',
    relatedId: dbDoc.related_id,
    uploadedById: dbDoc.uploaded_by_id,
    lastModified: dbDoc.updated_at || dbDoc.uploaded_at,
    size: formatFileSize(dbDoc.file_size || 0),
    fileType: mapMimeToFileType(dbDoc.file_type || dbDoc.mime_type || ''),
    storage_provider: dbDoc.storage_provider || 'supabase',
    google_drive_id: dbDoc.google_drive_id,
    pulse_file_id: dbDoc.pulse_file_id,
    pulse_synced: dbDoc.pulse_synced,
    visibility: dbDoc.visibility || 'team',
    sensitivity_level: dbDoc.sensitivity_level || 'normal',
    tags: dbDoc.tags || [],
    folder_id: dbDoc.folder_id,
    project_id: dbDoc.project_id,
    client_id: dbDoc.client_id,
    version: dbDoc.version || 1,
    thumbnail_url: dbDoc.thumbnail_url,
    // Keep the file URL for downloads
    url: dbDoc.file_url,
  } as EnhancedDocument & { url: string };
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function mapMimeToFileType(mimeType: string): AppDocument['fileType'] {
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'docx';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'xlsx';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'pptx';
  if (mimeType.includes('image')) return 'image';
  return 'other';
}

export const enhancedDocumentService = {
  // ========================================
  // CRUD Operations
  // ========================================

  /**
   * Get all documents with enhanced metadata
   */
  async getAll(filters?: {
    category?: string;
    projectId?: string;
    clientId?: string;
    folderId?: string;
    visibility?: string;
    search?: string;
  }): Promise<EnhancedDocument[]> {
    let query = supabase
      .from('documents')
      .select('*')
      .eq('status', 'active')
      .order('uploaded_at', { ascending: false });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.projectId) {
      query = query.eq('project_id', filters.projectId);
    }
    if (filters?.clientId) {
      query = query.eq('client_id', filters.clientId);
    }
    if (filters?.folderId) {
      query = query.eq('folder_id', filters.folderId);
    }
    if (filters?.visibility) {
      query = query.eq('visibility', filters.visibility);
    }
    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map(dbToDocument);
  },

  /**
   * Get document by ID
   */
  async getById(id: string): Promise<EnhancedDocument | null> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    // Log access
    await this.logAccess(id, 'view');

    return dbToDocument(data);
  },

  /**
   * Get documents by related entity
   */
  async getByRelatedId(relatedId: string, relatedType?: string): Promise<EnhancedDocument[]> {
    let query = supabase
      .from('documents')
      .select('*')
      .eq('related_id', relatedId)
      .eq('status', 'active')
      .order('uploaded_at', { ascending: false });

    if (relatedType) {
      query = query.eq('related_type', relatedType);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map(dbToDocument);
  },

  /**
   * Get documents for a project
   */
  async getByProject(projectId: string): Promise<EnhancedDocument[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('project_id', projectId)
      .eq('status', 'active')
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(dbToDocument);
  },

  /**
   * Upload a document
   */
  async upload(
    file: File,
    userId: string,
    options: UploadOptions = {}
  ): Promise<EnhancedDocument> {
    // Generate unique file path
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const category = options.category || 'Internal';
    const filePath = `${category}/${timestamp}_${safeName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    // Create document record
    const documentData: Record<string, any> = {
      name: file.name,
      file_type: file.type,
      mime_type: file.type,
      file_size: file.size,
      file_url: urlData?.publicUrl || filePath,
      file_path: filePath,
      category,
      uploaded_by_id: userId,
      owner_id: userId,
      uploaded_at: new Date().toISOString(),
      status: 'active',
      storage_provider: 'supabase',
      visibility: options.visibility || 'team',
      sensitivity_level: options.sensitivityLevel || 'normal',
      sync_enabled: true,
    };

    // Add optional fields
    if (options.relatedId) documentData.related_id = options.relatedId;
    if (options.relatedType) documentData.related_type = options.relatedType;
    if (options.projectId) documentData.project_id = options.projectId;
    if (options.clientId) documentData.client_id = options.clientId;
    if (options.folderId) documentData.folder_id = options.folderId;
    if (options.tags && options.tags.length > 0) documentData.tags = options.tags;

    const { data, error: dbError } = await supabase
      .from('documents')
      .insert(documentData)
      .select()
      .single();

    if (dbError) {
      // Clean up uploaded file
      await supabase.storage.from('documents').remove([filePath]);
      throw dbError;
    }

    // Log upload
    await this.logAccess(data.id, 'upload');

    // Sync to Google Drive if requested
    if (options.syncToGoogleDrive && googleDriveService.isConnected()) {
      await googleDriveService.syncToGoogleDrive({
        id: data.id,
        name: file.name,
        file_url: urlData?.publicUrl || filePath,
        category,
      });
    }

    // Sync to Pulse if requested
    if (options.syncToPulse) {
      await this.syncToPulse(data.id);
    }

    return dbToDocument(data);
  },

  /**
   * Update document metadata
   */
  async update(
    id: string,
    updates: Partial<{
      name: string;
      category: string;
      folderId: string;
      visibility: string;
      sensitivityLevel: string;
      tags: string[];
      projectId: string;
      clientId: string;
    }>
  ): Promise<EnhancedDocument> {
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.name) updateData.name = updates.name;
    if (updates.category) updateData.category = updates.category;
    if (updates.folderId !== undefined) updateData.folder_id = updates.folderId;
    if (updates.visibility) updateData.visibility = updates.visibility;
    if (updates.sensitivityLevel) updateData.sensitivity_level = updates.sensitivityLevel;
    if (updates.tags) updateData.tags = updates.tags;
    if (updates.projectId) updateData.project_id = updates.projectId;
    if (updates.clientId) updateData.client_id = updates.clientId;

    const { data, error } = await supabase
      .from('documents')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await this.logAccess(id, 'edit', { updates });

    return dbToDocument(data);
  },

  /**
   * Delete document (soft delete)
   */
  async delete(id: string): Promise<void> {
    const { data: doc } = await supabase
      .from('documents')
      .select('file_path, google_drive_id')
      .eq('id', id)
      .single();

    // Soft delete in database
    const { error } = await supabase
      .from('documents')
      .update({
        status: 'deleted',
        deleted_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;

    // Log deletion
    await this.logAccess(id, 'delete');

    // Optionally delete from storage (uncomment if needed)
    // if (doc?.file_path) {
    //   await supabase.storage.from('documents').remove([doc.file_path]);
    // }
  },

  /**
   * Permanently delete document
   */
  async permanentDelete(id: string): Promise<void> {
    const { data: doc } = await supabase
      .from('documents')
      .select('file_path, google_drive_id')
      .eq('id', id)
      .single();

    if (doc?.file_path) {
      await supabase.storage.from('documents').remove([doc.file_path]);
    }

    if (doc?.google_drive_id && googleDriveService.isConnected()) {
      try {
        await googleDriveService.deleteFile(doc.google_drive_id);
      } catch (e) {
        console.error('Failed to delete from Google Drive:', e);
      }
    }

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Download document
   */
  async download(doc: EnhancedDocument): Promise<Blob> {
    await this.logAccess(doc.id, 'download');

    // If Google Drive document
    if (doc.storage_provider === 'google_drive' && doc.google_drive_id) {
      return googleDriveService.downloadFile(doc.google_drive_id);
    }

    // Default: Supabase storage
    const url = (doc as any).url || doc.id;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to download document');
    }

    return response.blob();
  },

  // ========================================
  // Folder Operations
  // ========================================

  /**
   * Get all folders
   */
  async getFolders(): Promise<any[]> {
    const { data, error } = await supabase
      .from('document_folders')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  /**
   * Create folder
   */
  async createFolder(
    name: string,
    parentId?: string,
    options?: { color?: string; icon?: string }
  ): Promise<any> {
    // Build path
    let path = `/${name}`;
    if (parentId) {
      const { data: parent } = await supabase
        .from('document_folders')
        .select('path')
        .eq('id', parentId)
        .single();
      if (parent?.path) {
        path = `${parent.path}/${name}`;
      }
    }

    const { data, error } = await supabase
      .from('document_folders')
      .insert({
        name,
        parent_id: parentId,
        path,
        color: options?.color,
        icon: options?.icon,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Move document to folder
   */
  async moveToFolder(documentId: string, folderId: string | null): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .update({ folder_id: folderId })
      .eq('id', documentId);

    if (error) throw error;

    await this.logAccess(documentId, 'move', { folderId });
  },

  // ========================================
  // Access Control & Audit
  // ========================================

  /**
   * Log document access
   */
  async logAccess(
    documentId: string,
    action: string,
    details?: Record<string, any>
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      await supabase.from('document_access_logs').insert({
        document_id: documentId,
        user_id: user?.id || 'anonymous',
        action,
        details: details || {},
        user_agent: navigator.userAgent,
      });

      // Update access stats on document
      await supabase
        .from('documents')
        .update({
          last_accessed_at: new Date().toISOString(),
          access_count: supabase.rpc('increment', { x: 1 }),
        })
        .eq('id', documentId);
    } catch (e) {
      // Don't fail operation if logging fails
      console.error('Failed to log access:', e);
    }
  },

  /**
   * Get access logs for a document
   */
  async getAccessLogs(documentId: string): Promise<DocumentAccessLog[]> {
    const { data, error } = await supabase
      .from('document_access_logs')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return data || [];
  },

  /**
   * Check if user can perform action on document
   */
  async canPerformAction(
    documentId: string,
    action: 'view' | 'download' | 'edit' | 'delete' | 'share'
  ): Promise<boolean> {
    const { data } = await supabase.rpc('can_access_document', {
      p_document_id: documentId,
      p_action: action,
    });

    return !!data;
  },

  /**
   * Get applicable security policies for a document
   */
  async getApplicablePolicies(documentId: string): Promise<SecurityPolicy[]> {
    const doc = await this.getById(documentId);
    if (!doc) return [];

    const { data, error } = await supabase
      .from('document_policies')
      .select('*')
      .eq('is_active', true)
      .or(`applies_to.eq.all,and(applies_to.eq.category,scope_value.eq.${doc.category}),and(applies_to.eq.sensitivity,scope_value.eq.${doc.sensitivity_level})`)
      .order('priority');

    if (error) throw error;
    return data || [];
  },

  // ========================================
  // Sharing
  // ========================================

  /**
   * Share document with user
   */
  async shareWithUser(
    documentId: string,
    userId: string,
    permission: 'view' | 'download' | 'edit' | 'full' = 'view',
    options?: { expiresAt?: Date; message?: string }
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('document_shares').insert({
      document_id: documentId,
      share_type: 'user',
      shared_with_id: userId,
      permission,
      expires_at: options?.expiresAt?.toISOString(),
      message: options?.message,
      shared_by_id: user?.id,
    });

    if (error) throw error;

    await this.logAccess(documentId, 'share', { userId, permission });
  },

  /**
   * Create public share link
   */
  async createShareLink(
    documentId: string,
    options?: {
      expiresAt?: Date;
      maxDownloads?: number;
      password?: string;
    }
  ): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    const token = crypto.randomUUID();

    const { error } = await supabase.from('document_shares').insert({
      document_id: documentId,
      share_type: 'public_link',
      share_link_token: token,
      permission: 'download',
      expires_at: options?.expiresAt?.toISOString(),
      max_downloads: options?.maxDownloads,
      password_hash: options?.password, // Should be hashed in production
      shared_by_id: user?.id,
    });

    if (error) throw error;

    await this.logAccess(documentId, 'share', { type: 'public_link' });

    return `${window.location.origin}/shared/${token}`;
  },

  /**
   * Revoke share
   */
  async revokeShare(shareId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('document_shares')
      .update({
        is_active: false,
        revoked_at: new Date().toISOString(),
        revoked_by: user?.id,
      })
      .eq('id', shareId);

    if (error) throw error;
  },

  // ========================================
  // Sync Operations
  // ========================================

  /**
   * Sync document to Pulse
   */
  async syncToPulse(documentId: string): Promise<boolean> {
    try {
      // Get document
      const doc = await this.getById(documentId);
      if (!doc) return false;

      // This would call pulseDocumentSync service
      // For now, just mark as pending sync
      await supabase
        .from('document_pulse_sync')
        .upsert({
          document_id: documentId,
          sync_status: 'pending',
          sync_direction: 'to_pulse',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'document_id',
        });

      return true;
    } catch (e) {
      console.error('Failed to sync to Pulse:', e);
      return false;
    }
  },

  /**
   * Sync all documents to Google Drive
   */
  async syncAllToGoogleDrive(): Promise<{ synced: number; errors: number }> {
    if (!googleDriveService.isConnected()) {
      throw new Error('Google Drive not connected');
    }

    const result = await googleDriveService.syncAll();

    return {
      synced: result.synced,
      errors: result.errors.length,
    };
  },

  // ========================================
  // Search
  // ========================================

  /**
   * Full-text search documents
   */
  async search(query: string): Promise<EnhancedDocument[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('status', 'active')
      .or(`name.ilike.%${query}%,tags.cs.{${query}}`)
      .order('uploaded_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return (data || []).map(dbToDocument);
  },

  // ========================================
  // Statistics
  // ========================================

  /**
   * Get document statistics
   */
  async getStats(): Promise<{
    totalDocuments: number;
    totalSize: number;
    byCategory: Record<string, number>;
    byProvider: Record<string, number>;
    recentUploads: number;
  }> {
    const { data: docs } = await supabase
      .from('documents')
      .select('category, file_size, storage_provider, uploaded_at')
      .eq('status', 'active');

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const stats = {
      totalDocuments: docs?.length || 0,
      totalSize: 0,
      byCategory: {} as Record<string, number>,
      byProvider: {} as Record<string, number>,
      recentUploads: 0,
    };

    for (const doc of docs || []) {
      stats.totalSize += doc.file_size || 0;
      stats.byCategory[doc.category || 'Other'] = (stats.byCategory[doc.category || 'Other'] || 0) + 1;
      stats.byProvider[doc.storage_provider || 'supabase'] = (stats.byProvider[doc.storage_provider || 'supabase'] || 0) + 1;

      if (new Date(doc.uploaded_at) > oneWeekAgo) {
        stats.recentUploads++;
      }
    }

    return stats;
  },
};
