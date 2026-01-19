// Task Automation Service - Automated workflows and intelligent task management
// Implements Phase 6: Automation & Workflows with 5 core automation features

import { taskManagementService, ExtendedTask, TaskStatus } from './taskManagementService';
import taskAiService, { TeamMember } from './taskAiService';
import { supabase } from './supabaseClient';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface EscalationNotification {
  taskId: string;
  escalatedTo: string;
  reason: string;
  daysOverdue: number;
  message: string;
}

export interface EscalationResult {
  escalated: number;
  notifications: EscalationNotification[];
}

export interface AutoAssignmentResult {
  assigned: boolean;
  assignedTo?: string;
  confidence: number;
  reasoning: string;
}

export interface DeadlineAdjustment {
  taskId: string;
  taskTitle: string;
  currentDeadline: string;
  suggestedDeadline: string;
  reason: string;
  confidence: number;
}

export interface TaskDependency {
  taskId: string;
  taskTitle: string;
  dependsOn: string[];
  reasoning: string;
}

export interface TaskReassignment {
  taskId: string;
  taskTitle: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  reasoning: string;
}

export interface WorkloadRebalanceResult {
  reassignments: TaskReassignment[];
  expectedImprovement: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Create notification entry in task activity log
 */
async function createNotification(params: {
  type: string;
  taskId: string;
  userId: string;
  message: string;
  priority?: string;
}): Promise<void> {
  try {
    await supabase.from('task_activity').insert({
      task_id: params.taskId,
      user_id: params.userId,
      activity_type: params.type,
      description: params.message,
      metadata: {
        priority: params.priority,
        notification: true,
      },
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

/**
 * Log automation activity to task_activity table
 */
async function logAutomationActivity(params: {
  taskId: string;
  activityType: string;
  description: string;
  metadata?: any;
}): Promise<void> {
  try {
    await supabase.from('task_activity').insert({
      task_id: params.taskId,
      activity_type: params.activityType,
      description: params.description,
      metadata: {
        ...params.metadata,
        automated: true,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error logging automation activity:', error);
  }
}

/**
 * Calculate days between two dates
 */
function daysBetween(date1: string, date2: string = new Date().toISOString()): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// ============================================
// AUTOMATION 1: OVERDUE TASK ESCALATION
// ============================================

/**
 * Analyzes whether a task needs escalation using AI
 */
async function analyzeEscalationNeeds(task: ExtendedTask): Promise<{
  shouldEscalate: boolean;
  escalateTo: string;
  reason: string;
  message: string;
}> {
  const daysOverdue = daysBetween(task.dueDate);
  const progressPercentage = task.timeEstimate > 0
    ? ((task.timeSpent / task.timeEstimate) * 100)
    : 0;

  const prompt = `
You are an AI task management assistant. Determine if this overdue task needs escalation.

**Task Details:**
- Title: ${task.title}
- Priority: ${task.priority}
- Days Overdue: ${daysOverdue}
- Progress: ${progressPercentage.toFixed(0)}%
- Time Spent: ${task.timeSpent}h / ${task.timeEstimate}h
- Assignee: ${task.assignedToName}
- Department: ${task.department}
- Subtasks: ${task.subtasks.filter(s => s.completed).length}/${task.subtasks.length} completed

**Escalation Criteria:**
1. Critical/High priority tasks overdue >3 days should escalate
2. Medium priority tasks overdue >7 days should escalate
3. Tasks with <20% progress after being >50% through time should escalate
4. Tasks blocking other work should escalate immediately

**Decision Guidelines:**
- If task shows recent progress (>50% complete), may not need escalation
- If assignee is actively working (recent activity), may just need deadline extension
- If no progress and overdue, definitely escalate

Return ONLY a valid JSON object:
{
  "shouldEscalate": true,
  "escalateTo": "Department Manager",
  "reason": "Critical task overdue 5 days with minimal progress",
  "message": "Task requires immediate attention and possible reassignment"
}
`;

  try {
    const ai = await import('@google/genai');
    const GoogleGenAI = ai.GoogleGenAI;
    const apiKey = import.meta.env.VITE_API_KEY;
    if (!apiKey) {
      return {
        shouldEscalate: false,
        escalateTo: '',
        reason: 'AI service unavailable',
        message: '',
      };
    }
    const genAI = new GoogleGenAI({ apiKey });

    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
    });

    const text = response.text.trim();
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
    const jsonText = jsonMatch ? jsonMatch[1] : text;
    const result = JSON.parse(jsonText);

    return result;
  } catch (error) {
    console.error('AI escalation analysis error:', error);
    // Fallback logic
    return {
      shouldEscalate: daysOverdue > 7 || (task.priority === 'critical' && daysOverdue > 3),
      escalateTo: 'Project Manager',
      reason: `Task overdue ${daysOverdue} days`,
      message: 'Please review this overdue task',
    };
  }
}

/**
 * Identifies and escalates overdue tasks
 * Runs daily or on-demand to flag tasks that need management attention
 */
export async function escalateOverdueTasks(): Promise<EscalationResult> {
  try {
    const overdueTasks = await taskManagementService.getOverdue();
    const notifications: EscalationNotification[] = [];
    let escalatedCount = 0;

    // Process each overdue task
    for (const task of overdueTasks) {
      const daysOverdue = daysBetween(task.dueDate);

      // Use AI to determine if escalation is needed
      const escalation = await analyzeEscalationNeeds(task);

      if (escalation.shouldEscalate) {
        escalatedCount++;

        // Create notification for manager
        await createNotification({
          type: 'task_escalation',
          taskId: task.id,
          userId: task.assignedToId, // Notify current assignee
          message: `Task "${task.title}" escalated: ${escalation.message}`,
          priority: 'high',
        });

        // Log escalation activity
        await logAutomationActivity({
          taskId: task.id,
          activityType: 'escalated',
          description: `Automatically escalated due to: ${escalation.reason}`,
          metadata: {
            daysOverdue,
            escalatedTo: escalation.escalateTo,
            aiReasoning: escalation.reason,
          },
        });

        notifications.push({
          taskId: task.id,
          escalatedTo: escalation.escalateTo,
          reason: escalation.reason,
          daysOverdue,
          message: escalation.message,
        });
      }
    }

    return {
      escalated: escalatedCount,
      notifications,
    };
  } catch (error) {
    console.error('Error in escalateOverdueTasks:', error);
    return {
      escalated: 0,
      notifications: [],
    };
  }
}

// ============================================
// AUTOMATION 2: SMART TASK ASSIGNMENT
// ============================================

/**
 * Automatically assigns a newly created task to the best team member
 * Triggered when a new task is created without an assignee
 */
export async function autoAssignNewTask(
  taskId: string,
  availableTeamMembers: TeamMember[]
): Promise<AutoAssignmentResult> {
  try {
    // Get the task details
    const task = await taskManagementService.getById(taskId);
    if (!task) {
      return {
        assigned: false,
        confidence: 0,
        reasoning: 'Task not found',
      };
    }

    // Skip if already assigned
    if (task.assignedToId && task.assignedToId !== '') {
      return {
        assigned: false,
        confidence: 0,
        reasoning: 'Task already has an assignee',
      };
    }

    // Get AI assignment recommendation
    const assignment = await taskAiService.suggestBestAssignee(task, availableTeamMembers);

    if (!assignment.recommendedAssignees || assignment.recommendedAssignees.length === 0) {
      return {
        assigned: false,
        confidence: 0,
        reasoning: 'No suitable assignees found',
      };
    }

    const bestAssignee = assignment.recommendedAssignees[0];

    // Only auto-assign if confidence is high (>80%)
    if (bestAssignee.score >= 80) {
      // Update task with assignment
      await taskManagementService.update(taskId, {
        assignedToId: bestAssignee.userId,
      });

      // Create notification for assignee
      await createNotification({
        type: 'task_auto_assigned',
        taskId,
        userId: bestAssignee.userId,
        message: `You've been assigned: "${task.title}". AI Reasoning: ${bestAssignee.reasoning}`,
        priority: task.priority,
      });

      // Log auto-assignment
      await logAutomationActivity({
        taskId,
        activityType: 'auto_assigned',
        description: `AI assigned to ${bestAssignee.name} (confidence: ${bestAssignee.score}%)`,
        metadata: {
          assigneeId: bestAssignee.userId,
          assigneeName: bestAssignee.name,
          confidence: bestAssignee.score,
          reasoning: bestAssignee.reasoning,
        },
      });

      return {
        assigned: true,
        assignedTo: bestAssignee.name,
        confidence: bestAssignee.score,
        reasoning: bestAssignee.reasoning,
      };
    }

    return {
      assigned: false,
      confidence: bestAssignee.score,
      reasoning: `Confidence too low (${bestAssignee.score}%) for auto-assignment. Manual review needed.`,
    };
  } catch (error) {
    console.error('Error in autoAssignNewTask:', error);
    return {
      assigned: false,
      confidence: 0,
      reasoning: 'Error during auto-assignment',
    };
  }
}

// ============================================
// AUTOMATION 3: DEADLINE ADJUSTMENT SUGGESTIONS
// ============================================

/**
 * Analyzes in-progress tasks and suggests deadline adjustments
 * Runs weekly or on-demand to proactively identify timeline risks
 */
export async function suggestDeadlineAdjustments(): Promise<DeadlineAdjustment[]> {
  try {
    const inProgressTasks = await taskManagementService.getByStatus('in_progress' as TaskStatus);
    const suggestions: DeadlineAdjustment[] = [];

    for (const task of inProgressTasks) {
      // Skip tasks without enough data
      if (!task.timeEstimate || task.timeEstimate === 0) continue;

      // Get AI prediction for completion
      const prediction = await taskAiService.predictTaskCompletion(task, {
        avgCompletionTime: 5, // Default - could be calculated from history
        tasksCompleted: 20,
        currentWorkload: 8,
      });

      const currentDue = new Date(task.dueDate);
      const predictedDue = new Date(prediction.predictedDate);
      const daysDifference = daysBetween(task.dueDate, prediction.predictedDate);

      // Suggest adjustment if predicted date is >2 days different from current deadline
      if (daysDifference > 2) {
        suggestions.push({
          taskId: task.id,
          taskTitle: task.title,
          currentDeadline: task.dueDate,
          suggestedDeadline: prediction.predictedDate,
          reason: prediction.recommendation,
          confidence: prediction.confidence,
        });

        // Log suggestion
        await logAutomationActivity({
          taskId: task.id,
          activityType: 'deadline_suggestion',
          description: `AI suggests adjusting deadline from ${task.dueDate} to ${prediction.predictedDate}`,
          metadata: {
            currentDeadline: task.dueDate,
            suggestedDeadline: prediction.predictedDate,
            confidence: prediction.confidence,
            reasoning: prediction.recommendation,
          },
        });
      }
    }

    // Create summary notification if there are suggestions
    if (suggestions.length > 0) {
      // This would typically create a notification for project managers
      console.log(`AI suggests adjusting ${suggestions.length} task deadlines`);
    }

    return suggestions;
  } catch (error) {
    console.error('Error in suggestDeadlineAdjustments:', error);
    return [];
  }
}

// ============================================
// AUTOMATION 4: TASK DEPENDENCY AUTO-DETECTION
// ============================================

/**
 * Analyzes tasks in a project to detect implicit dependencies
 * Uses AI to identify which tasks should be linked
 */
export async function detectTaskDependencies(tasks: ExtendedTask[]): Promise<TaskDependency[]> {
  try {
    // Limit to 50 tasks to avoid overwhelming the AI
    const tasksToAnalyze = tasks.slice(0, 50);

    const prompt = `
You are an AI task management assistant. Analyze these tasks and identify implicit dependencies.

**Tasks to Analyze:**
${tasksToAnalyze.map((t, i) => `
${i + 1}. [ID: ${t.id}] ${t.title}
   Description: ${t.description}
   Status: ${t.status}
   Due: ${t.dueDate}
   Tags: ${t.tags.join(', ')}
`).join('\n')}

**Instructions:**
1. Identify tasks that logically depend on other tasks being completed first
2. Look for dependencies based on:
   - Workflow order (design before implementation, approval before launch)
   - Resource dependencies (data collection before analysis)
   - Technical dependencies (setup before configuration)
3. Only suggest clear, logical dependencies
4. Provide reasoning for each suggested dependency

Return ONLY a valid JSON array:
[
  {
    "taskId": "task-1-id",
    "dependsOn": ["task-2-id", "task-3-id"],
    "reasoning": "Implementation depends on design completion and data collection"
  }
]
`;

    const ai = await import('@google/genai');
    const GoogleGenAI = ai.GoogleGenAI;
    const apiKey = import.meta.env.VITE_API_KEY;
    if (!apiKey) {
      return [];
    }
    const genAI = new GoogleGenAI({ apiKey });

    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
    });

    const text = response.text.trim();
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
    const jsonText = jsonMatch ? jsonMatch[1] : text;
    const dependencies = JSON.parse(jsonText);

    // Enrich with task titles
    const enrichedDependencies: TaskDependency[] = dependencies.map((dep: any) => {
      const task = tasks.find(t => t.id === dep.taskId);
      return {
        taskId: dep.taskId,
        taskTitle: task?.title || 'Unknown Task',
        dependsOn: dep.dependsOn,
        reasoning: dep.reasoning,
      };
    });

    return enrichedDependencies;
  } catch (error) {
    console.error('Error in detectTaskDependencies:', error);
    return [];
  }
}

// ============================================
// AUTOMATION 5: SMART WORKLOAD REBALANCING
// ============================================

/**
 * Analyzes team workload and suggests task reassignments
 * Helps prevent burnout and optimize resource allocation
 */
export async function rebalanceWorkload(
  tasks: ExtendedTask[],
  teamMembers: TeamMember[],
  departmentId?: string
): Promise<WorkloadRebalanceResult> {
  try {
    // Filter tasks if department specified
    let tasksToAnalyze = tasks.filter(t => t.status !== 'completed');
    if (departmentId) {
      tasksToAnalyze = tasksToAnalyze.filter(t => t.department === departmentId);
    }

    // Use AI workload analysis
    const workloadAnalysis = await taskAiService.analyzeTeamWorkload(tasksToAnalyze, teamMembers);

    const reassignments: TaskReassignment[] = [];

    // Process overloaded members
    for (const overloadedMember of workloadAnalysis.overloadedMembers) {
      for (const suggestion of overloadedMember.suggestedReassignments) {
        const task = tasksToAnalyze.find(t => t.id === suggestion.taskId);
        if (!task) continue;

        const fromMember = teamMembers.find(m => m.id === overloadedMember.userId);
        const toMember = teamMembers.find(m => m.name === suggestion.suggestedNewAssignee);

        if (fromMember && toMember) {
          reassignments.push({
            taskId: suggestion.taskId,
            taskTitle: suggestion.taskTitle,
            fromUserId: overloadedMember.userId,
            fromUserName: overloadedMember.name,
            toUserId: toMember.id,
            toUserName: toMember.name,
            reasoning: `${overloadedMember.name} is at ${overloadedMember.overloadPercentage}% capacity`,
          });
        }
      }
    }

    // Generate expected improvement summary
    const expectedImprovement = workloadAnalysis.insights.length > 0
      ? workloadAnalysis.insights.join('. ')
      : 'Workload rebalancing will improve team efficiency and reduce burnout risk.';

    return {
      reassignments,
      expectedImprovement,
    };
  } catch (error) {
    console.error('Error in rebalanceWorkload:', error);
    return {
      reassignments: [],
      expectedImprovement: 'Error analyzing workload',
    };
  }
}

// ============================================
// SERVICE EXPORT
// ============================================

export const taskAutomationService = {
  escalateOverdueTasks,
  autoAssignNewTask,
  suggestDeadlineAdjustments,
  detectTaskDependencies,
  rebalanceWorkload,
};

export default taskAutomationService;
