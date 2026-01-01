import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Page } from '../types';
import {
    UsersIcon, DonationIcon, CheckSquareIcon, FolderIcon, CalendarIcon,
    MailCampaignIcon, SparklesIcon, PlusIcon, HomeUsersIcon, RepeatIcon,
    PipelineIcon, CultivationIcon, TouchpointIcon, HandHeartIcon, EventsIcon
} from './icons';

interface QuickAction {
    id: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    category: 'create' | 'navigate' | 'action';
    action: () => void;
    keywords: string[];
}

interface QuickActionsProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (page: Page) => void;
    onCreateClient?: () => void;
    onCreateDonation?: () => void;
    onCreateTask?: () => void;
    onCreateProject?: () => void;
    onCreatePledge?: () => void;
    onCreateEvent?: () => void;
    onCreateCampaign?: () => void;
    onAiAssist?: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
    isOpen,
    onClose,
    onNavigate,
    onCreateClient,
    onCreateDonation,
    onCreateTask,
    onCreateProject,
    onCreatePledge,
    onCreateEvent,
    onCreateCampaign,
    onAiAssist
}) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // Define all quick actions
    const allActions: QuickAction[] = [
        // Create actions
        {
            id: 'create-contact',
            label: 'New Contact',
            description: 'Add a new contact or donor',
            icon: <UsersIcon />,
            category: 'create',
            action: () => { onCreateClient?.(); onClose(); },
            keywords: ['new', 'create', 'add', 'contact', 'client', 'donor', 'person']
        },
        {
            id: 'create-donation',
            label: 'Record Donation',
            description: 'Record a new donation',
            icon: <DonationIcon />,
            category: 'create',
            action: () => { onCreateDonation?.(); onClose(); },
            keywords: ['new', 'create', 'add', 'donation', 'gift', 'contribution', 'money']
        },
        {
            id: 'create-task',
            label: 'Create Task',
            description: 'Add a new task',
            icon: <CheckSquareIcon />,
            category: 'create',
            action: () => { onCreateTask?.(); onClose(); },
            keywords: ['new', 'create', 'add', 'task', 'todo', 'action', 'item']
        },
        {
            id: 'create-project',
            label: 'New Project',
            description: 'Start a new project',
            icon: <FolderIcon />,
            category: 'create',
            action: () => { onCreateProject?.(); onClose(); },
            keywords: ['new', 'create', 'add', 'project', 'initiative']
        },
        {
            id: 'create-pledge',
            label: 'New Pledge',
            description: 'Record a new pledge',
            icon: <RepeatIcon />,
            category: 'create',
            action: () => { onCreatePledge?.(); onClose(); },
            keywords: ['new', 'create', 'add', 'pledge', 'commitment', 'recurring']
        },
        {
            id: 'create-event',
            label: 'New Event',
            description: 'Create a new event',
            icon: <EventsIcon />,
            category: 'create',
            action: () => { onCreateEvent?.(); onClose(); },
            keywords: ['new', 'create', 'add', 'event', 'calendar', 'meeting']
        },
        {
            id: 'create-campaign',
            label: 'New Campaign',
            description: 'Start a new campaign',
            icon: <MailCampaignIcon />,
            category: 'create',
            action: () => { onCreateCampaign?.(); onClose(); },
            keywords: ['new', 'create', 'add', 'campaign', 'fundraising', 'appeal']
        },
        // Navigate actions
        {
            id: 'nav-dashboard',
            label: 'Go to Dashboard',
            description: 'View main dashboard',
            icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>,
            category: 'navigate',
            action: () => { onNavigate('dashboard'); onClose(); },
            keywords: ['dashboard', 'home', 'main', 'overview']
        },
        {
            id: 'nav-contacts',
            label: 'Go to Contacts',
            description: 'View all contacts',
            icon: <UsersIcon />,
            category: 'navigate',
            action: () => { onNavigate('contacts'); onClose(); },
            keywords: ['contacts', 'clients', 'donors', 'people']
        },
        {
            id: 'nav-donations',
            label: 'Go to Donations',
            description: 'View all donations',
            icon: <DonationIcon />,
            category: 'navigate',
            action: () => { onNavigate('donations'); onClose(); },
            keywords: ['donations', 'gifts', 'giving', 'contributions']
        },
        {
            id: 'nav-tasks',
            label: 'Go to Tasks',
            description: 'View all tasks',
            icon: <CheckSquareIcon />,
            category: 'navigate',
            action: () => { onNavigate('tasks'); onClose(); },
            keywords: ['tasks', 'todos', 'actions', 'items']
        },
        {
            id: 'nav-calendar',
            label: 'Go to Calendar',
            description: 'View calendar',
            icon: <CalendarIcon />,
            category: 'navigate',
            action: () => { onNavigate('calendar'); onClose(); },
            keywords: ['calendar', 'schedule', 'events', 'dates']
        },
        {
            id: 'nav-households',
            label: 'Go to Households',
            description: 'View all households',
            icon: <HomeUsersIcon />,
            category: 'navigate',
            action: () => { onNavigate('households'); onClose(); },
            keywords: ['households', 'families', 'homes']
        },
        {
            id: 'nav-pipeline',
            label: 'Go to Donor Pipeline',
            description: 'View donor pipeline',
            icon: <PipelineIcon />,
            category: 'navigate',
            action: () => { onNavigate('donor-pipeline'); onClose(); },
            keywords: ['pipeline', 'funnel', 'moves', 'prospects']
        },
        {
            id: 'nav-cultivation',
            label: 'Go to Cultivation Plans',
            description: 'View cultivation plans',
            icon: <CultivationIcon />,
            category: 'navigate',
            action: () => { onNavigate('cultivation'); onClose(); },
            keywords: ['cultivation', 'plans', 'strategy', 'relationship']
        },
        {
            id: 'nav-touchpoints',
            label: 'Go to Touchpoints',
            description: 'View touchpoint history',
            icon: <TouchpointIcon />,
            category: 'navigate',
            action: () => { onNavigate('touchpoints'); onClose(); },
            keywords: ['touchpoints', 'interactions', 'communications', 'history']
        },
        {
            id: 'nav-volunteers',
            label: 'Go to Volunteers',
            description: 'View all volunteers',
            icon: <HandHeartIcon />,
            category: 'navigate',
            action: () => { onNavigate('volunteers'); onClose(); },
            keywords: ['volunteers', 'helpers', 'team']
        },
        // Action items
        {
            id: 'action-ai',
            label: 'AI Assistant',
            description: 'Open AI assistant',
            icon: <SparklesIcon />,
            category: 'action',
            action: () => { onAiAssist?.(); onClose(); },
            keywords: ['ai', 'assistant', 'help', 'smart', 'gemini']
        }
    ];

    // Filter actions based on query
    const filteredActions = query.trim()
        ? allActions.filter(action => {
            const q = query.toLowerCase();
            return (
                action.label.toLowerCase().includes(q) ||
                action.description.toLowerCase().includes(q) ||
                action.keywords.some(k => k.includes(q))
            );
        })
        : allActions;

    // Group by category
    const groupedActions = {
        create: filteredActions.filter(a => a.category === 'create'),
        navigate: filteredActions.filter(a => a.category === 'navigate'),
        action: filteredActions.filter(a => a.category === 'action')
    };

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        const totalItems = filteredActions.length;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % totalItems);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems);
                break;
            case 'Enter':
                e.preventDefault();
                if (filteredActions[selectedIndex]) {
                    filteredActions[selectedIndex].action();
                }
                break;
            case 'Escape':
                e.preventDefault();
                onClose();
                break;
        }
    }, [filteredActions, selectedIndex, onClose]);

    // Scroll selected item into view
    useEffect(() => {
        const selectedEl = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
        selectedEl?.scrollIntoView({ block: 'nearest' });
    }, [selectedIndex]);

    // Global keyboard shortcut
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (isOpen) {
                    onClose();
                }
            }
        };
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const getCategoryLabel = (cat: 'create' | 'navigate' | 'action') => {
        const labels = {
            create: 'Create',
            navigate: 'Navigate',
            action: 'Actions'
        };
        return labels[cat];
    };

    let currentIndex = -1;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Command palette */}
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-xl shadow-2xl overflow-hidden animate-scale-in">
                {/* Search input */}
                <div className="border-b border-gray-200 dark:border-slate-700">
                    <div className="flex items-center px-4">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setSelectedIndex(0);
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a command or search..."
                            className="flex-1 px-3 py-4 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
                        />
                        <kbd className="px-2 py-1 text-xs font-semibold text-gray-400 bg-gray-100 dark:bg-slate-700 rounded">
                            ESC
                        </kbd>
                    </div>
                </div>

                {/* Results */}
                <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
                    {filteredActions.length === 0 ? (
                        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                            No commands found for "{query}"
                        </div>
                    ) : (
                        <>
                            {(['create', 'navigate', 'action'] as const).map(category => {
                                const items = groupedActions[category];
                                if (items.length === 0) return null;

                                return (
                                    <div key={category} className="mb-2">
                                        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            {getCategoryLabel(category)}
                                        </div>
                                        {items.map(action => {
                                            currentIndex++;
                                            const idx = currentIndex;
                                            return (
                                                <button
                                                    key={action.id}
                                                    data-index={idx}
                                                    onClick={action.action}
                                                    onMouseEnter={() => setSelectedIndex(idx)}
                                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                                                        idx === selectedIndex
                                                            ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300'
                                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                                                    }`}
                                                >
                                                    <div className={`p-2 rounded-lg ${
                                                        idx === selectedIndex
                                                            ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400'
                                                            : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400'
                                                    }`}>
                                                        {action.icon}
                                                    </div>
                                                    <div className="flex-1 text-left">
                                                        <div className="font-medium">{action.label}</div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            {action.description}
                                                        </div>
                                                    </div>
                                                    {idx === selectedIndex && (
                                                        <kbd className="px-2 py-1 text-xs font-semibold text-gray-400 bg-white dark:bg-slate-600 rounded shadow-sm">
                                                            ↵
                                                        </kbd>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>

                {/* Footer hints */}
                <div className="border-t border-gray-200 dark:border-slate-700 px-4 py-2 bg-gray-50 dark:bg-slate-900/50">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-3">
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
                            <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded shadow-sm">⌘</kbd>
                            <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded shadow-sm">K</kbd>
                            <span className="ml-1">Toggle</span>
                        </span>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes scale-in {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-scale-in {
                    animation: scale-in 0.15s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

// Hook to manage quick actions state
export const useQuickActions = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return {
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: () => setIsOpen(prev => !prev)
    };
};
