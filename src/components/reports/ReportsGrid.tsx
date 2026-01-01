import React, { useState } from 'react';
import { Report, reportService, ReportCategory } from '../../services/reportService';

// ============================================
// ICONS
// ============================================

const GridIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const ListIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </svg>
);

const StarIcon = ({ filled }: { filled?: boolean }) => (
  <svg className={`w-5 h-5 ${filled ? 'text-yellow-500' : 'text-gray-400'}`} fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const DotsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

// Chart type icons
const getChartIcon = (type: string) => {
  const icons: Record<string, JSX.Element> = {
    line: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
    ),
    bar: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    pie: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
      </svg>
    ),
    table: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  };
  return icons[type] || icons.bar;
};

// ============================================
// TYPES
// ============================================

interface ReportsGridProps {
  reports: Report[];
  onSelectReport: (report: Report) => void;
  onEditReport: (report: Report) => void;
  onDeleteReport: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

type ViewMode = 'grid' | 'list';

// ============================================
// DROPDOWN MENU COMPONENT
// ============================================

interface DropdownMenuProps {
  report: Report;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ report, onView, onEdit, onDelete, onToggleFavorite }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <DotsIcon />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 py-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <EyeIcon /> View Report
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <StarIcon filled={report.isFavorite} /> {report.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </button>
            {!report.isTemplate && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <EditIcon /> Edit Report
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  <TrashIcon /> Delete Report
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// ============================================
// GRID CARD COMPONENT
// ============================================

interface GridCardProps {
  report: Report;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}

const GridCard: React.FC<GridCardProps> = ({ report, onSelect, onEdit, onDelete, onToggleFavorite }) => {
  const categories = reportService.getReportCategories();
  const category = categories.find(c => c.value === report.category);

  return (
    <div
      onClick={onSelect}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-3 rounded-lg bg-${category?.color || 'gray'}-100 dark:bg-${category?.color || 'gray'}-900/30 text-${category?.color || 'gray'}-600`}>
          {getChartIcon(report.visualizationType)}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {report.isFavorite && <StarIcon filled />}
          <DropdownMenu
            report={report}
            onView={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleFavorite={onToggleFavorite}
          />
        </div>
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{report.name}</h3>
      {report.description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{report.description}</p>
      )}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span className={`px-2 py-1 rounded-full bg-${category?.color || 'gray'}-100 dark:bg-${category?.color || 'gray'}-900/30 text-${category?.color || 'gray'}-600 capitalize`}>
          {category?.label || report.category}
        </span>
        <span>{report.viewCount} views</span>
      </div>
      {report.isTemplate && (
        <span className="mt-2 inline-block px-2 py-1 text-xs bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-full">
          Template
        </span>
      )}
    </div>
  );
};

// ============================================
// LIST ROW COMPONENT
// ============================================

interface ListRowProps {
  report: Report;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}

const ListRow: React.FC<ListRowProps> = ({ report, onSelect, onEdit, onDelete, onToggleFavorite }) => {
  const categories = reportService.getReportCategories();
  const category = categories.find(c => c.value === report.category);

  return (
    <tr
      onClick={onSelect}
      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-${category?.color || 'gray'}-100 dark:bg-${category?.color || 'gray'}-900/30 text-${category?.color || 'gray'}-600`}>
            {getChartIcon(report.visualizationType)}
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
              {report.name}
              {report.isFavorite && <StarIcon filled />}
              {report.isTemplate && (
                <span className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-full">
                  Template
                </span>
              )}
            </h4>
            {report.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{report.description}</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`px-2 py-1 rounded-full text-xs bg-${category?.color || 'gray'}-100 dark:bg-${category?.color || 'gray'}-900/30 text-${category?.color || 'gray'}-600 capitalize`}>
          {category?.label || report.category}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 capitalize">
        {report.visualizationType}
      </td>
      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
        {report.viewCount}
      </td>
      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
        {report.lastViewedAt ? new Date(report.lastViewedAt).toLocaleDateString() : '-'}
      </td>
      <td className="px-4 py-3">
        <DropdownMenu
          report={report}
          onView={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleFavorite={onToggleFavorite}
        />
      </td>
    </tr>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const ReportsGrid: React.FC<ReportsGridProps> = ({
  reports,
  onSelectReport,
  onEditReport,
  onDeleteReport,
  onToggleFavorite,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Group reports by template vs custom
  const templateReports = reports.filter(r => r.isTemplate);
  const customReports = reports.filter(r => !r.isTemplate);

  if (reports.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-block p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
          <GridIcon />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No reports found</h3>
        <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      <div className="flex justify-end">
        <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            <GridIcon />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            <ListIcon />
          </button>
        </div>
      </div>

      {/* Template Reports */}
      {templateReports.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Predefined Reports ({templateReports.length})
          </h2>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {templateReports.map((report) => (
                <GridCard
                  key={report.id}
                  report={report}
                  onSelect={() => onSelectReport(report)}
                  onEdit={() => onEditReport(report)}
                  onDelete={() => onDeleteReport(report.id)}
                  onToggleFavorite={() => onToggleFavorite(report.id)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Report</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Viewed</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {templateReports.map((report) => (
                    <ListRow
                      key={report.id}
                      report={report}
                      onSelect={() => onSelectReport(report)}
                      onEdit={() => onEditReport(report)}
                      onDelete={() => onDeleteReport(report.id)}
                      onToggleFavorite={() => onToggleFavorite(report.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Custom Reports */}
      {customReports.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Custom Reports ({customReports.length})
          </h2>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {customReports.map((report) => (
                <GridCard
                  key={report.id}
                  report={report}
                  onSelect={() => onSelectReport(report)}
                  onEdit={() => onEditReport(report)}
                  onDelete={() => onDeleteReport(report.id)}
                  onToggleFavorite={() => onToggleFavorite(report.id)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Report</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Viewed</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {customReports.map((report) => (
                    <ListRow
                      key={report.id}
                      report={report}
                      onSelect={() => onSelectReport(report)}
                      onEdit={() => onEditReport(report)}
                      onDelete={() => onDeleteReport(report.id)}
                      onToggleFavorite={() => onToggleFavorite(report.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default ReportsGrid;
