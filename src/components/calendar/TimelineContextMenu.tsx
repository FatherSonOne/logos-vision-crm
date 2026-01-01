import React, { useEffect, useRef } from 'react';
import { X, MapPin, FolderOpen, ClipboardList, Target, Phone, PartyPopper, Trophy, Clock, FileText, AlertCircle } from 'lucide-react';
import { EventType } from './EventTypeIndicator';

interface TimelineContextMenuProps {
  x: number;
  y: number;
  date: Date;
  onClose: () => void;
  onCreatePin: (date: Date) => void;
  onCreateEvent: (type: EventType, date: Date) => void;
}

export const TimelineContextMenu: React.FC<TimelineContextMenuProps> = ({
  x,
  y,
  date,
  onClose,
  onCreatePin,
  onCreateEvent,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Close menu on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const menuItems = [
    {
      icon: MapPin,
      label: 'Drop Pin Marker',
      color: 'text-pink-600 dark:text-pink-400',
      hoverColor: 'hover:bg-pink-50 dark:hover:bg-pink-900/20',
      action: () => {
        onCreatePin(date);
        onClose();
      },
    },
    { separator: true },
    {
      icon: FolderOpen,
      label: 'Create Project',
      color: 'text-blue-600 dark:text-blue-400',
      hoverColor: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
      action: () => {
        onCreateEvent('project', date);
        onClose();
      },
    },
    {
      icon: ClipboardList,
      label: 'Create Activity',
      color: 'text-orange-600 dark:text-orange-400',
      hoverColor: 'hover:bg-orange-50 dark:hover:bg-orange-900/20',
      action: () => {
        onCreateEvent('activity', date);
        onClose();
      },
    },
    {
      icon: Target,
      label: 'Schedule Meeting',
      color: 'text-pink-600 dark:text-pink-400',
      hoverColor: 'hover:bg-pink-50 dark:hover:bg-pink-900/20',
      action: () => {
        onCreateEvent('meeting', date);
        onClose();
      },
    },
    {
      icon: Phone,
      label: 'Schedule Phone Call',
      color: 'text-purple-600 dark:text-purple-400',
      hoverColor: 'hover:bg-purple-50 dark:hover:bg-purple-900/20',
      action: () => {
        onCreateEvent('call', date);
        onClose();
      },
    },
    {
      icon: PartyPopper,
      label: 'Create Event',
      color: 'text-teal-600 dark:text-teal-400',
      hoverColor: 'hover:bg-teal-50 dark:hover:bg-teal-900/20',
      action: () => {
        onCreateEvent('event', date);
        onClose();
      },
    },
    {
      icon: Trophy,
      label: 'Set Milestone',
      color: 'text-amber-600 dark:text-amber-400',
      hoverColor: 'hover:bg-amber-50 dark:hover:bg-amber-900/20',
      action: () => {
        onCreateEvent('milestone', date);
        onClose();
      },
    },
    {
      icon: Clock,
      label: 'Set Deadline',
      color: 'text-amber-600 dark:text-amber-400',
      hoverColor: 'hover:bg-amber-50 dark:hover:bg-amber-900/20',
      action: () => {
        onCreateEvent('deadline', date);
        onClose();
      },
    },
    {
      icon: FileText,
      label: 'Add Note/Reminder',
      color: 'text-gray-600 dark:text-gray-400',
      hoverColor: 'hover:bg-gray-50 dark:hover:bg-gray-900/20',
      action: () => {
        onCreateEvent('note', date);
        onClose();
      },
    },
    {
      icon: AlertCircle,
      label: 'Mark as Urgent',
      color: 'text-red-600 dark:text-red-400',
      hoverColor: 'hover:bg-red-50 dark:hover:bg-red-900/20',
      action: () => {
        onCreateEvent('urgent', date);
        onClose();
      },
    },
  ];

  // Adjust position if menu would go off-screen
  // More robust positioning that handles all edge cases
  const menuWidth = 280;
  const menuHeight = 420; // Slightly increased for new items
  const padding = 10; // Padding from screen edges

  // Calculate adjusted X position
  let adjustedX = x;
  if (x + menuWidth > window.innerWidth - padding) {
    // Menu would overflow right - position to the left of cursor
    adjustedX = Math.max(padding, x - menuWidth);
  }

  // Calculate adjusted Y position
  let adjustedY = y;
  if (y + menuHeight > window.innerHeight - padding) {
    // Menu would overflow bottom - position above cursor or fit in remaining space
    const spaceBelow = window.innerHeight - y - padding;
    const spaceAbove = y - padding;

    if (spaceAbove > spaceBelow) {
      // More space above - position menu above cursor
      adjustedY = Math.max(padding, y - menuHeight);
    } else {
      // More space below - keep below but constrain
      adjustedY = window.innerHeight - menuHeight - padding;
    }
  }

  // Ensure minimum distances from edges
  adjustedX = Math.max(padding, Math.min(adjustedX, window.innerWidth - menuWidth - padding));
  adjustedY = Math.max(padding, Math.min(adjustedY, window.innerHeight - menuHeight - padding));

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-pop-in"
      style={{
        left: `${adjustedX}px`,
        top: `${adjustedY}px`,
        width: `${menuWidth}px`,
      }}
    >
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span className="font-semibold text-sm">
            {date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Menu Items */}
      <div className="py-2 max-h-96 overflow-y-auto">
        {menuItems.map((item, index) => {
          if ('separator' in item) {
            return (
              <div
                key={`separator-${index}`}
                className="my-2 mx-4 border-t border-gray-200 dark:border-gray-700"
              />
            );
          }

          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={item.action}
              className={`
                w-full px-4 py-3 flex items-center gap-3
                ${item.hoverColor}
                transition-colors text-left
                text-gray-900 dark:text-gray-100
              `}
            >
              <Icon className={`w-5 h-5 ${item.color}`} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
