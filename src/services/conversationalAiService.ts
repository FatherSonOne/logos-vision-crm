/**
 * Conversational AI Service
 * Natural language processing for CRM using Gemini 2.0 Flash
 */

import { GoogleGenAI } from '@google/genai';

interface ConversationContext {
  tasks?: any[];
  projects?: any[];
  contacts?: any[];
  events?: any[];
  currentUser?: any;
  recentActivity?: any[];
}

interface AiResponse {
  content: string;
  intent: string;
  entities: Record<string, any>;
  actions?: AiAction[];
  confidence: number;
}

interface AiAction {
  type: 'create_task' | 'filter_data' | 'navigate' | 'generate_report' | 'update_record' | 'schedule_event';
  label: string;
  data: any;
  onExecute: () => void;
}

class ConversationalAiService {
  private genai: GoogleGenAI | null = null;
  private model: any = null;
  private conversationHistory: Array<{ role: string; content: string }> = [];
  private initialized = false;

  constructor() {
    // Lazy initialization - don't initialize until first use
  }

  /**
   * Initialize the AI service (called on first use)
   */
  private initialize(): void {
    if (this.initialized) return;

    try {
      const apiKey = import.meta.env.VITE_API_KEY || '';

      if (!apiKey) {
        console.warn('Google Gemini API key not found. AI features will be disabled.');
        this.initialized = true;
        return;
      }

      this.genai = new GoogleGenAI(apiKey);
      this.model = this.genai.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
        },
      });
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize AI service:', error);
      this.initialized = true; // Mark as initialized even on error to prevent retry loops
    }
  }

  /**
   * Process user message and generate AI response
   */
  async processMessage(
    message: string,
    context: ConversationContext
  ): Promise<AiResponse> {
    // Initialize on first use
    this.initialize();

    // Check if AI is available
    if (!this.model) {
      console.warn('AI model not available. Using fallback response.');
      return {
        content: "AI features are currently unavailable. Please ensure the VITE_API_KEY environment variable is set with a valid Google Gemini API key.",
        intent: 'error',
        entities: {},
        confidence: 0,
      };
    }

    try {
      // Build context-aware prompt
      const prompt = this.buildPrompt(message, context);

      // Add to conversation history
      this.conversationHistory.push({ role: 'user', content: message });

      // Generate AI response
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      // Add AI response to history
      this.conversationHistory.push({ role: 'assistant', content: response });

      // Parse response and extract intent/entities
      const parsed = this.parseResponse(response, context);

      return parsed;
    } catch (error) {
      console.error('AI processing error:', error);
      return {
        content: "I apologize, but I encountered an error processing your request. Please try again or rephrase your question.",
        intent: 'error',
        entities: {},
        confidence: 0,
      };
    }
  }

  /**
   * Build context-aware prompt for Gemini
   */
  private buildPrompt(message: string, context: ConversationContext): string {
    const systemContext = `You are an AI assistant for a CRM system helping users manage tasks, projects, contacts, and calendar events.

Current Context:
- User has ${context.tasks?.length || 0} tasks
- User has ${context.projects?.length || 0} projects
- User has ${context.contacts?.length || 0} contacts
- Current user: ${context.currentUser?.name || 'Unknown'}

Available Actions:
1. Create/update/delete tasks
2. Filter and search data
3. Navigate to different pages
4. Generate reports
5. Schedule events
6. Analyze data and provide insights

When responding:
- Be concise and helpful
- Provide actionable suggestions
- Include specific data when relevant
- Offer to execute actions when appropriate
- Use a friendly, professional tone

User Message: ${message}

Conversation History:
${this.conversationHistory.slice(-6).map(h => `${h.role}: ${h.content}`).join('\n')}

Please respond to the user's message. If the user wants to perform an action, clearly state what action you'll take and ask for confirmation.`;

    return systemContext;
  }

  /**
   * Parse AI response and extract structured data
   */
  private parseResponse(response: string, context: ConversationContext): AiResponse {
    const lowerResponse = response.toLowerCase();
    let intent = 'general';
    let confidence = 0.8;
    const entities: Record<string, any> = {};
    const actions: AiAction[] = [];

    // Intent detection
    if (lowerResponse.includes('create') && (lowerResponse.includes('task') || lowerResponse.includes('todo'))) {
      intent = 'create_task';
      confidence = 0.9;

      // Extract task details
      entities.taskTitle = this.extractTaskTitle(response);
      entities.assignee = this.extractAssignee(response, context);
      entities.dueDate = this.extractDate(response);
      entities.priority = this.extractPriority(response);

      actions.push({
        type: 'create_task',
        label: 'Create Task',
        data: entities,
        onExecute: () => console.log('Creating task:', entities),
      });
    } else if (lowerResponse.includes('show') || lowerResponse.includes('find') || lowerResponse.includes('list')) {
      intent = 'filter_data';
      confidence = 0.85;

      // Extract filter criteria
      if (lowerResponse.includes('overdue')) {
        entities.filter = 'overdue';
        const overdueTasks = context.tasks?.filter(t => t.status === 'overdue') || [];
        entities.results = overdueTasks;

        actions.push({
          type: 'filter_data',
          label: `View ${overdueTasks.length} Overdue Tasks`,
          data: { filter: 'overdue' },
          onExecute: () => console.log('Filtering overdue tasks'),
        });
      } else if (lowerResponse.includes('critical') || lowerResponse.includes('urgent')) {
        entities.filter = 'critical';
        const criticalTasks = context.tasks?.filter(t => t.priority === 'critical' || t.priority === 'high') || [];
        entities.results = criticalTasks;

        actions.push({
          type: 'filter_data',
          label: `View ${criticalTasks.length} Critical Tasks`,
          data: { filter: 'critical' },
          onExecute: () => console.log('Filtering critical tasks'),
        });
      }
    } else if (lowerResponse.includes('calendar') || lowerResponse.includes('schedule') || lowerResponse.includes('meeting')) {
      intent = 'calendar';
      confidence = 0.9;

      actions.push({
        type: 'navigate',
        label: 'Open Calendar',
        data: { page: 'calendar' },
        onExecute: () => console.log('Navigating to calendar'),
      });
    } else if (lowerResponse.includes('report') || lowerResponse.includes('summary') || lowerResponse.includes('overview')) {
      intent = 'generate_report';
      confidence = 0.85;

      actions.push({
        type: 'generate_report',
        label: 'Generate Report',
        data: { type: 'summary' },
        onExecute: () => console.log('Generating report'),
      });
    }

    return {
      content: response,
      intent,
      entities,
      actions,
      confidence,
    };
  }

  /**
   * Extract task title from message
   */
  private extractTaskTitle(message: string): string {
    // Simple extraction - look for quotes or text after "to"
    const quotedMatch = message.match(/"([^"]+)"/);
    if (quotedMatch) return quotedMatch[1];

    const toMatch = message.match(/to\s+([^,.\n]+)/i);
    if (toMatch) return toMatch[1].trim();

    return 'New Task';
  }

  /**
   * Extract assignee from message
   */
  private extractAssignee(message: string, context: ConversationContext): string | null {
    const forMatch = message.match(/for\s+(\w+)/i);
    if (forMatch) {
      const name = forMatch[1];
      // Try to find matching team member
      const member = context.currentUser?.name?.toLowerCase().includes(name.toLowerCase());
      return member ? context.currentUser.id : null;
    }
    return null;
  }

  /**
   * Extract date from message
   */
  private extractDate(message: string): Date | null {
    const today = new Date();
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('today')) {
      return today;
    } else if (lowerMessage.includes('tomorrow')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    } else if (lowerMessage.includes('next week')) {
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek;
    } else if (lowerMessage.includes('friday') || lowerMessage.includes('this friday')) {
      const friday = new Date(today);
      const daysUntilFriday = (5 - friday.getDay() + 7) % 7 || 7;
      friday.setDate(friday.getDate() + daysUntilFriday);
      return friday;
    }

    // Try to extract specific date patterns (MM/DD, MM-DD, etc.)
    const dateMatch = message.match(/(\d{1,2})[\/\-](\d{1,2})/);
    if (dateMatch) {
      const month = parseInt(dateMatch[1]) - 1;
      const day = parseInt(dateMatch[2]);
      return new Date(today.getFullYear(), month, day);
    }

    return null;
  }

  /**
   * Extract priority from message
   */
  private extractPriority(message: string): 'low' | 'medium' | 'high' | 'critical' {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('critical') || lowerMessage.includes('urgent') || lowerMessage.includes('asap')) {
      return 'critical';
    } else if (lowerMessage.includes('high priority') || lowerMessage.includes('important')) {
      return 'high';
    } else if (lowerMessage.includes('low priority') || lowerMessage.includes('when possible')) {
      return 'low';
    }

    return 'medium';
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Get conversation history
   */
  getHistory(): Array<{ role: string; content: string }> {
    return [...this.conversationHistory];
  }

  /**
   * Generate smart suggestions based on context
   */
  async generateSuggestions(context: ConversationContext): Promise<string[]> {
    const suggestions: string[] = [];

    // Task-based suggestions
    const overdueTasks = context.tasks?.filter(t => t.status === 'overdue') || [];
    if (overdueTasks.length > 0) {
      suggestions.push(`Show ${overdueTasks.length} overdue tasks`);
    }

    const criticalTasks = context.tasks?.filter(t => t.priority === 'critical') || [];
    if (criticalTasks.length > 0) {
      suggestions.push(`View ${criticalTasks.length} critical tasks`);
    }

    // Calendar-based suggestions
    suggestions.push("What's on my calendar today?");
    suggestions.push("Schedule a meeting");

    // Project-based suggestions
    if (context.projects && context.projects.length > 0) {
      suggestions.push("Project status summary");
    }

    // General suggestions
    suggestions.push("Create a new task");
    suggestions.push("Generate weekly report");

    return suggestions.slice(0, 4); // Return top 4 suggestions
  }
}

// Singleton instance
export const conversationalAiService = new ConversationalAiService();

// Export types
export type { ConversationContext, AiResponse, AiAction };
