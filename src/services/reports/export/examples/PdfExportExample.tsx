/**
 * PDF Export Service Usage Examples
 *
 * This file demonstrates various ways to use the PDF export service
 * for generating professional reports with charts, filters, and data tables.
 */

import React, { useRef } from 'react';
import { PdfExportService } from '../PdfExportService';
import { AdvancedPdfExportService } from '../AdvancedPdfExportService';
import advancedPdfExportService from '../AdvancedPdfExportService';
import {
  AdvancedExportOptions,
  ChartOptions,
  FilterOption,
} from '../IExportService';

// ============================================
// EXAMPLE 1: Basic PDF Export (Legacy Interface)
// ============================================

export const basicPdfExportExample = async () => {
  const pdfService = new PdfExportService();

  const sampleData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active', revenue: 15000 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Active', revenue: 22000 },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Inactive', revenue: 8000 },
  ];

  const result = await pdfService.export({
    reportName: 'Client Revenue Report',
    data: sampleData,
    filters: {
      status: 'Active',
      dateRange: { start: '2024-01-01', end: '2024-12-31' },
    },
    timestamp: new Date(),
  });

  if (result.success && result.blob) {
    // Download the PDF
    const url = URL.createObjectURL(result.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.filename;
    link.click();
    URL.revokeObjectURL(url);
  } else {
    console.error('PDF export failed:', result.error);
  }
};

// ============================================
// EXAMPLE 2: PDF Export with Chart (Legacy Interface)
// ============================================

