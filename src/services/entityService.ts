/**
 * Entity Service - Multi-Table Contact Routing
 *
 * This service provides unified access to contacts across multiple database tables:
 * - contacts (5 rows) - Direct CRM contacts
 * - clients (513 rows) - Case management clients
 * - organizations (5 rows) - Organization entities
 * - team_members - Internal team as contacts
 * - pulse_volunteers - Volunteer contacts
 *
 * All entities are transformed to the unified Contact interface with a virtual
 * entity_type field for filtering and display.
 */

import { supabase } from './supabaseClient';
import type { Contact, Client, Organization, TeamMember } from '../types';
import { logger } from '../utils/logger';

export type EntityType = 'contact' | 'client' | 'organization' | 'volunteer' | 'team' | 'all';

export interface ContactWithEntityType extends Contact {
  entity_type: EntityType;
}

/**
 * Transform Client to Contact format
 */
function transformClientToContact(client: Client): ContactWithEntityType {
  // Split name into first/last if possible
  const nameParts = client.name.split(' ');
  const firstName = nameParts[0] || client.name;
  const lastName = nameParts.slice(1).join(' ') || null;

  return {
    id: client.id,
    firstName,
    lastName,
    name: client.name,
    email: client.email || null,
    phone: client.phone || null,
    address: client.location || null,
    city: null,
    state: null,
    zipCode: null,
    type: 'individual',
    engagementScore: 'medium', // Default, could be calculated from communication logs
    donorStage: 'Active Client',
    totalLifetimeGiving: 0, // Would need to join with donations table
    lastGiftDate: null,
    notes: client.notes || null,
    preferredContactMethod: client.preferredContactMethod || null,
    doNotEmail: client.doNotEmail || false,
    doNotCall: client.doNotCall || false,
    doNotMail: client.doNotMail || false,
    doNotText: client.doNotText || false,
    emailOptIn: client.emailOptIn ?? true,
    newsletterSubscriber: client.newsletterSubscriber || false,
    isActive: true,
    createdAt: client.createdAt,
    updatedAt: client.updatedAt || client.createdAt,

    // Additional fields
    company: client.organization || null,
    job_title: client.contactPerson !== client.name ? client.contactPerson : null,
    linkedin_url: null,
    avatar_url: null,

    // Virtual field
    entity_type: 'client' as EntityType,
  };
}

/**
 * Transform Organization to Contact format
 */
function transformOrganizationToContact(org: Organization): ContactWithEntityType {
  return {
    id: org.id,
    firstName: null,
    lastName: null,
    name: org.name,
    email: org.email || null,
    phone: org.phone || null,
    address: org.address || null,
    city: org.city || null,
    state: org.state || null,
    zipCode: org.zipCode || null,
    type: 'organization_contact',
    engagementScore: org.totalDonations > 10000 ? 'high' : org.totalDonations > 1000 ? 'medium' : 'low',
    donorStage: org.totalDonations > 0 ? 'Donor' : 'Prospect',
    totalLifetimeGiving: org.totalDonations,
    lastGiftDate: null,
    notes: org.notes || null,
    preferredContactMethod: null,
    doNotEmail: false,
    doNotCall: false,
    doNotMail: false,
    doNotText: false,
    emailOptIn: true,
    newsletterSubscriber: false,
    isActive: org.isActive,
    createdAt: org.createdAt,
    updatedAt: org.updatedAt,

    // Additional fields
    company: org.name,
    job_title: null,
    linkedin_url: null,
    avatar_url: null,

    // Virtual field
    entity_type: 'organization' as EntityType,
  };
}

/**
 * Transform TeamMember to Contact format
 */
function transformTeamMemberToContact(member: TeamMember): ContactWithEntityType {
  // Split name into first/last if possible
  const nameParts = member.name.split(' ');
  const firstName = nameParts[0] || member.name;
  const lastName = nameParts.slice(1).join(' ') || null;

  return {
    id: member.id,
    firstName,
    lastName,
    name: member.name,
    email: member.email || null,
    phone: member.phone || null,
    address: null,
    city: null,
    state: null,
    zipCode: null,
    type: 'individual',
    engagementScore: 'high', // Team members are highly engaged
    donorStage: 'Team',
    totalLifetimeGiving: 0,
    lastGiftDate: null,
    notes: null,
    preferredContactMethod: 'email',
    doNotEmail: false,
    doNotCall: false,
    doNotMail: false,
    doNotText: false,
    emailOptIn: true,
    newsletterSubscriber: false,
    isActive: member.isActive ?? true,
    createdAt: member.createdAt || new Date().toISOString(),
    updatedAt: member.updatedAt || new Date().toISOString(),

    // Additional fields
    company: 'Logos Vision',
    job_title: member.role,
    linkedin_url: null,
    avatar_url: member.profilePicture || null,

    // Virtual field
    entity_type: 'team' as EntityType,
  };
}

/**
 * Load contacts from the contacts table
 */
async function loadContacts(): Promise<ContactWithEntityType[]> {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    return (data || []).map(contact => ({
      ...contact,
      entity_type: 'contact' as EntityType,
    }));
  } catch (error) {
    logger.error('Error loading contacts:', error);
    return [];
  }
}

/**
 * Load clients and transform to contacts
 */
async function loadClients(): Promise<ContactWithEntityType[]> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name');

    if (error) throw error;

    return (data || []).map(transformClientToContact);
  } catch (error) {
    logger.error('Error loading clients:', error);
    return [];
  }
}

/**
 * Load organizations and transform to contacts
 */
