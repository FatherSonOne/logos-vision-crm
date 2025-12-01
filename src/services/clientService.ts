// Client Service - Handles all database operations for Clients
import { supabase } from './supabaseClient';
import type { Client } from '../types';

export const clientService = {
  // Get all clients
  async getAll(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
    
    // Transform snake_case to camelCase
    return (data || []).map(row => ({
      id: row.id,
      name: row.name,
      contactPerson: row.contact_person,
      email: row.email,
      phone: row.phone,
      location: row.location,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  },

  // Get a single client by ID
  async getById(id: string): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching client:', error);
      throw error;
    }
    
    if (!data) return null;
    
    // Transform snake_case to camelCase
    return {
      id: data.id,
      name: data.name,
      contactPerson: data.contact_person,
      email: data.email,
      phone: data.phone,
      location: data.location,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  // Create a new client
  async create(client: Partial<Client>): Promise<Client> {
    // Transform camelCase to snake_case for database
    // Build the insert object - only include id if it's provided (for migration)
    const insertData: any = {
      name: client.name,
      contact_person: client.contactPerson,
      email: client.email,
      phone: client.phone,
      location: client.location,
      notes: client.notes || '',
      is_active: true
    };
    
    // Only include id if it exists (for migrating existing data)
    if (client.id) {
      insertData.id = client.id;
    }
    
    const { data, error } = await supabase
      .from('clients')
      .insert([insertData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating client:', error);
      throw error;
    }
    
    // Transform response back to camelCase
    return {
      id: data.id,
      name: data.name,
      contactPerson: data.contact_person,
      email: data.email,
      phone: data.phone,
      location: data.location,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  // Update an existing client
  async update(id: string, updates: Partial<Client>): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .update({
        name: updates.name,
        contact_person: updates.contactPerson,
        email: updates.email,
        phone: updates.phone,
        location: updates.location,
        notes: updates.notes
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating client:', error);
      throw error;
    }
    
    return {
      id: data.id,
      name: data.name,
      contactPerson: data.contact_person,
      email: data.email,
      phone: data.phone,
      location: data.location,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  // Delete a client (soft delete - mark as inactive)
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('clients')
      .update({ is_active: false })
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  },

  // Search clients by name
  async search(query: string): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .ilike('name', `%${query}%`)
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      console.error('Error searching clients:', error);
      throw error;
    }
    
    return (data || []).map(row => ({
      id: row.id,
      name: row.name,
      contactPerson: row.contact_person,
      email: row.email,
      phone: row.phone,
      location: row.location,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }
};
