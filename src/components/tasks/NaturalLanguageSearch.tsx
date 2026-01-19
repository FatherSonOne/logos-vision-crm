// Natural Language Search Component
// AI-powered search that interprets natural language queries

import React, { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, X, Loader2, Filter } from 'lucide-react';
import { ExtendedTask } from '../../services/taskManagementService';
import { naturalLanguageTaskSearch, NaturalLanguageSearchResult } from '../../services/taskAiService';

export interface NaturalLanguageSearchProps {
  allTasks: ExtendedTask[];
  onSearch: (results: ExtendedTask[], interpretation: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
}

const NaturalLanguageSearch: React.FC<NaturalLanguageSearchProps> = ({
  allTasks,
  onSearch,
  onClear,
  placeholder = 'Ask anything... (e.g., "show overdue tasks for John")',
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [suggestedFilters, setSuggestedFilters] = useState<any>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Example queries for suggestions
  const exampleQueries = [
    "show me critical tasks",
    "what's overdue?",
    "John's tasks this week",
    "high priority items",
    "tasks due today",
    "completed this month",
  ];

  // Handle search execution
  const handleSearch = async () => {
    if (!query.trim() || isSearching) return;

    setIsSearching(true);
    setInterpretation(null);
    setSuggestedFilters(null);

    try {
      const result: NaturalLanguageSearchResult = await naturalLanguageTaskSearch(query, allTasks);

      setInterpretation(result.interpretation);
      setSuggestedFilters(result.suggestedFilters);
      onSearch(result.matchedTasks, result.interpretation);
    } catch (error) {
      console.error('Natural language search error:', error);
      setInterpretation('Sorry, I couldn\'t understand that query. Try rephrasing.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      handleClear();
    }
  };

  // Handle clear
  const handleClear = () => {
    setQuery('');
    setInterpretation(null);
    setSuggestedFilters(null);
    onClear?.();
    inputRef.current?.focus();
  };

  // Handle example query click
  const handleExampleClick = (example: string) => {
    setQuery(example);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <Search className="w-4 h-4 text-gray-400" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          className="w-full pl-20 pr-24 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-sm"
          disabled={isSearching}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {query && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}

          <button
            onClick={handleSearch}
            disabled={!query.trim() || isSearching}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching...
              </>
            ) : (
              'Search'
            )}
          </button>
        </div>
      </div>

      {/* Example Queries Dropdown */}
      {showSuggestions && !interpretation && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-2">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 py-1 mb-1">
            Try asking:
          </div>
          <div className="space-y-1">
            {exampleQueries.map((example, idx) => (
              <button
                key={idx}
                onClick={() => handleExampleClick(example)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-md transition-colors"
              >
                <Search className="w-3 h-3 inline mr-2 text-gray-400" />
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AI Interpretation Display */}
      {interpretation && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                  AI Interpretation
                </span>
              </div>
              <p className="text-sm text-gray-700">{interpretation}</p>

              {/* Suggested Filters */}
              {suggestedFilters && Object.keys(suggestedFilters).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {Object.entries(suggestedFilters).map(([key, value]) => {
                    if (!value) return null;
                    const displayValue = typeof value === 'object'
                      ? `${(value as any).start} - ${(value as any).end}`
                      : value;
                    return (
                      <div
                        key={key}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-blue-200 rounded text-xs"
                      >
                        <Filter className="w-3 h-3 text-blue-600" />
                        <span className="font-medium text-gray-700">{key}:</span>
                        <span className="text-gray-600">{displayValue as string}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              onClick={handleClear}
              className="p-1 hover:bg-blue-100 rounded transition-colors"
              aria-label="Close interpretation"
            >
              <X className="w-4 h-4 text-blue-600" />
            </button>
          </div>
        </div>
      )}

      {/* Help Text */}
      {!query && !interpretation && (
        <div className="mt-2 text-xs text-gray-500">
          Use natural language to search tasks. Try: "show overdue", "critical tasks", or "John's assignments"
        </div>
      )}
    </div>
  );
};

export default NaturalLanguageSearch;
