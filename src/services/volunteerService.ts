// Volunteer Service - Handles all database operations for Volunteers
import { supabase } from './supabaseClient';
import type { Volunteer } from '../types';

// Helper function to convert database format to app format
function dbToVolunteer(dbVolunteer: any): Volunteer {
  return {
    id: dbVolunteer.id,
    name: dbVolunteer.name,
    email: dbVolunteer.email,
    phone: dbVolunteer.phone,
    location: '', // Not in database
    skills: dbVolunteer.skills || [],
    availability: '', // Not in database
    assignedProjectIds: [], // Not in database
    assignedClientIds: dbVolunteer.client_id ? [dbVolunteer.client_id] : []
  };
}

export const volunteerService = {
  // Get all volunteers
  async getAll(): Promise<Volunteer[]> {
    const { data, error } = await supabase
      .from('volunteers')
      .select('*')
      .eq('status', 'Active')
      .order('name');
    
    if (error) {
      console.error('Error fetching volunteers:', error);
      throw error;
    }
    
    return (data || []).map(dbToVolunteer);
  },

  // Get a single volunteer by ID
  async getById(id: string): Promise<Volunteer | null> {
    const { data, error } = await supabase
      .from('volunteers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching volunteer:', error);
      throw error;
    }
    
    return data ? dbToVolunteer(data) : null;
  },

  // Get volunteers by client
  async getByClient(clientId: string): Promise<Volunteer[]> {
    const { data, error } = await supabase
      .from('volunteers')
      .select('*')
      .eq('client_id', clientId)
      .eq('status', 'Active')
      .order('name');
    
    if (error) {
      console.error('Error fetching client volunteers:', error);
      throw error;
    }
    
    return (data || []).map(dbToVolunteer);
  },

  // Create a new volunteer
  async create(volunteer: Partial<Volunteer>): Promise<Volunteer> {
    // Use first assigned client as the primary client_id
    const clientId = volunteer.assignedClientIds && volunteer.assignedClientIds.length > 0
      ? volunteer.assignedClientIds[0]
      : null;
    
    // Store location and availability in notes
    const notes = [
      volunteer.location ? `Location: ${volunteer.location}` : '',
      volunteer.availability ? `Availability: ${volunteer.availability}` : ''
    ].filter(Boolean).join('\n');
    
    const { data, error } = await supabase
      .from('volunteers')
      .insert([{
        name: volunteer.name,
        email: volunteer.email,
        phone: volunteer.phone,
        skills: volunteer.skills || [],
        client_id: clientId,
        status: 'Active',
        notes: notes || null
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating volunteer:', error);
      throw error;
    }
    
    return dbToVolunteer(data);
  },

  // Update an existing volunteer
  async update(id: string, updates: Partial<Volunteer>): Promise<Volunteer> {
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.skills !== undefined) updateData.skills = updates.skills;
    
    const { data, error } = await supabase
      .from('volunteers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating volunteer:', error);
      throw error;
    }
    
    return dbToVolunteer(data);
  },

  // Delete a volunteer (soft delete)
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('volunteers')
      .update({ status: 'Inactive' })
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting volunteer:', error);
      throw error;
    }
  },

  // Search volunteers
  async search(query: string): Promise<Volunteer[]> {
    const { data, error } = await supabase
      .from('volunteers')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .eq('status', 'Active')
      .order('name');
    
    if (error) {
      console.error('Error searching volunteers:', error);
      throw error;
    }
    
    return (data || []).map(dbToVolunteer);
  }
};
