/**
 * Document AI Service - Main AI Orchestrator
 * Phase 2: AI Integration for document classification, OCR, tagging, and search
 *
 * Follows the lazy-loading pattern from aiInsightsService.ts
 * Uses Gemini 2.5 Flash for all AI operations with graceful degradation
 */

import type {
  DocumentAIMetadata,
  DetectedEntity,
  EnhancedDocument,
} from '../../../types/documents';

// Lazy-loaded Gemini AI instance
let ai: any = null;
let model: any = null;

/**
 * Lazy-load Gemini AI SDK
 * Returns null if API key not configured (graceful degradation)
 */
async function getAI() {
  if (!ai) {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      if (!apiKey) {
        console.warn('AI features disabled: VITE_GEMINI_API_KEY not configured');
        return null;
      }

      ai = new GoogleGenerativeAI(apiKey);
      model = ai.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      });
    } catch (error) {
      console.error('Failed to initialize Gemini AI:', error);
      return null;
    }
  }
  return { ai, model };
}

// ============================================================================
// 1. Document Classification
// ============================================================================

export interface ClassificationResult {
  category: string;
  confidence: number;
  suggestedTags: string[];
  reasoning: string;
}

/**
 * Classify a document based on filename and content
 */
export async function classifyDocument(
  fileName: string,
  content?: string
): Promise<ClassificationResult | null> {
  const gemini = await getAI();
  if (!gemini?.model) {
    return null; // AI not available, graceful degradation
  }

  try {
    const prompt = `Analyze this document and classify it into one of these categories: Client, Project, Internal, Template.

Document filename: ${fileName}
${content ? `Document content preview: ${content.substring(0, 1000)}` : ''}

Respond in JSON format:
{
  "category": "Client" | "Project" | "Internal" | "Template",
  "confidence": 0.0-1.0,
  "suggestedTags": ["tag1", "tag2", "tag3"],
  "reasoning": "Brief explanation of why this category was chosen"
}

Guidelines:
- Client: Documents related to specific clients, proposals, contracts, communications
- Project: Project plans, specifications, deliverables, progress reports
- Internal: Company policies, procedures, internal communications, HR documents
- Template: Reusable templates for proposals, contracts, presentations

Provide 3-5 relevant tags that describe the document's content, purpose, or topic.`;

    const result = await gemini.model.generateContent(prompt);
    const response = result.response.text();

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      category: parsed.category,
      confidence: Math.min(Math.max(parsed.confidence, 0), 1), // Clamp 0-1
      suggestedTags: parsed.suggestedTags || [],
      reasoning: parsed.reasoning || '',
    };
  } catch (error) {
    console.error('Error classifying document:', error);
    return null;
  }
}

// ============================================================================
// 2. Text Extraction (OCR for images/PDFs)
// ============================================================================

export interface TextExtractionResult {
  text: string;
  language: string;
  confidence: number;
}

/**
 * Extract text from file using appropriate method
 * - PDF: Use PDF.js for text-based PDFs
 * - Images: Use Gemini Vision API for OCR
 */
export async function extractText(file: File): Promise<TextExtractionResult | null> {
  const fileType = file.type;

  // For PDFs, try PDF.js first
  if (fileType === 'application/pdf') {
    return await extractTextFromPDF(file);
  }

  // For images, use Gemini Vision
  if (fileType.startsWith('image/')) {
    return await extractTextFromImage(file);
  }

  // For text files, just read directly
  if (fileType.startsWith('text/')) {
    try {
      const text = await file.text();
      return {
        text,
        language: 'en', // Simple detection could be added
        confidence: 1.0,
      };
    } catch (error) {
      console.error('Error reading text file:', error);
      return null;
    }
  }

  return null; // Unsupported file type
}

/**
 * Extract text from PDF using PDF.js
 */
async function extractTextFromPDF(file: File): Promise<TextExtractionResult | null> {
  try {
    const pdfjsLib = await import('pdfjs-dist');

    // Set worker path
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';

    // Extract text from all pages
    for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 50); pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';
    }

    if (fullText.trim().length === 0) {
      // PDF might be scanned image - fall back to Gemini Vision
      return await extractTextFromImage(file);
    }

    return {
      text: fullText.trim(),
      language: 'en', // Could add language detection
      confidence: 0.95,
    };
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return null;
  }
}

