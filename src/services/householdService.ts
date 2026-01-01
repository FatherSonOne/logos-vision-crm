/**
 * Household Service
 * =================
 * Centralized service layer for all household-related operations.
 * Consolidates Supabase calls and business logic.
 */

import { supabase } from './supabaseClient';
import type { Household, HouseholdTotals, HouseholdMember, RelationshipType, Client } from '../types';

// Extended type for household members with full client details
export interface HouseholdMemberWithDetails extends Client {
  relationshipType: RelationshipType;
  isPrimary: boolean;
  relationshipId: string;
}

// Response types for service methods
export interface HouseholdWithStats extends Household {
  memberCount: number;
  totalDonated: number;
  lastDonationDate: string | null;
}

/**
 * Household Service - All household CRUD and relationship operations
 */
export const householdService = {
  /**
   * Get all households with aggregated stats (uses database view)
   */
  async getAll(): Promise<HouseholdTotals[]> {
    const { data, error } = await supabase
      .from('household_totals')
      .select('*')
      .order('name');

    if (error) throw error;

    return (data || []).map(row => ({
      householdId: row.household_id || row.id,
      householdName: row.household_name || row.name,
      address: row.address,
      city: row.city,
      state: row.state,
      zipCode: row.zip_code,
      phone: row.phone,
      email: row.email,
      primaryContactId: row.primary_contact_id,
      isActive: row.is_active ?? true,
      createdAt: row.created_at,
      updatedAt: row.updated_at || row.created_at,
      memberCount: row.member_count || 0,
      totalDonated: parseFloat(row.total_donated) || 0,
      lastDonationDate: row.last_donation_date || null,
    }));
  },

  /**
   * Get a single household by ID
   */
  async getById(householdId: string): Promise<Household | null> {
    const { data, error } = await supabase
      .from('households')
      .select('*')
      .eq('id', householdId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zip_code,
      phone: data.phone,
      email: data.email,
      notes: data.notes,
      primaryContactId: data.primary_contact_id,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  /**
   * Get household members with full contact details
   */
  async getMembers(householdId: string): Promise<HouseholdMemberWithDetails[]> {
    const { data, error } = await supabase
      .from('household_relationships')
      .select(`
        id,
        relationship_type,
        is_primary,
        clients (
          id,
          name,
          contact_person,
          email,
          phone,
          location,
          organization,
          created_at
        )
      `)
      .eq('household_id', householdId);

    if (error) throw error;

    return (data || [])
      .filter((m: any) => m.clients)
      .map((m: any) => ({
        id: m.clients.id,
        name: m.clients.name,
        contactPerson: m.clients.contact_person,
        email: m.clients.email,
        phone: m.clients.phone,
        location: m.clients.location,
        organization: m.clients.organization,
        createdAt: m.clients.created_at,
        relationshipType: m.relationship_type as RelationshipType,
        isPrimary: m.is_primary,
        relationshipId: m.id,
      }));
  },

  /**
   * Get donation stats for a household (all members combined)
   */
  async getDonationStats(memberIds: string[]): Promise<{ total: number; lastDate: string | null }> {
    if (memberIds.length === 0) {
      return { total: 0, lastDate: null };
    }

    const { data, error } = await supabase
      .from('donations')
      .select('amount, donation_date')
      .in('client_id', memberIds);

    if (error) throw error;

    if (!data || data.length === 0) {
      return { total: 0, lastDate: null };
    }

    const total = data.reduce((sum, d) => sum + parseFloat(d.amount), 0);
    const dates = data
      .map(d => new Date(d.donation_date))
      .sort((a, b) => b.getTime() - a.getTime());

    return {
      total,
      lastDate: dates[0]?.toISOString() || null,
    };
  },

  /**
   * Get contacts not assigned to any household
   */
  async getAvailableContacts(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .is('household_id', null)
      .order('name');

    if (error) throw error;

    return (data || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      contactPerson: c.contact_person,
      email: c.email,
      phone: c.phone,
      location: c.location,
      organization: c.organization,
      createdAt: c.created_at,
    }));
  },

  /**
   * Create a new household
   */
  async create(household: Omit<Household, 'id' | 'createdAt' | 'updatedAt'>): Promise<Household> {
    const { data, error } = await supabase
      .from('households')
      .insert({
        name: household.name,
        address: household.address,
        city: household.city,
        state: household.state,
        zip_code: household.zipCode,
        phone: household.phone,
        email: household.email,
        notes: household.notes,
        primary_contact_id: household.primaryContactId,
        is_active: household.isActive ?? true,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zip_code,
      phone: data.phone,
      email: data.email,
      notes: data.notes,
      primaryContactId: data.primary_contact_id,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  /**
   * Update an existing household
   */
  async update(householdId: string, updates: Partial<Household>): Promise<Household> {
    const dbUpdates: Record<string, any> = {};

    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.address !== undefined) dbUpdates.address = updates.address;
    if (updates.city !== undefined) dbUpdates.city = updates.city;
    if (updates.state !== undefined) dbUpdates.state = updates.state;
    if (updates.zipCode !== undefined) dbUpdates.zip_code = updates.zipCode;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.primaryContactId !== undefined) dbUpdates.primary_contact_id = updates.primaryContactId;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

    const { data, error } = await supabase
      .from('households')
      .update(dbUpdates)
      .eq('id', householdId)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zip_code,
      phone: data.phone,
      email: data.email,
      notes: data.notes,
      primaryContactId: data.primary_contact_id,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  /**
   * Delete a household (soft delete by setting is_active to false)
   */
  async delete(householdId: string): Promise<void> {
    // First remove all member relationships
    const members = await this.getMembers(householdId);
    for (const member of members) {
      await this.removeMember(householdId, member.id);
    }

    // Then soft-delete the household
    const { error } = await supabase
      .from('households')
      .update({ is_active: false })
      .eq('id', householdId);

    if (error) throw error;
  },

  /**
   * Add a contact to a household
   * Updates BOTH household_relationships AND clients.household_id for consistency
   */
  async addMember(
    householdId: string,
    contactId: string,
    relationshipType: RelationshipType,
    isPrimary: boolean = false
  ): Promise<void> {
    // Create relationship record
    const { error: relError } = await supabase
      .from('household_relationships')
      .insert({
        household_id: householdId,
        client_id: contactId,
        relationship_type: relationshipType,
        is_primary: isPrimary,
      });

    if (relError) throw relError;

    // Update client's household_id for consistency
    const { error: updateError } = await supabase
      .from('clients')
      .update({ household_id: householdId })
      .eq('id', contactId);

    if (updateError) throw updateError;

    // If this is the primary contact, update household.primary_contact_id
    if (isPrimary) {
      await this.setPrimaryContact(householdId, contactId);
    }
  },

  /**
   * Remove a contact from a household
   * Updates BOTH household_relationships AND clients.household_id for consistency
   */
  async removeMember(householdId: string, contactId: string): Promise<void> {
    // Delete relationship record
    const { error: relError } = await supabase
      .from('household_relationships')
      .delete()
      .eq('household_id', householdId)
      .eq('client_id', contactId);

    if (relError) throw relError;

    // Clear client's household_id
    const { error: updateError } = await supabase
      .from('clients')
      .update({ household_id: null })
      .eq('id', contactId);

    if (updateError) throw updateError;
  },

  /**
   * Set the primary contact for a household
   * Updates BOTH household_relationships.is_primary AND households.primary_contact_id
   */
  async setPrimaryContact(householdId: string, contactId: string): Promise<void> {
    // Clear existing primary flags in relationships
    const { error: clearError } = await supabase
      .from('household_relationships')
      .update({ is_primary: false })
      .eq('household_id', householdId);

    if (clearError) throw clearError;

    // Set new primary in relationships
    const { error: setError } = await supabase
      .from('household_relationships')
      .update({ is_primary: true })
      .eq('household_id', householdId)
      .eq('client_id', contactId);

    if (setError) throw setError;

    // Update household's primary_contact_id
    const { error: householdError } = await supabase
      .from('households')
      .update({ primary_contact_id: contactId })
      .eq('id', householdId);

    if (householdError) throw householdError;
  },

  /**
   * Update a member's relationship type
   */
  async updateMemberRelationship(
    householdId: string,
    contactId: string,
    relationshipType: RelationshipType
  ): Promise<void> {
    const { error } = await supabase
      .from('household_relationships')
      .update({ relationship_type: relationshipType })
      .eq('household_id', householdId)
      .eq('client_id', contactId);

    if (error) throw error;
  },

  /**
   * Get household for a specific contact
   */
  async getHouseholdForContact(contactId: string): Promise<Household | null> {
    // First get the client to find household_id
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('household_id')
      .eq('id', contactId)
      .single();

    if (clientError || !client?.household_id) return null;

    return this.getById(client.household_id);
  },

  /**
   * Search households by name, city, or email
   */
  async search(query: string): Promise<HouseholdTotals[]> {
    const searchTerm = `%${query}%`;

    const { data, error } = await supabase
      .from('household_totals')
      .select('*')
      .or(`name.ilike.${searchTerm},city.ilike.${searchTerm},email.ilike.${searchTerm}`)
      .order('name');

    if (error) throw error;

    return (data || []).map(row => ({
      householdId: row.household_id || row.id,
      householdName: row.household_name || row.name,
      address: row.address,
      city: row.city,
      state: row.state,
      zipCode: row.zip_code,
      phone: row.phone,
      email: row.email,
      primaryContactId: row.primary_contact_id,
      isActive: row.is_active ?? true,
      createdAt: row.created_at,
      updatedAt: row.updated_at || row.created_at,
      memberCount: row.member_count || 0,
      totalDonated: parseFloat(row.total_donated) || 0,
      lastDonationDate: row.last_donation_date || null,
    }));
  },

  /**
   * Get top giving households (for dashboard widget)
   */
  async getTopGiving(limit: number = 5): Promise<HouseholdTotals[]> {
    const { data, error } = await supabase
      .from('household_totals')
      .select('*')
      .gt('total_donated', 0)
      .order('total_donated', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map(row => ({
      householdId: row.household_id || row.id,
      householdName: row.household_name || row.name,
      address: row.address,
      city: row.city,
      state: row.state,
      zipCode: row.zip_code,
      phone: row.phone,
      email: row.email,
      primaryContactId: row.primary_contact_id,
      isActive: row.is_active ?? true,
      createdAt: row.created_at,
      updatedAt: row.updated_at || row.created_at,
      memberCount: row.member_count || 0,
      totalDonated: parseFloat(row.total_donated) || 0,
      lastDonationDate: row.last_donation_date || null,
    }));
  },
};
