
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Plus } from 'lucide-react';

// ============================================
// TYPES
// ============================================

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}

// ============================================
// QUICK ADD FLOATING BUTTON
// ============================================

interface QuickAddButtonProps {
  actions: QuickAction[];
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  id?: string;
}

// Calculate position for each action item - straight vertical stack
const getSpiralPosition = (index: number, total: number, isOpen: boolean, isClosing: boolean) => {
  if (!isOpen && !isClosing) {
    return { x: 0, y: 0, scale: 0, opacity: 0 };
  }

  if (isClosing) {
    // Collapse downward into each other and fade out
    // All items collapse toward the FAB position
    return { x: 0, y: 0, scale: 0.5, opacity: 0 };
  }

  // Opening: Straight vertical stack going UP from the FAB button
  const baseDistance = 70; // Distance from FAB to first item
  const itemSpacing = 60; // Space between each item

  const y = baseDistance + (index * itemSpacing);

  return { x: 0, y, scale: 1, opacity: 1 };
};

export const QuickAddButton: React.FC<QuickAddButtonProps> = ({
  actions,
  position = 'bottom-right',
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle closing with animation
  const handleClose = () => {
    setIsClosing(true);
    // Wait for collapse animation to complete before fully closing
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 250); // Animation duration
  };

  const handleToggle = () => {
    if (isOpen) {
      handleClose();
    } else {
      setIsOpen(true);
    }
  };

  // Keyboard Shortcut + Click outside to close
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen && !isClosing) {
          handleClose();
        } else if (!isOpen) {
          setIsOpen(true);
        }
      }
      if (e.key === 'Escape' && isOpen && !isClosing) {
        e.preventDefault();
        handleClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && !isClosing && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    if (isOpen && !isClosing) {
      // Delay adding click listener to prevent immediate close
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 0);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen, isClosing]);

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6 lg:bottom-6 lg:right-6',
    'bottom-left': 'bottom-6 left-6 lg:bottom-6 lg:left-6',
    'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
  };

  return (
    <div
      ref={containerRef}
      id={id}
      className={`fixed ${positionClasses[position]} z-40 pb-safe`}
    >
      {/* Action Items - Vertical Stack */}
      <div className="relative z-40">
        {actions.map((action, index) => {
          const pos = getSpiralPosition(index, actions.length, isOpen, isClosing);
          // Opening: stagger from bottom to top (first item appears first)
          // Closing: stagger from top to bottom (top items collapse first, creating cascade effect)
          const delay = isClosing
            ? (actions.length - index - 1) * 40  // Top items collapse first
            : index * 50;  // Bottom items appear first when opening

          return (
            <div
              key={action.id}
              className={`absolute transition-all ease-out ${
                isClosing ? 'duration-200' : 'duration-300'
              }`}
              style={{
                // Center the 48px icon button over the 64px FAB (offset by 8px)
                bottom: 8,
                right: 8,
                transform: `translateY(${-pos.y}px) scale(${pos.scale})`,
                opacity: pos.opacity,
                transitionDelay: `${delay}ms`,
                pointerEvents: isOpen && !isClosing ? 'auto' : 'none',
              }}
            >
              <button
                onClick={() => {
                  console.log('Quick action used:', action.id);
                  action.onClick();
                  handleClose();
                }}
                className="group flex items-center gap-2 whitespace-nowrap"
                tabIndex={isOpen && !isClosing ? 0 : -1}
              >
                {/* Icon button */}
                <div
                  className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 ${action.color}`}
                >
                  {action.icon}
                </div>

                {/* Label tooltip - appears on hover, to the left of icon */}
                <span className="absolute right-full mr-3 px-3 py-1.5 bg-slate-900 dark:bg-slate-700 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                  {action.label}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Main Button */}
      <button
        onClick={handleToggle}
        disabled={isClosing}
        className={`group relative z-50 w-16 h-16 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-full shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-110 ${
          isOpen && !isClosing ? 'rotate-45' : ''
        }`}
        aria-label={isOpen ? "Close quick actions" : "Open quick actions"}
        aria-expanded={isOpen}
      >
        <Plus className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-300" />

        {!isOpen && <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 animate-ping opacity-30" />}

        {!isOpen && (
          <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900/90 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Quick Actions
          </span>
        )}
      </button>
    </div>
  );
};
