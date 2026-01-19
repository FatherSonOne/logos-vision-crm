import { supabase } from './supabaseClient';
import { Report } from './reportService';

// ============================================
// TYPES
// ============================================

export interface ReportTemplate extends Report {
  isTemplate: true;
  templateCategory: string;
}

export interface TemplateCustomization {
  name?: string;
  description?: string;
  filters?: Record<string, any>;
  columns?: string[];
  visualizationType?: Report['visualizationType'];
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// ============================================
// REPORT TEMPLATE SERVICE
// ============================================

export const reportTemplateService = {
  /**
   * Fetch a single template by name or ID
   * Templates are identified by name (e.g., 'Financial Summary') or template ID
   */
  async getTemplate(identifier: string): Promise<ReportTemplate | null> {
    try {
      // Try by ID first
      let query = supabase
        .from('reports')
        .select('*')
        .eq('is_template', true);

      // Check if identifier looks like a UUID
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

      if (isUUID) {
        query = query.eq('id', identifier);
      } else {
        // Search by name (case-insensitive)
        query = query.ilike('name', identifier);
      }

      const { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.warn(`Template not found: ${identifier}`);
          return null;
        }
        throw error;
      }

      return data as ReportTemplate;
    } catch (error) {
      console.error('Failed to fetch template:', error);
      throw error;
    }
  },

  /**
   * Get all available templates
   * Optionally filter by category
   */
  async getAllTemplates(category?: string): Promise<ReportTemplate[]> {
    try {
      let query = supabase
        .from('reports')
        .select('*')
        .eq('is_template', true)
        .order('name', { ascending: true });

      if (category) {
        query = query.eq('template_category', category);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []) as ReportTemplate[];
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      throw error;
    }
  },

  /**
   * Get templates by category
   */
  async getTemplatesByCategory(category: string): Promise<ReportTemplate[]> {
    return this.getAllTemplates(category);
  },

  /**
   * Create a new report instance from a template
   * Applies optional customizations while preserving template configuration
   */
  async instantiateTemplate(
    templateId: string,
    customizations?: TemplateCustomization,
    userId?: string
  ): Promise<Report> {
    try {
      // Fetch the template
      const template = await this.getTemplate(templateId);

      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }

      // Clone template configuration
      const newReport: Partial<Report> = {
        name: customizations?.name || `${template.name} (Copy)`,
        description: customizations?.description || template.description,
        reportType: 'custom', // User reports are custom, not predefined
        category: template.category,
        dataSource: { ...template.dataSource },
        visualizationType: customizations?.visualizationType || template.visualizationType,
        filters: customizations?.filters ? { ...template.filters, ...customizations.filters } : { ...template.filters },
        availableFilters: [...template.availableFilters],
        columns: customizations?.columns || [...template.columns],
        sortBy: customizations?.sortBy || template.sortBy,
        sortDirection: customizations?.sortDirection || template.sortDirection,
        layout: { ...template.layout },
        isPublic: false, // New reports are private by default
        sharedWith: [],
        isTemplate: false, // This is an instance, not a template
        templateCategory: null,
        icon: template.icon,
        color: template.color,
        isFavorite: false,
        isPinned: false,
        createdBy: userId,
      };

      // Insert the new report
      const { data, error } = await supabase
        .from('reports')
        .insert({
          name: newReport.name,
          description: newReport.description,
          report_type: newReport.reportType,
          category: newReport.category,
          data_source: newReport.dataSource,
          visualization_type: newReport.visualizationType,
          filters: newReport.filters,
          available_filters: newReport.availableFilters,
          columns: newReport.columns,
          sort_by: newReport.sortBy,
          sort_direction: newReport.sortDirection,
          layout: newReport.layout,
          is_public: newReport.isPublic,
          shared_with: newReport.sharedWith,
          is_template: newReport.isTemplate,
          template_category: newReport.templateCategory,
          icon: newReport.icon,
          color: newReport.color,
          is_favorite: newReport.isFavorite,
          is_pinned: newReport.isPinned,
          created_by: newReport.createdBy,
        })
        .select()
        .single();

      if (error) throw error;

      return data as Report;
    } catch (error) {
      console.error('Failed to instantiate template:', error);
      throw error;
    }
  },

  /**
   * Get popular/most used templates
   */
  async getPopularTemplates(limit: number = 5): Promise<ReportTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('is_template', true)
        .order('view_count', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []) as ReportTemplate[];
    } catch (error) {
      console.error('Failed to fetch popular templates:', error);
      throw error;
    }
  },

  /**
   * Search templates by name or description
   */
  async searchTemplates(query: string): Promise<ReportTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('is_template', true)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('name', { ascending: true });

      if (error) throw error;

      return (data || []) as ReportTemplate[];
    } catch (error) {
      console.error('Failed to search templates:', error);
      throw error;
    }
  },

  /**
   * Get template categories with counts
   */
  async getTemplateCategories(): Promise<Array<{ category: string; count: number }>> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('template_category')
        .eq('is_template', true)
        .not('template_category', 'is', null);

      if (error) throw error;

      // Count occurrences of each category
      const categoryCounts = (data || []).reduce((acc, row) => {
        const category = row.template_category;
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(categoryCounts).map(([category, count]) => ({
        category,
        count,
      }));
    } catch (error) {
      console.error('Failed to get template categories:', error);
      throw error;
    }
  },

  /**
   * Quick action helpers - create reports from well-known templates
   */
  async createFinancialSummary(customizations?: TemplateCustomization): Promise<Report> {
    return this.instantiateTemplate('Financial Summary', customizations);
  },

  async createDonationReport(customizations?: TemplateCustomization): Promise<Report> {
    return this.instantiateTemplate('Donation Report', customizations);
  },

  async createImpactReport(customizations?: TemplateCustomization): Promise<Report> {
    return this.instantiateTemplate('Impact Report', customizations);
  },
};

export default reportTemplateService;
