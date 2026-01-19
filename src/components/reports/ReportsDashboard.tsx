import React, { useState } from 'react';
import { Report, KPI, AIInsight, reportService } from '../../services/reportService';
import { reportTemplates, getTemplateById } from '../../config/reportTemplates';
import { TemplatePreviewModal } from './TemplatePreviewModal';

// ============================================
// ICONS
// ============================================

const TrendUpIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const TrendDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
  </svg>
);

const StarIcon = ({ filled }: { filled?: boolean }) => (
  <svg className={`w-4 h-4 ${filled ? 'text-yellow-500' : ''}`} fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LightbulbIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const XIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const TemplateIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
  </svg>
);

// ============================================
// TYPES
// ============================================

interface ReportsDashboardProps {
  kpis: KPI[];
  recentReports: Report[];
  favoriteReports: Report[];
  insights: AIInsight[];
  onSelectReport: (report: Report) => void;
  onDismissInsight: (id: string) => void;
  onCreateReport: () => void;
  onCreateFromTemplate?: (templateId: string, customize?: boolean) => void;
}

// ============================================
// KPI CARD COMPONENT
// ============================================

interface KPICardProps {
  kpi: KPI;
}

const KPICard: React.FC<KPICardProps> = ({ kpi }) => {
  const status = reportService.getKPIStatus(kpi);
  const formattedValue = kpi.currentValue !== null && kpi.currentValue !== undefined
    ? reportService.formatValue(kpi.currentValue, kpi.displayFormat, kpi.decimalPlaces)
    : '--';

  const statusColors = {
    success: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    warning: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
    critical: 'text-red-600 bg-red-50 dark:bg-red-900/20',
    neutral: 'text-gray-600 bg-gray-50 dark:bg-gray-800',
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    stable: 'text-gray-500',
  };

  return (
    <div className={`p-4 rounded-xl border ${statusColors[status]} transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{kpi.name}</p>
          <p className="text-2xl font-bold mt-1">
            {kpi.prefix}{formattedValue}{kpi.suffix}
          </p>
        </div>
        {kpi.trendDirection && kpi.trendPercentage !== null && (
          <div className={`flex items-center gap-1 ${trendColors[kpi.trendDirection]}`}>
            {kpi.trendDirection === 'up' ? <TrendUpIcon /> : kpi.trendDirection === 'down' ? <TrendDownIcon /> : null}
            <span className="text-sm font-medium">
              {kpi.trendPercentage > 0 ? '+' : ''}{kpi.trendPercentage?.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      {kpi.targetValue && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress to target</span>
            <span>{((kpi.currentValue || 0) / kpi.targetValue * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div
              className={`h-2 rounded-full ${
                status === 'critical' ? 'bg-red-500' : status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, ((kpi.currentValue || 0) / kpi.targetValue * 100))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// REPORT CARD COMPONENT
// ============================================

interface ReportCardProps {
  report: Report;
  onClick: () => void;
  showFavorite?: boolean;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, onClick, showFavorite }) => {
  const categories = reportService.getReportCategories();
  const category = categories.find(c => c.value === report.category);

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-${category?.color || 'gray'}-100 dark:bg-${category?.color || 'gray'}-900/30`}>
            <ChartIcon />
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">{report.name}</h4>
            {report.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{report.description}</p>
            )}
          </div>
        </div>
        {showFavorite && report.isFavorite && (
          <StarIcon filled />
        )}
      </div>
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
        <span className="capitalize">{report.visualizationType}</span>
        {report.lastViewedAt && (
          <span className="flex items-center gap-1">
            <ClockIcon />
            {new Date(report.lastViewedAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </button>
  );
};

// ============================================
// INSIGHT CARD COMPONENT
// ============================================

interface InsightCardProps {
  insight: AIInsight;
  onDismiss: () => void;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight, onDismiss }) => {
  const importanceColors = {
    low: 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800',
    medium: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20',
    high: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20',
    critical: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20',
  };

  return (
    <div className={`p-4 rounded-xl border ${importanceColors[insight.importance]}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
            <LightbulbIcon />
          </div>
          <div>
            {insight.insightTitle && (
              <h4 className="font-medium text-gray-900 dark:text-white">{insight.insightTitle}</h4>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{insight.insightText}</p>
            {insight.suggestedAction && (
              <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 font-medium">
                Suggested: {insight.suggestedAction}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <XIcon />
        </button>
      </div>
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
        <span className="capitalize">{insight.insightType}</span>
        {insight.confidenceScore && (
          <span>{(insight.confidenceScore * 100).toFixed(0)}% confidence</span>
        )}
        <span>{new Date(insight.generatedAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const ReportsDashboard: React.FC<ReportsDashboardProps> = ({
  kpis,
  recentReports,
  favoriteReports,
  insights,
  onSelectReport,
  onDismissInsight,
  onCreateReport,
  onCreateFromTemplate,
}) => {
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleTemplateClick = (templateId: string) => {
    setPreviewTemplate(templateId);
  };

  const handleClosePreview = () => {
    setPreviewTemplate(null);
  };

  const handleCreateFromTemplate = () => {
    if (previewTemplate && onCreateFromTemplate) {
      onCreateFromTemplate(previewTemplate, false);
      setPreviewTemplate(null);
    }
  };

  const handleCustomizeTemplate = () => {
    if (previewTemplate && onCreateFromTemplate) {
      onCreateFromTemplate(previewTemplate, true);
      setPreviewTemplate(null);
    }
  };

  const currentTemplate = previewTemplate ? getTemplateById(previewTemplate) : null;

  const filteredTemplates = searchQuery
    ? reportTemplates.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : reportTemplates;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Key Metrics</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.slice(0, 8).map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Reports */}
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Reports</h2>
            <button
              onClick={onCreateReport}
              className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              <PlusIcon />
              Create New
            </button>
          </div>
          <div className="space-y-3">
            {recentReports.length > 0 ? (
              recentReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onClick={() => onSelectReport(report)}
                  showFavorite
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No reports yet. Create your first report to get started.
              </div>
            )}
          </div>
        </section>

        {/* Favorite Reports */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Favorites</h2>
          </div>
          <div className="space-y-3">
            {favoriteReports.length > 0 ? (
              favoriteReports.slice(0, 5).map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onClick={() => onSelectReport(report)}
                />
              ))
            ) : (
              <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl text-center text-gray-500 dark:text-gray-400">
                <StarIcon filled={false} />
                <p className="mt-2 text-sm">Star reports to add them to your favorites</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <LightbulbIcon />
              AI Insights
            </h2>
            <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-600 rounded-full dark:bg-indigo-900 dark:text-indigo-400">
              {insights.length} new
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.slice(0, 4).map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onDismiss={() => onDismissInsight(insight.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={onCreateReport}
            className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-all text-left"
          >
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 inline-block">
              <PlusIcon />
            </div>
            <p className="mt-2 font-medium text-gray-900 dark:text-white">Create Report</p>
          </button>
          <button
            onClick={() => handleTemplateClick('financial-summary')}
            className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-all text-left group"
          >
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 inline-block">
              <ChartIcon />
            </div>
            <p className="mt-2 font-medium text-gray-900 dark:text-white">Financial Summary</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Revenue & expenses analysis
            </p>
          </button>
          <button
            onClick={() => handleTemplateClick('donation-report')}
            className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-all text-left group"
          >
            <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30 text-pink-600 inline-block">
              <ChartIcon />
            </div>
            <p className="mt-2 font-medium text-gray-900 dark:text-white">Donation Report</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Donations by campaign & donor
            </p>
          </button>
          <button
            onClick={() => handleTemplateClick('impact-report')}
            className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-all text-left group"
          >
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 inline-block">
              <ChartIcon />
            </div>
            <p className="mt-2 font-medium text-gray-900 dark:text-white">Impact Report</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Program outcomes & metrics
            </p>
          </button>
        </div>
      </section>

      {/* Browse Templates */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <TemplateIcon />
            Browse Templates
          </h2>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-64 pl-3 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => {
            const category = reportService.getReportCategories().find(c => c.value === template.category);
            return (
              <button
                key={template.id}
                onClick={() => handleTemplateClick(template.id)}
                className="group relative p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-all text-left overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-gray-100 dark:to-gray-700 opacity-50 rounded-bl-full"></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl">{template.icon}</div>
                    <span className={`px-2 py-1 bg-${template.color}-100 dark:bg-${template.color}-900/30 text-${template.color}-600 dark:text-${template.color}-400 text-xs font-medium rounded-full`}>
                      {category?.label}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                    {template.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {template.tags.length > 2 && (
                        <span className="px-2 py-0.5 text-gray-500 text-xs">
                          +{template.tags.length - 2}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <EyeIcon />
                      <span className="text-sm font-medium">Preview</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <TemplateIcon />
            <p className="mt-2">No templates found matching "{searchQuery}"</p>
          </div>
        )}
      </section>

      {/* Template Preview Modal */}
      {currentTemplate && (
        <TemplatePreviewModal
          template={currentTemplate}
          onClose={handleClosePreview}
          onCreateReport={handleCreateFromTemplate}
          onCustomize={handleCustomizeTemplate}
        />
      )}
    </div>
  );
};

export default ReportsDashboard;
