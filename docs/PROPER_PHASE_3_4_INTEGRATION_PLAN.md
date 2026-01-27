# Proper Phase 3 & 4 Integration Plan

**Date:** January 19, 2026
**Current Status:** Components created but NOT integrated with existing functionality
**Goal:** Make the new UI actually work with existing document upload/management

---

## Current Situation

### What EXISTS and WORKS
- ✅ `src/components/DocumentLibrary.tsx` - Original working component
- ✅ Document upload functionality (somewhere in DocumentLibrary)
- ✅ Document display in list format
- ✅ All existing document management features

### What Was CREATED but NOT WORKING
- ❌ `src/components/documents/cards/DocumentCard.tsx` - Beautiful card, no data
- ❌ `src/components/documents/search/DocumentSearch.tsx` - UI only, not connected
- ❌ `src/components/documents/viewer/DocumentViewer.tsx` - Modal without real preview
- ❌ `src/components/documents/ai/AIInsightsPanel.tsx` - Panel with no AI data
- ❌ `src/components/documents/pulse/PulseBrowser.tsx` - Can't access file system
- ❌ `src/components/documents/DocumentsHub.tsx` - Wrapper that doesn't connect pieces

### The Problem
Line 83 in DocumentsHub.tsx converts documents, but they're the documents prop that gets passed in. The enhanced UI is completely separate from the actual document management.

---

## Step-by-Step Integration Plan

### Step 1: Find the Upload Logic in DocumentLibrary
**File to investigate:** `src/components/DocumentLibrary.tsx`

**What to find:**
1. How does upload work currently?
2. What component/function handles file selection?
3. What service does it call?
4. Where does it store documents?
5. How does it refresh the document list after upload?

**Look for:**
- File input elements
- Upload handlers
- Service imports (likely something like `uploadDocument` or `createDocument`)
- State management for documents list

### Step 2: Extract Upload Logic into Reusable Hook
**New file to create:** `src/hooks/useDocumentUpload.ts`

```typescript
import { useState } from 'react';
// Import whatever upload service DocumentLibrary uses

export function useDocumentUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadDocuments = async (files: File[]) => {
    setIsUploading(true);

    // Use the ACTUAL upload logic from DocumentLibrary
    // This is what needs to be found in Step 1

    setIsUploading(false);
  };

  return {
    uploadDocuments,
    isUploading,
    uploadProgress
  };
}
```

### Step 3: Integrate Upload into DocumentsHub
**File to modify:** `src/components/documents/DocumentsHub.tsx`

**Changes needed:**

1. Import the upload hook:
```typescript
import { useDocumentUpload } from '../../hooks/useDocumentUpload';
```

2. Use the hook:
```typescript
const { uploadDocuments, isUploading } = useDocumentUpload();
```

3. Replace the fake upload button (around line 135-168) with:
```typescript
<button
  type="button"
  onClick={() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = async (e: any) => {
      const files = Array.from(e.target.files || []) as File[];
      await uploadDocuments(files);
      // Refresh documents list
    };
    input.click();
  }}
  disabled={isUploading}
  className="px-4 py-2 rounded-lg bg-rose-500 text-white..."
>
  {isUploading ? 'Uploading...' : 'Upload'}
</button>
```

### Step 4: Wire Up Document Refresh
**Current issue:** Line 83 in DocumentsHub maps the `documents` prop, but this prop doesn't update when new docs are uploaded.

**Solutions to investigate:**

**Option A:** If DocumentLibrary manages its own state:
- Find how it fetches documents
- Extract that into a hook
- Use that hook in DocumentsHub

**Option B:** If documents come from parent component:
- Add an `onDocumentsChange` callback prop
- Call it after upload
- Parent re-fetches and passes new documents

**File to check:** `src/App.tsx` or wherever DocumentsHub is used

Look for how `documents` prop is populated:
```typescript
<DocumentsHub
  documents={documents}  // WHERE does this come from?
  ...
/>
```

