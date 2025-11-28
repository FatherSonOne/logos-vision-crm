import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Filter, Clock, TrendingUp, User, Briefcase, File, Tag } from 'lucide-react';
import { useStore } from '../store/useStore';

interface SearchFacet {
  id: string;
  label: string;
  count: number;
  type: 'projects' | 'clients' | 'tasks' | 'cases' | 'documents' | 'contacts';
}

interface SearchResult {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  metadata?: Record<string, any>;
  matchScore?: number;
}

interface EnhancedSearchProps {
  onSearch: (query: string, filters: SearchFilters) => Promise<SearchResult[]>;
  placeholder?: string;
  showFacets?: boolean;
}

export interface SearchFilters {
  types?: string[];
  dateRange?: { from: Date; to: Date };
  tags?: string[];
  status?: string[];
}

export const EnhancedSearch: React.FC<EnhancedSearchProps> = ({
  onSearch,
  placeholder = 'Search everything...',
  showFacets = true,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [facets, setFacets] = useState<SearchFacet[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<SearchFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { addToSearchHistory, searchHistory, ui } = useStore();
  const isDark = ui.theme === 'dark' || (ui.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '/' && !isOpen) {
        event.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setFacets([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const searchResults = await onSearch(query, selectedFilters);
        setResults(searchResults);

        // Generate facets from results
        if (showFacets) {
          const facetMap = new Map<string, SearchFacet>();

          searchResults.forEach((result) => {
            if (!facetMap.has(result.type)) {
              facetMap.set(result.type, {
                id: result.type,
                label: result.type.charAt(0).toUpperCase() + result.type.slice(1),
                count: 0,
                type: result.type as any,
              });
            }
            const facet = facetMap.get(result.type)!;
            facet.count++;
          });

          setFacets(Array.from(facetMap.values()));
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, selectedFilters, onSearch, showFacets]);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.trim()) {
      addToSearchHistory(value.trim());
    }
  };

  const toggleTypeFilter = (type: string) => {
    setSelectedFilters((prev) => {
      const types = prev.types || [];
      const newTypes = types.includes(type)
        ? types.filter((t) => t !== type)
        : [...types, type];

      return { ...prev, types: newTypes.length > 0 ? newTypes : undefined };
    });
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'projects':
        return <Briefcase className="w-4 h-4" />;
      case 'clients':
        return <User className="w-4 h-4" />;
      case 'documents':
        return <File className="w-4 h-4" />;
      default:
        return <Tag className="w-4 h-4" />;
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full pl-12 pr-24 py-3 rounded-xl border-2 transition-all ${
            isOpen
              ? isDark
                ? 'border-blue-500 bg-gray-800 text-white'
                : 'border-blue-500 bg-white text-gray-900'
              : isDark
              ? 'border-gray-700 bg-gray-800 text-white hover:border-gray-600'
              : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
          } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
        />

        {/* Action Buttons */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
                setFacets([]);
              }}
              className={`p-1.5 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {showFacets && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1.5 rounded-lg transition-colors ${
                showFilters
                  ? 'bg-blue-500 text-white'
                  : isDark
                  ? 'hover:bg-gray-700 text-gray-400'
                  : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <Filter className="w-4 h-4" />
            </button>
          )}
          <kbd className={`px-2 py-1 text-xs font-semibold rounded ${
            isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
          }`}>
            /
          </kbd>
        </div>
      </div>

      {/* Results Dropdown */}
      <AnimatePresence>
        {isOpen && (query.length >= 2 || searchHistory.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute top-full mt-2 w-full rounded-xl shadow-2xl border overflow-hidden ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } max-h-[600px] overflow-y-auto z-50`}
          >
            {/* Filters Bar */}
            {showFilters && facets.length > 0 && (
              <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <p className={`text-xs font-semibold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Filter by type:
                </p>
                <div className="flex flex-wrap gap-2">
                  {facets.map((facet) => (
                    <button
                      key={facet.id}
                      onClick={() => toggleTypeFilter(facet.type)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        selectedFilters.types?.includes(facet.type)
                          ? 'bg-blue-500 text-white'
                          : isDark
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {getIconForType(facet.type)}
                      <span>{facet.label}</span>
                      <span className={`px-1.5 py-0.5 rounded text-xs ${
                        selectedFilters.types?.includes(facet.type)
                          ? 'bg-white/20'
                          : isDark
                          ? 'bg-gray-800'
                          : 'bg-gray-200'
                      }`}>
                        {facet.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="p-8 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Results */}
            {!isLoading && results.length > 0 && (
              <div className="p-2">
                <p className={`px-3 py-2 text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {results.length} result{results.length !== 1 ? 's' : ''}
                </p>
                {results.map((result, index) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
                      isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg flex-shrink-0 ${
                      isDark ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      {result.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {result.title}
                      </h4>
                      <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {result.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {result.type}
                        </span>
                        {result.matchScore && (
                          <span className="text-xs text-green-500">
                            {Math.round(result.matchScore * 100)}% match
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* No Results */}
            {!isLoading && query.length >= 2 && results.length === 0 && (
              <div className="p-8 text-center">
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  No results found for "{query}"
                </p>
              </div>
            )}

            {/* Search History */}
            {!query && searchHistory.length > 0 && (
              <div className="p-2">
                <p className={`px-3 py-2 text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Recent Searches
                </p>
                {searchHistory.slice(0, 5).map((historyItem, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(historyItem)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    }`}
                  >
                    <Clock className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {historyItem}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