/**
 * Extract text from image using Gemini Vision API
 */
async function extractTextFromImage(file: File): Promise<TextExtractionResult | null> {
  const gemini = await getAI();
  if (!gemini?.ai) {
    return null;
  }

  try {
    // Use Gemini Vision model for OCR
    const visionModel = gemini.ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Convert file to base64
    const base64 = await fileToBase64(file);

    const imagePart = {
      inlineData: {
        data: base64.split(',')[1], // Remove data:image/jpeg;base64, prefix
        mimeType: file.type,
      },
    };

    const prompt = `Extract all text from this image/document.

Return the text exactly as it appears, maintaining formatting and structure where possible.

If no text is found, return "NO_TEXT_FOUND".`;

    const result = await visionModel.generateContent([prompt, imagePart]);
    const text = result.response.text();

    if (text.includes('NO_TEXT_FOUND') || text.trim().length === 0) {
      return {
        text: '',
        language: 'en',
        confidence: 0,
      };
    }

    return {
      text: text.trim(),
      language: 'en', // Could add language detection
      confidence: 0.85, // Lower confidence for OCR
    };
  } catch (error) {
    console.error('Error extracting text from image:', error);
    return null;
  }
}

/**
 * Convert File to base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ============================================================================
// 3. Smart Summarization
// ============================================================================

export interface SummaryResult {
  summary: string;
  keyPoints: string[];
  entities: Record<string, DetectedEntity[]>;
}

/**
 * Generate AI summary and extract key points from text
 */
export async function generateSummary(text: string): Promise<SummaryResult | null> {
  const gemini = await getAI();
  if (!gemini?.model) {
    return null;
  }

  try {
    // Truncate very long text
    const truncatedText = text.length > 10000 ? text.substring(0, 10000) + '...' : text;

    const prompt = `Analyze this document and provide:
1. A concise summary (2-3 sentences)
2. Key points (3-5 bullet points)
3. Detected entities (people, organizations, locations, dates, emails, phones)

Document text:
${truncatedText}

Respond in JSON format:
{
  "summary": "Brief summary here",
  "keyPoints": ["Point 1", "Point 2", "Point 3"],
  "entities": {
    "people": [{"value": "John Doe", "confidence": 0.9}],
    "organizations": [{"value": "ACME Corp", "confidence": 0.95}],
    "locations": [{"value": "New York", "confidence": 0.8}],
    "dates": [{"value": "2024-01-15", "confidence": 0.9}],
    "emails": [{"value": "john@example.com", "confidence": 1.0}],
    "phones": [{"value": "+1-555-0123", "confidence": 0.85}]
  }
}`;

    const result = await gemini.model.generateContent(prompt);
    const response = result.response.text();

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Convert to our format
    const entities: Record<string, DetectedEntity[]> = {};

    for (const [type, items] of Object.entries(parsed.entities || {})) {
      entities[type] = (items as any[]).map(item => ({
        type: type as any,
        value: item.value,
        confidence: item.confidence,
      }));
    }

    return {
      summary: parsed.summary || '',
      keyPoints: parsed.keyPoints || [],
      entities,
    };
  } catch (error) {
    console.error('Error generating summary:', error);
    return null;
  }
}

// ============================================================================
// 4. Auto-tagging
// ============================================================================

/**
 * Suggest relevant tags based on document name and content
 */
export async function suggestTags(document: {
  name: string;
  content?: string;
}): Promise<string[]> {
  const gemini = await getAI();
  if (!gemini?.model) {
    return [];
  }

  try {
    const prompt = `Suggest 5-10 relevant tags for this document.

Document name: ${document.name}
${document.content ? `Content preview: ${document.content.substring(0, 1000)}` : ''}

Return tags as a JSON array of strings. Tags should be:
- Single words or short phrases (2-3 words max)
- Lowercase
- Descriptive of content, topic, or purpose
- Useful for searching and categorization

Example: ["contract", "legal", "2024", "client-facing", "proposal"]

Return only the JSON array, no other text.`;

    const result = await gemini.model.generateContent(prompt);
    const response = result.response.text().trim();

    // Extract JSON array
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return [];
    }

    const tags = JSON.parse(jsonMatch[0]);
    return Array.isArray(tags) ? tags.slice(0, 10) : [];
  } catch (error) {
    console.error('Error suggesting tags:', error);
    return [];
  }
}

