import React, { useState, useEffect } from 'react';
import { FieldMetadata, FieldDataType } from './DraggableField';

// ============================================
// ICONS
// ============================================

const ChevronDownIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const DatabaseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
  </svg>
);

// ============================================
// DATA SOURCE DEFINITIONS
// ============================================

export interface DataSource {
  id: string;
  name: string;
  description: string;
  table: string;
  category: string;
  icon?: string;
  fields: FieldDefinition[];
  sampleData?: Record<string, any>[];
}

export interface FieldDefinition {
  name: string;
  label: string;
  type: FieldDataType;
  description?: string;
  aggregatable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
}

const DATA_SOURCES: DataSource[] = [
  {
    id: 'donations',
    name: 'Donations',
    description: 'Track donation amounts, campaigns, and donor information',
    table: 'donations',
    category: 'Fundraising',
    icon: '💰',
    fields: [
      { name: 'id', label: 'ID', type: 'text', filterable: true },
      { name: 'donor_name', label: 'Donor Name', type: 'text', filterable: true, sortable: true },
      { name: 'donor_email', label: 'Donor Email', type: 'text', filterable: true },
      { name: 'amount', label: 'Amount', type: 'number', aggregatable: true, filterable: true, sortable: true },
      { name: 'donation_date', label: 'Donation Date', type: 'date', filterable: true, sortable: true },
      { name: 'campaign', label: 'Campaign', type: 'text', filterable: true, sortable: true },
      { name: 'payment_method', label: 'Payment Method', type: 'text', filterable: true },
      { name: 'is_recurring', label: 'Is Recurring', type: 'boolean', filterable: true },
      { name: 'client_id', label: 'Client ID', type: 'text', filterable: true },
    ],
    sampleData: [
      { donor_name: 'John Smith', amount: 100, donation_date: '2024-01-15', campaign: 'Annual Fund' },
      { donor_name: 'Jane Doe', amount: 250, donation_date: '2024-01-20', campaign: 'Building Fund' },
    ],
  },
  {
    id: 'clients',
    name: 'Clients/Contacts',
    description: 'Client demographics, locations, and engagement data',
    table: 'clients',
    category: 'CRM',
    icon: '👥',
    fields: [
      { name: 'id', label: 'ID', type: 'text', filterable: true },
      { name: 'name', label: 'Name', type: 'text', filterable: true, sortable: true },
      { name: 'contact_person', label: 'Contact Person', type: 'text', filterable: true },
      { name: 'email', label: 'Email', type: 'text', filterable: true },
      { name: 'phone', label: 'Phone', type: 'text', filterable: true },
      { name: 'location', label: 'Location', type: 'text', filterable: true, sortable: true },
      { name: 'organization', label: 'Organization', type: 'text', filterable: true },
      { name: 'created_at', label: 'Created Date', type: 'date', filterable: true, sortable: true },
    ],
  },
  {
    id: 'projects',
    name: 'Projects',
    description: 'Project progress, status, and task completion',
    table: 'projects',
    category: 'Project Management',
    icon: '📊',
    fields: [
      { name: 'id', label: 'ID', type: 'text', filterable: true },
      { name: 'name', label: 'Project Name', type: 'text', filterable: true, sortable: true },
      { name: 'status', label: 'Status', type: 'text', filterable: true, sortable: true },
      { name: 'start_date', label: 'Start Date', type: 'date', filterable: true, sortable: true },
      { name: 'end_date', label: 'End Date', type: 'date', filterable: true, sortable: true },
      { name: 'budget', label: 'Budget', type: 'number', aggregatable: true, filterable: true, sortable: true },
      { name: 'budget_spent', label: 'Budget Spent', type: 'number', aggregatable: true, filterable: true },
      { name: 'client_id', label: 'Client ID', type: 'text', filterable: true },
    ],
  },
  {
    id: 'tasks',
    name: 'Tasks',
    description: 'Task assignments, due dates, and completion rates',
    table: 'tasks',
    category: 'Project Management',
    icon: '✅',
    fields: [
      { name: 'id', label: 'ID', type: 'text', filterable: true },
      { name: 'description', label: 'Description', type: 'text', filterable: true },
      { name: 'status', label: 'Status', type: 'text', filterable: true, sortable: true },
      { name: 'due_date', label: 'Due Date', type: 'date', filterable: true, sortable: true },
      { name: 'team_member_id', label: 'Assigned To', type: 'text', filterable: true },
      { name: 'project_id', label: 'Project ID', type: 'text', filterable: true },
      { name: 'created_at', label: 'Created Date', type: 'date', filterable: true, sortable: true },
    ],
  },
  {
    id: 'cases',
    name: 'Cases',
    description: 'Case management, resolution times, and priorities',
    table: 'cases',
    category: 'Case Management',
    icon: '📋',
    fields: [
      { name: 'id', label: 'ID', type: 'text', filterable: true },
      { name: 'title', label: 'Title', type: 'text', filterable: true, sortable: true },
      { name: 'status', label: 'Status', type: 'text', filterable: true, sortable: true },
      { name: 'priority', label: 'Priority', type: 'text', filterable: true, sortable: true },
      { name: 'created_at', label: 'Created Date', type: 'date', filterable: true, sortable: true },
      { name: 'assigned_to_id', label: 'Assigned To', type: 'text', filterable: true },
      { name: 'client_id', label: 'Client ID', type: 'text', filterable: true },
    ],
  },
  {
    id: 'activities',
    name: 'Activities',
    description: 'Activity logs, meeting notes, and communications',
    table: 'activities',
    category: 'CRM',
    icon: '📅',
    fields: [
      { name: 'id', label: 'ID', type: 'text', filterable: true },
      { name: 'type', label: 'Activity Type', type: 'text', filterable: true, sortable: true },
      { name: 'title', label: 'Title', type: 'text', filterable: true },
      { name: 'activity_date', label: 'Activity Date', type: 'date', filterable: true, sortable: true },
      { name: 'client_id', label: 'Client ID', type: 'text', filterable: true },
      { name: 'created_by_id', label: 'Created By', type: 'text', filterable: true },
    ],
  },
  {
    id: 'volunteers',
    name: 'Volunteers',
    description: 'Volunteer hours, skills, and assignments',
    table: 'volunteers',
    category: 'Volunteer Management',
    icon: '🤝',
    fields: [
      { name: 'id', label: 'ID', type: 'text', filterable: true },
      { name: 'name', label: 'Name', type: 'text', filterable: true, sortable: true },
      { name: 'email', label: 'Email', type: 'text', filterable: true },
      { name: 'phone', label: 'Phone', type: 'text', filterable: true },
      { name: 'location', label: 'Location', type: 'text', filterable: true, sortable: true },
      { name: 'availability', label: 'Availability', type: 'text', filterable: true },
    ],
  },
  {
    id: 'engagement_scores',
    name: 'Engagement Scores',
    description: 'Donor engagement levels and scoring',
    table: 'engagement_scores',
    category: 'Analytics',
    icon: '📈',
    fields: [
      { name: 'client_id', label: 'Client ID', type: 'text', filterable: true },
      { name: 'overall_score', label: 'Overall Score', type: 'number', aggregatable: true, filterable: true, sortable: true },
      { name: 'engagement_level', label: 'Engagement Level', type: 'text', filterable: true, sortable: true },
      { name: 'calculated_at', label: 'Calculated Date', type: 'date', filterable: true, sortable: true },
    ],
  },
];

