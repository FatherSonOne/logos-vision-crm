// Donation Service - Handles all database operations for Donations
import { supabase } from './supabaseClient';
import { logActivity } from './collaborationService';
import type { Donation, TeamMember } from '../types';

// Helper function to convert database format to app format
function dbToDonation(dbDonation: any): Donation {
  return {
    id: dbDonation.id,
    donorName: dbDonation.donor_name,
    clientId: dbDonation.client_id,
    amount: parseFloat(dbDonation.amount),
    donationDate: dbDonation.donation_date,
    campaign: dbDonation.notes || '' // Campaign stored in notes
  };
}

export const donationService = {
  // Get all donations
  async getAll(): Promise<Donation[]> {
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .order('donation_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching donations:', error);
      throw error;
    }
    
    return (data || []).map(dbToDonation);
  },

  // Get donations by client
  async getByClient(clientId: string): Promise<Donation[]> {
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .eq('client_id', clientId)
      .order('donation_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching client donations:', error);
      throw error;
    }
    
    return (data || []).map(dbToDonation);
  },

  // Get a single donation by ID
  async getById(id: string): Promise<Donation | null> {
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching donation:', error);
      throw error;
    }
    
    return data ? dbToDonation(data) : null;
  },

  // Create a new donation
  async create(donation: Partial<Donation>, currentUser?: TeamMember): Promise<Donation> {
    const { data, error } = await supabase
      .from('donations')
      .insert([{
        client_id: donation.clientId || null,
        donor_name: donation.donorName,
        donor_email: null,
        amount: donation.amount,
        currency: 'USD',
        donation_date: donation.donationDate,
        payment_method: null,
        notes: donation.campaign || null
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating donation:', error);
      throw error;
    }

    const newDonation = dbToDonation(data);

    // Log activity
    if (currentUser) {
      try {
        await logActivity({
          entityType: 'donation',
          entityId: newDonation.id,
          action: 'created',
          actor: currentUser,
          description: `Created donation: $${newDonation.amount} from ${newDonation.donorName}`,
          metadata: {
            amount: newDonation.amount,
            donorName: newDonation.donorName,
            campaign: newDonation.campaign,
            donationDate: newDonation.donationDate,
          }
        });
      } catch (error) {
        console.error('Failed to log donation creation activity:', error);
        // Don't throw - donation was created successfully
      }
    }

    return newDonation;
  },

  // Update an existing donation
  async update(id: string, updates: Partial<Donation>, currentUser?: TeamMember): Promise<Donation> {
    // Get the old donation for change tracking
    const oldDonation = currentUser ? await this.getById(id) : null;

    const updateData: any = {};

    if (updates.donorName !== undefined) updateData.donor_name = updates.donorName;
    if (updates.clientId !== undefined) updateData.client_id = updates.clientId;
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.donationDate !== undefined) updateData.donation_date = updates.donationDate;
    if (updates.campaign !== undefined) updateData.notes = updates.campaign;

    const { data, error } = await supabase
      .from('donations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating donation:', error);
      throw error;
    }

    const updatedDonation = dbToDonation(data);

    // Log activity with changes
    if (currentUser && oldDonation) {
      try {
        // Calculate changes
        const changes: Record<string, { old: any; new: any }> = {};
        const relevantFields: (keyof Donation)[] = ['donorName', 'amount', 'donationDate', 'campaign'];

        for (const field of relevantFields) {
          if (field in updates && oldDonation[field] !== updatedDonation[field]) {
            changes[field] = { old: oldDonation[field], new: updatedDonation[field] };
          }
        }

        if (Object.keys(changes).length > 0) {
          await logActivity({
            entityType: 'donation',
            entityId: id,
            action: 'updated',
            actor: currentUser,
            description: `Updated donation: $${updatedDonation.amount} from ${updatedDonation.donorName}`,
            changes
          });
        }
      } catch (error) {
        console.error('Failed to log donation update activity:', error);
        // Don't throw - donation was updated successfully
      }
    }

    return updatedDonation;
  },

  // Delete a donation
  async delete(id: string, currentUser?: TeamMember): Promise<void> {
    // Get donation info before deletion for logging
    const donation = currentUser ? await this.getById(id) : null;

    const { error } = await supabase
      .from('donations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting donation:', error);
      throw error;
    }

    // Log activity
    if (currentUser && donation) {
      try {
        await logActivity({
          entityType: 'donation',
          entityId: id,
          action: 'deleted',
          actor: currentUser,
          description: `Deleted donation: $${donation.amount} from ${donation.donorName}`,
          metadata: {
            amount: donation.amount,
            donorName: donation.donorName,
            campaign: donation.campaign,
          }
        });
      } catch (error) {
        console.error('Failed to log donation deletion activity:', error);
        // Don't throw - donation was deleted successfully
      }
    }
  },

  // Get donation statistics
  async getStats(clientId?: string): Promise<{ total: number; count: number }> {
    let query = supabase
      .from('donations')
      .select('amount');
    
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching donation stats:', error);
      throw error;
    }
    
    const total = (data || []).reduce((sum, d) => sum + parseFloat(d.amount), 0);
    const count = (data || []).length;
    
    return { total, count };
  }
};
