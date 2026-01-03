/**
 * Workflow Automation Service
 * ============================
 * Framework for automating project workflows with future Entomate integration.
 *
 * This service provides:
 * - Trigger definitions for automation events
 * - Action handlers for automated responses
 * - Integration points for external automation systems (Entomate)
 * - Event queue management
 *
 * ENTOMATE INTEGRATION:
 * The service is designed to be connected to F:\entomate for advanced
 * workflow orchestration. The interface follows a standard event-driven
 * architecture that Entomate can consume.
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface WorkflowTrigger {
  id: string;
  name: string;
  type: TriggerType;
  conditions: TriggerCondition[];
  enabled: boolean;
  createdAt: Date;
}

export type TriggerType =
  | 'phase_started'
  | 'phase_completed'
  | 'task_completed'
  | 'task_assigned'
  | 'due_date_approaching'
  | 'project_created'
  | 'project_completed'
  | 'milestone_reached'
  | 'budget_threshold'
  | 'custom';

export interface TriggerCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: string | number | boolean | string[];
}

export interface WorkflowAction {
  id: string;
  type: ActionType;
  config: ActionConfig;
  order: number;
}

export type ActionType =
  | 'send_email'
  | 'send_notification'
  | 'create_calendar_event'
  | 'create_task'
  | 'update_field'
  | 'assign_team_member'
  | 'create_document'
  | 'webhook'
  | 'entomate_trigger';

export interface ActionConfig {
  // Email action
  recipients?: string[];
  subject?: string;
  template?: string;

  // Notification action
  title?: string;
  message?: string;
  priority?: 'low' | 'medium' | 'high';

  // Calendar event
  eventTitle?: string;
  duration?: number; // minutes
  attendees?: string[];

  // Task creation
  taskTitle?: string;
  taskDescription?: string;
  assigneeId?: string;
  dueOffset?: number; // days from trigger

  // Field update
  targetField?: string;
  newValue?: string | number | boolean;

  // Webhook / Entomate
  url?: string;
  method?: 'GET' | 'POST' | 'PUT';
  payload?: Record<string, unknown>;
  headers?: Record<string, string>;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  projectId?: string; // Optional: apply to specific project
  templateId?: string; // Optional: apply to projects from template
  triggers: WorkflowTrigger[];
  actions: WorkflowAction[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowEvent {
  id: string;
  workflowId: string;
  triggerId: string;
  timestamp: Date;
  context: WorkflowEventContext;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: WorkflowEventResult;
}

export interface WorkflowEventContext {
  projectId: string;
  projectName: string;
  phaseId?: string;
  phaseName?: string;
  taskId?: string;
  taskTitle?: string;
  userId?: string;
  userName?: string;
  metadata?: Record<string, unknown>;
}

export interface WorkflowEventResult {
  success: boolean;
  actionsExecuted: number;
  errors?: string[];
  outputs?: Record<string, unknown>;
}

// ============================================================================
// ENTOMATE INTEGRATION INTERFACE
// ============================================================================

/**
 * Interface for Entomate integration
 * This can be implemented to connect to the Entomate system at F:\entomate
 */
export interface EntomateConnector {
  // Connection
  connect(config: EntomateConfig): Promise<boolean>;
  disconnect(): Promise<void>;
  isConnected(): boolean;

  // Event dispatch
  dispatchEvent(event: EntomateEvent): Promise<EntomateResponse>;

  // Workflow sync
  syncWorkflows(workflows: Workflow[]): Promise<void>;
  getRemoteWorkflows(): Promise<Workflow[]>;

  // Status
  getStatus(): EntomateStatus;
}

export interface EntomateConfig {
  endpoint: string;
  apiKey?: string;
  organizationId?: string;
  syncInterval?: number; // ms
}

export interface EntomateEvent {
  type: string;
  source: 'logos-vision-crm';
  timestamp: Date;
  data: Record<string, unknown>;
}