// ============================================
// COMPONENT
// ============================================

interface DataSourceSelectorProps {
  selectedSourceId: string | null;
  onSourceChange: (sourceId: string, fields: FieldMetadata[]) => void;
}

export const DataSourceSelector: React.FC<DataSourceSelectorProps> = ({
  selectedSourceId,
  onSourceChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<DataSource | null>(null);

  useEffect(() => {
    if (selectedSourceId) {
      const source = DATA_SOURCES.find(ds => ds.id === selectedSourceId);
      setSelectedSource(source || null);
    }
  }, [selectedSourceId]);

  const handleSourceSelect = (source: DataSource) => {
    setSelectedSource(source);
    setIsOpen(false);

    const fields: FieldMetadata[] = source.fields.map((field) => ({
      id: `${source.id}.${field.name}`,
      name: field.name,
      label: field.label,
      dataType: field.type,
      isNumeric: field.type === 'number',
      isDate: field.type === 'date',
      isCategorical: field.type === 'text' || field.type === 'boolean',
      aggregation: 'none',
    }));

    onSourceChange(source.id, fields);
  };

  // Group sources by category
  const groupedSources = DATA_SOURCES.reduce((acc, source) => {
    if (!acc[source.category]) {
      acc[source.category] = [];
    }
    acc[source.category].push(source);
    return acc;
  }, {} as Record<string, DataSource[]>);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Data Source
        </label>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors"
          >
            <div className="flex items-center gap-3">
              {selectedSource ? (
                <>
                  <span className="text-2xl">{selectedSource.icon}</span>
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {selectedSource.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedSource.fields.length} fields available
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <DatabaseIcon />
                  <span className="text-gray-500 dark:text-gray-400">Select a data source...</span>
                </>
              )}
            </div>
            <ChevronDownIcon />
          </button>

          {isOpen && (
            <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto">
              {Object.entries(groupedSources).map(([category, sources]) => (
                <div key={category} className="p-2">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {category}
                  </div>
                  {sources.map((source) => (
                    <button
                      key={source.id}
                      onClick={() => handleSourceSelect(source)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                        selectedSource?.id === source.id
                          ? 'bg-indigo-50 dark:bg-indigo-900/30'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <span className="text-2xl">{source.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {source.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {source.description}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {source.fields.length} fields
                      </div>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedSource && (
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Available Fields ({selectedSource.fields.length})
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {selectedSource.fields.map((field) => (
              <div
                key={field.name}
                className="flex items-center gap-2 text-xs p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
              >
                <span className={`px-1.5 py-0.5 rounded font-medium ${
                  field.type === 'text' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                  field.type === 'number' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  field.type === 'date' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                }`}>
                  {field.type.charAt(0).toUpperCase()}
                </span>
                <span className="text-gray-900 dark:text-white truncate">{field.label}</span>
              </div>
            ))}
          </div>

          {selectedSource.sampleData && selectedSource.sampleData.length > 0 && (
            <div className="mt-4">
              <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sample Data
              </h5>
              <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      {Object.keys(selectedSource.sampleData[0]).map((key) => (
                        <th key={key} className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {selectedSource.sampleData.slice(0, 3).map((row, idx) => (
                      <tr key={idx}>
                        {Object.values(row).map((value, vidx) => (
                          <td key={vidx} className="px-3 py-2 text-xs text-gray-900 dark:text-white">
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DataSourceSelector;
export { DATA_SOURCES };
