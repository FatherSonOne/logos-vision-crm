import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Client, Donation, Task, Page } from '../types';
import { SearchIcon, UsersIcon, DonationIcon, CheckSquareIcon, FolderIcon, CalendarIcon, HandHeartIcon, BuildingIcon, HomeUsersIcon, XMarkIcon } from './icons';

// Search result types
interface SearchResult {
    id: string;
    type: 'client' | 'donation' | 'task' | 'project' | 'event' | 'volunteer' | 'household' | 'organization';
    title: string;
    subtitle: string;
    metadata?: string;
    pageId: Page;
}

interface UnifiedSearchProps {
    clients: Client[];
    donations?: Donation[];
    tasks?: Task[];
    onNavigate: (page: Page, entityId?: string) => void;
    onAiSearch?: (query: string, includeWeb: boolean) => void;
}

const getIconForType = (type: SearchResult['type']) => {
    switch (type) {
        case 'client':
            return <UsersIcon />;
        case 'donation':
            return <DonationIcon />;
        case 'task':
            return <CheckSquareIcon />;
        case 'project':
            return <FolderIcon />;
        case 'event':
            return <CalendarIcon />;
        case 'volunteer':
            return <HandHeartIcon />;
        case 'household':
            return <HomeUsersIcon />;
        case 'organization':
            return <BuildingIcon />;
        default:
            return <SearchIcon />;
    }
};

const getTypeLabel = (type: SearchResult['type']) => {
    const labels: Record<SearchResult['type'], string> = {
        client: 'Contact',
        donation: 'Donation',
        task: 'Task',
        project: 'Project',
        event: 'Event',
        volunteer: 'Volunteer',
        household: 'Household',
        organization: 'Organization'
    };
    return labels[type];
};

const getTypeBadgeColor = (type: SearchResult['type']) => {
    const colors: Record<SearchResult['type'], string> = {
        client: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
        donation: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
        task: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
        project: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
        event: 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300',
        volunteer: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300',
        household: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
        organization: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
    };
    return colors[type];
};

