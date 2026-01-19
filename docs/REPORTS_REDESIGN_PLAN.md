# Logos Vision CRM - Reports Redesign Implementation Plan
## Hybrid Architecture: Open-Source Foundation with Commercial Upgrade Path

**Project Goal**: Transform the Reports section into a comprehensive, enterprise-grade analytics platform using open-source libraries with a modular architecture that supports future commercial integrations.

**Approach**: Start with 100% open-source (Recharts, TanStack Table, SheetJS, jsPDF) with abstraction layers enabling seamless upgrades to commercial solutions (Bold Reports, Carbone API, ECharts) as needs evolve.

**Timeline**: 12 weeks (3 phases)
**Initial Cost**: $0 (open-source only)
**Future Scalability**: Ready for commercial APIs when needed

---

## Current State Analysis

### Strengths (Already Implemented)
✅ **Complete Database Schema** - 7 tables: reports, report_dashboards, report_widgets, kpis, ai_insights, report_schedules, report_data_cache
✅ **Comprehensive Service Layer** - reportService.ts with full CRUD operations
✅ **Modern UI Components** - ReportsHub, ReportBuilder, ReportViewer, KPIMonitoring, AIInsightsPanel
✅ **Recharts Integration** - 18+ visualization types defined (line, bar, pie, funnel, heatmap, gantt, etc.)
✅ **CSV Export Working** - ExportButton and ExportDialog components functional
✅ **Caching Infrastructure** - LRU + TTL caching with localStorage persistence
✅ **AI Integration** - Gemini API for insights generation

### Gaps to Address
❌ **PDF Export** - UI exists, functionality placeholder
❌ **Excel Export** - UI exists, functionality placeholder
❌ **PNG/Image Export** - UI exists, functionality placeholder
❌ **Visual Report Builder** - Need drag-and-drop, low-code interface
❌ **Real-time Updates** - No WebSocket integration
❌ **Scheduled Execution** - DB schema complete, execution logic missing
❌ **Advanced Tables** - Need sorting, filtering, virtual scrolling for large datasets
❌ **Performance** - No optimization for 10,000+ row datasets

---

## Architecture Overview

### Modular Abstraction Layer

```
┌─────────────────────────────────────────────────────────┐
│         Application Layer (React Components)            │
│  ReportsHub | ReportBuilder | ReportViewer | KPIs      │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              Unified Interfaces (Adapters)              │
│  IChartRenderer | IExportService | IDataTransformer    │
└──────────────────────┬──────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
    ┌───▼────┐   ┌────▼────┐   ┌───▼──────┐
    │ Tier 1 │   │ Tier 2  │   │  Tier 3  │
    │  OSS   │   │Enhanced │   │Commercial│
    │(Now)   │   │  OSS    │   │ (Future) │
    └────────┘   └─────────┘   └──────────┘
```

**Key Benefit**: Change implementations without touching UI code. Swap Recharts for ECharts or add Bold Reports by changing adapter configuration.

---

## Implementation Phases

## PHASE 1: Advanced Export System (Weeks 1-4)

### Goals
- Implement PDF export with embedded charts
- Implement Excel export with multiple sheets
- Implement PNG/image export
- Create export abstraction layer for future upgrades

### 1.1 PDF Export with jsPDF + html2canvas

**New Files**:
- `src/services/reports/export/PdfExportService.ts` (400 lines)
- `src/services/reports/export/formatters/PdfFormatter.ts` (200 lines)

**Implementation**:
```typescript
class PdfExportService implements IExportService {
  async exportToPDF(report: Report, data: any[]): Promise<Blob> {
    const doc = new jsPDF('portrait', 'mm', 'a4');

    // Add header with logo and report title
    this.addHeader(doc, report);

    // Render chart to high-res PNG using html2canvas
    const chartElement = document.getElementById('report-chart');
    const chartCanvas = await html2canvas(chartElement, { scale: 2 });
    doc.addImage(chartCanvas.toDataURL(), 'PNG', 10, 40, 190, 100);

    // Add data table with jspdf-autotable
    autoTable(doc, {
      head: [Object.keys(data[0])],
      body: data.map(row => Object.values(row)),
      startY: 150,
    });

    // Add footer with page numbers
    this.addFooter(doc);

    return doc.output('blob');
  }
}
```

**Features**:
- Multi-page support with pagination
- Custom page sizes (Letter, A4, Legal)
- Landscape/Portrait orientation
- Headers with logo/branding
- Footers with page numbers and timestamps
- Chart embedding at 300 DPI
- Data tables with auto-pagination
- Filter summary section

**Package Dependencies**:
```json
{
  "jspdf": "^2.5.1",
  "jspdf-autotable": "^3.8.0",
  "html2canvas": "^1.4.1"
}
```

### 1.2 Excel Export with SheetJS

**New Files**:
- `src/services/reports/export/ExcelExportService.ts` (350 lines)
- `src/services/reports/export/formatters/ExcelFormatter.ts` (250 lines)

**Implementation**:
```typescript
class ExcelExportService implements IExportService {
  async exportToExcel(report: Report, data: any[]): Promise<Blob> {
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Formatted data with styles
    const dataSheet = XLSX.utils.json_to_sheet(data);
    this.applyStyles(dataSheet, {
      headerBold: true,
      headerBackground: '#4F46E5',
      alternateRows: true,
    });
    XLSX.utils.book_append_sheet(workbook, dataSheet, 'Data');

    // Sheet 2: Summary statistics
    const summaryData = this.calculateSummary(data, report);
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Sheet 3: Metadata
    const metaSheet = this.createMetadataSheet(report);
    XLSX.utils.book_append_sheet(workbook, metaSheet, 'Metadata');

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    return new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
  }
}
```

