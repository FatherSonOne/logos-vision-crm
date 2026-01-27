// Pulse Sync Service - Orchestrates bulk import and incremental sync
// Manages scheduled sync, deduplication, and entity mappings

import { supabase } from './supabaseClient';
import { pulseContactService } from './pulseContactService';
import { contactService } from './contactService';
import type { RelationshipProfile, BulkImportResult, PulseSyncStatus } from '../types/pulseContacts';
import { logger } from '../utils/logger';

// ============================================
// CONFIGURATION
// ============================================

const SYNC_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
const BATCH_SIZE = 50; // Process contacts in batches

// ============================================
// SYNC ORCHESTRATION
// ============================================

let syncInterval: NodeJS.Timeout | null = null;
let isSyncing = false;

export const pulseSyncService = {
  /**
   * Perform initial bulk import from Pulse
   * Fetches all contacts and syncs to LV database
   */
  async performBulkContactImport(): Promise<BulkImportResult> {
    const startTime = Date.now();
    const result: BulkImportResult = {
      success: false,
      imported: 0,
      updated: 0,
      errors: 0,
      error_messages: [],
    };

    try {
      logger.info('Pulse Bulk Import: Starting bulk contact import');

      // Fetch all contacts from Pulse in batches
      let offset = 0;
      let hasMore = true;
      let totalFetched = 0;

      while (hasMore) {
        logger.debug(`Pulse Bulk Import: Fetching batch at offset ${offset}`);

        const pulseProfiles = await pulseContactService.fetchRelationshipProfiles({
          limit: BATCH_SIZE,
          offset,
        });

        if (pulseProfiles.length === 0) {
          hasMore = false;
          break;
        }

        totalFetched += pulseProfiles.length;

        // Process each profile
        for (const profile of pulseProfiles) {
          try {
            const syncResult = await this.syncContactFromPulse(profile);

            if (syncResult.isNew) {
              result.imported++;
            } else {
              result.updated++;
            }
          } catch (error) {
            logger.error(`Pulse Bulk Import: Error syncing ${profile.canonical_email}`, error);
            result.errors++;
            result.error_messages?.push(`${profile.canonical_email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }

        offset += BATCH_SIZE;
        hasMore = pulseProfiles.length === BATCH_SIZE; // Continue if we got a full batch

        logger.info(`Pulse Bulk Import: Progress: ${totalFetched} contacts fetched, ${result.imported} imported, ${result.updated} updated, ${result.errors} errors`);
      }

      result.success = result.errors === 0 || (result.imported + result.updated) > 0;
      result.duration = Date.now() - startTime;

      logger.info('Pulse Bulk Import: Complete', result);

      return result;
    } catch (error) {
      logger.error('Pulse Bulk Import: Fatal error', error);
      result.error_messages?.push(`Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.duration = Date.now() - startTime;
      return result;
    }
  },

  /**
   * Sync a single contact from Pulse to LV
   * Handles deduplication by email
   */
  async syncContactFromPulse(profile: RelationshipProfile): Promise<{ isNew: boolean; contactId: string }> {
    // Check if contact already exists by email
    const existingContacts = await contactService.search(profile.canonical_email);
    const existingContact = existingContacts.find(c => c.email?.toLowerCase() === profile.canonical_email.toLowerCase());

    if (existingContact) {
      // Update existing contact
      const updated = await contactService.update(existingContact.id, {
        firstName: profile.first_name || existingContact.firstName,
        lastName: profile.last_name || existingContact.lastName,
        name: profile.display_name || existingContact.name,
        email: profile.canonical_email,
        phone: profile.phone_number || existingContact.phone,
        // Extended Pulse fields (will be added to schema)
        ...({
          pulse_profile_id: profile.id,
          company: profile.company,
          job_title: profile.title,
          linkedin_url: profile.linkedin_url,
          timezone: profile.timezone,
          avatar_url: profile.avatar_url,
          relationship_score: profile.relationship_score,
          total_interactions: profile.total_interactions,
          last_interaction_date: profile.last_interaction_date,
          communication_frequency: profile.communication_frequency,
          preferred_channel: profile.preferred_channel,
          pulse_tags: profile.tags || [],
          pulse_notes: profile.notes,
          is_favorite: profile.is_favorite,
          is_blocked: profile.is_blocked,
          pulse_synced_at: new Date().toISOString(),
          pulse_sync_status: 'synced',
          pulse_last_modified: profile.updated_at,
        } as any),
      });

      // Update entity mapping
      await this.upsertEntityMapping(updated.id, profile.id, profile.updated_at);

      logger.debug(`Pulse Sync: Updated contact: ${profile.canonical_email}`);

      return { isNew: false, contactId: updated.id };
    } else {
      // Create new contact
      const newContact = await contactService.create({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        name: profile.display_name,
        email: profile.canonical_email,
        phone: profile.phone_number,
        type: 'individual',
        // Extended Pulse fields
        ...({
          pulse_profile_id: profile.id,
          company: profile.company,
          job_title: profile.title,
          linkedin_url: profile.linkedin_url,
          timezone: profile.timezone,
          avatar_url: profile.avatar_url,
          relationship_score: profile.relationship_score,
          total_interactions: profile.total_interactions,
          last_interaction_date: profile.last_interaction_date,
          communication_frequency: profile.communication_frequency,
          preferred_channel: profile.preferred_channel,
          pulse_tags: profile.tags || [],
          pulse_notes: profile.notes,
          is_favorite: profile.is_favorite,
          is_blocked: profile.is_blocked,
          pulse_synced_at: new Date().toISOString(),
          pulse_sync_status: 'synced',
          pulse_last_modified: profile.updated_at,
        } as any),
      });

      // Create entity mapping
      await this.upsertEntityMapping(newContact.id, profile.id, profile.updated_at);

      logger.debug(`Pulse Sync: Created contact: ${profile.canonical_email}`);

      return { isNew: true, contactId: newContact.id };
    }
  },

  /**
   * Start incremental sync schedule (every 15 minutes)
   */
  startIncrementalSync(): void {
    if (syncInterval) {
      logger.warn('Pulse Sync: Sync already running, stopping previous interval');
      this.stopIncrementalSync();
    }

    logger.info(`Pulse Sync: Starting incremental sync (every ${SYNC_INTERVAL_MS / 1000}s)`);

    // Run initial sync immediately
    this.runIncrementalSync();

    // Schedule periodic sync
    syncInterval = setInterval(async () => {
      await this.runIncrementalSync();
    }, SYNC_INTERVAL_MS);
  },

  /**
   * Stop incremental sync schedule
   */
  stopIncrementalSync(): void {
    if (syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
      logger.info('Pulse Sync: Stopped incremental sync');
    }
  },

  /**
   * Run a single incremental sync
   * Fetches only modified contacts since last sync
   */
  async runIncrementalSync(): Promise<void> {
    if (isSyncing) {
      logger.debug('Pulse Sync: Sync already in progress, skipping');
      return;
    }

    isSyncing = true;

    try {
      logger.info('Pulse Sync: Starting incremental sync');

      // Get last sync timestamp
      const lastSync = await this.getLastSyncTimestamp('contact');

      // Fetch modified contacts since last sync
      const modifiedContacts = await pulseContactService.fetchRelationshipProfiles({
        modifiedSince: lastSync,
        limit: 1000,
      });

      logger.info(`Pulse Sync: Found ${modifiedContacts.length} modified contacts`);

      if (modifiedContacts.length === 0) {
        logger.debug('Pulse Sync: No changes, skipping');
        return;
      }

      // Sync each modified contact
      let synced = 0;
      let errors = 0;

      for (const contact of modifiedContacts) {
        try {
          await this.syncContactFromPulse(contact);
          synced++;
        } catch (error) {
          logger.error(`Pulse Sync: Error syncing ${contact.canonical_email}`, error);
          errors++;
        }
      }

      logger.info(`Pulse Sync: Incremental sync complete: ${synced} synced, ${errors} errors`);
    } catch (error) {
      logger.error('Pulse Sync: Error during incremental sync', error);
    } finally {
      isSyncing = false;
    }
  },

  /**
   * Get last sync timestamp for an entity type
   * Used to fetch only modified entities
   */
  async getLastSyncTimestamp(entityType: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('entity_mappings')
        .select('last_synced_at')
        .eq('logos_entity_type', entityType)
        .order('last_synced_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        // Default to 24 hours ago if no sync history
        const defaultDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return defaultDate.toISOString();
      }

      return data.last_synced_at;
    } catch (error) {
      logger.error('Pulse Sync: Error getting last sync timestamp', error);
      // Default to 24 hours ago
      const defaultDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return defaultDate.toISOString();
    }
  },

  /**
   * Upsert entity mapping for tracking Pulse <-> LV relationships
   */
  async upsertEntityMapping(
    logosContactId: string,
    pulseProfileId: string,
    pulseUpdatedAt: string
  ): Promise<void> {
    try {
      const now = new Date().toISOString();

      // Check if mapping exists
      const { data: existing } = await supabase
        .from('entity_mappings')
        .select('id')
        .eq('logos_entity_type', 'contact')
        .eq('logos_entity_id', logosContactId)
        .single();

      if (existing) {
        // Update existing mapping
        await supabase
          .from('entity_mappings')
          .update({
            pulse_entity_id: pulseProfileId,
            last_pulse_update: pulseUpdatedAt,
            last_synced_at: now,
            sync_status: 'synced',
          })
          .eq('id', existing.id);
      } else {
        // Create new mapping
        await supabase
          .from('entity_mappings')
          .insert({
            logos_entity_type: 'contact',
            logos_entity_id: logosContactId,
            pulse_entity_type: 'relationship_profile',
            pulse_entity_id: pulseProfileId,
            last_pulse_update: pulseUpdatedAt,
            last_synced_at: now,
            sync_status: 'synced',
          });
      }
    } catch (error) {
      logger.error('Pulse Sync: Error upserting entity mapping', error);
      // Don't throw - mapping is secondary to actual contact sync
    }
  },

  /**
   * Get sync status summary
   */
  async getSyncStatus(): Promise<PulseSyncStatus> {
    try {
      const lastSync = await this.getLastSyncTimestamp('contact');

      // Count synced, pending, and failed contacts
      const { data: mappings } = await supabase
        .from('entity_mappings')
        .select('sync_status')
        .eq('logos_entity_type', 'contact');

      const synced = mappings?.filter(m => m.sync_status === 'synced').length || 0;
      const pending = mappings?.filter(m => m.sync_status === 'pending').length || 0;
      const failed = mappings?.filter(m => m.sync_status === 'failed').length || 0;

      return {
        last_sync_timestamp: lastSync,
        contacts_synced: synced,
        contacts_pending: pending,
        contacts_failed: failed,
        next_sync_at: new Date(Date.now() + SYNC_INTERVAL_MS).toISOString(),
        is_syncing: isSyncing,
        errors: [],
      };
    } catch (error) {
      logger.error('Pulse Sync: Error getting sync status', error);
      return {
        last_sync_timestamp: new Date().toISOString(),
        contacts_synced: 0,
        contacts_pending: 0,
        contacts_failed: 0,
        next_sync_at: new Date(Date.now() + SYNC_INTERVAL_MS).toISOString(),
        is_syncing: isSyncing,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  },

  /**
   * Check if sync is currently running
   */
  isSyncing(): boolean {
    return isSyncing;
  },
};

export default pulseSyncService;
