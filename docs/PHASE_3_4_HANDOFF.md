# Phase 3 & 4 Implementation Handoff - Enterprise Document Library

**Date:** January 19, 2026
**Status:** Ready to Start
**Pulse Path:** `F:\pulse1` ⚠️ **UPDATED**

---

## Quick Summary

### ✅ What's Complete (Phases 1 & 2)
- Database schema with 6 new tables applied
- AI integration complete (Classification, OCR, Tagging, Semantic Search)
- Document upload bug fixed - documents now appear immediately after upload
- Build successful - 0 TypeScript errors

### 🚀 What's Next (Phases 3 & 4)
- **Phase 3:** Pulse integration - Import from `F:\pulse1` archive
- **Phase 4:** Modern UI/UX - Document cards, AI insights panel, viewer

---

## Phase 3: Pulse Integration Implementation

### Goal
Import documents from Pulse app archive at `F:\pulse1` into Logos Vision CRM.

### Architecture Overview

```
F:\pulse1\                      # Pulse app archive (SOURCE)
    ├── conversations/          # Chat archives
    ├── meetings/              # Meeting notes
    ├── vox/                   # Voice message archives
    └── projects/              # Project documents

        ↓ ONE-WAY SYNC ↓

F:\logos-vision-crm\           # Logos CRM (DESTINATION)
    └── documents table        # Imported with pulse_source metadata
```

### Step 1: Create Pulse Archive Importer Service

**File to Create:** `src/services/documents/pulse/pulseArchiveImporter.ts`

```typescript
/**
 * Pulse Archive Importer
 * Imports documents from Pulse app archive at F:\pulse1
 */

import { supabase } from '../../supabaseClient';
import type { EnhancedDocument, PulseDocumentSource } from '../../../types/documents';

// Pulse archive base path
const PULSE_ARCHIVE_PATH = 'F:\\pulse1';

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

/**
 * Browse Pulse archive and return items available for import
 */
export async function browsePulseArchive(options?: {
  type?: PulseArchiveItem['type'];
  dateRange?: { start: Date; end: Date };
}): Promise<PulseArchiveItem[]> {
  // TODO: Implement file system browsing of F:\pulse1
  // This will use Node.js fs module or Electron APIs if available
  // For now, return mock data structure

  const items: PulseArchiveItem[] = [];

  try {
    // Read from F:\pulse1 directory structure
    // Filter by type and date range if provided
    // Parse metadata from files
    // Return array of importable items

    console.log('Browsing Pulse archive at:', PULSE_ARCHIVE_PATH);
    console.log('Filter options:', options);

    // Implementation will go here

  } catch (error) {
    console.error('Error browsing Pulse archive:', error);
  }

  return items;
}

/**
 * Import a single Pulse item as a document
 */
export async function importPulseItem(
  item: PulseArchiveItem,
  userId: string
): Promise<EnhancedDocument | null> {
  try {
    // 1. Read file content from Pulse archive
    const content = await readPulseFile(item.filePath);

    // 2. Create document record in Logos
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        name: item.title,
        category: 'Internal', // Or map based on item.type
        file_type: getFileType(item.type),
        file_size: item.size,
        storage_provider: 'pulse',
        pulse_synced: true,
        uploaded_by_id: userId,
        uploaded_at: item.date,
        // Store reference to original Pulse item
        file_url: item.filePath,
      })
      .select()
      .single();

    if (docError) {
      console.error('Error creating document:', docError);
      return null;
    }

    // 3. Create Pulse mapping record
    await supabase
      .from('document_pulse_items')
      .insert({
        document_id: document.id,
        pulse_item_type: item.type,
        pulse_item_id: item.id,
        sync_status: 'synced',
        last_synced_at: new Date().toISOString(),
      });

    // 4. Optionally run AI processing on content
    // (if it's a text-based item like meeting notes)

    return document as EnhancedDocument;
  } catch (error) {
    console.error('Error importing Pulse item:', error);
    return null;
  }
}

/**
 * Bulk import multiple Pulse items
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

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    // Report progress
    if (onProgress) {
      onProgress({ current: i + 1, total: items.length });
    }

    try {
      const imported = await importPulseItem(item, userId);
      if (imported) {
        result.imported++;
      } else {
        result.failed++;
        result.errors.push(`Failed to import: ${item.title}`);
      }
    } catch (error) {
      result.failed++;
      result.errors.push(`Error importing ${item.title}: ${error}`);
    }
  }

  result.success = result.failed === 0;
  return result;
}

/**
 * Helper: Read file content from Pulse archive
 */
async function readPulseFile(filePath: string): Promise<string> {
  // TODO: Implement file reading from F:\pulse1
  // This will use fs.readFile or similar
  return '';
}

/**
 * Helper: Map Pulse item type to file type
 */
function getFileType(type: PulseArchiveItem['type']): string {
  const typeMap = {
    meeting: 'pdf',
    conversation: 'text',
    vox: 'audio',
    project: 'other',
  };
  return typeMap[type] || 'other';
}

/**
 * Check sync status for a Pulse item
 */
export async function getPulseSyncStatus(pulseItemId: string): Promise<{
  synced: boolean;
  documentId?: string;
  lastSyncedAt?: string;
} | null> {
  try {
    const { data, error } = await supabase
      .from('document_pulse_items')
      .select('document_id, sync_status, last_synced_at')
      .eq('pulse_item_id', pulseItemId)
      .single();

    if (error || !data) return null;

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
```

