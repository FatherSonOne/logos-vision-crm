// Volunteer Service - Handles all database operations for Volunteers
import { supabase } from './supabaseClient';
import { logActivity } from './collaborationService';
import type { Volunteer, TeamMember } from '../types';

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
  async create(volunteer: Partial<Volunteer>, currentUser?: TeamMember): Promise<Volunteer> {
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

    const newVolunteer = dbToVolunteer(data);

    // Log activity
    if (currentUser) {
      try {
        await logActivity({
          entityType: 'volunteer',
          entityId: newVolunteer.id,
          action: 'created',
          actor: currentUser,
          description: `Created volunteer: ${newVolunteer.name}`,
          metadata: {
            email: newVolunteer.email,
            phone: newVolunteer.phone,
            skills: newVolunteer.skills,
          }
        });
      } catch (error) {
        console.error('Failed to log volunteer creation activity:', error);
        // Don't throw - volunteer was created successfully
      }
    }

    return newVolunteer;
  },

  // Update an existing volunteer
  async update(id: string, updates: Partial<Volunteer>, currentUser?: TeamMember): Promise<Volunteer> {
    // Get the old volunteer for change tracking
    const oldVolunteer = currentUser ? await this.getById(id) : null;

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

    const updatedVolunteer = dbToVolunteer(data);

    // Log activity with changes
    if (currentUser && oldVolunteer) {
      try {
        // Calculate changes
        const changes: Record<string, { old: any; new: any }> = {};
        const relevantFields: (keyof Volunteer)[] = ['name', 'email', 'phone', 'skills'];

        for (const field of relevantFields) {
          if (field in updates && JSON.stringify(oldVolunteer[field]) !== JSON.stringify(updatedVolunteer[field])) {
            changes[field] = { old: oldVolunteer[field], new: updatedVolunteer[field] };
          }
        }

        if (Object.keys(changes).length > 0) {
          await logActivity({
            entityType: 'volunteer',
            entityId: id,
            action: 'updated',
            actor: currentUser,
            description: `Updated volunteer: ${updatedVolunteer.name}`,
            changes
          });
        }
      } catch (error) {
        console.error('Failed to log volunteer update activity:', error);
        // Don't throw - volunteer was updated successfully
      }
    }

    return updatedVolunteer;
  },

  // Delete a volunteer (soft delete)
  async delete(id: string, currentUser?: TeamMember): Promise<void> {
    // Get volunteer info before deletion for logging
    const volunteer = currentUser ? await this.getById(id) : null;

    const { error } = await supabase
      .from('volunteers')
      .update({ status: 'Inactive' })
      .eq('id', id);

    if (error) {
      console.error('Error deleting volunteer:', error);
      throw error;
    }

    // Log activity
    if (currentUser && volunteer) {
      try {
        await logActivity({
          entityType: 'volunteer',
          entityId: id,
          action: 'deleted',
          actor: currentUser,
          description: `Deleted volunteer: ${volunteer.name}`,
          metadata: {
            email: volunteer.email,
            phone: volunteer.phone,
            skills: volunteer.skills,
          }
        });
      } catch (error) {
        console.error('Failed to log volunteer deletion activity:', error);
        // Don't throw - volunteer was deleted successfully
      }
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
