// Document Service - Handles document storage and database operations
import { supabase } from './supabaseClient';
import type { Document as AppDocument } from '../types';

const STORAGE_BUCKET = 'documents';

// Helper function to convert database format to app format
function dbToDocument(dbDoc: any): AppDocument {
  return {
    id: dbDoc.id,
    name: dbDoc.name,
    category: dbDoc.category,
    relatedId: dbDoc.related_id,
    uploadedBy: dbDoc.uploaded_by,
    uploadDate: dbDoc.upload_date,
    fileUrl: dbDoc.file_url,
    fileSize: dbDoc.file_size,
    fileType: dbDoc.file_type
  };
}

export const documentService = {
  // Get all documents
  async getAll(): Promise<AppDocument[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('upload_date', { ascending: false });

    if (error) throw error;
    return (data || []).map(dbToDocument);
  },

  // Get documents by related entity (client, project, case, etc.)
  async getByRelatedId(relatedId: string): Promise<AppDocument[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('related_id', relatedId)
      .order('upload_date', { ascending: false});

    if (error) throw error;
    return (data || []).map(dbToDocument);
  },

  // Get documents by category
  async getByCategory(category: string): Promise<AppDocument[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('category', category)
      .order('upload_date', { ascending: false});

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
    }
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
        upload_date: new Date().toISOString(),
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

    return dbToDocument(data);
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
  async delete(documentId: string, fileUrl: string): Promise<void> {
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
  },

  // Update document metadata
  async update(documentId: string, updates: Partial<AppDocument>): Promise<AppDocument> {
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
    return dbToDocument(data);
  },

  // Search documents
  async search(query: string): Promise<AppDocument[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('upload_date', { ascending: false });

    if (error) throw error;
    return (data || []).map(dbToDocument);
  }
};
