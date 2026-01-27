/**
 * Documents Hub - Main Container Component
 * Phase 1: Foundation container following ReportsHub pattern
 *
 * This component acts as the main entry point for the enterprise document library,
 * providing routing, state management, and feature flag integration.
 */

import React, { useState, useEffect } from 'react';
import { DocumentLibrary } from '../DocumentLibrary';
import { PulseBrowser } from './pulse/PulseBrowser';
import { DocumentCard } from './cards/DocumentCard';
import { DocumentSearch } from './search/DocumentSearch';
import { DocumentViewer } from './viewer/DocumentViewer';
import { CommentThread, ActivityFeed as CollaborationActivityFeed, CollaborationErrorBoundary } from '../collaboration';
import { Grid, List } from 'lucide-react';
import type { Document, Client, Project, TeamMember } from '../../types';
import type { EnhancedDocument, DocumentSearchResult, DocumentFilters, DocumentViewMode } from '../../types/documents';
import { getDocuments, getDocumentWithAI } from '../../services/documents/documentLibraryService';

interface DocumentsHubProps {
  documents: Document[];
  clients: Client[];
  projects: Project[];
  teamMembers: TeamMember[];
  currentUser?: TeamMember;
}

// Feature flags for gradual rollout
const FEATURE_FLAGS = {
  useEnhancedLibrary: true,  // ✅ ENABLE by default
  aiFeatures: true,          // ✅ Keep enabled
  pulseSync: false,          // Keep disabled (needs backend API)
  versionControl: false,     // Phase 5
  analytics: false,          // Phase 6
};