// ============================================================================
// 5. Semantic Search
// ============================================================================

export interface SemanticSearchResult {
  document: EnhancedDocument;
  relevance: number;
  matchedSections: string[];
}

/**
 * Perform semantic search across documents using AI
 */
export async function semanticSearch(
  query: string,
  documents: EnhancedDocument[]
): Promise<SemanticSearchResult[]> {
  const gemini = await getAI();
  if (!gemini?.model) {
    return []; // Fall back to basic search
  }

  try {
    // Build document summaries for search
    const docSummaries = documents.slice(0, 50).map(doc => ({
      id: doc.id,
      name: doc.name,
      category: doc.category,
      tags: doc.auto_tags?.join(', ') || '',
      summary: doc.ai_metadata?.ai_summary || '',
      excerpt: doc.ai_metadata?.extracted_text?.substring(0, 200) || '',
    }));

    const prompt = `You are a semantic search engine. Find the most relevant documents for this query:

Query: "${query}"

Documents:
${JSON.stringify(docSummaries, null, 2)}

Return the top 10 most relevant documents with relevance scores (0-1) and matched sections.

Respond in JSON format:
{
  "results": [
    {
      "documentId": "uuid",
      "relevance": 0.95,
      "matchedSections": ["Brief explanation of why this document matches"]
    }
  ]
}

Consider:
- Semantic meaning, not just keyword matching
- Document category and tags
- Summary and content relevance
- Sort by relevance (highest first)`;

    const result = await gemini.model.generateContent(prompt);
    const response = result.response.text();

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return [];
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Map results back to documents
    const results: SemanticSearchResult[] = [];

    for (const result of parsed.results || []) {
      const doc = documents.find(d => d.id === result.documentId);
      if (doc) {
        results.push({
          document: doc,
          relevance: result.relevance,
          matchedSections: result.matchedSections || [],
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Error in semantic search:', error);
    return [];
  }
}

// ============================================================================
// 6. Complete Document Processing
// ============================================================================

/**
 * Process a document with all AI features
 * This is the main entry point for AI processing
 */
export async function processDocument(
  file: File,
  options: {
    classify?: boolean;
    extractText?: boolean;
    generateSummary?: boolean;
    suggestTags?: boolean;
  } = {}
): Promise<Partial<DocumentAIMetadata> | null> {
  const {
    classify = true,
    extractText = true,
    generateSummary = true,
    suggestTags = true,
  } = options;

  const startTime = Date.now();
  const result: Partial<DocumentAIMetadata> = {
    ai_model_used: 'gemini-2.0-flash-exp',
    processed_at: new Date().toISOString(),
  };

  try {
    // 1. Extract text (if needed for other operations)
    let extractedText = '';
    if (extractText || generateSummary || classify) {
      const extraction = await extractText(file);
      if (extraction) {
        result.extracted_text = extraction.text;
        result.language_detected = extraction.language;
        result.extraction_confidence = extraction.confidence;
        extractedText = extraction.text;
      }
    }

    // 2. Classify document
    if (classify) {
      const classification = await classifyDocument(file.name, extractedText);
      if (classification) {
        result.classification_category = classification.category;
        result.classification_confidence = classification.confidence;
        result.classification_reasoning = classification.reasoning;
      }
    }

    // 3. Generate summary
    if (generateSummary && extractedText) {
      const summary = await generateSummary(extractedText);
      if (summary) {
        result.ai_summary = summary.summary;
        result.key_points = summary.keyPoints;
        result.detected_entities = summary.entities as any;
      }
    }

    // 4. Suggest tags
    if (suggestTags) {
      const tags = await suggestTags({
        name: file.name,
        content: extractedText,
      });
      result.auto_tags = tags;
      result.suggested_tags = tags; // Same for now
    }

    // Calculate processing time
    result.processing_time_ms = Date.now() - startTime;

    return result;
  } catch (error) {
    console.error('Error processing document with AI:', error);
    return null;
  }
}

/**
 * Check if AI is available
 */
export async function isAIAvailable(): Promise<boolean> {
  const gemini = await getAI();
  return gemini !== null;
}