**Features**:
- Multi-sheet workbooks (Data, Summary, Metadata, Chart Data)
- Cell styling (bold headers, colored backgrounds, borders)
- Column auto-sizing
- Formula support (SUM, AVERAGE, COUNT)
- Freeze panes for headers
- Data validation
- Conditional formatting
- Number formatting (currency, percentage, dates)

**Package Dependencies**:
```json
{
  "xlsx": "^0.18.5",
  "file-saver": "^2.0.5"
}
```

### 1.3 PNG/Image Export

**New Files**:
- `src/services/reports/export/ImageExportService.ts` (200 lines)

**Implementation**:
```typescript
class ImageExportService implements IExportService {
  async exportToPNG(
    chartElement: HTMLElement,
    options: ImageExportOptions
  ): Promise<Blob> {
    const canvas = await html2canvas(chartElement, {
      scale: options.resolution || 2, // 2x for retina
      backgroundColor: options.transparent ? null : '#ffffff',
      width: options.width || chartElement.offsetWidth,
      height: options.height || chartElement.offsetHeight,
    });

    return new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/png', 1.0);
    });
  }

  // Batch export all charts in a report
  async exportAllCharts(reportId: string): Promise<Blob[]> {
    const charts = document.querySelectorAll('[data-chart-id]');
    return Promise.all(
      Array.from(charts).map(chart => this.exportToPNG(chart as HTMLElement))
    );
  }
}
```

**Features**:
- Customizable resolution (1x, 2x, 4x for print)
- Transparent or white background
- Custom dimensions (social media sizes, presentation sizes)
- Batch export (all charts in report)
- Format support: PNG, JPEG, WebP

### 1.4 Export Abstraction Layer

**New Files**:
- `src/services/reports/interfaces/IExportService.ts` (100 lines)
- `src/services/reports/export/ExportRouter.ts` (150 lines)

**Interface Definition**:
```typescript
interface IExportService {
  exportToPDF(report: Report, data: any[], options?: ExportOptions): Promise<Blob>;
  exportToExcel(report: Report, data: any[], options?: ExportOptions): Promise<Blob>;
  exportToCSV(report: Report, data: any[], options?: ExportOptions): Promise<Blob>;
  exportToImage(element: HTMLElement, options?: ImageExportOptions): Promise<Blob>;
  getMetadata(): ExportServiceMetadata;
}

interface ExportOptions {
  includeCharts?: boolean;
  includeFilters?: boolean;
  includeTimestamp?: boolean;
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'letter' | 'a4' | 'legal';
}
```

**Export Router** (Strategy Pattern):
```typescript
class ExportRouter {
  selectStrategy(request: ExportRequest): IExportService {
    const { format, rowCount, complexity } = request;

    // Route to appropriate service based on requirements
    if (rowCount < 1000 && complexity === 'simple') {
      return new ClientSideExportService(); // jsPDF/SheetJS
    }

    if (rowCount < 10000) {
      return new ClientSideExportService(); // Still client-side
    }

    // Future: Route large/complex exports to server-side
    if (rowCount >= 10000 || complexity === 'complex') {
      // When Carbone API added: return new CarboneExportService();
      return new ClientSideExportService(); // For now
    }
  }
}
```

### 1.5 Update ReportViewer Component

**Modified File**: `src/components/reports/ReportViewer.tsx`

**Changes**:
```typescript
const handleExport = async (format: ExportFormat) => {
  setExporting(true);

  try {
    const exportService = exportRouter.selectStrategy({
      format,
      rowCount: data.length,
      complexity: report.visualizationType === 'table' ? 'simple' : 'medium',
    });

    let blob: Blob;
    switch (format) {
      case 'pdf':
        blob = await exportService.exportToPDF(report, data, {
          includeCharts: true,
          orientation: 'portrait',
        });
        break;
      case 'excel':
        blob = await exportService.exportToExcel(report, data);
        break;
      case 'csv':
        blob = await exportService.exportToCSV(report, data);
        break;
      case 'png':
        blob = await exportService.exportToImage(chartRef.current);
        break;
    }

    // Download file
    saveAs(blob, `${report.name}_${new Date().toISOString().split('T')[0]}.${format}`);

    // Track export
    await reportService.logExport(report.id, format, data.length);

    toast.success(`Report exported as ${format.toUpperCase()}`);
  } catch (error) {
    toast.error('Export failed: ' + error.message);
  } finally {
    setExporting(false);
  }
};
```

**Replace placeholder alert with functional exports**

---

## PHASE 2: Advanced Tables & Visual Report Builder (Weeks 5-8)

### Goals
- Implement TanStack Table for advanced data tables
- Build drag-and-drop visual report builder
- Add real-time data updates
- Optimize for mixed data volumes

### 2.1 TanStack Table Integration

**New Files**:
- `src/components/reports/tables/AdvancedDataTable.tsx` (600 lines)
- `src/components/reports/tables/TableFilters.tsx` (300 lines)
- `src/components/reports/tables/TableToolbar.tsx` (200 lines)

