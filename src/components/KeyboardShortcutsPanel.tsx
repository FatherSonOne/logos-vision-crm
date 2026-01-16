import React, { useEffect } from 'react';
import {
  Search, Plus, Calendar, Settings, Moon, Sun, Monitor,
  Command, ArrowLeft, ArrowRight, X, HelpCircle, Zap,
  Users, Briefcase, CheckSquare, DollarSign, BarChart3,
  FileText, Heart, Home, Keyboard
} from 'lucide-react';

/**
 * Keyboard Shortcuts Panel
 * ========================
 * Help overlay showing all available keyboard shortcuts.
 * Triggered by pressing '?' key.
 *
 * Features:
 * - Categorized shortcuts (Navigation, Actions, Search, General)
 * - Platform-specific display (⌘ for Mac, Ctrl for Windows/Linux)
 * - Beautiful modal with CMF design tokens
 * - Keyboard navigation (Esc to close)
 */

interface Shortcut {
  keys: string[];
  description: string;
  icon?: React.ReactNode;
}

interface ShortcutCategory {
  title: string;
  icon: React.ReactNode;
  shortcuts: Shortcut[];
}

interface KeyboardShortcutsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsPanel: React.FC<KeyboardShortcutsPanelProps> = ({
  isOpen,
  onClose
}) => {
  // Detect platform for correct modifier key display
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? '⌘' : 'Ctrl';

  // Define all keyboard shortcuts by category
  const shortcuts: ShortcutCategory[] = [
    {
      title: 'Navigation',
      icon: <Command className="w-5 h-5" />,
      shortcuts: [
        { keys: [modKey, 'K'], description: 'Open command palette', icon: <Search className="w-4 h-4" /> },
        { keys: ['G', 'D'], description: 'Go to Dashboard', icon: <Home className="w-4 h-4" /> },
        { keys: ['G', 'C'], description: 'Go to Contacts', icon: <Users className="w-4 h-4" /> },
        { keys: ['G', 'P'], description: 'Go to Projects', icon: <Briefcase className="w-4 h-4" /> },
        { keys: ['G', 'T'], description: 'Go to Tasks', icon: <CheckSquare className="w-4 h-4" /> },
        { keys: ['G', 'A'], description: 'Go to Calendar', icon: <Calendar className="w-4 h-4" /> },
        { keys: ['G', 'R'], description: 'Go to Reports', icon: <BarChart3 className="w-4 h-4" /> },
        { keys: [modKey, '/'], description: 'Toggle sidebar', icon: <ArrowLeft className="w-4 h-4" /> }
      ]
    },
    {
      title: 'Quick Actions',
      icon: <Zap className="w-5 h-5" />,
      shortcuts: [
        { keys: [modKey, 'N'], description: 'New contact', icon: <Plus className="w-4 h-4" /> },
        { keys: [modKey, 'Shift', 'P'], description: 'New project', icon: <Plus className="w-4 h-4" /> },
        { keys: [modKey, 'Shift', 'T'], description: 'New task', icon: <Plus className="w-4 h-4" /> },
        { keys: [modKey, 'M'], description: 'Schedule meeting', icon: <Calendar className="w-4 h-4" /> },
        { keys: [modKey, 'D'], description: 'Record donation', icon: <DollarSign className="w-4 h-4" /> },
        { keys: [modKey, 'Shift', 'C'], description: 'Create case', icon: <FileText className="w-4 h-4" /> },
        { keys: [modKey, 'Shift', 'V'], description: 'Add volunteer', icon: <Heart className="w-4 h-4" /> }
      ]
    },
    {
      title: 'Search & Filter',
      icon: <Search className="w-5 h-5" />,
      shortcuts: [
        { keys: [modKey, 'F'], description: 'Focus search', icon: <Search className="w-4 h-4" /> },
        { keys: ['/'], description: 'Quick search', icon: <Search className="w-4 h-4" /> },
        { keys: ['Esc'], description: 'Clear search/Close modal' },
        { keys: ['↑', '↓'], description: 'Navigate results' },
        { keys: ['↵'], description: 'Select result' }
      ]
    },
    {
      title: 'General',
      icon: <Settings className="w-5 h-5" />,
      shortcuts: [
        { keys: ['?'], description: 'Show keyboard shortcuts', icon: <Keyboard className="w-4 h-4" /> },
        { keys: [modKey, ','], description: 'Open settings', icon: <Settings className="w-4 h-4" /> },
        { keys: [modKey, 'Shift', 'L'], description: 'Toggle light mode', icon: <Sun className="w-4 h-4" /> },
        { keys: [modKey, 'Shift', 'D'], description: 'Toggle dark mode', icon: <Moon className="w-4 h-4" /> },
        { keys: [modKey, 'Shift', 'A'], description: 'Use system theme', icon: <Monitor className="w-4 h-4" /> },
        { keys: ['Esc'], description: 'Close modal/dialog' },
        { keys: [modKey, 'Z'], description: 'Undo' },
        { keys: [modKey, 'Shift', 'Z'], description: 'Redo' }
      ]
    }
  ];

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Close on Escape
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
        style={{ zIndex: 1300 }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl mx-4 animate-slideDown"
        style={{ zIndex: 1400 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="rounded-2xl overflow-hidden shadow-2xl border"
          style={{
            backgroundColor: 'var(--cmf-surface)',
            borderColor: 'var(--cmf-border-strong)'
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: 'var(--cmf-border)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: 'var(--cmf-accent-muted)' }}
              >
                <Keyboard className="w-5 h-5" style={{ color: 'var(--cmf-accent)' }} />
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--cmf-text)' }}>
                  Keyboard Shortcuts
                </h2>
                <p className="text-sm" style={{ color: 'var(--cmf-text-muted)' }}>
                  Navigate faster with keyboard shortcuts
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[var(--cmf-surface-2)] transition-colors"
              aria-label="Close keyboard shortcuts"
              type="button"
            >
              <X className="w-5 h-5" style={{ color: 'var(--cmf-text-secondary)' }} aria-hidden="true" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {shortcuts.map((category, idx) => (
                <div key={idx}>
                  {/* Category Header */}
                  <div className="flex items-center gap-2 mb-4">
                    <div style={{ color: 'var(--cmf-accent)' }}>
                      {category.icon}
                    </div>
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--cmf-text)' }}>
                      {category.title}
                    </h3>
                  </div>

                  {/* Shortcuts List */}
                  <div className="space-y-3">
                    {category.shortcuts.map((shortcut, sIdx) => (
                      <div
                        key={sIdx}
                        className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-[var(--cmf-surface-2)] transition-colors"
                      >
                        {/* Description */}
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {shortcut.icon && (
                            <div style={{ color: 'var(--cmf-text-faint)' }}>
                              {shortcut.icon}
                            </div>
                          )}
                          <span className="text-sm truncate" style={{ color: 'var(--cmf-text-secondary)' }}>
                            {shortcut.description}
                          </span>
                        </div>

                        {/* Key Combination */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {shortcut.keys.map((key, kIdx) => (
                            <React.Fragment key={kIdx}>
                              <kbd
                                className="px-2 py-1 text-xs font-semibold rounded border min-w-[28px] text-center"
                                style={{
                                  backgroundColor: 'var(--cmf-surface-2)',
                                  borderColor: 'var(--cmf-border)',
                                  color: 'var(--cmf-text)'
                                }}
                              >
                                {key}
                              </kbd>
                              {kIdx < shortcut.keys.length - 1 && (
                                <span className="text-xs" style={{ color: 'var(--cmf-text-faint)' }}>
                                  +
                                </span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div
            className="px-6 py-4 border-t flex items-center justify-between"
            style={{
              borderColor: 'var(--cmf-border)',
              backgroundColor: 'var(--cmf-surface-2)'
            }}
          >
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--cmf-text-muted)' }}>
              <HelpCircle className="w-4 h-4" />
              <span>Press <kbd className="px-1.5 py-0.5 mx-1 rounded text-xs" style={{ backgroundColor: 'var(--cmf-surface)', border: '1px solid var(--cmf-border)' }}>?</kbd> anytime to view shortcuts</span>
            </div>
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--cmf-text-muted)' }}>
              <span>Press <kbd className="px-1.5 py-0.5 mx-1 rounded text-xs" style={{ backgroundColor: 'var(--cmf-surface)', border: '1px solid var(--cmf-border)' }}>Esc</kbd> to close</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * Hook to manage Keyboard Shortcuts Panel state
 */
export const useKeyboardShortcuts = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open on '?' key (Shift + /)
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        // Don't trigger if typing in an input/textarea
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          return;
        }
        e.preventDefault();
        setIsOpen(true);
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