export const PdfExportWithChartExample: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);

  const handleExportWithChart = async () => {
    const pdfService = new PdfExportService();

    const sampleData = [
      { month: 'January', revenue: 15000, expenses: 10000 },
      { month: 'February', revenue: 18000, expenses: 11000 },
      { month: 'March', revenue: 22000, expenses: 12000 },
    ];

    const result = await pdfService.export({
      reportName: 'Monthly Financial Report',
      data: sampleData,
      chartElement: chartRef.current || undefined,
      filters: {
        year: '2024',
        quarter: 'Q1',
      },
    });

    if (result.success && result.blob) {
      const url = URL.createObjectURL(result.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.filename;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div>
      <div ref={chartRef}>
        {/* Your chart component here (e.g., Recharts, Chart.js) */}
        <h3>Revenue vs Expenses Chart</h3>
        <p>Chart placeholder - replace with actual chart component</p>
      </div>
      <button onClick={handleExportWithChart}>Export PDF with Chart</button>
    </div>
  );
};

// ============================================
// EXAMPLE 3: Advanced PDF Export with Multiple Charts
// ============================================

export const AdvancedPdfExportExample: React.FC = () => {
  const revenueChartRef = useRef<HTMLDivElement>(null);
  const expenseChartRef = useRef<HTMLDivElement>(null);

  const handleAdvancedExport = async () => {
    const sampleData = [
      {
        client: 'Acme Corp',
        revenue: 45000,
        expenses: 30000,
        profit: 15000,
        status: 'Active',
        lastContact: new Date('2024-03-15'),
      },
      {
        client: 'TechStart Inc',
        revenue: 62000,
        expenses: 35000,
        profit: 27000,
        status: 'Active',
        lastContact: new Date('2024-03-20'),
      },
      {
        client: 'Global Solutions',
        revenue: 38000,
        expenses: 28000,
        profit: 10000,
        status: 'Inactive',
        lastContact: new Date('2024-02-10'),
      },
    ];

    const exportOptions: AdvancedExportOptions = {
      title: 'Q1 2024 Client Performance Report',
      description: 'Comprehensive analysis of client revenue, expenses, and profitability for the first quarter of 2024.',
      includeCharts: true,
      includeFilters: true,
      orientation: 'landscape', // Use landscape for wider tables
      pageSize: 'letter',
      fileName: 'q1-2024-client-performance.pdf',
    };

    const charts: ChartOptions[] = [
      {
        element: revenueChartRef.current!,
        title: 'Revenue by Client',
        width: 260,
        height: 150,
        resolution: 2, // High resolution for crisp charts
      },
      {
        element: expenseChartRef.current!,
        title: 'Expense Analysis',
        width: 260,
        height: 150,
        resolution: 2,
      },
    ];

    const filters: FilterOption[] = [
      { label: 'Quarter', value: 'Q1 2024' },
      { label: 'Status', value: ['Active', 'Inactive'] },
      { label: 'Revenue Range', value: '$30,000 - $70,000' },
      { label: 'Date Range', value: [new Date('2024-01-01'), new Date('2024-03-31')] },
    ];

    try {
      await advancedPdfExportService.exportToPDF(
        sampleData,
        exportOptions,
        charts,
        filters
      );

      console.log('Advanced PDF exported successfully!');
    } catch (error) {
      console.error('Advanced PDF export failed:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div ref={revenueChartRef} className="bg-white p-4 rounded shadow">
        <h3>Revenue by Client</h3>
        {/* Your revenue chart component */}
      </div>

      <div ref={expenseChartRef} className="bg-white p-4 rounded shadow">
        <h3>Expense Analysis</h3>
        {/* Your expense chart component */}
      </div>

      <button
        onClick={handleAdvancedExport}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Export Advanced PDF Report
      </button>
    </div>
  );
};

// ============================================
// EXAMPLE 4: Portrait A4 Report with Single Chart
// ============================================

export const portraitA4ExportExample = async (
  data: any[],
  chartElement: HTMLElement | null
) => {
  const exportOptions: AdvancedExportOptions = {
    title: 'Monthly Sales Report',
    description: 'Detailed breakdown of sales performance for the month.',
    includeCharts: true,
    includeFilters: false,
    orientation: 'portrait',
    pageSize: 'a4',
  };

  const charts: ChartOptions[] | undefined = chartElement
    ? [
        {
          element: chartElement,
          title: 'Sales Trend',
          resolution: 2,
        },
      ]
    : undefined;

  await advancedPdfExportService.exportToPDF(data, exportOptions, charts);
};

// ============================================
// EXAMPLE 5: Legal Size Landscape Report
// ============================================

export const legalLandscapeExportExample = async (
  data: any[],
  filters?: Record<string, any>
) => {
  const exportOptions: AdvancedExportOptions = {
    title: 'Annual Financial Statement',
    description: 'Complete financial overview for fiscal year 2024.',
    includeCharts: false,
    includeFilters: true,
    orientation: 'landscape', // Wide format for large tables
    pageSize: 'legal', // Legal size for more content
    fileName: 'annual-financial-statement-2024.pdf',
  };

  const filterOptions: FilterOption[] | undefined = filters
    ? Object.entries(filters).map(([label, value]) => ({
        label,
        value,
      }))
    : undefined;

  await advancedPdfExportService.exportToPDF(
    data,
    exportOptions,
    undefined,
    filterOptions
  );
};

// ============================================
// EXAMPLE 6: Export with Dynamic Data
// ============================================

export const exportDynamicDataExample = async (
  reportTitle: string,
  fetchData: () => Promise<any[]>,
  chartElement?: HTMLElement | null,
  activeFilters?: Record<string, any>
) => {
  try {
    // Fetch data dynamically
    const data = await fetchData();

    if (data.length === 0) {
      console.warn('No data to export');
      return;
    }

    const exportOptions: AdvancedExportOptions = {
      title: reportTitle,
      description: `Generated on ${new Date().toLocaleDateString()}`,
      includeCharts: !!chartElement,
      includeFilters: !!activeFilters,
      orientation: 'portrait',
      pageSize: 'letter',
    };

    const charts: ChartOptions[] | undefined = chartElement
      ? [{ element: chartElement, title: 'Report Visualization', resolution: 2 }]
      : undefined;

    const filters: FilterOption[] | undefined = activeFilters
      ? Object.entries(activeFilters).map(([label, value]) => ({
          label,
          value,
        }))
      : undefined;

    await advancedPdfExportService.exportToPDF(
      data,
      exportOptions,
      charts,
      filters
    );

    console.log(`Successfully exported: ${reportTitle}`);
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
};

// ============================================
// EXAMPLE 7: Complete React Component Example
// ============================================

interface ReportData {
  id: number;
  name: string;
  value: number;
  status: string;
  date: Date;
}

export const CompleteExportComponent: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [data, setData] = React.useState<ReportData[]>([]);
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const exportOptions: AdvancedExportOptions = {
        title: 'Complete Report Example',
        description: 'This is a comprehensive report with all features.',
        includeCharts: true,
        includeFilters: true,
        orientation: 'portrait',
        pageSize: 'a4',
      };

      const charts: ChartOptions[] = chartRef.current
        ? [
            {
              element: chartRef.current,
              title: 'Data Visualization',
              resolution: 2,
            },
          ]
        : [];

      const filters: FilterOption[] = [
        { label: 'Status', value: 'Active' },
        { label: 'Date Range', value: 'Last 30 days' },
      ];

      await advancedPdfExportService.exportToPDF(
        data,
        exportOptions,
        charts,
        filters
      );

      alert('PDF exported successfully!');
    } catch (error) {
      alert('Failed to export PDF. Please try again.');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Report Export Example</h2>

      <div ref={chartRef} className="mb-4 p-4 bg-gray-50 rounded">
        {/* Your chart component here */}
        <p>Chart placeholder</p>
      </div>

      <button
        onClick={handleExport}
        disabled={isExporting}
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
      >
        {isExporting ? 'Exporting...' : 'Export to PDF'}
      </button>
    </div>
  );
};

export default {
  basicPdfExportExample,
  PdfExportWithChartExample,
  AdvancedPdfExportExample,
  portraitA4ExportExample,
  legalLandscapeExportExample,
  exportDynamicDataExample,
  CompleteExportComponent,
};