**Implementation**:
```typescript
import { useReactTable, getCoreRowModel, getSortedRowModel,
         getFilteredRowModel, getPaginationRowModel } from '@tanstack/react-table';

export const AdvancedDataTable = ({ data, columns }) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
    enableMultiSort: true,
  });

  return (
    <div>
      <TableToolbar table={table} />
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    {header.column.columnDef.header}
                    {/* Sort indicator */}
                    {header.column.getIsSorted() && (
                      <span>{header.column.getIsSorted() === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TablePagination table={table} />
    </div>
  );
};
```

**Features**:
- **Column Management**: Sort (multi-column with shift+click), filter, resize, reorder, hide/show
- **Row Operations**: Select single/multiple, bulk actions, expand/collapse
- **Pagination**: Client-side and server-side modes, configurable page sizes
- **Virtual Scrolling**: Handle 10,000+ rows smoothly using `@tanstack/react-virtual`
- **Cell Visualizations**: Sparklines, progress bars, color coding, icons
- **Export Selected**: Export only selected rows
- **Saved Views**: Save column configuration and filters

**Package Dependencies**:
```json
{
  "@tanstack/react-table": "^8.11.0",
  "@tanstack/react-virtual": "^3.0.0"
}
```

### 2.2 Visual Report Builder (Low-Code Interface)

**New Files**:
- `src/components/reports/VisualReportBuilder.tsx` (800 lines)
- `src/components/reports/builder/DataSourceSelector.tsx` (300 lines)
- `src/components/reports/builder/FieldMapper.tsx` (400 lines)
- `src/components/reports/builder/ChartConfigurator.tsx` (500 lines)

**Implementation** (using @dnd-kit):
```typescript
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

export const VisualReportBuilder = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    xAxis: null,
    yAxis: [],
    groupBy: null,
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over?.id === 'x-axis-drop-zone') {
      setChartConfig(prev => ({ ...prev, xAxis: active.data.current.field }));
    }
    if (over?.id === 'y-axis-drop-zone') {
      setChartConfig(prev => ({
        ...prev,
        yAxis: [...prev.yAxis, active.data.current.field]
      }));
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-3 gap-6">
        {/* Left: Available Fields */}
        <div className="border rounded-lg p-4">
          <h3>Available Fields</h3>
          <SortableContext items={fields} strategy={verticalListSortingStrategy}>
            {fields.map(field => (
              <DraggableField key={field.id} field={field} />
            ))}
          </SortableContext>
        </div>

        {/* Middle: Chart Configuration */}
        <div className="border rounded-lg p-4">
          <h3>Chart Setup</h3>
          <DropZone id="x-axis-drop-zone" label="X-Axis (Drag field here)" />
          <DropZone id="y-axis-drop-zone" label="Y-Axis (Drag metrics here)" />
          <DropZone id="group-by-drop-zone" label="Group By (Optional)" />

          <ChartTypeSelector value={chartConfig.type} onChange={setChartType} />
        </div>

        {/* Right: Live Preview */}
        <div className="border rounded-lg p-4">
          <h3>Live Preview</h3>
          <ChartPreview config={chartConfig} data={previewData} />
        </div>
      </div>
    </DndContext>
  );
};
```

**Features**:
- **Drag-and-Drop**: Drag fields onto chart axes, filters, groupings
- **Live Preview**: See chart update in real-time as you configure
- **Visual Feedback**: Drop zones highlight on hover, validation messages
- **Undo/Redo**: Track builder actions, allow reverting changes
- **Template Library**: Start from pre-built templates
- **Save & Share**: Save configurations, share with team

**Package Dependencies**:
```json
{
  "@dnd-kit/core": "^6.1.0",
  "@dnd-kit/sortable": "^8.0.0"
}
```

### 2.3 Real-time Dashboard Updates

**New Files**:
- `src/components/reports/RealtimeDashboard.tsx` (400 lines)
- `src/hooks/useRealtimeReport.ts` (150 lines)

**Implementation**:
```typescript
export const useRealtimeReport = (reportId: string) => {
  const [data, setData] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Subscribe to Supabase real-time changes
    const channel = supabase
      .channel(`report:${reportId}`)
      .on('postgres_changes', {
        event: '*', // INSERT, UPDATE, DELETE
        schema: 'public',
        table: getReportTable(reportId),
      }, (payload) => {
        // Update data based on change type
        if (payload.eventType === 'INSERT') {
          setData(prev => [...prev, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setData(prev => prev.map(row =>
            row.id === payload.new.id ? payload.new : row
          ));
        } else if (payload.eventType === 'DELETE') {
          setData(prev => prev.filter(row => row.id !== payload.old.id));
        }
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => supabase.removeChannel(channel);
  }, [reportId]);

  return { data, isConnected };
};
```

**Features**:
- **WebSocket Connection**: Supabase Realtime for live updates
- **Auto-refresh**: Configurable intervals (5s, 30s, 1m, 5m)
- **Connection Status**: Visual indicator (green dot = connected)
- **Optimistic Updates**: Show changes immediately, rollback on error
- **Batch Updates**: Group rapid changes to avoid flickering

### 2.4 Performance Optimization for Mixed Data Volumes

**Strategy**: Adaptive rendering based on data size

**New Files**:
- `src/utils/performanceOptimizer.ts` (200 lines)
- `src/hooks/useVirtualizedTable.ts` (250 lines)

