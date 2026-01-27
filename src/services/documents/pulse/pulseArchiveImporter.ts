/**
 * Pulse Archive Importer
 * Imports documents from Pulse app archive at F:\pulse1
 *
 * IMPORTANT: This service requires Node.js file system access.
 * It will not work in a standard browser environment without Electron or similar.
 */

import { supabase } from '../../supabaseClient';
import type { EnhancedDocument, PulseDocumentSource } from '../../../types/documents';

// Pulse archive base path - Windows path format
const PULSE_ARCHIVE_PATH = 'F:\\pulse1';

// ============================================================================
// Type Definitions
// ============================================================================

export interface PulseArchiveItem {
  id: string;
  type: 'meeting' | 'conversation' | 'vox' | 'project';
  title: string;
  date: string;
  participants?: string[];
  filePath: string;
  size: number;
  previewText?: string;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
}

export interface SyncStatusResult {
  synced: boolean;
  documentId?: string;
  lastSyncedAt?: string;
}

// ============================================================================
// Environment Detection
// ============================================================================

/**
 * Check if file system access is available
 * Returns true if running in Node.js/Electron environment
 */
function hasFileSystemAccess(): boolean {
  // Check for Node.js fs module availability
  try {
    // @ts-ignore - checking for Node.js environment
    return typeof process !== 'undefined' && process.versions && process.versions.node;
  } catch {
    return false;
  }
}

/**
 * Get error message for browser environment
 */
function getBrowserEnvironmentError(): string {
  return `Pulse Archive Importer requires Node.js or Electron environment for file system access.

This feature cannot run in a standard browser. To use Pulse archive import:
1. Run this application in Electron, or
2. Build a backend API service to handle file operations, or
3. Use the manual upload feature instead.

Archive path: ${PULSE_ARCHIVE_PATH}`;
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Browse Pulse archive and return items available for import
 *
 * @param options - Filter options for browsing
 * @returns Array of importable Pulse items
 */
export async function browsePulseArchive(options?: {
  type?: PulseArchiveItem['type'];
  dateRange?: { start: Date; end: Date };
}): Promise<PulseArchiveItem[]> {
  // Check environment
  if (!hasFileSystemAccess()) {
    console.error('File system access not available');
    throw new Error(getBrowserEnvironmentError());
  }

  const items: PulseArchiveItem[] = [];

  try {
    // TODO: Implement file system browsing of F:\pulse1
    // This will require Node.js fs module or Electron APIs
    //
    // Expected implementation:
    // 1. Use fs.readdir to scan PULSE_ARCHIVE_PATH
    // 2. Check for subdirectories: meetings/, conversations/, vox/, projects/
    // 3. Parse file metadata and content
    // 4. Filter by type and date range if provided
    // 5. Extract preview text from files
    // 6. Return array of importable items

    console.log('Browsing Pulse archive at:', PULSE_ARCHIVE_PATH);
    console.log('Filter options:', options);

    // Placeholder for file system operations
    // const fs = require('fs').promises;
    // const path = require('path');
    //
    // const archiveExists = await fs.access(PULSE_ARCHIVE_PATH).then(() => true).catch(() => false);
    // if (!archiveExists) {
    //   throw new Error(`Pulse archive not found at ${PULSE_ARCHIVE_PATH}`);
    // }
    //
    // // Scan directory structure
    // const typeDir = options?.type ? path.join(PULSE_ARCHIVE_PATH, options.type + 's') : PULSE_ARCHIVE_PATH;
    // const files = await fs.readdir(typeDir, { withFileTypes: true });
    //
    // for (const file of files) {
    //   if (file.isFile()) {
    //     const filePath = path.join(typeDir, file.name);
    //     const stats = await fs.stat(filePath);
    //     const content = await fs.readFile(filePath, 'utf-8');
    //
    //     // Parse metadata from file
    //     const item: PulseArchiveItem = {
    //       id: generateIdFromPath(filePath),
    //       type: detectType(filePath),
    //       title: extractTitle(content, file.name),
    //       date: stats.mtime.toISOString(),
    //       filePath: filePath,
    //       size: stats.size,
    //       previewText: extractPreview(content),
    //       participants: extractParticipants(content)
    //     };
    //
    //     // Apply date filter
    //     if (options?.dateRange) {
    //       const itemDate = new Date(item.date);
    //       if (itemDate < options.dateRange.start || itemDate > options.dateRange.end) {
    //         continue;
    //       }
    //     }
    //
    //     items.push(item);
    //   }
    // }

    // For now, return empty array with informative log
    console.warn('File system browsing not yet implemented. This requires Node.js fs module.');

  } catch (error) {
    console.error('Error browsing Pulse archive:', error);
    throw error;
  }

  return items;
}

/**
 * Import a single Pulse item as a document
 *
 * @param item - The Pulse item to import
 * @param userId - ID of user performing the import
 * @returns The created document or null on error
 */
export async function importPulseItem(
  item: PulseArchiveItem,
  userId: string
): Promise<EnhancedDocument | null> {
  try {
    // 1. Read file content from Pulse archive
    const content = await readPulseFile(item.filePath);

    // 2. Determine category based on item type
    const category = mapPulseTypeToCategory(item.type);

    // 3. Create document record in Logos
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        name: item.title,
        category: category,
        file_type: getFileType(item.type),
        file_size: item.size,
        storage_provider: 'pulse',
        pulse_synced: true,
        uploaded_by_id: userId,
        uploaded_at: item.date,
        // Store reference to original Pulse item
        file_url: item.filePath,
        // Enhanced fields
        version_number: 1,
        ai_processed: false,
        ocr_processed: false,
        preview_available: false,
        visibility: 'team',
        sensitivity_level: 'normal',
      })
      .select()
      .single();

    if (docError) {
      console.error('Error creating document:', docError);
      throw new Error(`Failed to create document: ${docError.message}`);
    }

    if (!document) {
      throw new Error('Document creation returned no data');
    }

    // 4. Create Pulse mapping record in document_pulse_items table
    const { error: pulseError } = await supabase
      .from('document_pulse_items')
      .insert({
        document_id: document.id,
        pulse_item_type: mapToPulseItemType(item.type),
        pulse_item_id: item.id,
        sync_status: 'synced',
        sync_direction: 'pulse_to_logos',
        last_synced_at: new Date().toISOString(),
        pulse_participants: item.participants || [],
        pulse_created_at: item.date,
      });

    if (pulseError) {
      console.error('Error creating Pulse mapping:', pulseError);
      // Document created but mapping failed - log warning
      console.warn(`Document ${document.id} created but Pulse mapping failed:`, pulseError.message);
    }

    // 5. Optionally trigger AI processing for text-based content
    // This could be added as a background task:
    // if (item.type === 'meeting' || item.type === 'conversation') {
    //   queueAIProcessing(document.id, content);
    // }

    console.log(`Successfully imported Pulse item: ${item.title} (${item.id})`);
    return document as EnhancedDocument;

  } catch (error) {
    console.error('Error importing Pulse item:', error);
    return null;
  }
}

