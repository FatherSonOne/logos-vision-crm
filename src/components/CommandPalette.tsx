import React, { useState, useEffect, useRef, useMemo } from 'react';
import { SearchIcon, ArrowRightIcon, ClockIcon, ZapIcon } from './icons';
import type { Page } from '../types';
import { allNavItems, navigationSections } from './navigationConfig';

// Command types
type CommandType = 'navigation' | 'action' | 'recent';

interface Command {
  id: string;
  label: string;
  description?: string;
  type: CommandType;
  icon?: React.ReactNode;
  action: () => void;
  keywords?: string[]; // For better search matching
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: Page) => void;
  onQuickAction?: (action: string) => void;
  recentPages?: Array<{ page: Page; label: string }>;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onQuickAction,
  recentPages = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Build all available commands
  const allCommands = useMemo<Command[]>(() => {
    const commands: Command[] = [];

    // Navigation commands - from all nav items
    allNavItems.forEach(navItem => {
      commands.push({
        id: `nav-${navItem.pageId}`,
        label: navItem.label,
        description: `Go to ${navItem.label}`,
        type: 'navigation',
        icon: navItem.icon,
        action: () => {
          onNavigate(navItem.pageId);
          onClose();
        },
        keywords: [navItem.label.toLowerCase(), navItem.pageId]
      });
    });

    // Quick action commands
    const quickActions = [
      {
        id: 'action-new-project',
        label: 'Create New Project',
        description: 'Start a new project',
        icon: <ZapIcon />,
        action: () => {
          onQuickAction?.('new-project');
          onClose();
        },
        keywords: ['create', 'new', 'project', 'add']
      },
      {
        id: 'action-new-client',
        label: 'Add New Client',
        description: 'Create a new organization',
        icon: <ZapIcon />,
        action: () => {
          onQuickAction?.('new-client');
          onClose();
        },
        keywords: ['add', 'new', 'client', 'organization', 'create']
      },
      {
        id: 'action-new-volunteer',
        label: 'Add New Volunteer',
        description: 'Register a new volunteer',
        icon: <ZapIcon />,
        action: () => {
          onQuickAction?.('new-volunteer');
          onClose();
        },
        keywords: ['add', 'new', 'volunteer', 'create', 'register']
      },
      {
        id: 'action-new-activity',
        label: 'Log Activity',
        description: 'Record a new activity',
        icon: <ZapIcon />,
        action: () => {
          onQuickAction?.('new-activity');
          onClose();
        },
        keywords: ['log', 'new', 'activity', 'record', 'create']
      },
      {
        id: 'action-new-case',
        label: 'Create New Case',
        description: 'Open a new case',
        icon: <ZapIcon />,
        action: () => {
          onQuickAction?.('new-case');
          onClose();
        },
        keywords: ['create', 'new', 'case', 'open']
      },
      {
        id: 'action-new-team-member',
        label: 'Add Team Member',
        description: 'Invite a new team member',
        icon: <ZapIcon />,
        action: () => {
          onQuickAction?.('new-team-member');
          onClose();
        },
        keywords: ['add', 'new', 'team', 'member', 'invite', 'create']
      }
    ];

    quickActions.forEach(action => {
      commands.push({
        ...action,
        type: 'action'
      });
    });

    // Recent pages
    recentPages.forEach((recent, index) => {
      commands.push({
        id: `recent-${recent.page}`,
        label: recent.label,
        description: 'Recently viewed',
        type: 'recent',
        icon: <ClockIcon />,
        action: () => {
          onNavigate(recent.page);
          onClose();
        },
        keywords: [recent.label.toLowerCase(), 'recent']
      });
    });

    return commands;
  }, [onNavigate, onClose, onQuickAction, recentPages]);

  // Filter commands based on search query
  const filteredCommands = useMemo(() => {
    if (!searchQuery.trim()) {
      return allCommands;
    }

    const query = searchQuery.toLowerCase();
    return allCommands.filter(cmd => {
      // Search in label
      if (cmd.label.toLowerCase().includes(query)) return true;
      
      // Search in description
      if (cmd.description?.toLowerCase().includes(query)) return true;
      
      // Search in keywords
      if (cmd.keywords?.some(keyword => keyword.includes(query))) return true;
      
      return false;
    });
  }, [searchQuery, allCommands]);

  // Group commands by type
  const groupedCommands = useMemo(() => {
    const groups: Record<CommandType, Command[]> = {
      recent: [],
      action: [],
      navigation: []
    };

    filteredCommands.forEach(cmd => {
      groups[cmd.type].push(cmd);
    });

    return groups;
  }, [filteredCommands]);

  // Reset selected index when filtered commands change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSearchQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            Math.min(prev + 1, filteredCommands.length - 1)
          );
          break;
        
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
          }
          break;
        
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  const renderCommandGroup = (title: string, commands: Command[], startIndex: number) => {
    if (commands.length === 0) return null;

    return (
      <div key={title} className="mb-4 last:mb-0">
        <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {title}
        </div>
        {commands.map((cmd, index) => {
          const globalIndex = startIndex + index;
          const isSelected = globalIndex === selectedIndex;
          
          return (
            <button
              key={cmd.id}
              onClick={cmd.action}
              className={`w-full px-4 py-3 flex items-center gap-3 transition-colors duration-150 ${
                isSelected
                  ? 'bg-cyan-500 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className={`flex-shrink-0 w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                {cmd.icon}
              </div>
              
              <div className="flex-1 text-left min-w-0">
                <div className={`font-medium truncate ${isSelected ? 'text-white' : ''}`}>
                  {cmd.label}
                </div>
                {cmd.description && (
                  <div className={`text-sm truncate ${
                    isSelected ? 'text-cyan-100' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {cmd.description}
                  </div>
                )}
              </div>
              
              <ArrowRightIcon className={`flex-shrink-0 w-4 h-4 ${
                isSelected ? 'text-white' : 'text-gray-400'
              }`} />
            </button>
          );
        })}
      </div>
    );
  };

  let commandIndex = 0;
  const recentSection = renderCommandGroup('Recent', groupedCommands.recent, commandIndex);
  commandIndex += groupedCommands.recent.length;
  
  const actionsSection = renderCommandGroup('Quick Actions', groupedCommands.action, commandIndex);
  commandIndex += groupedCommands.action.length;
  
  const navSection = renderCommandGroup('Navigation', groupedCommands.navigation, commandIndex);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] animate-fadeIn"
        onClick={onClose}
      />
      
      {/* Command Palette */}
      <div className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-[9999] px-4 animate-slideDown">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200 dark:border-gray-700">
            <SearchIcon className="w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search commands, pages, and actions..."
              className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 text-base"
            />
            <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded">
              ESC
            </kbd>
          </div>
          
          {/* Command List */}
          <div
            ref={listRef}
            className="max-h-[60vh] overflow-y-auto"
          >
            {filteredCommands.length === 0 ? (
              <div className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                <SearchIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No commands found</p>
                <p className="text-sm mt-1">Try a different search term</p>
              </div>
            ) : (
              <>
                {recentSection}
                {actionsSection}
                {navSection}
              </>
            )}
          </div>
          
          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">↑</kbd>
                  <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">↓</kbd>
                  <span className="ml-1">Navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">↵</kbd>
                  <span className="ml-1">Select</span>
                </span>
              </div>
              <span>{filteredCommands.length} commands</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