**Implementation**:
```typescript
class PerformanceOptimizer {
  selectRenderingStrategy(rowCount: number): RenderingStrategy {
    if (rowCount < 100) {
      return 'full-render'; // Render all rows immediately
    }
    if (rowCount < 1000) {
      return 'paginated'; // Paginate at 25 rows per page
    }
    if (rowCount < 10000) {
      return 'virtual-scroll'; // Virtual scrolling with windowing
    }
    return 'server-paginated'; // Fetch data on demand from server
  }

  selectChartSamplingStrategy(dataPoints: number): SamplingStrategy {
    if (dataPoints < 500) {
      return { type: 'none', points: dataPoints };
    }
    if (dataPoints < 2000) {
      return { type: 'every-nth', n: 2 }; // Show every 2nd point
    }
    return { type: 'lttb', targetPoints: 1000 }; // LTTB downsampling algorithm
  }
}
```

**Techniques**:
- **Data Sampling**: LTTB (Largest-Triangle-Three-Buckets) for chart downsampling
- **Virtual Scrolling**: Only render visible rows in tables
- **Progressive Loading**: Show summary first, load details on demand
- **Web Workers**: Offload heavy calculations to background threads
- **Debounced Updates**: Batch rapid state changes
- **Memoization**: Cache computed values with `useMemo`

---

## PHASE 3: Scheduled Reports & AI Enhancements (Weeks 9-12)

### Goals
- Implement scheduled report execution and delivery
- Enhance AI insights with forecasting and anomaly detection
- Add advanced filtering and query builder
- Performance testing and optimization

### 3.1 Scheduled Report Execution

**New Files**:
- `supabase/functions/execute-scheduled-reports/index.ts` (400 lines)
- `src/components/reports/ReportScheduler.tsx` (500 lines)
- `src/services/reports/ScheduleExecutor.ts` (300 lines)

