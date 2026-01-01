import React, { useState, useEffect } from 'react';
import { outcomeService } from '../services/outcomeService';
import type { Program, ProgramResult, ImpactSnapshot, ImpactStats } from '../types';
import { PROGRAM_CATEGORY_LABELS } from '../types';

interface ReportConfig {
  title: string;
  dateRange: 'month' | 'quarter' | 'year' | 'custom';
  customStartDate?: string;
  customEndDate?: string;
  includeOverview: boolean;
  includePrograms: boolean;
  includeOutcomes: boolean;
  includeFinancials: boolean;
  selectedPrograms: string[];
  format: 'detailed' | 'summary' | 'executive';
}

const defaultConfig: ReportConfig = {
  title: 'Impact Report',
  dateRange: 'quarter',
  includeOverview: true,
  includePrograms: true,
  includeOutcomes: true,
  includeFinancials: true,
  selectedPrograms: [],
  format: 'detailed',
};

export const ImpactReportBuilder: React.FC = () => {
  const [config, setConfig] = useState<ReportConfig>(defaultConfig);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [stats, setStats] = useState<ImpactStats | null>(null);
  const [programResults, setProgramResults] = useState<ProgramResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [loadedPrograms, loadedStats] = await Promise.all([
        outcomeService.getActivePrograms(),
        outcomeService.getImpactStats(),
      ]);
      setPrograms(loadedPrograms);
      setStats(loadedStats);
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRangeLabel = () => {
    const now = new Date();
    switch (config.dateRange) {
      case 'month':
        return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      case 'quarter': {
        const quarter = Math.floor(now.getMonth() / 3) + 1;
        return `Q${quarter} ${now.getFullYear()}`;
      }
      case 'year':
        return now.getFullYear().toString();
      case 'custom':
        if (config.customStartDate && config.customEndDate) {
          return `${new Date(config.customStartDate).toLocaleDateString()} - ${new Date(config.customEndDate).toLocaleDateString()}`;
        }
        return 'Custom Range';
      default:
        return '';
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 1500));

      const reportContent = buildReportContent();
      setGeneratedReport(reportContent);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGenerating(false);
    }
  };

  const buildReportContent = (): string => {
    const lines: string[] = [];
    const dateLabel = getDateRangeLabel();

    // Title
    lines.push(`# ${config.title}`);
    lines.push(`**Report Period:** ${dateLabel}`);
    lines.push(`**Generated:** ${new Date().toLocaleDateString()}`);
    lines.push('');

    // Overview Section
    if (config.includeOverview && stats) {
      lines.push('## Executive Summary');
      lines.push('');
      lines.push(`During this reporting period, our organization served **${stats.totalClientsServed.toLocaleString()}** clients across **${stats.totalPrograms}** active programs.`);
      lines.push('');
      lines.push('### Key Metrics');
      lines.push(`- **Total Services Delivered:** ${stats.totalServicesDelivered.toLocaleString()}`);
      lines.push(`- **Outcomes Achieved:** ${stats.totalOutcomes.toLocaleString()}`);
      lines.push(`- **Total Impact Value:** $${stats.totalImpactValue.toLocaleString()}`);
      lines.push(`- **Average Completion Rate:** ${(stats.avgCompletionRate * 100).toFixed(1)}%`);
      lines.push(`- **Program ROI:** ${(stats.overallROI * 100).toFixed(1)}%`);
      lines.push('');
    }

    // Programs Section
    if (config.includePrograms) {
      lines.push('## Program Performance');
      lines.push('');

      const filteredPrograms = config.selectedPrograms.length > 0
        ? programs.filter(p => config.selectedPrograms.includes(p.id))
        : programs;

      if (config.format === 'executive') {
        // Executive summary - just top performers
        lines.push('### Top Performing Programs');
        filteredPrograms.slice(0, 5).forEach((program, index) => {
          lines.push(`${index + 1}. **${program.name}** - ${PROGRAM_CATEGORY_LABELS[program.category]}`);
        });
      } else {
        // Detailed or summary format
        filteredPrograms.forEach(program => {
          lines.push(`### ${program.name}`);
          lines.push(`- **Category:** ${PROGRAM_CATEGORY_LABELS[program.category]}`);
          lines.push(`- **Type:** ${program.programType}`);
          if (config.format === 'detailed') {
            lines.push(`- **Description:** ${program.description || 'N/A'}`);
            lines.push(`- **Duration:** ${program.durationWeeks ? `${program.durationWeeks} weeks` : 'Ongoing'}`);
            lines.push(`- **Cost per Participant:** $${program.costPerParticipant?.toFixed(2) || '0.00'}`);
          }
          lines.push('');
        });
      }
    }

    // Outcomes Section
    if (config.includeOutcomes && stats) {
      lines.push('## Outcome Analysis');
      lines.push('');
      lines.push('### Outcomes by Category');
      lines.push('');
      lines.push('| Category | Description |');
      lines.push('|----------|-------------|');
      lines.push('| Employment | Job placement, skill development, career advancement |');
      lines.push('| Housing | Stable housing secured, housing retention |');
      lines.push('| Education | Certifications, degrees, skills training |');
      lines.push('| Health | Health improvements, wellness goals achieved |');
      lines.push('| Financial | Financial stability, debt reduction, savings |');
      lines.push('');

      if (config.format === 'detailed') {
        lines.push('### Impact Methodology');
        lines.push('');
        lines.push('Impact values are calculated using evidence-based multipliers:');
        lines.push('- Employment outcomes: 2.5x base value');
        lines.push('- Housing outcomes: 2.0x base value');
        lines.push('- Education outcomes: 1.8x base value');
        lines.push('- Health outcomes: 1.5x base value');
        lines.push('- Financial outcomes: 1.3x base value');
        lines.push('');
      }
    }

    // Financials Section
    if (config.includeFinancials && stats) {
      lines.push('## Financial Impact');
      lines.push('');
      lines.push(`The total social return on investment (SROI) for this period is **${(stats.overallROI * 100).toFixed(1)}%**.`);
      lines.push('');
      lines.push(`This means that for every dollar invested in our programs, we generated **$${(1 + stats.overallROI).toFixed(2)}** in social value.`);
      lines.push('');

      if (config.format === 'detailed') {
        lines.push('### Value Breakdown');
        lines.push(`- **Direct Client Benefits:** $${(stats.totalImpactValue * 0.6).toLocaleString()}`);
        lines.push(`- **Community Benefits:** $${(stats.totalImpactValue * 0.25).toLocaleString()}`);
        lines.push(`- **Systemic Savings:** $${(stats.totalImpactValue * 0.15).toLocaleString()}`);
        lines.push('');
      }
    }

    // Conclusion
    lines.push('## Conclusion');
    lines.push('');
    lines.push('This report demonstrates the meaningful impact our programs have on the communities we serve. ');
    lines.push('Through dedicated service delivery and outcome tracking, we continue to create lasting positive change.');
    lines.push('');
    lines.push('---');
    lines.push('*Report generated by Logos Vision CRM Impact Measurement System*');

    return lines.join('\n');
  };

  const downloadReport = () => {
    if (!generatedReport) return;

    const blob = new Blob([generatedReport], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.title.replace(/\s+/g, '_')}_${getDateRangeLabel().replace(/\s+/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    if (!generatedReport) return;
    navigator.clipboard.writeText(generatedReport);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Impact Report Builder</h1>
          <p className="text-slate-600 dark:text-slate-400">Create comprehensive impact reports for stakeholders</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Report Configuration</h2>

            {/* Report Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Report Title
              </label>
              <input
                type="text"
                value={config.title}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            {/* Date Range */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Date Range
              </label>
              <select
                value={config.dateRange}
                onChange={(e) => setConfig({ ...config, dateRange: e.target.value as ReportConfig['dateRange'] })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {config.dateRange === 'custom' && (
              <div className="mb-4 grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Start</label>
                  <input
                    type="date"
                    value={config.customStartDate || ''}
                    onChange={(e) => setConfig({ ...config, customStartDate: e.target.value })}
                    className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">End</label>
                  <input
                    type="date"
                    value={config.customEndDate || ''}
                    onChange={(e) => setConfig({ ...config, customEndDate: e.target.value })}
                    className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* Report Format */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Report Format
              </label>
              <select
                value={config.format}
                onChange={(e) => setConfig({ ...config, format: e.target.value as ReportConfig['format'] })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                <option value="executive">Executive Summary</option>
                <option value="summary">Summary Report</option>
                <option value="detailed">Detailed Report</option>
              </select>
            </div>

            {/* Sections */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Include Sections
              </label>
              <div className="space-y-2">
                {[
                  { key: 'includeOverview', label: 'Executive Overview' },
                  { key: 'includePrograms', label: 'Program Performance' },
                  { key: 'includeOutcomes', label: 'Outcome Analysis' },
                  { key: 'includeFinancials', label: 'Financial Impact' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config[key as keyof ReportConfig] as boolean}
                      onChange={(e) => setConfig({ ...config, [key]: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Program Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Programs ({config.selectedPrograms.length === 0 ? 'All' : config.selectedPrograms.length})
              </label>
              <div className="max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-600 rounded-lg p-2 space-y-1">
                {programs.map(program => (
                  <label key={program.id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-slate-50 dark:hover:bg-slate-700 rounded">
                    <input
                      type="checkbox"
                      checked={config.selectedPrograms.includes(program.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setConfig({ ...config, selectedPrograms: [...config.selectedPrograms, program.id] });
                        } else {
                          setConfig({ ...config, selectedPrograms: config.selectedPrograms.filter(id => id !== program.id) });
                        }
                      }}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{program.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateReport}
              disabled={generating}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* Report Preview */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Report Preview</h2>
              {generatedReport && (
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </button>
                  <button
                    onClick={downloadReport}
                    className="px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>
                </div>
              )}
            </div>

            {generatedReport ? (
              <div className="prose dark:prose-invert max-w-none overflow-auto max-h-[600px] bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                <pre className="whitespace-pre-wrap text-sm font-mono text-slate-700 dark:text-slate-300">
                  {generatedReport}
                </pre>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-slate-400">
                <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg font-medium">No report generated yet</p>
                <p className="text-sm">Configure your report settings and click "Generate Report"</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Preview */}
      {stats && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Available Data Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalPrograms}</div>
              <div className="text-xs text-slate-500">Programs</div>
            </div>
            <div className="text-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.totalClientsServed.toLocaleString()}</div>
              <div className="text-xs text-slate-500">Clients</div>
            </div>
            <div className="text-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.totalServicesDelivered.toLocaleString()}</div>
              <div className="text-xs text-slate-500">Services</div>
            </div>
            <div className="text-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{stats.totalOutcomes.toLocaleString()}</div>
              <div className="text-xs text-slate-500">Outcomes</div>
            </div>
            <div className="text-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="text-2xl font-bold text-emerald-600">${stats.totalImpactValue.toLocaleString()}</div>
              <div className="text-xs text-slate-500">Impact Value</div>
            </div>
            <div className="text-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="text-2xl font-bold text-cyan-600">{(stats.overallROI * 100).toFixed(0)}%</div>
              <div className="text-xs text-slate-500">ROI</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImpactReportBuilder;
