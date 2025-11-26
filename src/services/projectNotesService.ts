// Project Notes Service - Handles collaboration notes for projects
import { supabase } from './supabaseClient';

export interface ProjectNote {
  id: string;
  projectId: string;
  content: string;
  authorId: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ProjectActivity {
  id: string;
  projectId: string;
  userId: string;
  type: string;
  description: string;
  createdAt: string;
}

// Helper function to convert database format to app format
function dbToNote(dbNote: any): ProjectNote {
  return {
    id: dbNote.id,
    projectId: dbNote.project_id,
    content: dbNote.content,
    authorId: dbNote.author_id || '',
    isPinned: dbNote.is_pinned || false,
    createdAt: dbNote.created_at,
    updatedAt: dbNote.updated_at
  };
}

function dbToActivity(dbActivity: any): ProjectActivity {
  return {
    id: dbActivity.id,
    projectId: dbActivity.project_id,
    userId: dbActivity.user_id || '',
    type: dbActivity.type,
    description: dbActivity.description,
    createdAt: dbActivity.created_at
  };
}

export const projectNotesService = {
  // Get all notes for a project
  async getByProject(projectId: string): Promise<ProjectNote[]> {
    const { data, error } = await supabase
      .from('project_notes')
      .select('*')
      .eq('project_id', projectId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching project notes:', error);
      throw error;
    }
    
    return (data || []).map(dbToNote);
  },

  // Create a new note
  async create(note: Partial<ProjectNote>): Promise<ProjectNote> {
    const { data, error } = await supabase
      .from('project_notes')
      .insert([{
        project_id: note.projectId,
        content: note.content,
        author_id: note.authorId || null,
        is_pinned: note.isPinned || false
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating note:', error);
      throw error;
    }
    
    return dbToNote(data);
  },

  // Update a note
  async update(id: string, updates: Partial<ProjectNote>): Promise<ProjectNote> {
    const updateData: any = {};
    
    if (updates.content !== undefined) updateData.content = updates.content;
    if (updates.isPinned !== undefined) updateData.is_pinned = updates.isPinned;
    
    const { data, error } = await supabase
      .from('project_notes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating note:', error);
      throw error;
    }
    
    return dbToNote(data);
  },

  // Delete a note
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('project_notes')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }
};

export const projectActivitiesService = {
  // Get activities for a project
  async getByProject(projectId: string, limit = 50): Promise<ProjectActivity[]> {
    const { data, error } = await supabase
      .from('project_activities')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching project activities:', error);
      throw error;
    }
    
    return (data || []).map(dbToActivity);
  },

  // Log an activity
  async log(activity: Partial<ProjectActivity>): Promise<ProjectActivity> {
    const { data, error } = await supabase
      .from('project_activities')
      .insert([{
        project_id: activity.projectId,
        user_id: activity.userId || null,
        type: activity.type,
        description: activity.description
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
    
    return dbToActivity(data);
  }
};
