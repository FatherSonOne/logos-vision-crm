# AI Features Quick Start Guide

**Get started with AI features in under 5 minutes!** 🚀

---

## Step 1: Configure API Key (2 minutes)

### Get Your Gemini API Key

1. Visit https://aistudio.google.com/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

### Add to Your Project

**Option A: Environment Variable (Recommended)**
```bash
# Create .env.local in project root
echo "VITE_GEMINI_API_KEY=your_api_key_here" > .env.local
```

**Option B: Direct Configuration**
Edit [src/services/conversationalAiService.ts:18](../src/services/conversationalAiService.ts#L18):
```typescript
const apiKey = 'YOUR_API_KEY_HERE'; // Replace with your actual key
```

---

## Step 2: Start the App (1 minute)

```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

Open http://localhost:5173

---

## Step 3: Open AI Assistant (30 seconds)

**Method 1: Header Button**
- Look for the "AI Assistant" or sparkle ✨ icon in the header
- Click to open

**Method 2: Keyboard Shortcut**
- Press `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux)
- Type "AI" and select "AI Assist"

**Method 3: Quick Actions**
- Click the floating "+" button (bottom-right)
- Select "AI Assistant"

---

## Step 4: Try These Commands (2 minutes)

### Create a Task
```
Create a high priority task for John to review the Q4 report by Friday
```

**Expected Result:**
- AI extracts: Title, Assignee (John), Priority (High), Due Date (Friday)
- Shows "Create Task" button
- Click to create the task

### Find Overdue Items
```
Show me all overdue tasks
```

**Expected Result:**
- AI filters tasks by status
- Lists overdue tasks
- Shows "View All Overdue Tasks" button

### Calendar Query
```
What's on my calendar tomorrow?
```

**Expected Result:**
- AI summarizes upcoming events
- Shows meeting count and times
- Shows "Open Calendar" button

### Generate Report
```
Generate a project status report
```

**Expected Result:**
- AI analyzes project data
- Provides summary
- Shows "Generate Full Report" button

---

## Common Commands Cheat Sheet

### Task Management
```
Create a task for [name] to [action] by [date]
Show me all [priority] tasks
What tasks are assigned to [name]?
Find all tasks due this week
Mark task [name] as complete
```

### Calendar & Meetings
```
What's on my calendar [today/tomorrow/this week]?
Schedule a meeting with [team] on [date]
When is my next meeting?
Show me my availability
```

### Data Filtering
```
Show me all [high-risk/completed/delayed] projects
Find contacts from [location]
List all donations over [amount]
What clients haven't been contacted recently?
```

### Analytics & Reports
```
Generate a [monthly/quarterly] report
What's our team capacity?
Show me the top 5 [donors/projects/clients]
Give me an activity summary
Predict when [task/project] will be completed
```

---

## Understanding AI Responses

### Action Buttons
When AI understands your request, it shows **action buttons**:
- **Create Task** - Opens task creation with pre-filled data
- **View All** - Navigates to filtered view
- **Open Calendar** - Jumps to calendar page
- **Generate Report** - Creates detailed report

**Click these buttons to execute the suggested action!**

### Quick Suggestions
At the bottom of the chat, you'll see **suggestion chips** for common queries:
- "Show overdue tasks"
- "Create a task"
- "What's on my calendar?"
- "Project status report"

**Click any suggestion to send that query instantly.**

### Conversation Context
The AI remembers your last 6 messages, so you can have natural conversations:

```
You: "Show me all my tasks"
AI: [Lists tasks]

You: "Which ones are overdue?"
AI: [Filters to overdue from previous context]

You: "Assign the first one to Sarah"
AI: [Understands "the first one" refers to the overdue task]
```

---

## Predictive Analytics (Automatic)

### Task Completion Prediction

When you create or view a task, the system **automatically predicts**:
- Estimated completion date
- Confidence level (0-100%)
- Risk level (low/medium/high/critical)
- Recommendations

**Where to see:** Task detail view (automatically calculated)

### Project Risk Scoring

Projects are **automatically analyzed** for risk:
- Risk score (0-100)
- Risk factors (completion rate, overdue tasks, capacity)
- Actionable recommendations

**Where to see:** Project detail view or dashboard

### Churn Risk Detection

Client relationships are **continuously monitored**:
- Engagement decline warnings
- Communication gap alerts
- Project delay notifications
- Satisfaction trend analysis

**Where to see:** Contact/Client detail view

---

## Performance Monitoring (Automatic)

The app automatically tracks:
- Page load speed
- Component render performance
- API response times
- Core Web Vitals (LCP, FID, CLS)

**View metrics:** Open browser console and type:
```javascript
performanceMonitor.logSummary()
```

**Expected output:**
```
┌──────────────────────┬───────┬────────┬────────┬────────┐
│ Metric               │ Count │ Avg    │ Min    │ Max    │
├──────────────────────┼───────┼────────┼────────┼────────┤
│ page_load_time       │   1   │ 1234ms │ 1234ms │ 1234ms │
│ lcp                  │   1   │ 1850ms │ 1850ms │ 1850ms │
└──────────────────────┴───────┴────────┴────────┴────────┘
```

