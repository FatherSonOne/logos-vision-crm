// Case Service - Handles all database operations for Cases
import { supabase } from './supabaseClient';
import type { Case, CaseComment } from '../types';

// Helper function to convert database format to app format
function dbToCase(dbCase: any): Case {
  return {
    id: dbCase.id,
    title: dbCase.title,
    description: dbCase.description,
    clientId: dbCase.client_id,
    assignedToId: dbCase.assigned_to_id,
    status: dbCase.status,
    priority: dbCase.priority,
    createdAt: dbCase.created_at,
    lastUpdatedAt: dbCase.updated_at,
    activityIds: dbCase.activity_ids || [],
    documentIds: dbCase.document_ids || [],
    comments: dbCase.comments || []
  };
}

// Helper function to convert app format to database format
function caseToDb(caseData: Partial<Case>): any {
  const dbCase: any = {};

  if (caseData.id !== undefined) dbCase.id = caseData.id;
  if (caseData.title !== undefined) dbCase.title = caseData.title;
  if (caseData.description !== undefined) dbCase.description = caseData.description;
  if (caseData.clientId !== undefined) dbCase.client_id = caseData.clientId;
  if (caseData.assignedToId !== undefined) dbCase.assigned_to_id = caseData.assignedToId;
  if (caseData.status !== undefined) dbCase.status = caseData.status;
  if (caseData.priority !== undefined) dbCase.priority = caseData.priority;
  if (caseData.activityIds !== undefined) dbCase.activity_ids = caseData.activityIds;
  if (caseData.documentIds !== undefined) dbCase.document_ids = caseData.documentIds;

  return dbCase;
}

export const caseService = {
  // Get all cases
  async getAll(): Promise<Case[]> {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;

    // Fetch comments for each case
    const casesWithComments = await Promise.all(
      (data || []).map(async (dbCase) => {
        const comments = await this.getComments(dbCase.id);
        return dbToCase({ ...dbCase, comments });
      })
    );

    return casesWithComments;
  },

  // Get cases by client
  async getByClient(clientId: string): Promise<Case[]> {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('client_id', clientId)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    // Fetch comments for each case
    const casesWithComments = await Promise.all(
      (data || []).map(async (dbCase) => {
        const comments = await this.getComments(dbCase.id);
        return dbToCase({ ...dbCase, comments });
      })
    );

    return casesWithComments;
  },

  // Get cases by assigned team member
  async getByAssignedTo(teamMemberId: string): Promise<Case[]> {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('assigned_to_id', teamMemberId)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    // Fetch comments for each case
    const casesWithComments = await Promise.all(
      (data || []).map(async (dbCase) => {
        const comments = await this.getComments(dbCase.id);
        return dbToCase({ ...dbCase, comments });
      })
    );

    return casesWithComments;
  },

  // Get a single case by ID
  async getById(id: string): Promise<Case | null> {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    // Fetch comments for the case
    const comments = await this.getComments(id);
    return dbToCase({ ...data, comments });
  },

  // Create a new case
  async create(caseData: Partial<Case>): Promise<Case> {
    const now = new Date().toISOString();
    const dbCase = caseToDb(caseData);

    const { data, error } = await supabase
      .from('cases')
      .insert([{
        ...dbCase,
        created_at: now,
        updated_at: now
      }])
      .select()
      .single();

    if (error) throw error;

    // Return with empty comments array since it's new
    return dbToCase({ ...data, comments: [] });
  },

  // Update a case
  async update(id: string, updates: Partial<Case>): Promise<Case> {
    const dbUpdates = caseToDb(updates);
    dbUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('cases')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Fetch comments for the updated case
    const comments = await this.getComments(id);
    return dbToCase({ ...data, comments });
  },

  // Delete a case
  async delete(id: string): Promise<void> {
    // First delete all comments
    await this.deleteAllComments(id);

    // Then delete the case
    const { error } = await supabase
      .from('cases')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get comments for a case
  async getComments(caseId: string): Promise<CaseComment[]> {
    const { data, error } = await supabase
      .from('case_comments')
      .select('*')
      .eq('case_id', caseId)
      .order('timestamp', { ascending: true });

    if (error) throw error;

    return (data || []).map(comment => ({
      id: comment.id,
      authorId: comment.author_id,
      text: comment.text,
      timestamp: comment.timestamp
    }));
  },

  // Add a comment to a case
  async addComment(caseId: string, comment: Omit<CaseComment, 'id' | 'timestamp'>): Promise<CaseComment> {
    const { data, error } = await supabase
      .from('case_comments')
      .insert([{
        case_id: caseId,
        author_id: comment.authorId,
        text: comment.text,
        timestamp: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    // Update the case's updated_at
    await supabase
      .from('cases')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', caseId);

    return {
      id: data.id,
      authorId: data.author_id,
      text: data.text,
      timestamp: data.timestamp
    };
  },

  // Delete a comment
  async deleteComment(commentId: string, caseId: string): Promise<void> {
    const { error } = await supabase
      .from('case_comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;

    // Update the case's updated_at
    await supabase
      .from('cases')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', caseId);
  },

  // Delete all comments for a case (used before deleting a case)
  async deleteAllComments(caseId: string): Promise<void> {
    const { error } = await supabase
      .from('case_comments')
      .delete()
      .eq('case_id', caseId);

    if (error) throw error;
  },

  // Search cases
  async search(query: string): Promise<Case[]> {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    // Fetch comments for each case
    const casesWithComments = await Promise.all(
      (data || []).map(async (dbCase) => {
        const comments = await this.getComments(dbCase.id);
        return dbToCase({ ...dbCase, comments });
      })
    );

    return casesWithComments;
  },

  // Get cases by status
  async getByStatus(status: string): Promise<Case[]> {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('status', status)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    // Fetch comments for each case
    const casesWithComments = await Promise.all(
      (data || []).map(async (dbCase) => {
        const comments = await this.getComments(dbCase.id);
        return dbToCase({ ...dbCase, comments });
      })
    );

    return casesWithComments;
  },

  // Get cases by priority
  async getByPriority(priority: string): Promise<Case[]> {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('priority', priority)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    // Fetch comments for each case
    const casesWithComments = await Promise.all(
      (data || []).map(async (dbCase) => {
        const comments = await this.getComments(dbCase.id);
        return dbToCase({ ...dbCase, comments });
      })
    );

    return casesWithComments;
  }
};
