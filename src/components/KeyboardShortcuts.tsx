import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, X, Search, Home, Users, Briefcase, FileText, Settings, Bell } from 'lucide-react';
import { useStore } from '../store/useStore';

interface Shortcut {
  key: string;
  modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[];
  description: string;
  action: () => void;
  icon?: React.ReactNode;
  category: 'navigation' | 'actions' | 'ui' | 'other';
}

export const KeyboardShortcutsPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { keyboardShortcutsEnabled, ui } = useStore();
  const isDark = ui.theme === 'dark' || (ui.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const shortcuts: Shortcut[] = [
    {
      key: 'k',
      modifiers: ['ctrl'],
      description: 'Open Command Palette',
      action: () => {},
      icon: <Command className="w-4 h-4" />,
      category: 'ui',
    },
    {
      key: '/',
      description: 'Focus Search',
      action: () => {},
      icon: <Search className="w-4 h-4" />,
      category: 'navigation',
    },
    {
      key: 'h',
      modifiers: ['ctrl'],
      description: 'Go to Home',
      action: () => {},
      icon: <Home className="w-4 h-4" />,
      category: 'navigation',
    },
    {
      key: 'p',
      modifiers: ['ctrl'],
      description: 'Go to Projects',
      action: () => {},
      icon: <Briefcase className="w-4 h-4" />,
      category: 'navigation',
    },
    {
      key: 'c',
      modifiers: ['ctrl'],
      description: 'Go to Clients',
      action: () => {},
      icon: <Users className="w-4 h-4" />,
      category: 'navigation',
    },
    {
      key: 'n',
      modifiers: ['ctrl'],
      description: 'Open Notifications',
      action: () => {},
      icon: <Bell className="w-4 h-4" />,
      category: 'ui',
    },
    {
      key: ',',
      modifiers: ['ctrl'],
      description: 'Open Settings',
      action: () => {},
      icon: <Settings className="w-4 h-4" />,
      category: 'ui',
    },
    {
      key: 'b',
      modifiers: ['ctrl'],
      description: 'Toggle Sidebar',
      action: () => {},
      category: 'ui',
    },
    {
      key: '?',
      modifiers: ['shift'],
      description: 'Show Keyboard Shortcuts',
      action: () => setIsOpen(true),
      category: 'other',
    },
  ];

  useEffect(() => {
    if (!keyboardShortcutsEnabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if user is typing in an input
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        // Only allow certain shortcuts in inputs
        if (!(event.key === '/' || (event.ctrlKey && event.key === 'k'))) {
          return;
        }
      }

      shortcuts.forEach((shortcut) => {
        const modifiersMatch =
          (!shortcut.modifiers || shortcut.modifiers.length === 0) ||
          shortcut.modifiers.every((mod) => {
            switch (mod) {
              case 'ctrl':
                return event.ctrlKey || event.metaKey;
              case 'alt':
                return event.altKey;
              case 'shift':
                return event.shiftKey;
              case 'meta':
                return event.metaKey;
              default:
                return false;
            }
          });

        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (modifiersMatch && keyMatch) {
          event.preventDefault();
          shortcut.action();
        }
      });

      // Show shortcuts panel with ?
      if (event.shiftKey && event.key === '?') {
        event.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyboardShortcutsEnabled]);

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  const categoryTitles: Record<string, string> = {
    navigation: 'Navigation',
    actions: 'Actions',
    ui: 'User Interface',
    other: 'Other',
  };

  const formatShortcut = (shortcut: Shortcut) => {
    const keys: string[] = [];
    if (shortcut.modifiers) {
      shortcut.modifiers.forEach((mod) => {
        switch (mod) {
          case 'ctrl':
            keys.push(navigator.platform.includes('Mac') ? '⌘' : 'Ctrl');
            break;
          case 'alt':
            keys.push(navigator.platform.includes('Mac') ? '⌥' : 'Alt');
            break;
          case 'shift':
            keys.push('⇧');
            break;
          case 'meta':
            keys.push('⌘');
            break;
        }
      });
    }
    keys.push(shortcut.key.toUpperCase());
    return keys;
  };

  return (
    <>
      {/* Floating Help Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-2xl z-40 ${
          isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
        } border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
        title="Keyboard Shortcuts (Shift + ?)"
      >
        <Command className={`w-6 h-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
      </motion.button>

      {/* Shortcuts Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div
                className={`max-w-3xl w-full max-h-[80vh] overflow-auto rounded-2xl shadow-2xl ${
                  isDark ? 'bg-gray-800' : 'bg-white'
                } border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
              >
                {/* Header */}
                <div className={`sticky top-0 p-6 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} z-10`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                        <Command className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                      </div>
                      <div>
                        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Keyboard Shortcuts
                        </h2>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Master these shortcuts to boost your productivity
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
                    <div key={category}>
                      <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {categoryTitles[category]}
                      </h3>
                      <div className="space-y-2">
                        {shortcuts.map((shortcut, index) => (
                          <motion.div
                            key={`${category}-${index}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`flex items-center justify-between p-4 rounded-lg ${
                              isDark ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                            } transition-colors`}
                          >
                            <div className="flex items-center gap-3">
                              {shortcut.icon && (
                                <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                  {shortcut.icon}
                                </div>
                              )}
                              <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {shortcut.description}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              {formatShortcut(shortcut).map((key, i) => (
                                <React.Fragment key={i}>
                                  {i > 0 && (
                                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                      +
                                    </span>
                                  )}
                                  <kbd
                                    className={`px-3 py-1.5 rounded-md text-sm font-semibold ${
                                      isDark
                                        ? 'bg-gray-800 text-gray-300 border border-gray-600'
                                        : 'bg-white text-gray-700 border border-gray-300 shadow-sm'
                                    }`}
                                  >
                                    {key}
                                  </kbd>
                                </React.Fragment>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className={`p-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <p className={`text-sm text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Press <kbd className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-xs font-semibold">Shift</kbd> +{' '}
                    <kbd className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-xs font-semibold">?</kbd> to show this panel
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
