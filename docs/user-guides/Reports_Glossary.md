# Reports Glossary

Comprehensive glossary of terms, report types, chart types, and technical concepts used in the Logos Vision CRM Reports system.

## Table of Contents
- [General Terms](#general-terms)
- [Report Types](#report-types)
- [Chart and Visualization Types](#chart-and-visualization-types)
- [Data and Calculation Terms](#data-and-calculation-terms)
- [Filter and Query Terms](#filter-and-query-terms)
- [Technical Terms](#technical-terms)
- [Performance Terms](#performance-terms)

---

## General Terms

### Report
A structured view of data, typically with filters, sorting, and visualization. Can be a table, chart, or combination of both.

### Dashboard
A collection of multiple widgets (reports, KPIs, charts) arranged on a single screen for at-a-glance monitoring of key metrics.

### Widget
An individual component on a dashboard. Can be a report, chart, KPI, text, or custom HTML.

### Data Source
The origin of data for a report. Examples: Contacts, Opportunities, Tasks, Organizations, Custom Objects.

### Visualization
How data is displayed visually. Examples: Table, bar chart, line chart, pie chart, etc.

### KPI (Key Performance Indicator)
A measurable value that demonstrates progress toward a business objective. Tracked over time with targets and thresholds.

### Metric
Any measurable value. All KPIs are metrics, but not all metrics are KPIs (KPIs are strategic, metrics can be any measurement).

### Dimension
A categorical attribute used to segment data. Examples: Region, Industry, Product Type, Owner.

### Measure
A numeric value that can be aggregated. Examples: Revenue, Count, Quantity, Duration.

### Template
Pre-configured report, dashboard, or filter that can be used as a starting point. Can be customized after applying.

---

## Report Types

### Tabular Report
Displays data in rows and columns (table format). Best for detailed record-level information and lists.

### Summary Report
Aggregates data with groupings and subtotals. Shows summarized information rather than individual records.

### Matrix Report
Data displayed in a grid with both row and column groupings. Similar to pivot tables in Excel.

### Chart Report
Primary focus on visual representation (chart) rather than detailed data table. May include data table as secondary element.

### Trend Report
Shows how metrics change over time. Typically uses line charts or area charts.

### Comparison Report
Compares values across categories or time periods. Often uses bar charts or side-by-side comparisons.

### Analytical Report
Complex report combining multiple visualizations, calculations, and dimensions for deep analysis.

### Operational Report
Daily reports used for routine operations. Examples: Daily sales, task lists, activity reports.

### Executive Report
High-level summary reports for leadership. Emphasizes key metrics, trends, and insights.

### Ad-hoc Report
Quick, one-time report created for specific question or analysis. May not be saved permanently.

---

## Chart and Visualization Types

### Table
Data displayed in rows and columns. Supports sorting, filtering, pagination. Best for detailed data and lists.

### Bar Chart
Categories on one axis, values on the other. Bars can be horizontal or vertical (column chart). Best for comparing quantities across categories.

### Column Chart
Vertical bars. Same as bar chart but oriented vertically. Best for time-based comparisons or when category names are short.

### Line Chart
Shows trends over time. Points connected by lines. Best for continuous data and showing rate of change.

### Area Chart
Line chart with area below line filled with color. Can be stacked to show composition. Best for showing volume and trends.

### Pie Chart
Circle divided into slices representing proportions of a whole. Best for showing composition (max 5-7 slices).

### Donut Chart
Pie chart with hollow center. Modern alternative to pie chart. Center can display total or key metric.

### Scatter Plot
Points plotted on X and Y axes showing relationship between two variables. Best for finding correlations and patterns.

### Bubble Chart
Scatter plot where point size represents a third dimension. Shows relationship between three variables.

### Heat Map
Matrix of cells colored by intensity. Best for showing patterns in two-dimensional categorical data.

### Treemap
Nested rectangles sized by value. Best for hierarchical data and showing proportions.

### Funnel Chart
Stages narrowing from top to bottom showing progression and conversion. Best for multi-stage processes like sales pipelines.

### Gauge
Semi-circle or full-circle dial showing progress toward a target. Best for single metrics with goals.

### Bullet Chart
Horizontal bar with target indicator and performance zones. Compact alternative to gauge.

### Number Widget
Single large number, optionally with comparison to previous period. Best for highlighting one key metric.

### Map
Geographic visualization showing data by location. Types: marker map, choropleth (regions), heat map.

### Calendar View
Events or records displayed on calendar grid. Best for time-based events, tasks, deals by close date.

### Histogram
Shows distribution of values in ranges (bins). Example: Distribution of deal sizes.

### Box Plot
Shows statistical distribution including median, quartiles, and outliers. Best for comparing distributions.

### Waterfall Chart
Shows cumulative effect of sequential positive and negative values. Best for showing breakdown of changes.

---

## Data and Calculation Terms

### Aggregation
Combining multiple values into a summary value. Common aggregations: Sum, Average, Count, Min, Max.

### Count
Number of records or values. Example: Count of opportunities = 47.

### Distinct Count
Number of unique values, excluding duplicates. Example: Distinct count of companies = 23 (even if 47 opportunities).

### Sum
Total of all values. Example: Sum of opportunity amounts = $847,523.

### Average (Mean)
Sum divided by count. Example: Average deal size = $42,376.

### Median
Middle value when sorted. Less affected by outliers than average.

### Mode
Most frequently occurring value.

### Minimum (Min)
Smallest value in dataset.

### Maximum (Max)
Largest value in dataset.

### Percentage
Ratio expressed as a number out of 100. Example: Win rate = (Won / Total Closed) × 100 = 49%.

### Percentile
Value below which a certain percentage falls. Example: 90th percentile = top 10%.

### Standard Deviation
Measure of variation or dispersion. High standard deviation = values spread widely.

### Variance
Square of standard deviation. Another measure of spread.

### Calculated Field
Custom field created using a formula. Combines or transforms existing fields.

### Formula
Expression using functions, fields, and operators to calculate values. Example: `TODAY() - [Created Date]` = age in days.

### Group By
Organizing records into groups based on field values. Example: Group opportunities by stage.

### Roll-up
Aggregating data from related child records to parent. Example: Sum of opportunity amounts on account.

### Cross-Object
Combining data from multiple related objects. Example: Contacts with their Account's industry.

---

## Filter and Query Terms

### Filter
Condition that limits which records appear in a report. Example: "Status = Active".

### Criteria
The conditions used in a filter. Example: Amount > 50000 AND Close Date < Today + 90.

### Operator
Symbol or term defining comparison. Examples: Equals, Greater Than, Contains, In List.

### AND Logic
All conditions must be true. Narrows results. Example: Status = Active AND Amount > 50000.

### OR Logic
At least one condition must be true. Broadens results. Example: Source = Web OR Source = Referral.

### NOT Logic
Negates a condition. Example: NOT (Status = Closed) = all except closed.

### Nested Logic
Filters within filters using parentheses to group conditions. Allows complex combinations of AND/OR.

### Quick Filter
Pre-configured one-click filter button. Examples: My Records, Created Today, High Value.

### Filter Template
Saved filter configuration that can be reused across reports.

### Date Range
Filter specifying start and end dates. Can be absolute (Jan 1 - Mar 31) or relative (Last 30 Days).

### Relative Date
Date range that updates automatically. Examples: Today, This Month, Last 90 Days.

### Fixed Date
Specific date that doesn't change. Example: January 1, 2026.

### Parameter
User-selectable value in a filter. Makes reports interactive. Example: User selects date range when viewing report.

---

## Technical Terms

### Query
The underlying request sent to the database to retrieve data. Reports generate queries.

### Index
Database optimization that speeds up searches on specific fields. Indexed fields filter faster.

### Join
Combining data from two related objects. Example: Join Opportunities to Accounts to show company name on opportunity report.

### Cache
Temporary storage of report results for faster subsequent loads. Cached reports load instantly.

### Refresh
Reloading data to get latest values. Clears cache and re-queries database.

### Real-Time
Data updates immediately as it changes. No caching, always fresh data.

### Auto-Refresh
Automatic periodic refresh on a schedule. Example: Dashboard refreshes every 5 minutes.

### Export
Saving report data to external file format. Formats: PDF, Excel, CSV, PNG.

### Import
Loading data into the CRM from external source (opposite of export).

### API (Application Programming Interface)
Way for external systems to access reports programmatically.

### Webhook
Automated message sent to external system when event occurs. Can trigger on report data changes.

### Embed
Including a report or dashboard in external website using iframe.

### URL Parameter
Values passed in URL to configure report. Example: `?date_range=last_30_days`.

### Sandbox
Testing environment separate from live data. Safe place to experiment.

### Version History
Record of changes to a report over time. Allows reverting to previous versions.

### Bulk Export
Exporting multiple reports at once, typically in a ZIP file.

---

## Performance Terms

### Load Time
How long it takes for a report to display after clicking. Aim for <3 seconds.

### Query Timeout
Maximum time allowed for database query before it's cancelled. Default: 2 minutes.

### Render Time
How long it takes to draw/display the visualization after data is retrieved.

### Latency
Delay between action and response. Lower is better.

### Throughput
Amount of data processed per unit of time. Higher is better for large reports.

### Optimization
Improving performance through better design, filtering, or configuration.

### Virtual Scrolling
Technique that renders only visible rows, enabling smooth scrolling of huge tables.

### Pagination
Splitting data into pages (e.g., 25 rows per page). Improves performance for large datasets.

### Lazy Loading
Loading data only when needed (e.g., when scrolling). Improves initial load time.

### Bottleneck
The slowest part of report generation that limits overall performance.

### MAPE (Mean Absolute Percentage Error)
Measure of forecast accuracy. Lower MAPE = more accurate forecast.

### Confidence Interval
Range of values likely to contain the true value. Wider interval = less certainty.

### Forecast
Prediction of future values based on historical patterns.

### Anomaly
Data point significantly different from expected pattern. May indicate issue or opportunity.

### Correlation
Statistical relationship between two variables. Strong correlation = variables move together.

### Trend
General direction of change over time (increasing, decreasing, or flat).

### Seasonality
Recurring patterns at regular intervals. Example: Higher sales in Q4 every year.

### Baseline
Expected normal value or range. Anomalies are deviations from baseline.

---

## AI and Analytics Terms

### AI Insights
Automatically generated observations and recommendations based on data patterns.

### Machine Learning
AI technique where system learns patterns from data without explicit programming.

### Predictive Analytics
Using historical data to predict future outcomes.

### Forecasting
Estimating future values based on past trends and patterns.

### Anomaly Detection
Automatically identifying unusual data points that deviate from normal patterns.

### Correlation Analysis
Identifying relationships between variables to understand what factors influence outcomes.

### Trend Analysis
Examining data over time to identify patterns and trajectories.

### Algorithm
Step-by-step procedure used by AI to analyze data and generate insights.

### Confidence Score
AI's certainty about a prediction or insight. Higher score = more confident.

### Training Data
Historical data used to teach machine learning models.

### Pattern Recognition
AI's ability to identify recurring structures or trends in data.

---

## Scheduling Terms

### Scheduled Report
Report that runs automatically on a schedule and delivers results via email or other method.

### Frequency
How often a scheduled report runs. Examples: Daily, Weekly, Monthly, Quarterly.

### Recurrence
Pattern of repetition for scheduled reports. Example: Every Monday at 9 AM.

### Cron Expression
Technical format for defining complex schedules. Example: `0 8 * * 1-5` = weekdays at 8 AM.

### Burst Delivery
Sending personalized reports to multiple recipients based on data. Each recipient gets their own data.

### Delivery Method
How scheduled report is sent. Examples: Email, Save to folder, Post to Slack, Webhook.

### Subscription
User's opt-in to receive scheduled reports. Users can subscribe/unsubscribe.

### Distribution List
Saved list of recipients for scheduled reports. Update list once, applies to all schedules using it.

### Schedule History
Log of all executions of a scheduled report, including success/failure status.

### Bounce
Failed email delivery. Soft bounce (temporary), hard bounce (permanent failure).

---

## Dashboard Terms

### Layout
Arrangement of widgets on a dashboard. Can be grid-based or free-form.

### Grid
Invisible structure that widgets snap to for alignment. Typically 12 columns.

### Widget
Individual component on dashboard (report, chart, KPI, text, etc.).

### Real-Time Dashboard
Dashboard with live data that updates as changes occur (using WebSocket connection).

### Auto-Arrange
Automatic organization of widgets to optimize layout and minimize white space.

### Pin
Fixing a widget position so it doesn't move during auto-arrange.

### Freeze
Locking widget so it can't be moved or resized.

### Theme
Consistent color scheme and styling applied to dashboard.

### Responsive Design
Dashboard layout that adapts to different screen sizes (desktop, tablet, mobile).

### Full-Screen Mode
Displaying dashboard without navigation and toolbars, maximizing space for data.

---

## Related Topics

- [Getting Started](Reports_Getting_Started.md) - Introduction to Reports
- [Creating Reports](Creating_Reports.md) - Report creation guide
- [Reports FAQ](Reports_FAQ.md) - Frequently asked questions
- All topic-specific guides for detailed information

---

**Last Updated**: January 2026
**Version**: 3.0

---

*For detailed explanations of any term, see the related topic guide or search in the documentation.*
