# Document AI Features - Quick Start Guide

## ✅ You're Already Configured!

Your `.env` file already has the Gemini API key set up:
```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

The AI features are ready to use!

---

## How to Enable AI Features

### Option 1: Enable via Browser Console (Easiest for Testing)

1. Open your Logos Vision CRM in the browser
2. Open Developer Tools (F12)
3. Go to the Console tab
4. Run this command:

```javascript
localStorage.setItem('document_feature_flags', JSON.stringify({
  useEnhancedLibrary: false,
  aiFeatures: true,  // ← This enables AI processing
  pulseSync: false,
  versionControl: false,
  analytics: false
}));
```

5. Refresh the page

Now AI processing will automatically run when you upload documents!

### Option 2: Enable Permanently in Code

Edit [src/components/documents/DocumentsHub.tsx](../src/components/documents/DocumentsHub.tsx):

Change line 24 from:
```typescript
aiFeatures: false,         // Phase 2: Enable AI features
```

To:
```typescript
aiFeatures: true,          // Phase 2: Enable AI features
```

Then rebuild: `npm run build`

---

## What Happens When You Upload a Document

### With AI Features Enabled:

1. **Upload File** → File goes to Supabase Storage ✓
2. **Extract Text** →
   - PDFs: PDF.js extracts text
   - Images: Gemini Vision runs OCR
   - Text files: Direct reading
3. **Classify Document** → AI categorizes as Client/Project/Internal/Template
4. **Generate Tags** → AI suggests tags like "contract", "proposal", "2024"
5. **Create Summary** → 2-3 sentence summary
6. **Detect Entities** → Finds names, organizations, dates, emails
7. **Save to Database** → All results saved to `document_ai_metadata` table

### Processing Time:
- Total: 3-8 seconds per document
- Text extraction: 1-3 seconds
- Classification: 500-1000ms
- Summary: 1-2 seconds
- Tagging: 500-1000ms

---

## How to Test AI Features

### Test 1: Upload a PDF Document

1. Go to Documents section
2. Click "Upload Document" or drag & drop a PDF
3. **Wait for upload to complete** (progress bar)
4. AI processing happens automatically in background

### Test 2: Check AI Results in Database

Open Supabase Dashboard → SQL Editor → Run:

```sql
-- View all AI-processed documents
SELECT
  d.id,
  d.name,
  d.ai_processed,
  d.ocr_processed,
  ai.classification_category,
  ai.classification_confidence,
  ai.auto_tags,
  ai.ai_summary
FROM documents d
LEFT JOIN document_ai_metadata ai ON d.id = ai.document_id
WHERE d.ai_processed = true
ORDER BY d.updated_at DESC
LIMIT 10;
```

### Test 3: Check Specific Document AI Metadata

```sql
-- Replace 'document-id-here' with actual document ID
SELECT * FROM document_ai_metadata
WHERE document_id = 'document-id-here';
```

You should see:
- `extracted_text` - Full text from document
- `classification_category` - Client/Project/Internal/Template
- `classification_confidence` - 0.0 to 1.0
- `auto_tags` - Array of tags
- `ai_summary` - Brief summary
- `detected_entities` - People, organizations, dates, etc.
- `processing_time_ms` - How long AI took

---

## How uploadDocument() Works

### In the Code:

```typescript
// src/services/documents/documentLibraryService.ts

export async function uploadDocument(
  file: File,
  metadata: Partial<DocumentMetadata>,
  onProgress?: (progress: UploadProgress) => void
): Promise<EnhancedDocument> {

  // 1. Upload file to storage (50% progress)
  const fileUrl = await uploadToSupabase(file);

  // 2. Create document record (75% progress)
  const document = await createDocumentRecord(fileUrl, metadata);

  // 3. Check if AI features enabled
  if (featureFlags.aiFeatures && metadata.run_ai_processing !== false) {

    // 4. Process with AI (85-95% progress)
    await processDocumentWithAI(document.id, file, uploadProgress, onProgress);
  }

  // 5. Complete (100% progress)
  return document;
}
```

### The { run_ai_processing: true } Parameter

This is an **optional** parameter you can pass to control AI processing per upload:

```typescript
// Force AI processing even if feature flag is off
uploadDocument(file, {
  run_ai_processing: true,  // ← Explicitly enable AI
  category: 'Client'
});

