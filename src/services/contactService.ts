// Contact Service - CRUD operations for CRM contacts
// Separate from clientService which handles Case Management clients
import { supabase } from './supabaseClient';
import type {
  Contact,
  ContactWithAffiliations,
  OrganizationContactRelation,
  OrganizationRelationshipType,
} from '../types';

// ============================================
// ROW MAPPERS
// ============================================

const mapContactRow = (row: any): Contact => ({
  id: row.id,
  firstName: row.first_name,
  lastName: row.last_name,
  name: row.name,
  email: row.email,
  phone: row.phone,
  address: row.address,
  city: row.city,
  state: row.state,
  zipCode: row.zip_code,
  type: row.type || 'individual',
  engagementScore: row.engagement_score || 'low',
  donorStage: row.donor_stage || 'Prospect',
  totalLifetimeGiving: row.total_lifetime_giving || 0,
  lastGiftDate: row.last_gift_date,
  notes: row.notes,
  preferredContactMethod: row.preferred_contact_method,
  doNotEmail: row.do_not_email ?? false,
  doNotCall: row.do_not_call ?? false,
  doNotMail: row.do_not_mail ?? false,
  doNotText: row.do_not_text ?? false,
  emailOptIn: row.email_opt_in ?? true,
  newsletterSubscriber: row.newsletter_subscriber ?? false,
  isActive: row.is_active ?? true,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapAffiliationRow = (row: any): OrganizationContactRelation => ({
  id: row.id,
  organizationId: row.organization_id,
  contactId: row.contact_id,
  relationshipType: row.relationship_type as OrganizationRelationshipType,
  roleTitle: row.role_title,
  department: row.department,
  isPrimaryContact: row.is_primary_contact ?? false,
  startDate: row.start_date,
  endDate: row.end_date,
  notes: row.notes,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// ============================================
// CONTACT SERVICE
// ============================================

export const contactService = {
  /**
   * Get all contacts
   */
  async getAll(): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }

    console.log('Loaded', data?.length ?? 0, 'contacts');
    return (data || []).map(mapContactRow);
  },

  /**
   * Get contact by ID
   */
  async getById(id: string): Promise<Contact | null> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('Error fetching contact:', error);
      throw error;
    }

    return mapContactRow(data);
  },

  /**
   * Get contact with organization affiliations
   */
  async getWithAffiliations(id: string): Promise<ContactWithAffiliations | null> {
    const contact = await this.getById(id);
    if (!contact) return null;

    const affiliations = await this.getOrganizationAffiliations(id);

    return {
      ...contact,
      affiliations,
    };
  },

  /**
   * Get organizations a contact is affiliated with
   */
  async getOrganizationAffiliations(contactId: string): Promise<OrganizationContactRelation[]> {
    const { data, error } = await supabase
      .from('organization_contacts')
      .select(`
        *,
        organizations:organization_id (id, name, org_type, email, phone)
      `)
      .eq('contact_id', contactId)
      .order('is_primary_contact', { ascending: false });

    if (error) {
      console.error('Error fetching contact affiliations:', error);
      throw error;
    }

    return (data || []).map(row => {
      const affiliation = mapAffiliationRow(row);
      // Attach partial organization info for display purposes
      if (row.organizations) {
        (affiliation as any).organization = {
          id: row.organizations.id,
          name: row.organizations.name,
          orgType: row.organizations.org_type,
          email: row.organizations.email,
          phone: row.organizations.phone,
        };
      }
      return affiliation;
    });
  },

  /**
   * Create a new contact
   */
  async create(contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contact> {
    const insertData = {
      first_name: contact.firstName,
      last_name: contact.lastName,
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      address: contact.address,
      city: contact.city,
      state: contact.state,
      zip_code: contact.zipCode,
      type: contact.type,
      engagement_score: contact.engagementScore,
      donor_stage: contact.donorStage,
      total_lifetime_giving: contact.totalLifetimeGiving,
      last_gift_date: contact.lastGiftDate,
      notes: contact.notes,
      preferred_contact_method: contact.preferredContactMethod,
      do_not_email: contact.doNotEmail,
      do_not_call: contact.doNotCall,
      do_not_mail: contact.doNotMail,
      do_not_text: contact.doNotText,
      email_opt_in: contact.emailOptIn,
      newsletter_subscriber: contact.newsletterSubscriber,
      is_active: contact.isActive ?? true,
    };

    const { data, error } = await supabase
      .from('contacts')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Error creating contact:', error);
      throw error;
    }

    console.log('Created contact:', data.name);
    return mapContactRow(data);
  },

  /**
   * Update a contact
   */
  async update(id: string, updates: Partial<Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Contact> {
    const updateData: Record<string, any> = {};

    if (updates.firstName !== undefined) updateData.first_name = updates.firstName;
    if (updates.lastName !== undefined) updateData.last_name = updates.lastName;
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.address !== undefined) updateData.address = updates.address;
    if (updates.city !== undefined) updateData.city = updates.city;
    if (updates.state !== undefined) updateData.state = updates.state;
    if (updates.zipCode !== undefined) updateData.zip_code = updates.zipCode;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.engagementScore !== undefined) updateData.engagement_score = updates.engagementScore;
    if (updates.donorStage !== undefined) updateData.donor_stage = updates.donorStage;
    if (updates.totalLifetimeGiving !== undefined) updateData.total_lifetime_giving = updates.totalLifetimeGiving;
    if (updates.lastGiftDate !== undefined) updateData.last_gift_date = updates.lastGiftDate;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.preferredContactMethod !== undefined) updateData.preferred_contact_method = updates.preferredContactMethod;
    if (updates.doNotEmail !== undefined) updateData.do_not_email = updates.doNotEmail;
    if (updates.doNotCall !== undefined) updateData.do_not_call = updates.doNotCall;
    if (updates.doNotMail !== undefined) updateData.do_not_mail = updates.doNotMail;
    if (updates.doNotText !== undefined) updateData.do_not_text = updates.doNotText;
    if (updates.emailOptIn !== undefined) updateData.email_opt_in = updates.emailOptIn;
    if (updates.newsletterSubscriber !== undefined) updateData.newsletter_subscriber = updates.newsletterSubscriber;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

    const { data, error } = await supabase
      .from('contacts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating contact:', error);
      throw error;
    }

    console.log('Updated contact:', data.name);
    return mapContactRow(data);
  },

  /**
   * Soft delete a contact (set is_active to false)
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('contacts')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }

    console.log('Deleted contact:', id);
  },

  /**
   * Hard delete a contact (permanent)
   */
  async hardDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error hard deleting contact:', error);
      throw error;
    }

    console.log('Hard deleted contact:', id);
  },

  /**
   * Search contacts by name or email
   */
  async search(query: string): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
      .order('name')
      .limit(50);

    if (error) {
      console.error('Error searching contacts:', error);
      throw error;
    }

    return (data || []).map(mapContactRow);
  },

  /**
   * Get contacts by organization
   */
  async getByOrganization(organizationId: string): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('organization_contacts')
      .select(`
        contact:contact_id (*)
      `)
      .eq('organization_id', organizationId)
      .order('is_primary_contact', { ascending: false });

    if (error) {
      console.error('Error fetching contacts by organization:', error);
      throw error;
    }

    return (data || [])
      .filter(row => row.contact)
      .map(row => mapContactRow(row.contact));
  },

  /**
   * Get contacts by engagement score
   */
  async getByEngagement(score: 'low' | 'medium' | 'high'): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('is_active', true)
      .eq('engagement_score', score)
      .order('total_lifetime_giving', { ascending: false });

    if (error) {
      console.error('Error fetching contacts by engagement:', error);
      throw error;
    }

    return (data || []).map(mapContactRow);
  },

  /**
   * Get contacts by donor stage
   */
  async getByDonorStage(stage: string): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('is_active', true)
      .eq('donor_stage', stage)
      .order('total_lifetime_giving', { ascending: false });

    if (error) {
      console.error('Error fetching contacts by donor stage:', error);
      throw error;
    }

    return (data || []).map(mapContactRow);
  },

  /**
   * Get top donors by lifetime giving
   */
  async getTopDonors(limit: number = 20): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('is_active', true)
      .gt('total_lifetime_giving', 0)
      .order('total_lifetime_giving', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching top donors:', error);
      throw error;
    }

    return (data || []).map(mapContactRow);
  },

  /**
   * Get contacts with email opt-in
   */
  async getEmailOptIn(): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('is_active', true)
      .eq('email_opt_in', true)
      .eq('do_not_email', false)
      .not('email', 'is', null)
      .order('name');

    if (error) {
      console.error('Error fetching email opt-in contacts:', error);
      throw error;
    }

    return (data || []).map(mapContactRow);
  },

  /**
   * Get newsletter subscribers
   */
  async getNewsletterSubscribers(): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('is_active', true)
      .eq('newsletter_subscriber', true)
      .eq('do_not_email', false)
      .not('email', 'is', null)
      .order('name');

    if (error) {
      console.error('Error fetching newsletter subscribers:', error);
      throw error;
    }

    return (data || []).map(mapContactRow);
  },

  /**
   * Get contact stats summary
   */
  async getStats(): Promise<{
    total: number;
    byEngagement: Record<string, number>;
    byDonorStage: Record<string, number>;
    totalLifetimeGiving: number;
    avgLifetimeGiving: number;
  }> {
    const { data, error } = await supabase
      .from('contacts')
      .select('engagement_score, donor_stage, total_lifetime_giving')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching contact stats:', error);
      throw error;
    }

    const contacts = data || [];
    const byEngagement: Record<string, number> = {};
    const byDonorStage: Record<string, number> = {};
    let totalLifetimeGiving = 0;

    for (const contact of contacts) {
      const engagement = contact.engagement_score || 'low';
      const stage = contact.donor_stage || 'Prospect';

      byEngagement[engagement] = (byEngagement[engagement] || 0) + 1;
      byDonorStage[stage] = (byDonorStage[stage] || 0) + 1;
      totalLifetimeGiving += contact.total_lifetime_giving || 0;
    }

    return {
      total: contacts.length,
      byEngagement,
      byDonorStage,
      totalLifetimeGiving,
      avgLifetimeGiving: contacts.length > 0 ? totalLifetimeGiving / contacts.length : 0,
    };
  },

  /**
   * Add contact to organization
   */
  async addToOrganization(
    contactId: string,
    organizationId: string,
    relationshipType: OrganizationRelationshipType,
    options?: {
      roleTitle?: string;
      department?: string;
      isPrimaryContact?: boolean;
      startDate?: string;
      endDate?: string;
      notes?: string;
    }
  ): Promise<OrganizationContactRelation> {
    const insertData = {
      contact_id: contactId,
      organization_id: organizationId,
      relationship_type: relationshipType,
      role_title: options?.roleTitle || null,
      department: options?.department || null,
      is_primary_contact: options?.isPrimaryContact ?? false,
      start_date: options?.startDate || null,
      end_date: options?.endDate || null,
      notes: options?.notes || null,
    };

    const { data, error } = await supabase
      .from('organization_contacts')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Error adding contact to organization:', error);
      throw error;
    }

    return mapAffiliationRow(data);
  },

  /**
   * Remove contact from organization
   */
  async removeFromOrganization(contactId: string, organizationId: string): Promise<void> {
    const { error } = await supabase
      .from('organization_contacts')
      .delete()
      .eq('contact_id', contactId)
      .eq('organization_id', organizationId);

    if (error) {
      console.error('Error removing contact from organization:', error);
      throw error;
    }
  },

  /**
   * Update organization affiliation
   */
  async updateAffiliation(
    id: string,
    updates: Partial<Omit<OrganizationContactRelation, 'id' | 'organizationId' | 'contactId' | 'createdAt' | 'updatedAt'>>
  ): Promise<OrganizationContactRelation> {
    const updateData: Record<string, any> = {};

    if (updates.relationshipType !== undefined) updateData.relationship_type = updates.relationshipType;
    if (updates.roleTitle !== undefined) updateData.role_title = updates.roleTitle;
    if (updates.department !== undefined) updateData.department = updates.department;
    if (updates.isPrimaryContact !== undefined) updateData.is_primary_contact = updates.isPrimaryContact;
    if (updates.startDate !== undefined) updateData.start_date = updates.startDate;
    if (updates.endDate !== undefined) updateData.end_date = updates.endDate;
    if (updates.notes !== undefined) updateData.notes = updates.notes;

    const { data, error } = await supabase
      .from('organization_contacts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating affiliation:', error);
      throw error;
    }

    return mapAffiliationRow(data);
  },
};
