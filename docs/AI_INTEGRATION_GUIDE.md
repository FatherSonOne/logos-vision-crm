# AI Features Integration Guide

## Quick Start Integration

This guide shows how to integrate the 8 AI features into TaskView.tsx or any task management component.

---

## Step 1: Import Required Services and Components

```typescript
// AI Service
import taskAiService, {
  TaskSummary,
  PrioritySuggestion,
  WorkloadAnalysisResult,
  RiskDetectionResult,
  CompletionPrediction,
  TeamMember,
} from '../services/taskAiService';

// UI Components
import AiSuggestionBadge from './tasks/AiSuggestionBadge';
import WorkloadAnalysisPanel from './tasks/WorkloadAnalysisPanel';
import RiskIndicator from './tasks/RiskIndicator';
import NaturalLanguageSearch from './tasks/NaturalLanguageSearch';

// Task Management Service
import { ExtendedTask, TaskPriority } from '../services/taskManagementService';
```

---

## Step 2: Add State Management

```typescript
const TaskView: React.FC = () => {
  // Existing state
  const [tasks, setTasks] = useState<ExtendedTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<ExtendedTask | null>(null);

  // AI Feature States
  const [prioritySuggestion, setPrioritySuggestion] = useState<PrioritySuggestion | null>(null);
  const [taskSummary, setTaskSummary] = useState<TaskSummary | null>(null);
  const [workloadAnalysis, setWorkloadAnalysis] = useState<WorkloadAnalysisResult | null>(null);
  const [taskRisks, setTaskRisks] = useState<Record<string, RiskDetectionResult>>({});
  const [completionPredictions, setCompletionPredictions] = useState<Record<string, CompletionPrediction>>({});

  // Loading states
  const [isAnalyzingWorkload, setIsAnalyzingWorkload] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // ... rest of component
};
```

---

## Step 3: Implement AI Functions

### Feature 1: Priority Suggestion (Task Creation)

```typescript
// When creating a new task
const handleTaskTitleChange = async (title: string, description: string, dueDate: string, timeEstimate: number) => {
  // Only suggest if enough information provided
  if (title.length > 10 && description.length > 20) {
    try {
      const suggestion = await taskAiService.suggestTaskPriority({
        title,
        description,
        dueDate,
        timeEstimate,
      });
      setPrioritySuggestion(suggestion);
    } catch (error) {
      console.error('Priority suggestion error:', error);
    }
  }
};

// In the task creation form
<div className="mb-4">
  <label>Priority</label>
  <select value={priority} onChange={(e) => setPriority(e.target.value)}>
    <option value="low">Low</option>
    <option value="medium">Medium</option>
    <option value="high">High</option>
    <option value="critical">Critical</option>
  </select>

  {/* Show AI Suggestion */}
  {prioritySuggestion && (
    <AiSuggestionBadge
      type="priority"
      suggestion={prioritySuggestion.suggestedPriority}
      reasoning={prioritySuggestion.reasoning}
      confidence={prioritySuggestion.confidence}
      onApply={() => {
        setPriority(prioritySuggestion.suggestedPriority);
        setPrioritySuggestion(null);
      }}
      onDismiss={() => setPrioritySuggestion(null)}
      className="mt-2"
    />
  )}
</div>
```

### Feature 2: Task Summary (Task Detail Modal)

```typescript
// When opening task detail modal
const handleTaskSelect = async (task: ExtendedTask) => {
  setSelectedTask(task);
  setIsGeneratingSummary(true);

  try {
    // Get related tasks from same project
    const relatedTasks = tasks.filter(t => t.projectId === task.projectId && t.id !== task.id);

    const summary = await taskAiService.generateTaskSummary(task, relatedTasks);
    setTaskSummary(summary);
  } catch (error) {
    console.error('Summary generation error:', error);
  } finally {
    setIsGeneratingSummary(false);
  }
};

// In task detail modal header
<div className="modal-header">
  <h2>{selectedTask.title}</h2>

  {isGeneratingSummary ? (
    <div className="loading">Generating AI summary...</div>
  ) : taskSummary ? (
    <div className="ai-summary bg-blue-50 p-4 rounded-lg mt-3">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-blue-600" />
        <span className="font-semibold">AI Summary</span>
      </div>
      <p className="text-gray-700 mb-3">{taskSummary.summary}</p>

      {taskSummary.insights.length > 0 && (
        <div className="mb-2">
          <div className="font-medium text-sm mb-1">Key Insights:</div>
          <ul className="space-y-1">
            {taskSummary.insights.map((insight, idx) => (
              <li key={idx} className="text-sm text-gray-600">• {insight}</li>
            ))}
          </ul>
        </div>
      )}

      {taskSummary.blockers.length > 0 && (
        <div className="mb-2">
          <div className="font-medium text-sm mb-1 text-red-600">Blockers:</div>
          <ul className="space-y-1">
            {taskSummary.blockers.map((blocker, idx) => (
              <li key={idx} className="text-sm text-red-600">⚠ {blocker}</li>
            ))}
          </ul>
        </div>
      )}

      {taskSummary.suggestedActions.length > 0 && (
        <div>
          <div className="font-medium text-sm mb-1">Suggested Actions:</div>
          <ul className="space-y-1">
            {taskSummary.suggestedActions.map((action, idx) => (
              <li key={idx} className="text-sm text-gray-600">→ {action}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  ) : null}
</div>
```

