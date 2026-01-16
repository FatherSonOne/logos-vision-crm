// Task Management Service - Comprehensive service layer for task operations
// Handles all CRUD operations, filtering, enrichment, and related operations

import { supabase } from './supabaseClient';

// ============================================
// TYPE DEFINITIONS
// ============================================

// Extended task type matching TaskView.tsx expectations
export interface ExtendedTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  assignedToId: string;
  assignedToName: string;
  department: Department;
  projectId?: string;
  projectName?: string;
  clientId?: string;
  clientName?: string;
  timeEstimate: number; // hours
  timeSpent: number; // hours
  tags: string[];
  subtasks: TaskSubtask[];
  comments: number; // count
  attachments: number; // count
}

export interface TaskSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export type TaskStatus = 'new' | 'assigned' | 'in_progress' | 'completed' | 'overdue';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type Department = 'Consulting' | 'Operations' | 'Finance' | 'HR' | 'Marketing' | 'Unassigned';

export interface TaskComment {
  id: string;
  taskId: string;
  userId?: string;
  teamMemberId?: string;
  comment: string;
  isInternal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskActivity {
  id: string;
  taskId: string;
  userId?: string;
  teamMemberId?: string;
  activityType: string;
  description?: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
}

// ============================================
// DATA TRANSFORMATION FUNCTIONS
// ============================================

/**
 * Transform database row to ExtendedTask format
 * Handles field mapping from snake_case (DB) to camelCase (TypeScript)
 */
function dbToExtendedTask(row: any): ExtendedTask {
  return {
    id: row.id,
    title: row.title || row.description?.substring(0, 100) || 'Untitled Task',
    description: row.description || '',
    status: mapDbStatusToExtended(row.status),
    priority: (row.priority?.toLowerCase() || 'medium') as TaskPriority,
    dueDate: row.due_date || new Date().toISOString().split('T')[0],
    createdAt: row.created_at || new Date().toISOString(),
    completedAt: row.completed_date,
    assignedToId: row.assigned_to || row.team_member_id || '',
    assignedToName: row.team_member?.name || 'Unassigned',
    department: (row.team_member?.department || 'Unassigned') as Department,
    projectId: row.project_id,
    projectName: row.project?.name || null,
    clientId: row.project?.client_id || null,
    clientName: row.project?.client?.name || null,
    timeEstimate: row.time_estimate_hours || 0,
    timeSpent: row.time_spent_hours || 0,
    tags: row.tags || [],
    subtasks: row.subtasks || [],
    comments: row.comments_count || 0,
    attachments: row.attachments_count || 0,
  };
}

/**
 * Map database status to ExtendedTask status
 * Handles various status formats from DB
 */
function mapDbStatusToExtended(dbStatus: string): TaskStatus {
  if (!dbStatus) return 'new';

  const status = dbStatus.toLowerCase().replace(/\s+/g, '_');

  if (status.includes('progress')) return 'in_progress';
  if (status.includes('done') || status.includes('complete')) return 'completed';
  if (status.includes('overdue')) return 'overdue';
  if (status.includes('assign')) return 'assigned';

  return 'new';
}

/**
 * Map ExtendedTask status to database status
 */
function mapExtendedToDbStatus(status: TaskStatus): string {
  const statusMap: Record<TaskStatus, string> = {
    'new': 'To Do',
    'assigned': 'Assigned',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'overdue': 'Overdue'
  };
  return statusMap[status] || 'To Do';
}

// ============================================
// MAIN SERVICE OBJECT
// ============================================

export const taskManagementService = {
  /**
   * Get all tasks with full enrichment (joins for team member, project, client, subtasks)
   * @returns Promise<ExtendedTask[]> - Array of enriched tasks
   */
  async getAllEnriched(): Promise<ExtendedTask[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          team_member:team_members!assigned_to (
            id,
            name,
            role
          ),
          project:projects (
            id,
            name,
            client:clients (
              id,
              name
            )
          ),
          subtasks:task_subtasks (
            id,
            title,
            completed
          )
        `)
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }

      // Get counts for comments and attachments separately for performance
      const tasksWithCounts = await Promise.all(
        (data || []).map(async (task) => {
          const [commentsResult, attachmentsResult] = await Promise.all([
            supabase
              .from('task_comments')
              .select('id', { count: 'exact', head: true })
              .eq('task_id', task.id),
            supabase
              .from('task_attachments')
              .select('id', { count: 'exact', head: true })
              .eq('task_id', task.id),
          ]);

          return {
            ...task,
            comments_count: commentsResult.count || 0,
            attachments_count: attachmentsResult.count || 0,
          };
        })
      );

      return tasksWithCounts.map(dbToExtendedTask);
    } catch (error) {
      console.error('getAllEnriched error:', error);
      return [];
    }
  },

  /**
   * Get tasks by status
   * @param status - Task status to filter by
   */
  async getByStatus(status: TaskStatus): Promise<ExtendedTask[]> {
    try {
      const dbStatus = mapExtendedToDbStatus(status);

      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          team_member:team_members!assigned_to (*),
          project:projects (*, client:clients (*)),
          subtasks:task_subtasks (*)
        `)
        .eq('status', dbStatus)
        .order('due_date');

      if (error) throw error;
      return (data || []).map(dbToExtendedTask);
    } catch (error) {
      console.error('getByStatus error:', error);
      return [];
    }
  },

  /**
   * Get tasks by assignee
   * @param userId - Team member ID
   */
  async getByAssignee(userId: string): Promise<ExtendedTask[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          team_member:team_members!assigned_to (*),
          project:projects (*, client:clients (*)),
          subtasks:task_subtasks (*)
        `)
        .eq('assigned_to', userId)
        .order('due_date');

      if (error) throw error;
      return (data || []).map(dbToExtendedTask);
    } catch (error) {
      console.error('getByAssignee error:', error);
      return [];
    }
  },

  /**
   * Get overdue tasks (past due date and not completed)
   */
  async getOverdue(): Promise<ExtendedTask[]> {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          team_member:team_members!assigned_to (*),
          project:projects (*, client:clients (*)),
          subtasks:task_subtasks (*)
        `)
        .lt('due_date', today)
        .neq('status', 'Completed')
        .order('due_date');

      if (error) throw error;
      return (data || []).map(dbToExtendedTask);
    } catch (error) {
      console.error('getOverdue error:', error);
      return [];
    }
  },

  /**
   * Get tasks due today
   */
  async getDueToday(): Promise<ExtendedTask[]> {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          team_member:team_members!assigned_to (*),
          project:projects (*, client:clients (*)),
          subtasks:task_subtasks (*)
        `)
        .eq('due_date', today)
        .neq('status', 'Completed')
        .order('priority');

      if (error) throw error;
      return (data || []).map(dbToExtendedTask);
    } catch (error) {
      console.error('getDueToday error:', error);
      return [];
    }
  },

  /**
   * Get tasks by project
   * @param projectId - Project ID
   */
  async getByProject(projectId: string): Promise<ExtendedTask[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          team_member:team_members!assigned_to (*),
          subtasks:task_subtasks (*)
        `)
        .eq('project_id', projectId)
        .order('due_date');

      if (error) throw error;
      return (data || []).map(dbToExtendedTask);
    } catch (error) {
      console.error('getByProject error:', error);
      return [];
    }
  },

  /**
   * Get a single task by ID with full enrichment
   * @param id - Task ID
   */
  async getById(id: string): Promise<ExtendedTask | null> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          team_member:team_members!assigned_to (*),
          project:projects (*, client:clients (*)),
          subtasks:task_subtasks (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data ? dbToExtendedTask(data) : null;
    } catch (error) {
      console.error('getById error:', error);
      return null;
    }
  },

  /**
   * Create a new task
   * @param task - Task data (without id)
   */
  async create(task: Omit<Partial<ExtendedTask>, 'id'>): Promise<ExtendedTask | null> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: task.title,
          description: task.description,
          status: task.status ? mapExtendedToDbStatus(task.status) : 'To Do',
          priority: task.priority || 'medium',
          due_date: task.dueDate,
          assigned_to: task.assignedToId,
          project_id: task.projectId,
          time_estimate_hours: task.timeEstimate || 0,
          time_spent_hours: task.timeSpent || 0,
          tags: task.tags || [],
        })
        .select(`
          *,
          team_member:team_members!assigned_to (*),
          project:projects (*, client:clients (*)),
          subtasks:task_subtasks (*)
        `)
        .single();

      if (error) throw error;
      return data ? dbToExtendedTask(data) : null;
    } catch (error) {
      console.error('create error:', error);
      throw error;
    }
  },

  /**
   * Update an existing task
   * @param id - Task ID
   * @param updates - Partial task updates
   */
  async update(id: string, updates: Partial<ExtendedTask>): Promise<ExtendedTask | null> {
    try {
      const dbUpdates: any = {};

      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.status !== undefined) dbUpdates.status = mapExtendedToDbStatus(updates.status);
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
      if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
      if (updates.assignedToId !== undefined) dbUpdates.assigned_to = updates.assignedToId;
      if (updates.projectId !== undefined) dbUpdates.project_id = updates.projectId;
      if (updates.timeEstimate !== undefined) dbUpdates.time_estimate_hours = updates.timeEstimate;
      if (updates.timeSpent !== undefined) dbUpdates.time_spent_hours = updates.timeSpent;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
      if (updates.completedAt !== undefined) dbUpdates.completed_date = updates.completedAt;

      const { data, error } = await supabase
        .from('tasks')
        .update(dbUpdates)
        .eq('id', id)
        .select(`
          *,
          team_member:team_members!assigned_to (*),
          project:projects (*, client:clients (*)),
          subtasks:task_subtasks (*)
        `)
        .single();

      if (error) throw error;
      return data ? dbToExtendedTask(data) : null;
    } catch (error) {
      console.error('update error:', error);
      throw error;
    }
  },

  /**
   * Delete a task (cascades to subtasks, comments, etc.)
   * @param id - Task ID
   */
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('delete error:', error);
      throw error;
    }
  },

  /**
   * Bulk update task status
   * @param taskIds - Array of task IDs
   * @param status - New status
   */
  async bulkUpdateStatus(taskIds: string[], status: TaskStatus): Promise<void> {
    try {
      const dbStatus = mapExtendedToDbStatus(status);

      const { error } = await supabase
        .from('tasks')
        .update({ status: dbStatus })
        .in('id', taskIds);

      if (error) throw error;
    } catch (error) {
      console.error('bulkUpdateStatus error:', error);
      throw error;
    }
  },

  // ============================================
  // SUBTASK OPERATIONS
  // ============================================

  /**
   * Add a subtask to a task
   * @param taskId - Parent task ID
   * @param title - Subtask title
   */
  async addSubtask(taskId: string, title: string): Promise<TaskSubtask | null> {
    try {
      const { data, error } = await supabase
        .from('task_subtasks')
        .insert({
          task_id: taskId,
          title,
          completed: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('addSubtask error:', error);
      throw error;
    }
  },

  /**
   * Toggle subtask completion status
   * @param subtaskId - Subtask ID
   * @param completed - New completion status
   */
  async toggleSubtask(subtaskId: string, completed: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('task_subtasks')
        .update({ completed })
        .eq('id', subtaskId);

      if (error) throw error;
    } catch (error) {
      console.error('toggleSubtask error:', error);
      throw error;
    }
  },

  /**
   * Delete a subtask
   * @param subtaskId - Subtask ID
   */
  async deleteSubtask(subtaskId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('task_subtasks')
        .delete()
        .eq('id', subtaskId);

      if (error) throw error;
    } catch (error) {
      console.error('deleteSubtask error:', error);
      throw error;
    }
  },

  // ============================================
  // COMMENT OPERATIONS
  // ============================================

  /**
   * Add a comment to a task
   * @param taskId - Task ID
   * @param comment - Comment text
   * @param userId - User ID (optional)
   * @param teamMemberId - Team member ID (optional)
   * @param isInternal - Whether comment is internal only
   */
  async addComment(
    taskId: string,
    comment: string,
    userId?: string,
    teamMemberId?: string,
    isInternal: boolean = false
  ): Promise<TaskComment | null> {
    try {
      const { data, error } = await supabase
        .from('task_comments')
        .insert({
          task_id: taskId,
          user_id: userId,
          team_member_id: teamMemberId,
          comment,
          is_internal: isInternal,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('addComment error:', error);
      throw error;
    }
  },

  /**
   * Get comments for a task
   * @param taskId - Task ID
   */
  async getComments(taskId: string): Promise<TaskComment[]> {
    try {
      const { data, error } = await supabase
        .from('task_comments')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('getComments error:', error);
      return [];
    }
  },

  // ============================================
  // ACTIVITY LOG OPERATIONS
  // ============================================

  /**
   * Get activity log for a task
   * @param taskId - Task ID
   */
  async getActivity(taskId: string): Promise<TaskActivity[]> {
    try {
      const { data, error } = await supabase
        .from('task_activity')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('getActivity error:', error);
      return [];
    }
  },
};

export default taskManagementService;