---

## Troubleshooting

### AI Not Responding

**Symptom:** Clicking send shows loading indefinitely

**Solution:**
1. Check API key is configured correctly
2. Open browser console (F12)
3. Look for errors
4. Verify internet connection
5. Check Gemini API quota

**Debug command:**
```javascript
console.log('API Key:', import.meta.env.VITE_GEMINI_API_KEY ? 'Configured' : 'Missing');
```

### Predictions Are Inaccurate

**Symptom:** Task completion dates are wrong

**Solution:**
- Ensure you have historical task data (need 10+ completed tasks)
- Verify task fields are filled (assignee, priority, estimated hours)
- Check that team members have task history

### Performance Issues

**Symptom:** App is slow

**Solution:**
1. Build for production: `npm run build && npm run preview`
2. Check bundle sizes in `dist/` folder
3. Run Lighthouse audit
4. Clear browser cache
5. Check performance monitor for bottlenecks

---

## Advanced Usage

### Manual Predictive Analytics

```typescript
import { predictiveAnalytics } from './services/predictiveAnalytics';

// Predict task completion
const prediction = await predictiveAnalytics.predictTaskCompletion(
  task,
  historicalTasks,
  assigneeWorkload
);

console.log('Will complete:', prediction.predictedCompletionDate);
console.log('Confidence:', prediction.confidence);
console.log('Risk:', prediction.riskLevel);

// Calculate project risk
const risk = await predictiveAnalytics.calculateProjectRisk(
  project,
  projectTasks,
  teamMembers
);

console.log('Risk score:', risk.riskScore);
console.log('Recommendations:', risk.recommendations);
```

### Performance Measurement

```typescript
import { performanceMonitor } from './services/performanceMonitor';

// Measure function performance
const result = await performanceMonitor.measure('myOperation', async () => {
  return await expensiveOperation();
});

// Get Web Vitals
const vitals = performanceMonitor.getWebVitals();
console.log('LCP:', vitals.lcp, 'ms');
console.log('FID:', vitals.fid, 'ms');
console.log('CLS:', vitals.cls);
```

### Cache Management

```typescript
import { apiCache, cacheKeys, invalidateCache } from './services/cacheManager';

// Manual caching
const tasks = await apiCache.getOrSet(
  cacheKeys.tasks.list({ status: 'active' }),
  () => fetchActiveTasks(),
  5 * 60 * 1000 // 5 minutes TTL
);

// Invalidate when data changes
invalidateCache.tasks(); // Clear all task cache
invalidateCache.all();   // Clear everything
```

---

## Tips for Best Results

### 1. Be Specific
```
❌ "Create a task"
✅ "Create a high priority task for John to review the Q4 report by Friday"
```

### 2. Use Natural Language
```
✅ "Show me all overdue tasks assigned to Sarah"
✅ "What's on my calendar tomorrow?"
✅ "Find all high-risk projects"
```

### 3. Multi-Turn Conversations
```
You: "Show me all my projects"
AI: [Lists projects]
You: "Which ones are behind schedule?"
AI: [Filters to delayed projects]
You: "Generate a status report for those"
AI: [Creates report]
```

### 4. Leverage Context
The AI knows about:
- Your tasks, projects, contacts
- Your team members
- Your calendar events
- Recent activities

### 5. Ask for Help
```
"What can you help me with?"
"How do I create a task?"
"Show me examples of what I can ask"
```

---

## Production Checklist

Before deploying to production:

- [ ] Set `VITE_GEMINI_API_KEY` environment variable
- [ ] Run `npm run build`
- [ ] Test build: `npm run preview`
- [ ] Verify Lighthouse score > 90
- [ ] Test AI features with real data
- [ ] Enable error tracking
- [ ] Monitor API usage to avoid quota limits

---

## Next Steps

1. **Read the full testing guide:** [AI_INTEGRATION_TESTING.md](./AI_INTEGRATION_TESTING.md)
2. **Review implementation details:** [PHASE_8_9_COMPLETE.md](./PHASE_8_9_COMPLETE.md)
3. **Check performance benchmarks:** [PHASE_8_9_COMPLETE_SUMMARY.md](./PHASE_8_9_COMPLETE_SUMMARY.md)

---

## Getting Help

**Common Questions:**
- "What commands can I use?" → Ask the AI: "What can you help me with?"
- "How accurate are predictions?" → Check confidence score (>75% is reliable)
- "Why is the app slow?" → Run `performanceMonitor.logSummary()` in console

**Resources:**
- [Full Documentation](./PHASE_8_9_IMPLEMENTATION_PLAN.md)
- [Testing Guide](./AI_INTEGRATION_TESTING.md)
- Gemini API Docs: https://ai.google.dev/docs

---

**You're all set! Start chatting with your AI assistant!** 🎉
