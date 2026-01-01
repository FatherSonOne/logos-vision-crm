import { supabase } from './supabaseClient';
import type {
  AutomationRule,
  AutomationExecution,
  AutomationStats,
  EmailTemplate,
  TriggerType,
  ActionType,
  ExecutionStatus,
} from '../types';

// Helper to map database row to AutomationRule type
const mapRuleRow = (row: any): AutomationRule => ({
  id: row.id,
  name: row.name,
  description: row.description,
  triggerType: row.trigger_type as TriggerType,
  triggerConditions: row.trigger_conditions || {},
  actionType: row.action_type as ActionType,
  actionConfig: row.action_config || {},
  delayMinutes: row.delay_minutes || 0,
  templateId: row.template_id,
  assignToUserId: row.assign_to_user_id,
  isActive: row.is_active ?? true,
  priority: row.priority || 100,
  executionCount: row.execution_count || 0,
  lastExecutedAt: row.last_executed_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  templateName: row.template_name,
});

// Helper to map database row to AutomationExecution type
const mapExecutionRow = (row: any): AutomationExecution => ({
  id: row.id,
  ruleId: row.rule_id,
  ruleName: row.rule_name,
  clientId: row.client_id,
  clientName: row.client_name,
  clientEmail: row.client_email,
  triggerType: row.trigger_type as TriggerType,
  triggerData: row.trigger_data || {},
  triggerEntityId: row.trigger_entity_id,
  scheduledFor: row.scheduled_for,
  status: row.status as ExecutionStatus,
  executedAt: row.executed_at,
  resultData: row.result_data || {},
  errorMessage: row.error_message,
  retryCount: row.retry_count || 0,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// Helper to map database row to EmailTemplate type
const mapTemplateRow = (row: any): EmailTemplate => ({
  id: row.id,
  name: row.name,
  description: row.description,
  subject: row.subject,
  body: row.body,
  category: row.category || 'general',
  availableMergeFields: row.available_merge_fields || [],
  isActive: row.is_active ?? true,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const automationService = {
  // ==========================================
  // AUTOMATION RULES
  // ==========================================

  async getRules(filters?: { isActive?: boolean; triggerType?: TriggerType }): Promise<AutomationRule[]> {
    let query = supabase
      .from('automation_rules')
      .select(`
        *,
        email_templates!automation_rules_template_id_fkey(name)
      `)
      .order('priority', { ascending: true });

    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }
    if (filters?.triggerType) {
      query = query.eq('trigger_type', filters.triggerType);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map((row) => ({
      ...mapRuleRow(row),
      templateName: row.email_templates?.name,
    }));
  },

  async getRuleById(id: string): Promise<AutomationRule | null> {
    const { data, error } = await supabase
      .from('automation_rules')
      .select(`
        *,
        email_templates!automation_rules_template_id_fkey(name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return {
      ...mapRuleRow(data),
      templateName: data.email_templates?.name,
    };
  },

  async createRule(rule: Omit<AutomationRule, 'id' | 'executionCount' | 'lastExecutedAt' | 'createdAt' | 'updatedAt'>): Promise<AutomationRule> {
    const { data, error } = await supabase
      .from('automation_rules')
      .insert({
        name: rule.name,
        description: rule.description,
        trigger_type: rule.triggerType,
        trigger_conditions: rule.triggerConditions,
        action_type: rule.actionType,
        action_config: rule.actionConfig,
        delay_minutes: rule.delayMinutes,
        template_id: rule.templateId,
        assign_to_user_id: rule.assignToUserId,
        is_active: rule.isActive,
        priority: rule.priority,
      })
      .select()
      .single();

    if (error) throw error;
    return mapRuleRow(data);
  },

  async updateRule(id: string, updates: Partial<AutomationRule>): Promise<AutomationRule> {
    const updateData: any = {};

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.triggerType !== undefined) updateData.trigger_type = updates.triggerType;
    if (updates.triggerConditions !== undefined) updateData.trigger_conditions = updates.triggerConditions;
    if (updates.actionType !== undefined) updateData.action_type = updates.actionType;
    if (updates.actionConfig !== undefined) updateData.action_config = updates.actionConfig;
    if (updates.delayMinutes !== undefined) updateData.delay_minutes = updates.delayMinutes;
    if (updates.templateId !== undefined) updateData.template_id = updates.templateId;
    if (updates.assignToUserId !== undefined) updateData.assign_to_user_id = updates.assignToUserId;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
    if (updates.priority !== undefined) updateData.priority = updates.priority;

    const { data, error } = await supabase
      .from('automation_rules')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapRuleRow(data);
  },

  async deleteRule(id: string): Promise<void> {
    const { error } = await supabase
      .from('automation_rules')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async toggleRule(id: string, isActive: boolean): Promise<AutomationRule> {
    return this.updateRule(id, { isActive });
  },

  // ==========================================
  // AUTOMATION EXECUTIONS
  // ==========================================

  async getExecutions(filters?: {
    status?: ExecutionStatus;
    ruleId?: string;
    clientId?: string;
    limit?: number;
  }): Promise<AutomationExecution[]> {
    let query = supabase
      .from('automation_execution_summary')
      .select('*')
      .order('scheduled_for', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.ruleId) {
      query = query.eq('rule_id', filters.ruleId);
    }
    if (filters?.clientId) {
      query = query.eq('client_id', filters.clientId);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map(mapExecutionRow);
  },

  async getPendingExecutions(limit: number = 100): Promise<AutomationExecution[]> {
    const { data, error } = await supabase.rpc('get_pending_automations', { p_limit: limit });

    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.execution_id,
      ruleId: row.rule_id,
      ruleName: row.rule_name,
      clientId: row.client_id,
      clientName: row.client_name,
      clientEmail: row.client_email,
      triggerType: row.trigger_type as TriggerType,
      triggerData: row.trigger_data || {},
      triggerEntityId: row.trigger_entity_id,
      scheduledFor: '',
      status: 'pending' as ExecutionStatus,
      executedAt: null,
      resultData: {},
      errorMessage: null,
      retryCount: 0,
      createdAt: '',
      updatedAt: '',
      // Additional fields for processing
      actionType: row.action_type,
      templateId: row.template_id,
      assignToUserId: row.assign_to_user_id,
      actionConfig: row.action_config,
    }));
  },

  async queueAutomation(
    triggerType: TriggerType,
    clientId: string,
    triggerData: Record<string, any> = {},
    triggerEntityId?: string
  ): Promise<number> {
    const { data, error } = await supabase.rpc('queue_automation', {
      p_trigger_type: triggerType,
      p_client_id: clientId,
      p_trigger_data: triggerData,
      p_trigger_entity_id: triggerEntityId,
    });

    if (error) throw error;
    return data || 0;
  },

  async completeExecution(
    executionId: string,
    status: ExecutionStatus,
    resultData: Record<string, any> = {},
    errorMessage?: string
  ): Promise<boolean> {
    const { data, error } = await supabase.rpc('complete_automation_execution', {
      p_execution_id: executionId,
      p_status: status,
      p_result_data: resultData,
      p_error_message: errorMessage,
    });

    if (error) throw error;
    return data;
  },

  // ==========================================
  // EMAIL TEMPLATES
  // ==========================================

  async getTemplates(filters?: { category?: string; isActive?: boolean }): Promise<EmailTemplate[]> {
    let query = supabase
      .from('email_templates')
      .select('*')
      .order('name', { ascending: true });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map(mapTemplateRow);
  },

  async getTemplateById(id: string): Promise<EmailTemplate | null> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return mapTemplateRow(data);
  },

  async createTemplate(template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailTemplate> {
    const { data, error } = await supabase
      .from('email_templates')
      .insert({
        name: template.name,
        description: template.description,
        subject: template.subject,
        body: template.body,
        category: template.category,
        available_merge_fields: template.availableMergeFields,
        is_active: template.isActive,
      })
      .select()
      .single();

    if (error) throw error;
    return mapTemplateRow(data);
  },

  async updateTemplate(id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const updateData: any = {};

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.subject !== undefined) updateData.subject = updates.subject;
    if (updates.body !== undefined) updateData.body = updates.body;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.availableMergeFields !== undefined) updateData.available_merge_fields = updates.availableMergeFields;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

    const { data, error } = await supabase
      .from('email_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapTemplateRow(data);
  },

  async deleteTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ==========================================
  // STATISTICS
  // ==========================================

  async getStats(): Promise<AutomationStats> {
    // Get rules stats
    const { data: rules, error: rulesError } = await supabase
      .from('automation_rules')
      .select('is_active');

    if (rulesError) throw rulesError;

    // Get executions stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: executions, error: execError } = await supabase
      .from('automation_executions')
      .select('status, executed_at');

    if (execError) throw execError;

    const allRules = rules || [];
    const allExecutions = executions || [];

    const completedToday = allExecutions.filter(
      (e) => e.status === 'completed' && e.executed_at && new Date(e.executed_at) >= today
    ).length;

    const failedToday = allExecutions.filter(
      (e) => e.status === 'failed' && e.executed_at && new Date(e.executed_at) >= today
    ).length;

    return {
      totalRules: allRules.length,
      activeRules: allRules.filter((r) => r.is_active).length,
      pendingExecutions: allExecutions.filter((e) => e.status === 'pending').length,
      completedToday,
      failedToday,
      totalExecutions: allExecutions.length,
    };
  },

  // ==========================================
  // MERGE FIELDS HELPER
  // ==========================================

  renderTemplate(template: string, data: Record<string, any>): string {
    let result = template;
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(value ?? ''));
    }
    return result;
  },

  getDefaultMergeFields(): string[] {
    return [
      '{{donor_name}}',
      '{{donation_amount}}',
      '{{donation_date}}',
      '{{organization_name}}',
      '{{pledge_amount}}',
      '{{due_date}}',
      '{{campaign_name}}',
    ];
  },
};
