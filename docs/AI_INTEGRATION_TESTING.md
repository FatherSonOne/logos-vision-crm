# AI Integration Testing Guide

**Date:** January 17, 2026
**Status:** Ready for Testing
**Phase:** 9 - AI & Automation Enhancement

---

## Overview

This guide covers testing and validating the newly integrated AI features:
1. Conversational AI Assistant (Gemini 2.0 Flash)
2. Predictive Analytics Engine
3. Performance Monitoring System

---

## Prerequisites

### 1. API Key Configuration

The Gemini AI integration requires an API key. Configure it in your environment:

**Option A: Environment Variable**
```bash
# .env.local
VITE_GEMINI_API_KEY=your_api_key_here
```

**Option B: Direct Configuration**
Edit [src/services/conversationalAiService.ts:18](src/services/conversationalAiService.ts#L18):
```typescript
constructor() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 'YOUR_API_KEY_HERE';
  this.genai = new GoogleGenerativeAI(apiKey);
  this.model = this.genai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
}
```

**Get API Key:**
1. Visit https://aistudio.google.com/apikey
2. Create new API key
3. Copy and paste into configuration

---

## Testing Conversational AI Assistant

### How to Access

The AI Assistant can be opened from the main application:
- Look for the AI Assistant button (typically in header or sidebar)
- Click to open the chat interface
- Beautiful purple-pink gradient interface will slide in from right

### Test Scenarios

#### 1. Task Creation via Natural Language

**Test Case:** Create task with assignee and deadline

**Input:**
```
Create a task for John to review the Q4 report by Friday
```

**Expected Behavior:**
- AI detects `create_task` intent
- Extracts entities:
  - Task title: "Review the Q4 report"
  - Assignee: John (matched from team members)
  - Due date: Next Friday (calculated)
  - Priority: Medium (default)
- Shows action button: "Create Task"
- Clicking button should trigger task creation

**Validation:**
```typescript
// Check response structure
response.intent === 'create_task'
response.entities.taskTitle === 'Review the Q4 report'
response.entities.assignee.name === 'John'
response.entities.dueDate instanceof Date
response.actions.length > 0
```

#### 2. Data Filtering and Search

**Test Case:** Find overdue tasks

**Input:**
```
Show me all overdue critical tasks
```

**Expected Behavior:**
- AI detects `filter_data` intent
- Extracts filters:
  - Status: overdue
  - Priority: critical
- Lists matching tasks
- Shows action button: "View All Overdue Tasks"

**Input Variations:**
```
Find all tasks assigned to Sarah
Show me projects with high risk
What tasks are due this week?
List all contacts from California
```

#### 3. Calendar and Scheduling

**Test Case:** Calendar query

**Input:**
```
What's on my calendar tomorrow?
```

**Expected Behavior:**
- AI detects `navigate` intent with calendar context
- Summarizes upcoming events
- Shows action button: "Open Calendar"

**Input Variations:**
```
Schedule a meeting with the team next Monday
When is my next meeting?
Show me my availability this week
```

#### 4. Report Generation

**Test Case:** Generate status report

**Input:**
```
Generate a project status report
```

**Expected Behavior:**
- AI detects `generate_report` intent
- Analyzes project data
- Provides summary
- Shows action button: "Generate Full Report"

#### 5. Conversational Context

**Test Case:** Multi-turn conversation

**Conversation:**
```
User: Show me all my tasks
AI: [Lists tasks]
User: Which ones are overdue?
AI: [Filters to overdue from previous context]
User: Assign the first one to Sarah
AI: [Creates assignment based on conversation history]
```

**Expected Behavior:**
- AI maintains conversation history (last 6 messages)
- References previous responses
- Understands pronouns ("the first one", "those", "it")

---

## Testing Predictive Analytics

### 1. Task Completion Prediction

**Test Function:**
```typescript
import { predictiveAnalytics } from './services/predictiveAnalytics';

// Test prediction
const task = {
  id: '123',
  title: 'Implement feature X',
  assignedToId: 'user-456',
  priority: 'high',
  estimatedHours: 8,
  dependencies: [],
};

const historicalTasks = [
  /* Previous tasks by same assignee */
];

const assigneeWorkload = [
  /* Current tasks for this assignee */
];

const prediction = await predictiveAnalytics.predictTaskCompletion(
  task,
  historicalTasks,
  assigneeWorkload
);

console.log('Prediction:', prediction);
```

**Expected Output:**
```json
{
  "taskId": "123",
  "predictedCompletionDate": "2026-01-24T00:00:00.000Z",
  "confidence": 0.75,
  "factors": {
    "historicalVelocity": 3.5,
    "currentWorkload": 5,
    "complexity": 7,
    "blockers": []
  },
  "riskLevel": "medium",
  "recommendation": "Task should complete on time with current resources"
}
```

**Validation Criteria:**
- `confidence` between 0-1
- `predictedCompletionDate` is in the future
- `riskLevel` is one of: 'low', 'medium', 'high', 'critical'
- `recommendation` provides actionable insight

### 2. Project Risk Scoring

**Test Function:**
```typescript
const project = {
  id: 'proj-789',
  name: 'Website Redesign',
  deadline: new Date('2026-02-15'),
  budget: 50000,
  spent: 35000,
};

const projectTasks = [
  /* All tasks for this project */
];

const teamMembers = [
  /* Team working on project */
];

const riskScore = await predictiveAnalytics.calculateProjectRisk(
  project,
  projectTasks,
  teamMembers
);

console.log('Risk Score:', riskScore);
```

**Expected Output:**
```json
{
  "projectId": "proj-789",
  "riskScore": 45,
  "riskLevel": "medium",
  "riskFactors": {
    "taskCompletionRate": 65,
    "overdueTaskCount": 2,
    "budgetOverrun": 0,
    "teamCapacity": 75,
    "dependencyChainLength": 3
  },
  "recommendations": [
    "Focus on completing overdue tasks to improve completion rate",
    "Consider adding team members to increase capacity",
    "Monitor budget closely as 70% has been spent"
  ]
}
```

**Validation Criteria:**
- `riskScore` between 0-100
- Higher score = higher risk
- `riskLevel` accurately reflects score
- `recommendations` are specific and actionable

### 3. Resource Optimization

**Test Function:**
```typescript
const allTasks = [
  /* All tasks across organization */
];

const allTeamMembers = [
  /* All team members */
];

const recommendations = await predictiveAnalytics.optimizeResources(
  allTasks,
  allTeamMembers
);

console.log('Recommendations:', recommendations);
```

**Expected Output:**
```json
[
  {
    "type": "rebalance",
    "priority": "high",
    "description": "Sarah is overloaded with 12 tasks while John has only 3",
    "impact": {
      "teamMemberIds": ["sarah-123", "john-456"],
      "affectedTasks": 5,
      "estimatedImprovement": "15% increase in team velocity"
    },
    "suggestedAction": "Reassign 5 low-priority tasks from Sarah to John"
  }
]
```

### 4. Churn Risk Detection

**Test Function:**
```typescript
const client = {
  id: 'client-999',
  name: 'Acme Corp',
  since: new Date('2024-06-01'),
};

const clientProjects = [
  /* Projects for this client */
];

const clientActivities = [
  /* Communication and activity logs */
];

const churnRisk = await predictiveAnalytics.detectChurnRisk(
  client,
  clientProjects,
  clientActivities
);

console.log('Churn Risk:', churnRisk);
```

**Expected Output:**
```json
{
  "clientId": "client-999",
  "riskLevel": 65,
  "riskCategory": "high",
  "signals": {
    "engagementDecline": true,
    "communicationGap": 45,
    "projectDelays": 2,
    "satisfactionTrend": "down"
  },
  "recommendedActions": [
    "Schedule immediate check-in call",
    "Review project timelines and address delays",
    "Send satisfaction survey",
    "Assign dedicated account manager"
  ],
  "urgency": "high",
  "estimatedChurnDate": "2026-03-15T00:00:00.000Z"
}
```

---

## Testing Performance Monitoring

### 1. Web Vitals Tracking

**Test:**
```typescript
import { performanceMonitor } from './services/performanceMonitor';

// Start monitoring (auto-starts in production)
performanceMonitor.startMonitoring();

// After page loads, check vitals
setTimeout(() => {
  const vitals = performanceMonitor.getWebVitals();
  console.log('Core Web Vitals:', vitals);
}, 3000);
```

**Expected Output:**
```json
{
  "lcp": 1850,
  "fid": 45,
  "cls": 0.05
}
```

**Validation:**
- LCP (Largest Contentful Paint) < 2500ms = Good
- FID (First Input Delay) < 100ms = Good
- CLS (Cumulative Layout Shift) < 0.1 = Good

### 2. Function Performance Measurement

**Test:**
```typescript
import { performanceMonitor } from './services/performanceMonitor';

async function expensiveOperation() {
  // Simulate heavy computation
  await new Promise(resolve => setTimeout(resolve, 500));
  return 'result';
}

// Measure performance
const result = await performanceMonitor.measure('data_fetch', expensiveOperation);

// Check metrics
const metrics = performanceMonitor.getMetricsByName('data_fetch');
console.log('Metrics:', metrics);
```

**Expected Output:**
```json
{
  "name": "data_fetch",
  "count": 1,
  "average": 502,
  "min": 502,
  "max": 502,
  "total": 502
}
```

### 3. Component Render Performance

**Test with Hook:**
```typescript
import { usePerformanceMonitor } from './services/performanceMonitor';

function MyComponent() {
  const { recordRender } = usePerformanceMonitor('MyComponent');

  useEffect(() => {
    recordRender();
  });

  return <div>Content</div>;
}
```

**Test with HOC:**
```typescript
import { withPerformanceMonitoring } from './services/performanceMonitor';

const MyComponent = () => <div>Content</div>;

export default withPerformanceMonitoring(MyComponent, 'MyComponent');
```

**Check Results:**
```typescript
performanceMonitor.logSummary();
```

**Expected Console Output:**
```
┌──────────────────────┬───────┬────────┬────────┬────────┐
│ Metric               │ Count │ Avg    │ Min    │ Max    │
├──────────────────────┼───────┼────────┼────────┼────────┤
│ MyComponent_render   │   15  │   8ms  │   2ms  │  25ms  │
│ data_fetch           │    5  │ 502ms  │ 450ms  │ 600ms  │
│ lcp                  │    1  │ 1850ms │ 1850ms │ 1850ms │
└──────────────────────┴───────┴────────┴────────┴────────┘
```

---

## Integration Testing

### End-to-End AI Workflow

**Scenario:** User creates task via AI, system predicts completion, monitors performance

**Steps:**
1. Open AI Assistant
2. Type: "Create a high priority task for Sarah to complete the homepage design by next Friday"
3. Click "Create Task" action button
4. Verify task created in database
5. AI automatically runs prediction
6. Check prediction appears in task detail view
7. Monitor performance metrics

**Validation Script:**
```typescript
// 1. Open AI Assistant
const aiButton = document.querySelector('[data-testid="ai-assistant-button"]');
aiButton.click();

// 2. Send message
const input = document.querySelector('input[placeholder*="Ask me"]');
input.value = "Create a high priority task for Sarah to complete the homepage design by next Friday";
const sendButton = document.querySelector('button[title="Send"]');
sendButton.click();

// 3. Wait for response and action button
await waitFor(() => {
  const actionButton = document.querySelector('button:contains("Create Task")');
  expect(actionButton).toBeInTheDocument();
});

// 4. Click action
const createButton = document.querySelector('button:contains("Create Task")');
createButton.click();

// 5. Verify task created
await waitFor(async () => {
  const tasks = await fetchTasks();
  const newTask = tasks.find(t => t.title.includes('homepage design'));
  expect(newTask).toBeDefined();
  expect(newTask.priority).toBe('high');
  expect(newTask.assignedTo.name).toBe('Sarah');
});

// 6. Check prediction
const prediction = await predictiveAnalytics.predictTaskCompletion(newTask);
expect(prediction.confidence).toBeGreaterThan(0.5);
```

---

## Performance Benchmarks

### Before Optimization (Baseline)
```
Initial Bundle Size: ~2.5 MB
Page Load Time: ~3.5 seconds
Time to Interactive: ~4.2 seconds
LCP: ~3800ms
FID: ~180ms
CLS: ~0.25
Lighthouse Score: 72/100
```

### After Optimization (Target)
```
Initial Bundle Size: ~850 KB (-68%)
Page Load Time: ~1.2 seconds (-66%)
Time to Interactive: ~1.8 seconds (-57%)
LCP: ~1850ms (-51%)
FID: ~45ms (-75%)
CLS: ~0.05 (-80%)
Lighthouse Score: 94/100 (+31%)
```

### How to Measure

**1. Build and analyze:**
```bash
npm run build
npm run preview
```

**2. Open Chrome DevTools:**
- Network tab: Check bundle sizes
- Performance tab: Record page load
- Lighthouse tab: Run audit

**3. Check performance monitor:**
```typescript
// After app loads
performanceMonitor.logSummary();
const vitals = performanceMonitor.getWebVitals();
console.log('Vitals:', vitals);
```

---

## Common Issues and Fixes

### Issue 1: AI Assistant Not Responding

**Symptoms:**
- Clicking send shows loading state indefinitely
- No response from AI

**Possible Causes:**
1. Missing or invalid Gemini API key
2. Network connectivity issues
3. API rate limiting

**Debug:**
```typescript
// Check API key
console.log('API Key configured:', !!import.meta.env.VITE_GEMINI_API_KEY);

// Check network
try {
  const response = await conversationalAiService.processMessage('test', {});
  console.log('AI Response:', response);
} catch (error) {
  console.error('AI Error:', error);
}
```

**Fix:**
- Verify API key is set correctly
- Check browser console for errors
- Ensure Gemini API quota hasn't been exceeded
- Check network tab for failed requests

### Issue 2: Predictions Are Inaccurate

**Symptoms:**
- Task completion dates are way off
- Project risk scores don't match reality

**Possible Causes:**
1. Insufficient historical data
2. Poor quality data (missing fields)
3. Algorithm parameters need tuning

**Debug:**
```typescript
const prediction = await predictiveAnalytics.predictTaskCompletion(task, historical);
console.log('Prediction factors:', prediction.factors);
console.log('Confidence:', prediction.confidence);
console.log('Historical tasks count:', historical.length);
```

**Fix:**
- Ensure at least 10+ historical tasks for accurate predictions
- Verify all required fields are populated
- Adjust algorithm weights in [src/services/predictiveAnalytics.ts:50-100](src/services/predictiveAnalytics.ts#L50-L100)

### Issue 3: Performance Monitoring Not Working

**Symptoms:**
- No metrics appearing in console
- Web Vitals showing as 0 or undefined

**Possible Causes:**
1. PerformanceObserver not supported (old browser)
2. Monitoring not started
3. Page loaded too quickly to measure

**Debug:**
```typescript
console.log('PerformanceObserver supported:', 'PerformanceObserver' in window);
console.log('Monitoring active:', performanceMonitor.isMonitoring);
console.log('Metrics count:', performanceMonitor.getAllMetrics().length);
```

**Fix:**
- Ensure modern browser (Chrome 90+, Firefox 88+)
- Manually start monitoring: `performanceMonitor.startMonitoring()`
- Wait for page to fully load before checking vitals

---

## Production Deployment Checklist

### Pre-Deployment

- [ ] Set `VITE_GEMINI_API_KEY` environment variable
- [ ] Run production build: `npm run build`
- [ ] Test build locally: `npm run preview`
- [ ] Run Lighthouse audit (target: 90+ score)
- [ ] Verify bundle sizes meet targets (<1MB total)
- [ ] Test AI assistant with various queries
- [ ] Validate prediction accuracy with sample data
- [ ] Check performance monitoring is active
- [ ] Review error handling for all AI features
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on mobile devices
- [ ] Verify API rate limits won't be exceeded

### Post-Deployment

- [ ] Monitor error rates in production
- [ ] Track AI conversation success rate
- [ ] Monitor prediction accuracy over time
- [ ] Review performance metrics daily
- [ ] Gather user feedback on AI features
- [ ] A/B test AI suggestions
- [ ] Optimize based on real usage patterns

---

## Success Metrics

### AI Assistant
- **Target:** 80%+ of user queries successfully handled
- **Measurement:** Track intent detection accuracy
- **Goal:** Reduce manual task creation by 40%

### Predictive Analytics
- **Target:** 75%+ prediction accuracy
- **Measurement:** Compare predicted vs actual completion dates
- **Goal:** Reduce project delays by 25%

### Performance
- **Target:** All Core Web Vitals in "Good" range
- **Measurement:** Real User Monitoring (RUM)
- **Goal:** 90+ Lighthouse score

---

## Next Steps

1. **Test AI Assistant** with the scenarios above
2. **Validate Predictions** against historical data
3. **Benchmark Performance** before/after optimization
4. **Gather Feedback** from early users
5. **Iterate and Improve** based on results

---

**Ready to Test!** 🚀

All AI features are fully integrated and ready for validation. Start with the conversational AI assistant and work through the test scenarios to ensure everything works as expected.
