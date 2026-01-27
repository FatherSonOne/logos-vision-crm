# Pulse Archive Importer Service

This service handles importing documents from the Pulse app archive located at `F:\pulse1` into the Logos Vision CRM document library.

## Overview

The Pulse Archive Importer provides functionality to:
- Browse the Pulse archive directory structure
- Import single or multiple Pulse items as documents
- Track sync status of imported items
- Map Pulse item types to document categories

## Important Notes

This service requires **Node.js file system access** and will not work in a standard browser environment. It needs to run in either:
- Electron application
- Backend API service
- Node.js environment

When running in a browser, the service will throw an error with instructions for users.

## Architecture

```
F:\pulse1/                    # Pulse archive root
├── meetings/                 # Meeting records
├── conversations/            # Chat archives
├── vox/                     # Voice recordings
└── projects/                # Project files
```

## API Reference

### Core Functions

#### `browsePulseArchive(options?)`

Browse the Pulse archive and return available items for import.

```typescript
import { browsePulseArchive } from './services/documents/pulse';

// Browse all items
const items = await browsePulseArchive();

// Filter by type
const meetings = await browsePulseArchive({
  type: 'meeting'
});

// Filter by date range
const recentItems = await browsePulseArchive({
  dateRange: {
    start: new Date('2024-01-01'),
    end: new Date('2024-12-31')
  }
});
```

**Parameters:**
- `options.type` - Filter by Pulse item type: `'meeting' | 'conversation' | 'vox' | 'project'`
- `options.dateRange` - Filter by date range with `start` and `end` dates

**Returns:** `Promise<PulseArchiveItem[]>`

---

#### `importPulseItem(item, userId)`

Import a single Pulse item as a document.

```typescript
import { importPulseItem } from './services/documents/pulse';

const item = {
  id: 'pulse_abc123',
  type: 'meeting',
  title: 'Q4 Strategy Meeting',
  date: '2024-10-15T14:00:00Z',
  participants: ['John Doe', 'Jane Smith'],
  filePath: 'F:\\pulse1\\meetings\\2024-10-15-strategy.txt',
  size: 15420,
  previewText: 'Discussion of Q4 objectives...'
};

const document = await importPulseItem(item, 'user-123');
console.log('Imported document:', document?.id);
```

**Parameters:**
- `item` - The Pulse archive item to import
- `userId` - ID of the user performing the import

**Returns:** `Promise<EnhancedDocument | null>`

**Database Operations:**
1. Creates a record in the `documents` table
2. Creates a mapping record in the `document_pulse_items` table
3. Sets appropriate metadata (category, file type, visibility)

---

#### `bulkImportFromPulse(items, userId, onProgress?)`

Import multiple Pulse items in bulk with progress tracking.

```typescript
import { bulkImportFromPulse } from './services/documents/pulse';

const items = await browsePulseArchive({ type: 'meeting' });

const result = await bulkImportFromPulse(
  items,
  'user-123',
  (progress) => {
    console.log(`Progress: ${progress.current}/${progress.total}`);
  }
);

console.log(`Imported: ${result.imported}, Failed: ${result.failed}`);
if (result.errors.length > 0) {
  console.error('Errors:', result.errors);
}
```

**Parameters:**
- `items` - Array of Pulse items to import
- `userId` - ID of the user performing the import
- `onProgress` - Optional callback for progress updates

**Returns:** `Promise<ImportResult>`

**Features:**
- Skips already imported items
- Tracks successes and failures
- Provides detailed error messages
- Reports progress for UI updates

---

#### `getPulseSyncStatus(pulseItemId)`

Check if a Pulse item has already been imported.

```typescript
import { getPulseSyncStatus } from './services/documents/pulse';

const status = await getPulseSyncStatus('pulse_abc123');

if (status?.synced) {
  console.log('Already imported as document:', status.documentId);
  console.log('Last synced:', status.lastSyncedAt);
} else {
  console.log('Not yet imported');
}
```

**Parameters:**
- `pulseItemId` - ID of the Pulse item to check

**Returns:** `Promise<SyncStatusResult | null>`

---

### Utility Functions

#### `canRunPulseImporter()`

Check if the service can run in the current environment.

```typescript
import { canRunPulseImporter } from './services/documents/pulse';

if (canRunPulseImporter()) {
  // Service can run - show import UI
} else {
  // Show message about environment requirements
}
```

**Returns:** `boolean`

---

#### `getEnvironmentInfo()`

Get detailed information about the current environment.

```typescript
import { getEnvironmentInfo } from './services/documents/pulse';

const info = getEnvironmentInfo();
console.log('Can run:', info.canRun);
console.log('Archive path:', info.archivePath);
console.log('Platform:', info.platform);
if (info.errorMessage) {
  console.error(info.errorMessage);
}
```

**Returns:** Object with environment details

---

#### `getPulseArchivePath()`

Get the configured Pulse archive path.

```typescript
import { getPulseArchivePath } from './services/documents/pulse';

console.log('Archive location:', getPulseArchivePath());
// Output: F:\pulse1
```

**Returns:** `string`

## Type Definitions

### `PulseArchiveItem`