### Feature 3: Workload Analysis Panel

```typescript
// Add to dashboard/header area
const refreshWorkloadAnalysis = async () => {
  setIsAnalyzingWorkload(true);

  try {
    // Build team members array from tasks
    const teamMembers: TeamMember[] = Array.from(
      new Set(tasks.map(t => t.assignedToId))
    ).map(id => {
      const task = tasks.find(t => t.assignedToId === id);
      return {
        id,
        name: task?.assignedToName || 'Unknown',
        department: task?.department || 'Unassigned',
        hoursPerWeek: 40, // Default capacity
      };
    });

    const analysis = await taskAiService.analyzeTeamWorkload(tasks, teamMembers);
    setWorkloadAnalysis(analysis);
  } catch (error) {
    console.error('Workload analysis error:', error);
  } finally {
    setIsAnalyzingWorkload(false);
  }
};

// Auto-refresh on tasks change
useEffect(() => {
  if (tasks.length > 0) {
    refreshWorkloadAnalysis();
  }
}, [tasks]);

// In render
<WorkloadAnalysisPanel
  analysis={workloadAnalysis}
  isLoading={isAnalyzingWorkload}
  onReassign={async (taskId, fromUserId, toUserId) => {
    // Implement task reassignment
    await taskManagementService.update(taskId, { assignedToId: toUserId });
    // Refresh tasks
    await loadTasks();
  }}
  onRefresh={refreshWorkloadAnalysis}
  className="mb-6"
/>
```

### Feature 4: Risk Detection (Task Cards)

```typescript
// Load risks for visible tasks
useEffect(() => {
  const loadTaskRisks = async () => {
    const visibleTasks = tasks.slice(0, 20); // Load risks for first 20 tasks

    for (const task of visibleTasks) {
      if (!taskRisks[task.id]) {
        const relatedTasks = tasks.filter(t => t.projectId === task.projectId);
        const risks = await taskAiService.detectTaskRisks(task, relatedTasks);
        setTaskRisks(prev => ({ ...prev, [task.id]: risks }));
      }
    }
  };

  loadTaskRisks();
}, [tasks]);

// In task card/row render
<div className="task-card">
  <h3>{task.title}</h3>

  {/* Risk Indicator */}
  {taskRisks[task.id] && (
    <RiskIndicator
      riskLevel={taskRisks[task.id].riskLevel}
      blockers={taskRisks[task.id].blockers}
      alerts={taskRisks[task.id].alerts}
      showDetails={false}
      size="sm"
      className="mt-2"
    />
  )}
</div>
```

### Feature 5: Natural Language Search

```typescript
// Add to header/search area
<NaturalLanguageSearch
  allTasks={tasks}
  onSearch={(matchedTasks, interpretation) => {
    setFilteredTasks(matchedTasks);
    setSearchInterpretation(interpretation);
    // Optionally show toast notification
    toast.success(`Found ${matchedTasks.length} tasks: ${interpretation}`);
  }}
  onClear={() => {
    setFilteredTasks(tasks);
    setSearchInterpretation(null);
  }}
  className="mb-4"
/>
```

### Feature 6: Completion Verification

```typescript
// Before marking task complete
const handleMarkComplete = async (task: ExtendedTask) => {
  // Get activity log for the task
  const activityLog = await taskManagementService.getActivity(task.id);

  // Verify completion quality
  const verification = await taskAiService.verifyTaskCompletion(task, activityLog);

  if (!verification.isCompletelyDone || verification.confidence < 80) {
    // Show warning dialog
    const proceed = await showConfirmDialog({
      title: 'Task may not be complete',
      message: `AI confidence: ${verification.confidence}%`,
      details: (
        <div>
          {verification.missingElements.length > 0 && (
            <div className="mb-3">
              <div className="font-medium mb-1">Missing Elements:</div>
              <ul>
                {verification.missingElements.map((elem, idx) => (
                  <li key={idx}>• {elem}</li>
                ))}
              </ul>
            </div>
          )}
          {verification.suggestions.length > 0 && (
            <div>
              <div className="font-medium mb-1">Suggestions:</div>
              <ul>
                {verification.suggestions.map((sug, idx) => (
                  <li key={idx}>→ {sug}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ),
      confirmText: 'Complete Anyway',
      cancelText: 'Review Task',
    });

    if (!proceed) return;
  }

  // Mark as complete
  await taskManagementService.update(task.id, { status: 'completed', completedAt: new Date().toISOString() });
  await loadTasks();
};
```

---

## Step 4: Add AI Toggle/Settings