async function loadOrganizations(): Promise<ContactWithEntityType[]> {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    return (data || []).map(transformOrganizationToContact);
  } catch (error) {
    logger.error('Error loading organizations:', error);
    return [];
  }
}

/**
 * Load team members and transform to contacts
 */
async function loadTeamMembers(): Promise<ContactWithEntityType[]> {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('id, name, email, phone, role, isActive, createdAt, updatedAt')
      .eq('isActive', true)
      .order('name');

    if (error) throw error;

    return (data || []).map(transformTeamMemberToContact);
  } catch (error) {
    logger.error('Error loading team members:', error);
    return [];
  }
}

/**
 * Load volunteers from pulse_volunteers table
 */
async function loadVolunteers(): Promise<ContactWithEntityType[]> {
  try {
    // Check if pulse_volunteers table exists
    const { data, error } = await supabase
      .from('pulse_volunteers')
      .select('*')
      .order('name')
      .limit(1);

    // If table doesn't exist, return empty array
    if (error && error.code === '42P01') {
      logger.info('pulse_volunteers table does not exist, skipping');
      return [];
    }

    if (error) throw error;

    // If successful, load all volunteers
    const { data: volunteers, error: loadError } = await supabase
      .from('pulse_volunteers')
      .select('*')
      .order('name');

    if (loadError) throw loadError;

    // Transform volunteers to contacts
    return (volunteers || []).map((volunteer: any) => ({
      id: volunteer.id,
      firstName: volunteer.first_name || null,
      lastName: volunteer.last_name || null,
      name: volunteer.name || `${volunteer.first_name || ''} ${volunteer.last_name || ''}`.trim(),
      email: volunteer.email || null,
      phone: volunteer.phone || null,
      address: null,
      city: null,
      state: null,
      zipCode: null,
      type: 'individual' as const,
      engagementScore: 'high' as const,
      donorStage: 'Volunteer',
      totalLifetimeGiving: 0,
      lastGiftDate: null,
      notes: volunteer.notes || null,
      preferredContactMethod: null,
      doNotEmail: false,
      doNotCall: false,
      doNotMail: false,
      doNotText: false,
      emailOptIn: true,
      newsletterSubscriber: false,
      isActive: volunteer.is_active ?? true,
      createdAt: volunteer.created_at || new Date().toISOString(),
      updatedAt: volunteer.updated_at || new Date().toISOString(),
      company: null,
      job_title: null,
      linkedin_url: null,
      avatar_url: null,
      entity_type: 'volunteer' as EntityType,
    }));
  } catch (error) {
    logger.error('Error loading volunteers:', error);
    return [];
  }
}

/**
 * Get contacts by entity type
 */
export async function getByType(type: EntityType): Promise<ContactWithEntityType[]> {
  logger.info(`[EntityService] Loading contacts with type: ${type}`);

  try {
    switch (type) {
      case 'contact':
        return await loadContacts();

      case 'client':
        return await loadClients();

      case 'organization':
        return await loadOrganizations();

      case 'volunteer':
        return await loadVolunteers();

      case 'team':
        return await loadTeamMembers();

      case 'all': {
        // Load all entity types in parallel
        const [contacts, clients, organizations, volunteers, team] = await Promise.all([
          loadContacts(),
          loadClients(),
          loadOrganizations(),
          loadVolunteers(),
          loadTeamMembers(),
        ]);

        // Combine and sort by name
        const allContacts = [...contacts, ...clients, ...organizations, ...volunteers, ...team];
        allContacts.sort((a, b) => a.name.localeCompare(b.name));

        logger.info(`[EntityService] Loaded ${allContacts.length} total contacts (${contacts.length} contacts, ${clients.length} clients, ${organizations.length} orgs, ${volunteers.length} volunteers, ${team.length} team)`);

        return allContacts;
      }

      default:
        logger.warn(`[EntityService] Unknown entity type: ${type}, defaulting to clients`);
        return await loadClients();
    }
  } catch (error) {
    logger.error('[EntityService] Error loading contacts:', error);
    throw error;
  }
}

/**
 * Get count of contacts by entity type
 */
export async function getCountByType(type: EntityType): Promise<number> {
  try {
    if (type === 'all') {
      const [contactCount, clientCount, orgCount, volunteerCount, teamCount] = await Promise.all([
        supabase.from('contacts').select('id', { count: 'exact', head: true }),
        supabase.from('clients').select('id', { count: 'exact', head: true }),
        supabase.from('organizations').select('id', { count: 'exact', head: true }),
        supabase.from('pulse_volunteers').select('id', { count: 'exact', head: true }).then(r => r.error ? { count: 0 } : r),
        supabase.from('team_members').select('id', { count: 'exact', head: true }),
      ]);

      return (contactCount.count || 0) + (clientCount.count || 0) + (orgCount.count || 0) +
             (volunteerCount.count || 0) + (teamCount.count || 0);
    }

    const tableName = type === 'client' ? 'clients' :
                      type === 'organization' ? 'organizations' :
                      type === 'volunteer' ? 'pulse_volunteers' :
                      type === 'team' ? 'team_members' : 'contacts';

    const { count, error } = await supabase
      .from(tableName)
      .select('id', { count: 'exact', head: true });

    if (error && error.code === '42P01') {
      return 0; // Table doesn't exist
    }

    if (error) throw error;

    return count || 0;
  } catch (error) {
    logger.error(`[EntityService] Error getting count for type ${type}:`, error);
    return 0;
  }
}

/**
 * Entity service export
 */
export const entityService = {
  getByType,
  getCountByType,
};
