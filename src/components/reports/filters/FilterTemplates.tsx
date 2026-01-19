import React, { useState } from 'react';
import { Save, FolderOpen, Star, Users, Edit2, Trash2, Check, X } from 'lucide-react';
import type { FilterTemplate, FilterGroup } from '../filterTypes';

interface FilterTemplatesProps {
  templates: FilterTemplate[];
  onApply: (template: FilterTemplate) => void;
  onSave: (name: string, description: string, category: 'common' | 'custom' | 'shared') => void;
  onEdit: (templateId: string, name: string, description: string) => void;
  onDelete: (templateId: string) => void;
  currentFilter?: FilterGroup;
}

export function FilterTemplates({
  templates,
  onApply,
  onSave,
  onEdit,
  onDelete,
  currentFilter,
}: FilterTemplatesProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [saveCategory, setSaveCategory] = useState<'common' | 'custom' | 'shared'>('custom');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'common' | 'custom' | 'shared'>('all');

  const filteredTemplates = templates.filter(t =>
    selectedCategory === 'all' || t.category === selectedCategory
  );

  const handleSave = () => {
    if (!saveName.trim()) return;
    onSave(saveName, saveDescription, saveCategory);
    setSaveName('');
    setSaveDescription('');
    setSaveCategory('custom');
    setShowSaveDialog(false);
  };

  const handleEdit = (template: FilterTemplate) => {
    if (editingId === template.id) {
      onEdit(template.id, editName, editDescription);
      setEditingId(null);
    } else {
      setEditingId(template.id);
      setEditName(template.name);
      setEditDescription(template.description || '');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditDescription('');
  };

  // Quick filter presets
  const quickFilters: FilterTemplate[] = [
    {
      id: 'quick-active',
      name: 'Active Only',
      description: 'Show only active records',
      category: 'common',
      createdAt: new Date().toISOString(),
      filter: {
        id: 'root',
        logic: 'AND',
        conditions: [{
          id: 'c1',
          fieldId: 'is_active',
          operator: 'is_true',
          value: true,
        }],
        groups: [],
      },
    },
    {
      id: 'quick-last-30',
      name: 'Last 30 Days',
      description: 'Records from the last 30 days',
      category: 'common',
      createdAt: new Date().toISOString(),
      filter: {
        id: 'root',
        logic: 'AND',
        conditions: [{
          id: 'c1',
          fieldId: 'created_at',
          operator: 'last_30_days',
          value: undefined,
        }],
        groups: [],
      },
    },
    {
      id: 'quick-high-value',
      name: 'High Value',
      description: 'Donations over $1,000',
      category: 'common',
      createdAt: new Date().toISOString(),
      filter: {
        id: 'root',
        logic: 'AND',
        conditions: [{
          id: 'c1',
          fieldId: 'amount',
          operator: 'greater_than_or_equal',
          value: 1000,
        }],
        groups: [],
      },
    },
    {
      id: 'quick-engaged',
      name: 'Highly Engaged',
      description: 'Highly engaged donors',
      category: 'common',
      createdAt: new Date().toISOString(),
      filter: {
        id: 'root',
        logic: 'AND',
        conditions: [{
          id: 'c1',
          fieldId: 'engagement_level',
          operator: 'equals',
          value: 'Highly Engaged',
        }],
        groups: [],
      },
    },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'common':
        return <Star className="w-4 h-4" />;
      case 'shared':
        return <Users className="w-4 h-4" />;
      default:
        return <FolderOpen className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'common':
        return 'text-yellow-600 bg-yellow-50';
      case 'shared':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Filter Templates</h3>
          <button
            onClick={() => setShowSaveDialog(true)}
            disabled={!currentFilter}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Current Filter
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2">
          {(['all', 'common', 'custom', 'shared'] as const).map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Filters */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Filters</h4>
        <div className="grid grid-cols-2 gap-2">
          {quickFilters.map(template => (
            <button
              key={template.id}
              onClick={() => onApply(template)}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-md hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
            >
              <Star className="w-4 h-4 text-yellow-500" />
              <div>
                <div className="text-sm font-medium text-gray-900">{template.name}</div>
                <div className="text-xs text-gray-500">{template.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Saved Templates */}
      <div className="p-4">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FolderOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No saved templates yet</p>
            <p className="text-xs mt-1">Create filters and save them as templates</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                className="group border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                {editingId === template.id ? (
                  <div className="p-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded mb-2 text-sm"
                      placeholder="Template name"
                    />
                    <input
                      type="text"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded mb-2 text-sm"
                      placeholder="Description (optional)"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={handleCancelEdit}
                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(template)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3">
                    <button
                      onClick={() => onApply(template)}
                      className="flex-1 flex items-start gap-2 text-left"
                    >
                      <div className={`p-1.5 rounded ${getCategoryColor(template.category)}`}>
                        {getCategoryIcon(template.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {template.name}
                        </div>
                        {template.description && (
                          <div className="text-xs text-gray-500 truncate">
                            {template.description}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(template.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </button>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(template)}
                        className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit template"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(template.id)}
                        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Delete template"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Save Filter Template
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., High-Value Donors"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={saveDescription}
                    onChange={(e) => setSaveDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Optional description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={saveCategory}
                    onChange={(e) => setSaveCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="custom">My Templates</option>
                    <option value="shared">Shared Templates</option>
                    <option value="common">Common Templates</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!saveName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Save Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
