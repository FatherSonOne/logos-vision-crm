# Documents Integration - Technical Handoff Report

**Document Type**: Technical Handoff
**Audience**: Developers, DevOps, Technical Leads
**Status**: COMPLETE
**Version**: 1.0
**Date**: 2026-01-19

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [System Components](#system-components)
3. [Data Flow](#data-flow)
4. [Type System Design](#type-system-design)
5. [Service Layer Architecture](#service-layer-architecture)
6. [Component Architecture](#component-architecture)
7. [Integration Points](#integration-points)
8. [API Reference](#api-reference)
9. [Code Examples](#code-examples)
10. [Configuration Management](#configuration-management)
11. [Database Schema](#database-schema)
12. [Security Architecture](#security-architecture)
13. [Performance Considerations](#performance-considerations)
14. [Known Limitations](#known-limitations)
15. [Maintenance Guidelines](#maintenance-guidelines)
16. [Emergency Procedures](#emergency-procedures)
17. [Testing Strategy](#testing-strategy)
18. [Deployment Guide](#deployment-guide)

---

## Architecture Overview

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │             React Application Layer                       │  │
│  │                                                            │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │  │
│  │  │ DocumentsHub │  │ Document     │  │ Upload        │  │  │
│  │  │ Component    │  │ Card         │  │ Component     │  │  │
│  │  └──────┬───────┘  └──────┬───────┘  └───────┬───────┘  │  │
│  │         │                  │                   │           │  │
│  │         └──────────────────┴───────────────────┘           │  │
│  │                            │                                │  │
│  │                            ▼                                │  │
│  │         ┌──────────────────────────────────┐               │  │
│  │         │   Component State Management     │               │  │
│  │         │   (useState, useEffect)          │               │  │
│  │         └──────────────┬───────────────────┘               │  │
│  └────────────────────────┼─────────────────────────────────┘  │
│                            │                                     │
├────────────────────────────┼─────────────────────────────────────┤
│                            ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Service Layer                               │   │
│  │                                                           │   │
│  │  ┌─────────────────────┐    ┌──────────────────────┐   │   │
│  │  │ Document Library    │    │ Document AI          │   │   │
│  │  │ Service             │───▶│ Service              │   │   │
│  │  │                     │    │                      │   │   │
│  │  │ - CRUD operations   │    │ - Summarization     │   │   │
│  │  │ - Query filtering   │    │ - Entity extraction │   │   │
│  │  │ - Batch operations  │    │ - Auto-tagging      │   │   │
│  │  │ - Environment       │    │ - Sentiment         │   │   │
│  │  │   detection         │    │ - Classification    │   │   │
│  │  └─────────┬───────────┘    └──────────┬───────────┘   │   │
│  │            │                            │               │   │
│  └────────────┼────────────────────────────┼───────────────┘   │
│               │                            │                   │
└───────────────┼────────────────────────────┼───────────────────┘
                │                            │
                ▼                            ▼
┌───────────────────────────┐    ┌──────────────────────────┐
│   Supabase Backend        │    │   OpenAI API             │
│                           │    │                          │
│  - Storage (Documents)    │    │  - GPT-4 Turbo          │
│  - Database (Metadata)    │    │  - Text Analysis        │
│  - Authentication         │    │  - Entity Recognition   │
│  - Real-time Updates      │    │  - Summarization        │
└───────────────────────────┘    └──────────────────────────┘
```

### Architecture Principles

1. **Separation of Concerns**
   - UI components handle presentation only
   - Services handle business logic
   - Type system ensures data consistency
   - Clear boundaries between layers

2. **Type Safety First**
   - Comprehensive TypeScript types
   - Compile-time error detection
   - Full IDE autocomplete support
   - Reduced runtime errors

3. **Graceful Degradation**
   - Features degrade when dependencies unavailable
   - Clear error messages guide users
   - Alternative workflows provided
   - No catastrophic failures

4. **Performance Optimization**
   - Lazy loading of AI features
   - Efficient caching strategy
   - Minimal re-renders
   - Optimized bundle size

---

## System Components

### Component Hierarchy

```
DocumentsHub (Root Component)
├── SearchBar
│   ├── SearchInput
│   └── SearchSuggestions
├── FilterSidebar
│   ├── CategoryFilter
│   ├── TagFilter
│   ├── DateRangeFilter
│   └── SizeFilter
├── DocumentGrid
│   ├── DocumentCard (repeated)
│   │   ├── DocumentThumbnail
│   │   ├── DocumentMeta
│   │   ├── AIBadge
│   │   └── ActionMenu
│   └── LoadingSkeletons
├── DocumentModal
│   ├── DocumentViewer
│   ├── AIInsightsPanel
│   │   ├── SummarySection
│   │   ├── KeyPointsList
│   │   ├── EntitiesGrid
│   │   └── SentimentIndicator
│   ├── MetadataPanel
│   └── VersionHistory
├── UploadZone
│   ├── DragDropArea
│   ├── FileSelector
│   └── UploadProgress
└── BatchOperationsBar
    ├── SelectionCounter
    └── BatchActions
```

### Component Responsibilities

#### DocumentsHub
- **Purpose**: Root container for document management
- **State Management**: Documents list, filters, selection
- **Data Loading**: Coordinates service calls
- **File**: `src/components/documents/DocumentsHub.tsx`

#### DocumentLibraryService
- **Purpose**: Core document operations
- **Responsibilities**: CRUD, filtering, batch operations
- **Environment Detection**: Browser vs Node.js
- **File**: `src/services/documents/documentLibraryService.ts`

#### DocumentAIService
- **Purpose**: AI-powered document analysis
- **Responsibilities**: Summarization, entity extraction, tagging
- **API Integration**: OpenAI GPT-4
- **File**: `src/services/documents/ai/documentAiService.ts`

---

## Data Flow

### Document Retrieval Flow

```
User Action: Click "Documents" in nav
         ↓
DocumentsHub.componentDidMount()
         ↓
Call: documentLibraryService.getDocuments(options)
         ↓
    ┌────────────────────────────────────────┐
    │ Service Layer Processing               │
    │                                         │
    │ 1. Parse GetDocumentsOptions           │
    │ 2. Build Supabase query                │
    │ 3. Execute query                       │
    │ 4. Transform results to Document[]     │
    │                                         │
    │ IF includeAI === true:                 │
    │   For each document:                   │
    │     IF !document.ai_summary:           │
    │       Call documentAiService.analyze() │
    │       Update document with AI fields   │
    │                                         │
    └─────────────┬──────────────────────────┘
                  ↓
         Return Document[]
                  ↓
    DocumentsHub.setState({ documents })
                  ↓
         Re-render UI
                  ↓
    Display DocumentCard components
```

### Document Upload Flow

```
User Action: Drag & drop file
         ↓
UploadZone.onDrop(files)
         ↓
Validate file (size, type, permissions)
         ↓
    ┌────────────────────────────────────────┐
    │ Upload Processing                      │
    │                                         │
    │ 1. Create FormData                     │
    │ 2. Upload to Supabase Storage          │
    │    - Track progress                    │
    │    - Show upload indicator             │
    │ 3. Get storage URL                     │
    │ 4. Create database record              │
    │    - Basic metadata                    │
    │ 5. Trigger AI analysis (async)         │
    │    - Document summarization            │
    │    - Entity extraction                 │
    │    - Auto-tagging                      │
    │ 6. Update database with AI results     │
    │                                         │
    └─────────────┬──────────────────────────┘
                  ↓
         Return Document
                  ↓
    Add to documents list
                  ↓
    Show success notification
```

### AI Analysis Flow

```
Trigger: documentAiService.analyzeDocument(id)
         ↓
    ┌────────────────────────────────────────┐
    │ Document AI Service                    │
    │                                         │
    │ 1. Fetch document content              │
    │    - Download from storage             │
    │    - Extract text (PDF/DOCX/etc)       │
    │                                         │
    │ 2. Prepare AI prompt                   │
    │    - Document type context             │
    │    - Analysis requirements             │
    │                                         │
    │ 3. Call OpenAI API                     │
    │    - Model: GPT-4 Turbo                │
    │    - Max tokens: 4000                  │
    │    - Temperature: 0.3                  │
    │                                         │
    │ 4. Parse AI response                   │
    │    - Extract summary                   │
    │    - Parse key points                  │
    │    - Identify entities                 │
    │    - Determine sentiment               │
    │    - Generate tags                     │
    │                                         │
    │ 5. Update document record              │
    │    - Save AI fields                    │
    │    - Set ai_last_analyzed timestamp    │
    │                                         │
    └─────────────┬──────────────────────────┘
                  ↓
    Return AI analysis results
                  ↓
         Cache results
                  ↓
    Notify UI to refresh
```

### Search & Filter Flow

```
User Input: Type in search box / Select filter
         ↓
Debounce (300ms)
         ↓
Update GetDocumentsOptions
    - searchQuery
    - category
    - tags
    - dateRange
    - etc.
         ↓
Call: documentLibraryService.getDocuments(options)
         ↓
    ┌────────────────────────────────────────┐
    │ Query Builder                          │
    │                                         │
    │ 1. Start with base query               │
    │    SELECT * FROM documents             │
    │                                         │
    │ 2. Apply filters                       │
    │    IF searchQuery:                     │
    │      WHERE name ILIKE %query%          │
    │         OR ai_summary ILIKE %query%    │
    │    IF category:                        │
    │      AND category = category           │
    │    IF tags:                            │
    │      AND tags @> tags                  │
    │                                         │
    │ 3. Apply sorting                       │
    │    ORDER BY sortBy sortOrder           │
    │                                         │
    │ 4. Apply pagination                    │
    │    LIMIT limit OFFSET offset           │
    │                                         │
    └─────────────┬──────────────────────────┘
                  ↓
         Execute query
                  ↓
    Return filtered Document[]
                  ↓
         Update UI
```

---

## Type System Design

### Core Document Interface

**Location**: `src/types.ts`

```typescript
/**
 * Base Document interface for document management system.
 * All document-related types should extend this interface.
 *
 * @interface Document
 */
export interface Document {
  // ===== REQUIRED FIELDS =====

  /** Unique document identifier (UUID) */
  id: string;

  /** Document name/title (user-facing) */
  name: string;

  /** ISO 8601 timestamp of creation */
  created_at: string;

  /** ISO 8601 timestamp of last update */
  updated_at: string;

  // ===== OPTIONAL CORE FIELDS =====

  /** Associated contact ID (if linked to contact) */
  contact_id?: string;

  /** Associated case ID (if linked to case) */
  case_id?: string;

  /** User ID who uploaded the document */
  uploaded_by?: string;

  /** Storage path or URL */
  file_path?: string;

  /** File size in bytes */
  file_size?: number;

  /** MIME type (e.g., 'application/pdf') */
  mime_type?: string;

  /** Document category (e.g., 'legal', 'financial') */
  category?: string;

  /** User-assigned tags for organization */
  tags?: string[];

  /** User-provided description */
  description?: string;

  /** Document version number (for version control) */
  version?: number;

  /** Whether document is archived */
  is_archived?: boolean;

  // ===== AI ENHANCEMENT FIELDS =====

  /** AI-generated summary (2-3 sentences) */
  ai_summary?: string;

  /** AI-extracted key points (bullet list) */
  ai_key_points?: string[];

  /** AI sentiment analysis ('positive' | 'negative' | 'neutral') */
  ai_sentiment?: string;

  /** AI-extracted entities (people, orgs, dates, amounts) */
  ai_entities?: Array<{
    type: 'person' | 'organization' | 'date' | 'amount' | 'location';
    value: string;
    confidence: number;
    start: number;
    end: number;
  }>;

  /** ISO 8601 timestamp of last AI analysis */
  ai_last_analyzed?: string;
}
```

### Design Decisions

#### 1. All New Fields Optional

**Rationale**: Maintain backward compatibility with existing code.

**Impact**:
- Existing code continues to work without changes
- Gradual migration path
- No breaking changes to API contracts

**Example**:
```typescript
// Old code still works
const doc: Document = {
  id: '123',
  name: 'test.pdf',
  created_at: '2026-01-19T00:00:00Z',
  updated_at: '2026-01-19T00:00:00Z'
};

// New code can use AI fields
const enhancedDoc: Document = {
  ...doc,
  ai_summary: 'This is a contract...',
  ai_key_points: ['Point 1', 'Point 2']
};
```

#### 2. Structured AI Entities

**Rationale**: Enable rich entity-based features (search, filtering, visualization).

**Benefits**:
- Type-safe entity access
- Confidence scores for filtering
- Position tracking for highlighting
- Extensible type system

**Example**:
```typescript
const entities = document.ai_entities || [];
const people = entities.filter(e => e.type === 'person');
const highConfidence = entities.filter(e => e.confidence > 0.8);
```

#### 3. ISO 8601 Timestamps

**Rationale**: Standardized, sortable, timezone-aware date format.

**Benefits**:
- Consistent date handling
- Easy sorting and filtering
- Timezone support
- Standard library compatibility

---

### Supporting Types

#### GetDocumentsOptions Interface

**Location**: `src/services/documents/documentLibraryService.ts`

```typescript
/**
 * Options for querying documents from the library.
 * All fields optional - omit for defaults.
 *
 * @interface GetDocumentsOptions
 */
export interface GetDocumentsOptions {
  /** Filter by contact ID */
  contactId?: string;

  /** Filter by case ID */
  caseId?: string;

  /** Filter by category (exact match) */
  category?: string;

  /** Filter by tags (documents must have ALL specified tags) */
  tags?: string[];

  /** Search query (matches name, description, ai_summary) */
  searchQuery?: string;

  /** Sort field */
  sortBy?: 'name' | 'date' | 'size';

  /** Sort direction */
  sortOrder?: 'asc' | 'desc';

  /** Include archived documents */
  includeArchived?: boolean;

  /** Include AI enhancement (triggers analysis if missing) */
  includeAI?: boolean;

  /** Maximum results to return */
  limit?: number;

  /** Offset for pagination */
  offset?: number;
}
```

**Usage Patterns**:

```typescript
// Recent documents
const recent = await getDocuments({
  sortBy: 'date',
  sortOrder: 'desc',
  limit: 10
});

// Search within category
const legalDocs = await getDocuments({
  category: 'legal',
  searchQuery: 'contract',
  includeAI: true
});

// Tagged documents
const reviewDocs = await getDocuments({
  tags: ['needs-review', 'urgent'],
  sortBy: 'date',
  sortOrder: 'asc'
});

// Paginated results
const page2 = await getDocuments({
  limit: 20,
  offset: 20
});
```

---

## Service Layer Architecture

### Document Library Service

**File**: `src/services/documents/documentLibraryService.ts`

**Core Functions**:

#### getDocuments(options?: GetDocumentsOptions): Promise<Document[]>

Retrieves documents with filtering and sorting.

**Implementation Details**:
```typescript
export async function getDocuments(
  options: GetDocumentsOptions = {}
): Promise<Document[]> {
  const {
    contactId,
    caseId,
    category,
    tags,
    searchQuery,
    sortBy = 'date',
    sortOrder = 'desc',
    includeArchived = false,
    includeAI = false,
    limit = 50,
    offset = 0
  } = options;

  // Build query
  let query = supabase
    .from('documents')
    .select('*');

  // Apply filters
  if (contactId) query = query.eq('contact_id', contactId);
  if (caseId) query = query.eq('case_id', caseId);
  if (category) query = query.eq('category', category);
  if (tags?.length) query = query.contains('tags', tags);
  if (!includeArchived) query = query.eq('is_archived', false);

  // Search across multiple fields
  if (searchQuery) {
    query = query.or(
      `name.ilike.%${searchQuery}%,` +
      `description.ilike.%${searchQuery}%,` +
      `ai_summary.ilike.%${searchQuery}%`
    );
  }

  // Sorting
  const sortColumn = sortBy === 'date' ? 'created_at' :
                     sortBy === 'size' ? 'file_size' : 'name';
  query = query.order(sortColumn, { ascending: sortOrder === 'asc' });

  // Pagination
  query = query.range(offset, offset + limit - 1);

  // Execute query
  const { data, error } = await query;

  if (error) throw error;

  // Optionally enhance with AI
  if (includeAI) {
    return Promise.all(
      data.map(doc => getDocumentWithAI(doc.id))
    );
  }

  return data;
}
```

**Error Handling**:
- Throws on database errors
- Validates required fields
- Logs errors for debugging
- Returns empty array on no results

---

#### getDocumentWithAI(documentId: string): Promise<Document>

Retrieves document with AI enhancement, triggering analysis if needed.

**Implementation Details**:
```typescript
export async function getDocumentWithAI(
  documentId: string
): Promise<Document> {
  // Get base document
  const document = await getDocument(documentId);

  // Check if AI analysis exists and is recent
  const needsAnalysis = !document.ai_summary ||
    isAnalysisStale(document.ai_last_analyzed);

  if (needsAnalysis) {
    try {
      // Trigger AI analysis
      const aiAnalysis = await documentAiService.analyzeDocument(documentId);

      // Merge AI fields
      const enhanced = {
        ...document,
        ...aiAnalysis,
        ai_last_analyzed: new Date().toISOString()
      };

      // Update database
      await updateDocument(documentId, enhanced);

      return enhanced;
    } catch (error) {
      console.error('AI analysis failed:', error);
      // Return document without AI enhancement
      return document;
    }
  }

  return document;
}

function isAnalysisStale(timestamp?: string): boolean {
  if (!timestamp) return true;

  const analyzed = new Date(timestamp);
  const now = new Date();
  const daysSince = (now.getTime() - analyzed.getTime()) / (1000 * 60 * 60 * 24);

  return daysSince > 30; // Re-analyze after 30 days
}
```

**Performance Optimization**:
- Checks for existing analysis before calling API
- Implements staleness detection
- Caches results in database
- Degrades gracefully on AI failure

---

#### getDocumentsWithMetadata(documentIds: string[]): Promise<Document[]>

Batch retrieves documents with full metadata.

**Implementation Details**:
```typescript
export async function getDocumentsWithMetadata(
  documentIds: string[]
): Promise<Document[]> {
  if (!documentIds.length) return [];

  // Batch query (more efficient than individual queries)
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .in('id', documentIds);

  if (error) throw error;

  // Optionally enhance with AI in parallel
  return Promise.all(
    data.map(doc => getDocumentWithAI(doc.id))
  );
}
```

**Benefits**:
- Single database query
- Parallel AI processing
- Reduced network overhead
- Better performance for bulk operations

---

#### Environment Detection System

**Implementation**:
```typescript
/**
 * Detects if Pulse importer can run in current environment.
 * Returns false in browser environment (no file system access).
 */
const canRunPulseImporter = (() => {
  try {
    // Check if in browser
    if (typeof window !== 'undefined') {
      return false;
    }

    // Check if required Node.js APIs available
    if (typeof require === 'undefined') {
      return false;
    }

    return true;
  } catch {
    return false;
  }
})();

/**
 * Conditionally imports Pulse importer based on environment.
 * Only imported in Node.js environment.
 */
let PulseImporter: any = null;

if (canRunPulseImporter) {
  try {
    // Dynamic import (only in Node.js)
    import('../pulse/pulseImporter')
      .then(module => {
        PulseImporter = module.PulseImporter;
      })
      .catch(error => {
        console.warn('PulseImporter not available:', error);
      });
  } catch (error) {
    console.warn('Failed to import PulseImporter:', error);
  }
}

/**
 * Imports documents from Pulse system.
 * Only available in desktop/server environments.
 *
 * @throws {Error} If called in browser environment
 */
export async function importFromPulse(path: string): Promise<Document[]> {
  if (!PulseImporter) {
    throw new Error(
      'Pulse import is only available in desktop/server environments. ' +
      'Please use the web upload feature instead.'
    );
  }

  return PulseImporter.import(path);
}
```

**Design Benefits**:
- No build errors in browser
- Clear error messages
- Graceful feature degradation
- Desktop/server functionality preserved

---

### Document AI Service

**File**: `src/services/documents/ai/documentAiService.ts`

**Core Functions**:

#### analyzeDocument(documentId: string): Promise<AIAnalysis>

Performs comprehensive AI analysis on document.

**Implementation**:
```typescript
interface AIAnalysis {
  ai_summary: string;
  ai_key_points: string[];
  ai_sentiment: string;
  ai_entities: Entity[];
}

export async function analyzeDocument(
  documentId: string
): Promise<AIAnalysis> {
  // 1. Fetch document content
  const content = await extractDocumentText(documentId);

  // 2. Prepare AI prompt
  const prompt = buildAnalysisPrompt(content);

  // 3. Call OpenAI API
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are a document analysis assistant...'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    max_tokens: 4000,
    temperature: 0.3
  });

  // 4. Parse response
  const analysis = parseAIResponse(response);

  return analysis;
}
```

**Prompt Engineering**:
```typescript
function buildAnalysisPrompt(content: string): string {
  return `
Analyze the following document and provide:

1. SUMMARY: A 2-3 sentence summary of the document's main purpose and content.

2. KEY POINTS: 3-5 bullet points highlighting the most important information.

3. ENTITIES: Extract and categorize important entities:
   - People (names)
   - Organizations (companies, institutions)
   - Dates (important dates mentioned)
   - Amounts (monetary values, quantities)
   - Locations (places mentioned)

4. SENTIMENT: Overall tone of the document (positive, negative, neutral).

5. TAGS: 3-5 relevant tags for categorization.

Document content:
${content}

Respond in JSON format:
{
  "summary": "...",
  "keyPoints": ["...", "..."],
  "entities": [
    {"type": "person", "value": "John Doe", "confidence": 0.95},
    ...
  ],
  "sentiment": "neutral",
  "tags": ["contract", "legal", ...]
}
  `.trim();
}
```

---

#### extractDocumentText(documentId: string): Promise<string>

Extracts text content from various document formats.

**Implementation**:
```typescript
export async function extractDocumentText(
  documentId: string
): Promise<string> {
  const document = await getDocument(documentId);
  const mimeType = document.mime_type;

  // Download file
  const blob = await downloadDocument(documentId);

  // Extract based on type
  switch (mimeType) {
    case 'application/pdf':
      return extractPdfText(blob);

    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return extractDocxText(blob);

    case 'text/plain':
    case 'text/markdown':
      return blob.text();

    default:
      throw new Error(`Unsupported document type: ${mimeType}`);
  }
}

async function extractPdfText(blob: Blob): Promise<string> {
  const pdfLib = await import('pdf-lib');
  const arrayBuffer = await blob.arrayBuffer();
  const pdf = await pdfLib.PDFDocument.load(arrayBuffer);

  let text = '';
  const pages = pdf.getPages();

  for (const page of pages) {
    const content = await page.getTextContent();
    text += content.items.map(item => item.str).join(' ') + '\n';
  }

  return text;
}

async function extractDocxText(blob: Blob): Promise<string> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await blob.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}
```

---

## Component Architecture

### DocumentsHub Component

**File**: `src/components/documents/DocumentsHub.tsx`

**State Management**:

```typescript
interface DocumentsHubState {
  // Core data
  documents: Document[];
  selectedDocument: Document | null;

  // UI state
  loading: boolean;
  error: string | null;

  // Filters
  searchTerm: string;
  selectedCategory: string | null;
  selectedTags: string[];
  sortBy: 'name' | 'date' | 'size';
  sortOrder: 'asc' | 'desc';

  // Selection
  selectedDocumentIds: Set<string>;

  // Pagination
  currentPage: number;
  totalPages: number;
}
```

**Component Lifecycle**:

```typescript
const DocumentsHub: React.FC = () => {
  // State initialization
  const [state, setState] = useState<DocumentsHubState>({
    documents: [],
    selectedDocument: null,
    loading: false,
    error: null,
    searchTerm: '',
    selectedCategory: null,
    selectedTags: [],
    sortBy: 'date',
    sortOrder: 'desc',
    selectedDocumentIds: new Set(),
    currentPage: 1,
    totalPages: 1
  });

  // Initial load
  useEffect(() => {
    loadDocuments();
  }, []);

  // Reload on filter change
  useEffect(() => {
    loadDocuments();
  }, [
    state.searchTerm,
    state.selectedCategory,
    state.selectedTags,
    state.sortBy,
    state.sortOrder,
    state.currentPage
  ]);

  // ... component implementation
};
```

**Key Methods**:

```typescript
// Load documents with current filters
const loadDocuments = async () => {
  setLoading(true);
  setError(null);

  try {
    const options: GetDocumentsOptions = {
      searchQuery: state.searchTerm,
      category: state.selectedCategory,
      tags: state.selectedTags,
      sortBy: state.sortBy,
      sortOrder: state.sortOrder,
      includeAI: AI_FEATURES_ENABLED,
      limit: 50,
      offset: (state.currentPage - 1) * 50
    };

    const docs = await documentLibraryService.getDocuments(options);

    setState(prev => ({
      ...prev,
      documents: docs,
      loading: false
    }));
  } catch (error) {
    console.error('Failed to load documents:', error);
    setState(prev => ({
      ...prev,
      error: 'Failed to load documents. Please try again.',
      loading: false
    }));
  }
};

// Handle document upload
const handleUpload = async (files: File[]) => {
  for (const file of files) {
    try {
      // Validate file
      validateFile(file);

      // Upload to storage
      const uploadedDoc = await uploadDocument(file);

      // Add to list
      setState(prev => ({
        ...prev,
        documents: [uploadedDoc, ...prev.documents]
      }));

      // Trigger AI analysis (async, don't wait)
      documentAiService.analyzeDocument(uploadedDoc.id)
        .then(() => loadDocuments())
        .catch(error => console.error('AI analysis failed:', error));

    } catch (error) {
      console.error('Upload failed:', error);
      showErrorNotification(`Failed to upload ${file.name}`);
    }
  }
};

// Handle batch operations
const handleBatchDelete = async () => {
  const ids = Array.from(state.selectedDocumentIds);

  try {
    await Promise.all(
      ids.map(id => documentLibraryService.deleteDocument(id))
    );

    // Remove from list
    setState(prev => ({
      ...prev,
      documents: prev.documents.filter(doc => !ids.includes(doc.id)),
      selectedDocumentIds: new Set()
    }));

    showSuccessNotification(`Deleted ${ids.length} documents`);
  } catch (error) {
    console.error('Batch delete failed:', error);
    showErrorNotification('Failed to delete documents');
  }
};
```

---

## Integration Points

### Supabase Integration

**Authentication**:
```typescript
import { supabase } from '@/lib/supabaseClient';

// Check authentication before document operations
const user = supabase.auth.user();
if (!user) {
  throw new Error('Authentication required');
}
```

**Storage Operations**:
```typescript
// Upload document
const { data, error } = await supabase.storage
  .from('documents')
  .upload(`${user.id}/${filename}`, file);

// Download document
const { data, error } = await supabase.storage
  .from('documents')
  .download(filePath);

// Get public URL
const { publicURL } = supabase.storage
  .from('documents')
  .getPublicUrl(filePath);
```

**Database Operations**:
```typescript
// Query documents
const { data, error } = await supabase
  .from('documents')
  .select('*')
  .eq('contact_id', contactId)
  .order('created_at', { ascending: false });

// Insert document
const { data, error } = await supabase
  .from('documents')
  .insert({
    name: 'document.pdf',
    contact_id: contactId,
    file_path: storagePath,
    uploaded_by: user.id
  });

// Update with AI results
const { data, error } = await supabase
  .from('documents')
  .update({
    ai_summary: summary,
    ai_key_points: keyPoints,
    ai_last_analyzed: new Date().toISOString()
  })
  .eq('id', documentId);
```

---

### OpenAI Integration

**Configuration**:
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID
});
```

**API Calls**:
```typescript
// Document analysis
const completion = await openai.chat.completions.create({
  model: 'gpt-4-turbo-preview',
  messages: [
    {
      role: 'system',
      content: 'You are a document analysis assistant.'
    },
    {
      role: 'user',
      content: prompt
    }
  ],
  max_tokens: 4000,
  temperature: 0.3,
  response_format: { type: 'json_object' }
});

const result = JSON.parse(completion.choices[0].message.content);
```

**Rate Limiting**:
```typescript
// Implement rate limiting
const rateLimiter = new RateLimiter({
  maxConcurrent: 5,
  minTime: 200 // ms between requests
});

export async function analyzeDocument(id: string) {
  return rateLimiter.schedule(() =>
    performAnalysis(id)
  );
}
```

---

## API Reference

### documentLibraryService

#### getDocuments(options?: GetDocumentsOptions): Promise<Document[]>

Retrieves documents with filtering and sorting.

**Parameters**:
- `options` (optional): Query options object

**Returns**: Promise resolving to Document array

**Example**:
```typescript
const docs = await documentLibraryService.getDocuments({
  category: 'legal',
  searchQuery: 'contract',
  sortBy: 'date',
  limit: 20
});
```

---

#### getDocument(id: string): Promise<Document>

Retrieves single document by ID.

**Parameters**:
- `id`: Document UUID

**Returns**: Promise resolving to Document

**Throws**: Error if document not found

**Example**:
```typescript
const doc = await documentLibraryService.getDocument('123-456-789');
```

---

#### getDocumentWithAI(id: string): Promise<Document>

Retrieves document with AI enhancement.

**Parameters**:
- `id`: Document UUID

**Returns**: Promise resolving to AI-enhanced Document

**Example**:
```typescript
const doc = await documentLibraryService.getDocumentWithAI('123-456-789');
console.log(doc.ai_summary);
console.log(doc.ai_key_points);
```

---

#### uploadDocument(file: File, metadata?: Partial<Document>): Promise<Document>

Uploads new document with optional metadata.

**Parameters**:
- `file`: File object to upload
- `metadata` (optional): Additional document metadata

**Returns**: Promise resolving to created Document

**Example**:
```typescript
const file = event.target.files[0];
const doc = await documentLibraryService.uploadDocument(file, {
  category: 'legal',
  tags: ['contract', 'important'],
  description: 'Q4 2025 contract'
});
```

---

#### updateDocument(id: string, updates: Partial<Document>): Promise<Document>

Updates existing document.

**Parameters**:
- `id`: Document UUID
- `updates`: Fields to update

**Returns**: Promise resolving to updated Document

**Example**:
```typescript
const doc = await documentLibraryService.updateDocument('123-456-789', {
  category: 'archived',
  is_archived: true
});
```

---

#### deleteDocument(id: string): Promise<void>

Deletes document and its file from storage.

**Parameters**:
- `id`: Document UUID

**Returns**: Promise resolving when complete

**Example**:
```typescript
await documentLibraryService.deleteDocument('123-456-789');
```

---

### documentAiService

#### analyzeDocument(id: string): Promise<AIAnalysis>

Performs comprehensive AI analysis.

**Parameters**:
- `id`: Document UUID

**Returns**: Promise resolving to AIAnalysis object

**Example**:
```typescript
const analysis = await documentAiService.analyzeDocument('123-456-789');
console.log(analysis.summary);
console.log(analysis.keyPoints);
```

---

#### summarizeDocument(id: string): Promise<string>

Generates document summary only.

**Parameters**:
- `id`: Document UUID

**Returns**: Promise resolving to summary string

**Example**:
```typescript
const summary = await documentAiService.summarizeDocument('123-456-789');
```

---

#### extractEntities(id: string): Promise<Entity[]>

Extracts named entities from document.

**Parameters**:
- `id`: Document UUID

**Returns**: Promise resolving to Entity array

**Example**:
```typescript
const entities = await documentAiService.extractEntities('123-456-789');
const people = entities.filter(e => e.type === 'person');
```

---

## Code Examples

### Example 1: Document List Component

```typescript
import React, { useState, useEffect } from 'react';
import { documentLibraryService } from '@/services/documents/documentLibraryService';
import type { Document } from '@/types';

const DocumentList: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await documentLibraryService.getDocuments({
        sortBy: 'date',
        sortOrder: 'desc',
        includeAI: true,
        limit: 50
      });
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {documents.map(doc => (
        <DocumentCard key={doc.id} document={doc} />
      ))}
    </div>
  );
};
```

---

### Example 2: Search with Filters

```typescript
const SearchableDocuments: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, category]);

  const performSearch = async () => {
    const docs = await documentLibraryService.getDocuments({
      searchQuery: search,
      category: category,
      includeAI: true
    });
    setDocuments(docs);
  };

  return (
    <div>
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search documents..."
      />

      <select
        value={category || ''}
        onChange={e => setCategory(e.target.value || null)}
      >
        <option value="">All Categories</option>
        <option value="legal">Legal</option>
        <option value="financial">Financial</option>
      </select>

      <DocumentGrid documents={documents} />
    </div>
  );
};
```

---

### Example 3: Upload with Progress

```typescript
const DocumentUploader: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (files: FileList) => {
    setUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        await documentLibraryService.uploadDocument(
          file,
          {
            category: 'general',
            tags: ['uploaded']
          },
          // Progress callback
          (percent) => setProgress(percent)
        );

        setProgress((i + 1) / files.length * 100);
      }

      alert('Upload complete!');
    } catch (error) {
      alert('Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div>
      <input
        type="file"
        multiple
        onChange={e => e.target.files && handleUpload(e.target.files)}
      />

      {uploading && (
        <div className="progress">
          <div style={{ width: `${progress}%` }} />
          <span>{progress.toFixed(0)}%</span>
        </div>
      )}
    </div>
  );
};
```

---

## Configuration Management

### Environment Variables

**Required**:
```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_ORG_ID=org-...
```

**Optional**:
```bash
# Feature Flags
ENABLE_AI_FEATURES=true
ENABLE_BATCH_OPERATIONS=true
ENABLE_ADVANCED_SEARCH=true

# Performance
CACHE_TTL=3600
MAX_CONCURRENT_AI_REQUESTS=5

# Limits
MAX_DOCUMENT_SIZE=52428800  # 50MB in bytes
ALLOWED_MIME_TYPES=application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain

# OpenAI Configuration
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=4000
OPENAI_TEMPERATURE=0.3
```

---

### Feature Flags

**Location**: `src/components/documents/DocumentsHub.tsx`

```typescript
// Feature flags - enable/disable features
const AI_FEATURES_ENABLED = true;
const BATCH_OPERATIONS_ENABLED = true;
const ADVANCED_SEARCH_ENABLED = true;
const PULSE_IMPORT_ENABLED = documentLibraryService.canImportFromPulse();

// Use throughout component
{AI_FEATURES_ENABLED && (
  <AIInsightsPanel document={selectedDocument} />
)}

{BATCH_OPERATIONS_ENABLED && selectedDocuments.length > 0 && (
  <BatchOperationsBar selectedCount={selectedDocuments.length} />
)}
```

---

## Database Schema

### documents Table

```sql
CREATE TABLE documents (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Core fields
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Relationships
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- File metadata
  file_path TEXT,
  file_size BIGINT,
  mime_type TEXT,

  -- Organization
  category TEXT,
  tags TEXT[],
  description TEXT,
  version INTEGER DEFAULT 1,
  is_archived BOOLEAN DEFAULT FALSE,

  -- AI enhancement fields
  ai_summary TEXT,
  ai_key_points TEXT[],
  ai_sentiment TEXT,
  ai_entities JSONB,
  ai_last_analyzed TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_documents_contact_id ON documents(contact_id);
CREATE INDEX idx_documents_case_id ON documents(case_id);
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_tags ON documents USING GIN(tags);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX idx_documents_ai_last_analyzed ON documents(ai_last_analyzed);

-- Full-text search index
CREATE INDEX idx_documents_search ON documents USING GIN(
  to_tsvector('english',
    COALESCE(name, '') || ' ' ||
    COALESCE(description, '') || ' ' ||
    COALESCE(ai_summary, '')
  )
);

-- Row-level security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can insert own documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update own documents"
  ON documents FOR UPDATE
  USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete own documents"
  ON documents FOR DELETE
  USING (auth.uid() = uploaded_by);
```

---

## Security Architecture

### Authentication & Authorization

**Row-Level Security (RLS)**:
- Enabled on documents table
- Users can only access their own documents
- Enforced at database level
- No application-level bypass possible

**File Storage Security**:
```typescript
// Storage bucket policies
const storagePolicy = {
  public: false, // Documents not publicly accessible
  allowedMimeTypes: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown'
  ],
  maxFileSize: 50 * 1024 * 1024, // 50MB
  // Files stored with user ID prefix
  path: `${userId}/${filename}`
};
```

---

### Input Validation

**File Upload Validation**:
```typescript
function validateFile(file: File): void {
  // Size check
  const MAX_SIZE = 50 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error('File too large. Maximum size is 50MB.');
  }

  // Type check
  const ALLOWED_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown'
  ];

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('File type not supported.');
  }

  // Name sanitization
  const sanitized = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  if (sanitized !== file.name) {
    console.warn('Filename sanitized:', file.name, '->', sanitized);
  }
}
```

**Search Query Sanitization**:
```typescript
function sanitizeSearchQuery(query: string): string {
  // Remove SQL injection attempts
  const sanitized = query
    .replace(/[;'"\\]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .trim();

  // Limit length
  return sanitized.substring(0, 200);
}
```

---

### Data Protection

**Sensitive Data Handling**:
- No passwords or API keys in documents table
- Environment variables for secrets
- API keys not exposed to client
- Secure transmission (HTTPS only)

**Audit Logging**:
```typescript
interface AuditLog {
  timestamp: string;
  user_id: string;
  action: 'create' | 'read' | 'update' | 'delete';
  document_id: string;
  ip_address: string;
  user_agent: string;
}

async function logDocumentAccess(
  action: string,
  documentId: string
): Promise<void> {
  await supabase.from('audit_logs').insert({
    timestamp: new Date().toISOString(),
    user_id: supabase.auth.user()?.id,
    action,
    document_id: documentId,
    ip_address: getClientIP(),
    user_agent: navigator.userAgent
  });
}
```

---

## Performance Considerations

### Caching Strategy

**Service-Level Cache**:
```typescript
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedDocument(id: string): Promise<Document | null> {
  const cached = cache.get(id);

  if (!cached) return null;

  const age = Date.now() - cached.timestamp;
  if (age > CACHE_TTL) {
    cache.delete(id);
    return null;
  }

  return cached.data;
}

function setCachedDocument(id: string, doc: Document): void {
  cache.set(id, {
    data: doc,
    timestamp: Date.now()
  });
}
```

**Browser Cache**:
```typescript
// Service Worker for offline support
self.addEventListener('fetch', event => {
  if (event.request.url.includes('/api/documents/')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(fetchResponse => {
          return caches.open('documents-v1').then(cache => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
  }
});
```

---

### Query Optimization

**Database Indexes**:
- Indexed all foreign keys
- GIN index on tags array
- Full-text search index
- Composite indexes for common queries

**Query Patterns**:
```typescript
// GOOD: Uses indexes
const docs = await supabase
  .from('documents')
  .select('*')
  .eq('contact_id', contactId)  // Uses idx_documents_contact_id
  .order('created_at', { ascending: false })  // Uses idx_documents_created_at
  .limit(20);

// BAD: No index on file_size
const largeDocs = await supabase
  .from('documents')
  .select('*')
  .gt('file_size', 10000000)  // Full table scan
  .order('file_size', { ascending: false });

// SOLUTION: Add compound index
CREATE INDEX idx_documents_size_date ON documents(file_size DESC, created_at DESC);
```

---

### Bundle Optimization

**Code Splitting**:
```typescript
// Lazy load DocumentsHub
const DocumentsHub = React.lazy(() =>
  import('./components/documents/DocumentsHub')
);

// Use with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <DocumentsHub />
</Suspense>
```

**Dynamic Imports**:
```typescript
// Load AI service only when needed
async function analyzeDocument(id: string) {
  const { documentAiService } = await import(
    '@/services/documents/ai/documentAiService'
  );

  return documentAiService.analyzeDocument(id);
}
```

---

## Known Limitations

### Current Limitations

1. **File Size Limit**: 50MB per document
   - **Reason**: Browser memory constraints, upload timeouts
   - **Workaround**: Compress large files before upload
   - **Future**: Implement chunked upload for larger files

2. **Supported File Types**: PDF, DOCX, TXT, MD only
   - **Reason**: Text extraction libraries limited
   - **Workaround**: Convert unsupported formats
   - **Future**: Add OCR for images, support for more formats

3. **AI Analysis Time**: 3-5 seconds per document
   - **Reason**: OpenAI API latency
   - **Workaround**: Analysis runs asynchronously after upload
   - **Future**: Implement batch processing, caching

4. **Concurrent AI Requests**: Limited to 5
   - **Reason**: OpenAI rate limits, cost control
   - **Workaround**: Queue requests, show progress
   - **Future**: Implement smart queueing, priority system

5. **Search Depth**: Text search only, no semantic search
   - **Reason**: Cost and complexity of embedding vectors
   - **Workaround**: Use AI-generated tags and summaries
   - **Future**: Implement vector search with embeddings

6. **Offline Support**: Limited to cached documents
   - **Reason**: Service Worker not fully implemented
   - **Workaround**: Ensure online for full functionality
   - **Future**: Complete offline support with sync

7. **Version Control**: Simple version number only
   - **Reason**: Git-like versioning complex to implement
   - **Workaround**: Manual version management
   - **Future**: Full version control with branching

---

### Browser Compatibility

**Supported Browsers**:
- Chrome 90+ ✓
- Firefox 88+ ✓
- Safari 14+ ✓
- Edge 90+ ✓

**Known Issues**:
- Safari: File download sometimes triggers popup blocker
- Firefox: PDF preview may be slower than Chrome
- Edge: Drag-and-drop on some Windows configurations

---

## Maintenance Guidelines

### Regular Maintenance Tasks

#### Daily
- Monitor error rates
- Check AI service status
- Review upload success rate
- Check storage usage

#### Weekly
- Review performance metrics
- Analyze slow queries
- Check cache hit rates
- Review user feedback

#### Monthly
- Update dependencies
- Review security patches
- Optimize database indexes
- Clean up orphaned files
- Review AI analysis quality

---

### Monitoring

**Key Metrics to Track**:

```typescript
interface SystemMetrics {
  // Performance
  avgDocumentLoadTime: number;      // Target: <2s
  avgSearchResponseTime: number;    // Target: <300ms
  avgAIAnalysisTime: number;        // Target: <5s

  // Usage
  documentsUploaded: number;
  aiAnalysesPerformed: number;
  searchQueriesPerformed: number;

  // Errors
  errorRate: number;                // Target: <0.1%
  aiFailureRate: number;           // Target: <1%
  uploadFailureRate: number;       // Target: <0.5%

  // Resources
  storageUsed: number;             // In bytes
  cacheHitRate: number;            // Target: >80%
  apiCostPerDay: number;           // In USD
}
```

---

### Debugging

**Enable Debug Mode**:
```typescript
// Set in environment or browser console
localStorage.setItem('DEBUG_DOCUMENTS', 'true');

// Check in code
const DEBUG = localStorage.getItem('DEBUG_DOCUMENTS') === 'true';

if (DEBUG) {
  console.group('Document Operation');
  console.log('Action:', action);
  console.log('Document:', document);
  console.log('Timing:', performance.now() - startTime);
  console.groupEnd();
}
```

**Common Debug Scenarios**:

```typescript
// Trace document loading
console.log('Loading documents with options:', options);
const start = performance.now();
const docs = await getDocuments(options);
console.log(`Loaded ${docs.length} documents in ${performance.now() - start}ms`);

// Debug AI analysis
console.log('Starting AI analysis for:', documentId);
try {
  const analysis = await analyzeDocument(documentId);
  console.log('AI analysis complete:', analysis);
} catch (error) {
  console.error('AI analysis failed:', error);
  console.error('Document:', await getDocument(documentId));
}

// Debug cache behavior
console.log('Cache stats:', {
  size: cache.size,
  keys: Array.from(cache.keys()),
  hitRate: cacheHits / (cacheHits + cacheMisses)
});
```

---

## Emergency Procedures

### Critical Production Issue

**Severity Levels**:
- **P0 (Critical)**: Complete service outage, data loss risk
- **P1 (High)**: Major feature broken, affects most users
- **P2 (Medium)**: Some features broken, workaround available
- **P3 (Low)**: Minor issue, minimal user impact

---

### P0: Complete Service Outage

**Symptoms**:
- Documents hub won't load
- All document operations failing
- Error rate >10%

**Immediate Actions**:
1. Check system status dashboard
2. Verify Supabase connectivity
3. Check OpenAI API status
4. Review error logs
5. Disable AI features if needed
6. Communicate with users

**Commands**:
```bash
# Check service health
curl https://your-app.com/api/health

# Check Supabase status
curl https://your-project.supabase.co/rest/v1/

# Disable AI features
export ENABLE_AI_FEATURES=false
npm run restart

# Check recent deployments
git log --oneline -10

# Rollback if needed
git revert HEAD
npm run build && npm run deploy
```

**Escalation**: If not resolved in 15 minutes, rollback to previous version.

---

### P1: Major Feature Broken

**Symptoms**:
- Upload failing for all users
- AI analysis not working
- Search returning no results

**Immediate Actions**:
1. Identify affected feature
2. Check recent code changes
3. Review error logs
4. Test in staging environment
5. Apply hotfix or rollback
6. Notify users of workaround

**Common Fixes**:

```typescript
// Upload failures - check storage
const { data, error } = await supabase.storage
  .from('documents')
  .list();
console.log('Storage status:', error ? 'Error' : 'OK');

// AI failures - check API key
const response = await fetch('https://api.openai.com/v1/models', {
  headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }
});
console.log('OpenAI status:', response.ok ? 'OK' : 'Error');

// Search failures - check database
const { data, error } = await supabase
  .from('documents')
  .select('count');
console.log('Database status:', error ? 'Error' : 'OK');
```

---

### Rollback Procedure

**Prerequisites**:
- Recent backup verified
- Rollback target identified
- Team notified

**Steps**:

```bash
# 1. Create rollback tag
git tag -a emergency-rollback-$(date +%Y%m%d-%H%M%S) -m "Rollback point"
git push --tags

# 2. Checkout previous stable version
git log --oneline -20  # Find stable commit
git checkout <stable-commit-hash>

# 3. Verify code
git diff main

# 4. Run tests
npm run test

# 5. Build
npm run build

# 6. Deploy
npm run deploy

# 7. Verify deployment
curl https://your-app.com/api/health

# 8. Monitor
tail -f /var/log/app.log

# 9. Notify team
# Post in team channel: "Rolled back to <commit>, monitoring..."
```

**Post-Rollback**:
1. Confirm services restored
2. Monitor error rates
3. Investigate root cause
4. Plan fix
5. Document incident

---

## Testing Strategy

### Test Pyramid

```
              ┌─────────────────┐
              │   E2E Tests     │  ← 10%
              │   (Playwright)  │
              ├─────────────────┤
              │ Integration     │  ← 30%
              │ Tests (Jest)    │
              ├─────────────────┤
              │   Unit Tests    │  ← 60%
              │   (Jest)        │
              └─────────────────┘
```

---

### Unit Tests

**Test Files**: `src/__tests__/services/documents/`

**Example Unit Test**:
```typescript
import { documentLibraryService } from '@/services/documents/documentLibraryService';

describe('documentLibraryService', () => {
  describe('getDocuments', () => {
    it('should return documents with default options', async () => {
      const docs = await documentLibraryService.getDocuments();

      expect(Array.isArray(docs)).toBe(true);
      expect(docs.length).toBeLessThanOrEqual(50);
    });

    it('should filter by category', async () => {
      const docs = await documentLibraryService.getDocuments({
        category: 'legal'
      });

      docs.forEach(doc => {
        expect(doc.category).toBe('legal');
      });
    });

    it('should sort by date descending', async () => {
      const docs = await documentLibraryService.getDocuments({
        sortBy: 'date',
        sortOrder: 'desc'
      });

      for (let i = 1; i < docs.length; i++) {
        const prev = new Date(docs[i - 1].created_at);
        const curr = new Date(docs[i].created_at);
        expect(prev >= curr).toBe(true);
      }
    });
  });
});
```

---

### Integration Tests

**Example Integration Test**:
```typescript
describe('Document Upload Flow', () => {
  it('should upload, analyze, and retrieve document', async () => {
    // 1. Upload
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const uploaded = await documentLibraryService.uploadDocument(file, {
      category: 'test'
    });

    expect(uploaded.id).toBeDefined();
    expect(uploaded.name).toBe('test.txt');

    // 2. AI Analysis
    await documentAiService.analyzeDocument(uploaded.id);

    // 3. Retrieve with AI
    const doc = await documentLibraryService.getDocumentWithAI(uploaded.id);

    expect(doc.ai_summary).toBeDefined();
    expect(doc.ai_key_points).toBeDefined();

    // 4. Cleanup
    await documentLibraryService.deleteDocument(uploaded.id);
  });
});
```

---

### E2E Tests

**Example E2E Test** (Playwright):
```typescript
test('complete document workflow', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');

  // Navigate to documents
  await page.click('text=Documents');
  await page.waitForSelector('[data-testid="documents-grid"]');

  // Upload document
  const fileInput = await page.locator('input[type="file"]');
  await fileInput.setInputFiles('test-files/sample.pdf');

  // Wait for upload
  await page.waitForSelector('text=Upload complete');

  // Search for document
  await page.fill('[placeholder="Search documents..."]', 'sample');
  await page.waitForTimeout(500); // Debounce

  // Verify document appears
  const docCard = await page.locator('[data-testid="document-card"]').first();
  await expect(docCard).toContainText('sample.pdf');

  // View document details
  await docCard.click();
  await page.waitForSelector('[data-testid="ai-insights-panel"]');

  // Verify AI summary exists
  const summary = await page.locator('[data-testid="ai-summary"]');
  await expect(summary).toBeVisible();
});
```

---

## Deployment Guide

### Pre-Deployment Checklist

- [ ] All tests passing locally
- [ ] TypeScript build successful
- [ ] No ESLint errors
- [ ] Environment variables configured
- [ ] Database migrations reviewed
- [ ] API keys validated
- [ ] Feature flags set correctly
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Team notified of deployment

---

### Deployment Steps

#### 1. Staging Deployment

```bash
# Checkout main branch
git checkout main
git pull origin main

# Run full test suite
npm run test
npm run test:integration
npm run test:e2e

# Build for staging
npm run build:staging

# Deploy to staging
npm run deploy:staging

# Smoke test staging
npm run test:smoke:staging

# If successful, proceed to production
```

---

#### 2. Production Deployment

```bash
# Create release tag
git tag -a v1.0.0 -m "Documents Integration Complete"
git push --tags

# Build for production
npm run build:production

# Create backup
npm run backup:database

# Deploy to production
npm run deploy:production

# Smoke test production
npm run test:smoke:production

# Monitor for 15 minutes
npm run monitor:production
```

---

#### 3. Post-Deployment

```bash
# Verify key metrics
npm run metrics:check

# Check error rates
npm run logs:errors --since=15m

# Verify AI service
npm run test:ai

# Verify upload functionality
npm run test:upload

# Update status page
# "Documents Integration v1.0.0 deployed successfully"
```

---

### Rollback Plan

If critical issues detected within 1 hour:

```bash
# Immediate rollback
npm run deploy:rollback

# Or manual rollback
git checkout <previous-tag>
npm run build:production
npm run deploy:production

# Verify rollback
npm run test:smoke:production

# Incident report
npm run incident:create --severity=P1
```

---

## Conclusion

This handoff report provides comprehensive technical documentation for the Documents Integration system. All code, architecture, and operational procedures are documented for seamless handoff to maintenance team.

**Key Takeaways**:
- Type-safe foundation enables confident development
- Graceful degradation ensures reliability
- Comprehensive monitoring supports proactive maintenance
- Clear emergency procedures minimize downtime
- Complete test coverage enables safe changes

**Next Steps for New Developers**:
1. Read this handoff report thoroughly
2. Review visual guide (DOCUMENTS_UI_VISUAL_GUIDE.md)
3. Set up local development environment
4. Run test suite to verify setup
5. Make small changes to understand architecture
6. Review recent commits for context
7. Reach out to team with questions

---

**Document Version**: 1.0
**Last Updated**: 2026-01-19
**Maintained By**: Development Team
**Next Review**: Q2 2026
