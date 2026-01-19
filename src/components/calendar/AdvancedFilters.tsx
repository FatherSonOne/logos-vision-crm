import React, { useState } from 'react';
import { Filter, X, Save, Trash2, Search, Calendar, Flag, User, Tag } from 'lucide-react';

type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
type TaskStatus = 'new' | 'assigned' | 'in_progress' | 'completed' | 'overdue';

interface FilterPreset {
  id: string;
  name: string;
  filters: FilterState;
}

interface FilterState {
  search: string;
  status: TaskStatus[];
  priority: TaskPriority[];
  dateRange: 'all' | 'today' | 'thisWeek' | 'thisMonth' | 'overdue' | 'upcoming';
  assignee: string[];
  tags: string[];
}

interface AdvancedFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableAssignees: { id: string; name: string }[];
  availableTags: string[];
}

const statusOptions: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'new', label: 'New', color: 'blue' },
  { value: 'assigned', label: 'Assigned', color: 'purple' },
  { value: 'in_progress', label: 'In Progress', color: 'amber' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'overdue', label: 'Overdue', color: 'red' },
];

const priorityOptions: { value: TaskPriority; label: string; icon: string; color: string }[] = [
  { value: 'low', label: 'Low', icon: '◽', color: 'slate' },
  { value: 'medium', label: 'Medium', icon: '🟨', color: 'amber' },
  { value: 'high', label: 'High', icon: '🟧', color: 'orange' },
  { value: 'critical', label: 'Critical', icon: '🟥', color: 'red' },
];

const dateRangeOptions = [
  { value: 'all' as const, label: 'All Time', icon: Calendar },
  { value: 'today' as const, label: 'Today', icon: Calendar },
  { value: 'thisWeek' as const, label: 'This Week', icon: Calendar },
  { value: 'thisMonth' as const, label: 'This Month', icon: Calendar },
  { value: 'overdue' as const, label: 'Overdue', icon: Calendar },
  { value: 'upcoming' as const, label: 'Upcoming (7 days)', icon: Calendar },
];

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  availableAssignees,
  availableTags,
}) => {
  const [presets, setPresets] = useState<FilterPreset[]>([
    {
      id: 'urgent',
      name: 'Urgent Tasks',
      filters: {
        search: '',
        status: ['new', 'in_progress'],
        priority: ['critical', 'high'],
        dateRange: 'all',
        assignee: [],
        tags: [],
      },
    },
    {
      id: 'my-week',
      name: 'My Week',
      filters: {
        search: '',
        status: ['new', 'assigned', 'in_progress'],
        priority: [],
        dateRange: 'thisWeek',
        assignee: [],
        tags: [],
      },
    },
  ]);

  const [showSavePreset, setShowSavePreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  if (!isOpen) return null;

  const handleToggleStatus = (status: TaskStatus) => {
    const newStatuses = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    onFiltersChange({ ...filters, status: newStatuses });
  };

  const handleTogglePriority = (priority: TaskPriority) => {
    const newPriorities = filters.priority.includes(priority)
      ? filters.priority.filter(p => p !== priority)
      : [...filters.priority, priority];
    onFiltersChange({ ...filters, priority: newPriorities });
  };

  const handleToggleAssignee = (assigneeId: string) => {
    const newAssignees = filters.assignee.includes(assigneeId)
      ? filters.assignee.filter(a => a !== assigneeId)
      : [...filters.assignee, assigneeId];
    onFiltersChange({ ...filters, assignee: newAssignees });
  };

  const handleToggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    onFiltersChange({ ...filters, tags: newTags });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      search: '',
      status: [],
      priority: [],
      dateRange: 'all',
      assignee: [],
      tags: [],
    });
  };

  const handleLoadPreset = (preset: FilterPreset) => {
    onFiltersChange(preset.filters);
  };

  const handleSavePreset = () => {
    if (!newPresetName.trim()) return;
    const newPreset: FilterPreset = {
      id: Date.now().toString(),
      name: newPresetName,
      filters: { ...filters },
    };
    setPresets([...presets, newPreset]);
    setNewPresetName('');
    setShowSavePreset(false);
  };

  const handleDeletePreset = (presetId: string) => {
    setPresets(presets.filter(p => p.id !== presetId));
  };

  const activeFiltersCount =
    (filters.status.length > 0 ? 1 : 0) +
    (filters.priority.length > 0 ? 1 : 0) +
    (filters.dateRange !== 'all' ? 1 : 0) +
    (filters.assignee.length > 0 ? 1 : 0) +
    (filters.tags.length > 0 ? 1 : 0) +
    (filters.search.trim() ? 1 : 0);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Filter Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl overflow-hidden animate-slide-in-right">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Filter className="w-6 h-6" />
              <div>
                <h2 className="text-2xl font-bold">Advanced Filters</h2>
                <p className="text-sm text-white/80 mt-0.5">
                  {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="h-[calc(100vh-120px)] overflow-y-auto p-6 space-y-6">
          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearFilters}
              className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
            <button
              onClick={() => setShowSavePreset(true)}
              className="flex-1 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Preset
            </button>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search Tasks
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              placeholder="Search by title, description..."
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              {dateRangeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onFiltersChange({ ...filters, dateRange: option.value })}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    filters.dateRange === option.value
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => {
                const isSelected = filters.status.includes(option.value);
                return (
                  <button
                    key={option.value}
                    onClick={() => handleToggleStatus(option.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      isSelected
                        ? `bg-${option.color}-500 text-white shadow-md`
                        : `bg-${option.color}-100 dark:bg-${option.color}-900/30 text-${option.color}-700 dark:text-${option.color}-300 hover:bg-${option.color}-200 dark:hover:bg-${option.color}-900/50`
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Flag className="w-4 h-4" />
              Priority
            </label>
            <div className="grid grid-cols-2 gap-2">
              {priorityOptions.map((option) => {
                const isSelected = filters.priority.includes(option.value);
                return (
                  <button
                    key={option.value}
                    onClick={() => handleTogglePriority(option.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span className="text-base">{option.icon}</span>
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assignee */}
          {availableAssignees.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Assigned To
              </label>
              <div className="space-y-2">
                {availableAssignees.map((assignee) => {
                  const isSelected = filters.assignee.includes(assignee.id);
                  return (
                    <button
                      key={assignee.id}
                      onClick={() => handleToggleAssignee(assignee.id)}
                      className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {assignee.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tags */}
          {availableTags.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const isSelected = filters.tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => handleToggleTag(tag)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Saved Presets */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Saved Presets
            </label>
            <div className="space-y-2">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg"
                >
                  <button
                    onClick={() => handleLoadPreset(preset)}
                    className="flex-1 text-left text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                  >
                    {preset.name}
                  </button>
                  <button
                    onClick={() => handleDeletePreset(preset.id)}
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Save Preset Modal */}
          {showSavePreset && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-sm w-full">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                  Save Filter Preset
                </h3>
                <input
                  type="text"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="Preset name..."
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent mb-4"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSavePreset();
                  }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowSavePreset(false)}
                    className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePreset}
                    disabled={!newPresetName.trim()}
                    className="flex-1 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </>
  );
};
