import React, { useState, useEffect, useCallback } from 'react';

/**
 * Keyboard Shortcuts Panel
 * 
 * Features:
 * - Press ? to open
 * - Organized by category
 * - Searchable
 * - Print/export option
 * - Shows all app shortcuts
 * - Beautiful design
 * - Keyboard navigation
 */

export interface KeyboardShortcut {
  id: string;
  keys: string[]; // e.g. ['Ctrl', 'K'] or ['?']
  description: string;
  category: string;
}

const shortcuts: KeyboardShortcut[] = [
  // Navigation
  { id: 'search', keys: ['Ctrl', 'K'], description: 'Open Global Search', category: 'Navigation' },
  { id: 'search-alt', keys: ['/'], description: 'Open Global Search (alternative)', category: 'Navigation' },
  { id: 'command', keys: ['Ctrl', 'Shift', 'K'], description: 'Open Command Palette', category: 'Navigation' },
  { id: 'help', keys: ['?'], description: 'Show Keyboard Shortcuts', category: 'Navigation' },
  
  // Views & Pages
  { id: 'dashboard', keys: ['G', 'D'], description: 'Go to Dashboard', category: 'Views' },
  { id: 'projects', keys: ['G', 'P'], description: 'Go to Projects', category: 'Views' },
  { id: 'clients', keys: ['G', 'C'], description: 'Go to Clients', category: 'Views' },
  { id: 'activities', keys: ['G', 'A'], description: 'Go to Activities', category: 'Views' },
  
  // Actions
  { id: 'new-project', keys: ['N', 'P'], description: 'Create New Project', category: 'Actions' },
  { id: 'new-client', keys: ['N', 'C'], description: 'Create New Client', category: 'Actions' },
  { id: 'new-activity', keys: ['N', 'A'], description: 'Log New Activity', category: 'Actions' },
  
  // Editing
  { id: 'save', keys: ['Ctrl', 'S'], description: 'Save Changes', category: 'Editing' },
  { id: 'cancel', keys: ['Esc'], description: 'Cancel / Close Dialog', category: 'Editing' },
  { id: 'edit', keys: ['E'], description: 'Edit Selected Item', category: 'Editing' },
  { id: 'delete', keys: ['Del'], description: 'Delete Selected Item', category: 'Editing' },
  
  // List Navigation
  { id: 'next-item', keys: ['↓'], description: 'Next Item', category: 'List Navigation' },
  { id: 'prev-item', keys: ['↑'], description: 'Previous Item', category: 'List Navigation' },
  { id: 'select', keys: ['Enter'], description: 'Select / Open Item', category: 'List Navigation' },
  
  // Tabs
  { id: 'next-tab', keys: ['→'], description: 'Next Tab', category: 'Tabs' },
  { id: 'prev-tab', keys: ['←'], description: 'Previous Tab', category: 'Tabs' },
  { id: 'first-tab', keys: ['Home'], description: 'First Tab', category: 'Tabs' },
  { id: 'last-tab', keys: ['End'], description: 'Last Tab', category: 'Tabs' },
  
  // Context Menus
  { id: 'context-menu', keys: ['Right Click'], description: 'Open Context Menu', category: 'Context Menus' },
  { id: 'context-nav-up', keys: ['↑'], description: 'Navigate Context Menu Up', category: 'Context Menus' },
  { id: 'context-nav-down', keys: ['↓'], description: 'Navigate Context Menu Down', category: 'Context Menus' },
  
  // General
  { id: 'theme', keys: ['Ctrl', 'Shift', 'T'], description: 'Toggle Dark Mode', category: 'General' },
  { id: 'print', keys: ['Ctrl', 'P'], description: 'Print Page', category: 'General' },
];

interface KeyboardShortcutsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsPanel: React.FC<KeyboardShortcutsPanelProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter shortcuts based on search and category
  const filteredShortcuts = shortcuts.filter(shortcut => {
    const matchesSearch = searchQuery === '' || 
      shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shortcut.keys.some(key => key.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !selectedCategory || shortcut.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Group by category
  const categories = Array.from(new Set(shortcuts.map(s => s.category)));
  const groupedShortcuts = categories.map(category => ({
    category,
    shortcuts: filteredShortcuts.filter(s => s.category === category)
  })).filter(group => group.shortcuts.length > 0);

  // Handle Escape to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Handle export
  const handleExport = () => {
    const text = shortcuts.map(s => 
      `${s.keys.join(' + ')}\t${s.description}\t${s.category}`
    ).join('\n');
    
    const blob = new Blob([`Keyboard Shortcuts\n\nKeys\tDescription\tCategory\n${text}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'keyboard-shortcuts.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col pointer-events-auto animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">⌨️</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Keyboard Shortcuts
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {filteredShortcuts.length} shortcuts available
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Print shortcuts"
              >
                🖨️ Print
              </button>
              <button
                onClick={handleExport}
                className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Export shortcuts"
              >
                📥 Export
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Close (Esc)"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 space-y-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search shortcuts..."
                className="w-full px-4 py-3 pl-11 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === null
                    ? 'bg-cyan-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                All Categories
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Shortcuts List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {groupedShortcuts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500 dark:text-slate-400 mb-2">No shortcuts found</p>
                <p className="text-sm text-slate-400 dark:text-slate-500">Try a different search term</p>
              </div>
            ) : (
              groupedShortcuts.map(group => (
                <div key={group.category}>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                    {group.category}
                  </h3>
                  <div className="space-y-2">
                    {group.shortcuts.map(shortcut => (
                      <div
                        key={shortcut.id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <span className="text-slate-700 dark:text-slate-300">
                          {shortcut.description}
                        </span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, index) => (
                            <React.Fragment key={index}>
                              <kbd className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm font-mono font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
                                {key}
                              </kbd>
                              {index < shortcut.keys.length - 1 && (
                                <span className="text-slate-400 dark:text-slate-500 text-sm font-medium">+</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl">
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
              Press <kbd className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono">Esc</kbd> to close • 
              Press <kbd className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono">?</kbd> anytime to reopen
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * Hook to manage keyboard shortcuts panel
 */
export const useKeyboardShortcuts = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for ? key (Shift + /)
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Don't open if user is typing in an input
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          return;
        }
        
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(!isOpen);

  return {
    isOpen,
    open,
    close,
    toggle
  };
};
