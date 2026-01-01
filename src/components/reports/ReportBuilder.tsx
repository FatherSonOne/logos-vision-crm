import React, { useState, useEffect } from 'react';
import { Report, reportService, ReportCategory, VisualizationType } from '../../services/reportService';

// ============================================
// ICONS
// ============================================

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

// ============================================
// TYPES
// ============================================

interface ReportBuilderProps {
  report?: Report | null;
  onSave: (report: Partial<Report>) => void;
  onCancel: () => void;
}

type Step = 'source' | 'visualization' | 'filters' | 'preview';

interface DataSourceOption {
  value: string;
  label: string;
  description: string;
  fields: string[];
}

// ============================================
// DATA SOURCE OPTIONS
// ============================================

const dataSources: DataSourceOption[] = [
  {
    value: 'donations',
    label: 'Donations',
    description: 'Track donation amounts, campaigns, and donor information',
    fields: ['amount', 'donation_date', 'campaign', 'client_id', 'donor_name'],
  },
  {
    value: 'clients',
    label: 'Clients/Contacts',
    description: 'Client demographics, locations, and engagement data',
    fields: ['name', 'email', 'phone', 'location', 'created_at'],
  },
  {
    value: 'projects',
    label: 'Projects',
    description: 'Project progress, status, and task completion',
    fields: ['name', 'status', 'start_date', 'end_date', 'client_id', 'budget'],
  },
  {
    value: 'tasks',
    label: 'Tasks',
    description: 'Task assignments, due dates, and completion rates',
    fields: ['description', 'status', 'due_date', 'team_member_id', 'project_id'],
  },
  {
    value: 'cases',
    label: 'Cases',
    description: 'Case management, resolution times, and priorities',
    fields: ['title', 'status', 'priority', 'created_at', 'assigned_to_id', 'client_id'],
  },
  {
    value: 'activities',
    label: 'Activities',
    description: 'Activity logs, meeting notes, and communications',
    fields: ['type', 'title', 'activity_date', 'client_id', 'created_by_id'],
  },
  {
    value: 'volunteers',
    label: 'Volunteers',
    description: 'Volunteer hours, skills, and assignments',
    fields: ['name', 'skills', 'availability', 'location'],
  },
  {
    value: 'outcomes',
    label: 'Outcomes/Impact',
    description: 'Program outcomes and impact measurements',
    fields: ['outcome_type', 'impact_value', 'outcome_date', 'program_id', 'client_id'],
  },
  {
    value: 'engagement_scores',
    label: 'Engagement Scores',
    description: 'Donor engagement levels and scoring',
    fields: ['overall_score', 'engagement_level', 'client_id', 'calculated_at'],
  },
  {
    value: 'lifetime_values',
    label: 'Lifetime Values',
    description: 'Donor lifetime value and RFM analysis',
    fields: ['total_lifetime_value', 'rfm_score', 'total_donations', 'avg_donation'],
  },
];

// ============================================
// STEP INDICATOR
// ============================================