```typescript
interface PulseArchiveItem {
  id: string;                                    // Unique identifier
  type: 'meeting' | 'conversation' | 'vox' | 'project';
  title: string;                                 // Item title
  date: string;                                  // ISO 8601 date
  participants?: string[];                       // Optional participant list
  filePath: string;                             // Full path to file
  size: number;                                 // File size in bytes
  previewText?: string;                         // Optional content preview
}
```

### `ImportResult`

```typescript
interface ImportResult {
  success: boolean;      // True if all imports succeeded
  imported: number;      // Count of successful imports
  failed: number;        // Count of failed imports
  errors: string[];      // Array of error messages
}
```

### `SyncStatusResult`

```typescript
interface SyncStatusResult {
  synced: boolean;           // Whether item is synced
  documentId?: string;       // ID of created document
  lastSyncedAt?: string;     // ISO 8601 timestamp
}
```

## Database Schema

### `documents` Table Fields

The importer creates documents with these fields:

```typescript
{
  name: string;                    // Item title
  category: string;                // Mapped from type
  file_type: string;               // Mapped from type
  file_size: number;               // File size in bytes
  storage_provider: 'pulse';       // Always 'pulse'
  pulse_synced: true;              // Always true
  uploaded_by_id: string;          // User ID
  uploaded_at: string;             // Original date
  file_url: string;                // Original file path
  version_number: 1;               // Initial version
  ai_processed: false;             // Not yet processed
  ocr_processed: false;            // Not yet processed
  preview_available: false;        // No preview yet
  visibility: 'team';              // Default visibility
  sensitivity_level: 'normal';     // Default sensitivity
}
```

### `document_pulse_items` Table Fields

The importer creates mappings with these fields:

```typescript
{
  document_id: string;             // Reference to document
  pulse_item_type: string;         // Original Pulse type
  pulse_item_id: string;           // Original Pulse ID
  sync_status: 'synced';           // Initial status
  sync_direction: 'pulse_to_logos';// Import direction
  last_synced_at: string;          // Sync timestamp
  pulse_participants: string[];    // Participant list
  pulse_created_at: string;        // Original creation date
}
```

## Type Mapping

### Pulse Type → Document Category

```typescript
{
  meeting: 'Internal',
  conversation: 'Internal',
  vox: 'Media',
  project: 'Projects'
}
```

### Pulse Type → File Type

```typescript
{
  meeting: 'pdf',
  conversation: 'text',
  vox: 'audio',
  project: 'other'
}
```

### Archive Type → Database Type

```typescript
{
  meeting: 'meeting',
  conversation: 'conversation',
  vox: 'vox',
  project: 'project_file'
}
```

## Error Handling

The service includes comprehensive error handling:

1. **Environment checks** - Validates Node.js/Electron availability
2. **File system errors** - Handles missing files/directories
3. **Database errors** - Catches and logs Supabase errors
4. **Duplicate prevention** - Checks for already imported items
5. **Partial failures** - Continues bulk import even if some items fail

### Example Error Handling

```typescript
import { browsePulseArchive } from './services/documents/pulse';

try {
  const items = await browsePulseArchive();
  console.log('Found items:', items.length);
} catch (error) {
  if (error.message.includes('Node.js or Electron')) {
    // Show UI message about environment requirements
    alert('This feature requires running in Electron or a backend service');
  } else {
    // Handle other errors
    console.error('Failed to browse archive:', error);
  }
}
```

## Future Implementation

The following features are marked with TODO comments for future implementation:

1. **File System Access** - Actual reading from F:\pulse1 using Node.js `fs` module
2. **Content Parsing** - Extract metadata and content from Pulse files
3. **AI Processing** - Automatic AI processing of text-based items
4. **Thumbnail Generation** - Create previews for imported documents
5. **Real-time Sync** - Watch for new files in archive directory

## Configuration

To change the Pulse archive path, modify the constant in `pulseArchiveImporter.ts`:

```typescript
const PULSE_ARCHIVE_PATH = 'F:\\pulse1';  // Windows path format
```

For Linux/Mac, use forward slashes:

```typescript
const PULSE_ARCHIVE_PATH = '/mnt/pulse1';
```

## Performance Considerations

- **Bulk imports** process items sequentially to avoid overwhelming the database
- **Progress callbacks** allow UI updates during long operations
- **Duplicate checks** prevent re-importing the same items
- **Error isolation** ensures one failure doesn't stop the entire import

## Security Notes

- File paths are validated before access
- User ID is required for all imports (audit trail)
- Default visibility is 'team' (not public)
- Original file paths are stored for reference only

## Testing

Example test scenarios:

```typescript
// Test environment detection
const canRun = canRunPulseImporter();
expect(canRun).toBe(false); // In browser

// Test type mappings
import { getFileType } from './pulseArchiveImporter';
expect(getFileType('meeting')).toBe('pdf');

// Test duplicate detection
const status = await getPulseSyncStatus('test-id');
expect(status).toBeNull(); // Not imported yet
```

## Support

For questions or issues with the Pulse Archive Importer:

1. Check environment requirements (Node.js/Electron)
2. Verify archive path exists: `F:\pulse1`
3. Review error messages in browser console
4. Check database connectivity
5. Ensure proper user authentication

---

**Implementation Status:** Phase 3 - Core service structure complete, file system operations pending
**Last Updated:** 2026-01-19
