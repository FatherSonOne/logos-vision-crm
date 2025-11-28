import { useEffect, useCallback, useRef } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean; // Command key on Mac
  description: string;
  action: () => void;
  category?: string;
}

export interface KeyboardShortcutGroup {
  category: string;
  shortcuts: KeyboardShortcut[];
}

/**
 * Hook to register keyboard shortcuts
 *
 * @param shortcuts - Array of keyboard shortcuts to register
 * @param enabled - Whether shortcuts are enabled (default: true)
 *
 * @example
 * useKeyboardShortcuts([
 *   {
 *     key: 'n',
 *     ctrl: true,
 *     description: 'Create new project',
 *     action: () => setShowNewProject(true),
 *     category: 'Projects'
 *   }
 * ]);
 */
export const useKeyboardShortcuts = (
  shortcuts: KeyboardShortcut[],
  enabled: boolean = true
) => {
  const shortcutsRef = useRef(shortcuts);

  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Don't trigger shortcuts when typing in input fields
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return;
    }

    for (const shortcut of shortcutsRef.current) {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatches = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
      const altMatches = shortcut.alt ? event.altKey : !event.altKey;
      const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const metaMatches = shortcut.meta ? event.metaKey : true;

      if (keyMatches && ctrlMatches && altMatches && shiftMatches) {
        event.preventDefault();
        shortcut.action();
        break;
      }
    }
  }, [enabled]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

/**
 * Format shortcut for display
 */
export const formatShortcut = (shortcut: KeyboardShortcut): string => {
  const parts: string[] = [];

  if (shortcut.ctrl || shortcut.meta) {
    parts.push(navigator.platform.includes('Mac') ? '⌘' : 'Ctrl');
  }
  if (shortcut.alt) {
    parts.push(navigator.platform.includes('Mac') ? '⌥' : 'Alt');
  }
  if (shortcut.shift) {
    parts.push('⇧');
  }

  parts.push(shortcut.key.toUpperCase());

  return parts.join('+');
};

/**
 * Global keyboard shortcuts registry
 */
export class KeyboardShortcutRegistry {
  private static shortcuts: Map<string, KeyboardShortcut> = new Map();

  static register(id: string, shortcut: KeyboardShortcut) {
    this.shortcuts.set(id, shortcut);
  }

  static unregister(id: string) {
    this.shortcuts.delete(id);
  }

  static getAll(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }

  static getByCategory(category: string): KeyboardShortcut[] {
    return this.getAll().filter(s => s.category === category);
  }

  static clear() {
    this.shortcuts.clear();
  }
}

/**
 * Common keyboard shortcuts for CRM
 */
export const commonShortcuts = {
  // Navigation
  goToProjects: {
    key: 'p',
    ctrl: true,
    shift: true,
    description: 'Go to Projects',
    category: 'Navigation',
  },
  goToClients: {
    key: 'c',
    ctrl: true,
    shift: true,
    description: 'Go to Clients',
    category: 'Navigation',
  },
  goToDashboard: {
    key: 'd',
    ctrl: true,
    shift: true,
    description: 'Go to Dashboard',
    category: 'Navigation',
  },
  goToTasks: {
    key: 't',
    ctrl: true,
    shift: true,
    description: 'Go to Tasks',
    category: 'Navigation',
  },

  // Actions
  newProject: {
    key: 'n',
    ctrl: true,
    description: 'New Project',
    category: 'Actions',
  },
  search: {
    key: 'k',
    ctrl: true,
    description: 'Search',
    category: 'Actions',
  },
  save: {
    key: 's',
    ctrl: true,
    description: 'Save',
    category: 'Actions',
  },

  // UI
  toggleDarkMode: {
    key: 'd',
    ctrl: true,
    alt: true,
    description: 'Toggle Dark Mode',
    category: 'UI',
  },
  showHelp: {
    key: '?',
    shift: true,
    description: 'Show Help',
    category: 'UI',
  },
  escape: {
    key: 'Escape',
    description: 'Close/Cancel',
    category: 'UI',
  },
};