interface StepIndicatorProps {
  steps: { id: Step; label: string }[];
  currentStep: Step;
  onStepClick: (step: Step) => void;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep, onStepClick }) => {
  const currentIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = step.id === currentStep;

        return (
          <React.Fragment key={step.id}>
            <button
              onClick={() => isCompleted && onStepClick(step.id)}
              disabled={!isCompleted}
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                isCompleted
                  ? 'bg-indigo-600 border-indigo-600 text-white cursor-pointer hover:bg-indigo-700'
                  : isCurrent
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-gray-300 text-gray-400 bg-white dark:bg-gray-800 dark:border-gray-600'
              }`}
            >
              {isCompleted ? <CheckIcon /> : index + 1}
            </button>
            {index < steps.length - 1 && (
              <div
                className={`w-16 h-1 mx-2 rounded ${
                  index < currentIndex ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ============================================
// STEP 1: DATA SOURCE
// ============================================

interface DataSourceStepProps {
  selectedSource: string;
  onSelect: (source: string) => void;
  selectedCategory: ReportCategory | null;
  onCategorySelect: (category: ReportCategory) => void;
}

const DataSourceStep: React.FC<DataSourceStepProps> = ({
  selectedSource,
  onSelect,
  selectedCategory,
  onCategorySelect,
}) => {
  const categories = reportService.getReportCategories();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Select Category</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Choose a category to organize your report
        </p>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => onCategorySelect(cat.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === cat.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Select Data Source</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Choose the primary data to use in your report
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dataSources.map((source) => (
            <button
              key={source.value}
              onClick={() => onSelect(source.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                selectedSource === source.value
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <h4 className="font-medium text-gray-900 dark:text-white">{source.label}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{source.description}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {source.fields.slice(0, 4).map((field) => (
                  <span
                    key={field}
                    className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
                  >
                    {field}
                  </span>
                ))}
                {source.fields.length > 4 && (
                  <span className="px-2 py-0.5 text-xs text-gray-500">
                    +{source.fields.length - 4} more
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================
// STEP 2: VISUALIZATION
// ============================================

interface VisualizationStepProps {
  selectedType: VisualizationType;
  onSelect: (type: VisualizationType) => void;
}

const VisualizationStep: React.FC<VisualizationStepProps> = ({ selectedType, onSelect }) => {
  const chartTypes = reportService.getChartTypes();

  // Group chart types
  const basicCharts = chartTypes.filter(c => ['line', 'bar', 'pie', 'donut', 'area'].includes(c.value));
  const advancedCharts = chartTypes.filter(c => ['scatter', 'bubble', 'funnel', 'waterfall', 'heatmap', 'treemap', 'radar', 'histogram'].includes(c.value));
  const specialCharts = chartTypes.filter(c => ['gauge', 'kpi', 'table', 'map', 'gantt'].includes(c.value));

  const renderChartGroup = (title: string, charts: typeof chartTypes) => (
    <div className="mb-6">
      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">{title}</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {charts.map((chart) => (
          <button
            key={chart.value}
            onClick={() => onSelect(chart.value)}
            className={`p-4 rounded-xl border-2 text-center transition-all ${
              selectedType === chart.value
                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl">
              {chart.value === 'line' && '📈'}
              {chart.value === 'bar' && '📊'}
              {chart.value === 'pie' && '🥧'}
              {chart.value === 'donut' && '🍩'}
              {chart.value === 'area' && '📉'}
              {chart.value === 'scatter' && '⚬'}
              {chart.value === 'bubble' && '🫧'}
              {chart.value === 'funnel' && '🔽'}
              {chart.value === 'waterfall' && '🌊'}
              {chart.value === 'heatmap' && '🔥'}
              {chart.value === 'treemap' && '🗺️'}
              {chart.value === 'gauge' && '🎯'}
              {chart.value === 'kpi' && '#️⃣'}
              {chart.value === 'table' && '📋'}
              {chart.value === 'map' && '🗺️'}
              {chart.value === 'gantt' && '📅'}
              {chart.value === 'radar' && '📡'}
              {chart.value === 'histogram' && '📶'}
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{chart.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Choose Visualization</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Select how you want to display your data
      </p>
      {renderChartGroup('Basic Charts', basicCharts)}
      {renderChartGroup('Advanced Charts', advancedCharts)}
      {renderChartGroup('Special Visualizations', specialCharts)}
    </div>
  );
};

// ============================================
// STEP 3: FILTERS
// ============================================

interface FiltersStepProps {
  dataSource: string;
  filters: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
  groupBy: string;
  onGroupByChange: (value: string) => void;
  metric: string;
  onMetricChange: (value: string) => void;
}

const FiltersStep: React.FC<FiltersStepProps> = ({
  dataSource,
  filters,
  onFilterChange,
  groupBy,
  onGroupByChange,
  metric,
  onMetricChange,
}) => {
  const source = dataSources.find(s => s.value === dataSource);

  const groupByOptions: Record<string, Array<{ value: string; label: string }>> = {
    donations: [
      { value: 'month', label: 'Month' },
      { value: 'campaign', label: 'Campaign' },
      { value: 'client_id', label: 'Donor' },
    ],
    clients: [
      { value: 'location', label: 'Location' },
      { value: 'month', label: 'Month Created' },
    ],
    projects: [
      { value: 'status', label: 'Status' },
      { value: 'client_id', label: 'Client' },
      { value: 'month', label: 'Month' },
    ],
    tasks: [
      { value: 'status', label: 'Status' },
      { value: 'team_member_id', label: 'Team Member' },
      { value: 'project_id', label: 'Project' },
    ],
    cases: [
      { value: 'status', label: 'Status' },
      { value: 'priority', label: 'Priority' },
      { value: 'assigned_to_id', label: 'Assignee' },
      { value: 'month', label: 'Month' },
    ],
    activities: [
      { value: 'type', label: 'Activity Type' },
      { value: 'month', label: 'Month' },
      { value: 'client_id', label: 'Client' },
    ],
    volunteers: [
      { value: 'location', label: 'Location' },
      { value: 'availability', label: 'Availability' },
    ],
    outcomes: [
      { value: 'outcome_type', label: 'Outcome Type' },
      { value: 'program_id', label: 'Program' },
      { value: 'month', label: 'Month' },
    ],
    engagement_scores: [
      { value: 'engagement_level', label: 'Engagement Level' },
    ],
    lifetime_values: [
      { value: 'rfm_tier', label: 'RFM Tier' },
    ],
  };

  const metricOptions: Record<string, Array<{ value: string; label: string }>> = {
    donations: [
      { value: 'sum:amount', label: 'Total Amount' },
      { value: 'count', label: 'Number of Donations' },
      { value: 'avg:amount', label: 'Average Donation' },
    ],
    clients: [
      { value: 'count', label: 'Number of Clients' },
    ],
    projects: [
      { value: 'count', label: 'Number of Projects' },
      { value: 'sum:budget', label: 'Total Budget' },
    ],
    tasks: [
      { value: 'count', label: 'Number of Tasks' },
    ],
    cases: [
      { value: 'count', label: 'Number of Cases' },
    ],
    activities: [
      { value: 'count', label: 'Number of Activities' },
    ],
    volunteers: [
      { value: 'count', label: 'Number of Volunteers' },
    ],
    outcomes: [
      { value: 'count', label: 'Number of Outcomes' },
      { value: 'sum:impact_value', label: 'Total Impact Value' },
    ],
    engagement_scores: [
      { value: 'count', label: 'Number of Donors' },
      { value: 'avg:overall_score', label: 'Average Score' },
    ],
    lifetime_values: [
      { value: 'count', label: 'Number of Donors' },
      { value: 'sum:total_lifetime_value', label: 'Total LTV' },
      { value: 'avg:total_lifetime_value', label: 'Average LTV' },
    ],
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Configure Data</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Define how to group and aggregate your data
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Group By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Group By
          </label>
          <select
            value={groupBy}
            onChange={(e) => onGroupByChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          >
            <option value="">Select grouping...</option>
            {(groupByOptions[dataSource] || []).map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Metric */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Metric
          </label>
          <select
            value={metric}
            onChange={(e) => onMetricChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          >
            <option value="">Select metric...</option>
            {(metricOptions[dataSource] || []).map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Date Range Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Date Range (Optional)
        </label>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="date"
            value={filters.dateStart || ''}
            onChange={(e) => onFilterChange('dateStart', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            placeholder="Start Date"
          />
          <input
            type="date"
            value={filters.dateEnd || ''}
            onChange={(e) => onFilterChange('dateEnd', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            placeholder="End Date"
          />
        </div>
      </div>

      {/* Available Fields */}
      {source && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Available Fields
          </label>
          <div className="flex flex-wrap gap-2">
            {source.fields.map((field) => (
              <span
                key={field}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm"
              >
                {field}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// STEP 4: PREVIEW
// ============================================

interface PreviewStepProps {
  name: string;
  onNameChange: (name: string) => void;
  description: string;
  onDescriptionChange: (desc: string) => void;
  reportConfig: {
    dataSource: string;
    visualizationType: VisualizationType;
    category: ReportCategory | null;
    groupBy: string;
    metric: string;
  };
}

const PreviewStep: React.FC<PreviewStepProps> = ({
  name,
  onNameChange,
  description,
  onDescriptionChange,
  reportConfig,
}) => {
  const source = dataSources.find(s => s.value === reportConfig.dataSource);
  const chartTypes = reportService.getChartTypes();
  const chartType = chartTypes.find(c => c.value === reportConfig.visualizationType);
  const categories = reportService.getReportCategories();
  const category = categories.find(c => c.value === reportConfig.category);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Finalize Report</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Review your settings and give your report a name
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Report Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Enter report name..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Describe what this report shows..."
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">Report Summary</h4>
          <dl className="space-y-3">
            <div>
              <dt className="text-xs text-gray-500 dark:text-gray-400 uppercase">Data Source</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{source?.label || '-'}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500 dark:text-gray-400 uppercase">Visualization</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{chartType?.label || '-'}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500 dark:text-gray-400 uppercase">Category</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{category?.label || '-'}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500 dark:text-gray-400 uppercase">Group By</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{reportConfig.groupBy || '-'}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500 dark:text-gray-400 uppercase">Metric</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{reportConfig.metric || '-'}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const ReportBuilder: React.FC<ReportBuilderProps> = ({ report, onSave, onCancel }) => {
  const [currentStep, setCurrentStep] = useState<Step>('source');
  const [dataSource, setDataSource] = useState(report?.dataSource?.table || '');
  const [category, setCategory] = useState<ReportCategory | null>(report?.category || null);
  const [visualizationType, setVisualizationType] = useState<VisualizationType>(report?.visualizationType || 'bar');
  const [filters, setFilters] = useState<Record<string, any>>(report?.filters || {});
  const [groupBy, setGroupBy] = useState('');
  const [metric, setMetric] = useState('');
  const [name, setName] = useState(report?.name || '');
  const [description, setDescription] = useState(report?.description || '');

  const steps: { id: Step; label: string }[] = [
    { id: 'source', label: 'Data Source' },
    { id: 'visualization', label: 'Visualization' },
    { id: 'filters', label: 'Filters' },
    { id: 'preview', label: 'Preview' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const canProceed = () => {
    switch (currentStep) {
      case 'source':
        return dataSource && category;
      case 'visualization':
        return visualizationType;
      case 'filters':
        return groupBy && metric;
      case 'preview':
        return name.trim().length > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  const handleSave = () => {
    const reportData: Partial<Report> = {
      name,
      description,
      reportType: 'custom',
      category: category!,
      dataSource: { table: dataSource },
      visualizationType,
      filters: {
        ...filters,
        groupBy,
        metric,
      },
    };
    onSave(reportData);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          {report ? 'Edit Report' : 'Create New Report'}
        </h2>

        <StepIndicator
          steps={steps}
          currentStep={currentStep}
          onStepClick={setCurrentStep}
        />

        <div className="min-h-[400px]">
          {currentStep === 'source' && (
            <DataSourceStep
              selectedSource={dataSource}
              onSelect={setDataSource}
              selectedCategory={category}
              onCategorySelect={setCategory}
            />
          )}

          {currentStep === 'visualization' && (
            <VisualizationStep
              selectedType={visualizationType}
              onSelect={setVisualizationType}
            />
          )}

          {currentStep === 'filters' && (
            <FiltersStep
              dataSource={dataSource}
              filters={filters}
              onFilterChange={handleFilterChange}
              groupBy={groupBy}
              onGroupByChange={setGroupBy}
              metric={metric}
              onMetricChange={setMetric}
            />
          )}

          {currentStep === 'preview' && (
            <PreviewStep
              name={name}
              onNameChange={setName}
              description={description}
              onDescriptionChange={setDescription}
              reportConfig={{
                dataSource,
                visualizationType,
                category,
                groupBy,
                metric,
              }}
            />
          )}
        </div>

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            Cancel
          </button>
          <div className="flex items-center gap-3">
            {currentStepIndex > 0 && (
              <button
                onClick={handlePrevious}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                <ChevronLeftIcon />
                Previous
              </button>
            )}
            {currentStepIndex < steps.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRightIcon />
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckIcon />
                {report ? 'Update Report' : 'Create Report'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportBuilder;
