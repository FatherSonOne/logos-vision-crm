// Activity Service - Handles all database operations for Activities
import { supabase } from './supabaseClient';
import type { Activity } from '../types';

// Helper function to convert database format to app format
function dbToActivity(dbActivity: any): Activity {
  return {
    id: dbActivity.id,
    type: dbActivity.type,
    title: dbActivity.title,
    projectId: dbActivity.project_id,
    clientId: dbActivity.client_id,
    caseId: dbActivity.case_id,
    activityDate: dbActivity.activity_date,
    activityTime: dbActivity.activity_time,
    status: dbActivity.status,
    notes: dbActivity.notes,
    createdById: dbActivity.created_by_id,
    sharedWithClient: dbActivity.shared_with_client || false
  };
}

export const activityService = {
  // Get all activities
  async getAll(): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('activity_date', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(dbToActivity);
  },

  // Get activities by client
  async getByClient(clientId: string): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('client_id', clientId)
      .order('activity_date', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(dbToActivity);
  },

  // Get activities by project
  async getByProject(projectId: string): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('project_id', projectId)
      .order('activity_date', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(dbToActivity);
  },

  // Create a new activity
  async create(activity: Partial<Activity>): Promise<Activity> {
    const { data, error } = await supabase
      .from('activities')
      .insert([{
        id: activity.id, // Keep the mock ID for migration
        type: activity.type,
        title: activity.title,
        project_id: activity.projectId || null,
        client_id: activity.clientId || null,
        case_id: activity.caseId || null,
        activity_date: activity.activityDate,
        activity_time: activity.activityTime,
        status: activity.status,
        notes: activity.notes,
        created_by_id: activity.createdById,
        shared_with_client: activity.sharedWithClient || false
      }])
      .select()
      .single();
    
    if (error) throw error;
    return dbToActivity(data);
  },

  // Update an activity
  async update(id: string, updates: Partial<Activity>): Promise<Activity> {
    const updateData: any = {};
    
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.projectId !== undefined) updateData.project_id = updates.projectId;
    if (updates.clientId !== undefined) updateData.client_id = updates.clientId;
    if (updates.caseId !== undefined) updateData.case_id = updates.caseId;
    if (updates.activityDate !== undefined) updateData.activity_date = updates.activityDate;
    if (updates.activityTime !== undefined) updateData.activity_time = updates.activityTime;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.sharedWithClient !== undefined) updateData.shared_with_client = updates.sharedWithClient;
    
    const { data, error } = await supabase
      .from('activities')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return dbToActivity(data);
  },

  // Delete an activity
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