export default function DocumentsHub({
  documents,
  clients,
  projects,
  teamMembers,
  currentUser,
}: DocumentsHubProps) {
  const [currentView, setCurrentView] = useState<'library' | 'analytics'>('library');
  const [featureFlags, setFeatureFlags] = useState(FEATURE_FLAGS);
  const [showPulseBrowser, setShowPulseBrowser] = useState(false);

  // Enhanced library state
  const [selectedDocument, setSelectedDocument] = useState<EnhancedDocument | null>(null);
  const [viewMode, setViewMode] = useState<DocumentViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DocumentSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState<DocumentFilters>({});
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [enhancedDocuments, setEnhancedDocuments] = useState<EnhancedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load feature flags from localStorage or config
    const savedFlags = localStorage.getItem('document_feature_flags');
    if (savedFlags) {
      try {
        const parsed = JSON.parse(savedFlags);
        setFeatureFlags({ ...FEATURE_FLAGS, ...parsed });
      } catch (error) {
        console.error('Error loading feature flags:', error);
      }
    }

    // Listen for feature flag updates (for admin controls)
    const handleFeatureFlagUpdate = (event: CustomEvent) => {
      setFeatureFlags(prev => ({ ...prev, ...event.detail }));
      localStorage.setItem('document_feature_flags', JSON.stringify({
        ...featureFlags,
        ...event.detail,
      }));
    };

    window.addEventListener('update-document-features' as any, handleFeatureFlagUpdate);

    return () => {
      window.removeEventListener('update-document-features' as any, handleFeatureFlagUpdate);
    };
  }, []);

  useEffect(() => {
    async function loadDocuments() {
      setIsLoading(true);
      try {
        // Get complete documents from service
        const docs = await getDocuments({
          includeAI: featureFlags.aiFeatures,
          includePulse: featureFlags.pulseSync,
        });
        setEnhancedDocuments(docs);
      } catch (error) {
        console.error('Error loading documents:', error);
        // Fallback to basic conversion if service fails
        const fallback = documents.map(doc => ({
          ...doc,
          file_url: doc.file_url || '',
          created_at: doc.created_at || (doc as any).uploaded_at || (doc as any).lastModified || new Date().toISOString(),
          updated_at: doc.updated_at || (doc as any).lastModified || new Date().toISOString(),
          file_type: doc.file_type || (doc as any).fileType || 'other',
          file_size: doc.file_size || 0,
          storage_provider: 'supabase',
          version_number: 1,
          ai_processed: false,
          ocr_processed: false,
          pulse_synced: false,
          preview_available: true,
          visibility: 'team',
          sensitivity_level: 'normal',
        })) as EnhancedDocument[];
        setEnhancedDocuments(fallback);
      } finally {
        setIsLoading(false);
      }
    }

    if (featureFlags.useEnhancedLibrary) {
      loadDocuments();
    } else {
      setIsLoading(false);
    }
  }, [documents, featureFlags.useEnhancedLibrary, featureFlags.aiFeatures, featureFlags.pulseSync]);

  // Search handler for DocumentSearch component
  const handleSearch = (query: string, searchFilters?: DocumentFilters) => {
    setSearchQuery(query);
    setFilters(searchFilters || {});
    setIsSearching(true);

    // Simulate search with basic filtering
    setTimeout(() => {
      if (!query && (!searchFilters || Object.keys(searchFilters).length === 0)) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      const filtered = enhancedDocuments.filter((doc) => {
        const matchesQuery = !query ||
          doc.name.toLowerCase().includes(query.toLowerCase()) ||
          doc.category?.toLowerCase().includes(query.toLowerCase());

        const matchesFilters = !searchFilters || (
          (!searchFilters.category || doc.category === searchFilters.category) &&
          (!searchFilters.project_id || doc.project_id === searchFilters.project_id) &&
          (!searchFilters.client_id || doc.client_id === searchFilters.client_id)
        );

        return matchesQuery && matchesFilters;
      });

      const results: DocumentSearchResult[] = filtered.map((doc) => ({
        document: doc,
        relevance_score: 0.85,
        matched_fields: ['name', 'category'],
        matched_sections: [doc.name],
      }));

      setSearchResults(results);
      setIsSearching(false);
    }, 300);
  };

  // Handle search result click
  const handleSearchResultClick = async (result: DocumentSearchResult) => {
    // Load full document with AI metadata if not already loaded
    if (featureFlags.aiFeatures && !result.document.ai_metadata) {
      try {
        const fullDoc = await getDocumentWithAI(result.document.id);
        setSelectedDocument(fullDoc);
      } catch (error) {
        console.error('Error loading AI metadata:', error);
        setSelectedDocument(result.document);
      }
    } else {
      setSelectedDocument(result.document);
    }
  };

  // Handle favorite toggle
  const handleFavoriteToggle = (doc: EnhancedDocument) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(doc.id)) {
      newFavorites.delete(doc.id);
    } else {
      newFavorites.add(doc.id);
    }
    setFavorites(newFavorites);
  };

  // Handle document download
  const handleDownload = (doc: EnhancedDocument) => {
    if (doc.file_url) {
      window.open(doc.file_url, '_blank');
    }
  };

  // Get filtered documents based on current search/filters
  const displayDocuments = featureFlags.useEnhancedLibrary
    ? (searchQuery || Object.keys(filters).length > 0
        ? searchResults.map(r => r.document)
        : enhancedDocuments)
    : documents;

  // Phase 1: Use existing DocumentLibrary component
  // Future phases will add conditional rendering based on feature flags
  if (!featureFlags.useEnhancedLibrary) {
    return (
      <DocumentLibrary
        documents={documents}
        clients={clients}
        projects={projects}
        teamMembers={teamMembers}
      />
    );
  }

  // Enhanced library view (future phases)
  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Header - Future implementation */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <svg
                className="w-7 h-7 text-rose-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
              FileHub
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Enterprise document management with AI-powered features
            </p>
          </div>

          {/* View toggle and action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentView('library')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentView === 'library'
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              Library
            </button>
            {featureFlags.analytics && (
              <button
                type="button"
                onClick={() => setCurrentView('analytics')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'analytics'
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Analytics
              </button>
            )}

            {featureFlags.pulseSync && (
              <button
                type="button"
                onClick={() => setShowPulseBrowser(true)}
                className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors flex items-center gap-2"
                title="Browse and import from Pulse"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                Import from Pulse
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                // Temporarily switch to old DocumentLibrary for upload
                // The old component has the upload functionality
                const event = new CustomEvent('update-document-features', {
                  detail: { useEnhancedLibrary: false }
                });
                window.dispatchEvent(event);
              }}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
              title="Upload Document"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Upload Document
            </button>
          </div>
        </div>

        {/* Feature flags indicator (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-2">
              Active Features (Development):
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(featureFlags).map(([key, enabled]) => (
                <span
                  key={key}
                  className={`px-2 py-1 text-xs rounded ${
                    enabled
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                  }`}
                >
                  {key}: {enabled ? 'ON' : 'OFF'}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {currentView === 'library' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search Bar */}
            <div className="px-6 py-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <DocumentSearch
                onSearch={handleSearch}
                searchResults={searchResults}
                isSearching={isSearching}
                onResultClick={handleSearchResultClick}
                placeholder="Search documents with AI..."
                useSemanticSearch={featureFlags.aiFeatures}
              />
            </div>

            {/* View Mode Toggle and Stats */}
            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Showing <span className="font-semibold text-slate-900 dark:text-white">{displayDocuments.length}</span> of{' '}
                    <span className="font-semibold text-slate-900 dark:text-white">{enhancedDocuments.length}</span> documents
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-rose-500 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                    title="Grid view"
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list'
                        ? 'bg-rose-500 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                    title="List view"
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Documents Grid/List */}
            <div className="flex-1 overflow-auto p-6">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">Loading documents...</p>
                  </div>
                </div>
              ) : displayDocuments.length > 0 ? (
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                      : 'space-y-4'
                  }
                >
                  {displayDocuments.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      document={doc}
                      onView={setSelectedDocument}
                      onDownload={handleDownload}
                      onFavorite={handleFavoriteToggle}
                      isFavorite={favorites.has(doc.id)}
                      showPreview={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center max-w-md">
                    <svg
                      className="w-24 h-24 text-slate-300 dark:text-slate-600 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      {searchQuery || Object.keys(filters).length > 0
                        ? 'No documents found'
                        : 'No documents yet'}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                      {searchQuery || Object.keys(filters).length > 0
                        ? 'Try adjusting your search terms or filters'
                        : 'Upload your first document to get started'}
                    </p>
                    {!searchQuery && Object.keys(filters).length === 0 && (
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            const event = new CustomEvent('update-document-features', {
                              detail: { useEnhancedLibrary: false }
                            });
                            window.dispatchEvent(event);
                          }}
                          className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg
                                   hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg
                                   hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 justify-center"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          Upload Document
                        </button>
                        {featureFlags.pulseSync && (
                          <button
                            type="button"
                            onClick={() => setShowPulseBrowser(true)}
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg
                                     hover:from-purple-600 hover:to-cyan-600 transition-all shadow-lg
                                     hover:shadow-xl hover:-translate-y-0.5"
                          >
                            Import from Pulse
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'analytics' && featureFlags.analytics && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <svg
                className="w-16 h-16 text-slate-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Analytics Dashboard
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Coming in Phase 6: Document usage analytics and insights
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Pulse Browser Modal */}
      {showPulseBrowser && featureFlags.pulseSync && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
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

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="w-full max-w-7xl h-[90vh] bg-white dark:bg-slate-800 rounded-lg shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white truncate">
                {selectedDocument.name}
              </h2>
              <button
                type="button"
                onClick={() => setSelectedDocument(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title="Close document viewer"
                aria-label="Close document viewer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content: Document Viewer + Collaboration Sidebar */}
            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
              {/* Main document view - 2 columns */}
              <div className="lg:col-span-2 overflow-auto">
                <DocumentViewer
                  document={selectedDocument}
                  isOpen={true}
                  onClose={() => setSelectedDocument(null)}
                  onDownload={handleDownload}
                  onShare={(doc) => {
                    // TODO: Implement share functionality
                    console.log('Share document:', doc.name);
                  }}
                  onPrint={(doc) => {
                    if (doc.file_url) {
                      window.open(doc.file_url, '_blank');
                    }
                  }}
                />
              </div>

              {/* Collaboration sidebar - 1 column */}
              {currentUser && teamMembers && (
                <div className="lg:col-span-1 space-y-4 overflow-auto">
                  <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                    {!currentUser ? (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          Please log in to view document activity.
                        </p>
                      </div>
                    ) : (
                      <CollaborationErrorBoundary>
                        <CollaborationActivityFeed
                          entityType="document"
                          entityId={selectedDocument.id}
                          currentUser={currentUser}
                          title="Document Activity"
                          compact={true}
                          limit={10}
                        />
                      </CollaborationErrorBoundary>
                    )}
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                    {!currentUser ? (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          Please log in to comment on this document.
                        </p>
                      </div>
                    ) : !teamMembers || teamMembers.length === 0 ? (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Loading team members...
                        </p>
                      </div>
                    ) : (
                      <CollaborationErrorBoundary>
                        <CommentThread
                          entityType="document"
                          entityId={selectedDocument.id}
                          currentUser={currentUser}
                          teamMembers={teamMembers}
                          title="Comments"
                          placeholder="Comment on this document..."
                        />
                      </CollaborationErrorBoundary>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Utility function to enable/disable features (for admin/testing)
 * Usage: updateDocumentFeatures({ aiFeatures: true })
 */
export function updateDocumentFeatures(updates: Partial<typeof FEATURE_FLAGS>) {
  const event = new CustomEvent('update-document-features', { detail: updates });
  window.dispatchEvent(event);
}
