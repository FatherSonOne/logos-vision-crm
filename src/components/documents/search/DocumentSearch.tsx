/**
 * Document Search Component
 * Smart search interface with semantic capabilities and advanced filtering
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  X,
  Sparkles,
  Filter,
  Clock,
  Star,
  Users,
  Tag,
  Calendar,
  FileType,
  ChevronDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import type { DocumentSearchResult, DocumentFilters } from '../../../types/documents';

interface DocumentSearchProps {
  onSearch: (query: string, filters?: DocumentFilters) => void;
  searchResults?: DocumentSearchResult[];
  isSearching?: boolean;
  onResultClick?: (result: DocumentSearchResult) => void;
  placeholder?: string;
  useSemanticSearch?: boolean;
}

type QuickFilter = 'recent' | 'favorites' | 'shared' | 'pulse' | 'ai-processed';

export const DocumentSearch: React.FC<DocumentSearchProps> = ({
  onSearch,
  searchResults = [],
  isSearching = false,
  onResultClick,
  placeholder = 'Search documents with AI...',
  useSemanticSearch = true,
}) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<DocumentFilters>({});
  const [quickFilters, setQuickFilters] = useState<Set<QuickFilter>>(new Set());
  const [showResults, setShowResults] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout>();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  const debouncedSearch = useCallback(
    (searchQuery: string, filters: DocumentFilters) => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }

      searchTimeout.current = setTimeout(() => {
        onSearch(searchQuery, filters);
        setShowResults(true);
      }, 300);
    },
    [onSearch]
  );

  useEffect(() => {
    if (query.trim() || Object.keys(activeFilters).length > 0) {
      debouncedSearch(query, activeFilters);
    } else {
      setShowResults(false);
    }
  }, [query, activeFilters, debouncedSearch]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleQuickFilter = (filter: QuickFilter) => {
    const newFilters = new Set(quickFilters);
    if (newFilters.has(filter)) {
      newFilters.delete(filter);
    } else {
      newFilters.add(filter);
    }
    setQuickFilters(newFilters);

    // Update active filters based on quick filters
    const filters: DocumentFilters = { ...activeFilters };

    if (newFilters.has('recent')) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filters.created_after = sevenDaysAgo;
    } else {
      delete filters.created_after;
    }

    if (newFilters.has('pulse')) {
      filters.is_pulse_synced = true;
    } else {
      delete filters.is_pulse_synced;
    }

    if (newFilters.has('ai-processed')) {
      filters.has_ai_metadata = true;
    } else {
      delete filters.has_ai_metadata;
    }

    setActiveFilters(filters);
  };

  const clearSearch = () => {
    setQuery('');
    setActiveFilters({});
    setQuickFilters(new Set());
    setShowResults(false);
  };

  const getRelevanceColor = (score: number): string => {
    if (score >= 0.9) return 'text-emerald-500';
    if (score >= 0.7) return 'text-blue-500';
    if (score >= 0.5) return 'text-amber-500';
    return 'text-orange-500';
  };

  const getRelevanceLabel = (score: number): string => {
    if (score >= 0.9) return 'Excellent Match';
    if (score >= 0.7) return 'Good Match';
    if (score >= 0.5) return 'Relevant';
    return 'Related';
  };

  return (
    <div ref={searchContainerRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <div
          className={`flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800
                     border-2 rounded-lg transition-all ${
                       showResults
                         ? 'border-cyan-500 dark:border-cyan-500 shadow-lg shadow-cyan-500/20'
                         : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                     }`}
        >
          {/* Search Icon with AI Indicator */}
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400" />
            {useSemanticSearch && (
              <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-cyan-500 animate-pulse" />
            )}
          </div>

          {/* Input Field */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query && setShowResults(true)}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400
                     focus:outline-none"
          />

          {/* Loading Indicator */}
          {isSearching && (
            <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
              <div className="w-4 h-4 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Searching...</span>
            </div>
          )}

          {/* Clear Button */}
          {query && (
            <button
              onClick={clearSearch}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors ${
              showFilters || Object.keys(activeFilters).length > 0
                ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400'
                : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400'
            }`}
            title="Filters"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* AI Search Indicator */}
      </div>

      {/* AI Badge and Quick Filters Row */}
      <div className="flex flex-wrap items-center gap-2 mt-3">
        {useSemanticSearch && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5
                         bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-medium
                         rounded-full shadow-md">
            <Sparkles className="w-3 h-3" />
            <span>AI-Powered Semantic Search Active</span>
          </div>
        )}
        <button
          onClick={() => toggleQuickFilter('recent')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                     transition-all ${
                       quickFilters.has('recent')
                         ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                         : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                     }`}
        >
          <Clock className="w-4 h-4" />
          <span>Recent</span>
        </button>

        <button
          onClick={() => toggleQuickFilter('favorites')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                     transition-all ${
                       quickFilters.has('favorites')
                         ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                         : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                     }`}
        >
          <Star className="w-4 h-4" />
          <span>Favorites</span>
        </button>

        <button
          onClick={() => toggleQuickFilter('shared')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                     transition-all ${
                       quickFilters.has('shared')
                         ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                         : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                     }`}
        >
          <Users className="w-4 h-4" />
          <span>Shared with me</span>
        </button>

        <button
          onClick={() => toggleQuickFilter('pulse')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                     transition-all ${
                       quickFilters.has('pulse')
                         ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-md'
                         : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                     }`}
        >
          <Zap className="w-4 h-4" />
          <span>From Pulse</span>
        </button>

        <button
          onClick={() => toggleQuickFilter('ai-processed')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                     transition-all ${
                       quickFilters.has('ai-processed')
                         ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md'
                         : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                     }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Enhanced</span>
        </button>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="mt-3 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                        rounded-lg shadow-lg space-y-4 animate-in slide-in-from-top duration-200">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white">Advanced Filters</h3>
            <button
              onClick={() => {
                setActiveFilters({});
                setQuickFilters(new Set());
              }}
              className="text-sm text-rose-600 dark:text-rose-400 hover:underline"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Category
              </label>
              <select
                value={activeFilters.category || ''}
                onChange={(e) =>
                  setActiveFilters({ ...activeFilters, category: e.target.value || undefined })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700
                         rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="contract">Contract</option>
                <option value="invoice">Invoice</option>
                <option value="proposal">Proposal</option>
                <option value="report">Report</option>
                <option value="presentation">Presentation</option>
              </select>
            </div>

            {/* File Type Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                File Type
              </label>
              <select
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700
                         rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="pdf">PDF</option>
                <option value="image">Images</option>
                <option value="document">Documents</option>
                <option value="spreadsheet">Spreadsheets</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Date From
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700
                         rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Date To
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700
                         rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {showResults && (query || Object.keys(activeFilters).length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800
                        border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl
                        max-h-96 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Results Header */}
          <div className="sticky top-0 px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {isSearching ? (
                  'Searching...'
                ) : (
                  <>
                    Found <span className="font-medium text-slate-900 dark:text-white">{searchResults.length}</span>{' '}
                    {searchResults.length === 1 ? 'result' : 'results'}
                  </>
                )}
              </p>
              {useSemanticSearch && (
                <div className="flex items-center gap-1 text-xs text-cyan-600 dark:text-cyan-400">
                  <Sparkles className="w-3 h-3" />
                  <span>AI Search</span>
                </div>
              )}
            </div>
          </div>

          {/* Results List */}
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {searchResults.length === 0 && !isSearching ? (
              <div className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No documents found</p>
                <p className="text-xs mt-1">Try adjusting your search terms or filters</p>
              </div>
            ) : (
              searchResults.map((result) => (
                <button
                  key={result.document.id}
                  onClick={() => onResultClick?.(result)}
                  className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-900/50
                           transition-colors group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Document Name */}
                      <h4 className="font-medium text-slate-900 dark:text-white mb-1 line-clamp-1
                                   group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                        {result.document.name}
                      </h4>

                      {/* Matched Sections */}
                      {result.matched_sections && result.matched_sections.length > 0 && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                          {result.matched_sections[0]}
                        </p>
                      )}

                      {/* Metadata */}
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        {result.document.category && (
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded capitalize">
                            {result.document.category}
                          </span>
                        )}
                        {result.matched_fields.length > 0 && (
                          <span>
                            Matched in: {result.matched_fields.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Relevance Score */}
                    <div className="flex-shrink-0 text-right">
                      <div className={`flex items-center gap-1 text-sm font-medium ${getRelevanceColor(result.relevance_score)}`}>
                        <TrendingUp className="w-4 h-4" />
                        <span>{Math.round(result.relevance_score * 100)}%</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {getRelevanceLabel(result.relevance_score)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