### Step 5: Connect DocumentCard to Real Data
**File already exists:** `src/components/documents/cards/DocumentCard.tsx`

**What it needs:**
- The `document` prop is already properly typed as `EnhancedDocument`
- Line 83 in DocumentsHub already converts documents
- This should actually work IF documents prop is populated

**Test it:**
1. Ensure `documents` prop in DocumentsHub has data
2. Enable enhanced library: Change line 28 to `useEnhancedLibrary: true`
3. Check if cards display

**Likely issue:** The cards are showing but you have 0 documents. Check:
- Where are documents stored (Supabase? Local state?)
- Are they being fetched on mount?
- Look in DocumentLibrary for the fetch logic

### Step 6: Fix DocumentViewer
**File:** `src/components/documents/viewer/DocumentViewer.tsx`

**Current issue:** It shows a placeholder for PDF preview

**What's needed:**
1. Find if there's existing PDF viewer logic in DocumentLibrary
2. If yes, extract and reuse it
3. If no, implement simple iframe viewer:

```typescript
{document.file_url && document.file_type?.includes('pdf') && (
  <iframe
    src={document.file_url}
    className="w-full h-full"
    title={document.name}
  />
)}
```

### Step 7: Connect Search to Real Data
**File:** `src/components/documents/search/DocumentSearch.tsx`

**Current issue:** handleSearch in DocumentsHub (line 86-123) does basic filtering but search component might have its own logic

**What to check:**
1. Does DocumentSearch component accept `documents` prop?
2. Is the `onSearch` callback being used correctly?
3. The filtering logic looks okay - test if search actually works when you have documents

### Step 8: Make AI Features Actually Work
**Files to check:**
- `src/services/documents/ai/documentAiService.ts` (created in Phase 2)
- Look for functions like `classifyDocument`, `extractText`, etc.

**What to do:**
1. Find where upload happens (from Step 1)
2. After upload completes, call AI processing:
```typescript
await uploadDocument(file);
// Then process with AI
if (featureFlags.aiFeatures) {
  await processDocumentWithAI(documentId);
}
```

3. Ensure AI metadata is fetched when displaying documents
4. Check if `document_ai_metadata` table is being joined in document fetch

---

## Critical Files to Investigate

### Primary Investigation Targets
1. **`src/components/DocumentLibrary.tsx`**
   - How does upload work?
   - How are documents fetched?
   - What services does it use?

2. **`src/services/` directory**
   - Look for document-related services
   - Find upload functions
   - Find fetch functions

3. **`src/App.tsx`** or parent component
   - How is `documents` prop populated?
   - Where is state managed?

4. **`src/contexts/` directory**
   - Is there a DocumentContext or similar?
   - Might be managing document state

### Files That Need Integration
1. **`src/components/documents/DocumentsHub.tsx`**
   - Lines 135-168: Replace fake upload with real upload
   - Line 83: Ensure documents prop has data
   - Line 86-123: Search is implemented but needs testing

2. **`src/hooks/useDocumentUpload.ts`** (CREATE THIS)
   - Extract upload logic from DocumentLibrary
   - Make it reusable

3. **`src/components/documents/cards/DocumentCard.tsx`**
   - Should work if documents prop populated
   - May need minor prop adjustments

---

## Testing Checklist

### Phase 1: Get Upload Working
- [ ] Find upload logic in DocumentLibrary
- [ ] Create useDocumentUpload hook
- [ ] Wire up Upload button in DocumentsHub
- [ ] Test: Click Upload, select file, verify it uploads
- [ ] Test: Check if document appears in database

### Phase 2: Get Display Working
- [ ] Find where documents are fetched
- [ ] Ensure DocumentsHub receives populated documents prop
- [ ] Enable enhanced library (line 28: `useEnhancedLibrary: true`)
- [ ] Test: See if documents appear in grid
- [ ] Test: Click a card, verify viewer opens