/**
 * Bulk import multiple Pulse items
 *
 * @param items - Array of Pulse items to import
 * @param userId - ID of user performing the import
 * @param onProgress - Optional progress callback
 * @returns Import result summary
 */
export async function bulkImportFromPulse(
  items: PulseArchiveItem[],
  userId: string,
  onProgress?: (progress: { current: number; total: number }) => void
): Promise<ImportResult> {
  const result: ImportResult = {
    success: true,
    imported: 0,
    failed: 0,
    errors: [],
  };

  console.log(`Starting bulk import of ${items.length} Pulse items...`);

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    // Report progress
    if (onProgress) {
      onProgress({ current: i + 1, total: items.length });
    }

    try {
      // Check if already imported
      const existingSync = await getPulseSyncStatus(item.id);
      if (existingSync?.synced) {
        console.log(`Skipping already imported item: ${item.title}`);
        result.errors.push(`Already imported: ${item.title}`);
        continue;
      }

      // Import the item
      const imported = await importPulseItem(item, userId);

      if (imported) {
        result.imported++;
        console.log(`[${i + 1}/${items.length}] Imported: ${item.title}`);
      } else {
        result.failed++;
        result.errors.push(`Failed to import: ${item.title}`);
        console.error(`[${i + 1}/${items.length}] Failed: ${item.title}`);
      }
    } catch (error) {
      result.failed++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors.push(`Error importing ${item.title}: ${errorMessage}`);
      console.error(`[${i + 1}/${items.length}] Error:`, error);
    }
  }

  result.success = result.failed === 0;

  console.log(`Bulk import completed: ${result.imported} imported, ${result.failed} failed`);

  return result;
}

/**
 * Check sync status for a Pulse item
 *
 * @param pulseItemId - ID of the Pulse item to check
 * @returns Sync status information or null if not found
 */
