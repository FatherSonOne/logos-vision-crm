import React, { useEffect, useRef } from 'react';
import { PinIcon, StarIcon, ArchiveBoxIcon, DownloadIcon, CopyIcon, TemplateIcon, EyeIcon, EditIcon, TrashIcon } from './icons';

export type ContextMenuItem = {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  shortcut?: string;
  separator?: false;
} | {
  separator: true;
  label?: never;
  onClick?: never;
  disabled?: boolean;
};

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Add listeners with a small delay to prevent immediate closing
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }, 10);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Adjust position if menu would go off screen
  useEffect(() => {
    if (menuRef.current) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let finalX = x;
      let finalY = y;

      // Keep menu on screen horizontally
      if (finalX + rect.width > viewportWidth) {
        finalX = viewportWidth - rect.width - 10;
      }
      if (finalX < 10) {
        finalX = 10;
      }

      // Keep menu on screen vertically
      if (finalY + rect.height > viewportHeight) {
        finalY = viewportHeight - rect.height - 10;
      }
      if (finalY < 10) {
        finalY = 10;
      }

      // Apply the calculated position
      menu.style.left = `${finalX}px`;
      menu.style.top = `${finalY}px`;
    }
  }, [x, y]);

  const handleItemClick = (item: ContextMenuItem) => {
    if (!item.disabled) {
      item.onClick();
      onClose();
    }
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 py-1 min-w-[200px] animate-in fade-in zoom-in-95 duration-100"
      style={{ 
        left: `${x}px`, 
        top: `${y}px`,
        position: 'fixed'
      }}
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {item.separator ? (
            <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
          ) : (
            <button
              onClick={() => handleItemClick(item)}
              disabled={item.disabled}
              className={`w-full px-4 py-2 text-left flex items-center gap-3 transition-colors ${
                item.disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : item.danger
                  ? 'hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {item.icon && <span className="w-4 h-4">{item.icon}</span>}
              <span className="flex-1 text-sm font-medium">{item.label}</span>
              {item.shortcut && (
                <span className="text-xs text-gray-400 dark:text-gray-500">{item.shortcut}</span>
              )}
            </button>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// Hook to manage context menu state
export const useContextMenu = () => {
  const [contextMenu, setContextMenu] = React.useState<{
    x: number;
    y: number;
    items: ContextMenuItem[];
  } | null>(null);

  const showContextMenu = (event: React.MouseEvent, items: ContextMenuItem[]) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Use clientX and clientY for viewport-relative positioning
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      items
    });
  };

  const hideContextMenu = () => {
    setContextMenu(null);
  };

  return { contextMenu, showContextMenu, hideContextMenu };
};