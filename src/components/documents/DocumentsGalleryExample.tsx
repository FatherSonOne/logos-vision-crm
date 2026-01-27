/**
 * Documents Gallery Example
 * Demonstrates integration of Phase 4 UI components
 *
 * This is an example implementation showing how to use:
 * - DocumentCard (grid view)
 * - DocumentSearch (semantic search)
 * - DocumentViewer (preview modal)
 * - AIInsightsPanel (integrated in viewer)
 */

import React, { useState } from 'react';
import { DocumentCard } from './cards/DocumentCard';
import { DocumentViewer } from './viewer/DocumentViewer';
import { DocumentSearch } from './search/DocumentSearch';
import type { EnhancedDocument, DocumentSearchResult, DocumentFilters } from '../../types/documents';

interface DocumentsGalleryExampleProps {
  documents: EnhancedDocument[];
  onSearch?: (query: string, filters?: DocumentFilters) => Promise<DocumentSearchResult[]>;
  onDownload?: (document: EnhancedDocument) => void;
  onShare?: (document: EnhancedDocument) => void;
  onPrint?: (document: EnhancedDocument) => void;
}

export const DocumentsGalleryExample: React.FC<DocumentsGalleryExampleProps> = ({
  documents,
  onSearch,
  onDownload,
  onShare,
  onPrint,
}) => {
  // State management
  const [selectedDocument, setSelectedDocument] = useState<EnhancedDocument | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<DocumentSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [displayedDocuments, setDisplayedDocuments] = useState<EnhancedDocument[]>(documents);

  // Search handler
  const handleSearch = async (query: string, filters?: DocumentFilters) => {
    if (!onSearch) {
      // Fallback: simple client-side filtering
      const filtered = documents.filter((doc) =>
        doc.name.toLowerCase().includes(query.toLowerCase())
      );
      setDisplayedDocuments(filtered);
      return;
    }

    setIsSearching(true);
    try {
      const results = await onSearch(query, filters);
      setSearchResults(results);

      // Update displayed documents based on search results
      if (query.trim()) {
        setDisplayedDocuments(results.map((r) => r.document));
      } else {
        setDisplayedDocuments(documents);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // View document handler
  const handleView = (document: EnhancedDocument) => {
    setSelectedDocument(document);
    setViewerOpen(true);
  };

  // Favorite toggle handler
  const handleFavorite = (document: EnhancedDocument) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(document.id)) {
        newFavorites.delete(document.id);
      } else {
        newFavorites.add(document.id);
      }
      return newFavorites;
    });
  };

  // Download handler
  const handleDownload = (document: EnhancedDocument) => {
    if (onDownload) {
      onDownload(document);
    } else {
      // Fallback: open in new tab
      window.open(document.file_url, '_blank');
    }
  };

  // Search result click handler
  const handleSearchResultClick = (result: DocumentSearchResult) => {
    handleView(result.document);
  };

  return (
    <div className="w-full space-y-6">
      {/* Search Bar */}
      <div className="sticky top-0 z-40 bg-white dark:bg-slate-900 pt-6 pb-4">
        <DocumentSearch
          onSearch={handleSearch}
          searchResults={searchResults}
          isSearching={isSearching}
          onResultClick={handleSearchResultClick}
          placeholder="Search documents with AI-powered semantic search..."
          useSemanticSearch={true}
        />
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayedDocuments.map((document) => (
          <DocumentCard
            key={document.id}
            document={document}
            onView={handleView}
            onDownload={handleDownload}
            onFavorite={handleFavorite}
            isFavorite={favorites.has(document.id)}
            showPreview={true}
          />
        ))}
      </div>

      {/* Empty State */}
      {displayedDocuments.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto mb-4 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-lg font-medium text-slate-600 dark:text-slate-400">
              No documents found
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
              Try adjusting your search terms or filters
            </p>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          isOpen={viewerOpen}
          onClose={() => {
            setViewerOpen(false);
            // Clear selection after animation completes
            setTimeout(() => setSelectedDocument(null), 300);
          }}
          onDownload={handleDownload}
          onShare={onShare}
          onPrint={onPrint}
        />
      )}
    </div>
  );
};

// Example usage with sample data
export const DocumentsGalleryExampleUsage = () => {
  const sampleDocuments: EnhancedDocument[] = [
    {
      id: '1',
      name: 'Q4 Financial Report 2025.pdf',
      file_type: 'application/pdf',
      file_size: 2500000,
      file_url: '/documents/q4-report.pdf',
      category: 'report',
      storage_provider: 'supabase',
      version_number: 2,
      ai_processed: true,
      ocr_processed: true,
      pulse_synced: false,
      preview_available: true,
      visibility: 'organization',
      sensitivity_level: 'normal',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ai_metadata: {
        id: '1',
        document_id: '1',
        classification_category: 'report',
        classification_confidence: 0.95,
        classification_reasoning: 'Contains financial data, charts, and quarterly analysis',
        auto_tags: ['financial', 'Q4', 'revenue', 'quarterly'],
        ai_summary: 'Comprehensive quarterly financial report showing 15% revenue growth and key performance metrics for Q4 2025.',
        key_points: [
          'Revenue increased by 15% year-over-year',
          'Operating expenses reduced by 8%',
          'Strong customer acquisition in enterprise segment',
        ],
        detected_entities: {
          organization: [
            { type: 'organization', value: 'Acme Corp', confidence: 0.98 },
          ],
          date: [
            { type: 'date', value: 'Q4 2025', confidence: 0.99 },
          ],
        },
        language_detected: 'English',
        processed_at: new Date().toISOString(),
        processing_time_ms: 1250,
        ai_model_used: 'claude-sonnet-4',
      },
    },
    // Add more sample documents as needed
  ];

  const handleSearch = async (
    query: string,
    filters?: DocumentFilters
  ): Promise<DocumentSearchResult[]> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    return sampleDocuments
      .filter((doc) => doc.name.toLowerCase().includes(query.toLowerCase()))
      .map((doc) => ({
        document: doc,
        relevance_score: 0.85,
        matched_fields: ['name', 'content'],
        matched_sections: [
          'This section contains information about quarterly revenue and expenses...',
        ],
      }));
  };

  return (
    <DocumentsGalleryExample
      documents={sampleDocuments}
      onSearch={handleSearch}
      onDownload={(doc) => console.log('Download:', doc.name)}
      onShare={(doc) => console.log('Share:', doc.name)}
      onPrint={(doc) => console.log('Print:', doc.name)}
    />
  );
};
