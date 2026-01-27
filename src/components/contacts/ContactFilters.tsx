import React, { useState, useEffect, useRef } from 'react';

interface FilterState {
  relationshipScore: string;
  trend: string;
  donorStage: string;
  tags: string[];
}

interface ContactFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export function ContactFilters({ filters, onChange }: ContactFiltersProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const activeFiltersCount = [
    filters.relationshipScore !== 'all',
    filters.trend !== 'all',
    filters.donorStage !== 'all',
    filters.tags.length > 0
  ].filter(Boolean).length;

  // Handle Escape key to close dropdown
  useEffect(() => {
    if (!showDropdown) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDropdown(false);
        // Return focus to trigger button
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showDropdown]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setShowDropdown(!showDropdown)}
        className="btn btn-secondary flex items-center gap-2"
        aria-label="Filter contacts"
        aria-expanded={showDropdown ? 'true' : 'false'}
        aria-haspopup="true"
        aria-controls="filters-dropdown"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filters
        {activeFiltersCount > 0 && (
          <span className="badge badge-primary ml-1" aria-label={`${activeFiltersCount} active filters`}>
            {activeFiltersCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div
          id="filters-dropdown"
          role="dialog"
          aria-label="Filter contacts"
          className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl z-10 p-4"
        >
          {/* Relationship Score Filter */}
          <div className="mb-4">
            <label htmlFor="relationship-score-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Relationship Score
            </label>
            <select
              id="relationship-score-filter"
              value={filters.relationshipScore}
              onChange={(e) => onChange({ ...filters, relationshipScore: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Scores</option>
              <option value="76-100">Strong (76-100)</option>
              <option value="51-75">Good (51-75)</option>
              <option value="26-50">Moderate (26-50)</option>
              <option value="0-25">At Risk (0-25)</option>
            </select>
          </div>

          {/* Trend Filter */}
          <div className="mb-4">
            <label htmlFor="trend-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Relationship Trend
            </label>
            <select
              id="trend-filter"
              value={filters.trend}
              onChange={(e) => onChange({ ...filters, trend: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Trends</option>
              <option value="rising">Rising</option>
              <option value="stable">Stable</option>
              <option value="falling">Falling</option>
              <option value="new">New</option>
              <option value="dormant">Dormant</option>
            </select>
          </div>

          {/* Donor Stage Filter */}
          <div className="mb-4">
            <label htmlFor="donor-stage-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Donor Stage
            </label>
            <select
              id="donor-stage-filter"
              value={filters.donorStage}
              onChange={(e) => onChange({ ...filters, donorStage: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Stages</option>
              <option value="Major Donor">Major Donor</option>
              <option value="Repeat Donor">Repeat Donor</option>
              <option value="First-time Donor">First-time Donor</option>
              <option value="Prospect">Prospect</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                onChange({
                  relationshipScore: 'all',
                  trend: 'all',
                  donorStage: 'all',
                  tags: []
                });
                setShowDropdown(false);
              }}
              className="btn btn-secondary flex-1"
            >
              Clear All
            </button>
            <button
              type="button"
              onClick={() => setShowDropdown(false)}
              className="btn btn-primary flex-1"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
