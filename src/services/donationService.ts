// Donation Service - Handles all database operations for Donations
import { supabase } from './supabaseClient';
import type { Donation } from '../types';

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
  async create(donation: Partial<Donation>): Promise<Donation> {
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
    
    return dbToDonation(data);
  },

  // Update an existing donation
  async update(id: string, updates: Partial<Donation>): Promise<Donation> {
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
    
    return dbToDonation(data);
  },

  // Delete a donation
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('donations')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting donation:', error);
      throw error;
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