export const UnifiedSearch: React.FC<UnifiedSearchProps> = ({
    clients,
    donations = [],
    tasks = [],
    onNavigate,
    onAiSearch
}) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [includeWeb, setIncludeWeb] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Search logic
    const performSearch = useCallback((searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults([]);
            return;
        }

        const q = searchQuery.toLowerCase();
        const searchResults: SearchResult[] = [];

        // Search clients/contacts
        clients.forEach(client => {
            const matchesName = client.name.toLowerCase().includes(q);
            const matchesContact = client.contactPerson?.toLowerCase().includes(q);
            const matchesEmail = client.email?.toLowerCase().includes(q);
            const matchesPhone = client.phone?.includes(q);
            const matchesLocation = client.location?.toLowerCase().includes(q);

            if (matchesName || matchesContact || matchesEmail || matchesPhone || matchesLocation) {
                searchResults.push({
                    id: client.id,
                    type: 'client',
                    title: client.name,
                    subtitle: client.email || client.phone || 'No contact info',
                    metadata: client.location,
                    pageId: 'contacts'
                });
            }
        });

        // Search donations
        donations.forEach(donation => {
            const client = clients.find(c => c.id === donation.clientId);
            const matchesAmount = donation.amount.toString().includes(q);
            const matchesCampaign = donation.campaign?.toLowerCase().includes(q);
            const matchesNotes = donation.notes?.toLowerCase().includes(q);
            const matchesClient = client?.name.toLowerCase().includes(q);

            if (matchesAmount || matchesCampaign || matchesNotes || matchesClient) {
                searchResults.push({
                    id: donation.id,
                    type: 'donation',
                    title: `$${donation.amount.toLocaleString()} - ${client?.name || 'Unknown'}`,
                    subtitle: donation.campaign || donation.type || 'General donation',
                    metadata: new Date(donation.date).toLocaleDateString(),
                    pageId: 'donations'
                });
            }
        });

        // Search tasks
        tasks.forEach(task => {
            const matchesTitle = task.title.toLowerCase().includes(q);
            const matchesDescription = task.description?.toLowerCase().includes(q);
            const matchesAssignee = task.assignee?.toLowerCase().includes(q);

            if (matchesTitle || matchesDescription || matchesAssignee) {
                searchResults.push({
                    id: task.id,
                    type: 'task',
                    title: task.title,
                    subtitle: `${task.status} - ${task.assignee || 'Unassigned'}`,
                    metadata: task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleDateString()}` : undefined,
                    pageId: 'tasks'
                });
            }
        });

        // Sort results by relevance (exact matches first)
        searchResults.sort((a, b) => {
            const aExact = a.title.toLowerCase().startsWith(q) ? 0 : 1;
            const bExact = b.title.toLowerCase().startsWith(q) ? 0 : 1;
            return aExact - bExact;
        });

        // Limit results
        setResults(searchResults.slice(0, 10));
    }, [clients, donations, tasks]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            performSearch(query);
        }, 150);
        return () => clearTimeout(timer);
    }, [query, performSearch]);

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown' || e.key === 'Enter') {
                setIsOpen(true);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => Math.max(prev - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (results[selectedIndex]) {
                    handleResultClick(results[selectedIndex]);
                } else if (query.trim() && onAiSearch) {
                    onAiSearch(query.trim(), includeWeb);
                    setIsOpen(false);
                    setQuery('');
                }
                break;
            case 'Escape':
                setIsOpen(false);
                inputRef.current?.blur();
                break;
        }
    };

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleResultClick = (result: SearchResult) => {
        onNavigate(result.pageId, result.id);
        setIsOpen(false);
        setQuery('');
    };

    const handleAiSearch = () => {
        if (query.trim() && onAiSearch) {
            onAiSearch(query.trim(), includeWeb);
            setIsOpen(false);
            setQuery('');
        }
    };

    const clearSearch = () => {
        setQuery('');
        setResults([]);
        inputRef.current?.focus();
    };

    return (
        <div className="relative w-full max-w-md" ref={dropdownRef}>
            {/* Search Input */}
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                        setSelectedIndex(0);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search contacts, donations, tasks..."
                    aria-label="Global search"
                    className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all shadow-sm"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <SearchIcon />
                </div>
                {query && (
                    <button
                        onClick={clearSearch}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                        <XMarkIcon />
                    </button>
                )}
            </div>

            {/* Keyboard shortcut hint */}
            <div className="absolute -right-16 top-1/2 -translate-y-1/2 hidden lg:flex items-center">
                <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-slate-700 dark:text-gray-400 rounded">
                    ⌘K
                </kbd>
            </div>

            {/* Dropdown Results */}
            {isOpen && (query.trim() || results.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto">
                    {/* Results list */}
                    {results.length > 0 ? (
                        <div className="py-2">
                            <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Results ({results.length})
                            </div>
                            {results.map((result, index) => (
                                <button
                                    key={`${result.type}-${result.id}`}
                                    onClick={() => handleResultClick(result)}
                                    className={`w-full px-3 py-2.5 flex items-center gap-3 text-left transition-colors ${
                                        index === selectedIndex
                                            ? 'bg-rose-50 dark:bg-rose-900/20'
                                            : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                                    }`}
                                >
                                    <div className={`p-2 rounded-lg ${getTypeBadgeColor(result.type)}`}>
                                        {getIconForType(result.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900 dark:text-white truncate">
                                                {result.title}
                                            </span>
                                            <span className={`px-1.5 py-0.5 text-xs rounded ${getTypeBadgeColor(result.type)}`}>
                                                {getTypeLabel(result.type)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                {result.subtitle}
                                            </span>
                                            {result.metadata && (
                                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                                    • {result.metadata}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : query.trim() ? (
                        <div className="py-8 px-4 text-center">
                            <div className="text-gray-400 dark:text-gray-500 mb-2">
                                <SearchIcon />
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                No results found for "{query}"
                            </p>
                        </div>
                    ) : null}

                    {/* AI Search option */}
                    {onAiSearch && query.trim() && (
                        <div className="border-t border-gray-100 dark:border-slate-700 p-3">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    AI-Powered Search
                                </span>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Include web</span>
                                    <input
                                        type="checkbox"
                                        checked={includeWeb}
                                        onChange={(e) => setIncludeWeb(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
                                    />
                                </label>
                            </div>
                            <button
                                onClick={handleAiSearch}
                                className="w-full py-2 px-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Search with AI: "{query}"
                            </button>
                        </div>
                    )}

                    {/* Quick navigation */}
                    <div className="border-t border-gray-100 dark:border-slate-700 px-3 py-2 bg-gray-50 dark:bg-slate-900/50">
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded shadow-sm">↑</kbd>
                                    <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded shadow-sm">↓</kbd>
                                    <span className="ml-1">Navigate</span>
                                </span>
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded shadow-sm">↵</kbd>
                                    <span className="ml-1">Select</span>
                                </span>
                            </div>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded shadow-sm">Esc</kbd>
                                <span className="ml-1">Close</span>
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
