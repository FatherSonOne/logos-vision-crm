// Google Drive Integration Service
// Handles OAuth, file operations, and sync with Logos Vision documents

import { supabase } from './supabaseClient';

// Types
export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
  parents?: string[];
  shared?: boolean;
  trashed?: boolean;
}

export interface GoogleDriveFolder {
  id: string;
  name: string;
  parents?: string[];
}

export interface SyncResult {
  success: boolean;
  synced: number;
  errors: string[];
  details: Array<{
    name: string;
    status: 'synced' | 'error' | 'skipped';
    error?: string;
  }>;
}

interface GoogleDriveConfig {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  rootFolderId?: string;
}

// Google API endpoints
const GOOGLE_DRIVE_API = 'https://www.googleapis.com/drive/v3';
const GOOGLE_OAUTH_TOKEN = 'https://oauth2.googleapis.com/token';

// Get config from environment
// Reuse the same OAuth credentials and redirect URI as Google Calendar
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '';

// For localhost development, always use the current origin to avoid port mismatch issues
// For production, use the configured redirect URI or derive from origin
const getRedirectUri = () => {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return `${window.location.origin}/auth/callback`;
  }
  return import.meta.env.VITE_GOOGLE_REDIRECT_URI || `${window.location.origin}/auth/callback`;
};
const GOOGLE_REDIRECT_URI = getRedirectUri();

class GoogleDriveService {
  private config: GoogleDriveConfig | null = null;
  private userId: string | null = null;

  // ========================================
  // Authentication
  // ========================================