export interface EntomateResponse {
  success: boolean;
  eventId?: string;
  message?: string;
}

export interface EntomateStatus {
  connected: boolean;
  lastSync?: Date;
  pendingEvents: number;
  errors?: string[];
}

// ============================================================================
// WORKFLOW SERVICE
// ============================================================================

class WorkflowAutomationService {
  private workflows: Map<string, Workflow> = new Map();
  private eventQueue: WorkflowEvent[] = [];
  private entomateConnector: EntomateConnector | null = null;
  private listeners: Map<string, Set<(event: WorkflowEvent) => void>> = new Map();

  // ---- Workflow Management ----

  createWorkflow(workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>): Workflow {
    const newWorkflow: Workflow = {
      ...workflow,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.workflows.set(newWorkflow.id, newWorkflow);
    this.syncWithEntomate();
    return newWorkflow;
  }

  updateWorkflow(id: string, updates: Partial<Workflow>): Workflow | null {
    const workflow = this.workflows.get(id);
    if (!workflow) return null;

    const updated: Workflow = {
      ...workflow,
      ...updates,
      id: workflow.id,
      createdAt: workflow.createdAt,
      updatedAt: new Date(),
    };
    this.workflows.set(id, updated);
    this.syncWithEntomate();
    return updated;
  }

  deleteWorkflow(id: string): boolean {
    const deleted = this.workflows.delete(id);
    if (deleted) this.syncWithEntomate();
    return deleted;
  }

  getWorkflow(id: string): Workflow | undefined {
    return this.workflows.get(id);
  }

  getWorkflowsForProject(projectId: string): Workflow[] {
    return Array.from(this.workflows.values()).filter(
      w => w.enabled && (!w.projectId || w.projectId === projectId)
    );
  }

  getAllWorkflows(): Workflow[] {
    return Array.from(this.workflows.values());
  }

  // ---- Event Processing ----

  async triggerEvent(
    triggerType: TriggerType,
    context: WorkflowEventContext
  ): Promise<WorkflowEvent[]> {
    const triggeredEvents: WorkflowEvent[] = [];

    // Find matching workflows
    const matchingWorkflows = this.findMatchingWorkflows(triggerType, context);

    for (const workflow of matchingWorkflows) {
      const trigger = workflow.triggers.find(t => t.type === triggerType && t.enabled);
      if (!trigger) continue;

      // Check conditions
      if (!this.evaluateConditions(trigger.conditions, context)) continue;

      // Create event
      const event: WorkflowEvent = {
        id: this.generateId(),
        workflowId: workflow.id,
        triggerId: trigger.id,
        timestamp: new Date(),
        context,
        status: 'pending',
      };

      this.eventQueue.push(event);
      triggeredEvents.push(event);

      // Process event (async)
      this.processEvent(event, workflow);
    }

    return triggeredEvents;
  }

  private async processEvent(event: WorkflowEvent, workflow: Workflow): Promise<void> {
    event.status = 'processing';
    this.notifyListeners(event);

    const errors: string[] = [];
    let actionsExecuted = 0;

    // Sort actions by order
    const sortedActions = [...workflow.actions].sort((a, b) => a.order - b.order);

    for (const action of sortedActions) {
      try {
        await this.executeAction(action, event.context);
        actionsExecuted++;
      } catch (error) {
        errors.push(`Action ${action.id} failed: ${error}`);
      }
    }

    // Dispatch to Entomate if connected
    if (this.entomateConnector?.isConnected()) {
      try {
        await this.entomateConnector.dispatchEvent({
          type: `workflow_${event.status}`,
          source: 'logos-vision-crm',
          timestamp: new Date(),
          data: {
            event,
            workflow: workflow.name,
          },
        });
      } catch (error) {
        errors.push(`Entomate dispatch failed: ${error}`);
      }
    }

    event.status = errors.length > 0 ? 'failed' : 'completed';
    event.result = {
      success: errors.length === 0,
      actionsExecuted,
      errors: errors.length > 0 ? errors : undefined,
    };

    this.notifyListeners(event);
  }

  private async executeAction(action: WorkflowAction, context: WorkflowEventContext): Promise<void> {
    switch (action.type) {
      case 'send_notification':
        await this.sendNotification(action.config, context);
        break;
      case 'send_email':
        await this.sendEmail(action.config, context);
        break;
      case 'create_calendar_event':
        await this.createCalendarEvent(action.config, context);
        break;
      case 'create_task':
        await this.createTask(action.config, context);
        break;
      case 'webhook':
      case 'entomate_trigger':
        await this.callWebhook(action.config, context);
        break;
      default:
        console.log(`Action type ${action.type} not yet implemented`);
    }
  }

  // ---- Action Implementations ----

  private async sendNotification(config: ActionConfig, context: WorkflowEventContext): Promise<void> {
    // Implementation would integrate with notification system
    console.log('[Workflow] Sending notification:', {
      title: this.interpolate(config.title || '', context),
      message: this.interpolate(config.message || '', context),
      priority: config.priority,
    });
    // TODO: Integrate with actual notification service
  }

  private async sendEmail(config: ActionConfig, context: WorkflowEventContext): Promise<void> {
    // Implementation would integrate with email service
    console.log('[Workflow] Sending email:', {
      recipients: config.recipients,
      subject: this.interpolate(config.subject || '', context),
      template: config.template,
    });
    // TODO: Integrate with email service (SendGrid, etc.)
  }

  private async createCalendarEvent(config: ActionConfig, context: WorkflowEventContext): Promise<void> {
    // Implementation would integrate with Google Calendar
    console.log('[Workflow] Creating calendar event:', {
      title: this.interpolate(config.eventTitle || '', context),
      duration: config.duration,
      attendees: config.attendees,
    });
    // TODO: Integrate with Google Calendar service
  }

  private async createTask(config: ActionConfig, context: WorkflowEventContext): Promise<void> {
    // Implementation would create a task in the system
    console.log('[Workflow] Creating task:', {
      title: this.interpolate(config.taskTitle || '', context),
      description: this.interpolate(config.taskDescription || '', context),
      assignee: config.assigneeId,
      dueOffset: config.dueOffset,
    });
    // TODO: Integrate with task/case management
  }

  private async callWebhook(config: ActionConfig, context: WorkflowEventContext): Promise<void> {
    if (!config.url) return;

    const payload = config.payload
      ? JSON.parse(this.interpolate(JSON.stringify(config.payload), context))
      : context;

    // In a real implementation, this would make an HTTP request
    console.log('[Workflow] Calling webhook:', {
      url: config.url,
      method: config.method || 'POST',
      payload,
    });

    // TODO: Implement actual HTTP call
    // await fetch(config.url, {
    //   method: config.method || 'POST',
    //   headers: { 'Content-Type': 'application/json', ...config.headers },
    //   body: JSON.stringify(payload),
    // });
  }

  // ---- Helper Methods ----

  private findMatchingWorkflows(triggerType: TriggerType, context: WorkflowEventContext): Workflow[] {
    return Array.from(this.workflows.values()).filter(workflow => {
      if (!workflow.enabled) return false;
      if (workflow.projectId && workflow.projectId !== context.projectId) return false;
      return workflow.triggers.some(t => t.type === triggerType && t.enabled);
    });
  }

  private evaluateConditions(conditions: TriggerCondition[], context: WorkflowEventContext): boolean {
    if (conditions.length === 0) return true;

    return conditions.every(condition => {
      const value = this.getContextValue(condition.field, context);

      switch (condition.operator) {
        case 'equals':
          return value === condition.value;
        case 'contains':
          return String(value).includes(String(condition.value));
        case 'greater_than':
          return Number(value) > Number(condition.value);
        case 'less_than':
          return Number(value) < Number(condition.value);
        case 'in':
          return Array.isArray(condition.value) && condition.value.includes(String(value));
        case 'not_in':
          return Array.isArray(condition.value) && !condition.value.includes(String(value));
        default:
          return true;
      }
    });
  }

  private getContextValue(field: string, context: WorkflowEventContext): unknown {
    const parts = field.split('.');
    let value: unknown = context;

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = (value as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  private interpolate(template: string, context: WorkflowEventContext): string {
    return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_, key) => {
      const value = this.getContextValue(key, context);
      return value !== undefined ? String(value) : '';
    });
  }

  private generateId(): string {
    return `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ---- Event Listeners ----

  subscribe(eventType: string, callback: (event: WorkflowEvent) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);

    return () => {
      this.listeners.get(eventType)?.delete(callback);
    };
  }

  private notifyListeners(event: WorkflowEvent): void {
    const callbacks = this.listeners.get(event.status);
    if (callbacks) {
      callbacks.forEach(cb => cb(event));
    }

    // Also notify 'all' listeners
    const allCallbacks = this.listeners.get('all');
    if (allCallbacks) {
      allCallbacks.forEach(cb => cb(event));
    }
  }

  // ---- Entomate Integration ----

  setEntomateConnector(connector: EntomateConnector): void {
    this.entomateConnector = connector;
  }

  private async syncWithEntomate(): Promise<void> {
    if (this.entomateConnector?.isConnected()) {
      try {
        await this.entomateConnector.syncWorkflows(this.getAllWorkflows());
      } catch (error) {
        console.error('[Workflow] Entomate sync failed:', error);
      }
    }
  }

  getEntomateStatus(): EntomateStatus | null {
    return this.entomateConnector?.getStatus() ?? null;
  }

  // ---- Predefined Workflows ----

  static getDefaultWorkflows(): Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>[] {
    return [
      {
        name: 'Phase Completion Notification',
        description: 'Notify team when a project phase is completed',
        triggers: [{
          id: 'trigger_phase_complete',
          name: 'Phase Completed',
          type: 'phase_completed',
          conditions: [],
          enabled: true,
          createdAt: new Date(),
        }],
        actions: [{
          id: 'action_notify_team',
          type: 'send_notification',
          config: {
            title: 'Phase Completed',
            message: '{{phaseName}} has been completed for project {{projectName}}',
            priority: 'medium',
          },
          order: 1,
        }],
        enabled: true,
      },
      {
        name: 'Due Date Reminder',
        description: 'Send reminders for approaching due dates',
        triggers: [{
          id: 'trigger_due_date',
          name: 'Due Date Approaching',
          type: 'due_date_approaching',
          conditions: [],
          enabled: true,
          createdAt: new Date(),
        }],
        actions: [{
          id: 'action_remind',
          type: 'send_email',
          config: {
            subject: 'Reminder: {{taskTitle}} is due soon',
            template: 'due_date_reminder',
          },
          order: 1,
        }],
        enabled: true,
      },
      {
        name: 'Project Kickoff',
        description: 'Actions when a new project is created',
        triggers: [{
          id: 'trigger_project_created',
          name: 'Project Created',
          type: 'project_created',
          conditions: [],
          enabled: true,
          createdAt: new Date(),
        }],
        actions: [
          {
            id: 'action_kickoff_meeting',
            type: 'create_calendar_event',
            config: {
              eventTitle: 'Project Kickoff: {{projectName}}',
              duration: 60,
            },
            order: 1,
          },
          {
            id: 'action_notify_stakeholders',
            type: 'send_notification',
            config: {
              title: 'New Project Started',
              message: 'A new project has been created: {{projectName}}',
              priority: 'high',
            },
            order: 2,
          },
        ],
        enabled: true,
      },
    ];
  }
}

// Export singleton instance
export const workflowAutomationService = new WorkflowAutomationService();

// Initialize default workflows
WorkflowAutomationService.getDefaultWorkflows().forEach(workflow => {
  workflowAutomationService.createWorkflow(workflow);
});

export default workflowAutomationService;
