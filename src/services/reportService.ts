import { supabase } from './supabaseClient';

// ============================================
// TYPES
// ============================================

export type ReportType = 'predefined' | 'custom' | 'dashboard';
export type ReportCategory = 'financial' | 'client' | 'project' | 'team' | 'donation' | 'impact' | 'volunteer' | 'case' | 'hr';
export type VisualizationType = 'line' | 'bar' | 'pie' | 'donut' | 'area' | 'scatter' | 'bubble' | 'funnel' | 'waterfall' | 'gantt' | 'heatmap' | 'treemap' | 'gauge' | 'kpi' | 'table' | 'map' | 'sankey' | 'calendar' | 'radar' | 'histogram';
export type KPIMetricType = 'count' | 'sum' | 'average' | 'percentage' | 'ratio' | 'custom';
export type ThresholdDirection = 'above' | 'below';
export type TrendDirection = 'up' | 'down' | 'stable';
export type InsightType = 'trend' | 'anomaly' | 'correlation' | 'summary' | 'recommendation' | 'forecast';
export type InsightImportance = 'low' | 'medium' | 'high' | 'critical';
export type ScheduleType = 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'png' | 'json';

export interface Report {
  id: string;
  name: string;
  description?: string | null;
  reportType: ReportType;
  category?: ReportCategory | null;
  dataSource: Record<string, any>;
  visualizationType: VisualizationType;
  filters: Record<string, any>;
  availableFilters: string[];
  columns: string[];
  sortBy?: string | null;
  sortDirection: 'asc' | 'desc';
  layout: Record<string, any>;
  isPublic: boolean;
  sharedWith: string[];
  isTemplate: boolean;
  templateCategory?: string | null;
  icon?: string | null;
  color?: string | null;
  viewCount: number;
  lastViewedAt?: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReportDashboard {
  id: string;
  name: string;
  description?: string | null;
  layoutType: 'grid' | 'freeform';
  columnCount: number;
  rowHeight: number;
  isPublic: boolean;
  sharedWith: string[];
  autoRefresh: boolean;
  refreshIntervalSeconds: number;
  showHeader: boolean;
  theme: 'light' | 'dark';
  isDefault: boolean;
  viewCount: number;
  lastViewedAt?: string | null;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  widgets?: ReportWidget[];
}

export interface ReportWidget {
  id: string;
  dashboardId: string;
  reportId?: string | null;
  widgetType: 'chart' | 'kpi' | 'table' | 'text' | 'image';
  title?: string | null;
  subtitle?: string | null;
  gridX: number;
  gridY: number;
  gridWidth: number;
  gridHeight: number;
  config: Record<string, any>;
  backgroundColor?: string | null;
  borderColor?: string | null;
  textColor?: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface KPI {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  metricType: KPIMetricType;
  dataSource: string;
  dataField?: string | null;
  calculationFormula?: string | null;
  filterConditions: Record<string, any>;
  targetValue?: number | null;
  thresholdWarning?: number | null;
  thresholdCritical?: number | null;
  thresholdDirection: ThresholdDirection;
  displayFormat: 'number' | 'currency' | 'percentage';
  decimalPlaces: number;
  prefix?: string | null;
  suffix?: string | null;
  icon?: string | null;
  color?: string | null;
  currentValue?: number | null;
  previousValue?: number | null;
  trendDirection?: TrendDirection | null;
  trendPercentage?: number | null;
  lastCalculatedAt?: string | null;
  alertEnabled: boolean;
  alertRecipients: string[];
  lastAlertSentAt?: string | null;
  valueHistory: Array<{ date: string; value: number }>;
  displayOrder: number;
  isActive: boolean;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AIInsight {
  id: string;
  reportId?: string | null;
  dashboardId?: string | null;
  insightType: InsightType;
  insightTitle?: string | null;
  insightText: string;
  confidenceScore?: number | null;
  importance: InsightImportance;
  relatedData: Record<string, any>;
  relatedMetrics: string[];
  suggestedChartType?: string | null;
  suggestedAction?: string | null;
  isDismissed: boolean;
  dismissedAt?: string | null;
  dismissedBy?: string | null;
  isPinned: boolean;
  isRead: boolean;
  validUntil?: string | null;
  generatedAt: string;
  createdAt: string;
}

export interface ReportSchedule {
  id: string;
  reportId: string;
  isActive: boolean;
  scheduleType: ScheduleType;
  scheduleTime: string;
  scheduleDayOfWeek?: number | null;
  scheduleDayOfMonth?: number | null;
  scheduleMonth?: number | null;
  timezone: string;
  scheduledDate?: string | null;
  deliveryMethod: 'email' | 'download' | 'webhook';
  recipients: string[];
  exportFormat: ExportFormat;
  includeFilters: boolean;
  includeTimestamp: boolean;
  emailSubject?: string | null;
  emailBody?: string | null;
  lastRunAt?: string | null;
  nextRunAt?: string | null;
  runCount: number;
  lastStatus?: string | null;
  lastError?: string | null;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReportDataCache {
  id: string;
  reportId: string;
  cacheKey: string;
  cachedData: any;
  rowCount: number;
  dataHash?: string | null;
  queryTimeMs?: number | null;
  cachedAt: string;
  expiresAt?: string | null;
}

// ============================================
// MAPPERS
// ============================================

const mapReportRow = (row: any): Report => ({
  id: row.id,
  name: row.name,
  description: row.description,
  reportType: row.report_type as ReportType,
  category: row.category as ReportCategory | null,
  dataSource: row.data_source || {},
  visualizationType: row.visualization_type as VisualizationType || 'bar',
  filters: row.filters || {},
  availableFilters: row.available_filters || [],
  columns: row.columns || [],
  sortBy: row.sort_by,
  sortDirection: row.sort_direction || 'desc',
  layout: row.layout || {},
  isPublic: row.is_public || false,
  sharedWith: row.shared_with || [],
  isTemplate: row.is_template || false,
  templateCategory: row.template_category,
  icon: row.icon,
  color: row.color,
  viewCount: row.view_count || 0,
  lastViewedAt: row.last_viewed_at,
  isFavorite: row.is_favorite || false,
  isPinned: row.is_pinned || false,
  createdBy: row.created_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapDashboardRow = (row: any): ReportDashboard => ({
  id: row.id,
  name: row.name,
  description: row.description,
  layoutType: row.layout_type || 'grid',
  columnCount: row.column_count || 3,
  rowHeight: row.row_height || 200,
  isPublic: row.is_public || false,
  sharedWith: row.shared_with || [],
  autoRefresh: row.auto_refresh || false,
  refreshIntervalSeconds: row.refresh_interval_seconds || 300,
  showHeader: row.show_header !== false,
  theme: row.theme || 'light',
  isDefault: row.is_default || false,
  viewCount: row.view_count || 0,
  lastViewedAt: row.last_viewed_at,
  createdBy: row.created_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  widgets: row.report_widgets?.map(mapWidgetRow),
});

const mapWidgetRow = (row: any): ReportWidget => ({
  id: row.id,
  dashboardId: row.dashboard_id,
  reportId: row.report_id,
  widgetType: row.widget_type,
  title: row.title,
  subtitle: row.subtitle,
  gridX: row.grid_x || 0,
  gridY: row.grid_y || 0,
  gridWidth: row.grid_width || 1,
  gridHeight: row.grid_height || 1,
  config: row.config || {},
  backgroundColor: row.background_color,
  borderColor: row.border_color,
  textColor: row.text_color,
  displayOrder: row.display_order || 0,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapKPIRow = (row: any): KPI => ({
  id: row.id,
  name: row.name,
  description: row.description,
  category: row.category,
  metricType: row.metric_type as KPIMetricType,
  dataSource: row.data_source,
  dataField: row.data_field,
  calculationFormula: row.calculation_formula,
  filterConditions: row.filter_conditions || {},
  targetValue: row.target_value ? parseFloat(row.target_value) : null,
  thresholdWarning: row.threshold_warning ? parseFloat(row.threshold_warning) : null,
  thresholdCritical: row.threshold_critical ? parseFloat(row.threshold_critical) : null,
  thresholdDirection: row.threshold_direction || 'above',
  displayFormat: row.display_format || 'number',
  decimalPlaces: row.decimal_places || 0,
  prefix: row.prefix,
  suffix: row.suffix,
  icon: row.icon,
  color: row.color,
  currentValue: row.current_value ? parseFloat(row.current_value) : null,
  previousValue: row.previous_value ? parseFloat(row.previous_value) : null,
  trendDirection: row.trend_direction as TrendDirection | null,
  trendPercentage: row.trend_percentage ? parseFloat(row.trend_percentage) : null,
  lastCalculatedAt: row.last_calculated_at,
  alertEnabled: row.alert_enabled || false,
  alertRecipients: row.alert_recipients || [],
  lastAlertSentAt: row.last_alert_sent_at,
  valueHistory: row.value_history || [],
  displayOrder: row.display_order || 0,
  isActive: row.is_active !== false,
  createdBy: row.created_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapInsightRow = (row: any): AIInsight => ({
  id: row.id,
  reportId: row.report_id,
  dashboardId: row.dashboard_id,
  insightType: row.insight_type as InsightType,
  insightTitle: row.insight_title,
  insightText: row.insight_text,
  confidenceScore: row.confidence_score ? parseFloat(row.confidence_score) : null,
  importance: row.importance || 'medium',
  relatedData: row.related_data || {},
  relatedMetrics: row.related_metrics || [],
  suggestedChartType: row.suggested_chart_type,
  suggestedAction: row.suggested_action,
  isDismissed: row.is_dismissed || false,
  dismissedAt: row.dismissed_at,
  dismissedBy: row.dismissed_by,
  isPinned: row.is_pinned || false,
  isRead: row.is_read || false,
  validUntil: row.valid_until,
  generatedAt: row.generated_at,
  createdAt: row.created_at,
});

const mapScheduleRow = (row: any): ReportSchedule => ({
  id: row.id,
  reportId: row.report_id,
  isActive: row.is_active !== false,
  scheduleType: row.schedule_type as ScheduleType,
  scheduleTime: row.schedule_time,
  scheduleDayOfWeek: row.schedule_day_of_week,
  scheduleDayOfMonth: row.schedule_day_of_month,
  scheduleMonth: row.schedule_month,
  timezone: row.timezone || 'America/New_York',
  scheduledDate: row.scheduled_date,
  deliveryMethod: row.delivery_method || 'email',
  recipients: row.recipients || [],
  exportFormat: row.export_format || 'pdf',
  includeFilters: row.include_filters !== false,
  includeTimestamp: row.include_timestamp !== false,
  emailSubject: row.email_subject,
  emailBody: row.email_body,
  lastRunAt: row.last_run_at,
  nextRunAt: row.next_run_at,
  runCount: row.run_count || 0,
  lastStatus: row.last_status,
  lastError: row.last_error,
  createdBy: row.created_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// ============================================
// SERVICE
// ============================================

export const reportService = {
  // ==========================================
  // REPORTS
  // ==========================================

  async getReports(options?: {
    type?: ReportType;
    category?: ReportCategory;
    templatesOnly?: boolean;
    favoritesOnly?: boolean;
    limit?: number;
  }): Promise<Report[]> {
    let query = supabase
      .from('reports')
      .select('*')
      .order('updated_at', { ascending: false });

    if (options?.type) {
      query = query.eq('report_type', options.type);
    }
    if (options?.category) {
      query = query.eq('category', options.category);
    }
    if (options?.templatesOnly) {
      query = query.eq('is_template', true);
    }
    if (options?.favoritesOnly) {
      query = query.eq('is_favorite', true);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapReportRow);
  },

  async getPredefinedReports(): Promise<Report[]> {
    return this.getReports({ templatesOnly: true });
  },

  async getReportsByCategory(category: ReportCategory): Promise<Report[]> {
    return this.getReports({ category, templatesOnly: true });
  },

  async getReportById(id: string): Promise<Report | null> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    // Update view count
    await supabase
      .from('reports')
      .update({
        view_count: (data.view_count || 0) + 1,
        last_viewed_at: new Date().toISOString(),
      })
      .eq('id', id);

    return mapReportRow(data);
  },

  async createReport(report: Partial<Report>): Promise<Report> {
    const { data, error } = await supabase
      .from('reports')
      .insert({
        name: report.name,
        description: report.description,
        report_type: report.reportType || 'custom',
        category: report.category,
        data_source: report.dataSource || {},
        visualization_type: report.visualizationType || 'bar',
        filters: report.filters || {},
        available_filters: report.availableFilters || [],
        columns: report.columns || [],
        sort_by: report.sortBy,
        sort_direction: report.sortDirection || 'desc',
        layout: report.layout || {},
        is_public: report.isPublic || false,
        shared_with: report.sharedWith || [],
        is_template: report.isTemplate || false,
        template_category: report.templateCategory,
        icon: report.icon,
        color: report.color,
        is_favorite: report.isFavorite || false,
        is_pinned: report.isPinned || false,
        created_by: report.createdBy,
      })
      .select()
      .single();

    if (error) throw error;
    return mapReportRow(data);
  },

  async updateReport(id: string, updates: Partial<Report>): Promise<Report> {
    const updateData: Record<string, any> = {};

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.dataSource !== undefined) updateData.data_source = updates.dataSource;
    if (updates.visualizationType !== undefined) updateData.visualization_type = updates.visualizationType;
    if (updates.filters !== undefined) updateData.filters = updates.filters;
    if (updates.availableFilters !== undefined) updateData.available_filters = updates.availableFilters;
    if (updates.columns !== undefined) updateData.columns = updates.columns;
    if (updates.sortBy !== undefined) updateData.sort_by = updates.sortBy;
    if (updates.sortDirection !== undefined) updateData.sort_direction = updates.sortDirection;
    if (updates.layout !== undefined) updateData.layout = updates.layout;
    if (updates.isPublic !== undefined) updateData.is_public = updates.isPublic;
    if (updates.sharedWith !== undefined) updateData.shared_with = updates.sharedWith;
    if (updates.icon !== undefined) updateData.icon = updates.icon;
    if (updates.color !== undefined) updateData.color = updates.color;
    if (updates.isFavorite !== undefined) updateData.is_favorite = updates.isFavorite;
    if (updates.isPinned !== undefined) updateData.is_pinned = updates.isPinned;

    const { data, error } = await supabase
      .from('reports')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapReportRow(data);
  },

  async deleteReport(id: string): Promise<void> {
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async toggleFavorite(id: string): Promise<Report> {
    const report = await this.getReportById(id);
    if (!report) throw new Error('Report not found');

    return this.updateReport(id, { isFavorite: !report.isFavorite });
  },

  // ==========================================
  // DASHBOARDS
  // ==========================================

  async getDashboards(): Promise<ReportDashboard[]> {
    const { data, error } = await supabase
      .from('report_dashboards')
      .select(`
        *,
        report_widgets(*)
      `)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapDashboardRow);
  },

  async getDashboardById(id: string): Promise<ReportDashboard | null> {
    const { data, error } = await supabase
      .from('report_dashboards')
      .select(`
        *,
        report_widgets(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return mapDashboardRow(data);
  },

  async createDashboard(dashboard: Partial<ReportDashboard>): Promise<ReportDashboard> {
    const { data, error } = await supabase
      .from('report_dashboards')
      .insert({
        name: dashboard.name,
        description: dashboard.description,
        layout_type: dashboard.layoutType || 'grid',
        column_count: dashboard.columnCount || 3,
        row_height: dashboard.rowHeight || 200,
        is_public: dashboard.isPublic || false,
        shared_with: dashboard.sharedWith || [],
        auto_refresh: dashboard.autoRefresh || false,
        refresh_interval_seconds: dashboard.refreshIntervalSeconds || 300,
        show_header: dashboard.showHeader !== false,
        theme: dashboard.theme || 'light',
        is_default: dashboard.isDefault || false,
        created_by: dashboard.createdBy,
      })
      .select()
      .single();

    if (error) throw error;
    return mapDashboardRow(data);
  },

  async updateDashboard(id: string, updates: Partial<ReportDashboard>): Promise<ReportDashboard> {
    const updateData: Record<string, any> = {};

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.layoutType !== undefined) updateData.layout_type = updates.layoutType;
    if (updates.columnCount !== undefined) updateData.column_count = updates.columnCount;
    if (updates.rowHeight !== undefined) updateData.row_height = updates.rowHeight;
    if (updates.isPublic !== undefined) updateData.is_public = updates.isPublic;
    if (updates.autoRefresh !== undefined) updateData.auto_refresh = updates.autoRefresh;
    if (updates.refreshIntervalSeconds !== undefined) updateData.refresh_interval_seconds = updates.refreshIntervalSeconds;
    if (updates.showHeader !== undefined) updateData.show_header = updates.showHeader;
    if (updates.theme !== undefined) updateData.theme = updates.theme;
    if (updates.isDefault !== undefined) updateData.is_default = updates.isDefault;

    const { data, error } = await supabase
      .from('report_dashboards')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        report_widgets(*)
      `)
      .single();

    if (error) throw error;
    return mapDashboardRow(data);
  },

  async deleteDashboard(id: string): Promise<void> {
    const { error } = await supabase
      .from('report_dashboards')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ==========================================
  // WIDGETS
  // ==========================================

  async addWidget(widget: Partial<ReportWidget>): Promise<ReportWidget> {
    const { data, error } = await supabase
      .from('report_widgets')
      .insert({
        dashboard_id: widget.dashboardId,
        report_id: widget.reportId,
        widget_type: widget.widgetType,
        title: widget.title,
        subtitle: widget.subtitle,
        grid_x: widget.gridX || 0,
        grid_y: widget.gridY || 0,
        grid_width: widget.gridWidth || 1,
        grid_height: widget.gridHeight || 1,
        config: widget.config || {},
        background_color: widget.backgroundColor,
        border_color: widget.borderColor,
        text_color: widget.textColor,
        display_order: widget.displayOrder || 0,
      })
      .select()
      .single();

    if (error) throw error;
    return mapWidgetRow(data);
  },

  async updateWidget(id: string, updates: Partial<ReportWidget>): Promise<ReportWidget> {
    const updateData: Record<string, any> = {};

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.subtitle !== undefined) updateData.subtitle = updates.subtitle;
    if (updates.gridX !== undefined) updateData.grid_x = updates.gridX;
    if (updates.gridY !== undefined) updateData.grid_y = updates.gridY;
    if (updates.gridWidth !== undefined) updateData.grid_width = updates.gridWidth;
    if (updates.gridHeight !== undefined) updateData.grid_height = updates.gridHeight;
    if (updates.config !== undefined) updateData.config = updates.config;
    if (updates.backgroundColor !== undefined) updateData.background_color = updates.backgroundColor;
    if (updates.borderColor !== undefined) updateData.border_color = updates.borderColor;
    if (updates.textColor !== undefined) updateData.text_color = updates.textColor;
    if (updates.displayOrder !== undefined) updateData.display_order = updates.displayOrder;

    const { data, error } = await supabase
      .from('report_widgets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapWidgetRow(data);
  },

  async deleteWidget(id: string): Promise<void> {
    const { error } = await supabase
      .from('report_widgets')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ==========================================
  // KPIs
  // ==========================================

  async getKPIs(options?: {
    category?: string;
    activeOnly?: boolean;
  }): Promise<KPI[]> {
    let query = supabase
      .from('kpis')
      .select('*')
      .order('display_order', { ascending: true });

    if (options?.category) {
      query = query.eq('category', options.category);
    }
    if (options?.activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapKPIRow);
  },

  async getKPIById(id: string): Promise<KPI | null> {
    const { data, error } = await supabase
      .from('kpis')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return mapKPIRow(data);
  },

  async createKPI(kpi: Partial<KPI>): Promise<KPI> {
    const { data, error } = await supabase
      .from('kpis')
      .insert({
        name: kpi.name,
        description: kpi.description,
        category: kpi.category,
        metric_type: kpi.metricType,
        data_source: kpi.dataSource,
        data_field: kpi.dataField,
        calculation_formula: kpi.calculationFormula,
        filter_conditions: kpi.filterConditions || {},
        target_value: kpi.targetValue,
        threshold_warning: kpi.thresholdWarning,
        threshold_critical: kpi.thresholdCritical,
        threshold_direction: kpi.thresholdDirection || 'above',
        display_format: kpi.displayFormat || 'number',
        decimal_places: kpi.decimalPlaces || 0,
        prefix: kpi.prefix,
        suffix: kpi.suffix,
        icon: kpi.icon,
        color: kpi.color,
        alert_enabled: kpi.alertEnabled || false,
        alert_recipients: kpi.alertRecipients || [],
        display_order: kpi.displayOrder || 0,
        is_active: kpi.isActive !== false,
        created_by: kpi.createdBy,
      })
      .select()
      .single();

    if (error) throw error;
    return mapKPIRow(data);
  },

  async updateKPI(id: string, updates: Partial<KPI>): Promise<KPI> {
    const updateData: Record<string, any> = {};

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.targetValue !== undefined) updateData.target_value = updates.targetValue;
    if (updates.thresholdWarning !== undefined) updateData.threshold_warning = updates.thresholdWarning;
    if (updates.thresholdCritical !== undefined) updateData.threshold_critical = updates.thresholdCritical;
    if (updates.thresholdDirection !== undefined) updateData.threshold_direction = updates.thresholdDirection;
    if (updates.displayFormat !== undefined) updateData.display_format = updates.displayFormat;
    if (updates.icon !== undefined) updateData.icon = updates.icon;
    if (updates.color !== undefined) updateData.color = updates.color;
    if (updates.alertEnabled !== undefined) updateData.alert_enabled = updates.alertEnabled;
    if (updates.alertRecipients !== undefined) updateData.alert_recipients = updates.alertRecipients;
    if (updates.displayOrder !== undefined) updateData.display_order = updates.displayOrder;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

    const { data, error } = await supabase
      .from('kpis')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapKPIRow(data);
  },

  async refreshKPI(id: string): Promise<KPI> {
    const { data, error } = await supabase.rpc('calculate_kpi_value', { p_kpi_id: id });
    if (error) throw error;

    const kpi = await this.getKPIById(id);
    if (!kpi) throw new Error('KPI not found');
    return kpi;
  },

  async refreshAllKPIs(): Promise<number> {
    const { data, error } = await supabase.rpc('refresh_all_kpis');
    if (error) throw error;
    return data || 0;
  },

  async deleteKPI(id: string): Promise<void> {
    const { error } = await supabase
      .from('kpis')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ==========================================
  // AI INSIGHTS
  // ==========================================

  async getInsights(options?: {
    reportId?: string;
    dashboardId?: string;
    type?: InsightType;
    includeRead?: boolean;
    limit?: number;
  }): Promise<AIInsight[]> {
    let query = supabase
      .from('ai_insights')
      .select('*')
      .eq('is_dismissed', false)
      .order('generated_at', { ascending: false });

    if (options?.reportId) {
      query = query.eq('report_id', options.reportId);
    }
    if (options?.dashboardId) {
      query = query.eq('dashboard_id', options.dashboardId);
    }
    if (options?.type) {
      query = query.eq('insight_type', options.type);
    }
    if (!options?.includeRead) {
      query = query.eq('is_read', false);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapInsightRow);
  },

  async createInsight(insight: Partial<AIInsight>): Promise<AIInsight> {
    const { data, error } = await supabase
      .from('ai_insights')
      .insert({
        report_id: insight.reportId,
        dashboard_id: insight.dashboardId,
        insight_type: insight.insightType,
        insight_title: insight.insightTitle,
        insight_text: insight.insightText,
        confidence_score: insight.confidenceScore,
        importance: insight.importance || 'medium',
        related_data: insight.relatedData || {},
        related_metrics: insight.relatedMetrics || [],
        suggested_chart_type: insight.suggestedChartType,
        suggested_action: insight.suggestedAction,
        valid_until: insight.validUntil,
      })
      .select()
      .single();

    if (error) throw error;
    return mapInsightRow(data);
  },

  async markInsightRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('ai_insights')
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw error;
  },

  async dismissInsight(id: string): Promise<void> {
    const { error } = await supabase
      .from('ai_insights')
      .update({
        is_dismissed: true,
        dismissed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
  },

  async toggleInsightPin(id: string): Promise<AIInsight> {
    const { data: current } = await supabase
      .from('ai_insights')
      .select('is_pinned')
      .eq('id', id)
      .single();

    const { data, error } = await supabase
      .from('ai_insights')
      .update({ is_pinned: !current?.is_pinned })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapInsightRow(data);
  },

  // ==========================================
  // SCHEDULES
  // ==========================================

  async getSchedules(reportId?: string): Promise<ReportSchedule[]> {
    let query = supabase
      .from('report_schedules')
      .select('*')
      .order('next_run_at', { ascending: true });

    if (reportId) {
      query = query.eq('report_id', reportId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapScheduleRow);
  },

  async createSchedule(schedule: Partial<ReportSchedule>): Promise<ReportSchedule> {
    const { data, error } = await supabase
      .from('report_schedules')
      .insert({
        report_id: schedule.reportId,
        is_active: schedule.isActive !== false,
        schedule_type: schedule.scheduleType,
        schedule_time: schedule.scheduleTime || '08:00:00',
        schedule_day_of_week: schedule.scheduleDayOfWeek,
        schedule_day_of_month: schedule.scheduleDayOfMonth,
        schedule_month: schedule.scheduleMonth,
        timezone: schedule.timezone || 'America/New_York',
        scheduled_date: schedule.scheduledDate,
        delivery_method: schedule.deliveryMethod || 'email',
        recipients: schedule.recipients || [],
        export_format: schedule.exportFormat || 'pdf',
        include_filters: schedule.includeFilters !== false,
        include_timestamp: schedule.includeTimestamp !== false,
        email_subject: schedule.emailSubject,
        email_body: schedule.emailBody,
        created_by: schedule.createdBy,
      })
      .select()
      .single();

    if (error) throw error;
    return mapScheduleRow(data);
  },

  async updateSchedule(id: string, updates: Partial<ReportSchedule>): Promise<ReportSchedule> {
    const updateData: Record<string, any> = {};

    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
    if (updates.scheduleType !== undefined) updateData.schedule_type = updates.scheduleType;
    if (updates.scheduleTime !== undefined) updateData.schedule_time = updates.scheduleTime;
    if (updates.scheduleDayOfWeek !== undefined) updateData.schedule_day_of_week = updates.scheduleDayOfWeek;
    if (updates.scheduleDayOfMonth !== undefined) updateData.schedule_day_of_month = updates.scheduleDayOfMonth;
    if (updates.scheduleMonth !== undefined) updateData.schedule_month = updates.scheduleMonth;
    if (updates.timezone !== undefined) updateData.timezone = updates.timezone;
    if (updates.recipients !== undefined) updateData.recipients = updates.recipients;
    if (updates.exportFormat !== undefined) updateData.export_format = updates.exportFormat;
    if (updates.emailSubject !== undefined) updateData.email_subject = updates.emailSubject;
    if (updates.emailBody !== undefined) updateData.email_body = updates.emailBody;

    const { data, error } = await supabase
      .from('report_schedules')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapScheduleRow(data);
  },

  async deleteSchedule(id: string): Promise<void> {
    const { error } = await supabase
      .from('report_schedules')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ==========================================
  // DATA CACHE
  // ==========================================

  async getCachedData(reportId: string, cacheKey: string): Promise<ReportDataCache | null> {
    const { data, error } = await supabase
      .from('report_data_cache')
      .select('*')
      .eq('report_id', reportId)
      .eq('cache_key', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  async setCachedData(
    reportId: string,
    cacheKey: string,
    data: any,
    expiresInMinutes: number = 15
  ): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);

    const { error } = await supabase
      .from('report_data_cache')
      .upsert({
        report_id: reportId,
        cache_key: cacheKey,
        cached_data: data,
        row_count: Array.isArray(data) ? data.length : 1,
        expires_at: expiresAt.toISOString(),
      }, {
        onConflict: 'report_id,cache_key',
      });

    if (error) throw error;
  },

  async clearCache(reportId?: string): Promise<void> {
    let query = supabase
      .from('report_data_cache')
      .delete();

    if (reportId) {
      query = query.eq('report_id', reportId);
    } else {
      query = query.lt('expires_at', new Date().toISOString());
    }

    const { error } = await query;
    if (error) throw error;
  },

  // ==========================================
  // REPORT DATA FETCHING
  // ==========================================

  async fetchReportData(
    report: Report,
    filters?: Record<string, any>
  ): Promise<{ data: any[]; totalCount: number }> {
    const dataSource = report.dataSource;
    const tableName = dataSource.table || dataSource.view;

    if (!tableName) {
      return { data: [], totalCount: 0 };
    }

    // Generate cache key
    const cacheKey = JSON.stringify({ ...dataSource, filters });

    // Check cache first
    const cached = await this.getCachedData(report.id, cacheKey);
    if (cached) {
      return { data: cached.cached_data, totalCount: cached.row_count };
    }

    // Build and execute query
    let query = supabase
      .from(tableName)
      .select('*', { count: 'exact' });

    // Apply filters
    const mergedFilters = { ...report.filters, ...filters };
    for (const [key, value] of Object.entries(mergedFilters)) {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'object' && 'start' in value && 'end' in value) {
          // Date range filter
          if (value.start) query = query.gte(key, value.start);
          if (value.end) query = query.lte(key, value.end);
        } else if (Array.isArray(value)) {
          query = query.in(key, value);
        } else {
          query = query.eq(key, value);
        }
      }
    }

    // Apply sorting
    if (report.sortBy) {
      query = query.order(report.sortBy, { ascending: report.sortDirection === 'asc' });
    }

    const startTime = Date.now();
    const { data, count, error } = await query;
    const queryTime = Date.now() - startTime;

    if (error) throw error;

    // Cache the result
    await this.setCachedData(report.id, cacheKey, data || []);

    return { data: data || [], totalCount: count || 0 };
  },

  // ==========================================
  // UTILITY FUNCTIONS
  // ==========================================

  formatValue(value: number, format: 'number' | 'currency' | 'percentage', decimalPlaces: number = 0): string {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: decimalPlaces,
          maximumFractionDigits: decimalPlaces,
        }).format(value);
      case 'percentage':
        return `${value.toFixed(decimalPlaces)}%`;
      case 'number':
      default:
        return new Intl.NumberFormat('en-US', {
          minimumFractionDigits: decimalPlaces,
          maximumFractionDigits: decimalPlaces,
        }).format(value);
    }
  },

  getKPIStatus(kpi: KPI): 'success' | 'warning' | 'critical' | 'neutral' {
    if (kpi.currentValue === null || kpi.currentValue === undefined) return 'neutral';
    if (kpi.thresholdCritical !== null && kpi.thresholdCritical !== undefined) {
      const breached = kpi.thresholdDirection === 'above'
        ? kpi.currentValue >= kpi.thresholdCritical
        : kpi.currentValue <= kpi.thresholdCritical;
      if (breached) return 'critical';
    }
    if (kpi.thresholdWarning !== null && kpi.thresholdWarning !== undefined) {
      const breached = kpi.thresholdDirection === 'above'
        ? kpi.currentValue >= kpi.thresholdWarning
        : kpi.currentValue <= kpi.thresholdWarning;
      if (breached) return 'warning';
    }
    return 'success';
  },

  // Chart type helpers
  getChartTypes(): Array<{ value: VisualizationType; label: string; icon: string }> {
    return [
      { value: 'line', label: 'Line Chart', icon: 'trending-up' },
      { value: 'bar', label: 'Bar Chart', icon: 'chart-bar' },
      { value: 'pie', label: 'Pie Chart', icon: 'chart-pie' },
      { value: 'donut', label: 'Donut Chart', icon: 'circle' },
      { value: 'area', label: 'Area Chart', icon: 'chart-area' },
      { value: 'scatter', label: 'Scatter Plot', icon: 'dots' },
      { value: 'bubble', label: 'Bubble Chart', icon: 'circle-dot' },
      { value: 'funnel', label: 'Funnel Chart', icon: 'filter' },
      { value: 'waterfall', label: 'Waterfall Chart', icon: 'bars-staggered' },
      { value: 'gantt', label: 'Gantt Chart', icon: 'calendar-range' },
      { value: 'heatmap', label: 'Heat Map', icon: 'grid' },
      { value: 'treemap', label: 'Tree Map', icon: 'squares-2x2' },
      { value: 'gauge', label: 'Gauge', icon: 'gauge' },
      { value: 'kpi', label: 'KPI Card', icon: 'hash' },
      { value: 'table', label: 'Data Table', icon: 'table' },
      { value: 'map', label: 'Geographic Map', icon: 'map' },
      { value: 'radar', label: 'Radar Chart', icon: 'radar' },
      { value: 'histogram', label: 'Histogram', icon: 'histogram' },
    ];
  },

  getReportCategories(): Array<{ value: ReportCategory; label: string; icon: string; color: string }> {
    return [
      { value: 'financial', label: 'Financial', icon: 'currency-dollar', color: 'green' },
      { value: 'donation', label: 'Donations', icon: 'heart', color: 'pink' },
      { value: 'client', label: 'Clients', icon: 'users', color: 'blue' },
      { value: 'project', label: 'Projects', icon: 'folder', color: 'cyan' },
      { value: 'team', label: 'Team', icon: 'user-group', color: 'indigo' },
      { value: 'impact', label: 'Impact', icon: 'trending-up', color: 'emerald' },
      { value: 'volunteer', label: 'Volunteers', icon: 'hand-raised', color: 'amber' },
      { value: 'case', label: 'Cases', icon: 'briefcase', color: 'slate' },
      { value: 'hr', label: 'HR & Ops', icon: 'building', color: 'purple' },
    ];
  },
};

export default reportService;
