// Task AI Service - Comprehensive AI-powered task management features
// Implements 8 core AI capabilities using Google Gemini API

import { ExtendedTask, TaskPriority, Department } from './taskManagementService';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface TaskSummary {
  summary: string;
  insights: string[];
  blockers: string[];
  suggestedActions: string[];
}

export interface PrioritySuggestion {
  suggestedPriority: TaskPriority;
  reasoning: string;
  confidence: number; // 0-100
}

export interface TeamMember {
  id: string;
  name: string;
  department: Department;
  skills?: string[];
  currentWorkload?: number; // 0-100 percentage
  avgTaskCompletionDays?: number;
  specialties?: string[];
  hoursPerWeek?: number;
}

export interface AssigneeRecommendation {
  userId: string;
  name: string;
  score: number; // 0-100
  reasoning: string;
}

export interface AssignmentSuggestionResult {
  recommendedAssignees: AssigneeRecommendation[];
}

export interface WorkloadMember {
  userId: string;
  name: string;
  assignedHours: number;
  capacity: number;
  overloadPercentage: number;
  suggestedReassignments: Array<{
    taskId: string;
    taskTitle: string;
    suggestedNewAssignee: string;
  }>;
}

export interface WorkloadAnalysisResult {
  overloadedMembers: WorkloadMember[];
  underutilizedMembers: Array<{
    userId: string;
    name: string;
    availableHours: number;
    suggestedTasks: string[];
  }>;
  insights: string[];
  recommendations: string[];
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface RiskDetectionResult {
  riskLevel: RiskLevel;
  blockers: Array<{
    type: 'dependency' | 'resource' | 'timeline' | 'scope';
    description: string;
    mitigation: string;
  }>;
  alerts: string[];
}

export interface CompletionPrediction {
  predictedDate: string;
  confidence: number; // 0-100
  factors: string[];
  recommendation: string;
}

export interface NaturalLanguageSearchResult {
  matchedTasks: ExtendedTask[];
  interpretation: string;
  suggestedFilters: {
    status?: string;
    priority?: TaskPriority;
    assignee?: string;
    dateRange?: { start: string; end: string };
  };
}

export interface CompletionVerification {
  isCompletelyDone: boolean;
  confidence: number; // 0-100
  missingElements: string[];
  suggestions: string[];
}

// ============================================
// LAZY AI INITIALIZATION
// ============================================

let ai: any = null;
let GoogleGenAI: any = null;

async function getAI() {
  if (!ai) {
    const genai = await import('@google/genai');
    GoogleGenAI = genai.GoogleGenAI;
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY is not configured');
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Parse JSON from AI response, handling markdown code blocks
 */
function parseJson(text: string): any {
  try {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    // Try direct parse
    return JSON.parse(text);
  } catch (error) {
    console.error('JSON parse error:', error, 'Text:', text);
    throw new Error('Failed to parse AI response as JSON');
  }
}

/**
 * Safe AI call with error handling and fallback
 */
async function safeAiCall<T>(
  prompt: string,
  fallback: T,
  parser?: (text: string) => T
): Promise<T> {
  try {
    const response = await (await getAI()).models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
    });

    const text = response.text;
    if (parser) {
      return parser(text);
    }
    return parseJson(text) as T;
  } catch (error) {
    console.error('AI call error:', error);
    return fallback;
  }
}

// ============================================
// FEATURE 1: SMART TASK SUMMARIZATION
// ============================================

/**
 * Generate comprehensive task summary with insights and blockers
 */
export async function generateTaskSummary(
  task: ExtendedTask,
  relatedTasks: ExtendedTask[] = []
): Promise<TaskSummary> {
  const prompt = `
You are an AI task management assistant. Analyze this task and provide a comprehensive summary.

**Task Details:**
- Title: ${task.title}
- Description: ${task.description}
- Status: ${task.status}
- Priority: ${task.priority}
- Due Date: ${task.dueDate}
- Time Estimate: ${task.timeEstimate}h
- Time Spent: ${task.timeSpent}h
- Progress: ${task.timeEstimate > 0 ? ((task.timeSpent / task.timeEstimate) * 100).toFixed(0) : 0}%
- Assignee: ${task.assignedToName}
- Department: ${task.department}
- Subtasks: ${task.subtasks.length} total, ${task.subtasks.filter(s => s.completed).length} completed

**Related Tasks (${relatedTasks.length}):**
${relatedTasks.map(t => `- ${t.title} (${t.status})`).join('\n') || 'None'}

**Instructions:**
1. Provide a 2-sentence executive summary of this task
2. Identify 2-3 key insights about the task's current state
3. List any blockers or dependencies that could prevent completion
4. Suggest 2-3 concrete actions to move this task forward

Return ONLY a valid JSON object with this exact structure:
{
  "summary": "Executive summary here",
  "insights": ["insight 1", "insight 2"],
  "blockers": ["blocker 1", "blocker 2"],
  "suggestedActions": ["action 1", "action 2"]
}
`;

  return safeAiCall<TaskSummary>(prompt, {
    summary: `Task "${task.title}" is ${task.status} with ${task.timeEstimate - task.timeSpent}h remaining.`,
    insights: ['Task analysis unavailable'],
    blockers: [],
    suggestedActions: ['Continue working on the task']
  });
}

// ============================================
// FEATURE 2: INTELLIGENT PRIORITY SUGGESTIONS
// ============================================

/**
 * Suggest appropriate priority level for a task
 */
export async function suggestTaskPriority(
  task: Partial<ExtendedTask>,
  projectContext?: {
    projectDeadline?: string;
    projectPriority?: string;
    teamCapacity?: number;
  }
): Promise<PrioritySuggestion> {
  const prompt = `
You are an AI task management assistant. Analyze this task and suggest an appropriate priority level.

**Task Details:**
- Title: ${task.title || 'Untitled'}
- Description: ${task.description || 'No description'}
- Due Date: ${task.dueDate || 'Not set'}
- Time Estimate: ${task.timeEstimate || 0}h
- Assignee: ${task.assignedToName || 'Unassigned'}

${projectContext ? `
**Project Context:**
- Project Deadline: ${projectContext.projectDeadline || 'Not set'}
- Project Priority: ${projectContext.projectPriority || 'Normal'}
- Team Capacity: ${projectContext.teamCapacity || 100}% available
` : ''}

**Instructions:**
1. Analyze the task urgency based on due date proximity
2. Consider effort vs. available time
3. Evaluate project context and dependencies
4. Suggest priority: "low", "medium", "high", or "critical"
5. Provide clear reasoning in 2-3 sentences
6. Assign confidence score 0-100

Return ONLY a valid JSON object:
{
  "suggestedPriority": "medium",
  "reasoning": "Your reasoning here",
  "confidence": 75
}
`;

  return safeAiCall<PrioritySuggestion>(prompt, {
    suggestedPriority: 'medium',
    reasoning: 'Unable to analyze priority at this time.',
    confidence: 50
  });
}

// ============================================
// FEATURE 3: SMART DEADLINE PREDICTION
// ============================================

/**
 * Predict likely completion date based on progress and assignee history
 */
export async function predictTaskCompletion(
  task: ExtendedTask,
  assigneeHistory: {
    avgCompletionTime: number; // days
    tasksCompleted: number;
    currentWorkload: number;
  }
): Promise<CompletionPrediction> {
  const prompt = `
You are an AI task management assistant. Predict when this task will likely be completed.

**Current Task:**
- Title: ${task.title}
- Status: ${task.status}
- Time Estimate: ${task.timeEstimate}h
- Time Spent: ${task.timeSpent}h
- Progress: ${((task.timeSpent / task.timeEstimate) * 100).toFixed(0)}%
- Due Date: ${task.dueDate}
- Assignee: ${task.assignedToName}
- Subtasks: ${task.subtasks.length} total, ${task.subtasks.filter(s => s.completed).length} completed

**Assignee Historical Performance:**
- Average completion time: ${assigneeHistory.avgCompletionTime} days
- Tasks completed: ${assigneeHistory.tasksCompleted}
- Current workload: ${assigneeHistory.currentWorkload} tasks

**Instructions:**
1. Analyze current progress rate
2. Factor in assignee's historical performance
3. Consider current workload
4. Predict realistic completion date (format: YYYY-MM-DD)
5. Provide confidence level 0-100
6. List 2-3 key factors affecting the timeline
7. Recommend deadline adjustment if needed

Return ONLY a valid JSON object:
{
  "predictedDate": "2024-02-15",
  "confidence": 80,
  "factors": ["factor 1", "factor 2"],
  "recommendation": "Your recommendation here"
}
`;

  return safeAiCall<CompletionPrediction>(prompt, {
    predictedDate: task.dueDate,
    confidence: 50,
    factors: ['Unable to analyze completion timeline'],
    recommendation: 'Continue monitoring progress'
  });
}

// ============================================
// FEATURE 4: INTELLIGENT TASK ASSIGNMENT
// ============================================

/**
 * Recommend best team members for task assignment
 */
export async function suggestBestAssignee(
  task: Partial<ExtendedTask>,
  teamMembers: TeamMember[]
): Promise<AssignmentSuggestionResult> {
  const prompt = `
You are an AI task management assistant. Recommend the best team member(s) to assign this task.

**Task Details:**
- Title: ${task.title || 'Untitled'}
- Description: ${task.description || 'No description'}
- Priority: ${task.priority || 'medium'}
- Time Estimate: ${task.timeEstimate || 0}h
- Required Skills: ${task.tags?.join(', ') || 'None specified'}
- Department: ${task.department || 'Any'}

**Available Team Members:**
${teamMembers.map((tm, i) => `
${i + 1}. ${tm.name}
   - Department: ${tm.department}
   - Skills: ${tm.skills?.join(', ') || 'Not specified'}
   - Current Workload: ${tm.currentWorkload || 50}%
   - Avg Completion Time: ${tm.avgTaskCompletionDays || 5} days
   - Specialties: ${tm.specialties?.join(', ') || 'Not specified'}
`).join('\n')}

**Instructions:**
1. Rank team members by skill match
2. Consider availability (lower workload is better)
3. Factor in past performance
4. Evaluate department alignment
5. Return top 3 candidates with match scores 0-100
6. Provide clear reasoning for each recommendation

Return ONLY a valid JSON object:
{
  "recommendedAssignees": [
    {
      "userId": "member-id",
      "name": "Member Name",
      "score": 85,
      "reasoning": "Your 2-sentence reasoning"
    }
  ]
}
`;

  return safeAiCall<AssignmentSuggestionResult>(prompt, {
    recommendedAssignees: teamMembers.slice(0, 1).map(tm => ({
      userId: tm.id,
      name: tm.name,
      score: 50,
      reasoning: 'Default assignment suggestion'
    }))
  });
}

// ============================================
// FEATURE 5: WORKLOAD ANALYSIS & CAPACITY PLANNING
// ============================================

/**
 * Analyze team workload and suggest rebalancing
 */
export async function analyzeTeamWorkload(
  tasks: ExtendedTask[],
  teamMembers: TeamMember[]
): Promise<WorkloadAnalysisResult> {
  // Calculate workload distribution
  const tasksByAssignee = tasks.reduce((acc, task) => {
    if (!acc[task.assignedToId]) acc[task.assignedToId] = [];
    acc[task.assignedToId].push(task);
    return acc;
  }, {} as Record<string, ExtendedTask[]>);

  const workloadData = teamMembers.map(member => {
    const assignedTasks = tasksByAssignee[member.id] || [];
    const totalHours = assignedTasks.reduce((sum, t) => sum + Math.max(0, t.timeEstimate - t.timeSpent), 0);
    const capacity = member.hoursPerWeek || 40;
    const utilizationRate = (totalHours / capacity) * 100;

    return {
      ...member,
      assignedTasks: assignedTasks.length,
      assignedHours: totalHours,
      capacity,
      utilizationRate,
      tasks: assignedTasks
    };
  });

  const prompt = `
You are an AI task management assistant. Analyze team workload distribution and provide insights.

**Team Capacity Overview:**
${workloadData.map(m => `
- ${m.name} (${m.department})
  * Assigned Tasks: ${m.assignedTasks}
  * Assigned Hours: ${m.assignedHours.toFixed(1)}h
  * Weekly Capacity: ${m.capacity}h
  * Utilization: ${m.utilizationRate.toFixed(1)}%
`).join('\n')}

**Task Details:**
${tasks.slice(0, 20).map(t => `- ${t.title} (${t.timeEstimate}h) → ${t.assignedToName} [${t.priority} priority, due ${t.dueDate}]`).join('\n')}

**Instructions:**
1. Identify overloaded team members (>100% capacity)
2. For each overloaded member, suggest 2-3 specific task reassignments
3. Identify underutilized members who could take on more work
4. Provide 3-5 actionable insights about workload distribution
5. Recommend process improvements for better balance

Return ONLY a valid JSON object:
{
  "overloadedMembers": [
    {
      "userId": "id",
      "name": "name",
      "assignedHours": 60,
      "capacity": 40,
      "overloadPercentage": 150,
      "suggestedReassignments": [
        {
          "taskId": "task-id",
          "taskTitle": "Task title",
          "suggestedNewAssignee": "New assignee name"
        }
      ]
    }
  ],
  "underutilizedMembers": [
    {
      "userId": "id",
      "name": "name",
      "availableHours": 20,
      "suggestedTasks": ["task-id-1", "task-id-2"]
    }
  ],
  "insights": ["insight 1", "insight 2"],
  "recommendations": ["recommendation 1", "recommendation 2"]
}
`;

  return safeAiCall<WorkloadAnalysisResult>(prompt, {
    overloadedMembers: [],
    underutilizedMembers: [],
    insights: ['Workload analysis unavailable'],
    recommendations: ['Continue monitoring team capacity']
  });
}

// ============================================
// FEATURE 6: RISK & BLOCKER DETECTION
// ============================================

/**
 * Detect risks and blockers for a task
 */
export async function detectTaskRisks(
  task: ExtendedTask,
  relatedTasks: ExtendedTask[] = [],
  projectDeadline?: string
): Promise<RiskDetectionResult> {
  const progressPercentage = task.timeEstimate > 0
    ? ((task.timeSpent / task.timeEstimate) * 100).toFixed(0)
    : 0;

  const prompt = `
You are an AI task management assistant. Assess risks and blockers for this task.

**Current Task:**
- Title: ${task.title}
- Status: ${task.status}
- Priority: ${task.priority}
- Due Date: ${task.dueDate}
- Progress: ${progressPercentage}% (${task.timeSpent}h / ${task.timeEstimate}h)
- Assignee: ${task.assignedToName}
- Subtasks: ${task.subtasks.length} total, ${task.subtasks.filter(s => s.completed).length} completed

${projectDeadline ? `Project Deadline: ${projectDeadline}` : ''}

**Potential Dependencies:**
${relatedTasks.map(t => `- ${t.title} (${t.status})`).join('\n') || 'None'}

**Instructions:**
1. Assess dependency risks (blocked by incomplete tasks)
2. Identify resource risks (assignee overload, skill gaps)
3. Evaluate timeline risks (pace vs. deadline)
4. Check scope risks (expanding requirements, unclear objectives)
5. Determine overall risk level: "low", "medium", "high", or "critical"
6. For each blocker, provide type and mitigation strategy
7. List urgent alerts if any

Return ONLY a valid JSON object:
{
  "riskLevel": "medium",
  "blockers": [
    {
      "type": "timeline",
      "description": "Blocker description",
      "mitigation": "Mitigation strategy"
    }
  ],
  "alerts": ["urgent alert 1"]
}
`;

  return safeAiCall<RiskDetectionResult>(prompt, {
    riskLevel: 'low',
    blockers: [],
    alerts: []
  });
}

// ============================================
// FEATURE 7: NATURAL LANGUAGE SEARCH
// ============================================

/**
 * Interpret natural language queries and find matching tasks
 */
export async function naturalLanguageTaskSearch(
  query: string,
  allTasks: ExtendedTask[]
): Promise<NaturalLanguageSearchResult> {
  const prompt = `
You are an AI task management assistant. Interpret this natural language query and find matching tasks.

**User Query:** "${query}"

**Available Tasks (${allTasks.length}):**
${allTasks.slice(0, 50).map(t => `
- ID: ${t.id}
- Title: ${t.title}
- Status: ${t.status}
- Priority: ${t.priority}
- Assignee: ${t.assignedToName}
- Due: ${t.dueDate}
- Tags: ${t.tags.join(', ')}
`).join('\n')}

**Instructions:**
1. Identify user intent (e.g., "show overdue tasks", "john's tasks", "high priority items due this week")
2. Extract filters: status, priority, assignee, date range, keywords
3. Return task IDs that match the query
4. Explain your interpretation in a clear sentence
5. Suggest structured filters for the UI

**Examples:**
- "what's john working on?" → assignee filter
- "critical tasks" → priority filter
- "overdue marketing tasks" → status + department filter
- "tasks due this week" → date range filter

Return ONLY a valid JSON object:
{
  "matchedTaskIds": ["task-1", "task-2"],
  "interpretation": "Searching for: Status=Overdue, Assignee=John",
  "suggestedFilters": {
    "status": "overdue",
    "priority": null,
    "assignee": "John Doe",
    "dateRange": null
  }
}
`;

  try {
    const result = await safeAiCall<any>(prompt, {
      matchedTaskIds: [],
      interpretation: 'Unable to interpret query',
      suggestedFilters: {}
    });

    const matchedTasks = allTasks.filter(t => result.matchedTaskIds?.includes(t.id));

    return {
      matchedTasks,
      interpretation: result.interpretation,
      suggestedFilters: result.suggestedFilters || {}
    };
  } catch (error) {
    console.error('Natural language search error:', error);
    return {
      matchedTasks: [],
      interpretation: 'Search failed',
      suggestedFilters: {}
    };
  }
}

// ============================================
// FEATURE 8: COMPLETION QUALITY VERIFICATION
// ============================================

/**
 * Verify if a task is truly complete and ready to close
 */
export async function verifyTaskCompletion(
  task: ExtendedTask,
  activityLog: any[] = []
): Promise<CompletionVerification> {
  const prompt = `
You are an AI task management assistant. Verify if this task is truly complete and ready to close.

**Task Details:**
- Title: ${task.title}
- Description: ${task.description}
- Status: ${task.status}
- Subtasks: ${task.subtasks.filter(s => s.completed).length}/${task.subtasks.length} complete
- Time spent: ${task.timeSpent}h (estimated: ${task.timeEstimate}h)
- Comments: ${task.comments}
- Attachments: ${task.attachments}

**Recent Activity:**
${activityLog.slice(0, 10).map(a => `- ${a.createdAt}: ${a.description || a.activityType}`).join('\n') || 'No activity log'}

**Instructions:**
1. Check if all subtasks are complete
2. Verify time spent is reasonable
3. Review activity log for completion indicators
4. Identify any missing documentation/deliverables
5. Assess completion confidence 0-100
6. List potentially missing elements
7. Provide suggestions before closing

Return ONLY a valid JSON object:
{
  "isCompletelyDone": true,
  "confidence": 90,
  "missingElements": ["element 1"],
  "suggestions": ["suggestion 1"]
}
`;

  return safeAiCall<CompletionVerification>(prompt, {
    isCompletelyDone: true,
    confidence: 70,
    missingElements: [],
    suggestions: []
  });
}

// ============================================
// ADVANCED FEATURE 1: TASK CLUSTERING & ORGANIZATION
// ============================================

export interface TaskCluster {
  id: string;
  name: string;
  description: string;
  taskIds: string[];
  suggestedProject?: string;
}

export interface ClusteringResult {
  clusters: TaskCluster[];
  orphanTasks: string[];
}

/**
 * Analyzes tasks to find natural groupings and suggest organization
 */
export async function clusterRelatedTasks(tasks: ExtendedTask[]): Promise<ClusteringResult> {
  // Limit to 50 tasks for performance
  const tasksToAnalyze = tasks.slice(0, 50);

  const prompt = `
You are an AI task organization expert. Analyze these tasks and identify natural groupings.

**Tasks to Analyze (${tasksToAnalyze.length}):**
${tasksToAnalyze.map(t => `
- ID: ${t.id}
- Title: ${t.title}
- Description: ${t.description}
- Tags: ${t.tags.join(', ')}
- Project: ${t.projectName || 'None'}
- Department: ${t.department}
`).join('\n')}

**Instructions:**
1. Identify natural clusters based on:
   - Common themes or objectives
   - Similar tags or keywords
   - Related departments or clients
   - Logical workflow dependencies
2. Create 3-7 meaningful clusters
3. Each cluster should have 2+ tasks
4. Suggest a project name if tasks should be grouped
5. Identify tasks that don't fit any cluster as orphans

Return ONLY a valid JSON object:
{
  "clusters": [
    {
      "id": "cluster-1",
      "name": "Website Redesign",
      "description": "All tasks related to the new website launch",
      "taskIds": ["task-1", "task-2", "task-3"],
      "suggestedProject": "Q1 Website Refresh"
    }
  ],
  "orphanTasks": ["task-4", "task-5"]
}
`;

  return safeAiCall<ClusteringResult>(prompt, {
    clusters: [],
    orphanTasks: tasksToAnalyze.map(t => t.id)
  });
}

// ============================================
// ADVANCED FEATURE 2: SMART TASK TEMPLATES
// ============================================

export interface GeneratedTask {
  title: string;
  description: string;
  priority: TaskPriority;
  estimatedHours: number;
  suggestedAssignee?: string;
  tags: string[];
  dependencies?: string[];
}

export interface ProjectPhase {
  name: string;
  taskIndices: number[];
}

export interface TaskGenerationResult {
  suggestedTasks: GeneratedTask[];
  phases: ProjectPhase[];
  timeline: string;
}

/**
 * Generates comprehensive task breakdown from project description
 */
export async function generateTasksFromProject(
  projectDescription: string,
  projectType: string,
  teamMembers: TeamMember[]
): Promise<TaskGenerationResult> {
  const prompt = `
You are an expert project manager. Generate a comprehensive task breakdown for this project.

**Project Type:** ${projectType}
**Project Description:** ${projectDescription}

**Available Team:**
${teamMembers.map(tm => `- ${tm.name} (${tm.department}${tm.skills ? ', Skills: ' + tm.skills.join(', ') : ''})`).join('\n')}

**Instructions:**
1. Create a detailed list of tasks needed to complete this project
2. For each task provide:
   - Title: Clear, action-oriented
   - Description: Specific deliverable
   - Priority: low, medium, high, or critical
   - Estimated hours: Realistic time estimate
   - Suggested assignee: Best team member from the list
   - Tags: Relevant categorization
   - Dependencies: Task titles this depends on (if any)
3. Group tasks into 3-5 logical phases
4. Suggest an overall timeline

Return ONLY a valid JSON object:
{
  "suggestedTasks": [
    {
      "title": "Create project charter",
      "description": "Define scope, objectives, and stakeholders",
      "priority": "high",
      "estimatedHours": 8,
      "suggestedAssignee": "John Doe",
      "tags": ["planning", "documentation"],
      "dependencies": []
    }
  ],
  "phases": [
    {
      "name": "Planning & Setup",
      "taskIndices": [0, 1, 2]
    }
  ],
  "timeline": "This project should take approximately 6-8 weeks with the current team"
}
`;

  return safeAiCall<TaskGenerationResult>(prompt, {
    suggestedTasks: [],
    phases: [],
    timeline: 'Unable to estimate timeline'
  });
}

// ============================================
// ADVANCED FEATURE 3: DEPENDENCY GRAPH ANALYSIS
// ============================================

export interface DependencyGraphAnalysis {
  criticalPath: string[];
  bottlenecks: Array<{
    taskId: string;
    taskTitle: string;
    blockedTasks: number;
    reason: string;
  }>;
  circularDependencies: string[][];
  parallelizable: string[][];
}

/**
 * Analyzes task dependencies to identify critical path and bottlenecks
 */
export async function analyzeDependencyGraph(tasks: ExtendedTask[]): Promise<DependencyGraphAnalysis> {
  const prompt = `
You are a project scheduling expert. Analyze these tasks and their dependencies.

**Tasks:**
${tasks.slice(0, 30).map(t => `
- ID: ${t.id}
- Title: ${t.title}
- Status: ${t.status}
- Due: ${t.dueDate}
- Estimated Hours: ${t.timeEstimate}
- Subtasks: ${t.subtasks.map(s => s.title).join(', ')}
`).join('\n')}

**Instructions:**
1. Identify the critical path (longest sequence of dependent tasks)
2. Find bottlenecks (tasks blocking multiple other tasks)
3. Detect any circular dependencies
4. Suggest groups of tasks that can be done in parallel

Return ONLY a valid JSON object:
{
  "criticalPath": ["task-1-id", "task-2-id", "task-3-id"],
  "bottlenecks": [
    {
      "taskId": "task-1-id",
      "taskTitle": "API Design",
      "blockedTasks": 5,
      "reason": "Frontend and backend teams waiting for API specification"
    }
  ],
  "circularDependencies": [
    ["task-a-id", "task-b-id", "task-a-id"]
  ],
  "parallelizable": [
    ["task-1-id", "task-2-id", "task-3-id"]
  ]
}
`;

  return safeAiCall<DependencyGraphAnalysis>(prompt, {
    criticalPath: [],
    bottlenecks: [],
    circularDependencies: [],
    parallelizable: []
  });
}

// ============================================
// ADVANCED FEATURE 4: WEEKLY AI TASK DIGEST
// ============================================

export interface WeeklyDigest {
  focusTasks: ExtendedTask[];
  watchOutFor: Array<{
    task: ExtendedTask;
    warning: string;
  }>;
  completedHighlights: Array<{
    task: ExtendedTask;
    praise: string;
  }>;
  suggestions: string[];
}

/**
 * Generates personalized weekly summary for a team member
 */
export async function generateWeeklyDigest(
  userId: string,
  userName: string,
  tasks: ExtendedTask[]
): Promise<WeeklyDigest> {
  const userTasks = tasks.filter(t => t.assignedToId === userId);
  const activeTasks = userTasks.filter(t => t.status !== 'completed');
  const completedTasks = userTasks.filter(t =>
    t.status === 'completed' &&
    t.completedAt &&
    new Date(t.completedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  );

  const prompt = `
You are an AI executive assistant for ${userName}. Create a personalized weekly task digest.

**Active Tasks (${activeTasks.length}):**
${activeTasks.map(t => `
- ${t.title} (${t.status})
  Due: ${t.dueDate}
  Priority: ${t.priority}
  Progress: ${t.timeSpent}h / ${t.timeEstimate}h
`).join('\n')}

**Recently Completed (${completedTasks.length}):**
${completedTasks.map(t => `- ${t.title} (completed ${t.completedAt})`).join('\n')}

**Instructions:**
1. Select 3-5 most important tasks for focus this week (highest priority, soonest due)
2. Identify 2-3 potential problems to watch out for (at-risk deadlines, blockers)
3. Highlight 2-3 completed tasks with specific praise
4. Provide 2-3 actionable suggestions for workload or process improvement

Return ONLY a valid JSON object:
{
  "focusTaskIds": ["task-1-id", "task-2-id"],
  "watchOutFor": [
    {
      "taskId": "task-3-id",
      "warning": "This task is due tomorrow but only 30% complete. Consider requesting deadline extension."
    }
  ],
  "completedHighlights": [
    {
      "taskId": "task-4-id",
      "praise": "Great work completing this ahead of schedule! Your efficiency is impressive."
    }
  ],
  "suggestions": [
    "Consider delegating lower-priority tasks to focus on critical deliverables",
    "Schedule a check-in with your manager about the upcoming deadline cluster"
  ]
}
`;

  try {
    const result = await safeAiCall<any>(prompt, {
      focusTaskIds: [],
      watchOutFor: [],
      completedHighlights: [],
      suggestions: []
    });

    // Map task IDs to full task objects
    return {
      focusTasks: (result.focusTaskIds || [])
        .map((id: string) => activeTasks.find(t => t.id === id))
        .filter(Boolean),
      watchOutFor: (result.watchOutFor || []).map((item: any) => ({
        task: activeTasks.find(t => t.id === item.taskId) || activeTasks[0],
        warning: item.warning
      })),
      completedHighlights: (result.completedHighlights || []).map((item: any) => ({
        task: completedTasks.find(t => t.id === item.taskId) || completedTasks[0],
        praise: item.praise
      })),
      suggestions: result.suggestions || []
    };
  } catch (error) {
    console.error('Weekly digest error:', error);
    return {
      focusTasks: activeTasks.slice(0, 3),
      watchOutFor: [],
      completedHighlights: [],
      suggestions: []
    };
  }
}

// ============================================
// ADVANCED FEATURE 5: LEARNING FROM COMPLETED TASKS
// ============================================

export interface CompletionPatternAnalysis {
  averageTimeByType: Record<string, number>;
  estimationAccuracy: {
    overestimated: number;
    underestimated: number;
    accurate: number;
  };
  insights: string[];
  recommendations: string[];
}

/**
 * Analyzes completed tasks to improve future estimations
 */
export async function analyzeCompletionPatterns(
  completedTasks: ExtendedTask[]
): Promise<CompletionPatternAnalysis> {
  // Calculate basic statistics
  const totalTasks = completedTasks.length;
  let overestimated = 0;
  let underestimated = 0;
  let accurate = 0;

  completedTasks.forEach(task => {
    if (!task.timeEstimate || !task.timeSpent) return;
    const variance = Math.abs(task.timeSpent - task.timeEstimate) / task.timeEstimate;

    if (variance < 0.1) {
      accurate++;
    } else if (task.timeSpent < task.timeEstimate) {
      overestimated++;
    } else {
      underestimated++;
    }
  });

  const prompt = `
You are a data analyst specializing in project management. Analyze these completed tasks.

**Completed Tasks (${completedTasks.length}):**
${completedTasks.slice(0, 50).map(t => `
- ${t.title}
  Estimated: ${t.timeEstimate}h
  Actual: ${t.timeSpent}h
  Variance: ${t.timeEstimate > 0 ? ((t.timeSpent - t.timeEstimate) / t.timeEstimate * 100).toFixed(0) : 0}%
  Priority: ${t.priority}
  Department: ${t.department}
  Tags: ${t.tags.join(', ')}
`).join('\n')}

**Estimation Accuracy:**
- Accurate (within 10%): ${accurate}
- Overestimated: ${overestimated}
- Underestimated: ${underestimated}

**Instructions:**
1. Calculate average actual time by task tags/types
2. Identify patterns in estimation accuracy
3. Provide 3-5 key insights about completion patterns
4. Recommend 3-5 specific improvements for future estimation

Return ONLY a valid JSON object:
{
  "averageTimeByType": {
    "design": 12.5,
    "development": 24.0,
    "testing": 8.5
  },
  "insights": [
    "Development tasks are consistently underestimated by 30%",
    "Design tasks show high accuracy in estimation"
  ],
  "recommendations": [
    "Add 30% buffer to all development task estimates",
    "Break down large tasks (>20h) into smaller subtasks for better tracking"
  ]
}
`;

  const result = await safeAiCall<any>(prompt, {
    averageTimeByType: {},
    insights: [],
    recommendations: []
  });

  return {
    averageTimeByType: result.averageTimeByType || {},
    estimationAccuracy: {
      overestimated,
      underestimated,
      accurate
    },
    insights: result.insights || [],
    recommendations: result.recommendations || []
  };
}

// ============================================
// EXPORT ALL FUNCTIONS
// ============================================

export const taskAiService = {
  // Original 8 functions
  generateTaskSummary,
  suggestTaskPriority,
  predictTaskCompletion,
  suggestBestAssignee,
  analyzeTeamWorkload,
  detectTaskRisks,
  naturalLanguageTaskSearch,
  verifyTaskCompletion,
  // New 5 advanced features
  clusterRelatedTasks,
  generateTasksFromProject,
  analyzeDependencyGraph,
  generateWeeklyDigest,
  analyzeCompletionPatterns,
};

export default taskAiService;