export async function getPulseSyncStatus(
  pulseItemId: string
): Promise<SyncStatusResult | null> {
  try {
    const { data, error } = await supabase
      .from('document_pulse_items')
      .select('document_id, sync_status, last_synced_at')
      .eq('pulse_item_id', pulseItemId)
      .maybeSingle();

    if (error) {
      console.error('Error checking sync status:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      synced: data.sync_status === 'synced',
      documentId: data.document_id,
      lastSyncedAt: data.last_synced_at,
    };
  } catch (error) {
    console.error('Error checking sync status:', error);
    return null;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Read file content from Pulse archive
 *
 * @param filePath - Path to the file in Pulse archive
 * @returns File content as string
 */
async function readPulseFile(filePath: string): Promise<string> {
  // Check environment
  if (!hasFileSystemAccess()) {
    throw new Error('File system access not available in browser environment');
  }

  // TODO: Implement file reading from F:\pulse1
  // This will use Node.js fs module or Electron APIs
  //
  // const fs = require('fs').promises;
  // try {
  //   const content = await fs.readFile(filePath, 'utf-8');
  //   return content;
  // } catch (error) {
  //   throw new Error(`Failed to read file ${filePath}: ${error.message}`);
  // }

  console.warn(`File reading not yet implemented for: ${filePath}`);
  return ''; // Placeholder
}

/**
 * Map Pulse item type to document category
 *
 * @param type - Pulse item type
 * @returns Document category
 */
function mapPulseTypeToCategory(type: PulseArchiveItem['type']): string {
  const categoryMap: Record<PulseArchiveItem['type'], string> = {
    meeting: 'Internal',
    conversation: 'Internal',
    vox: 'Media',
    project: 'Projects',
  };
  return categoryMap[type] || 'Internal';
}

/**
 * Map Pulse item type to file type
 *
 * @param type - Pulse item type
 * @returns File type string
 */
function getFileType(type: PulseArchiveItem['type']): string {
  const typeMap: Record<PulseArchiveItem['type'], string> = {
    meeting: 'pdf',
    conversation: 'text',
    vox: 'audio',
    project: 'other',
  };
  return typeMap[type] || 'other';
}

/**
 * Map PulseArchiveItem type to PulseItemType for database
 *
 * @param type - Archive item type
 * @returns Database PulseItemType
 */
function mapToPulseItemType(type: PulseArchiveItem['type']): string {
  // Map archive types to database types
  const typeMap: Record<PulseArchiveItem['type'], string> = {
    meeting: 'meeting',
    conversation: 'conversation',
    vox: 'vox',
    project: 'project_file',
  };
  return typeMap[type] || type;
}

// ============================================================================
// Utility Functions for Future Implementation
// ============================================================================

/**
 * Generate a unique ID from file path
 * This ensures consistent IDs for the same file
 */
function generateIdFromPath(filePath: string): string {
  // Simple hash function for demonstration
  // In production, use a proper hashing algorithm
  let hash = 0;
  for (let i = 0; i < filePath.length; i++) {
    const char = filePath.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `pulse_${Math.abs(hash).toString(36)}`;
}

/**
 * Detect Pulse item type from file path
 */
function detectType(filePath: string): PulseArchiveItem['type'] {
  const lowerPath = filePath.toLowerCase();

  if (lowerPath.includes('/meetings/') || lowerPath.includes('\\meetings\\')) {
    return 'meeting';
  }
  if (lowerPath.includes('/conversations/') || lowerPath.includes('\\conversations\\')) {
    return 'conversation';
  }
  if (lowerPath.includes('/vox/') || lowerPath.includes('\\vox\\')) {
    return 'vox';
  }
  if (lowerPath.includes('/projects/') || lowerPath.includes('\\projects\\')) {
    return 'project';
  }

  return 'conversation'; // Default
}

/**
 * Extract title from file content or filename
 */
function extractTitle(content: string, filename: string): string {
  // Try to extract from first line of content
  const firstLine = content.split('\n')[0]?.trim();
  if (firstLine && firstLine.length > 0 && firstLine.length < 100) {
    return firstLine;
  }

  // Fall back to filename without extension
  return filename.replace(/\.[^/.]+$/, '');
}

/**
 * Extract preview text from content
 */
function extractPreview(content: string, maxLength: number = 200): string {
  const preview = content.substring(0, maxLength).trim();
  return preview.length < content.length ? preview + '...' : preview;
}

/**
 * Extract participant names from content
 * This is a simple implementation - could be enhanced with NLP
 */
function extractParticipants(content: string): string[] {
  // Look for common patterns like "Participants: John, Jane"
  const participantMatch = content.match(/participants?:\s*([^\n]+)/i);
  if (participantMatch) {
    return participantMatch[1]
      .split(/[,;]/)
      .map(p => p.trim())
      .filter(p => p.length > 0);
  }
  return [];
}

// ============================================================================
// Export Configuration
// ============================================================================

/**
 * Get the configured Pulse archive path
 */
export function getPulseArchivePath(): string {
  return PULSE_ARCHIVE_PATH;
}

/**
 * Check if the service can run in current environment
 */
export function canRunPulseImporter(): boolean {
  return hasFileSystemAccess();
}

/**
 * Get detailed environment information
 */
export function getEnvironmentInfo(): {
  canRun: boolean;
  archivePath: string;
  platform?: string;
  errorMessage?: string;
} {
  const canRun = hasFileSystemAccess();

  return {
    canRun,
    archivePath: PULSE_ARCHIVE_PATH,
    platform: canRun ? 'Node.js/Electron' : 'Browser',
    errorMessage: canRun ? undefined : getBrowserEnvironmentError(),
  };
}
