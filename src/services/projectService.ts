// Project Service - Handles all database operations for Projects
import { supabase } from './supabaseClient';
import { logosSupabase } from '../lib/supabaseLogosClient';
import { logActivity } from './collaborationService';
import type { Project, TeamMember } from '../types';

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
    // First get all projects from Logos Supabase
    const { data: projectsData, error: projectsError } = await logosSupabase
      .from('lv_projects')
      .select('*')
      .order('name', { ascending: true });

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      throw projectsError;
    }

    if (!projectsData || projectsData.length === 0) {
      return [];
    }

    // Then get all tasks for these projects from lv_tasks
    const projectIds = projectsData.map(p => p.id);
    const { data: tasksData, error: tasksError } = await logosSupabase
      .from('lv_tasks')
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
    const { data, error } = await logosSupabase
      .from('lv_projects')
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
    const { data, error } = await logosSupabase
      .from('lv_projects')
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
  async create(project: Partial<Project>, currentUser?: TeamMember): Promise<Project> {
    // Build insert data - only include id if provided (for migration)
    const insertData: any = {
      name: project.name,
      description: project.description,
      client_id: project.clientId,
      status: project.status || 'Planning',
      start_date: project.startDate,
      end_date: project.endDate,
      budget: project.budget,
      notes: project.notes,
      team_member_ids: project.teamMemberIds || [],
      pinned: project.pinned || false,
      starred: project.starred || false,
      archived: project.archived || false
    };

    // Only include id if it exists (for migrating existing data)
    if (project.id) {
      insertData.id = project.id;
    }

    // Create the project in lv_projects
    const { data: projectData, error: projectError } = await logosSupabase
      .from('lv_projects')
      .insert([insertData])
      .select()
      .single();

    if (projectError) {
      console.error('Error creating project:', projectError);
      throw projectError;
    }

    // Create tasks if provided in lv_tasks
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

      const { error: tasksError } = await logosSupabase
        .from('lv_tasks')
        .insert(tasksToInsert);

      if (tasksError) {
        console.error('Error creating tasks:', tasksError);
        // Don't throw - project was created successfully
      }
    }

    const newProject = dbToProject(projectData);
    newProject.tasks = project.tasks || [];
    newProject.teamMemberIds = project.teamMemberIds || [];

    // Log activity if currentUser is provided
    if (currentUser) {
      try {
        await logActivity({
          entityType: 'project',
          entityId: newProject.id,
          action: 'created',
          actor: currentUser,
          description: `Created project: ${newProject.name}`,
          metadata: {
            status: newProject.status,
            clientId: newProject.clientId,
            startDate: newProject.startDate,
            endDate: newProject.endDate,
          }
        });
      } catch (error) {
        console.error('Error logging project creation activity:', error);
        // Don't throw - project was created successfully
      }
    }

    return newProject;
  },

  // Update an existing project
  async update(id: string, updates: Partial<Project>, currentUser?: TeamMember): Promise<Project> {
    // Get the old project for change tracking
    const oldProject = await this.getById(id);
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

    const { data, error } = await logosSupabase
      .from('lv_projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      throw error;
    }

    const updatedProject = dbToProject(data);

    // Log activity with changes if currentUser is provided
    if (currentUser && oldProject) {
      try {
        // Calculate changes
        const changes: Record<string, { old: any; new: any }> = {};
        const fieldLabels: Record<string, string> = {
          name: 'Name',
          description: 'Description',
          status: 'Status',
          startDate: 'Start Date',
          endDate: 'End Date',
          budget: 'Budget',
          notes: 'Notes',
          pinned: 'Pinned',
          starred: 'Starred',
          archived: 'Archived',
        };

        for (const key of Object.keys(fieldLabels)) {
          if (oldProject[key as keyof Project] !== updatedProject[key as keyof Project]) {
            const label = fieldLabels[key];
            changes[label] = {
              old: oldProject[key as keyof Project],
              new: updatedProject[key as keyof Project],
            };
          }
        }

        // Special case for status change
        if (oldProject.status !== updatedProject.status) {
          await logActivity({
            entityType: 'project',
            entityId: id,
            action: 'status_changed',
            actor: currentUser,
            description: `Changed project status from ${oldProject.status} to ${updatedProject.status}`,
            metadata: {
              oldStatus: oldProject.status,
              newStatus: updatedProject.status,
            }
          });
        } else if (Object.keys(changes).length > 0) {
          await logActivity({
            entityType: 'project',
            entityId: id,
            action: 'updated',
            actor: currentUser,
            description: `Updated project: ${updatedProject.name}`,
            changes,
            metadata: {
              fieldsChanged: Object.keys(changes),
            }
          });
        }
      } catch (error) {
        console.error('Error logging project update activity:', error);
        // Don't throw - project was updated successfully
      }
    }

    return updatedProject;
  },

  // Delete a project (also deletes associated tasks)
  async delete(id: string, currentUser?: TeamMember): Promise<void> {
    // Get project name before deletion for activity log
    const project = currentUser ? await this.getById(id) : null;
    // First delete associated tasks
    const { error: tasksError } = await logosSupabase
      .from('lv_tasks')
      .delete()
      .eq('project_id', id);

    if (tasksError) {
      console.error('Error deleting project tasks:', tasksError);
      // Continue to delete the project even if task deletion fails
    }

    // Then delete the project
    const { error } = await logosSupabase
      .from('lv_projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting project:', error);
      throw error;
    }

    // Log activity if currentUser is provided
    if (currentUser && project) {
      try {
        await logActivity({
          entityType: 'project',
          entityId: id,
          action: 'deleted',
          actor: currentUser,
          description: `Deleted project: ${project.name}`,
          metadata: {
            projectName: project.name,
            clientId: project.clientId,
          }
        });
      } catch (error) {
        console.error('Error logging project deletion activity:', error);
        // Don't throw - project was deleted successfully
      }
    }
  }
};
