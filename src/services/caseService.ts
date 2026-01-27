// Case Service - Handles all database operations for Cases
import { supabase } from './supabaseClient';
import type { Case, CaseComment, TeamMember } from '../types';
import { logActivity } from './collaborationService';

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
  async create(caseData: Partial<Case>, currentUser?: TeamMember): Promise<Case> {
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

    const newCase = dbToCase({ ...data, comments: [] });

    // Log activity
    if (currentUser) {
      try {
        await logActivity({
          entityType: 'case',
          entityId: newCase.id,
          action: 'created',
          actor: currentUser,
          description: `Created case: ${caseData.title}`,
          metadata: {
            status: caseData.status,
            priority: caseData.priority,
            clientId: caseData.clientId,
          }
        });
      } catch (error) {
        console.error('Failed to log case creation activity:', error);
      }
    }

    // Return with empty comments array since it's new
    return newCase;
  },

  // Update a case
  async update(id: string, updates: Partial<Case>, currentUser?: TeamMember): Promise<Case> {
    // Get the old case data first for comparison
    const oldCase = await this.getById(id);
    if (!oldCase) throw new Error('Case not found');

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
    const updatedCase = dbToCase({ ...data, comments });

    // Log activity if currentUser is provided
    if (currentUser) {
      try {
        // Calculate changes
        const changes: Record<string, { old: any; new: any }> = {};
        const relevantFields = ['title', 'description', 'status', 'priority', 'assignedToId', 'clientId'];

        for (const field of relevantFields) {
          if (field in updates && oldCase[field as keyof Case] !== updates[field as keyof Case]) {
            changes[field] = {
              old: oldCase[field as keyof Case],
              new: updates[field as keyof Case]
            };
          }
        }

        // Special handling for status changes
        if ('status' in changes) {
          await logActivity({
            entityType: 'case',
            entityId: id,
            action: 'status_changed',
            actor: currentUser,
            description: `Changed case status from ${changes.status.old} to ${changes.status.new}`,
            metadata: { oldStatus: changes.status.old, newStatus: changes.status.new }
          });
        }

        // Special handling for priority changes
        if ('priority' in changes) {
          await logActivity({
            entityType: 'case',
            entityId: id,
            action: 'priority_changed',
            actor: currentUser,
            description: `Changed case priority from ${changes.priority.old} to ${changes.priority.new}`,
            metadata: { oldPriority: changes.priority.old, newPriority: changes.priority.new }
          });
        }

        // Special handling for assignment changes
        if ('assignedToId' in changes) {
          await logActivity({
            entityType: 'case',
            entityId: id,
            action: 'assigned',
            actor: currentUser,
            description: changes.assignedToId.new
              ? `Assigned case to team member`
              : `Unassigned case`,
            metadata: { assignedToId: changes.assignedToId.new }
          });
        }

        // Log general update if there are other changes
        const otherChanges = { ...changes };
        delete otherChanges.status;
        delete otherChanges.priority;
        delete otherChanges.assignedToId;

        if (Object.keys(otherChanges).length > 0) {
          await logActivity({
            entityType: 'case',
            entityId: id,
            action: 'updated',
            actor: currentUser,
            description: `Updated case: ${updatedCase.title}`,
            changes: otherChanges
          });
        }
      } catch (error) {
        console.error('Failed to log case update activity:', error);
      }
    }

    return updatedCase;
  },

  // Delete a case
  async delete(id: string, currentUser?: TeamMember): Promise<void> {
    // Get case info before deletion for logging
    const caseItem = currentUser ? await this.getById(id) : null;

    // First delete all comments
    await this.deleteAllComments(id);

    // Then delete the case
    const { error } = await supabase
      .from('cases')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Log activity
    if (currentUser && caseItem) {
      try {
        await logActivity({
          entityType: 'case',
          entityId: id,
          action: 'deleted',
          actor: currentUser,
          description: `Deleted case: ${caseItem.title}`,
          metadata: {
            status: caseItem.status,
            priority: caseItem.priority,
          }
        });
      } catch (error) {
        console.error('Failed to log case deletion activity:', error);
      }
    }
  },

  // Get comments for a case
  async getComments(caseId: string): Promise<CaseComment[]> {
    const { data, error } = await supabase
      .from('case_comments')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map(comment => ({
      id: comment.id,
      authorId: comment.author_id,
      text: comment.content,
      timestamp: comment.created_at
    }));
  },

  // Add a comment to a case
  async addComment(caseId: string, comment: Omit<CaseComment, 'id' | 'timestamp'>, currentUser?: TeamMember): Promise<CaseComment> {
    const { data, error } = await supabase
      .from('case_comments')
      .insert([{
        case_id: caseId,
        author_id: comment.authorId,
        content: comment.text,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    // Update the case's updated_at
    await supabase
      .from('cases')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', caseId);

    const newComment = {
      id: data.id,
      authorId: data.author_id,
      text: data.content,
      timestamp: data.created_at
    };

    // Log activity (legacy comment - new system uses CommentThread which logs automatically)
    if (currentUser) {
      try {
        await logActivity({
          entityType: 'case',
          entityId: caseId,
          action: 'commented',
          actor: currentUser,
          description: `Added a comment`,
          metadata: {
            commentId: newComment.id,
            preview: comment.text.substring(0, 100)
          }
        });
      } catch (error) {
        console.error('Failed to log case comment activity:', error);
      }
    }

    return newComment;
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
