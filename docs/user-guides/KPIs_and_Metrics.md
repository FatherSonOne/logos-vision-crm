# KPIs and Metrics Guide

Track, monitor, and optimize your Key Performance Indicators (KPIs) with powerful metric tracking, targets, alerts, and historical analysis.

## Table of Contents
- [Understanding KPIs](#understanding-kpis)
- [Creating Custom KPIs](#creating-custom-kpis)
- [KPI Calculation Types](#kpi-calculation-types)
- [Setting Targets and Thresholds](#setting-targets-and-thresholds)
- [Alerts and Notifications](#alerts-and-notifications)
- [KPI Value History](#kpi-value-history)
- [KPI Dashboards](#kpi-dashboards)
- [Best Practices for KPI Design](#best-practices-for-kpi-design)

---

## Understanding KPIs

### What is a KPI?

A **Key Performance Indicator (KPI)** is a measurable value that demonstrates how effectively you're achieving key business objectives.

**KPI characteristics:**
- **Measurable**: Quantifiable with a number
- **Relevant**: Tied to business goals
- **Timely**: Measured regularly
- **Actionable**: Can be influenced by actions
- **Focused**: Tracks specific aspect of performance

**KPI vs. Metric:**
- **Metric**: Any measurable value (e.g., "Number of emails sent")
- **KPI**: A strategic metric tied to goals (e.g., "Email conversion rate vs. 5% target")

All KPIs are metrics, but not all metrics are KPIs.

**[Screenshot: KPI definition comparison]**

### Why Use KPIs?

**Benefits:**
- ✓ **Focus**: Keep team aligned on what matters most
- ✓ **Accountability**: Clear targets and ownership
- ✓ **Early warning**: Detect issues before they become problems
- ✓ **Motivation**: Visible progress toward goals
- ✓ **Data-driven decisions**: Remove guesswork

**Common business KPIs:**
- **Sales**: Revenue, Win Rate, Average Deal Size, Sales Cycle Length
- **Marketing**: Lead Conversion Rate, Cost per Lead, Marketing ROI
- **Customer Success**: Customer Satisfaction, Retention Rate, Churn Rate
- **Productivity**: Task Completion Rate, Response Time, Activity Volume

**[Screenshot: Example KPI dashboard with various metrics]**

### KPI Components

Every KPI in Logos Vision CRM has these elements:

**1. Current Value**
- The actual measured value
- Updates in real-time or on schedule
- Example: $847,523 (Total Revenue)

**2. Target Value** (optional)
- The goal you're aiming for
- Example: $1,000,000 (Revenue Target)

**3. Trend**
- Direction of change (up, down, flat)
- Comparison to previous period
- Example: ↑ 15% vs. last month

**4. Visualization**
- How the KPI is displayed
- Number, Gauge, Progress Bar, Trend Line
- Color coding (red/yellow/green)

**5. Time Period**
- When the KPI is measured
- Today, This Week, This Month, This Quarter, This Year
- Rolling periods (Last 30 Days, Last 90 Days)

**[Screenshot: Annotated KPI widget showing all components]**

---

## Creating Custom KPIs

### KPI Creation Wizard

**To create a KPI:**
1. Navigate to **Reports** → **KPIs**
2. Click **"Create KPI"**
3. Follow the wizard steps
4. Click **"Create"**

**[Screenshot: KPI creation wizard start]**

### Step 1: KPI Basic Information

**Required fields:**
- **Name**: Short, descriptive name (e.g., "Monthly Revenue")
- **Description**: What this KPI measures and why it matters
- **Category**: Group KPIs by category (Sales, Marketing, etc.)
- **Owner**: Person responsible for this KPI

**Optional fields:**
- **Tags**: Keywords for searching
- **Priority**: Critical, High, Medium, Low
- **Visibility**: Private, Team, Organization

**Best practices:**
- Use clear, concise names
- Include time period in name (e.g., "Monthly Revenue" not just "Revenue")
- Add detailed description for context
- Assign owner for accountability

**[Screenshot: KPI basic information form]**

### Step 2: Choose Calculation Type

Select how the KPI value is calculated.

**Calculation types:**
- **Count**: Number of records
- **Sum**: Total of a numeric field
- **Average**: Mean of a numeric field
- **Percentage**: Ratio expressed as percentage
- **Formula**: Custom calculation
- **Manual**: Entered manually

See [KPI Calculation Types](#kpi-calculation-types) for details on each.

**[Screenshot: Calculation type selection]**

### Step 3: Configure Data Source

Choose where data comes from.

**Data source options:**
- **CRM Data**: Contacts, Opportunities, Tasks, etc.
- **Existing Report**: Use values from report
- **External Data**: Import from external system (API)
- **Manual Entry**: Enter values manually

**For CRM data:**
1. Select object (e.g., Opportunities)
2. Select field to measure (e.g., Amount)
3. Apply filters (e.g., Stage = "Closed Won")
4. Choose aggregation (Sum, Count, Average)

**Example: Total Revenue KPI**
```
Data Source: Opportunities
Field: Amount
Calculation: Sum
Filters:
  - Stage = "Closed Won"
  - Close Date = This Month
Result: Sum of all closed-won opportunity amounts this month
```

**[Screenshot: Data source configuration]**

### Step 4: Set Time Period

Define the time frame for measurement.

**Time period options:**

**Fixed periods:**
- Today
- This Week
- This Month
- This Quarter
- This Year

**Rolling periods:**
- Last 7 Days
- Last 30 Days
- Last 90 Days
- Last 12 Months

**Custom periods:**
- Specific date range
- Fiscal year alignment
- Custom relative periods

**Comparison period:**
- Compare to previous period
- Compare to same period last year
- Compare to custom period

**Example:**
```
KPI: Monthly Revenue
Time Period: This Month (Jan 1-31)
Comparison: Previous Month (Dec 1-31)
Result: Shows January revenue and % change from December
```

**[Screenshot: Time period configuration]**

### Step 5: Set Target and Thresholds

Define success criteria.

**Target value:**
- Goal you're aiming to achieve
- Can be static (always $100K) or dynamic (grows monthly)
- Used to calculate % to target

**Thresholds (color zones):**
- **Red (Poor)**: Below X% of target
- **Yellow (Warning)**: X% to Y% of target
- **Green (Good)**: Above Y% of target

**Example:**
```
Target: $1,000,000 (Monthly Revenue Goal)
Thresholds:
  - Red: < 80% of target ($800K)
  - Yellow: 80-100% of target ($800K-$1M)
  - Green: > 100% of target ($1M+)
```

See [Setting Targets and Thresholds](#setting-targets-and-thresholds) for details.

**[Screenshot: Target and threshold configuration]**

### Step 6: Choose Visualization

Select how to display the KPI.

**Visualization types:**

**Number**
- Large number display
- Simple and clear
- Best for: Single, important value

**Gauge**
- Semi-circle or full-circle dial
- Visual progress toward target
- Best for: Percentage progress, targets

**Progress Bar**
- Linear progress indicator
- Shows completion percentage
- Best for: Goals, quotas

**Trend**
- Number with sparkline chart
- Shows direction and history
- Best for: Tracking changes over time

**Comparison**
- Current vs. previous period
- Side-by-side comparison
- Best for: Growth metrics

**[Screenshot: KPI visualization type examples]**

### Step 7: Configure Alerts

Set up notifications for KPI changes.

**Alert triggers:**
- **Threshold crossed**: KPI moves into red/yellow/green zone
- **Target achieved**: KPI reaches or exceeds target
- **Significant change**: KPI changes by X% or more
- **Anomaly detected**: Unusual spike or drop

**Alert actions:**
- Email notification
- In-app notification
- Slack/Teams message
- SMS (for critical KPIs)

See [Alerts and Notifications](#alerts-and-notifications) for details.

**[Screenshot: Alert configuration]**

### Step 8: Review and Create

Review all settings before creating.

**Review checklist:**
- ✓ Name and description clear
- ✓ Calculation correct
- ✓ Data source and filters appropriate
- ✓ Time period matches intent
- ✓ Target and thresholds reasonable
- ✓ Visualization fits the data
- ✓ Alerts configured for owner

**Test the KPI:**
1. Click **"Preview"** to see current value
2. Verify calculation is correct
3. Check historical data (if available)
4. Adjust if needed

**Create:**
1. Click **"Create KPI"**
2. KPI is created and starts tracking immediately
3. Add to dashboard (optional)

**[Screenshot: KPI review and preview]**

---

## KPI Calculation Types

### Count

Count the number of records that meet criteria.

**Use for:**
- Number of new leads
- Number of open opportunities
- Number of completed tasks
- Number of active customers

**Configuration:**
- Data source: Select object
- Filters: Define criteria
- Result: Count of matching records

**Example: New Leads This Month**
```
Data Source: Leads
Filters:
  - Created Date = This Month
  - Status = "New"
Calculation: Count
Result: 47 (new leads created this month)
```

**[Screenshot: Count KPI configuration]**

### Sum

Total a numeric field across matching records.

**Use for:**
- Total revenue
- Total pipeline value
- Total hours worked
- Total expenses

**Configuration:**
- Data source: Select object
- Field: Select numeric field to sum
- Filters: Define criteria
- Result: Sum of field values

**Example: Monthly Revenue**
```
Data Source: Opportunities
Field: Amount
Filters:
  - Stage = "Closed Won"
  - Close Date = This Month
Calculation: Sum
Result: $847,523 (total revenue this month)
```

**[Screenshot: Sum KPI configuration]**

### Average

Calculate mean value of a numeric field.

**Use for:**
- Average deal size
- Average customer satisfaction score
- Average response time
- Average email open rate

**Configuration:**
- Data source: Select object
- Field: Select numeric field to average
- Filters: Define criteria
- Result: Mean of field values

**Example: Average Deal Size**
```
Data Source: Opportunities
Field: Amount
Filters:
  - Stage = "Closed Won"
  - Close Date = This Quarter
Calculation: Average
Result: $42,376 (average won deal size this quarter)
```

**[Screenshot: Average KPI configuration]**

### Percentage

Calculate ratio of two values as percentage.

**Use for:**
- Win rate
- Conversion rate
- Task completion rate
- Email open rate
- Percentage to quota

**Configuration:**
- Numerator: Count/Sum of matching records
- Denominator: Count/Sum of total records
- Result: (Numerator / Denominator) × 100

**Example: Win Rate**
```
Numerator:
  - Data Source: Opportunities
  - Filter: Stage = "Closed Won"
  - Calculation: Count
  - Result: 23

Denominator:
  - Data Source: Opportunities
  - Filter: Stage = "Closed Won" OR "Closed Lost"
  - Calculation: Count
  - Result: 47

KPI Result: (23 / 47) × 100 = 48.9% win rate
```

**[Screenshot: Percentage KPI configuration]**

### Formula

Create custom calculations using formulas.

**Use for:**
- Complex metrics requiring multiple fields
- Custom business logic
- Derived metrics
- Weighted calculations

**Formula syntax:**
- Basic math: +, -, ×, ÷
- Functions: SUM(), AVG(), COUNT(), MAX(), MIN()
- Fields: {field_name}
- Aggregations: SUM({amount}), AVG({days_to_close})
- Conditionals: IF(), CASE()

**Example: Customer Lifetime Value (CLV)**
```
Formula:
  ({average_deal_size} × {deals_per_year} × {average_customer_lifespan}) - {acquisition_cost}

Where:
  {average_deal_size} = AVG(Opportunities.Amount WHERE Stage = "Closed Won")
  {deals_per_year} = COUNT(Opportunities WHERE Stage = "Closed Won") / years_active
  {average_customer_lifespan} = 3.5 (years, static value)
  {acquisition_cost} = 1500 (static value)

Result: $18,750 (CLV per customer)
```

**[Screenshot: Formula KPI builder]**

### Manual

Enter KPI values manually.

**Use for:**
- External data not in CRM
- Metrics from other systems
- Survey results
- Financial data from accounting system

**Configuration:**
- Set update frequency (daily, weekly, monthly)
- Assign data entry owner
- Optional: Import from CSV/API

**Example: Net Promoter Score (NPS)**
```
KPI: Net Promoter Score
Calculation: Manual
Update Frequency: Monthly
Owner: Customer Success Manager
Process: Manager enters NPS from survey tool on 1st of month
```

**Reminder notifications:**
- System sends reminder to owner when update due
- Shows "Data Stale" warning if not updated on time

**[Screenshot: Manual KPI entry interface]**

---

## Setting Targets and Thresholds

### Creating Targets

**Target types:**

**Static target:**
- Fixed value that doesn't change
- Example: $1,000,000 monthly revenue target

**Growing target:**
- Increases over time
- Example: 5% month-over-month growth
- Formula: Previous month × 1.05

**Seasonal target:**
- Different targets for different periods
- Example: Higher revenue target in Q4
- December target: $1,500,000
- January target: $800,000

**Percentage-based target:**
- Percentage of another value
- Example: 50% win rate target
- 80% task completion rate target

**[Screenshot: Target configuration options]**

### Target Configuration

**To set target:**
1. Edit KPI → **"Target"** tab
2. Choose target type
3. Enter target value(s)
4. Set time period alignment
5. Save

**Example: Quarterly Revenue Target**
```
Target Type: Static
Value: $3,000,000
Time Period: This Quarter
Monthly Breakdown:
  - Month 1: $900,000 (30%)
  - Month 2: $1,000,000 (33%)
  - Month 3: $1,100,000 (37%)
Result: Shows progress to $3M target
```

**[Screenshot: Target value configuration]**

### Threshold Zones

Define color-coded performance zones.

**Standard zones:**
- **Red (Poor)**: Needs immediate attention
- **Yellow (Warning)**: Below target but not critical
- **Green (Good)**: Meeting or exceeding expectations

**To configure thresholds:**
1. Edit KPI → **"Thresholds"** tab
2. Define zone boundaries:
   - Red: < 80% of target
   - Yellow: 80-100% of target
   - Green: > 100% of target
3. Choose colors (can customize)
4. Save

**[Screenshot: Threshold zone configuration with color picker]**

### Threshold Examples

**Example 1: Revenue KPI (Higher is Better)**
```
Target: $1,000,000
Thresholds:
  🔴 Red: < $800,000 (< 80%)
  🟡 Yellow: $800,000 - $999,999 (80-99%)
  🟢 Green: ≥ $1,000,000 (100%+)
```

**Example 2: Response Time KPI (Lower is Better)**
```
Target: < 2 hours
Thresholds:
  🟢 Green: < 2 hours
  🟡 Yellow: 2-4 hours
  🔴 Red: > 4 hours
```

**Example 3: Percentage KPI**
```
Target: 50% Win Rate
Thresholds:
  🔴 Red: < 40%
  🟡 Yellow: 40-49%
  🟢 Green: ≥ 50%
```

**Example 4: Multiple Thresholds**
```
Target: Customer Satisfaction Score = 8.0
Thresholds:
  🔴 Red: < 6.0 (Critical)
  🟠 Orange: 6.0-7.0 (Poor)
  🟡 Yellow: 7.0-8.0 (Fair)
  🟢 Green: 8.0-9.0 (Good)
  🔵 Blue: > 9.0 (Excellent)
```

**[Screenshot: Examples of KPIs in different threshold zones]**

### Dynamic Thresholds

Automatically adjust thresholds based on data.

**Use cases:**
- Seasonal adjustments
- Performance-based targets
- Peer benchmarking

**Example: Percentile-Based Thresholds**
```
KPI: Sales Rep Performance
Dynamic Thresholds:
  🔴 Red: Bottom 25% (below 25th percentile)
  🟡 Yellow: Middle 50% (25th-75th percentile)
  🟢 Green: Top 25% (above 75th percentile)
Result: Thresholds adjust as team performance changes
```

**[Screenshot: Dynamic threshold configuration]**

---

## Alerts and Notifications

Get notified when KPIs cross thresholds or change significantly.

### Alert Configuration

**To create alert:**
1. Edit KPI → **"Alerts"** tab
2. Click **"Add Alert"**
3. Configure trigger and action
4. Save

**[Screenshot: Alert creation interface]**

### Alert Triggers

**Threshold alerts:**
- **Enters red zone**: KPI drops below threshold
- **Enters yellow zone**: KPI in warning range
- **Enters green zone**: KPI meets target
- **Exits green zone**: KPI drops from good performance

**Change alerts:**
- **Increases by X%**: Significant improvement
- **Decreases by X%**: Significant decline
- **Changes by X%** (either direction): Any major change

**Target alerts:**
- **Target achieved**: Reached goal
- **% to target changes**: Progress shifts significantly
- **Will miss target**: Projection shows target won't be met

**Anomaly alerts:**
- **Unusual spike**: Value much higher than normal
- **Unusual drop**: Value much lower than normal
- **Trend reversal**: Direction changes unexpectedly

**Time-based alerts:**
- **Not updated**: Manual KPI not updated on schedule
- **Data stale**: KPI hasn't refreshed as expected

**[Screenshot: Alert trigger options]**

### Alert Actions

**Email notification:**
- Send email to KPI owner
- Send to additional recipients
- Customizable email template
- Include chart/trend in email

**In-app notification:**
- Browser notification
- Red badge on Reports icon
- Notification center entry
- Dismissible or persistent

**Slack/Teams:**
- Post message to channel
- Direct message to user
- Include KPI value and trend
- Link to KPI detail page

**SMS:**
- For critical KPIs only
- Configurable phone numbers
- Character limit considerations

**Webhook:**
- Send to external system
- Trigger workflow automation
- Custom integrations

**[Screenshot: Alert action configuration]**

### Alert Examples

**Example 1: Revenue Drops Below Target**
```
KPI: Monthly Revenue
Trigger: Enters red zone (< 80% of target)
Action:
  - Email to: VP of Sales
  - Slack message to: #sales-leadership
  - Subject: "⚠️ Revenue Below Target"
  - Message: "Monthly revenue is currently ${current_value},
             which is ${percent_to_target} to our target of ${target_value}."
```

**Example 2: Task Completion Celebration**
```
KPI: Team Task Completion Rate
Trigger: Reaches 100% (all tasks complete)
Action:
  - Slack message to: #team-wins
  - Message: "🎉 100% task completion! Great work, team!"
```

**Example 3: Lead Response Time Alert**
```
KPI: Average Lead Response Time
Trigger: Increases by > 50%
Action:
  - Email to: Sales Managers
  - SMS to: Director of Sales
  - Subject: "🚨 Critical: Lead Response Time Spike"
  - Message: "Lead response time has increased from {previous_value}
             to {current_value}. Immediate attention needed."
```

**[Screenshot: Alert examples in action]**

### Alert Management

**Alert settings:**
- **Frequency**: How often to send (instant, daily digest, weekly summary)
- **Quiet hours**: Don't send alerts during certain times (e.g., nights, weekends)
- **Escalation**: Send to manager if not acknowledged in X hours
- **Auto-dismiss**: Automatically dismiss when KPI returns to normal

**Notification preferences:**
1. Go to **User Settings** → **Notifications**
2. Configure global preferences:
   - Enable/disable KPI alerts
   - Preferred channels (email, in-app, Slack)
   - Digest schedule (daily at 8 AM)
   - Quiet hours (10 PM - 7 AM)
3. Save

**Per-KPI overrides:**
- Override global settings for specific KPIs
- Mark KPIs as "Critical" for immediate alerts
- Disable alerts for less important KPIs

**[Screenshot: Notification preferences panel]**

---

## KPI Value History

Track KPI values over time to identify trends and patterns.

### Viewing KPI History

**To view history:**
1. Open any KPI
2. Click **"History"** tab
3. View historical values and changes

**History displays:**
- **Chart**: Line graph of values over time
- **Table**: List of values by date
- **Statistics**: Min, max, average, current
- **Annotations**: Notes about significant events

**[Screenshot: KPI history chart and table]**

### Time Range Selection

**View history for:**
- Last 7 days
- Last 30 days
- Last 90 days
- Last 12 months
- Year to date
- All time
- Custom date range

**Comparison modes:**
- Period over period (this month vs. last month)
- Year over year (this January vs. last January)
- Multiple KPIs on same chart

**[Screenshot: Time range selector and comparison options]**

### Historical Analysis

**Trend analysis:**
- **Moving average**: Smooth out daily fluctuations
- **Trend line**: Linear or polynomial trend
- **Growth rate**: Average % change per period
- **Volatility**: How much values fluctuate

**Pattern detection:**
- **Seasonality**: Recurring patterns by time of year
- **Cycles**: Regular up and down patterns
- **Anomalies**: Unusual spikes or drops
- **Correlations**: When two KPIs move together

**[Screenshot: Trend analysis tools]**

### Annotations

Add context to KPI history.

**To add annotation:**
1. View KPI history chart
2. Click date where event occurred
3. Click **"Add Annotation"**
4. Enter note (e.g., "New product launch", "Marketing campaign started")
5. Save

**Annotation examples:**
```
March 15: "Hired 3 new sales reps"
April 1: "Price increase implemented"
May 10: "Competitor launched competing product"
June 1: "New marketing campaign started"
```

**Annotations appear:**
- As markers on history chart
- In exported reports
- Shared with anyone who views KPI

**Use cases:**
- Explain unusual changes
- Document strategy changes
- Share team context
- Audit trail for performance reviews

**[Screenshot: KPI history with annotations]**

### Forecasting

Project future KPI values based on history.

**Forecast methods:**
- **Linear trend**: Straight-line projection
- **Moving average**: Based on recent average
- **Seasonal**: Accounts for recurring patterns
- **AI-powered**: Machine learning forecast

**To view forecast:**
1. View KPI history
2. Click **"Show Forecast"**
3. System calculates projection
4. Forecast appears as dotted line on chart
5. Confidence interval shown as shaded area

**Forecast displays:**
- Projected value
- Confidence interval (likely range)
- Probability of hitting target
- Recommended actions

**[Screenshot: KPI forecast with confidence interval]**

See [AI Insights](AI_Insights.md) for more on AI-powered forecasting.

---

## KPI Dashboards

Create focused dashboards for monitoring KPIs.

### KPI-Focused Dashboards

**Pre-built KPI dashboards:**
- Sales KPIs
- Marketing KPIs
- Customer Success KPIs
- Activity KPIs
- Executive KPIs
- Team Performance KPIs

**To create KPI dashboard:**
1. Navigate to **Dashboards** → **Create Dashboard**
2. Choose **"KPI Dashboard"** template
3. Select KPIs to include
4. Arrange and customize
5. Save

**[Screenshot: KPI dashboard template]**

### Dashboard Layouts for KPIs

**Number grid:**
- Multiple Number widgets in grid
- Best for: Quick at-a-glance view of many KPIs
- 3×3 or 4×4 grid common

**Gauge array:**
- Multiple Gauge widgets
- Best for: Visualizing progress toward multiple targets
- 2×2 or 2×3 layout common

**Focused KPI:**
- One large primary KPI
- Several smaller supporting KPIs
- Best for: Driving focus on one key metric

**Trend-focused:**
- Each KPI shows trend chart
- Best for: Understanding changes over time
- Vertical stack layout

**[Screenshot: Different KPI dashboard layouts]**

### Real-Time KPI Monitoring

**For mission-critical KPIs:**
1. Create KPI dashboard
2. Enable **"Live Data Mode"**
3. Set refresh to 30 seconds or 1 minute
4. Display on wall-mounted monitor or TV
5. Team sees real-time performance

**Real-time dashboard features:**
- Auto-refresh
- Large, readable numbers
- Color-coded alerts
- No interaction needed
- Full-screen mode

**Use cases:**
- Sales floor dashboard
- Call center performance
- Support team metrics
- Executive monitoring

**[Screenshot: Full-screen KPI dashboard for wall display]**

### KPI Scorecards

Structured view of multiple KPIs with targets.

**Scorecard format:**
| KPI | Current | Target | Status | Trend |
|-----|---------|--------|--------|-------|
| Monthly Revenue | $847K | $1M | 🟡 85% | ↑ 15% |
| Win Rate | 49% | 50% | 🟡 98% | ↓ -2% |
| Pipeline Value | $4.2M | $5M | 🟡 84% | ↑ 8% |
| New Leads | 127 | 150 | 🟡 85% | ↑ 22% |

**To create scorecard:**
1. Dashboards → **"Create from Template"** → **"KPI Scorecard"**
2. Select KPIs to include
3. Choose columns to display
4. Set sort order (by status, by name, by value)
5. Save

**Scorecard features:**
- ✓ Compact view of many KPIs
- ✓ Sortable by any column
- ✓ Export to PDF/Excel
- ✓ Perfect for meetings and reports

**[Screenshot: KPI scorecard view]**

---

## Best Practices for KPI Design

### Choosing the Right KPIs

**SMART KPIs:**
- **Specific**: Clearly defined, unambiguous
- **Measurable**: Can be quantified
- **Achievable**: Realistic targets
- **Relevant**: Tied to business objectives
- **Time-bound**: Measured over specific period

**Limit your KPIs:**
- Focus on 3-7 key metrics per area
- Too many KPIs = no focus
- Better to track few well than many poorly

**Leading vs. Lagging indicators:**
- **Lagging**: Historical results (revenue, closed deals)
- **Leading**: Predictive measures (pipeline value, activities)
- Balance both types

**Example balance:**
```
Lagging: Monthly Revenue (what happened)
Leading: Pipeline Value (what will happen)
Leading: Activity Volume (what we're doing to make it happen)
```

**[Screenshot: Comparison of leading vs. lagging KPIs]**

### Setting Realistic Targets

**Target-setting guidelines:**

**Data-driven:**
- Base targets on historical performance
- Consider growth goals
- Account for seasonality
- Benchmark against industry

**Stretch but achievable:**
- Targets should challenge the team
- But not be so high they're demotivating
- Sweet spot: 80-90% achievement rate

**Incremental improvement:**
- If current performance is 45%, don't set 90% target
- Set 50% target, then 55%, then 60%
- Build momentum with achievable wins

**Team involvement:**
- Include team in target-setting
- Builds buy-in and commitment
- Team knows what's realistic

**[Screenshot: Target-setting best practices diagram]**

### KPI Ownership

**Assign clear ownership:**
- Every KPI should have an owner
- Owner is accountable for performance
- Owner monitors and takes action

**Owner responsibilities:**
- Monitor KPI regularly
- Investigate negative trends
- Take action to improve performance
- Report on KPI in team meetings
- Update manual KPIs on schedule

**Example ownership:**
```
Monthly Revenue → VP of Sales
Lead Conversion Rate → Marketing Manager
Customer Satisfaction → Customer Success Manager
Task Completion Rate → Operations Manager
```

**[Screenshot: KPI ownership assignment]**

### Review Frequency

**Match KPI review to time period:**
- Daily KPIs: Review daily or multiple times per day
- Weekly KPIs: Review weekly
- Monthly KPIs: Review weekly and end-of-month
- Quarterly KPIs: Review monthly

**Regular review meetings:**
- Daily standup: Quick review of daily KPIs
- Weekly team meeting: Deep dive on weekly KPIs
- Monthly business review: Comprehensive KPI review
- Quarterly planning: Strategic KPI review

**Dashboard-based reviews:**
- Pull up KPI dashboard in meetings
- Discuss red and yellow KPIs first
- Celebrate green KPIs
- Identify actions for improvement

**[Screenshot: KPI review meeting agenda template]**

### Taking Action on KPIs

**KPIs are only valuable if they drive action.**

**Red KPI action plan:**
1. Investigate root cause
2. Identify corrective actions
3. Assign owner for each action
4. Set deadline
5. Track action completion
6. Monitor KPI for improvement

**Example action plan:**
```
KPI: Lead Conversion Rate (Red: 12% vs. 20% target)

Root Cause Analysis:
- Lead quality decreased (wrong targeting)
- Sales team not following up quickly enough

Actions:
1. Review and update lead scoring criteria (Marketing Manager, by Friday)
2. Implement auto-assignment for faster follow-up (Ops Manager, by next week)
3. Provide conversion training to sales team (Sales Manager, next month)

Expected Impact: Increase conversion rate to 16% within 30 days
```

**[Screenshot: KPI action plan template]**

### Visual Design Tips

**Number KPIs:**
- Large, readable font (48pt+)
- Clear units ($, %, #)
- Trend indicator prominent
- Color-coded by threshold

**Gauge KPIs:**
- Clear labels for zones
- Readable percentage
- Large enough to see at a glance
- Avoid overly complex gauges

**Trend KPIs:**
- Sparkline should be simple
- Show last 30 days typically
- Make current value most prominent
- Use color to show good/bad trend

**Dashboard layout:**
- Most important KPIs largest and top-left
- Group related KPIs together
- Use white space effectively
- Consistent styling across all widgets

**[Screenshot: KPI design do's and don'ts]**

### Common Mistakes to Avoid

**❌ Too many KPIs**
- Trying to track everything
- Solution: Focus on 5-7 key metrics

**❌ Vanity metrics**
- Metrics that look good but don't drive decisions
- Example: Total email subscribers (without engagement context)
- Solution: Focus on actionable metrics

**❌ No targets**
- KPIs without targets lack context
- Solution: Every KPI should have a clear target

**❌ Static targets**
- Never updating targets as business grows
- Solution: Review and adjust targets quarterly

**❌ No ownership**
- KPIs with no one accountable
- Solution: Assign clear ownership to every KPI

**❌ Set and forget**
- Creating KPIs then never reviewing them
- Solution: Schedule regular KPI review meetings

**❌ No action on alerts**
- Alerts fire but no one responds
- Solution: Clear escalation process for red KPIs

**[Screenshot: Common KPI mistakes illustrated]**

---

## Related Topics

- [Creating Reports](Creating_Reports.md) - Build reports for KPI data sources
- [Dashboards](Dashboards.md) - Create KPI dashboards
- [Scheduled Reports](Scheduled_Reports.md) - Schedule KPI reports
- [AI Insights](AI_Insights.md) - AI-powered KPI forecasting
- [Tips and Best Practices](Tips_and_Best_Practices.md) - General reporting best practices

---

**Last Updated**: January 2026
**Version**: 3.0

---

*Next: Learn about [AI Insights](AI_Insights.md) to leverage AI-powered analytics and forecasting.*