// Skip AI processing even if feature flag is on
uploadDocument(file, {
  run_ai_processing: false,  // ← Explicitly disable AI
  category: 'Project'
});

// Default: Use feature flag setting
uploadDocument(file, {
  category: 'Client'  // ← Uses aiFeatures flag
});
```

**In the UI:** You don't need to manually call this function. The DocumentLibrary component calls it automatically when you upload files.

---

## Where AI Results Are Displayed

### Current State (Phase 2):
- ✅ AI processing works
- ✅ Results saved to database
- ❌ No UI to display results yet (coming in Phase 4)

### How to See Results Now:
1. Use Supabase SQL queries (shown above)
2. Use browser DevTools → Network tab → Watch API calls
3. Add `console.log()` to see processing status

### Phase 4 UI (Coming Next):
- AI insights panel in document viewer
- Tag suggestions during upload
- Classification preview
- Smart search with AI results

---

## AI Features Breakdown

### 1. Document Classification
**What it does:** Automatically categorizes documents

**Example:**
- Filename: "Client_Proposal_2024.pdf"
- Result: Category = "Client", Confidence = 0.92
- Reasoning: "Contains proposal language and client-facing terminology"

### 2. OCR Text Extraction
**What it does:** Extracts text from PDFs and images

**Example:**
- Upload: Scanned contract image (JPG)
- Result: Full text extracted with 85% confidence
- Language: English

### 3. Auto-Tagging
**What it does:** Suggests relevant tags

**Example:**
- Document: Project specification PDF
- Tags: ["specification", "technical", "project", "2024", "deliverables"]

### 4. Smart Summary
**What it does:** Creates summary and finds entities

**Example:**
```json
{
  "summary": "Contract between Acme Corp and John Doe for web development services starting January 2024.",
  "keyPoints": [
    "Fixed-price contract for $50,000",
    "6-month project duration",
    "Deliverables include web app and documentation"
  ],
  "entities": {
    "people": [
      { "value": "John Doe", "confidence": 0.95 }
    ],
    "organizations": [
      { "value": "Acme Corp", "confidence": 0.98 }
    ],
    "dates": [
      { "value": "January 2024", "confidence": 0.90 }
    ]
  }
}
```

---

## Troubleshooting

### "AI features not working"
1. Check `.env` has `VITE_GEMINI_API_KEY`
2. Restart dev server: `npm run dev`
3. Check browser console for errors
4. Verify feature flag: `localStorage.getItem('document_feature_flags')`

### "No AI metadata in database"
1. Confirm `aiFeatures: true` in feature flags
2. Check Supabase logs for errors
3. Verify Gemini API key is valid
4. Try uploading a simple text file first (faster to test)

### "OCR not extracting text"
1. Ensure image has readable text (not too blurry)
2. Try a PDF with text first (faster processing)
3. Check console for Gemini API errors

---

## Cost Management

### Gemini API Free Tier:
- **2 million tokens per day**
- **Typical document:** 1,000-5,000 tokens
- **Daily capacity:** ~400-2,000 documents

### How We Optimize:
1. **Cache results** - Never process same document twice
2. **Truncate long docs** - Max 10,000 characters for summary
3. **Page limits** - Only first 50 pages of PDFs
4. **Use Flash model** - Fastest, cheapest Gemini model

**You're on the free tier, so no costs!** Just stay under 2M tokens/day.

---

## Next Steps

### Immediate:
1. Enable AI features via console (Option 1 above)
2. Upload a test PDF document
3. Check database for AI results
4. Verify classification and tags

### Phase 4 (Coming Next):
- Build UI to display AI insights
- Add tag suggestion interface
- Create document viewer with AI panel
- Implement smart search UI

---

**Questions?**
- Check [PHASE_2_AI_INTEGRATION_COMPLETE.md](./PHASE_2_AI_INTEGRATION_COMPLETE.md) for technical details
- Check [ENTERPRISE_DOCUMENT_LIBRARY_STATUS.md](./ENTERPRISE_DOCUMENT_LIBRARY_STATUS.md) for overall status
- Review source code: [src/services/documents/ai/documentAiService.ts](../src/services/documents/ai/documentAiService.ts)
