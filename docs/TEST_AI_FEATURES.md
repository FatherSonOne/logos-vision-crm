# Testing Document AI Features - Step-by-Step Guide

## Quick Test (2 minutes)

### Step 1: Enable AI Features

Open browser console (F12) and run:

```javascript
localStorage.setItem('document_feature_flags', JSON.stringify({
  aiFeatures: true
}));
location.reload();
```

### Step 2: Upload a Test Document

1. Go to Documents section in Logos Vision CRM
2. Upload any PDF or text file
3. Wait for upload to complete (~3-8 seconds)

### Step 3: Check Results in Supabase

Go to [Supabase Dashboard](https://supabase.com/dashboard/project/psjgmdnrehcwvppbeqjy) → SQL Editor

**Query 1: See All AI-Processed Documents**
```sql
SELECT
  d.name,
  d.ai_processed,
  ai.classification_category,
  ai.classification_confidence,
  ai.auto_tags,
  LEFT(ai.ai_summary, 100) as summary_preview
FROM documents d
JOIN document_ai_metadata ai ON d.id = ai.document_id
ORDER BY d.updated_at DESC
LIMIT 5;
```

**Query 2: See Full AI Metadata for Latest Document**
```sql
SELECT
  d.name,
  ai.*
FROM documents d
JOIN document_ai_metadata ai ON d.id = ai.document_id
ORDER BY d.updated_at DESC
LIMIT 1;
```

---

## Detailed Test Suite

### Test 1: PDF Text Extraction

**Upload:** Any PDF with text (e.g., a contract, proposal, or report)

**Expected Results:**
```sql
SELECT
  extracted_text,
  language_detected,
  extraction_confidence
FROM document_ai_metadata
WHERE document_id = 'your-document-id';
```

- ✅ `extracted_text` should contain full document text
- ✅ `language_detected` should be "en" (or detected language)
- ✅ `extraction_confidence` should be 0.85-0.95

### Test 2: Document Classification

**Upload:** Documents with obvious categories
- Client proposal → Should classify as "Client"
- Project plan → Should classify as "Project"
- Internal memo → Should classify as "Internal"
- Contract template → Should classify as "Template"

**Expected Results:**
```sql
SELECT
  classification_category,
  classification_confidence,
  classification_reasoning
FROM document_ai_metadata
WHERE document_id = 'your-document-id';
```

- ✅ `classification_category` should match document type
- ✅ `classification_confidence` should be > 0.7
- ✅ `classification_reasoning` should explain why

### Test 3: Auto-Tagging

**Upload:** Any document with clear subject matter

**Expected Results:**
```sql
SELECT
  name,
  auto_tags
FROM documents d
JOIN document_ai_metadata ai ON d.id = ai.document_id
WHERE d.id = 'your-document-id';
```

- ✅ `auto_tags` should be array of 5-10 relevant tags
- ✅ Tags should be lowercase
- ✅ Tags should describe content/purpose

**Example:**
```json
{
  "name": "Client_Proposal_2024_WebDev.pdf",
  "auto_tags": ["proposal", "client", "2024", "web-development", "contract"]
}
```

### Test 4: Smart Summary & Entity Detection

**Upload:** Document with people, organizations, dates

**Expected Results:**
```sql
SELECT
  ai_summary,
  key_points,
  detected_entities
FROM document_ai_metadata
WHERE document_id = 'your-document-id';
```

- ✅ `ai_summary` should be 2-3 sentences
- ✅ `key_points` should be array of 3-5 bullet points
- ✅ `detected_entities` should find people, organizations, dates, emails

**Example:**
```json
{
  "ai_summary": "Contract between Acme Corp and John Doe for web development...",
  "key_points": [
    "Fixed-price contract for $50,000",
    "6-month project duration"
  ],
  "detected_entities": {
    "people": [
      {"value": "John Doe", "confidence": 0.95}
    ],
    "organizations": [
      {"value": "Acme Corp", "confidence": 0.98}
    ],
    "dates": [
      {"value": "2024-01-15", "confidence": 0.90}
    ]
  }
}
```

### Test 5: OCR on Scanned Images

**Upload:** Image file (JPG/PNG) with text

**Expected Results:**
```sql
SELECT
  extracted_text,
  extraction_confidence
FROM document_ai_metadata
WHERE document_id = 'your-document-id';
```

- ✅ `extracted_text` should contain recognized text
- ✅ `extraction_confidence` should be 0.70-0.90 (lower than PDF)
- ⚠️ May take longer (1-3 seconds for OCR)

### Test 6: Semantic Search (Future)

**Note:** Semantic search UI not implemented yet (Phase 4), but you can test the function directly:

```typescript
// In browser console or test file
import { semanticSearch } from '@/services/documents/ai/documentAiService';

const results = await semanticSearch(
  "Show me all client proposals from 2024",
  documents
);

console.log(results);
```

**Expected:** Documents ranked by relevance with matched sections

---

## Performance Testing

### Test 7: Processing Speed

**Upload:** Various file types and measure time

**Expected Times:**
- Small PDF (1-5 pages): 3-5 seconds
- Large PDF (50+ pages): 5-8 seconds
- Image with OCR: 4-6 seconds
- Text file: 2-3 seconds

**Check Processing Time:**
```sql
SELECT
  d.name,
  ai.processing_time_ms,
  ai.processing_time_ms / 1000.0 as seconds
FROM documents d
JOIN document_ai_metadata ai ON d.id = ai.document_id
ORDER BY d.updated_at DESC
LIMIT 10;
```

### Test 8: Multiple Uploads

**Upload:** 5-10 documents in quick succession

**Expected:**
- ✅ All should process successfully
- ✅ No crashes or errors
- ✅ Database should have metadata for all
- ✅ Memory usage stays reasonable

---

## Error Handling Tests

### Test 9: Graceful Degradation

**Scenario 1: Invalid API Key**
1. Change `.env` to invalid key
2. Restart dev server
3. Upload document

**Expected:**
- ✅ Upload completes successfully
- ✅ `ai_processed = false` in documents table
- ✅ Console warning: "AI features disabled"
- ✅ No AI metadata created

**Scenario 2: AI Feature Disabled**
```javascript
localStorage.setItem('document_feature_flags', JSON.stringify({
  aiFeatures: false
}));
```

**Expected:**
- ✅ Upload works normally
- ✅ No AI processing occurs
- ✅ No API calls to Gemini

### Test 10: Error Recovery

**Upload:** Very large file (>100MB) or corrupted file

**Expected:**
- ✅ Graceful error message
- ✅ No crash
- ✅ User can retry
- ✅ Partial results saved if possible

---

## Console Monitoring

### Enable Debug Logging

Open browser console and watch for:

```
✅ Good Messages:
- "AI classification complete: Client (confidence: 0.92)"
- "OCR extracted 1,234 words"
- "Generated 7 tags"
- "Processing complete in 3,456ms"

⚠️ Warning Messages:
- "AI features disabled: VITE_GEMINI_API_KEY not configured"
- "Skipping AI processing (feature flag disabled)"

❌ Error Messages:
- "Error classifying document: [error details]"
- "Failed to extract text: [error details]"
```

---

## Database Health Check

### Query 1: Overall AI Processing Stats

```sql
SELECT
  COUNT(*) as total_documents,
  COUNT(CASE WHEN ai_processed = true THEN 1 END) as ai_processed_count,
  ROUND(AVG(CASE WHEN ai_processed = true THEN 1.0 ELSE 0.0 END) * 100, 2) as ai_processing_rate
FROM documents
WHERE updated_at > NOW() - INTERVAL '7 days';
```

### Query 2: AI Processing Success Rate

```sql
SELECT
  COUNT(*) as total_processed,
  AVG(classification_confidence) as avg_confidence,
  AVG(extraction_confidence) as avg_extraction_confidence,
  AVG(processing_time_ms) as avg_processing_time_ms
FROM document_ai_metadata
WHERE processed_at > NOW() - INTERVAL '7 days';
```

### Query 3: Most Common Tags

```sql
SELECT
  tag,
  COUNT(*) as usage_count
FROM (
  SELECT UNNEST(auto_tags) as tag
  FROM document_ai_metadata
) tags
GROUP BY tag
ORDER BY usage_count DESC
LIMIT 20;
```

### Query 4: Classification Distribution

```sql
SELECT
  classification_category,
  COUNT(*) as document_count,
  AVG(classification_confidence) as avg_confidence
FROM document_ai_metadata
GROUP BY classification_category
ORDER BY document_count DESC;
```

---

## Success Criteria Checklist

After testing, verify:

- [ ] **Phase 2 Complete Criteria:**
  - [ ] 80%+ classification accuracy
  - [ ] OCR works for PDFs and images
  - [ ] Auto-tagging generates relevant tags
  - [ ] Processing completes within 3-8 seconds
  - [ ] Graceful degradation without API key
  - [ ] No errors in console
  - [ ] Database properly populated

- [ ] **User Experience:**
  - [ ] Upload is smooth and responsive
  - [ ] Progress indicator works
  - [ ] No UI freezes during processing
  - [ ] Results saved correctly

- [ ] **Technical Health:**
  - [ ] No memory leaks
  - [ ] API quota not exceeded
  - [ ] Database queries fast (< 100ms)
  - [ ] Error handling works

---

## Troubleshooting Common Issues

### Issue: "No AI metadata after upload"

**Solutions:**
1. Check feature flag: `localStorage.getItem('document_feature_flags')`
2. Verify API key in `.env`: `VITE_GEMINI_API_KEY`
3. Restart dev server: `npm run dev`
4. Check browser console for errors
5. Try uploading a simple text file (faster to debug)

### Issue: "Classification confidence very low"

**This is normal if:**
- Document is ambiguous (could fit multiple categories)
- File name doesn't match content
- Document is very short or generic

**Try:**
- Upload documents with clearer category signals
- Check `classification_reasoning` for explanation

### Issue: "OCR not extracting text from image"

**Check:**
1. Image has readable text (not too small/blurry)
2. Image format supported (JPG, PNG)
3. Gemini API key is valid
4. Console shows Gemini Vision API call

**Try:**
- Test with high-quality scan
- Try PDF with text first (more reliable)

### Issue: "Processing takes too long"

**Normal times:** 3-8 seconds per document

**If longer:**
- Very large PDFs (50+ pages) take longer
- OCR on images takes 1-3 seconds extra
- Network latency to Gemini API
- Check `processing_time_ms` in database

---

## Next Steps After Testing

Once AI features are verified:

1. ✅ **Phase 2 Complete**
2. ➡️ **Start Phase 3:** Pulse Integration
3. ➡️ **Start Phase 4:** UI/UX for displaying AI results

---

**Need Help?**
- Review [AI_FEATURES_QUICK_START.md](./AI_FEATURES_QUICK_START.md)
- Check [PHASE_2_AI_INTEGRATION_COMPLETE.md](./PHASE_2_AI_INTEGRATION_COMPLETE.md)
- Inspect code: [documentAiService.ts](../src/services/documents/ai/documentAiService.ts)
