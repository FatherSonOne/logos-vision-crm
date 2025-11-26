// Team Member Service - Handles all database operations for Team Members
import { supabase } from './supabaseClient';
import type { TeamMember } from '../types';

// Helper function to convert database format to app format
function dbToTeamMember(dbTeamMember: any): TeamMember {
  return {
    id: dbTeamMember.id,
    name: dbTeamMember.name,
    email: dbTeamMember.email,
    role: dbTeamMember.role,
    phone: dbTeamMember.phone
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
