import React, { useEffect, useRef } from 'react';
import { CheckCircle, Edit3, Trash2, Flag, Clock, User, Copy } from 'lucide-react';

type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
type TaskStatus = 'new' | 'assigned' | 'in_progress' | 'completed' | 'overdue';

interface TaskContextMenuProps {
  position: { x: number; y: number };
  taskId: string;
  taskTitle: string;
  currentStatus: TaskStatus;
  currentPriority: TaskPriority;
  onClose: () => void;
  onMarkComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onChangePriority: (priority: TaskPriority) => void;
  onChangeStatus: (status: TaskStatus) => void;
  onDuplicate?: () => void;
}

const priorityOptions: { value: TaskPriority; label: string; icon: string; color: string }[] = [
  { value: 'low', label: 'Low', icon: '◽', color: 'text-slate-600' },
  { value: 'medium', label: 'Medium', icon: '🟨', color: 'text-amber-600' },
  { value: 'high', label: 'High', icon: '🟧', color: 'text-orange-600' },
  { value: 'critical', label: 'Critical', icon: '🟥', color: 'text-red-600' },
];

const statusOptions: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'new', label: 'New', color: 'text-blue-600' },
  { value: 'assigned', label: 'Assigned', color: 'text-purple-600' },
  { value: 'in_progress', label: 'In Progress', color: 'text-amber-600' },
  { value: 'completed', label: 'Completed', color: 'text-green-600' },
];

export const TaskContextMenu: React.FC<TaskContextMenuProps> = ({
  position,
  taskId,
  taskTitle,
  currentStatus,
  currentPriority,
  onClose,
  onMarkComplete,
  onEdit,
  onDelete,
  onChangePriority,
  onChangeStatus,
  onDuplicate,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [showPrioritySubmenu, setShowPrioritySubmenu] = React.useState(false);
  const [showStatusSubmenu, setShowStatusSubmenu] = React.useState(false);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Adjust position to keep menu in viewport
  const adjustedPosition = React.useMemo(() => {
    const menuWidth = 240;
    const menuHeight = 400;
    let x = position.x;
    let y = position.y;

    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - 10;
    }

    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - 10;
    }

    return { x, y };
  }, [position]);

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Context Menu */}
      <div
        ref={menuRef}
        className="fixed z-50 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 py-2 min-w-[240px] animate-scale-in"
        style={{
          left: `${adjustedPosition.x}px`,
          top: `${adjustedPosition.y}px`,
        }}
      >
        {/* Task Title */}
        <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
            {taskTitle}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Task Actions</p>
        </div>

        {/* Quick Actions */}
        <div className="py-1">
          {currentStatus !== 'completed' && (
            <button
              onClick={() => handleAction(onMarkComplete)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3 text-slate-700 dark:text-slate-300"
            >
              <CheckCircle className="w-4 h-4 text-green-600" />
              Mark Complete
            </button>
          )}

          <button
            onClick={() => handleAction(onEdit)}
            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3 text-slate-700 dark:text-slate-300"
          >
            <Edit3 className="w-4 h-4 text-blue-600" />
            Edit Task
          </button>

          {onDuplicate && (
            <button
              onClick={() => handleAction(onDuplicate)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3 text-slate-700 dark:text-slate-300"
            >
              <Copy className="w-4 h-4 text-purple-600" />
              Duplicate Task
            </button>
          )}
        </div>

        {/* Status Submenu */}
        <div className="border-t border-slate-200 dark:border-slate-700 py-1">
          <div
            className="relative"
            onMouseEnter={() => setShowStatusSubmenu(true)}
            onMouseLeave={() => setShowStatusSubmenu(false)}
          >
            <button className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <Clock className="w-4 h-4" />
              Change Status
              <span className="ml-auto text-xs">›</span>
            </button>

            {showStatusSubmenu && (
              <div className="absolute left-full top-0 ml-1 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 py-1 min-w-[180px] z-50">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      handleAction(() => onChangeStatus(option.value));
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3 ${
                      currentStatus === option.value ? 'bg-slate-50 dark:bg-slate-700/50' : ''
                    }`}
                  >
                    <span className={`font-medium ${option.color}`}>{option.label}</span>
                    {currentStatus === option.value && (
                      <CheckCircle className="w-3 h-3 ml-auto text-green-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Priority Submenu */}
        <div className="border-t border-slate-200 dark:border-slate-700 py-1">
          <div
            className="relative"
            onMouseEnter={() => setShowPrioritySubmenu(true)}
            onMouseLeave={() => setShowPrioritySubmenu(false)}
          >
            <button className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <Flag className="w-4 h-4" />
              Change Priority
              <span className="ml-auto text-xs">›</span>
            </button>

            {showPrioritySubmenu && (
              <div className="absolute left-full top-0 ml-1 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 py-1 min-w-[180px] z-50">
                {priorityOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      handleAction(() => onChangePriority(option.value));
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3 ${
                      currentPriority === option.value ? 'bg-slate-50 dark:bg-slate-700/50' : ''
                    }`}
                  >
                    <span className="text-lg">{option.icon}</span>
                    <span className={`font-medium ${option.color}`}>{option.label}</span>
                    {currentPriority === option.value && (
                      <CheckCircle className="w-3 h-3 ml-auto text-green-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Delete */}
        <div className="border-t border-slate-200 dark:border-slate-700 py-1">
          <button
            onClick={() => handleAction(onDelete)}
            className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 text-red-600"
          >
            <Trash2 className="w-4 h-4" />
            Delete Task
          </button>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
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
          animation: scale-in 0.15s ease-out;
        }
      `}</style>
    </>
  );
};
