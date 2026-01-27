// Document Service - Handles document storage and database operations
import { supabase } from './supabaseClient';
import { logActivity } from './collaborationService';
import type { Document as AppDocument, TeamMember } from '../types';

const STORAGE_BUCKET = 'documents';

// Helper function to convert database format to app format
function dbToDocument(dbDoc: any): AppDocument {
  return {
    id: dbDoc.id,
    name: dbDoc.name,
    category: dbDoc.category,
    relatedId: dbDoc.related_id,
    uploadedById: dbDoc.uploaded_by,
    lastModified: dbDoc.uploaded_at,
    size: dbDoc.file_size || '0 KB',
    fileType: dbDoc.file_type || 'other',
    // Add extended fields from database
    file_url: dbDoc.file_url,
    file_type: dbDoc.file_type,
    file_size: typeof dbDoc.file_size === 'number' ? dbDoc.file_size : 0,
    created_at: dbDoc.created_at || dbDoc.uploaded_at,
    updated_at: dbDoc.updated_at || dbDoc.uploaded_at,
    uploaded_at: dbDoc.uploaded_at,
    uploaded_by_id: dbDoc.uploaded_by,
    project_id: dbDoc.project_id,
    client_id: dbDoc.client_id,
  };
}

export const documentService = {
  // Get all documents
  async getAll(): Promise<AppDocument[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(dbToDocument);
  },

  // Get documents by related entity (client, project, case, etc.)
  async getByRelatedId(relatedId: string): Promise<AppDocument[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('related_id', relatedId)
      .order('uploaded_at', { ascending: false});

    if (error) throw error;
    return (data || []).map(dbToDocument);
  },

  // Get documents by category
  async getByCategory(category: string): Promise<AppDocument[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('category', category)
      .order('uploaded_at', { ascending: false});

    if (error) throw error;
    return (data || []).map(dbToDocument);
  },

  // Upload a file to Supabase Storage and create document record
  async upload(
    file: File,
    metadata: {
      category: string;
      relatedId: string;
      uploadedBy: string;
    },
    currentUser?: TeamMember
  ): Promise<AppDocument> {
    // Generate unique file name
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}_${file.name}`;
    const filePath = `${metadata.category}/${fileName}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    // Create document record in database
    const { data, error } = await supabase
      .from('documents')
      .insert([{
        name: file.name,
        category: metadata.category,
        related_id: metadata.relatedId,
        uploaded_by: metadata.uploadedBy,
        uploaded_at: new Date().toISOString(),
        file_url: publicUrl,
        file_size: file.size,
        file_type: file.type
      }])
      .select()
      .single();

    if (error) {
      // If database insert fails, delete the uploaded file
      await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
      throw error;
    }

    const newDocument = dbToDocument(data);

    // Log activity
    if (currentUser) {
      try {
        await logActivity({
          entityType: 'document',
          entityId: newDocument.id,
          action: 'created',
          actor: currentUser,
          description: `Created document: ${file.name}`,
          metadata: {
            category: metadata.category,
            fileType: file.type,
            size: file.size,
          }
        });
      } catch (error) {
        console.error('Failed to log document creation activity:', error);
      }
    }

    return newDocument;
  },

  // Download a document
  async download(fileUrl: string, fileName: string): Promise<void> {
    // Extract file path from URL
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split('/');
    const filePath = pathParts.slice(pathParts.indexOf(STORAGE_BUCKET) + 1).join('/');

    // Download file from storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(filePath);

    if (error) throw error;

    // Create download link
    const blob = new Blob([data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },

  // Delete a document
  async delete(
    documentId: string,
    fileUrl: string,
    currentUser?: TeamMember
  ): Promise<void> {
    // Get document details before deletion
    const { data: docData, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (fetchError) throw fetchError;
    const document = dbToDocument(docData);

    // Extract file path from URL
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split('/');
    const filePath = pathParts.slice(pathParts.indexOf(STORAGE_BUCKET) + 1).join('/');

    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (storageError) throw storageError;

    // Delete document record from database
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (dbError) throw dbError;

    // Log activity
    if (currentUser) {
      try {
        await logActivity({
          entityType: 'document',
          entityId: documentId,
          action: 'deleted',
          actor: currentUser,
          description: `Deleted document: ${document.name}`,
          metadata: {
            category: document.category,
            fileType: document.fileType,
          }
        });
      } catch (error) {
        console.error('Failed to log document deletion activity:', error);
      }
    }
  },

  // Update document metadata
  async update(
    documentId: string,
    updates: Partial<AppDocument>,
    currentUser?: TeamMember
  ): Promise<AppDocument> {
    // Get old document first
    const { data: oldData, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (fetchError) throw fetchError;
    const oldDocument = dbToDocument(oldData);

    const updateData: any = {};

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.relatedId !== undefined) updateData.related_id = updates.relatedId;

    const { data, error } = await supabase
      .from('documents')
      .update(updateData)
      .eq('id', documentId)
      .select()
      .single();

    if (error) throw error;
    const updatedDocument = dbToDocument(data);

    // Calculate changes
    const changes: Record<string, { old: any; new: any }> = {};
    const relevantFields = ['name', 'category', 'relatedId'];
    for (const field of relevantFields) {
      if (field in updates && oldDocument[field] !== updates[field]) {
        changes[field] = { old: oldDocument[field], new: updates[field] };
      }
    }

    // Log activity
    if (currentUser && Object.keys(changes).length > 0) {
      try {
        await logActivity({
          entityType: 'document',
          entityId: documentId,
          action: 'updated',
          actor: currentUser,
          description: `Updated document: ${updatedDocument.name}`,
          changes
        });
      } catch (error) {
        console.error('Failed to log document update activity:', error);
      }
    }

    return updatedDocument;
  },

  // Search documents
  async search(query: string): Promise<AppDocument[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(dbToDocument);
  },

  // Update document version (for version control)
  async updateVersion(
    documentId: string,
    newVersion: string,
    currentUser?: TeamMember
  ): Promise<void> {
    // Get document details
    const { data: docData, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (fetchError) throw fetchError;
    const document = dbToDocument(docData);

    // Note: This assumes there's a version field in the database
    // If not present, this will need to be adjusted when version control is implemented
    const oldVersion = (docData as any).version || '1.0';

    // Update version in database (if version field exists)
    const { error: updateError } = await supabase
      .from('documents')
      .update({ version: newVersion })
      .eq('id', documentId);

    if (updateError) {
      console.warn('Version field may not exist in database:', updateError);
    }

    // Log activity
    if (currentUser) {
      try {
        await logActivity({
          entityType: 'document',
          entityId: documentId,
          action: 'updated',
          actor: currentUser,
          description: `Updated document version: ${document.name}`,
          metadata: {
            oldVersion: oldVersion,
            newVersion: newVersion,
          }
        });
      } catch (error) {
        console.error('Failed to log document version activity:', error);
      }
    }
  }
};