**Supabase Edge Function**:
```typescript
serve(async (req) => {
  // Triggered by pg_cron every 15 minutes

  // Find all schedules due to run
  const { data: schedules } = await supabase
    .from('report_schedules')
    .select('*, reports(*)')
    .eq('is_active', true)
    .lte('next_run_at', new Date().toISOString());

  for (const schedule of schedules) {
    try {
      // Fetch report data
      const reportData = await fetchReportData(schedule.report_id, schedule.filters);

      // Generate export
      const blob = await generateExport(schedule.report, reportData, schedule.export_format);

      // Upload to Supabase Storage
      const fileName = `${schedule.report.name}_${Date.now()}.${schedule.export_format}`;
      const { data: file } = await supabase.storage
        .from('report-exports')
        .upload(fileName, blob);

      // Send email
      if (schedule.delivery_method === 'email') {
        await sendEmail({
          to: schedule.recipients,
          subject: schedule.email_subject || `Scheduled Report: ${schedule.report.name}`,
          html: renderEmailTemplate(schedule),
          attachments: [{
            filename: fileName,
            path: file.publicUrl,
          }],
        });
      }

      // Update schedule
      await supabase
        .from('report_schedules')
        .update({
          last_run_at: new Date().toISOString(),
          next_run_at: calculateNextRun(schedule),
          run_count: schedule.run_count + 1,
          last_status: 'success',
        })
        .eq('id', schedule.id);

    } catch (error) {
      // Log error
      await supabase
        .from('report_schedules')
        .update({
          last_status: 'error',
          last_error: error.message,
        })
        .eq('id', schedule.id);
    }
  }

  return new Response(JSON.stringify({ processed: schedules.length }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

**PostgreSQL Cron Setup**:
```sql
-- Install pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule edge function to run every 15 minutes
SELECT cron.schedule(
  'execute-scheduled-reports',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/execute-scheduled-reports',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);
```

**UI Component**:
```typescript
export const ReportScheduler = ({ reportId }) => {
  const [schedule, setSchedule] = useState<ReportSchedule>({
    report_id: reportId,
    schedule_type: 'weekly',
    schedule_day_of_week: 1, // Monday
    schedule_time: '09:00',
    delivery_method: 'email',
    recipients: [],
    export_format: 'pdf',
  });

  return (
    <form onSubmit={handleSave}>
      <FrequencySelector value={schedule.schedule_type} onChange={setFrequency} />
      {/* daily, weekly, monthly, quarterly, custom cron */}

      <TimezonePicker value={schedule.timezone} onChange={setTimezone} />

      <RecipientManager value={schedule.recipients} onChange={setRecipients} />
      {/* Add/remove email addresses */}

      <FormatSelector value={schedule.export_format} onChange={setFormat} />
      {/* PDF, Excel, CSV */}

      <EmailTemplateEditor
        subject={schedule.email_subject}
        body={schedule.email_body}
        onChange={setEmailTemplate}
      />

      <Button type="submit">Save Schedule</Button>
    </form>
  );
};
```

**Features**:
- **Flexible Scheduling**: Daily, weekly, monthly, quarterly, custom cron expressions
- **Timezone Support**: Run in user's timezone, not server timezone
- **Multi-recipient**: Send to multiple email addresses
- **Format Selection**: Choose PDF, Excel, or CSV
- **Email Templates**: Customize subject and body with variables
- **Run History**: View past executions, success/failure status
- **Manual Trigger**: Run scheduled report immediately
- **Retry Failed**: Automatic retry on temporary failures

### 3.2 Enhanced AI Insights

**Modified Files**:
- `src/services/aiInsightsService.ts` (extend existing)

**New AI Capabilities**:

**1. Forecasting**:
```typescript
async generateForecast(historicalData: TimeSeriesData[]): Promise<Forecast> {
  const prompt = `
    Analyze this time series data and forecast the next 3 months:
    ${JSON.stringify(historicalData)}

    Use trend analysis, seasonality detection, and anomaly consideration.
    Provide: predicted values, confidence intervals (80% and 95%), methodology.
  `;

  const forecast = await geminiService.generateContent(prompt);

  return {
    predictions: forecast.predictions,
    confidenceIntervals: forecast.intervals,
    methodology: forecast.methodology,
    accuracy: forecast.expectedAccuracy,
  };
}
```

**2. Anomaly Detection**:
```typescript
async detectAnomalies(data: KPI[]): Promise<Anomaly[]> {
  // Statistical anomaly detection (3-sigma rule)
  const stats = calculateStats(data);
  const anomalies = data.filter(kpi =>
    Math.abs(kpi.current_value - stats.mean) > 3 * stats.stdDev
  );

  // AI-powered context analysis
  for (const anomaly of anomalies) {
    const insight = await geminiService.generateContent(`
      This KPI "${anomaly.name}" has value ${anomaly.current_value} which is
      ${Math.abs(anomaly.current_value - stats.mean) / stats.stdDev} standard deviations
      from the mean. Historical context: ${JSON.stringify(anomaly.value_history)}.

      Explain what might have caused this anomaly and suggest actions.
    `);

    anomaly.aiExplanation = insight.explanation;
    anomaly.suggestedActions = insight.actions;
  }

  return anomalies;
}
```

**3. Correlation Analysis**:
```typescript
async findCorrelations(metrics: Metric[]): Promise<Correlation[]> {
  const correlations: Correlation[] = [];

  // Calculate Pearson correlation for all pairs
  for (let i = 0; i < metrics.length; i++) {
    for (let j = i + 1; j < metrics.length; j++) {
      const coefficient = calculatePearsonCorrelation(
        metrics[i].values,
        metrics[j].values
      );

      if (Math.abs(coefficient) > 0.7) { // Strong correlation
        correlations.push({
          metric1: metrics[i].name,
          metric2: metrics[j].name,
          coefficient,
          relationship: coefficient > 0 ? 'positive' : 'negative',
        });
      }
    }
  }

  // AI insight on correlations
  const insight = await geminiService.generateContent(`
    These metrics show strong correlations: ${JSON.stringify(correlations)}.
    Explain the business implications and suggest combined visualizations.
  `);

  return correlations.map(c => ({
    ...c,
    businessImplication: insight.implications,
    suggestedVisualization: insight.chartSuggestion,
  }));
}
```

**Features**:
- **Forecasting**: 3-month predictions with confidence intervals
- **Anomaly Detection**: Statistical + AI-powered context
- **Correlation Discovery**: Identify relationships between metrics
- **Narrative Generation**: Plain-English summaries of data
- **Actionable Recommendations**: Specific next steps based on insights

### 3.3 Advanced Filter Builder

**New Files**:
- `src/components/reports/AdvancedFilterBuilder.tsx` (500 lines)

**Implementation**:
```typescript
export const AdvancedFilterBuilder = ({ onFiltersChange }) => {
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([{
    logic: 'AND',
    filters: [],
  }]);

  return (
    <div>
      {filterGroups.map((group, groupIdx) => (
        <div key={groupIdx} className="border rounded-lg p-4 mb-4">
          <LogicSelector value={group.logic} onChange={setGroupLogic} />
          {/* AND / OR toggle */}

          {group.filters.map((filter, filterIdx) => (
            <FilterRow
              key={filterIdx}
              filter={filter}
              onUpdate={(updated) => updateFilter(groupIdx, filterIdx, updated)}
              onRemove={() => removeFilter(groupIdx, filterIdx)}
            />
          ))}

          <Button onClick={() => addFilter(groupIdx)}>+ Add Filter</Button>
        </div>
      ))}

      <Button onClick={addFilterGroup}>+ Add Filter Group</Button>
    </div>
  );
};

const FilterRow = ({ filter, onUpdate }) => {
  return (
    <div className="flex gap-2 items-center mb-2">
      <FieldSelector value={filter.field} onChange={setField} />
      {/* donation_date, amount, client_name, etc. */}

      <OperatorSelector
        field={filter.field}
        value={filter.operator}
        onChange={setOperator}
      />
      {/* For text: equals, contains, starts_with, regex */}
      {/* For numbers: =, !=, >, <, >=, <=, between */}
      {/* For dates: before, after, between, last_7_days, this_month */}

      <ValueInput
        field={filter.field}
        operator={filter.operator}
        value={filter.value}
        onChange={setValue}
      />
      {/* Dynamic input based on field type */}

      <Button onClick={onRemove} variant="ghost" size="sm">
        <TrashIcon />
      </Button>
    </div>
  );
};
```

**Features**:
- **Visual Builder**: No SQL knowledge required
- **Advanced Operators**: Text (equals, contains, regex), numbers (ranges), dates (relative/absolute)
- **Filter Groups**: Nested AND/OR logic
- **Filter Templates**: Save and reuse common filter sets
- **Quick Filters**: One-click common filters (Last 30 Days, Top 10, etc.)
- **Field Type Detection**: Dynamic operators based on field type
- **Real-time Validation**: Immediate feedback on filter validity
- **SQL Preview**: Show generated SQL for power users

### 3.4 Performance Testing & Benchmarking

**New Files**:
- `src/__tests__/performance/reportPerformance.test.ts` (300 lines)
- `src/utils/performanceBenchmark.ts` (200 lines)

**Performance Targets**:
```typescript
const PERFORMANCE_TARGETS = {
  reportLoad: 2000, // < 2 seconds for 90% of reports
  chartRender: 500, // < 500ms for chart rendering
  exportGeneration: 5000, // < 5 seconds for standard exports
  tableScroll: 16.67, // 60 FPS scrolling
  cacheHitRate: 0.7, // > 70% cache hits
};
```

**Benchmark Tests**:
```typescript
describe('Report Performance', () => {
  test('Report with 100 rows loads in < 2s', async () => {
    const start = performance.now();
    await loadReport(generateData(100));
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(PERFORMANCE_TARGETS.reportLoad);
  });

  test('Chart renders 1000 points in < 500ms', async () => {
    const start = performance.now();
    render(<LineChart data={generateData(1000)} />);
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(PERFORMANCE_TARGETS.chartRender);
  });

  test('Excel export of 5000 rows completes in < 5s', async () => {
    const start = performance.now();
    await excelExportService.exportToExcel(report, generateData(5000));
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(PERFORMANCE_TARGETS.exportGeneration);
  });

  test('Virtual scrolling maintains 60 FPS', () => {
    const table = renderVirtualizedTable(generateData(10000));
    const fps = measureScrollPerformance(table);
    expect(fps).toBeGreaterThanOrEqual(60);
  });
});
```

**Monitoring Dashboard**:
- Query execution times
- Cache hit/miss rates
- Export generation times
- User-perceived performance metrics (Largest Contentful Paint, First Input Delay)

---

## Critical Files for Implementation

### New Files to Create (40 files)

**Export Services** (7 files):
1. `src/services/reports/interfaces/IExportService.ts` - Export interface
2. `src/services/reports/export/PdfExportService.ts` - PDF generation
3. `src/services/reports/export/ExcelExportService.ts` - Excel generation
4. `src/services/reports/export/ImageExportService.ts` - Image export
5. `src/services/reports/export/ExportRouter.ts` - Strategy router
6. `src/services/reports/export/formatters/PdfFormatter.ts` - PDF formatting
7. `src/services/reports/export/formatters/ExcelFormatter.ts` - Excel formatting

**Table Components** (5 files):
8. `src/components/reports/tables/AdvancedDataTable.tsx` - TanStack Table integration
9. `src/components/reports/tables/TableFilters.tsx` - Column filters
10. `src/components/reports/tables/TableToolbar.tsx` - Table actions
11. `src/hooks/useVirtualizedTable.ts` - Virtual scrolling hook
12. `src/utils/tableSamplingStrategy.ts` - Data sampling

**Visual Builder** (6 files):
13. `src/components/reports/VisualReportBuilder.tsx` - Main builder
14. `src/components/reports/builder/DataSourceSelector.tsx` - Data source picker
15. `src/components/reports/builder/FieldMapper.tsx` - Field drag-drop
16. `src/components/reports/builder/ChartConfigurator.tsx` - Chart config
17. `src/components/reports/builder/DropZone.tsx` - Drop target
18. `src/components/reports/builder/DraggableField.tsx` - Draggable item

**Real-time Features** (3 files):
19. `src/components/reports/RealtimeDashboard.tsx` - Live dashboard
20. `src/hooks/useRealtimeReport.ts` - Real-time data hook
21. `src/hooks/useRealtimeKPI.ts` - Live KPI updates

**Scheduling** (5 files):
22. `supabase/functions/execute-scheduled-reports/index.ts` - Edge function
23. `src/components/reports/ReportScheduler.tsx` - Schedule UI
24. `src/services/reports/ScheduleExecutor.ts` - Execution logic
25. `src/components/reports/EmailTemplateEditor.tsx` - Email customization
26. `src/services/emailService.ts` - Email delivery

**AI Enhancements** (4 files):
27. `src/services/aiInsightsService.ts` - Enhanced AI (modify existing)
28. `src/services/forecastingService.ts` - Time series forecasting
29. `src/services/anomalyDetectionService.ts` - Anomaly detection
30. `src/services/correlationService.ts` - Correlation analysis

**Filtering** (2 files):
31. `src/components/reports/AdvancedFilterBuilder.tsx` - Visual filter builder
32. `src/components/reports/FilterRow.tsx` - Individual filter row

**Performance** (3 files):
33. `src/utils/performanceOptimizer.ts` - Adaptive rendering
34. `src/utils/performanceBenchmark.ts` - Benchmarking utilities
35. `src/__tests__/performance/reportPerformance.test.ts` - Performance tests

**Chart Enhancements** (3 files):
36. `src/components/charts/InteractiveLineChart.tsx` - Enhanced line chart
37. `src/components/charts/ComposedChart.tsx` - Multi-type charts
38. `src/utils/chartThemes.ts` - Color schemes

**Configuration** (2 files):
39. `src/services/reports/config/FeatureFlags.ts` - Feature toggles
40. `src/services/reports/registry/PluginRegistry.ts` - Plugin system

### Files to Modify (6 files)

1. **f:\logos-vision-crm\src\components\reports\ReportViewer.tsx**
   - Replace export placeholder alerts with functional exports
   - Add export service integration
   - Add real-time update support

2. **f:\logos-vision-crm\src\components\reports\ReportBuilder.tsx**
   - Add visual builder option
   - Integrate advanced filter builder
   - Add template selection

3. **f:\logos-vision-crm\src\components\reports\KPIMonitoring.tsx**
   - Add real-time KPI updates
   - Integrate anomaly detection alerts
   - Add forecasting charts

4. **f:\logos-vision-crm\src\services\reportService.ts**
   - Add export logging
   - Add performance metrics tracking
   - Add template management

5. **f:\logos-vision-crm\src\services\cacheManager.ts**
   - Add IndexedDB support for large datasets
   - Implement compression (LZ-string)
   - Add smart invalidation

6. **f:\logos-vision-crm\package.json**
   - Add all dependencies

### Database Migrations (2 files)

1. **sql-scripts/migration_reports_export_logging.sql**
```sql
CREATE TABLE report_export_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  export_format TEXT NOT NULL,
  exported_by UUID REFERENCES auth.users(id),
  exported_at TIMESTAMP DEFAULT NOW(),
  file_size_bytes INTEGER,
  row_count INTEGER,
  execution_time_ms INTEGER,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT
);

