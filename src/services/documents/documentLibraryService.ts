/**
 * Document Library Service - Main Orchestrator
 * Phase 1: Foundation service layer for enterprise document management
 *
 * This service acts as the main entry point and orchestrator for all document operations,
 * integrating with AI, Pulse sync, versioning, and analytics services.
 */

import { supabase } from '../supabaseClient';
import type {
  EnhancedDocument,
  DocumentFilters,
  DocumentSearchOptions,
  SearchResults,
  UploadOptions,
  UploadProgress,
  BulkOperationResult,
  DocumentVersion,
  DocumentAnalytics,
  StorageStats,
  DocumentFolder,
  SmartCollection,
} from '../../types/documents';
import { DocumentError } from '../../types/documents';
import { processDocument as processWithAI } from './ai/documentAiService';

// ============================================================================
// Document Retrieval
// ============================================================================

/**
 * Get all documents with optional filtering
 */
export async function getDocuments(
  filters?: DocumentFilters
): Promise<EnhancedDocument[]> {
  try {
    let query = supabase
      .from('documents')
      .select(`
        *,
        folder:document_folders(*)
      `)
      .eq('status', 'active');

    // Apply filters
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.folder_id) {
      query = query.eq('folder_id', filters.folder_id);
    }

    if (filters?.project_id) {
      query = query.eq('project_id', filters.project_id);
    }

    if (filters?.client_id) {
      query = query.eq('client_id', filters.client_id);
    }

    if (filters?.storage_provider) {
      query = query.eq('storage_provider', filters.storage_provider);
    }

    if (filters?.visibility) {
      query = query.eq('visibility', filters.visibility);
    }

    if (filters?.sensitivity) {
      query = query.eq('sensitivity_level', filters.sensitivity);
    }

    if (filters?.is_pulse_synced !== undefined) {
      query = query.eq('pulse_synced', filters.is_pulse_synced);
    }

    if (filters?.created_after) {
      query = query.gte('created_at', filters.created_after.toISOString());
    }

    if (filters?.created_before) {
      query = query.lte('created_at', filters.created_before.toISOString());
    }

    if (filters?.file_types && filters.file_types.length > 0) {
      query = query.in('file_type', filters.file_types);
    }

    if (filters?.tags && filters.tags.length > 0) {
      // Join with AI metadata to filter by tags
      const { data: taggedDocs } = await supabase
        .from('document_ai_metadata')
        .select('document_id')
        .overlaps('auto_tags', filters.tags);

      if (taggedDocs && taggedDocs.length > 0) {
        const docIds = taggedDocs.map((d: any) => d.document_id);
        query = query.in('id', docIds);
      } else {
        // No documents with these tags
        return [];
      }
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,file_type.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []) as EnhancedDocument[];
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw new DocumentError('Failed to fetch documents', 'FETCH_ERROR', error);
  }
}

/**
 * Get a single document by ID with full metadata
 */
