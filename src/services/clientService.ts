// Client Service - Handles all database operations for Clients
import { supabase } from './supabaseClient';
import { logosSupabase } from '../lib/supabaseLogosClient';
import { logActivity } from './collaborationService';
import type { Client, PreferredContactMethod, TeamMember } from '../types';

// Helper to map database row to Client type
const mapClientRow = (row: any): Client => ({
  id: row.id,
  name: row.name,
  contactPerson: row.contact_person || row.contactPerson || '',
  email: row.email || '',
  phone: row.phone || '',
  location: row.location || row.company || '',
  notes: row.notes,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  householdId: row.household_id,
  // Communication preferences
  preferredContactMethod: row.preferred_contact_method as PreferredContactMethod,
  doNotEmail: row.do_not_email ?? false,
  doNotCall: row.do_not_call ?? false,
  doNotMail: row.do_not_mail ?? false,
  doNotText: row.do_not_text ?? false,
  emailOptIn: row.email_opt_in ?? true,
  newsletterSubscriber: row.newsletter_subscriber ?? false,
  communicationNotes: row.communication_notes,
});

export const clientService = {
  // Get all clients
  async getAll(): Promise<Client[]> {
    const { data, error } = await logosSupabase
      .from('lv_clients')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('❌ Error loading lv_clients from Supabase', error);
      throw error;
    }

    console.log('✅ Loaded', data?.length ?? 0, 'clients from Logos Supabase');

    return (data || []).map(mapClientRow);
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

    return mapClientRow(data);
  },

  // Create a new client
  async create(client: Partial<Client>, currentUser?: TeamMember): Promise<Client> {
    // Transform camelCase to snake_case for database
    const insertData: any = {
      name: client.name,
      contact_person: client.contactPerson,
      email: client.email,
      phone: client.phone,
      location: client.location,
      notes: client.notes || '',
      is_active: true,
      household_id: client.householdId || null,
      // Communication preferences
      preferred_contact_method: client.preferredContactMethod || 'email',
      do_not_email: client.doNotEmail ?? false,
      do_not_call: client.doNotCall ?? false,
      do_not_mail: client.doNotMail ?? false,
      do_not_text: client.doNotText ?? false,
      email_opt_in: client.emailOptIn ?? true,
      newsletter_subscriber: client.newsletterSubscriber ?? false,
      communication_notes: client.communicationNotes || null,
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

    const newClient = mapClientRow(data);

    // Log activity
    if (currentUser) {
      try {
        await logActivity({
          entityType: 'client',
          entityId: newClient.id,
          action: 'created',
          actor: currentUser,
          description: `Created contact: ${newClient.name}`,
          metadata: {
            email: newClient.email,
            phone: newClient.phone,
            location: newClient.location,
          }
        });
      } catch (error) {
        console.error('Failed to log client creation activity:', error);
        // Don't throw - activity logging failure shouldn't prevent client creation
      }
    }

    return newClient;
  },

  // Update an existing client
  async update(id: string, updates: Partial<Client>, currentUser?: TeamMember): Promise<Client> {
    // Get the old client data for change tracking
    const oldClient = await this.getById(id);
    if (!oldClient) {
      throw new Error(`Client with id ${id} not found`);
    }
    const updateData: any = {};

    // Only include fields that are being updated
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.contactPerson !== undefined) updateData.contact_person = updates.contactPerson;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.householdId !== undefined) updateData.household_id = updates.householdId;
    // Communication preferences
    if (updates.preferredContactMethod !== undefined) updateData.preferred_contact_method = updates.preferredContactMethod;
    if (updates.doNotEmail !== undefined) updateData.do_not_email = updates.doNotEmail;
    if (updates.doNotCall !== undefined) updateData.do_not_call = updates.doNotCall;
    if (updates.doNotMail !== undefined) updateData.do_not_mail = updates.doNotMail;
    if (updates.doNotText !== undefined) updateData.do_not_text = updates.doNotText;
    if (updates.emailOptIn !== undefined) updateData.email_opt_in = updates.emailOptIn;
    if (updates.newsletterSubscriber !== undefined) updateData.newsletter_subscriber = updates.newsletterSubscriber;
    if (updates.communicationNotes !== undefined) updateData.communication_notes = updates.communicationNotes;

    const { data, error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating client:', error);
      throw error;
    }

    const updatedClient = mapClientRow(data);

    // Calculate changes for activity log
    const changes: Record<string, { old: any; new: any }> = {};
    const relevantFields: (keyof Client)[] = ['name', 'email', 'phone', 'location', 'notes', 'contactPerson', 'preferredContactMethod'];

    for (const field of relevantFields) {
      if (field in updates && oldClient[field] !== updates[field]) {
        changes[field] = { old: oldClient[field], new: updates[field] };
      }
    }

    // Log activity if there are changes
    if (currentUser && Object.keys(changes).length > 0) {
      try {
        await logActivity({
          entityType: 'client',
          entityId: id,
          action: 'updated',
          actor: currentUser,
          description: `Updated contact: ${updatedClient.name}`,
          changes
        });
      } catch (error) {
        console.error('Failed to log client update activity:', error);
        // Don't throw - activity logging failure shouldn't prevent client update
      }
    }

    return updatedClient;
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

    return (data || []).map(mapClientRow);
  },

  // Get clients with opt-in for email communications
  async getEmailOptInClients(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('is_active', true)
      .eq('email_opt_in', true)
      .eq('do_not_email', false)
      .order('name');

    if (error) {
      console.error('Error fetching email opt-in clients:', error);
      throw error;
    }

    return (data || []).map(mapClientRow);
  },

  // Get newsletter subscribers
  async getNewsletterSubscribers(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('is_active', true)
      .eq('newsletter_subscriber', true)
      .eq('do_not_email', false)
      .order('name');

    if (error) {
      console.error('Error fetching newsletter subscribers:', error);
      throw error;
    }

    return (data || []).map(mapClientRow);
  },

  // Update communication preferences only
  async updateCommunicationPreferences(
    id: string,
    preferences: {
      preferredContactMethod?: Client['preferredContactMethod'];
      doNotEmail?: boolean;
      doNotCall?: boolean;
      doNotMail?: boolean;
      doNotText?: boolean;
      emailOptIn?: boolean;
      newsletterSubscriber?: boolean;
      communicationNotes?: string | null;
    }
  ): Promise<Client> {
    return this.update(id, preferences);
  }
};