```typescript
// Add user preference for AI features
const [aiEnabled, setAiEnabled] = useState(true);

// Settings UI
<div className="settings-panel">
  <label className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={aiEnabled}
      onChange={(e) => setAiEnabled(e.target.checked)}
    />
    <Sparkles className="w-4 h-4" />
    <span>Enable AI Features</span>
  </label>
</div>

// Conditional rendering
{aiEnabled && prioritySuggestion && (
  <AiSuggestionBadge {...props} />
)}
```

---

## Step 5: Performance Optimization

```typescript
// Debounce AI calls
import { debounce } from 'lodash';

const debouncedPrioritySuggestion = useMemo(
  () => debounce(async (title, description, dueDate, timeEstimate) => {
    const suggestion = await taskAiService.suggestTaskPriority({
      title, description, dueDate, timeEstimate
    });
    setPrioritySuggestion(suggestion);
  }, 1000),
  []
);

// Cache AI responses
const aiCache = useRef<Map<string, any>>(new Map());

const getCachedSummary = async (taskId: string, task: ExtendedTask) => {
  const cacheKey = `summary-${taskId}-${task.updatedAt}`;

  if (aiCache.current.has(cacheKey)) {
    return aiCache.current.get(cacheKey);
  }

  const summary = await taskAiService.generateTaskSummary(task, []);
  aiCache.current.set(cacheKey, summary);
  return summary;
};
```

---

## Step 6: Error Handling

```typescript
// Wrap AI calls in try-catch
const safeAiCall = async (fn: () => Promise<any>, fallback: any) => {
  try {
    return await fn();
  } catch (error) {
    console.error('AI call failed:', error);
    toast.error('AI feature temporarily unavailable');
    return fallback;
  }
};

// Usage
const summary = await safeAiCall(
  () => taskAiService.generateTaskSummary(task, relatedTasks),
  { summary: 'AI unavailable', insights: [], blockers: [], suggestedActions: [] }
);
```

---

## Complete Integration Example

```typescript
const TaskViewWithAI: React.FC = () => {
  // State
  const [tasks, setTasks] = useState<ExtendedTask[]>([]);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [prioritySuggestion, setPrioritySuggestion] = useState<PrioritySuggestion | null>(null);
  const [workloadAnalysis, setWorkloadAnalysis] = useState<WorkloadAnalysisResult | null>(null);

  // Load tasks
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const data = await taskManagementService.getAllEnriched();
    setTasks(data);
  };

  // Auto-analyze workload
  useEffect(() => {
    if (aiEnabled && tasks.length > 0) {
      analyzeWorkload();
    }
  }, [tasks, aiEnabled]);

  const analyzeWorkload = async () => {
    const teamMembers = extractTeamMembers(tasks);
    const analysis = await taskAiService.analyzeTeamWorkload(tasks, teamMembers);
    setWorkloadAnalysis(analysis);
  };

  return (
    <div className="task-view">
      {/* AI Settings Toggle */}
      <div className="header">
        <button onClick={() => setAiEnabled(!aiEnabled)}>
          <Sparkles className={aiEnabled ? 'text-blue-500' : 'text-gray-400'} />
          AI {aiEnabled ? 'On' : 'Off'}
        </button>
      </div>

      {/* Natural Language Search */}
      {aiEnabled && (
        <NaturalLanguageSearch
          allTasks={tasks}
          onSearch={(results) => setTasks(results)}
          onClear={() => loadTasks()}
        />
      )}

      {/* Workload Analysis Panel */}
      {aiEnabled && (
        <WorkloadAnalysisPanel
          analysis={workloadAnalysis}
          onReassign={handleReassign}
          onRefresh={analyzeWorkload}
        />
      )}

      {/* Task List with AI Features */}
      <div className="task-list">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            aiEnabled={aiEnabled}
            onSelect={handleTaskSelect}
          />
        ))}
      </div>
    </div>
  );
};
```

---

## Best Practices

1. **Progressive Enhancement**: Make AI features optional, not required
2. **Loading States**: Always show loading indicators for AI calls
3. **Fallback Responses**: Handle AI failures gracefully
4. **User Control**: Let users enable/disable AI features
5. **Caching**: Cache AI responses to reduce API calls
6. **Debouncing**: Debounce real-time AI suggestions
7. **Error Handling**: Log errors but don't crash the app

---

## Testing Checklist

- [ ] AI toggle enables/disables all features
- [ ] Priority suggestions appear during task creation
- [ ] Task summaries load in detail modal
- [ ] Workload analysis refreshes correctly
- [ ] Risk indicators display on task cards
- [ ] Natural language search interprets queries
- [ ] Completion verification warns before closing
- [ ] Loading states show during AI calls
- [ ] Errors are handled gracefully
- [ ] Performance is acceptable (<3s per call)

---

## Next Steps

After basic integration, consider:
1. Add unit tests for AI functions
2. Implement request caching strategy
3. Add user feedback mechanism for AI suggestions
4. Create analytics dashboard for AI usage
5. Optimize prompts based on user feedback

---

**Need Help?** Check `AI_TASK_FEATURES.md` for detailed API reference or contact the development team.
