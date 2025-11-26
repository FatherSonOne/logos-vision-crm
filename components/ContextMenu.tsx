import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Context Menu Component (Right-Click Menu)
 * 
 * Features:
 * - Right-click to open
 * - Keyboard navigation (arrow keys, Enter, Escape)
 * - Icons and keyboard shortcuts
 * - Dividers for grouping
 * - Disabled states
 * - Smart positioning (stays on screen)
 * - Dark mode support
 * - Smooth animations
 */

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean; // For destructive actions (delete, etc.)
  divider?: boolean; // Show divider after this item
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  children: React.ReactNode;
  className?: string;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  items,
  children,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter out disabled items for keyboard navigation
  const enabledItems = items.filter(item => !item.disabled);

  // Handle right-click
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const x = e.clientX;
    const y = e.clientY;

    setPosition({ x, y });
    setIsOpen(true);
    setSelectedIndex(0);
  }, []);

  // Position menu to stay on screen
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const menu = menuRef.current;
      const menuRect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let { x, y } = position;

      // Adjust horizontal position
      if (x + menuRect.width > viewportWidth) {
        x = viewportWidth - menuRect.width - 10;
      }

      // Adjust vertical position
      if (y + menuRect.height > viewportHeight) {
        y = viewportHeight - menuRect.height - 10;
      }

      // Make sure it's not off the left or top edge
      x = Math.max(10, x);
      y = Math.max(10, y);

      if (x !== position.x || y !== position.y) {
        setPosition({ x, y });
      }
    }
  }, [isOpen, position]);

  // Close menu on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => {
          const nextIndex = (prev + 1) % enabledItems.length;
          return nextIndex;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => {
          const nextIndex = (prev - 1 + enabledItems.length) % enabledItems.length;
          return nextIndex;
        });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selectedItem = enabledItems[selectedIndex];
        if (selectedItem) {
          selectedItem.onClick();
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, enabledItems]);

  // Handle menu item click
  const handleItemClick = (item: ContextMenuItem) => {
    if (item.disabled) return;
    item.onClick();
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger element */}
      <div
        ref={containerRef}
        onContextMenu={handleContextMenu}
        className={className}
      >
        {children}
      </div>

      {/* Context menu portal */}
      {isOpen && (
        <div
          ref={menuRef}
          className="fixed z-50 min-w-[200px] bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 py-1 animate-scale-in"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
        >
          {items.map((item, index) => {
            const isSelected = enabledItems[selectedIndex]?.id === item.id;
            
            return (
              <React.Fragment key={item.id}>
                <button
                  onClick={() => handleItemClick(item)}
                  onMouseEnter={() => {
                    const enabledIndex = enabledItems.findIndex(i => i.id === item.id);
                    if (enabledIndex !== -1) {
                      setSelectedIndex(enabledIndex);
                    }
                  }}
                  disabled={item.disabled}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors
                    ${item.disabled
                      ? 'opacity-40 cursor-not-allowed'
                      : isSelected
                        ? 'bg-cyan-50 dark:bg-cyan-900/30'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }
                    ${item.danger && !item.disabled
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-slate-700 dark:text-slate-200'
                    }
                  `}
                >
                  {item.icon && (
                    <span className="flex-shrink-0 w-4 h-4">
                      {item.icon}
                    </span>
                  )}
                  <span className="flex-1 text-left">
                    {item.label}
                  </span>
                  {item.shortcut && (
                    <kbd className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {item.shortcut}
                    </kbd>
                  )}
                </button>
                {item.divider && (
                  <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </>
  );
};

/**
 * Hook to use context menu programmatically
 */
export const useContextMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const open = useCallback((x: number, y: number) => {
    setPosition({ x, y });
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    position,
    open,
    close
  };
};

// Animation CSS (add to your index.html if not already there)
const contextMenuStyles = `
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
  animation: scale-in 0.1s ease-out;
}
`;

// Export styles for documentation
export const CONTEXT_MENU_STYLES = contextMenuStyles;