### Phase 3: Get Search Working
- [ ] Ensure documents are loaded
- [ ] Test search with existing documents
- [ ] Verify filtered results display

### Phase 4: Get AI Working
- [ ] Find AI processing service
- [ ] Hook into upload flow
- [ ] Test: Upload doc, verify AI metadata created
- [ ] Test: Open AI Insights panel, verify data displays

---

## Quick Wins (Do These First)

### 1. Enable Enhanced Library with Existing Documents
```typescript
// Line 28 in DocumentsHub.tsx
useEnhancedLibrary: true
```
Then check if you see any documents in grid view. If you see 0 documents, the issue is data fetching, not the UI.

### 2. Check Console for Documents Data
Add this temporarily to DocumentsHub (around line 84):
```typescript
console.log('Documents prop:', documents);
console.log('Enhanced documents:', enhancedDocuments);
```
This tells you if documents are being passed in.

### 3. Find the Real Upload Service
```bash
cd f:/logos-vision-crm
grep -r "uploadDocument\|createDocument\|addDocument" src/
```
This finds the actual upload function.

### 4. Check Supabase Query
Look for queries like:
```typescript
supabase.from('documents').select('*')
```
These show how documents are fetched. The enhanced UI needs the same query.

---

## What NOT to Do

❌ **Don't create new upload logic** - Reuse what exists
❌ **Don't create new document fetching** - Reuse what exists
❌ **Don't replace DocumentLibrary completely** - Enhance it incrementally
❌ **Don't enable Pulse sync yet** - It needs backend work
❌ **Don't worry about perfect UI** - Get it functional first

---

## Success Criteria

When done correctly, you should have:

✅ **Upload button that works** - Uses existing upload service
✅ **Documents display in grid** - Shows real documents from database
✅ **Search that filters** - Works on real document data
✅ **Viewer that opens** - Shows real document content
✅ **AI metadata displays** - If AI service is working
✅ **Smooth toggle** - Can switch between old/new UI without breaking

---

## Files Reference

### Working Files (Don't Touch)
- `src/components/DocumentLibrary.tsx` - Original working UI
- Any services it imports - These work

### Files to Modify
- `src/components/documents/DocumentsHub.tsx` - Main integration point
- `src/hooks/useDocumentUpload.ts` - CREATE: Extract upload logic
- `src/components/documents/viewer/DocumentViewer.tsx` - Add real preview

### Files That Should Work As-Is
- `src/components/documents/cards/DocumentCard.tsx`
- `src/components/documents/search/DocumentSearch.tsx`
- `src/components/documents/ai/AIInsightsPanel.tsx`

### Files to Investigate
- Where upload happens (probably in services/)
- Where documents fetch happens (probably in services/ or contexts/)
- How AI processing works (src/services/documents/ai/)

---

## Next Steps for Implementation

1. **READ** `src/components/DocumentLibrary.tsx` completely
2. **FIND** the upload function it uses
3. **FIND** how it fetches documents
4. **CREATE** `useDocumentUpload` hook
5. **MODIFY** DocumentsHub to use the hook
6. **TEST** upload with enhanced UI enabled
7. **FIX** any issues with document display
8. **ITERATE** until it all works

---

## Questions to Answer

Before you can properly integrate, answer these:

1. **Where is document upload logic?**
   - File: ?
   - Function: ?

2. **Where are documents fetched from?**
   - Service: ?
   - Database table: `documents`
   - Query joins: ?

3. **How does DocumentLibrary refresh after upload?**
   - Callback? State update? Refetch?

4. **Where is AI processing called?**
   - File: ?
   - Function: ?
   - When: After upload? On demand?

5. **What props does DocumentLibrary accept?**
   - documents: Document[]
   - Others: ?

---

**This plan gives you a clear path to PROPERLY integrate the new UI with existing functionality. Start with investigation, then integration, then testing.**
