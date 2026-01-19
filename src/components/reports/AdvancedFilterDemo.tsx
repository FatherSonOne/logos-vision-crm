import React, { useState } from 'react';
import { AdvancedFilterBuilder, ReportType } from './AdvancedFilterBuilder';
import type { FilterGroup } from './filterTypes';
import { Filter, Play, Copy, Check } from 'lucide-react';

/**
 * Advanced Filter Builder Demo Page
 *
 * This page demonstrates the visual, low-code advanced filter builder
 * with nested AND/OR logic, templates, and SQL preview.
 */
export function AdvancedFilterDemo() {
  const [selectedReportType, setSelectedReportType] = useState<ReportType>('donors');
  const [currentFilter, setCurrentFilter] = useState<FilterGroup | null>(null);
  const [appliedFilter, setAppliedFilter] = useState<FilterGroup | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleFilterChange = (filter: FilterGroup) => {
    setCurrentFilter(filter);
  };

  const handleApplyFilter = (filter: FilterGroup) => {
    setAppliedFilter(filter);
    setShowResults(true);
    setCurrentFilter(filter);

    // Simulate data fetching
    console.log('Applying filter:', filter);
  };

  const handleCopySql = () => {
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const reportTypeOptions: { value: ReportType; label: string; description: string }[] = [
    {
      value: 'donors',
      label: 'Donor Report',
      description: 'Filter donors by engagement, donations, and contact preferences',
    },
    {
      value: 'projects',
      label: 'Project Report',
      description: 'Filter projects by status, dates, budget, and fundraising goals',
    },
    {
      value: 'donations',
      label: 'Donation Report',
      description: 'Filter donations by amount, campaign, date, and payment method',
    },
    {
      value: 'tasks',
      label: 'Task Report',
      description: 'Filter tasks by status, assignee, due date, and phase',
    },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Filter className="w-8 h-8 text-blue-600" />
                Advanced Filter Builder
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Create powerful filters with nested AND/OR logic, save as templates, and preview generated SQL
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                {[
                  { icon: '🎯', label: 'Visual Interface' },
                  { icon: '🔗', label: 'Nested Logic' },
                  { icon: '💾', label: 'Save Templates' },
                  { icon: '⚡', label: 'SQL Preview' },
                  { icon: '♿', label: 'Accessible' },
                  { icon: '📱', label: 'Keyboard Nav' },
                ].map((feature) => (
                  <div
                    key={feature.label}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium flex items-center gap-2"
                  >
                    <span>{feature.icon}</span>
                    {feature.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Report Type Selector */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportTypeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedReportType(option.value)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedReportType === option.value
                    ? 'border-blue-600 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:shadow'
                }`}
              >
                <h3 className="font-semibold text-gray-900 mb-1">{option.label}</h3>
                <p className="text-xs text-gray-600">{option.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <AdvancedFilterBuilder
            reportType={selectedReportType}
            onChange={handleFilterChange}
            onApply={handleApplyFilter}
          />

          {/* Results Section */}
          {showResults && appliedFilter && (
            <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Play className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Filter Results
                    </h3>
                  </div>
                  <button
                    onClick={handleCopySql}
                    className="px-3 py-1.5 text-sm text-gray-700 hover:bg-white rounded-md transition-colors flex items-center gap-2"
                  >
                    {copiedSql ? (
                      <>
                        <Check className="w-4 h-4 text-green-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy SQL
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  {/* Filter Summary */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Active Filter</h4>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <code className="text-sm text-blue-900">
                        {JSON.stringify(appliedFilter, null, 2)}
                      </code>
                    </div>
                  </div>

                  {/* Sample Results */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Sample Results ({sampleData.length} records found)
                    </h4>
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                      <table className="w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {Object.keys(sampleData[0] || {}).map((key) => (
                              <th
                                key={key}
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                {key.replace(/_/g, ' ')}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {sampleData.map((row, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              {Object.values(row).map((value, cellIdx) => (
                                <td
                                  key={cellIdx}
                                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                >
                                  {formatValue(value)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Features Documentation */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Features</h3>
              <ul className="space-y-3">
                {features.map((feature) => (
                  <li key={feature.title} className="flex items-start gap-3">
                    <span className="text-2xl">{feature.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{feature.title}</h4>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Use</h3>
              <ol className="space-y-3 list-decimal list-inside">
                {steps.map((step, idx) => (
                  <li key={idx} className="text-gray-700">
                    <span className="font-medium">{step.title}</span>
                    <p className="ml-6 text-sm text-gray-600 mt-1">{step.description}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sample data for demonstration
const sampleData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', total_donated: 5000, engagement_level: 'Highly Engaged' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', total_donated: 3500, engagement_level: 'Engaged' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', total_donated: 2000, engagement_level: 'Moderate' },
  { id: 4, name: 'Alice Williams', email: 'alice@example.com', total_donated: 7500, engagement_level: 'Highly Engaged' },
  { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', total_donated: 1200, engagement_level: 'Moderate' },
];

function formatValue(value: any): string {
  if (typeof value === 'number' && value > 1000) {
    return `$${value.toLocaleString()}`;
  }
  return String(value);
}

const features = [
  {
    icon: '🎨',
    title: 'Visual Filter Builder',
    description: 'Drag-and-drop interface for creating complex filters without writing code',
  },
  {
    icon: '🔀',
    title: 'Nested AND/OR Logic',
    description: 'Create sophisticated filter groups up to 3 levels deep with AND/OR operators',
  },
  {
    icon: '🎯',
    title: 'Smart Field Types',
    description: 'Type-aware inputs with appropriate operators for text, numbers, dates, and more',
  },
  {
    icon: '💾',
    title: 'Filter Templates',
    description: 'Save frequently used filters and share them across your organization',
  },
  {
    icon: '⚡',
    title: 'SQL Preview',
    description: 'Real-time SQL generation with syntax highlighting and parameter binding',
  },
  {
    icon: '✅',
    title: 'Validation & Conflicts',
    description: 'Automatic detection of invalid filters and conflicting conditions',
  },
];

const steps = [
  {
    title: 'Select Report Type',
    description: 'Choose the type of data you want to filter (Donors, Projects, Donations, etc.)',
  },
  {
    title: 'Add Filter Conditions',
    description: 'Click "Add Filter" to create conditions with field, operator, and value',
  },
  {
    title: 'Create Filter Groups',
    description: 'Click "Add Group" to create nested groups with independent AND/OR logic',
  },
  {
    title: 'Toggle AND/OR Logic',
    description: 'Switch between AND (all must match) and OR (any can match) for each group',
  },
  {
    title: 'Save as Template',
    description: 'Save your filter configuration for reuse with a name and description',
  },
  {
    title: 'Apply Filter',
    description: 'Click "Apply Filter" to execute the filter and see matching results',
  },
];

export default AdvancedFilterDemo;
