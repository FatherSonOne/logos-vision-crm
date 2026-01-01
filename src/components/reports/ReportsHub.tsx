import React, { useState, useEffect } from 'react';
import { reportService, Report, KPI, AIInsight, ReportCategory } from '../../services/reportService';
import { ReportsDashboard } from './ReportsDashboard';
import { ReportsGrid } from './ReportsGrid';
import { ReportBuilder } from './ReportBuilder';
import { ReportViewer } from './ReportViewer';
import { KPIMonitoring } from './KPIMonitoring';
import { AIInsightsPanel } from './AIInsightsPanel';

// ============================================
// ICONS
// ============================================

const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
  </svg>
);

const ReportsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const BuilderIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
  </svg>
);

const KPIIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const AIIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const StarIcon = ({ filled }: { filled?: boolean }) => (
  <svg className="w-4 h-4" fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const BackIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

// ============================================
// TYPES
// ============================================

type TabType = 'dashboard' | 'reports' | 'builder' | 'kpis' | 'insights';

interface ReportsHubProps {
  onNavigate?: (page: string) => void;
}

// ============================================
// MAIN COMPONENT
// ============================================

export const ReportsHub: React.FC<ReportsHubProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [reports, setReports] = useState<Report[]>([]);
  const [kpis, setKPIs] = useState<KPI[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | 'all'>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [reportsData, kpisData, insightsData] = await Promise.all([
        reportService.getReports(),
        reportService.getKPIs({ activeOnly: true }),
        reportService.getInsights({ limit: 10 }),
      ]);
      setReports(reportsData);
      setKPIs(kpisData);
      setInsights(insightsData);
    } catch (err) {
      console.error('Failed to load reports data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        reportService.refreshAllKPIs(),
        reportService.clearCache(),
      ]);
      await loadData();
    } catch (err) {
      console.error('Failed to refresh:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSelectReport = (report: Report) => {
    setSelectedReport(report);
  };

  const handleBackFromReport = () => {
    setSelectedReport(null);
  };

  const handleCreateReport = () => {
    setEditingReport(null);
    setShowBuilder(true);
    setActiveTab('builder');
  };

  const handleEditReport = (report: Report) => {
    setEditingReport(report);
    setShowBuilder(true);
    setActiveTab('builder');
  };

  const handleSaveReport = async (reportData: Partial<Report>) => {
    try {
      if (editingReport) {
        await reportService.updateReport(editingReport.id, reportData);
      } else {
        await reportService.createReport(reportData);
      }
      await loadData();
      setShowBuilder(false);
      setEditingReport(null);
      setActiveTab('reports');
    } catch (err) {
      console.error('Failed to save report:', err);
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      await reportService.deleteReport(id);
      await loadData();
      if (selectedReport?.id === id) {
        setSelectedReport(null);
      }
    } catch (err) {
      console.error('Failed to delete report:', err);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      await reportService.toggleFavorite(id);
      await loadData();
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleDismissInsight = async (id: string) => {
    try {
      await reportService.dismissInsight(id);
      setInsights(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error('Failed to dismiss insight:', err);
    }
  };

  // Filter reports
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || report.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const favoriteReports = reports.filter(r => r.isFavorite);
  const recentReports = [...reports]
    .sort((a, b) => new Date(b.lastViewedAt || 0).getTime() - new Date(a.lastViewedAt || 0).getTime())
    .slice(0, 5);

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'reports' as TabType, label: 'Reports', icon: <ReportsIcon /> },
    { id: 'builder' as TabType, label: 'Builder', icon: <BuilderIcon /> },
    { id: 'kpis' as TabType, label: 'KPIs', icon: <KPIIcon /> },
    { id: 'insights' as TabType, label: 'AI Insights', icon: <AIIcon /> },
  ];

  const categories = reportService.getReportCategories();

  // If viewing a specific report, show the viewer
  if (selectedReport) {
    return (
      <div className="p-6 space-y-6">
        <button
          onClick={handleBackFromReport}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <BackIcon />
          Back to Reports
        </button>
        <ReportViewer
          report={selectedReport}
          onEdit={() => handleEditReport(selectedReport)}
          onDelete={() => handleDeleteReport(selectedReport.id)}
          onToggleFavorite={() => handleToggleFavorite(selectedReport.id)}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports Hub</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Analytics, insights, and custom reports for your organization
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <RefreshIcon />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={handleCreateReport}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <PlusIcon />
            Create Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-4 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'builder') setShowBuilder(true);
              }}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.id === 'insights' && insights.length > 0 && (
                <span className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-600 rounded-full dark:bg-indigo-900 dark:text-indigo-400">
                  {insights.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Search and Filter Bar (for Reports tab) */}
      {activeTab === 'reports' && (
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <SearchIcon />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.value
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <ReportsDashboard
              kpis={kpis}
              recentReports={recentReports}
              favoriteReports={favoriteReports}
              insights={insights}
              onSelectReport={handleSelectReport}
              onDismissInsight={handleDismissInsight}
              onCreateReport={handleCreateReport}
            />
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <ReportsGrid
              reports={filteredReports}
              onSelectReport={handleSelectReport}
              onEditReport={handleEditReport}
              onDeleteReport={handleDeleteReport}
              onToggleFavorite={handleToggleFavorite}
            />
          )}

          {/* Builder Tab */}
          {activeTab === 'builder' && (
            <ReportBuilder
              report={editingReport}
              onSave={handleSaveReport}
              onCancel={() => {
                setShowBuilder(false);
                setEditingReport(null);
                setActiveTab('reports');
              }}
            />
          )}

          {/* KPIs Tab */}
          {activeTab === 'kpis' && (
            <KPIMonitoring
              kpis={kpis}
              onRefresh={loadData}
            />
          )}

          {/* AI Insights Tab */}
          {activeTab === 'insights' && (
            <AIInsightsPanel
              insights={insights}
              onDismiss={handleDismissInsight}
              onRefresh={loadData}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ReportsHub;
