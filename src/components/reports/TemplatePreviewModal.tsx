import React from 'react';
import { ReportTemplate } from '../../config/reportTemplates';
import { reportService } from '../../services/reportService';

// ============================================
// ICONS
// ============================================

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const PencilIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

// ============================================
// TYPES
// ============================================

interface TemplatePreviewModalProps {
  template: ReportTemplate;
  onClose: () => void;
  onCreateReport: () => void;
  onCustomize: () => void;
}

// ============================================
// MAIN COMPONENT
// ============================================

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template,
  onClose,
  onCreateReport,
  onCustomize,
}) => {
  const chartTypes = reportService.getChartTypes();
  const chartType = chartTypes.find(c => c.value === template.visualizationType);
  const categories = reportService.getReportCategories();
  const category = categories.find(c => c.value === template.category);

  const getChartEmoji = (type: string) => {
    const emojiMap: Record<string, string> = {
      line: '📈',
      bar: '📊',
      pie: '🥧',
      donut: '🍩',
      area: '📉',
      scatter: '⚬',
      bubble: '🫧',
      funnel: '🔽',
      waterfall: '🌊',
      heatmap: '🔥',
      treemap: '🗺️',
      gauge: '🎯',
      kpi: '#️⃣',
      table: '📋',
      map: '🗺️',
      gantt: '📅',
      radar: '📡',
      histogram: '📶',
    };
    return emojiMap[type] || '📊';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`bg-gradient-to-r from-${template.color}-500 to-${template.color}-600 p-6 text-white`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="text-5xl">{template.icon}</div>
              <div>
                <h2 className="text-2xl font-bold">{template.name}</h2>
                <p className="mt-1 text-white/90">{template.description}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                    {category?.label}
                  </span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium flex items-center gap-1">
                    {getChartEmoji(template.visualizationType)}
                    {chartType?.label}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <XIcon />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* What's Included */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <SparklesIcon />
              What's Included
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {template.metrics.map((metric, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
                    <CheckIcon />
                  </div>
                  <span className="text-sm text-gray-900 dark:text-white font-medium">
                    {metric}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Data Source & Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
                Data Source
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Table</span>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">
                    {template.dataSource.table}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Visualization</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {chartType?.label}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Default Period</span>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">
                    {template.defaultDateRange.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
                Configuration
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Group By</span>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">
                    {template.filters.groupBy || 'None'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Metric</span>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">
                    {template.filters.metric?.replace(/:/g, ' ') || 'None'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Columns</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {template.columns.length} fields
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Chart Mockup */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
              Preview
            </h4>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-center h-48">
                <div className="text-center">
                  <div className="text-6xl mb-3">{getChartEmoji(template.visualizationType)}</div>
                  <p className="text-gray-500 dark:text-gray-400">
                    {chartType?.label} visualization
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Your data will appear here
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
              Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {template.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={onCustomize}
                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                <PencilIcon />
                Customize First
              </button>
              <button
                onClick={onCreateReport}
                className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-${template.color}-500 to-${template.color}-600 text-white rounded-lg hover:from-${template.color}-600 hover:to-${template.color}-700 transition-all font-medium shadow-lg shadow-${template.color}-500/30`}
              >
                <CheckIcon />
                Create Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreviewModal;