export async function getDocumentById(
  documentId: string,
  includeAI: boolean = false,
  includeAnalytics: boolean = false
): Promise<EnhancedDocument | null> {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        folder:document_folders(*),
        ${includeAI ? 'ai_metadata:document_ai_metadata(*),' : ''}
        ${includeAnalytics ? 'analytics:document_analytics(*),' : ''}
        pulse_item:document_pulse_items(*)
      `)
      .eq('id', documentId)
      .single();

    if (error) throw error;

    // Log access for analytics
    await logDocumentAccess(documentId, 'view');

    return data as EnhancedDocument;
  } catch (error) {
    console.error('Error fetching document:', error);
    return null;
  }
}

/**
 * Get documents by related entity (client, project, case)
 */
export async function getDocumentsByRelatedId(
  relatedId: string,
  relatedType?: 'client' | 'project' | 'case'
): Promise<EnhancedDocument[]> {
  try {
    let query = supabase
      .from('documents')
      .select('*')
      .eq('related_id', relatedId)
      .eq('status', 'active');

    if (relatedType) {
      query = query.eq('related_type', relatedType);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []) as EnhancedDocument[];
  } catch (error) {
    console.error('Error fetching related documents:', error);
    throw new DocumentError('Failed to fetch related documents', 'FETCH_ERROR', error);
  }
}

// ============================================================================
// Document Upload
// ============================================================================

/**
 * Upload a document with enhanced metadata
 */
export async function uploadDocument(
  file: File,
  metadata: UploadOptions,
  onProgress?: (progress: UploadProgress) => void
): Promise<EnhancedDocument> {
  const uploadProgress: UploadProgress = {
    file_name: file.name,
    bytes_uploaded: 0,
    total_bytes: file.size,
    percentage: 0,
    status: 'queued',
  };

  try {
    // Update progress
    onProgress?.(uploadProgress);

    // Generate unique file path
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const category = metadata.category || 'Internal';
    const filePath = `documents/${category}/${timestamp}_${safeName}`;

    // Upload to Supabase Storage
    uploadProgress.status = 'uploading';
    onProgress?.(uploadProgress);

    const { data: uploadData, error: uploadError } = await supabase.storage
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

    uploadProgress.percentage = 50;
    onProgress?.(uploadProgress);

    // Create document record
    const { data: { user } } = await supabase.auth.getUser();

    const documentData = {
      name: file.name,
      category: metadata.category || 'Internal',
      file_type: getFileType(file.name),
      file_size: file.size,
      mime_type: file.type,
      file_url: urlData.publicUrl,
      file_path: filePath,
      storage_provider: 'supabase' as const,
      folder_id: metadata.folder_id,
      project_id: metadata.project_id,
      client_id: metadata.client_id,
      visibility: metadata.visibility || 'team',
      sensitivity_level: metadata.sensitivity || 'normal',
      uploaded_by_id: user?.id,
      owner_id: user?.id,
      version_number: 1,
      preview_available: isPreviewable(file.name),
      ai_processed: false,
      ocr_processed: false,
      pulse_synced: false,
      status: 'active',
    };

    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert(documentData)
      .select()
      .single();

    if (docError) throw docError;

    uploadProgress.percentage = 75;
    uploadProgress.status = 'processing';
    onProgress?.(uploadProgress);

    // Create initial version record
    await createInitialVersion(document.id, urlData.publicUrl, filePath, file.size, user?.id);

    // Run AI processing if enabled
    if (metadata.run_ai_processing) {
      uploadProgress.ai_processing = {
        classification: { status: 'processing' },
        ocr: { status: 'processing' },
        tagging: { status: 'processing' },
      };
      uploadProgress.percentage = 80;
      onProgress?.(uploadProgress);

      // Process document with AI
      await processDocumentWithAI(document.id, file, uploadProgress, onProgress);
    }

    uploadProgress.percentage = 100;
    uploadProgress.status = 'complete';
    onProgress?.(uploadProgress);

    return document as EnhancedDocument;
  } catch (error) {
    uploadProgress.status = 'error';
    uploadProgress.error_message = error instanceof Error ? error.message : 'Upload failed';
    onProgress?.(uploadProgress);

    console.error('Error uploading document:', error);
    throw new DocumentError('Failed to upload document', 'UPLOAD_ERROR', error);
  }
}

/**
 * Create initial version record for a new document
 */
async function createInitialVersion(
  documentId: string,
  fileUrl: string,
  filePath: string,
  fileSize: number,
  uploadedById?: string
): Promise<void> {
  try {
    await supabase.from('document_versions').insert({
      document_id: documentId,
      version_number: 1,
      file_url: fileUrl,
      file_path: filePath,
      file_size: fileSize,
      uploaded_by_id: uploadedById,
      change_description: 'Initial upload',
    });
  } catch (error) {
    console.error('Error creating initial version:', error);
    // Don't throw - version creation is non-critical for upload
  }
}

// ============================================================================
// Document Update & Delete
// ============================================================================

/**
 * Update document metadata
 */
export async function updateDocument(
  documentId: string,
  updates: Partial<EnhancedDocument>
): Promise<void> {
  try {
    const { error } = await supabase
      .from('documents')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating document:', error);
    throw new DocumentError('Failed to update document', 'UPDATE_ERROR', error);
  }
}

/**
 * Soft delete a document
 */
export async function deleteDocument(documentId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('documents')
      .update({ status: 'deleted', deleted_at: new Date().toISOString() })
      .eq('id', documentId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting document:', error);
    throw new DocumentError('Failed to delete document', 'DELETE_ERROR', error);
  }
}

/**
 * Permanently delete a document and associated files
 */
export async function permanentlyDeleteDocument(documentId: string): Promise<void> {
  try {
    // Get document to find file path
    const { data: document } = await supabase
      .from('documents')
      .select('file_path')
      .eq('id', documentId)
      .single();

    if (!document) throw new Error('Document not found');

    // Delete from storage
    if (document.file_path) {
      await supabase.storage.from('documents').remove([document.file_path]);
    }

    // Delete from database (cascade will handle related records)
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (error) throw error;
  } catch (error) {
    console.error('Error permanently deleting document:', error);
    throw new DocumentError('Failed to permanently delete document', 'DELETE_ERROR', error);
  }
}

// ============================================================================
// Search
// ============================================================================

/**
 * Search documents (basic implementation, AI search in Phase 2)
 */
export async function searchDocuments(
  options: DocumentSearchOptions
): Promise<SearchResults> {
  const startTime = Date.now();

  try {
    let query = supabase
      .from('documents')
      .select('*, folder:document_folders(*)')
      .eq('status', 'active');

    // Text search
    if (options.query) {
      query = query.or(`name.ilike.%${options.query}%,file_type.ilike.%${options.query}%`);
    }

    // Apply filters
    if (options.filters) {
      const filtered = await getDocuments(options.filters);
      const ids = filtered.map(d => d.id);
      if (ids.length > 0) {
        query = query.in('id', ids);
      }
    }

    // Sorting
    const sortField = options.sort_by || 'created_at';
    const sortOrder = options.sort_order === 'asc' ? { ascending: true } : { ascending: false };
    query = query.order(sortField, sortOrder);

    // Pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;

    const processingTime = Date.now() - startTime;

    return {
      results: (data || []).map((doc: any) => ({
        document: doc as EnhancedDocument,
        relevance_score: 1.0, // Basic search doesn't calculate relevance
        matched_fields: ['name'],
      })),
      total_count: data?.length || 0,
      query: options.query,
      processing_time_ms: processingTime,
      ai_used: false,
    };
  } catch (error) {
    console.error('Error searching documents:', error);
    throw new DocumentError('Failed to search documents', 'SEARCH_ERROR', error);
  }
}

// ============================================================================
// Analytics
// ============================================================================

/**
 * Log document access for analytics
 */
export async function logDocumentAccess(
  documentId: string,
  action: 'view' | 'download' | 'share' | 'preview'
): Promise<void> {
  try {
    const field = `${action}_count`;
    const timestampField = `last_${action === 'view' ? 'viewed' : action === 'download' ? 'downloaded' : 'shared'}_at`;

    // Get current analytics
    const { data: current } = await supabase
      .from('document_analytics')
      .select(field)
      .eq('document_id', documentId)
      .single();

    // Update with incremented value
    await supabase
      .from('document_analytics')
      .update({
        [field]: (current?.[field] || 0) + 1,
        [timestampField]: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('document_id', documentId);
  } catch (error) {
    console.error('Error logging document access:', error);
    // Non-critical, don't throw
  }
}

/**
 * Get storage statistics
 */
export async function getStorageStats(): Promise<StorageStats> {
  try {
    const { data: documents } = await supabase
      .from('documents')
      .select('category, file_type, file_size, storage_provider')
      .eq('status', 'active');

    if (!documents) {
      return {
        total_size_bytes: 0,
        total_documents: 0,
        by_category: {},
        by_provider: {} as any,
        by_type: {},
      };
    }

    const stats: StorageStats = {
      total_size_bytes: documents.reduce((sum, doc) => sum + (doc.file_size || 0), 0),
      total_documents: documents.length,
      by_category: {},
      by_provider: {} as any,
      by_type: {},
    };

    documents.forEach(doc => {
      // By category
      if (!stats.by_category[doc.category]) {
        stats.by_category[doc.category] = { count: 0, size_bytes: 0 };
      }
      stats.by_category[doc.category].count++;
      stats.by_category[doc.category].size_bytes += doc.file_size || 0;

      // By provider
      const provider = doc.storage_provider || 'supabase';
      if (!stats.by_provider[provider]) {
        stats.by_provider[provider] = { count: 0, size_bytes: 0 };
      }
      stats.by_provider[provider].count++;
      stats.by_provider[provider].size_bytes += doc.file_size || 0;

      // By type
      if (!stats.by_type[doc.file_type]) {
        stats.by_type[doc.file_type] = { count: 0, size_bytes: 0 };
      }
      stats.by_type[doc.file_type].count++;
      stats.by_type[doc.file_type].size_bytes += doc.file_size || 0;
    });

    return stats;
  } catch (error) {
    console.error('Error getting storage stats:', error);
    throw new DocumentError('Failed to get storage stats', 'STATS_ERROR', error);
  }
}

// ============================================================================
// AI Processing
// ============================================================================

/**
 * Process document with AI and save results to database
 */
async function processDocumentWithAI(
  documentId: string,
  file: File,
  uploadProgress: UploadProgress,
  onProgress?: (progress: UploadProgress) => void
): Promise<void> {
  try {
    // Run AI processing
    const aiResult = await processWithAI(file, {
      classify: true,
      extractText: true,
      generateSummary: true,
      suggestTags: true,
    });

    if (!aiResult) {
      // AI not available or failed
      uploadProgress.ai_processing = {
        classification: { status: 'error' },
        ocr: { status: 'error' },
        tagging: { status: 'error' },
      };
      onProgress?.(uploadProgress);
      return;
    }

    // Save AI metadata to database
    await supabase.from('document_ai_metadata').insert({
      document_id: documentId,
      extracted_text: aiResult.extracted_text,
      language_detected: aiResult.language_detected,
      extraction_confidence: aiResult.extraction_confidence,
      classification_category: aiResult.classification_category,
      classification_confidence: aiResult.classification_confidence,
      classification_reasoning: aiResult.classification_reasoning,
      auto_tags: aiResult.auto_tags || [],
      suggested_tags: aiResult.suggested_tags || [],
      detected_entities: aiResult.detected_entities || {},
      ai_summary: aiResult.ai_summary,
      key_points: aiResult.key_points || [],
      processing_time_ms: aiResult.processing_time_ms,
      ai_model_used: aiResult.ai_model_used,
      processed_at: aiResult.processed_at,
    });

    // Update document flags
    await supabase.from('documents').update({
      ai_processed: true,
      ocr_processed: !!aiResult.extracted_text,
    }).eq('id', documentId);

    // Update progress
    uploadProgress.ai_processing = {
      classification: { status: 'complete' },
      ocr: { status: 'complete' },
      tagging: { status: 'complete' },
    };
    uploadProgress.percentage = 95;
    onProgress?.(uploadProgress);
  } catch (error) {
    console.error('Error processing document with AI:', error);
    uploadProgress.ai_processing = {
      classification: { status: 'error' },
      ocr: { status: 'error' },
      tagging: { status: 'error' },
    };
    onProgress?.(uploadProgress);
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Determine file type category from filename
 */
function getFileType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  const typeMap: Record<string, string> = {
    // Documents
    pdf: 'pdf',
    doc: 'docx',
    docx: 'docx',
    txt: 'other',
    rtf: 'other',

    // Spreadsheets
    xls: 'xlsx',
    xlsx: 'xlsx',
    csv: 'xlsx',

    // Presentations
    ppt: 'pptx',
    pptx: 'pptx',

    // Images
    jpg: 'image',
    jpeg: 'image',
    png: 'image',
    gif: 'image',
    bmp: 'image',
    svg: 'image',
    webp: 'image',

    // Other
    zip: 'other',
    rar: 'other',
    '7z': 'other',
  };

  return typeMap[ext] || 'other';
}

/**
 * Check if file type supports preview
 */
function isPreviewable(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const previewableTypes = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'txt', 'md'];
  return previewableTypes.includes(ext);
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