CREATE INDEX idx_export_history_report ON report_export_history(report_id);
CREATE INDEX idx_export_history_user ON report_export_history(exported_by);
```

2. **sql-scripts/migration_reports_pg_cron.sql**
```sql
-- Install pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule report executor every 15 minutes
SELECT cron.schedule(
  'execute-scheduled-reports',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'YOUR_EDGE_FUNCTION_URL',
    headers := '{"Authorization": "Bearer SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);
```

---

## Package Dependencies

```json
{
  "dependencies": {
    "@tanstack/react-table": "^8.11.0",
    "@tanstack/react-virtual": "^3.0.0",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "xlsx": "^0.18.5",
    "jspdf": "^2.5.1",
    "jspdf-autotable": "^3.8.0",
    "html2canvas": "^1.4.1",
    "papaparse": "^5.4.1",
    "file-saver": "^2.0.5",
    "date-fns": "^3.0.0",
    "lz-string": "^1.5.0"
  },
  "devDependencies": {
    "@types/papaparse": "^5.3.14",
    "@types/file-saver": "^2.0.7"
  }
}
```

**Total Cost**: $0 (all open-source)

---

## Verification Plan

### Phase 1 Verification (Export System)

**Test Scenarios**:
1. **PDF Export**:
   - Generate PDF from bar chart report → Verify chart appears at 300 DPI
   - Export report with 100 rows → Verify data table pagination
   - Export in landscape orientation → Verify layout
   - Export with logo header → Verify branding

2. **Excel Export**:
   - Export 500-row report → Verify 3 sheets (Data, Summary, Metadata)
   - Check cell styling → Bold headers, alternating row colors
   - Verify formulas → SUM, AVERAGE functions work in Excel
   - Test column auto-sizing → All data visible without manual resize

3. **PNG Export**:
   - Export chart at 2x resolution → Verify high quality
   - Export with transparent background → Verify alpha channel
   - Batch export all charts → Verify all files downloaded

**Acceptance Criteria**:
- ✅ All export formats work without errors
- ✅ Charts render clearly in PDFs (readable text, sharp lines)
- ✅ Excel files open correctly in Microsoft Excel and Google Sheets
- ✅ Export completes in < 5 seconds for 1000-row reports

### Phase 2 Verification (Tables & Builder)

**Test Scenarios**:
1. **TanStack Table**:
   - Load 10,000-row dataset → Verify smooth scrolling (60 FPS)
   - Multi-column sort → Shift+click on 3 columns → Verify correct ordering
   - Column filters → Apply text, number, and date filters → Verify results
   - Export selected rows → Select 10 rows → Export CSV → Verify only 10 rows

2. **Visual Builder**:
   - Drag "donation_date" to X-axis → Verify preview updates
   - Drag "amount" to Y-axis → Verify bar chart renders
   - Change chart type to line → Verify smooth transition
   - Save configuration → Reload → Verify settings persist

3. **Real-time Updates**:
   - Open dashboard → Insert new donation in database → Verify chart updates within 2 seconds
   - Monitor connection status → Disconnect network → Verify reconnection attempts

**Acceptance Criteria**:
- ✅ Table handles 10,000 rows without performance degradation
- ✅ Drag-and-drop feels responsive (< 100ms lag)
- ✅ Real-time updates appear within 5 seconds of database change
- ✅ Visual builder is usable by non-technical users

### Phase 3 Verification (Scheduling & AI)

**Test Scenarios**:
1. **Scheduled Reports**:
   - Create weekly schedule (Monday 9am) → Wait for execution → Verify email received
   - Schedule with 3 recipients → Verify all receive email
   - Test PDF and Excel formats → Verify attachments correct
   - View run history → Verify success status logged

2. **AI Insights**:
   - Generate forecast for donation trends → Verify 3-month predictions with confidence intervals
   - Trigger anomaly detection → Create outlier KPI value → Verify alert generated
   - Run correlation analysis → Verify correlations > 0.7 identified

3. **Advanced Filters**:
   - Create filter: "amount > 1000 AND donation_date in last 30 days" → Verify results
   - Add nested group with OR logic → Verify correct boolean logic
   - Save filter template → Apply to different report → Verify works

**Acceptance Criteria**:
- ✅ Scheduled reports execute within 5 minutes of scheduled time
- ✅ All recipients receive emails with correct attachments
- ✅ AI forecasts show reasonable predictions (validated against historical accuracy)
- ✅ Anomalies detected match statistical thresholds (3-sigma rule)
- ✅ Filter builder generates correct SQL queries

### End-to-End Testing

**Complete User Journey**:
1. User opens Reports → ReportsHub loads in < 2 seconds
2. User clicks "Create Report" → Visual builder appears
3. User drags fields to configure chart → Live preview updates instantly
4. User applies filters → Data updates in real-time
5. User saves report → Appears in reports list
6. User exports to PDF → Download completes in < 5 seconds → PDF contains chart and data
7. User schedules weekly delivery → Schedule saved successfully
8. User views dashboard → Real-time KPIs update every 30 seconds
9. User sees AI insight notification → Opens forecast → Views 3-month prediction chart

**Performance Benchmarks**:
- Report load: < 2s for 90% of reports
- Export generation: < 5s for standard reports
- Table scrolling: 60 FPS consistently
- Cache hit rate: > 70%
- Real-time update latency: < 5s

---

## Success Metrics

### Quantitative Metrics
- **Performance**: 90% of reports load in < 2 seconds
- **Export Quality**: 100% data accuracy (matches source)
- **Adoption**: 50% increase in report creation within 3 months
- **Efficiency**: 3x more scheduled reports (reduced manual work)
- **Exports**: 5x more exports generated (easier access to data)
- **Support**: 40% reduction in reporting support tickets

### Qualitative Metrics
- **User Satisfaction**: 4.5+ / 5.0 rating in feedback surveys
- **Accessibility**: Zero WCAG 2.1 AA violations
- **Reliability**: 99.9% uptime for scheduled report execution
- **Developer Experience**: Clean, maintainable codebase with 80%+ test coverage

---

## Future Enhancement Path

After this 12-week implementation, the modular architecture enables easy upgrades:

### Tier 2: Enhanced Open-Source (Weeks 13-16)
- **Add Apache ECharts** for 3D charts, waterfall, sankey diagrams
- **Add Visx** for custom D3-based visualizations
- **Implement Canvas Rendering** for 50,000+ point datasets
- **Add Redis Caching** for distributed caching
- **Cost**: $0 (still open-source)

### Tier 3: Hybrid Commercial (Weeks 17-20)
- **Integrate Carbone Cloud API** ($99-299/month)
  - Professional PDF templates with letterhead
  - Multi-language support
  - Batch processing for 10,000+ documents
- **Keep open-source** for charts and tables
- **Cost**: ~$1,200-3,600/year

### Tier 4: Enterprise (Weeks 21-28)
- **Bold Reports Integration** (~$7,000/year)
  - WYSIWYG report designer
  - Interactive drill-through
  - Advanced security features
  - White-labeling
- **Migration from open-source** using adapter system
- **Cost**: ~$10,000/year total

**No Rewrites Required**: The abstraction layer ensures each tier upgrade is additive, not destructive.

---

## Risk Mitigation

### Technical Risks
| Risk | Mitigation |
|------|-----------|
| Large dataset performance | Implement data sampling, virtual scrolling, server-side pagination |
| Export quality issues | High-DPI rendering (2x scale), comprehensive testing in multiple viewers |
| Browser compatibility | Test in Chrome, Firefox, Safari, Edge; polyfills for older browsers |
| Memory leaks | Proper cleanup of event listeners, canvas contexts, subscriptions |
| Real-time connection drops | Automatic reconnection with exponential backoff |

### Operational Risks
| Risk | Mitigation |
|------|-----------|
| Scheduled report failures | Retry logic (3 attempts), error notifications to admins |
| Database load from queries | Connection pooling, query timeouts, materialized views |
| Cache staleness | Real-time invalidation via Supabase subscriptions |
| Email delivery failures | Queue system, retry logic, delivery status tracking |

### User Adoption Risks
| Risk | Mitigation |
|------|-----------|
| Complex interface | Extensive user testing, progressive disclosure, tooltips, help documentation |
| Learning curve | Video tutorials, interactive onboarding, template library |
| Resistance to change | Gradual rollout, maintain legacy Reports view during transition |

---

## Summary

This hybrid architecture delivers:

✅ **All Priority Features**:
- Advanced Export (PDF, Excel, PNG with charts)
- Visual Report Builder (drag-and-drop, low-code)
- Real-time Dashboards (WebSocket updates)
- Scheduled Report Delivery (email automation)

✅ **Handles Mixed Data Volumes**:
- Small (< 1,000): Full client-side rendering
- Medium (1,000-10,000): Virtual scrolling, pagination
- Large (10,000+): Server-side processing, streaming

✅ **Future-Proof**:
- Modular architecture supports commercial upgrades
- No vendor lock-in
- Gradual enhancement path

✅ **Zero Initial Cost**:
- 100% open-source libraries
- No licensing fees
- Full control over codebase

✅ **Enterprise-Ready**:
- Scheduled automation
- AI-powered insights
- Real-time updates
- Professional exports

**Next Steps**: Review and approve plan → Begin Phase 1 implementation