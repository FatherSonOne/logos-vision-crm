import React, { useState } from 'react';
import { X, Calendar, User, Clock, Flag, CheckCircle, AlertCircle, ExternalLink, Edit3 } from 'lucide-react';

type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
type TaskStatus = 'new' | 'assigned' | 'in_progress' | 'completed' | 'overdue';

interface TaskData {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assignedToId: string;
  assignedToName: string;
  department: string;
  projectName?: string;
  clientName?: string;
  timeEstimate?: number;
  timeSpent?: number;
  tags?: string[];
  subtasks?: { id: string; title: string; completed: boolean }[];
  comments?: number;
  attachments?: number;
}

interface CalendarTaskModalProps {
  task: TaskData;
  isOpen: boolean;
  onClose: () => void;
  onEditInTasks: (taskId: string) => void;
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
  onPriorityChange?: (taskId: string, newPriority: TaskPriority) => void;
}

const priorityConfig = {
  low: { label: 'Low', color: 'text-slate-600', bgColor: 'bg-slate-100 dark:bg-slate-700/50', icon: '◽' },
  medium: { label: 'Medium', color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-900/30', icon: '🟨' },
  high: { label: 'High', color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900/30', icon: '🟧' },
  critical: { label: 'Critical', color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30', icon: '🟥' },
};

const statusConfig = {
  new: { label: 'New', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  assigned: { label: 'Assigned', color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
  in_progress: { label: 'In Progress', color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
  completed: { label: 'Completed', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  overdue: { label: 'Overdue', color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30' },
};

export const CalendarTaskModal: React.FC<CalendarTaskModalProps> = ({
  task,
  isOpen,
  onClose,
  onEditInTasks,
  onStatusChange,
  onPriorityChange,
}) => {
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [isChangingPriority, setIsChangingPriority] = useState(false);

  if (!isOpen) return null;

  const handleStatusChange = async (newStatus: TaskStatus) => {
    setIsChangingStatus(true);
    onStatusChange?.(task.id, newStatus);
    setTimeout(() => setIsChangingStatus(false), 300);
  };

  const handlePriorityChange = async (newPriority: TaskPriority) => {
    setIsChangingPriority(true);
    onPriorityChange?.(task.id, newPriority);
    setTimeout(() => setIsChangingPriority(false), 300);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysUntilDue = () => {
    const due = new Date(task.dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden pointer-events-auto animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative px-6 py-5 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-4">
              {/* Task Icon */}
              <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${priorityConfig[task.priority].bgColor}`}>
                <span className="text-2xl">{priorityConfig[task.priority].icon}</span>
              </div>

              {/* Title & Meta */}
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {task.title}
                </h2>
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${statusConfig[task.status].bgColor} ${statusConfig[task.status].color}`}>
                    {statusConfig[task.status].label}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${priorityConfig[task.priority].bgColor} ${priorityConfig[task.priority].color}`}>
                    <Flag className="w-3 h-3" />
                    {priorityConfig[task.priority].label}
                  </span>
                  {task.department && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {task.department}
                    </span>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="flex-shrink-0 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-5 max-h-[calc(90vh-200px)] overflow-y-auto">
            {/* Due Date & Assignment */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <Calendar className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Due Date</div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    {formatDate(task.dueDate)}
                  </div>
                  <div className={`text-xs mt-1 ${task.status === 'overdue' ? 'text-red-600' : 'text-slate-500'}`}>
                    {getDaysUntilDue()}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <User className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Assigned To</div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {task.assignedToName}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Team Member</div>
                </div>
              </div>
            </div>

            {/* Description */}
            {task.description && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Description</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                  {task.description}
                </p>
              </div>
            )}

            {/* Project & Client */}
            {(task.projectName || task.clientName) && (
              <div className="mb-6 flex flex-wrap gap-4">
                {task.projectName && (
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Project</div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">
                      {task.projectName}
                    </div>
                  </div>
                )}
                {task.clientName && (
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Client</div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">
                      {task.clientName}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Time Tracking */}
            {(task.timeEstimate || task.timeSpent) && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Time Tracking</h3>
                <div className="flex items-center gap-4">
                  {task.timeEstimate && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Estimate: <span className="font-medium">{task.timeEstimate}h</span>
                      </span>
                    </div>
                  )}
                  {task.timeSpent !== undefined && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Spent: <span className="font-medium">{task.timeSpent}h</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Subtasks */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Subtasks ({completedSubtasks}/{totalSubtasks})
                  </h3>
                  <span className="text-xs text-slate-500">
                    {Math.round(subtaskProgress)}% complete
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-3 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
                    style={{ width: `${subtaskProgress}%` }}
                  />
                </div>

                {/* Subtask List */}
                <div className="space-y-2">
                  {task.subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                        subtask.completed
                          ? 'bg-green-500 text-white'
                          : 'bg-slate-200 dark:bg-slate-700'
                      }`}>
                        {subtask.completed && <CheckCircle className="w-3 h-3" />}
                      </div>
                      <span className={`text-sm ${
                        subtask.completed
                          ? 'text-slate-400 line-through'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Comments & Attachments */}
            {(task.comments || task.attachments) && (
              <div className="flex gap-4 text-sm text-slate-600 dark:text-slate-400">
                {task.comments > 0 && (
                  <span>💬 {task.comments} comment{task.comments !== 1 ? 's' : ''}</span>
                )}
                {task.attachments > 0 && (
                  <span>📎 {task.attachments} attachment{task.attachments !== 1 ? 's' : ''}</span>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center justify-between gap-4">
              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                {/* Status Change */}
                {task.status !== 'completed' && (
                  <button
                    onClick={() => handleStatusChange('completed')}
                    disabled={isChangingStatus}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark Complete
                  </button>
                )}

                {task.status === 'completed' && (
                  <button
                    onClick={() => handleStatusChange('in_progress')}
                    disabled={isChangingStatus}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Reopen
                  </button>
                )}
              </div>

              {/* Edit in Tasks */}
              <button
                onClick={() => onEditInTasks(task.id)}
                className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Edit in Tasks
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

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

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};
