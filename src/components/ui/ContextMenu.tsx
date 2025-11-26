import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * Context Menu Component (Right-Click Menu)
 * Uses React Portal for reliable positioning
 */

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  children: React.ReactNode;
  className?: string;
}

// Global function to close any open context menu
let globalCloseMenu: (() => void) | null = null;

export const ContextMenu: React.FC<ContextMenuProps> = ({
  items,
  children,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const enabledItems = items.filter(item => !item.disabled);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Handle right-click
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Close any other open context menu first
    if (globalCloseMenu && globalCloseMenu !== closeMenu) {
      globalCloseMenu();
    }
    
    setPosition({ x: e.clientX, y: e.clientY });
    setIsOpen(true);
    setSelectedIndex(0);
    
    // Register this menu's close function globally
    globalCloseMenu = closeMenu;
  };

  // Adjust position to keep menu on screen
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();
      
      let newX = position.x;
      let newY = position.y;
      
      if (newX + rect.width > window.innerWidth - 10) {
        newX = window.innerWidth - rect.width - 10;
      }
      if (newY + rect.height > window.innerHeight - 10) {
        newY = window.innerHeight - rect.height - 10;
      }
      
      newX = Math.max(10, newX);
      newY = Math.max(10, newY);
      
      if (newX !== position.x || newY !== position.y) {
        setPosition({ x: newX, y: newY });
      }
    }
  }, [isOpen]);

  // Close handlers
  useEffect(() => {
    if (!isOpen) {
      // Clear global reference when closed
      if (globalCloseMenu === closeMenu) {
        globalCloseMenu = null;
      }
      return;
    }
    
    const handleClick = (e: MouseEvent) => {
      // Don't close if clicking inside the menu
      if (menuRef.current && menuRef.current.contains(e.target as Node)) {
        return;
      }
      closeMenu();
    };
    
    const handleRightClick = (e: MouseEvent) => {
      // Don't close if right-clicking inside the menu
      if (menuRef.current && menuRef.current.contains(e.target as Node)) {
        e.preventDefault();
        return;
      }
      // Close this menu - a new one will open from the target element
      closeMenu();
    };
    
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    
    const handleScroll = () => closeMenu();
    
    // Add listeners immediately (no delay)
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('contextmenu', handleRightClick);
    document.addEventListener('keydown', handleKey);
    window.addEventListener('scroll', handleScroll, true);
    
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('contextmenu', handleRightClick);
      document.removeEventListener('keydown', handleKey);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, closeMenu]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % enabledItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + enabledItems.length) % enabledItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        enabledItems[selectedIndex]?.onClick();
        closeMenu();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, enabledItems, closeMenu]);

  const handleItemClick = (item: ContextMenuItem) => {
    if (item.disabled) return;
    item.onClick();
    closeMenu();
  };

  // Check if dark mode is active
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  const menuContent = isOpen ? (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 99999,
        minWidth: 220,
        padding: '8px 0',
        borderRadius: 12,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.05)',
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        border: isDark ? '1px solid #475569' : '1px solid #e2e8f0',
      }}
    >
      {items.map((item) => {
        const isSelected = enabledItems[selectedIndex]?.id === item.id;
        
        // Compute styles based on state
        let bgColor = 'transparent';
        let textColor = isDark ? '#e2e8f0' : '#334155';
        
        if (item.disabled) {
          textColor = isDark ? '#64748b' : '#94a3b8';
        } else if (item.danger) {
          textColor = isDark ? '#f87171' : '#dc2626';
          if (isSelected) bgColor = isDark ? 'rgba(127, 29, 29, 0.3)' : '#fef2f2';
        } else if (isSelected) {
          bgColor = isDark ? 'rgba(6, 182, 212, 0.2)' : '#ecfeff';
          textColor = isDark ? '#67e8f9' : '#0e7490';
        }
        
        return (
          <React.Fragment key={item.id}>
            <button
              onClick={() => handleItemClick(item)}
              onMouseEnter={() => {
                const idx = enabledItems.findIndex(i => i.id === item.id);
                if (idx !== -1) setSelectedIndex(idx);
              }}
              disabled={item.disabled}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 16px',
                fontSize: 14,
                fontWeight: 500,
                backgroundColor: bgColor,
                color: textColor,
                border: 'none',
                cursor: item.disabled ? 'not-allowed' : 'pointer',
                opacity: item.disabled ? 0.4 : 1,
                textAlign: 'left',
                transition: 'background-color 0.15s',
              }}
              onMouseOver={(e) => {
                if (!item.disabled && !isSelected) {
                  e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#f1f5f9';
                }
              }}
              onMouseOut={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = bgColor;
                }
              }}
            >
              {item.icon && (
                <span style={{ flexShrink: 0, width: 20, height: 20 }}>
                  {item.icon}
                </span>
              )}
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.shortcut && (
                <kbd style={{
                  fontSize: 11,
                  fontFamily: 'monospace',
                  backgroundColor: isDark ? '#475569' : '#f1f5f9',
                  color: isDark ? '#94a3b8' : '#64748b',
                  padding: '2px 6px',
                  borderRadius: 4,
                }}>
                  {item.shortcut}
                </kbd>
              )}
            </button>
            {item.divider && (
              <div style={{
                height: 1,
                backgroundColor: isDark ? '#475569' : '#e2e8f0',
                margin: '6px 12px',
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  ) : null;

  return (
    <>
      <div onContextMenu={handleContextMenu} className={className}>
        {children}
      </div>
      {menuContent && createPortal(menuContent, document.body)}
    </>
  );
};
