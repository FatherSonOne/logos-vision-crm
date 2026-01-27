// Activity Service - Handles all database operations for Activities
import { supabase } from './supabaseClient';
import { logActivity } from './collaborationService';
import type { Activity, TeamMember } from '../types';

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
  async create(activity: Partial<Activity>, currentUser?: TeamMember): Promise<Activity> {
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

    const newActivity = dbToActivity(data);

    // Log activity creation
    if (currentUser) {
      try {
        await logActivity({
          entityType: 'activity',
          entityId: newActivity.id,
          action: 'created',
          actor: currentUser,
          description: `Created activity: ${newActivity.title}`,
          metadata: {
            type: newActivity.type,
            status: newActivity.status,
            activityDate: newActivity.activityDate,
          }
        });
      } catch (error) {
        console.error('Failed to log activity creation:', error);
        // Don't throw - activity was created successfully
      }
    }

    return newActivity;
  },

  // Update an activity
  async update(id: string, updates: Partial<Activity>, currentUser?: TeamMember): Promise<Activity> {
    // Get the old activity for change tracking
    const { data: oldData, error: fetchError } = await supabase
      .from('activities')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    const oldActivity = dbToActivity(oldData);

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

    const updatedActivity = dbToActivity(data);

    // Log activity update with changes
    if (currentUser) {
      try {
        // Calculate changes
        const changes: Record<string, { old: any; new: any }> = {};
        const relevantFields: (keyof Activity)[] = ['title', 'type', 'status', 'activityDate', 'activityTime', 'notes'];

        for (const field of relevantFields) {
          if (field in updates && oldActivity[field] !== updatedActivity[field]) {
            changes[field] = { old: oldActivity[field], new: updatedActivity[field] };
          }
        }

        // Special handling for status changes
        if ('status' in changes) {
          await logActivity({
            entityType: 'activity',
            entityId: id,
            action: 'status_changed',
            actor: currentUser,
            description: `Changed activity status from ${changes.status.old} to ${changes.status.new}`,
            metadata: { oldStatus: changes.status.old, newStatus: changes.status.new }
          });
        } else if (Object.keys(changes).length > 0) {
          await logActivity({
            entityType: 'activity',
            entityId: id,
            action: 'updated',
            actor: currentUser,
            description: `Updated activity: ${updatedActivity.title}`,
            changes
          });
        }
      } catch (error) {
        console.error('Failed to log activity update:', error);
        // Don't throw - activity was updated successfully
      }
    }

    return updatedActivity;
  },

  // Delete an activity
  async delete(id: string, currentUser?: TeamMember): Promise<void> {
    // Get activity info before deletion for logging
    const activityItem = currentUser ? await this.getById(id) : null;

    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Log activity deletion
    if (currentUser && activityItem) {
      try {
        await logActivity({
          entityType: 'activity',
          entityId: id,
          action: 'deleted',
          actor: currentUser,
          description: `Deleted activity: ${activityItem.title}`,
          metadata: {
            type: activityItem.type,
            status: activityItem.status,
          }
        });
      } catch (error) {
        console.error('Failed to log activity deletion:', error);
        // Don't throw - activity was deleted successfully
      }
    }
  },

  // Get activity by ID (helper for delete)
  async getById(id: string): Promise<Activity | null> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data ? dbToActivity(data) : null;
  }
};
