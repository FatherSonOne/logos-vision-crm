// Project Service - Handles all database operations for Projects
import { supabase } from './supabaseClient';
import type { Project } from '../types';

// Helper function to convert database format to app format
function dbToProject(dbProject: any): Project {
  return {
    id: dbProject.id,
    name: dbProject.name,
    description: dbProject.description,
    clientId: dbProject.client_id,
    teamMemberIds: dbProject.team_member_ids || [],
    status: dbProject.status,
    startDate: dbProject.start_date,
    endDate: dbProject.end_date,
    budget: dbProject.budget,
    notes: dbProject.notes,
    tasks: [],
    pinned: dbProject.pinned || false,
    starred: dbProject.starred || false,
    tags: dbProject.tags || [],
    archived: dbProject.archived || false,
    createdAt: dbProject.created_at,
    updatedAt: dbProject.updated_at
  };
}

export const projectService = {
  // Get all projects WITH their tasks
  async getAll(): Promise<Project[]> {
    // First get all projects
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false});
    
    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      throw projectsError;
    }
    
    if (!projectsData || projectsData.length === 0) {
      return [];
    }
    
    // Then get all tasks for these projects
    const projectIds = projectsData.map(p => p.id);
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .in('project_id', projectIds);
    
    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
      // Don't throw - just return projects without tasks
    }
    
    // Convert projects and attach their tasks
    return projectsData.map(dbProject => {
      const project = dbToProject(dbProject);
      // Find tasks for this project
      const projectTasks = (tasksData || [])
        .filter(t => t.project_id === dbProject.id)
        .map(t => ({
          id: t.id,
          description: t.description,
          teamMemberId: t.team_member_id || '',
          dueDate: t.due_date || '',
          status: t.status || 'To Do',
          sharedWithClient: t.shared_with_client,
          notes: t.notes,
          phase: t.phase
        }));
      project.tasks = projectTasks;
      return project;
    });
  },

  // Get projects by client
  async getByClient(clientId: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching client projects:', error);
      throw error;
    }
    
    return (data || []).map(dbToProject);
  },

  // Get a single project by ID
  async getById(id: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
    
    return data ? dbToProject(data) : null;
  },

  // Create a new project (with tasks if provided)
  async create(project: Partial<Project>): Promise<Project> {
    // Build insert data - only include id if provided (for migration)
    const insertData: any = {
      name: project.name,
      description: project.description,
      client_id: project.clientId,
      status: project.status || 'Planning',
      start_date: project.startDate,
      end_date: project.endDate,
      budget: project.budget,
      notes: project.notes
    };
    
    // Only include id if it exists (for migrating existing data)
    if (project.id) {
      insertData.id = project.id;
    }
    
    // Create the project
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .insert([insertData])
      .select()
      .single();
    
    if (projectError) {
      console.error('Error creating project:', projectError);
      throw projectError;
    }
    
    // Create tasks if provided
    if (project.tasks && project.tasks.length > 0) {
      const tasksToInsert = project.tasks.map(task => {
        const taskData: any = {
          project_id: projectData.id,
          description: task.description,
          team_member_id: task.teamMemberId || null,
          status: task.status || 'To Do',
          due_date: task.dueDate,
          shared_with_client: task.sharedWithClient || false,
          notes: task.notes,
          phase: task.phase
        };
        
        // Only include task id if it exists (for migration)
        if (task.id) {
          taskData.id = task.id;
        }
        
        return taskData;
      });
      
      const { error: tasksError } = await supabase
        .from('tasks')
        .insert(tasksToInsert);
      
      if (tasksError) {
        console.error('Error creating tasks:', tasksError);
        // Don't throw - project was created successfully
      }
    }
    
    const newProject = dbToProject(projectData);
    newProject.tasks = project.tasks || [];
    newProject.teamMemberIds = project.teamMemberIds || [];
    return newProject;
  },

  // Update an existing project
  async update(id: string, updates: Partial<Project>): Promise<Project> {
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.clientId !== undefined) updateData.client_id = updates.clientId;
    if (updates.teamMemberIds !== undefined) updateData.team_member_ids = updates.teamMemberIds;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.startDate !== undefined) updateData.start_date = updates.startDate;
    if (updates.endDate !== undefined) updateData.end_date = updates.endDate;
    if (updates.budget !== undefined) updateData.budget = updates.budget;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.pinned !== undefined) updateData.pinned = updates.pinned;
    if (updates.starred !== undefined) updateData.starred = updates.starred;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.archived !== undefined) updateData.archived = updates.archived;
    
    const { data, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating project:', error);
      throw error;
    }
    
    return dbToProject(data);
  },

  // Delete a project
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }
};
