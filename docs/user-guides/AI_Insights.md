# AI Insights Guide

Leverage artificial intelligence to uncover hidden patterns, forecast future trends, detect anomalies, and receive actionable recommendations from your data.

## Table of Contents
- [Overview](#overview)
- [Understanding Forecasts](#understanding-forecasts)
- [Interpreting Confidence Intervals](#interpreting-confidence-intervals)
- [Anomaly Detection](#anomaly-detection)
- [Correlation Analysis](#correlation-analysis)
- [Acting on AI Recommendations](#acting-on-ai-recommendations)
- [Dismissing and Managing Insights](#dismissing-and-managing-insights)
- [AI Insight Types](#ai-insight-types)
- [Best Practices](#best-practices)

---

## Overview

AI Insights in Logos Vision CRM uses machine learning algorithms to automatically analyze your data, identify patterns, and provide actionable recommendations.

### What are AI Insights?

**AI Insights** are automatically generated observations and predictions about your data that help you:
- Understand what's happening (descriptive)
- Why it's happening (diagnostic)
- What will happen next (predictive)
- What you should do about it (prescriptive)

**How AI Insights work:**
1. AI continuously analyzes your CRM data
2. Patterns, trends, and anomalies are detected
3. Insights are generated and ranked by importance
4. You receive notifications for significant insights
5. You can act on recommendations or dismiss insights

**[Screenshot: AI Insights dashboard showing various insights]**

### Benefits of AI Insights

✓ **Save time**: No manual data analysis needed
✓ **Catch what you'd miss**: AI spots patterns humans overlook
✓ **Predict the future**: Forecast trends before they're obvious
✓ **Proactive, not reactive**: Address issues before they become problems
✓ **Data-driven decisions**: Remove guesswork with AI recommendations
✓ **Continuous learning**: AI improves as it sees more data

### Where AI Insights Appear

**Throughout the Reports system:**
- **Reports page**: Insights panel on dashboard
- **Individual reports**: Insights specific to that report
- **KPI widgets**: Forecast and anomaly detection
- **Dashboards**: AI insights widget
- **Notifications**: Email and in-app alerts for important insights

**[Screenshot: AI Insights appearing in different locations]**

---

## Understanding Forecasts

AI generates forecasts for time-series data (metrics tracked over time).

### What is a Forecast?

A **forecast** is a prediction of future values based on historical patterns.

**Forecast components:**
- **Historical data**: Past values (what actually happened)
- **Fitted values**: AI's understanding of past patterns
- **Forecast**: Predicted future values
- **Confidence interval**: Range of likely values

**[Screenshot: Forecast chart with components labeled]**

### Forecast Algorithms

**Multiple algorithms are used:**

**Linear Regression**
- Best for: Steady growth/decline trends
- Example: Revenue growing consistently month-over-month

**Seasonal Decomposition**
- Best for: Data with recurring patterns
- Example: Higher sales in Q4 every year

**ARIMA (AutoRegressive Integrated Moving Average)**
- Best for: Complex time series with trends and seasonality
- Example: Monthly sales with growth trend and seasonal spikes

**Prophet (Facebook's forecasting algorithm)**
- Best for: Daily/weekly data with strong seasonality
- Example: Website traffic patterns by day of week

**Neural Networks**
- Best for: Complex, non-linear patterns
- Example: Sales influenced by many factors

**AI automatically selects the best algorithm** based on your data characteristics.

**[Screenshot: Comparison of different forecast algorithms]**

### Reading a Forecast Chart

**Understanding the visualization:**

```
Past                    │ Future
─────────────────────── │ ───────────────────
                        │
Actual values (line)    │ Forecast (dashed line)
                        │ Confidence interval (shaded area)
                        │
                        Today
```

**Elements:**
- **Solid line (left)**: Historical actual values
- **Dashed line (right)**: Forecasted values
- **Shaded area (right)**: Confidence interval (80% or 95%)
- **Vertical line**: Today (separates past from future)

**Example interpretation:**
```
Current Monthly Revenue: $850,000
Forecast for next month: $920,000
Confidence Interval (80%): $880,000 - $960,000
Interpretation: "We expect $920K next month, with 80% confidence
                it will be between $880K and $960K"
```

**[Screenshot: Annotated forecast chart]**

### Forecast Accuracy

**How to assess forecast reliability:**

**Accuracy metrics:**
- **MAPE (Mean Absolute Percentage Error)**: Average forecast error as %
  - < 10%: Excellent accuracy
  - 10-20%: Good accuracy
  - 20-50%: Reasonable accuracy
  - > 50%: Poor accuracy, use with caution

**Example:**
```
Forecast accuracy: 12% MAPE
Interpretation: On average, forecasts are within 12% of actual values
If forecast is $920K, expect actual to be $810K-$1,030K
```

**Factors affecting accuracy:**
- **Data history**: More history = better forecasts (12+ months ideal)
- **Data consistency**: Regular patterns = more accurate
- **External factors**: Major changes (new product, market shift) reduce accuracy
- **Forecast horizon**: Near-term forecasts more accurate than long-term

**[Screenshot: Forecast accuracy indicators]**

### Forecast Scenarios

**View multiple scenarios:**

**Optimistic scenario:**
- Assumes positive trends continue
- Upper bound of confidence interval
- Use for: Best-case planning

**Expected scenario:**
- Most likely outcome
- Center line of forecast
- Use for: Normal planning

**Pessimistic scenario:**
- Assumes challenges arise
- Lower bound of confidence interval
- Use for: Risk mitigation planning

**Example: Quarterly Revenue Forecast**
```
Optimistic:  $3,200,000 (if trends accelerate)
Expected:    $2,900,000 (most likely)
Pessimistic: $2,600,000 (if growth slows)

Planning recommendation: Budget for $2,900K, prepare for $2,600K
```

**[Screenshot: Forecast scenarios comparison]**

---

## Interpreting Confidence Intervals

Confidence intervals show the range of likely values.

### What is a Confidence Interval?

A **confidence interval** represents the range where the true value is likely to fall.

**Common confidence levels:**
- **80% confidence**: "80% chance actual value falls in this range"
- **95% confidence**: "95% chance actual value falls in this range"

**Wider interval = less certainty**
**Narrower interval = more certainty**

**[Screenshot: Narrow vs. wide confidence intervals]**

### Reading Confidence Intervals

**Example 1: Narrow interval (high confidence)**
```
Forecast: $920,000
80% Confidence Interval: $900,000 - $940,000
Range: $40,000 (4.3% of forecast)
Interpretation: "Very confident forecast will be close to $920K"
```

**Example 2: Wide interval (low confidence)**
```
Forecast: $920,000
80% Confidence Interval: $750,000 - $1,090,000
Range: $340,000 (37% of forecast)
Interpretation: "Less confident, value could vary significantly"
```

### Why Intervals Widen Over Time

**Short-term forecasts** (next week):
- Narrow confidence interval
- More certainty
- Recent trends still apply

**Long-term forecasts** (6 months out):
- Wide confidence interval
- More uncertainty
- Many things can change

**Example:**
```
Next month forecast:    $920K (± $20K)  ← Narrow
3 months out:           $980K (± $80K)  ← Medium
6 months out:          $1,100K (± $200K) ← Wide
```

**Recommendation: Trust near-term forecasts more than long-term.**

**[Screenshot: Confidence interval widening over time]**

### Using Confidence Intervals for Planning

**Conservative planning:**
- Use lower bound (pessimistic scenario)
- Good for: Budget planning, risk management
- Example: "Plan for at least $700K revenue"

**Aggressive planning:**
- Use upper bound (optimistic scenario)
- Good for: Stretch goals, opportunity planning
- Example: "If we hit $1.1M, we can invest in expansion"

**Balanced planning:**
- Use expected value (center line)
- Good for: Normal operations, forecasting
- Example: "Expect $920K revenue"

**Scenario planning:**
- Plan for multiple scenarios
- Good for: Strategic planning, contingency planning
- Example: "Budget for $920K, have backup plan for $750K, stretch goal for $1.1M"

**[Screenshot: Planning scenarios based on confidence intervals]**

---

## Anomaly Detection

AI automatically detects unusual patterns in your data.

### What is an Anomaly?

An **anomaly** is a data point that significantly deviates from the expected pattern.

**Types of anomalies:**
- **Spike**: Sudden increase
- **Drop**: Sudden decrease
- **Missing data**: Expected value didn't occur
- **Pattern change**: Trend shifts unexpectedly

**[Screenshot: Examples of different anomaly types]**

### How Anomaly Detection Works

**AI learns normal patterns:**
1. Analyzes historical data
2. Identifies typical ranges and patterns
3. Establishes baseline for "normal"
4. Flags values outside normal range

**Anomaly scoring:**
- **Mild**: Slightly unusual (1.5-2x typical variation)
- **Moderate**: Noticeably unusual (2-3x typical variation)
- **Severe**: Highly unusual (3x+ typical variation)

**Example:**
```
Normal daily revenue: $25,000 - $35,000 (typical range)
Today's revenue: $52,000

Anomaly detected: Severe spike (+67% above normal)
Possible causes:
  - Large deal closed
  - End-of-quarter push
  - Data entry error
```

**[Screenshot: Anomaly detection with severity levels]**

### Anomaly Alerts

**When anomaly is detected:**
1. Insight is generated
2. Owner is notified (if configured)
3. Anomaly appears on dashboard
4. Investigation tools provided

**Alert example:**
```
⚠️ Anomaly Detected: New Leads

Today: 87 new leads (↑ 340% above typical)
Typical: 15-25 new leads

Possible causes:
  ✓ Marketing campaign launched (likely)
  ✓ Website traffic spike
  ✓ Data import occurred
  ? Data quality issue

Recommendation: Verify data quality, ensure leads are legitimate
```

**[Screenshot: Anomaly alert notification]**

### Investigating Anomalies

**AI-guided investigation:**

**1. Identify the anomaly**
- What metric is affected
- When it occurred
- How severe

**2. AI suggests possible causes**
- Recent campaigns or events
- Correlated changes in other metrics
- Historical precedent
- External factors

**3. Drill down into data**
- View detailed records
- Filter to affected time period
- Compare to similar periods
- Check data quality

**4. Take action or dismiss**
- If legitimate: Celebrate good news or address bad news
- If error: Correct data
- If explained: Add annotation
- If not concerning: Dismiss insight

**Investigation tools:**
- Click anomaly → **"Investigate"**
- View affected records
- See timeline of events
- Compare to historical data
- Add notes and annotations

**[Screenshot: Anomaly investigation interface]**

### Positive vs. Negative Anomalies

**Positive anomalies (good news):**
- Revenue spike
- Conversion rate jump
- Task completion surge
- Customer satisfaction increase

**Action: Identify what caused it, replicate success**

**Negative anomalies (bad news):**
- Revenue drop
- Lead volume decrease
- Response time spike
- Satisfaction score decline

**Action: Investigate cause, take corrective action**

**[Screenshot: Positive and negative anomaly examples]**

---

## Correlation Analysis

AI discovers relationships between different metrics.

### What is Correlation?

**Correlation** measures how two variables move together.

**Correlation types:**
- **Positive correlation**: When one increases, other increases
  - Example: More outbound calls → More meetings scheduled
- **Negative correlation**: When one increases, other decreases
  - Example: Higher price → Lower conversion rate
- **No correlation**: Variables move independently
  - Example: Number of emails sent and weather temperature

**Correlation strength:**
- **Strong** (0.7-1.0): Variables move together consistently
- **Moderate** (0.4-0.7): Noticeable relationship
- **Weak** (0.1-0.4): Slight relationship
- **None** (0.0-0.1): No meaningful relationship

**[Screenshot: Correlation strength visualization]**

### How AI Finds Correlations

**Automatic correlation discovery:**
1. AI analyzes all metrics in your CRM
2. Calculates correlation between each pair
3. Ranks correlations by strength and business relevance
4. Surfaces top insights

**You don't have to ask** - AI proactively identifies correlations.

### Correlation Insights

**Example insights:**

**Insight 1: Activity and Revenue**
```
Strong correlation detected (0.82)
More sales calls → Higher revenue

Finding: Reps who make 50+ calls/week close 2.3x more revenue
Recommendation: Set minimum call volume goal of 50/week
```

**Insight 2: Response Time and Conversion**
```
Negative correlation detected (-0.67)
Faster lead response → Higher conversion

Finding: Leads contacted within 5 minutes convert at 21%
        Leads contacted after 1 hour convert at 7%
Recommendation: Implement auto-assignment for sub-5-minute response
```

**Insight 3: Pricing and Win Rate**
```
Moderate negative correlation (-0.52)
Higher discount → Lower win rate

Finding: Deals with >20% discount win at 35% rate
        Deals with <10% discount win at 58% rate
Interpretation: Aggressive discounting may signal desperation
Recommendation: Train reps on value selling, reduce reliance on discounts
```

**[Screenshot: Correlation insight examples]**

### Correlation vs. Causation

**⚠️ Important: Correlation ≠ Causation**

**Correlation**: Two things move together
**Causation**: One thing causes the other

**Example of correlation without causation:**
```
Correlation found: Ice cream sales and drowning deaths (0.78)
Interpretation: Both increase in summer (heat causes both)
Wrong conclusion: Ice cream causes drowning
Right conclusion: Season affects both independently
```

**AI flags likely causal relationships:**
- Based on business logic
- Temporal order (A happens before B)
- Domain knowledge
- Historical precedent

**Always apply business judgment** to correlations.

**[Screenshot: Correlation vs. causation examples]**

### Using Correlations for Action

**Leverage positive correlations:**
- Identify success factors
- Replicate winning behaviors
- Focus resources on high-impact activities

**Example:**
```
Correlation: Demo completion rate (0.71) → Deal closure
Action: Prioritize getting prospects to complete demos
```

**Address negative correlations:**
- Identify risk factors
- Mitigate negative impacts
- Change problematic behaviors

**Example:**
```
Correlation: Long sales cycles (-0.58) → Lower win rates
Action: Implement sales process to shorten cycles
```

**[Screenshot: Action plan based on correlations]**

---

## Acting on AI Recommendations

AI provides specific, actionable recommendations based on insights.

### Types of Recommendations

**Optimization recommendations:**
- "Increase X to improve Y"
- "Reduce Z to lower costs"
- "Focus on A instead of B"

**Alert recommendations:**
- "Address this issue before it worsens"
- "Investigate this anomaly"
- "Follow up on this opportunity"

**Strategic recommendations:**
- "Invest in X for long-term growth"
- "Shift resources from Y to Z"
- "Change approach to improve results"

**[Screenshot: Different recommendation types]**

### Recommendation Examples

**Example 1: Pipeline Health**
```
🔍 Insight: Pipeline coverage is 2.1x quota (below healthy 3x)

📊 Analysis:
  - Current pipeline: $4.2M
  - Quota: $2M
  - Healthy coverage: $6M (3x)
  - Shortfall: $1.8M

💡 Recommendation:
  1. Increase lead generation by 30% (add $900K to pipeline)
  2. Improve qualification to focus on higher-value opportunities
  3. Accelerate 5 deals currently in Negotiation stage (worth $900K)

⏱️ Timeline: 30 days to reach healthy coverage
🎯 Owner: VP of Sales
```

**Example 2: Activity Optimization**
```
🔍 Insight: Email open rate dropped 15% over last 2 weeks

📊 Analysis:
  - Previous open rate: 32%
  - Current open rate: 27%
  - Subject line length increased from 42 to 68 characters (avg)

💡 Recommendation:
  1. Reduce subject line to <50 characters
  2. Increase personalization (current: 23%, target: 60%)
  3. Test send times (currently 2 PM, try 9 AM)
  4. A/B test subject lines this week

⏱️ Timeline: Implement this week, measure next week
🎯 Owner: Marketing Manager
```

**Example 3: Forecasting**
```
🔍 Insight: Revenue forecast shows 15% shortfall to quota

📊 Analysis:
  - Quota: $1M
  - Forecast: $850K (85% to goal)
  - Confidence: 80%
  - Days remaining: 18

💡 Recommendation:
  1. Accelerate 3 large deals in Proposal stage (total $180K)
     - Acme Corp ($75K) - 80% probability
     - Beta Inc ($60K) - 65% probability
     - Gamma LLC ($45K) - 70% probability
  2. Offer limited-time promotion to close fence-sitters
  3. Focus entirely on closing existing opps (no new prospecting)

⏱️ Timeline: Immediate action required
🎯 Owner: Sales team
```

**[Screenshot: Detailed recommendation with action plan]**

### Recommendation Priority

AI ranks recommendations by:

**Impact:**
- **High impact**: Significant effect on key metrics
- **Medium impact**: Noticeable effect
- **Low impact**: Marginal improvement

**Urgency:**
- **Urgent**: Immediate action required
- **Soon**: Action needed within days/weeks
- **Planned**: Incorporate into next planning cycle

**Effort:**
- **Quick win**: Low effort, high impact
- **Major project**: High effort, high impact
- **Optimization**: Low effort, low impact

**Priority matrix:**
```
High Impact, Low Effort    → Do First (Quick Wins)
High Impact, High Effort   → Schedule (Major Initiatives)
Low Impact, Low Effort     → Do When Time Permits
Low Impact, High Effort    → Reconsider
```

**[Screenshot: Recommendation priority matrix]**

### Accepting Recommendations

**To act on recommendation:**
1. Review recommendation details
2. Click **"Accept Recommendation"**
3. Options:
   - **Create Task**: Generate task(s) for action items
   - **Create Project**: For complex recommendations
   - **Add to Calendar**: Schedule time to work on it
   - **Assign**: Delegate to team member
4. Track progress
5. AI monitors to see if action improved metrics

**Action tracking:**
- Recommendation status: Pending → In Progress → Completed
- Metrics are monitored post-action
- AI assesses whether action had expected impact
- Learn which recommendations work best

**[Screenshot: Accept recommendation workflow]**

---

## Dismissing and Managing Insights

Not all insights are relevant. Manage which ones you see.

### Dismissing Insights

**To dismiss insight:**
1. Open insight
2. Click **"Dismiss"**
3. (Optional) Provide reason:
   - Not relevant
   - Already aware
   - Data quality issue
   - Explained by known factor
4. Insight is removed from view

**Dismissed insights are used to improve AI** - helps AI learn what's relevant to you.

**[Screenshot: Dismiss insight dialog]**

### Insight Feedback

**Rate insights to improve AI:**
- 👍 Helpful: Valuable, actionable insight
- 👎 Not helpful: Not relevant or useful
- 💡 Great insight: Particularly valuable

**Feedback improves AI by:**
- Learning which insight types you value
- Prioritizing similar insights in future
- Filtering out noise
- Personalizing to your role and interests

**[Screenshot: Insight feedback buttons]**

### Insight Settings

**Customize what insights you receive:**
1. Go to **Reports** → **Settings** → **AI Insights**
2. Configure preferences

**Settings:**

**Insight types:**
- ☑ Forecasts
- ☑ Anomalies
- ☑ Correlations
- ☐ Recommendations (can disable)
- ☑ Trend alerts

**Notification thresholds:**
- Only notify for **High** or **Critical** insights
- Notify for all insights
- Daily digest (all insights in one email)

**Insight frequency:**
- Real-time (as detected)
- Daily summary
- Weekly summary

**Auto-dismiss settings:**
- Dismiss low-priority insights after X days
- Dismiss explained anomalies automatically
- Dismiss duplicate insights

**[Screenshot: AI Insights settings panel]**

### Insight History

**View all insights (including dismissed):**
1. Navigate to **Reports** → **AI Insights** → **History**
2. View timeline of all insights
3. Filter by:
   - Type (forecast, anomaly, correlation)
   - Status (active, dismissed, acted upon)
   - Date range
   - Metric/Report

**Insight history uses:**
- Review past insights
- Restore dismissed insights
- Audit trail of AI suggestions
- Learn from historical patterns

**[Screenshot: Insight history timeline]**

---

## AI Insight Types

### Forecast Insights

**Revenue forecast**
```
📈 Forecast: Next month revenue
Expected: $920,000 (±8%)
Trend: Increasing (+15% vs. last month)
Confidence: High (MAPE: 9.2%)
```

**Opportunity close date forecast**
```
📅 Deal: Acme Corp renewal
Forecasted close: March 15
Probability: 78%
Recommendation: Schedule demo for early March to stay on track
```

**Churn prediction**
```
⚠️ Churn risk: Beta Industries
Risk score: 67% (High)
Factors:
  - Low engagement (no logins in 30 days)
  - Support tickets increased 3x
  - No feature adoption
Recommendation: Schedule check-in call this week
```

**[Screenshot: Forecast insight examples]**

### Anomaly Insights

**Performance spike**
```
🚀 Anomaly: Deals closed today
Value: 7 deals (↑ 350% vs. typical 1.5 deals)
Likely cause: End of quarter push
Action: Celebrate team success, analyze what worked
```

**Performance drop**
```
⚠️ Anomaly: Lead conversion rate
Value: 8% (↓ 60% vs. typical 20%)
Duration: Last 3 days
Possible causes:
  - Lead quality decreased (new campaign?)
  - Follow-up delays
  - Sales team capacity issue
Action: Investigate urgently
```

**[Screenshot: Anomaly insight examples]**

### Correlation Insights

**Success factor identification**
```
🔍 Correlation: Demos completed → Deal closure
Strength: 0.79 (Strong positive)
Finding: Deals with completed demo close at 64% rate
         Deals without demo close at 18% rate
Action: Prioritize demo completion, track demo rate as leading indicator
```

**Risk factor identification**
```
⚠️ Correlation: Deal size → Sales cycle length
Strength: 0.71 (Strong positive)
Finding: Each $10K increase adds 8 days to cycle
Implication: Large deals take longer, plan accordingly
Action: Adjust pipeline coverage for large deal focus
```

**[Screenshot: Correlation insight examples]**

### Trend Insights

**Emerging trend**
```
📊 Trend: Mobile demo requests
Change: ↑ 340% over last 90 days
Insight: More prospects want mobile demos
Recommendation: Create mobile demo template, train team on mobile features
```

**Declining trend**
```
📉 Trend: Email response rates
Change: ↓ 22% over last 60 days
Insight: Email engagement decreasing
Possible causes: Email fatigue, content not resonating, poor targeting
Recommendation: Refresh email templates, test new approaches, reduce frequency
```

**[Screenshot: Trend insight examples]**

### Segmentation Insights

**High-performing segment**
```
🎯 Segment: Enterprise customers (>1000 employees)
Performance: 2.3x average deal size, 1.8x retention rate
Insight: Enterprise segment highly valuable
Recommendation: Increase marketing spend targeting enterprise
```

**Underperforming segment**
```
⚠️ Segment: Small business (<50 employees)
Performance: 0.6x average deal size, 38% higher churn
Insight: Small business segment not ideal
Recommendation: Consider minimum company size requirement, or create SMB-specific offering
```

**[Screenshot: Segmentation insight examples]**

---

## Best Practices

### Trust but Verify

**AI is powerful but not perfect:**
- ✓ Review AI insights critically
- ✓ Apply business judgment
- ✓ Verify with domain experts
- ✓ Test recommendations before full rollout
- ✓ Monitor results of actions taken

**Don't blindly follow AI** - use it as a smart assistant, not autopilot.

### Provide Feedback

**The more feedback, the better AI becomes:**
- Rate every insight (helpful/not helpful)
- Dismiss irrelevant insights
- Accept recommendations that work
- Report when recommendations don't pan out

**Your feedback trains AI to serve you better.**

### Act on Insights

**Insights are only valuable if they drive action:**
- Review insights weekly (at minimum)
- Create tasks from recommendations
- Track which actions improve metrics
- Share insights with team
- Celebrate when AI helps win

**Insight → Action → Result → Learning**

### Combine AI with Human Insight

**Best results come from AI + Human:**
- AI spots patterns humans miss
- Humans provide context AI lacks
- AI quantifies, humans strategize
- AI suggests, humans decide

**Partnership, not replacement.**

**[Screenshot: AI-human collaboration diagram]**

### Monitor AI Performance

**Track AI accuracy over time:**
- Review forecast accuracy monthly
- Check if anomalies were legitimate
- Assess whether correlations held true
- Measure ROI of acted-upon recommendations

**Good AI performance:**
- Forecast MAPE < 15%
- 70%+ of anomalies are legitimate
- 60%+ of recommendations rated helpful

### Start Small

**If new to AI insights:**
1. Start with forecasts (easiest to understand)
2. Add anomaly detection next
3. Then explore correlations
4. Finally, act on recommendations

**Build confidence gradually** before relying heavily on AI.

---

## Related Topics

- [KPIs and Metrics](KPIs_and_Metrics.md) - AI-powered KPI forecasting
- [Creating Reports](Creating_Reports.md) - Reports that feed AI insights
- [Dashboards](Dashboards.md) - Display AI insights on dashboards
- [Advanced Filtering](Advanced_Filtering.md) - Filter based on AI insights
- [Tips and Best Practices](Tips_and_Best_Practices.md) - General reporting best practices

---

**Last Updated**: January 2026
**Version**: 3.0

---

*Next: Learn about [Advanced Filtering](Advanced_Filtering.md) to create complex data filters for your reports.*