  /**
   * Generate OAuth URL for Google Drive authorization
   */
  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/drive.file', // Access to files created by this app
      'https://www.googleapis.com/auth/drive.metadata.readonly', // Read metadata
    ];

    // Get redirect URI fresh each time to ensure it matches current origin
    const redirectUri = typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? `${window.location.origin}/auth/callback`
      : (import.meta.env.VITE_GOOGLE_REDIRECT_URI || `${window.location.origin}/auth/callback`);

    console.log('Google Drive OAuth - redirect_uri:', redirectUri);
    console.log('Google Drive OAuth - client_id:', GOOGLE_CLIENT_ID);

    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state: 'google_drive_connect',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<GoogleDriveConfig> {
    const response = await fetch(GOOGLE_OAUTH_TOKEN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: GOOGLE_REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || 'Failed to exchange code for tokens');
    }

    const data = await response.json();

    this.config = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + (data.expires_in * 1000),
    };

    // Save to database
    await this.saveConfig();

    return this.config;
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<void> {
    if (!this.config?.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(GOOGLE_OAUTH_TOKEN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: this.config.refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh access token');
    }

    const data = await response.json();

    this.config = {
      ...this.config,
      accessToken: data.access_token,
      expiresAt: Date.now() + (data.expires_in * 1000),
    };

    await this.saveConfig();
  }

  /**
   * Get valid access token, refreshing if needed
   */
  private async getValidToken(): Promise<string> {
    if (!this.config) {
      await this.loadConfig();
    }

    if (!this.config?.accessToken) {
      throw new Error('Not authenticated with Google Drive');
    }

    // Check if token is expired or will expire in next 5 minutes
    if (this.config.expiresAt && this.config.expiresAt < Date.now() + 300000) {
      await this.refreshAccessToken();
    }

    return this.config.accessToken;
  }

  /**
   * Save config to database
   */
  private async saveConfig(): Promise<void> {
    if (!this.config || !this.userId) return;

    const { error } = await supabase
      .from('google_drive_config')
      .upsert({
        user_id: this.userId,
        access_token: this.config.accessToken,
        refresh_token: this.config.refreshToken,
        token_expires_at: this.config.expiresAt ? new Date(this.config.expiresAt).toISOString() : null,
        root_folder_id: this.config.rootFolderId,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (error) {
      console.error('Failed to save Google Drive config:', error);
    }
  }

  /**
   * Load config from database
   */
  private async loadConfig(): Promise<void> {
    if (!this.userId) return;

    const { data, error } = await supabase
      .from('google_drive_config')
      .select('*')
      .eq('user_id', this.userId)
      .single();

    if (error || !data) {
      this.config = null;
      return;
    }

    this.config = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.token_expires_at ? new Date(data.token_expires_at).getTime() : undefined,
      rootFolderId: data.root_folder_id,
    };
  }

  /**
   * Initialize service with user ID
   */
  async init(userId: string): Promise<boolean> {
    this.userId = userId;
    await this.loadConfig();
    return this.isConnected();
  }

  /**
   * Check if connected to Google Drive
   */
  isConnected(): boolean {
    return !!(this.config?.accessToken);
  }

  /**
   * Disconnect from Google Drive
   */
  async disconnect(): Promise<void> {
    if (!this.userId) return;

    await supabase
      .from('google_drive_config')
      .delete()
      .eq('user_id', this.userId);

    this.config = null;
  }

  // ========================================
  // File Operations
  // ========================================

  /**
   * Make authenticated request to Google Drive API
   */
  private async apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getValidToken();

    const response = await fetch(`${GOOGLE_DRIVE_API}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `Google Drive API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * List files in a folder
   */
  async listFiles(folderId?: string, pageToken?: string): Promise<{
    files: GoogleDriveFile[];
    nextPageToken?: string;
  }> {
    const parentId = folderId || this.config?.rootFolderId || 'root';

    const params = new URLSearchParams({
      q: `'${parentId}' in parents and trashed = false`,
      fields: 'nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink, thumbnailLink, parents, shared)',
      pageSize: '100',
      orderBy: 'modifiedTime desc',
    });

    if (pageToken) {
      params.set('pageToken', pageToken);
    }

    return this.apiRequest(`/files?${params.toString()}`);
  }

  /**
   * Get file metadata
   */
  async getFile(fileId: string): Promise<GoogleDriveFile> {
    return this.apiRequest(`/files/${fileId}?fields=id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink,parents,shared`);
  }

  /**
   * Upload file to Google Drive
   */
  async uploadFile(
    file: File,
    folderId?: string,
    onProgress?: (progress: number) => void
  ): Promise<GoogleDriveFile> {
    const token = await this.getValidToken();
    const parentId = folderId || this.config?.rootFolderId || 'root';

    // Use multipart upload for files under 5MB
    if (file.size < 5 * 1024 * 1024) {
      return this.uploadFileMultipart(file, parentId, token);
    }

    // Use resumable upload for larger files
    return this.uploadFileResumable(file, parentId, token, onProgress);
  }

  private async uploadFileMultipart(
    file: File,
    parentId: string,
    token: string
  ): Promise<GoogleDriveFile> {
    const metadata = {
      name: file.name,
      parents: [parentId],
    };

    const formData = new FormData();
    formData.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    );
    formData.append('file', file);

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,webViewLink,webContentLink',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload file to Google Drive');
    }

    return response.json();
  }

  private async uploadFileResumable(
    file: File,
    parentId: string,
    token: string,
    onProgress?: (progress: number) => void
  ): Promise<GoogleDriveFile> {
    // Step 1: Initiate resumable upload
    const metadata = {
      name: file.name,
      parents: [parentId],
    };

    const initResponse = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Upload-Content-Type': file.type,
          'X-Upload-Content-Length': file.size.toString(),
        },
        body: JSON.stringify(metadata),
      }
    );

    if (!initResponse.ok) {
      throw new Error('Failed to initiate upload');
    }

    const uploadUrl = initResponse.headers.get('Location');
    if (!uploadUrl) {
      throw new Error('No upload URL returned');
    }

    // Step 2: Upload file content
    const chunkSize = 256 * 1024; // 256KB chunks
    let offset = 0;

    while (offset < file.size) {
      const chunk = file.slice(offset, offset + chunkSize);
      const end = Math.min(offset + chunkSize, file.size);

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Length': chunk.size.toString(),
          'Content-Range': `bytes ${offset}-${end - 1}/${file.size}`,
        },
        body: chunk,
      });

      if (uploadResponse.status === 200 || uploadResponse.status === 201) {
        // Upload complete
        return uploadResponse.json();
      }

      if (uploadResponse.status !== 308) {
        throw new Error('Upload failed');
      }

      offset = end;
      onProgress?.(Math.round((offset / file.size) * 100));
    }

    throw new Error('Upload did not complete');
  }

  /**
   * Download file from Google Drive
   */
  async downloadFile(fileId: string): Promise<Blob> {
    const token = await this.getValidToken();

    const response = await fetch(
      `${GOOGLE_DRIVE_API}/files/${fileId}?alt=media`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to download file');
    }

    return response.blob();
  }

  /**
   * Delete file from Google Drive
   */
  async deleteFile(fileId: string): Promise<void> {
    const token = await this.getValidToken();

    const response = await fetch(`${GOOGLE_DRIVE_API}/files/${fileId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok && response.status !== 204) {
      throw new Error('Failed to delete file');
    }
  }

  /**
   * Create folder in Google Drive
   */
  async createFolder(name: string, parentId?: string): Promise<GoogleDriveFolder> {
    const token = await this.getValidToken();
    const parent = parentId || this.config?.rootFolderId || 'root';

    const response = await fetch(`${GOOGLE_DRIVE_API}/files`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parent],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create folder');
    }

    return response.json();
  }

  /**
   * Set root folder for sync
   */
  async setRootFolder(folderId: string): Promise<void> {
    if (this.config) {
      this.config.rootFolderId = folderId;
      await this.saveConfig();
    }
  }

  // ========================================
  // Sync Operations
  // ========================================

  /**
   * Sync document from Logos to Google Drive
   */
  async syncToGoogleDrive(document: {
    id: string;
    name: string;
    file_url: string;
    category?: string;
  }): Promise<{ success: boolean; googleDriveId?: string; error?: string }> {
    try {
      // Download file from Supabase
      const response = await fetch(document.file_url);
      if (!response.ok) {
        throw new Error('Failed to fetch document from storage');
      }

      const blob = await response.blob();
      const file = new File([blob], document.name, { type: blob.type });

      // Create category folder if needed
      let folderId = this.config?.rootFolderId;
      if (document.category) {
        const folders = await this.listFiles(folderId);
        const categoryFolder = folders.files.find(
          f => f.name === document.category && f.mimeType === 'application/vnd.google-apps.folder'
        );

        if (categoryFolder) {
          folderId = categoryFolder.id;
        } else {
          const newFolder = await this.createFolder(document.category, folderId);
          folderId = newFolder.id;
        }
      }

      // Upload to Google Drive
      const driveFile = await this.uploadFile(file, folderId);

      // Update document record with Google Drive ID
      await supabase
        .from('documents')
        .update({
          google_drive_id: driveFile.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', document.id);

      return { success: true, googleDriveId: driveFile.id };
    } catch (error) {
      console.error('Sync to Google Drive failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Sync file from Google Drive to Logos Vision
   */
  async syncFromGoogleDrive(
    driveFile: GoogleDriveFile,
    category: string = 'Internal'
  ): Promise<{ success: boolean; documentId?: string; error?: string }> {
    try {
      // Download from Google Drive
      const blob = await this.downloadFile(driveFile.id);

      // Upload to Supabase Storage
      const filePath = `gdrive_sync/${Date.now()}_${driveFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, blob, { upsert: false });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Create document record
      const { data, error: dbError } = await supabase
        .from('documents')
        .insert({
          name: driveFile.name,
          file_type: driveFile.mimeType,
          file_url: urlData?.publicUrl || filePath,
          file_size: driveFile.size,
          category,
          google_drive_id: driveFile.id,
          storage_provider: 'google_drive',
          uploaded_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (dbError) {
        throw dbError;
      }

      return { success: true, documentId: data.id };
    } catch (error) {
      console.error('Sync from Google Drive failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Perform full bidirectional sync
   */
  async syncAll(): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      synced: 0,
      errors: [],
      details: [],
    };

    try {
      // Get documents to sync to Google Drive
      const { data: logosDocuments } = await supabase
        .from('documents')
        .select('*')
        .eq('sync_enabled', true)
        .is('google_drive_id', null);

      // Sync each to Google Drive
      for (const doc of logosDocuments || []) {
        const syncResult = await this.syncToGoogleDrive(doc);
        if (syncResult.success) {
          result.synced++;
          result.details.push({ name: doc.name, status: 'synced' });
        } else {
          result.errors.push(`${doc.name}: ${syncResult.error}`);
          result.details.push({ name: doc.name, status: 'error', error: syncResult.error });
        }
      }

      // Get new files from Google Drive
      const { files: driveFiles } = await this.listFiles();

      // Find files not yet in Logos
      const { data: existingDocs } = await supabase
        .from('documents')
        .select('google_drive_id')
        .not('google_drive_id', 'is', null);

      const existingIds = new Set((existingDocs || []).map(d => d.google_drive_id));

      for (const file of driveFiles) {
        if (file.mimeType === 'application/vnd.google-apps.folder') continue;
        if (existingIds.has(file.id)) continue;

        const syncResult = await this.syncFromGoogleDrive(file);
        if (syncResult.success) {
          result.synced++;
          result.details.push({ name: file.name, status: 'synced' });
        } else {
          result.errors.push(`${file.name}: ${syncResult.error}`);
          result.details.push({ name: file.name, status: 'error', error: syncResult.error });
        }
      }

      // Update last sync time
      if (this.userId) {
        await supabase
          .from('google_drive_config')
          .update({
            last_sync_at: new Date().toISOString(),
            last_sync_status: result.errors.length > 0 ? 'partial' : 'success',
          })
          .eq('user_id', this.userId);
      }

    } catch (error) {
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    return result;
  }
}

// Export singleton instance
export const googleDriveService = new GoogleDriveService();
