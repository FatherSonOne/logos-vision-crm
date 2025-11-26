// Task Service - Handles all database operations for Tasks
import { supabase } from './supabaseClient';
import type { Task } from '../types';

// Helper function to convert database format to app format
function dbToTask(dbTask: any): Task {
  return {
    id: dbTask.id,
    description: dbTask.description || dbTask.title || '',
    teamMemberId: dbTask.team_member_id || dbTask.assigned_to || '',
    dueDate: dbTask.due_date || '',
    status: dbTask.status || 'To Do',
    sharedWithClient: dbTask.shared_with_client || false,
    notes: dbTask.notes,
    phase: dbTask.phase
  };
}

export const taskService = {
  // Get all tasks
  async getAll(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('due_date');
    
    if (error) throw error;
    return (data || []).map(dbToTask);
  },

  // Get tasks by project
  async getByProject(projectId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('due_date');
    
    if (error) throw error;
    return (data || []).map(dbToTask);
  },

  // Create a new task
  async create(task: Omit<Task, 'id'>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        description: task.description,
        team_member_id: task.teamMemberId,
        due_date: task.dueDate,
        status: task.status || 'To Do',
        shared_with_client: task.sharedWithClient || false,
        notes: task.notes,
        phase: task.phase
      }])
      .select()
      .single();
    
    if (error) throw error;
    return dbToTask(data);
  },

  // Update task
  async update(id: string, updates: Partial<Task>): Promise<Task> {
    const updateData: any = {};
    
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.teamMemberId !== undefined) updateData.team_member_id = updates.teamMemberId;
    if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.sharedWithClient !== undefined) updateData.shared_with_client = updates.sharedWithClient;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.phase !== undefined) updateData.phase = updates.phase;
    
    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return dbToTask(data);
  },

  // Delete task
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};