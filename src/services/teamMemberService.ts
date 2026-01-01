// Team Member Service - Handles all database operations for Team Members
import { supabase } from './supabaseClient';
import type { TeamMember, CustomField, TeamMemberPermission } from '../types';

// Helper function to convert database format to app format
function dbToTeamMember(dbTeamMember: any): TeamMember {
  // Parse custom_fields JSON if it exists
  let customFields: CustomField[] | undefined;
  if (dbTeamMember.custom_fields) {
    try {
      customFields = typeof dbTeamMember.custom_fields === 'string'
        ? JSON.parse(dbTeamMember.custom_fields)
        : dbTeamMember.custom_fields;
    } catch (e) {
      console.error('Error parsing custom_fields:', e);
      customFields = undefined;
    }
  }

  return {
    id: dbTeamMember.id,
    name: dbTeamMember.name,
    email: dbTeamMember.email,
    role: dbTeamMember.role,
    phone: dbTeamMember.phone,
    profilePicture: dbTeamMember.profile_picture || null,
    permission: (dbTeamMember.permission as TeamMemberPermission) || 'viewer',
    customFields,
    isActive: dbTeamMember.is_active ?? true,
    lastActiveAt: dbTeamMember.last_active_at,
    createdAt: dbTeamMember.created_at,
    updatedAt: dbTeamMember.updated_at,
  };
}

export const teamMemberService = {
  // Get all team members
  async getAll(): Promise<TeamMember[]> {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }
    
    return (data || []).map(dbToTeamMember);
  },

  // Get a single team member by ID
  async getById(id: string): Promise<TeamMember | null> {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching team member:', error);
      throw error;
    }
    
    return data ? dbToTeamMember(data) : null;
  },

  // Create a new team member
  async create(teamMember: Partial<TeamMember>): Promise<TeamMember> {
    const { data, error } = await supabase
      .from('team_members')
      .insert([{
        id: teamMember.id, // Keep the mock ID for migration
        name: teamMember.name,
        email: teamMember.email,
        role: teamMember.role,
        phone: teamMember.phone || null,
        profile_picture: teamMember.profilePicture || null,
        permission: teamMember.permission || 'viewer',
        custom_fields: teamMember.customFields ? JSON.stringify(teamMember.customFields) : null,
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating team member:', error);
      throw error;
    }

    return dbToTeamMember(data);
  },

  // Update an existing team member
  async update(id: string, updates: Partial<TeamMember>): Promise<TeamMember> {
    const updateData: any = {};

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.role !== undefined) updateData.role = updates.role;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.profilePicture !== undefined) updateData.profile_picture = updates.profilePicture;
    if (updates.permission !== undefined) updateData.permission = updates.permission;
    if (updates.customFields !== undefined) {
      updateData.custom_fields = updates.customFields ? JSON.stringify(updates.customFields) : null;
    }
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
    if (updates.lastActiveAt !== undefined) updateData.last_active_at = updates.lastActiveAt;

    const { data, error } = await supabase
      .from('team_members')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating team member:', error);
      throw error;
    }

    return dbToTeamMember(data);
  },

  // Delete a team member (soft delete)
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('team_members')
      .update({ is_active: false })
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting team member:', error);
      throw error;
    }
  },

  // Search team members by name or email
  async search(query: string): Promise<TeamMember[]> {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      console.error('Error searching team members:', error);
      throw error;
    }
    
    return (data || []).map(dbToTeamMember);
  }
};
