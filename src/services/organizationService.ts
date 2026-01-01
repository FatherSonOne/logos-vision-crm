// Organization Service - CRUD operations for CRM organizations
// Uses the new 'organizations' table (separate from Case Management 'clients')
import { supabase } from './supabaseClient';
import type {
  Organization,
  OrganizationType,
  OrganizationWithDetails,
  OrganizationContact,
  OrganizationHierarchy,
  OrganizationSummary,
  ContactAffiliation,
  OrganizationDonationRollup,
  OrganizationWithContacts,
  OrganizationRelationshipType,
  OrganizationHierarchyType,
  Contact,
} from '../types';

// ============================================
// ROW MAPPERS
// ============================================

const mapOrganizationRow = (row: any): Organization => ({
  id: row.id,
  name: row.name,
  orgType: row.org_type || 'nonprofit',
  email: row.email,
  phone: row.phone,
  website: row.website,
  address: row.address,
  city: row.city,
  state: row.state,
  zipCode: row.zip_code,
  ein: row.ein,
  missionStatement: row.mission_statement,
  primaryContactId: row.primary_contact_id,
  parentOrgId: row.parent_org_id,
  totalDonations: row.total_donations || 0,
  contactCount: row.contact_count || 0,
  notes: row.notes,
  isActive: row.is_active ?? true,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapOrganizationContactRow = (row: any): OrganizationContact => ({
  id: row.id,
  organizationId: row.organization_id,
  contactId: row.contact_id,
  relationshipType: row.relationship_type as OrganizationRelationshipType,
  roleTitle: row.role_title,
  isPrimaryContact: row.is_primary_contact ?? false,
  startDate: row.start_date,
  endDate: row.end_date,
  notes: row.notes,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  // Joined fields
  organizationName: row.organization_name || row.organizations?.name,
  contactName: row.contact_name || row.contacts?.name,
  contactEmail: row.contact_email || row.contacts?.email,
});

const mapOrganizationHierarchyRow = (row: any): OrganizationHierarchy => ({
  id: row.id,
  parentOrgId: row.parent_org_id,
  childOrgId: row.child_org_id,
  relationshipType: row.relationship_type as OrganizationHierarchyType,
  notes: row.notes,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  // Joined fields
  parentOrgName: row.parent_org_name || row.parent_org?.name,
  childOrgName: row.child_org_name || row.child_org?.name,
});

const mapContactAffiliationRow = (row: any): ContactAffiliation => ({
  contactId: row.contact_id,
  contactName: row.contact_name,
  contactEmail: row.contact_email,
  organizationId: row.organization_id,
  organizationName: row.organization_name,
  relationshipType: row.relationship_type as OrganizationRelationshipType,
  roleTitle: row.role_title,
  isPrimaryContact: row.is_primary_contact ?? false,
  startDate: row.start_date,
  endDate: row.end_date,
  isCurrent: row.is_current ?? true,
});

const mapOrganizationDonationRollupRow = (row: any): OrganizationDonationRollup => ({
  organizationId: row.organization_id,
  organizationName: row.organization_name,
  totalDonations: row.total_donations ?? 0,
  totalAmount: row.total_amount ?? 0,
  uniqueDonors: row.unique_donors ?? 0,
  lastDonationDate: row.last_donation_date,
  averageDonation: row.average_donation ?? 0,
});

// ============================================
// ORGANIZATION SERVICE
// ============================================

export const organizationService = {
  // ========== Organization CRUD ==========

  /**
   * Get all organizations
   */
  async getAll(): Promise<Organization[]> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching organizations:', error);
      throw error;
    }

    console.log('Loaded', data?.length ?? 0, 'organizations');
    return (data || []).map(mapOrganizationRow);
  },

  /**
   * Get organization by ID
   */
  async getById(id: string): Promise<Organization | null> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('Error fetching organization:', error);
      throw error;
    }

    return mapOrganizationRow(data);
  },

  /**
   * Create a new organization
   */
  async create(org: Omit<Organization, 'id' | 'createdAt' | 'updatedAt' | 'contactCount' | 'totalDonations'>): Promise<Organization> {
    const insertData = {
      name: org.name,
      org_type: org.orgType,
      email: org.email,
      phone: org.phone,
      website: org.website,
      address: org.address,
      city: org.city,
      state: org.state,
      zip_code: org.zipCode,
      ein: org.ein,
      mission_statement: org.missionStatement,
      primary_contact_id: org.primaryContactId,
      parent_org_id: org.parentOrgId,
      notes: org.notes,
      is_active: org.isActive ?? true,
    };

    const { data, error } = await supabase
      .from('organizations')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Error creating organization:', error);
      throw error;
    }

    console.log('Created organization:', data.name);
    return mapOrganizationRow(data);
  },

  /**
   * Update an organization
   */
  async update(id: string, updates: Partial<Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Organization> {
    const updateData: Record<string, any> = {};

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.orgType !== undefined) updateData.org_type = updates.orgType;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.website !== undefined) updateData.website = updates.website;
    if (updates.address !== undefined) updateData.address = updates.address;
    if (updates.city !== undefined) updateData.city = updates.city;
    if (updates.state !== undefined) updateData.state = updates.state;
    if (updates.zipCode !== undefined) updateData.zip_code = updates.zipCode;
    if (updates.ein !== undefined) updateData.ein = updates.ein;
    if (updates.missionStatement !== undefined) updateData.mission_statement = updates.missionStatement;
    if (updates.primaryContactId !== undefined) updateData.primary_contact_id = updates.primaryContactId;
    if (updates.parentOrgId !== undefined) updateData.parent_org_id = updates.parentOrgId;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

    const { data, error } = await supabase
      .from('organizations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating organization:', error);
      throw error;
    }

    console.log('Updated organization:', data.name);
    return mapOrganizationRow(data);
  },

  /**
   * Soft delete an organization
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('organizations')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Error deleting organization:', error);
      throw error;
    }

    console.log('Deleted organization:', id);
  },

  /**
   * Search organizations by name
   */
  async search(query: string): Promise<Organization[]> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,ein.ilike.%${query}%`)
      .order('name')
      .limit(50);

    if (error) {
      console.error('Error searching organizations:', error);
      throw error;
    }

    return (data || []).map(mapOrganizationRow);
  },

  /**
   * Get organizations by type
   */
  async getByType(orgType: OrganizationType): Promise<Organization[]> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('is_active', true)
      .eq('org_type', orgType)
      .order('name');

    if (error) {
      console.error('Error fetching organizations by type:', error);
      throw error;
    }

    return (data || []).map(mapOrganizationRow);
  },

  // ========== Organization Contacts ==========

  /**
   * Get all contacts affiliated with an organization
   */
  async getOrganizationContacts(organizationId: string): Promise<OrganizationContact[]> {
    const { data, error } = await supabase
      .from('organization_contacts')
      .select(`
        *,
        contacts:contact_id (id, name, email, phone),
        organizations:organization_id (id, name)
      `)
      .eq('organization_id', organizationId)
      .order('is_primary_contact', { ascending: false })
      .order('relationship_type');

    if (error) {
      console.error('Error fetching organization contacts:', error);
      throw error;
    }

    console.log('Loaded', data?.length ?? 0, 'contacts for organization');
    return (data || []).map(mapOrganizationContactRow);
  },

  /**
   * Get all organizations a contact is affiliated with
   */
  async getContactAffiliations(contactId: string): Promise<ContactAffiliation[]> {
    const { data, error } = await supabase
      .from('contact_affiliations')
      .select('*')
      .eq('contact_id', contactId);

    if (error) {
      console.error('Error fetching contact affiliations:', error);
      throw error;
    }

    return (data || []).map(mapContactAffiliationRow);
  },

  /**
   * Add a contact to an organization
   */
  async addContactToOrganization(
    organizationId: string,
    contactId: string,
    relationshipType: OrganizationRelationshipType,
    options?: {
      roleTitle?: string;
      department?: string;
      isPrimaryContact?: boolean;
      startDate?: string;
      endDate?: string;
      notes?: string;
    }
  ): Promise<OrganizationContact> {
    const insertData = {
      organization_id: organizationId,
      contact_id: contactId,
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

    console.log('Added contact to organization');
    return mapOrganizationContactRow(data);
  },

  /**
   * Update an organization-contact relationship
   */
  async updateOrganizationContact(
    id: string,
    updates: Partial<Omit<OrganizationContact, 'id' | 'organizationId' | 'contactId' | 'createdAt' | 'updatedAt'>>
  ): Promise<OrganizationContact> {
    const updateData: any = {};

    if (updates.relationshipType !== undefined) updateData.relationship_type = updates.relationshipType;
    if (updates.roleTitle !== undefined) updateData.role_title = updates.roleTitle;
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
      console.error('Error updating organization contact:', error);
      throw error;
    }

    console.log('Updated organization contact');
    return mapOrganizationContactRow(data);
  },

  /**
   * Remove a contact from an organization
   */
  async removeContactFromOrganization(id: string): Promise<void> {
    const { error } = await supabase
      .from('organization_contacts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error removing contact from organization:', error);
      throw error;
    }

    console.log('Removed contact from organization');
  },

  /**
   * Set a contact as primary for an organization
   */
  async setPrimaryContact(organizationId: string, contactId: string): Promise<void> {
    // First, unset all primary contacts for this org
    const { error: unsetError } = await supabase
      .from('organization_contacts')
      .update({ is_primary_contact: false })
      .eq('organization_id', organizationId)
      .eq('is_primary_contact', true);

    if (unsetError) {
      console.error('Error unsetting primary contacts:', unsetError);
      throw unsetError;
    }

    // Then set the new primary contact
    const { error: setError } = await supabase
      .from('organization_contacts')
      .update({ is_primary_contact: true })
      .eq('organization_id', organizationId)
      .eq('contact_id', contactId);

    if (setError) {
      console.error('Error setting primary contact:', setError);
      throw setError;
    }

    // Also update the organization's primary_contact_id
    const { error: orgError } = await supabase
      .from('organizations')
      .update({ primary_contact_id: contactId })
      .eq('id', organizationId);

    if (orgError) {
      console.error('Error updating organization primary contact:', orgError);
      throw orgError;
    }

    console.log('Set primary contact for organization');
  },

  // ========== Organization Hierarchy ==========

  /**
   * Get child organizations of a parent
   */
  async getChildOrganizations(parentOrgId: string): Promise<OrganizationHierarchy[]> {
    const { data, error } = await supabase
      .from('organization_hierarchy')
      .select(`
        *,
        child_org:child_org_id (id, name, org_type, email, phone)
      `)
      .eq('parent_org_id', parentOrgId);

    if (error) {
      console.error('Error fetching child organizations:', error);
      throw error;
    }

    return (data || []).map(mapOrganizationHierarchyRow);
  },

  /**
   * Get parent organization of a child
   */
  async getParentOrganization(childOrgId: string): Promise<OrganizationHierarchy | null> {
    const { data, error } = await supabase
      .from('organization_hierarchy')
      .select(`
        *,
        parent_org:parent_org_id (id, name, org_type, email, phone)
      `)
      .eq('child_org_id', childOrgId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching parent organization:', error);
      throw error;
    }

    return data ? mapOrganizationHierarchyRow(data) : null;
  },

  /**
   * Add a child organization to a parent
   */
  async addChildOrganization(
    parentOrgId: string,
    childOrgId: string,
    relationshipType: OrganizationHierarchyType = 'subsidiary',
    notes?: string
  ): Promise<OrganizationHierarchy> {
    const { data, error } = await supabase
      .from('organization_hierarchy')
      .insert([{
        parent_org_id: parentOrgId,
        child_org_id: childOrgId,
        relationship_type: relationshipType,
        notes: notes || null,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding child organization:', error);
      throw error;
    }

    // Also update the child org's parent_org_id
    await supabase
      .from('organizations')
      .update({ parent_org_id: parentOrgId })
      .eq('id', childOrgId);

    console.log('Added child organization');
    return mapOrganizationHierarchyRow(data);
  },

  /**
   * Remove a child organization from a parent
   */
  async removeChildOrganization(id: string, childOrgId?: string): Promise<void> {
    const { error } = await supabase
      .from('organization_hierarchy')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error removing child organization:', error);
      throw error;
    }

    // Clear the child org's parent_org_id
    if (childOrgId) {
      await supabase
        .from('organizations')
        .update({ parent_org_id: null })
        .eq('id', childOrgId);
    }

    console.log('Removed child organization');
  },

  // ========== Aggregated Data ==========

  /**
   * Get donation roll-up for an organization
   */
  async getOrganizationDonationRollup(organizationId: string): Promise<OrganizationDonationRollup | null> {
    const { data, error } = await supabase
      .from('organization_donation_rollup')
      .select('*')
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching organization donation rollup:', error);
      throw error;
    }

    return data ? mapOrganizationDonationRollupRow(data) : null;
  },

  /**
   * Get full organization details including contacts, hierarchy, and donations
   */
  async getWithDetails(organizationId: string): Promise<OrganizationWithDetails | null> {
    const org = await this.getById(organizationId);
    if (!org) return null;

    const contacts = await this.getOrganizationContacts(organizationId);
    const childOrgs = await this.getChildOrganizations(organizationId);
    const donationRollup = await this.getOrganizationDonationRollup(organizationId);

    // Get child organization details
    const childOrganizations: Organization[] = [];
    for (const child of childOrgs) {
      const childOrg = await this.getById(child.childOrgId);
      if (childOrg) {
        childOrganizations.push(childOrg);
      }
    }

    // Get parent organization if exists
    let parentOrganization: Organization | null = null;
    if (org.parentOrgId) {
      parentOrganization = await this.getById(org.parentOrgId);
    }

    return {
      ...org,
      contacts: contacts.map(c => ({
        ...c,
        contact: undefined, // Populated from contacts table
      })),
      childOrganizations,
      parentOrganization,
      donationStats: donationRollup ? {
        totalAmount: donationRollup.totalAmount,
        donationCount: donationRollup.totalDonations,
        uniqueDonors: donationRollup.uniqueDonors,
        lastDonationDate: donationRollup.lastDonationDate,
        averageDonation: donationRollup.averageDonation,
      } : undefined,
    };
  },

  /**
   * Get all organizations for listing (summary view)
   */
  async getAllSummary(): Promise<OrganizationSummary[]> {
    // Try to use the organization_summary view first
    const { data, error } = await supabase
      .from('organization_summary')
      .select('*')
      .order('organization_name');

    if (error) {
      console.warn('organization_summary view not available, using organizations table');

      // Fall back to direct table query
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (orgError) {
        console.error('Error fetching organizations:', orgError);
        throw orgError;
      }

      return (orgData || []).map(row => ({
        organizationId: row.id,
        organizationName: row.name,
        email: row.email,
        phone: row.phone,
        location: row.city && row.state ? `${row.city}, ${row.state}` : row.city || row.state || null,
        clientType: row.org_type === 'nonprofit' ? 'nonprofit' as const : 'organization' as const,
        isActive: row.is_active ?? true,
        createdAt: row.created_at,
        affiliatedContactsCount: row.contact_count || 0,
        primaryContactsCount: row.primary_contact_id ? 1 : 0,
        childOrgsCount: 0,
        parentOrgId: row.parent_org_id,
      }));
    }

    return (data || []).map(row => ({
      organizationId: row.organization_id,
      organizationName: row.organization_name,
      email: row.email,
      phone: row.phone,
      location: row.city && row.state ? `${row.city}, ${row.state}` : row.city || row.state || null,
      clientType: row.org_type === 'nonprofit' ? 'nonprofit' as const : 'organization' as const,
      isActive: row.is_active ?? true,
      createdAt: row.created_at,
      affiliatedContactsCount: row.affiliated_contacts_count ?? 0,
      primaryContactsCount: row.primary_contacts_count ?? 0,
      childOrgsCount: row.child_orgs_count ?? 0,
      parentOrgId: row.parent_org_id,
    }));
  },

  // Legacy method - kept for backward compatibility
  async getAllOrganizations(): Promise<OrganizationSummary[]> {
    return this.getAllSummary();
  },

  // Legacy method - kept for backward compatibility
  async searchOrganizations(query: string): Promise<OrganizationSummary[]> {
    const orgs = await this.search(query);
    return orgs.map(org => ({
      organizationId: org.id,
      organizationName: org.name,
      email: org.email,
      phone: org.phone,
      location: org.city && org.state ? `${org.city}, ${org.state}` : org.city || org.state || null,
      clientType: org.orgType === 'nonprofit' ? 'nonprofit' as const : 'organization' as const,
      isActive: org.isActive,
      createdAt: org.createdAt,
      affiliatedContactsCount: org.contactCount,
      primaryContactsCount: org.primaryContactId ? 1 : 0,
      childOrgsCount: 0,
      parentOrgId: org.parentOrgId,
    }));
  },

  /**
   * Get organization stats summary
   */
  async getStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    totalDonations: number;
    totalContacts: number;
  }> {
    const { data, error } = await supabase
      .from('organizations')
      .select('org_type, total_donations, contact_count')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching organization stats:', error);
      throw error;
    }

    const orgs = data || [];
    const byType: Record<string, number> = {};
    let totalDonations = 0;
    let totalContacts = 0;

    for (const org of orgs) {
      const type = org.org_type || 'other';
      byType[type] = (byType[type] || 0) + 1;
      totalDonations += org.total_donations || 0;
      totalContacts += org.contact_count || 0;
    }

    return {
      total: orgs.length,
      byType,
      totalDonations,
      totalContacts,
    };
  },

  /**
   * Get organization hierarchy tree for visualization
   */
  async getOrganizationTree(rootOrgId: string): Promise<{
    id: string;
    name: string;
    type: OrganizationHierarchyType | 'root';
    children: any[];
  }> {
    const org = await this.getById(rootOrgId);
    if (!org) {
      throw new Error('Organization not found');
    }

    const buildTree = async (orgId: string, orgName: string): Promise<any> => {
      const children = await this.getChildOrganizations(orgId);
      const childTrees = await Promise.all(
        children.map(async (child) => {
          const childOrg = await this.getById(child.childOrgId);
          return {
            id: child.childOrgId,
            name: childOrg?.name || child.childOrgName || 'Unknown',
            type: child.relationshipType,
            children: await buildTree(child.childOrgId, childOrg?.name || '').then(t => t.children),
          };
        })
      );

      return {
        id: orgId,
        name: orgName,
        type: 'root' as const,
        children: childTrees,
      };
    };

    return buildTree(rootOrgId, org.name);
  },

  // Legacy method for backward compatibility
  async getOrganizationWithDetails(organizationId: string): Promise<OrganizationWithContacts | null> {
    const details = await this.getWithDetails(organizationId);
    if (!details) return null;

    return {
      organizationId: details.id,
      organizationName: details.name,
      email: details.email,
      phone: details.phone,
      location: details.city && details.state ? `${details.city}, ${details.state}` : details.city || details.state || null,
      clientType: details.orgType === 'nonprofit' ? 'nonprofit' : 'organization',
      isActive: details.isActive,
      createdAt: details.createdAt,
      affiliatedContactsCount: details.contacts.length,
      primaryContactsCount: details.contacts.filter(c => c.isPrimaryContact).length,
      childOrgsCount: details.childOrganizations.length,
      parentOrgId: details.parentOrgId,
      contacts: details.contacts,
      childOrganizations: details.childOrganizations.map(child => ({
        id: `hierarchy-${child.id}`,
        parentOrgId: details.id,
        childOrgId: child.id,
        relationshipType: 'subsidiary' as OrganizationHierarchyType,
        notes: null,
        createdAt: child.createdAt,
        updatedAt: child.updatedAt,
        childOrgName: child.name,
      })),
      parentOrganization: details.parentOrganization ? {
        id: `hierarchy-parent-${details.id}`,
        parentOrgId: details.parentOrganization.id,
        childOrgId: details.id,
        relationshipType: 'subsidiary' as OrganizationHierarchyType,
        notes: null,
        createdAt: details.parentOrganization.createdAt,
        updatedAt: details.parentOrganization.updatedAt,
        parentOrgName: details.parentOrganization.name,
      } : null,
      donationRollup: details.donationStats ? {
        organizationId: details.id,
        organizationName: details.name,
        totalDonations: details.donationStats.donationCount,
        totalAmount: details.donationStats.totalAmount,
        uniqueDonors: details.donationStats.uniqueDonors,
        lastDonationDate: details.donationStats.lastDonationDate,
        averageDonation: details.donationStats.averageDonation,
      } : null,
    };
  },
};
