import React, { useState, useEffect } from 'react';
import { SearchIcon } from './icons';

/**
 * CMF Nothing Design System - GlobalSearch Component
 * ===================================================
 * Search input using CMF design tokens.
 * Clean, matte aesthetic without glassmorphism.
 */

interface GlobalSearchProps {
  onSearch: (query: string, includeWeb: boolean) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Read web search setting from localStorage (set in Settings)
  const [webSearchEnabled, setWebSearchEnabled] = useState(() => {
    const saved = localStorage.getItem('webSearchEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Listen for changes to localStorage (in case Settings is updated)
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('webSearchEnabled');
      setWebSearchEnabled(saved !== null ? JSON.parse(saved) : true);
    };

    // Listen for storage events from other tabs/windows
    window.addEventListener('storage', handleStorageChange);

    // Also check periodically for same-tab changes
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), webSearchEnabled);
    }
  };

  return (
    <form id="global-search" onSubmit={handleSubmit} className="w-full max-w-sm">
      <div className="relative">
        <input
          id="global-search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={webSearchEnabled ? "Search CRM or find new leads..." : "Search CRM..."}
          aria-label="Global search"
          className="w-full pl-10 pr-4 py-2 rounded-lg text-sm transition-all duration-150"
          style={{
            backgroundColor: 'var(--cmf-surface)',
            color: 'var(--cmf-text)',
            border: `1px solid ${isFocused ? 'var(--cmf-accent)' : 'var(--cmf-border-strong)'}`,
            boxShadow: isFocused ? '0 0 0 3px var(--cmf-accent-muted)' : 'var(--cmf-shadow-sm)',
            outline: 'none',
          }}
        />
        <div
          className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
          style={{ color: 'var(--cmf-text-faint)' }}
        >
          <SearchIcon />
        </div>
      </div>
      {webSearchEnabled && (
        <p
          className="mt-1 text-center text-xs"
          style={{ color: 'var(--cmf-text-muted)' }}
        >
          Web search enabled
        </p>
      )}
    </form>
  );
};