### Step 2: Create Pulse Browser UI Component

**File to Create:** `src/components/documents/pulse/PulseBrowser.tsx`

```typescript
/**
 * Pulse Archive Browser
 * UI to browse and import from Pulse app archive
 */

import React, { useState, useEffect } from 'react';
import { Cloud, Download, Calendar, Users, FileText, Mic, FolderOpen } from 'lucide-react';
import { browsePulseArchive, importPulseItem, bulkImportFromPulse } from '../../../services/documents/pulse/pulseArchiveImporter';
import type { PulseArchiveItem } from '../../../services/documents/pulse/pulseArchiveImporter';
import { useAuth } from '../../../contexts/AuthContext';

interface PulseBrowserProps {
  onImportComplete?: () => void;
  onClose?: () => void;
}

export const PulseBrowser: React.FC<PulseBrowserProps> = ({
  onImportComplete,
  onClose,
}) => {
  const { user } = useAuth();
  const [items, setItems] = useState<PulseArchiveItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<PulseArchiveItem['type'] | 'all'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });

  // Load Pulse archive items on mount
  useEffect(() => {
    loadPulseItems();
  }, [filterType]);

  const loadPulseItems = async () => {
    setIsLoading(true);
    try {
      const options = filterType !== 'all' ? { type: filterType } : undefined;
      const pulseItems = await browsePulseArchive(options);
      setItems(pulseItems);
    } catch (error) {
      console.error('Error loading Pulse items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportSelected = async () => {
    if (!user?.id) return;

    setIsImporting(true);
    const itemsToImport = items.filter(item => selectedItems.has(item.id));

    try {
      const result = await bulkImportFromPulse(
        itemsToImport,
        user.id,
        (progress) => setImportProgress(progress)
      );

      console.log('Import result:', result);

      // Notify parent component
      if (onImportComplete) {
        onImportComplete();
      }

      // Refresh list
      loadPulseItems();
      setSelectedItems(new Set());
    } catch (error) {
      console.error('Error importing:', error);
    } finally {
      setIsImporting(false);
      setImportProgress({ current: 0, total: 0 });
    }
  };

  const getTypeIcon = (type: PulseArchiveItem['type']) => {
    switch (type) {
      case 'meeting': return <Calendar className="w-4 h-4" />;
      case 'conversation': return <FileText className="w-4 h-4" />;
      case 'vox': return <Mic className="w-4 h-4" />;
      case 'project': return <FolderOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Cloud className="w-5 h-5 text-cyan-500" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Pulse Archive Browser
          </h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 p-4 border-b border-slate-200 dark:border-slate-700">
        {['all', 'meeting', 'conversation', 'vox', 'project'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type as any)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterType === type
                ? 'bg-cyan-500 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-slate-400">Loading Pulse archive...</div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            No items found in Pulse archive
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedItems.has(item.id)
                    ? 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-300 dark:border-cyan-700'
                    : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:border-cyan-300 dark:hover:border-cyan-700'
                }`}
                onClick={() => {
                  const newSelected = new Set(selectedItems);
                  if (newSelected.has(item.id)) {
                    newSelected.delete(item.id);
                  } else {
                    newSelected.add(item.id);
                  }
                  setSelectedItems(newSelected);
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedItems.has(item.id)}
                  onChange={() => {}}
                  className="w-4 h-4 text-cyan-500 rounded border-slate-300 dark:border-slate-600"
                />
                <div className="flex-shrink-0 text-cyan-500">
                  {getTypeIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 dark:text-white truncate">
                    {item.title}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {item.date} {item.participants && `• ${item.participants.length} participants`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
        </div>
        <button
          onClick={handleImportSelected}
          disabled={selectedItems.size === 0 || isImporting}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Download className="w-4 h-4" />
          {isImporting
            ? `Importing (${importProgress.current}/${importProgress.total})...`
            : 'Import Selected'}
        </button>
      </div>
    </div>
  );
};
```

### Step 3: Create Pulse Source Badge Component

**File to Create:** `src/components/documents/cards/PulseSourceBadge.tsx`

```typescript
/**
 * Pulse Source Badge
 * Visual indicator showing document originated from Pulse
 */

import React from 'react';
import { Cloud, Calendar, MessageSquare, Mic, FolderOpen } from 'lucide-react';
import type { PulseDocumentSource } from '../../../types/documents';

interface PulseSourceBadgeProps {
  source: PulseDocumentSource;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const PulseSourceBadge: React.FC<PulseSourceBadgeProps> = ({
  source,
  size = 'md',
  showLabel = true,
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const getIcon = () => {
    switch (source.type) {
      case 'meeting':
        return <Calendar className={iconSizes[size]} />;
      case 'chat_archive':
      case 'conversation':
        return <MessageSquare className={iconSizes[size]} />;
      case 'vox':
        return <Mic className={iconSizes[size]} />;
      default:
        return <Cloud className={iconSizes[size]} />;
    }
  };

  const getTypeLabel = () => {
    switch (source.type) {
      case 'meeting':
        return 'Pulse Meeting';
      case 'chat_archive':
      case 'conversation':
        return 'Pulse Chat';
      case 'vox':
        return 'Pulse Vox';
      default:
        return 'Pulse';
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium ${sizeClasses[size]}`}
      title={`From ${getTypeLabel()}: ${source.title}`}
    >
      {getIcon()}
      {showLabel && <span>{getTypeLabel()}</span>}
    </div>
  );
};
```

### Step 4: Update DocumentsHub to Include Pulse Browser

**File to Modify:** `src/components/documents/DocumentsHub.tsx`

Add state and modal for Pulse browser:

```typescript
const [showPulseBrowser, setShowPulseBrowser] = useState(false);

// In the render:
{showPulseBrowser && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="w-full max-w-4xl h-[80vh] m-4">
      <PulseBrowser
        onImportComplete={() => {
          // Reload documents
          window.dispatchEvent(new CustomEvent('documents-updated'));
        }}
        onClose={() => setShowPulseBrowser(false)}
      />
    </div>
  </div>
)}
```

---

## Phase 4: Modern UI/UX Implementation

### Component Architecture

```
src/components/documents/
├── cards/
│   ├── DocumentCard.tsx           # Modern grid view card
│   └── PulseSourceBadge.tsx      # ✅ Created in Phase 3
├── ai/
│   ├── AIInsightsPanel.tsx        # AI metadata display
│   ├── ClassificationBadge.tsx    # Category + confidence
│   └── EntityList.tsx             # Detected entities
├── viewer/
│   ├── DocumentViewer.tsx         # Main preview modal
│   ├── PdfViewer.tsx             # PDF.js integration
│   └── ImageViewer.tsx           # Image preview
└── search/
    ├── DocumentSearch.tsx         # Smart search UI
    └── SemanticResults.tsx       # AI search results
```

### Key UI Components to Build

1. **Document Card** - Modern card with AI badges
2. **AI Insights Panel** - Tabbed display of AI metadata
3. **Document Viewer** - Preview with AI sidebar
4. **Smart Search** - Semantic search interface

---

## Critical Configuration

### Pulse Path
```typescript
// IMPORTANT: Pulse archive is at F:\pulse1 (not F:\pulse)
const PULSE_ARCHIVE_PATH = 'F:\\pulse1';
```

### Feature Flags
Enable Pulse sync when Phase 3 is complete:
```typescript
// src/components/documents/DocumentsHub.tsx
const FEATURE_FLAGS = {
  useEnhancedLibrary: false,
  aiFeatures: true,          // ✅ Already enabled
  pulseSync: true,           // ⚠️ Set to true after Phase 3
  versionControl: false,
  analytics: false,
};
```

### Environment Variables
Already configured in `.env`:
```bash
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

---

## Testing Checklist

### Phase 3 Testing
- [ ] Can browse Pulse archive at `F:\pulse1`
- [ ] Filter by type (meeting, conversation, vox, project)
- [ ] Import single Pulse item
- [ ] Import multiple items (bulk)
- [ ] Pulse badge displays correctly
- [ ] Document appears in list after import
- [ ] `document_pulse_items` table populated

### Phase 4 Testing
- [ ] Document cards display with thumbnails
- [ ] AI badges show classification and confidence
- [ ] AI insights panel shows all metadata
- [ ] Document viewer previews PDFs and images
- [ ] Smart search returns semantic results
- [ ] Relevance scores displayed

---

## Known Issues & Solutions

### Issue: File System Access in Browser
**Problem:** Web apps can't access `F:\pulse1` directly
**Solutions:**
1. Use Electron APIs (if app runs in Electron)
2. Create Node.js backend endpoint to browse files
3. Use Tauri filesystem APIs (if using Tauri)

**Recommended Approach:**
Check if running in Electron context, otherwise show message to user about setting up file access.

---

## Documentation References

- **Phase 1:** [PHASE_1_COMPLETE.md](./PHASE_1_COMPLETE.md)
- **Phase 2:** [PHASE_2_AI_INTEGRATION_COMPLETE.md](./PHASE_2_AI_INTEGRATION_COMPLETE.md)
- **AI Guide:** [AI_FEATURES_QUICK_START.md](./AI_FEATURES_QUICK_START.md)
- **Testing:** [TEST_AI_FEATURES.md](./TEST_AI_FEATURES.md)
- **Bug Fix:** [DOCUMENT_UPLOAD_FIX.md](./DOCUMENT_UPLOAD_FIX.md)
- **Overall Status:** [ENTERPRISE_DOCUMENT_LIBRARY_STATUS.md](./ENTERPRISE_DOCUMENT_LIBRARY_STATUS.md)

---

## Next Actions

1. **Start Phase 3:**
   - Create `pulseArchiveImporter.ts`
   - Implement file system access for `F:\pulse1`
   - Create `PulseBrowser.tsx` UI
   - Create `PulseSourceBadge.tsx`
   - Test import flow

2. **Then Phase 4:**
   - Create document cards
   - Build AI insights panel
   - Implement document viewer
   - Add smart search UI

3. **Final Steps:**
   - Update feature flags
   - Test end-to-end
   - Update documentation
   - Create user guide

---

**Ready to implement!** Start with Phase 3 to enable Pulse integration.
