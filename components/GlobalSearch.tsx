import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { SearchIcon, CloseIcon, ClockIcon, ArrowRightIcon } from './icons';

// Debounce hook for search input
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Global Search Component
 * 
 * Features:
 * - Search across all entity types (clients, projects, volunteers, etc.)
 * - Keyboard shortcut (Ctrl+K or /) to open
 * - Autocomplete suggestions as you type
 * - Recent searches
 * - Keyboard navigation (arrow keys, Enter)
 * - Jump directly to results
 * - Beautiful, fast, and accessible
 */

export interface SearchResult {
  id: string;
  type: 'organization' | 'project' | 'volunteer' | 'team-member' | 'case' | 'donation' | 'document' | 'activity';
  title: string;
  subtitle?: string;
  metadata?: string;
  icon?: string;
  data?: any; // Original data object
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (type: string, id: string, data?: any) => void;
  // Data sources
  organizations?: any[];
  projects?: any[];
  volunteers?: any[];
  teamMembers?: any[];
  cases?: any[];
  donations?: any[];
  documents?: any[];
  activities?: any[];
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  isOpen,
  onClose,
  onNavigate,
  organizations = [],
  projects = [],
  volunteers = [],
  teamMembers = [],
  cases = [],
  donations = [],
  documents = [],
  activities = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Debounce search query to prevent excessive filtering on every keystroke
  const debouncedSearchQuery = useDebounce(searchQuery, 150);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load recent searches:', e);
      }
    }
  }, []);

  // Save recent search
  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;
    
    const updated = [
      query,
      ...recentSearches.filter(s => s !== query)
    ].slice(0, 5); // Keep only 5 most recent
    
    setRecentSearches(updated);
    localStorage.setItem('recent-searches', JSON.stringify(updated));
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recent-searches');
  };

  // Icon mapping for result types
  const typeIcons: Record<SearchResult['type'], string> = {
    'organization': '🏢',
    'project': '📁',
    'volunteer': '🤝',
    'team-member': '👤',
    'case': '📋',
    'donation': '💰',
    'document': '📄',
    'activity': '📊'
  };

  // Memoized search results - only recalculates when debounced query or data changes
  const searchResults = useMemo((): SearchResult[] => {
    if (!debouncedSearchQuery.trim()) return [];

    const query = debouncedSearchQuery.toLowerCase();

    // Search function with fuzzy matching
    const searchInData = (data: any[], type: SearchResult['type'], fields: string[]): SearchResult[] => {
      return data
        .filter(item => {
          return fields.some(field => {
            const value = item[field];
            if (typeof value === 'string') {
              return value.toLowerCase().includes(query);
            }
            return false;
          });
        })
        .map(item => {
          // Create result object
          const result: SearchResult = {
            id: item.id || String(Math.random()),
            type,
            title: item.name || item.title || item.subject || 'Untitled',
            icon: typeIcons[type],
            data: item
          };

          // Add type-specific metadata
          switch (type) {
            case 'organization':
              result.subtitle = item.type || 'Organization';
              result.metadata = item.location;
              break;
            case 'project':
              result.subtitle = item.clientName || 'Project';
              result.metadata = item.status;
              break;
            case 'volunteer':
              result.subtitle = item.email;
              result.metadata = `${item.hoursLogged || 0} hours`;
              break;
            case 'team-member':
              result.subtitle = item.role;
              result.metadata = item.email;
              break;
            case 'case':
              result.subtitle = item.clientName;
              result.metadata = item.status;
              break;
            case 'donation':
              result.subtitle = item.donorName;
              result.metadata = `$${item.amount || 0}`;
              break;
            case 'document':
              result.subtitle = item.category;
              result.metadata = item.uploadDate;
              break;
            case 'activity':
              result.subtitle = item.type;
              result.metadata = item.date;
              break;
          }

          return result;
        });
    };

    // Perform search across all data sources
    return [
      ...searchInData(organizations, 'organization', ['name', 'type', 'location', 'description']),
      ...searchInData(projects, 'project', ['name', 'description', 'clientName', 'status']),
      ...searchInData(volunteers, 'volunteer', ['name', 'email', 'skills', 'interests']),
      ...searchInData(teamMembers, 'team-member', ['name', 'email', 'role', 'department']),
      ...searchInData(cases, 'case', ['subject', 'description', 'clientName', 'status']),
      ...searchInData(donations, 'donation', ['donorName', 'campaign', 'method']),
      ...searchInData(documents, 'document', ['name', 'category', 'tags']),
      ...searchInData(activities, 'activity', ['title', 'description', 'type'])
    ].slice(0, 20); // Limit to 20 results
  }, [debouncedSearchQuery, organizations, projects, volunteers, teamMembers, cases, donations, documents, activities]);

  // Group results by type - also memoized
  const groupedResults = useMemo(() => searchResults.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>), [searchResults]);

  // Type labels for display
  const typeLabels: Record<SearchResult['type'], string> = {
    'organization': 'Organizations',
    'project': 'Projects',
    'volunteer': 'Volunteers',
    'team-member': 'Team Members',
    'case': 'Cases',
    'donation': 'Donations',
    'document': 'Documents',
    'activity': 'Activities'
  };

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setSearchQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const totalResults = searchResults.length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % totalResults);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + totalResults) % totalResults);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        handleSelectResult(searchResults[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [searchResults, selectedIndex, onClose]);

  // Handle result selection
  const handleSelectResult = (result: SearchResult) => {
    saveRecentSearch(searchQuery);
    onNavigate(result.type, result.id, result.data);
    onClose();
  };

  // Handle recent search click
  const handleRecentSearchClick = (query: string) => {
    setSearchQuery(query);
    setSelectedIndex(0);
  };

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current && searchResults.length > 0) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex, searchResults.length]);

  if (!isOpen) return null;

  const showRecentSearches = !searchQuery.trim() && recentSearches.length > 0;
  const showNoResults = debouncedSearchQuery.trim() && searchResults.length === 0;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-3xl mx-4 bg-white dark:bg-slate-800 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-700">
          <SearchIcon />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search organizations, projects, volunteers, and more..."
            className="flex-1 bg-transparent border-none outline-none text-lg text-slate-900 dark:text-white placeholder-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
              aria-label="Clear search"
            >
              <CloseIcon />
            </button>
          )}
        </div>

        {/* Results or Recent Searches */}
        <div 
          ref={resultsRef}
          className="max-h-[60vh] overflow-y-auto"
        >
          {/* Recent Searches */}
          {showRecentSearches && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Recent Searches
                </h3>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-1">
                {recentSearches.map((query, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleRecentSearchClick(query)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                  >
                    <ClockIcon />
                    <span className="text-slate-700 dark:text-slate-300">{query}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {showNoResults && (
            <div className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
              <div className="text-4xl mb-2">🔍</div>
              <p className="font-medium">No results found</p>
              <p className="text-sm mt-1">Try searching for something else</p>
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="py-2">
              {Object.entries(groupedResults).map(([type, results]: [string, SearchResult[]]) => (
                <div key={type} className="mb-4">
                  <div className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    {typeLabels[type as SearchResult['type']]} ({results.length})
                  </div>
                  {results.map((result) => {
                    const globalIndex = searchResults.indexOf(result);
                    const isSelected = globalIndex === selectedIndex;
                    
                    return (
                      <button
                        key={result.id}
                        onClick={() => handleSelectResult(result)}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        className={`
                          w-full flex items-center gap-3 px-4 py-3 transition-colors
                          ${isSelected 
                            ? 'bg-cyan-50 dark:bg-cyan-900/30 border-l-4 border-cyan-500' 
                            : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 border-l-4 border-transparent'
                          }
                        `}
                      >
                        <span className="text-2xl flex-shrink-0">{result.icon}</span>
                        <div className="flex-1 text-left min-w-0">
                          <div className="font-medium text-slate-900 dark:text-white truncate">
                            {result.title}
                          </div>
                          {result.subtitle && (
                            <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
                              {result.subtitle}
                            </div>
                          )}
                        </div>
                        {result.metadata && (
                          <div className="text-sm text-slate-500 dark:text-slate-400 flex-shrink-0">
                            {result.metadata}
                          </div>
                        )}
                        <ArrowRightIcon className="flex-shrink-0 opacity-0 group-hover:opacity-100" />
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with keyboard hints */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded">Enter</kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded">Esc</kbd>
              Close
            </span>
          </div>
          {searchResults.length > 0 && (
            <span>{searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Hook to handle global search keyboard shortcut
 */
export const useGlobalSearchShortcut = (onOpen: () => void) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onOpen();
      }
      // Forward slash (/) - but not when in an input
      else if (e.key === '/' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        onOpen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpen]);
};
