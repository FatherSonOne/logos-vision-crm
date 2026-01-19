# Creating Reports

This comprehensive guide covers all the ways to create reports in Logos Vision CRM, from simple wizard-based creation to advanced visual building.

## Table of Contents
- [Overview](#overview)
- [Choosing Your Creation Method](#choosing-your-creation-method)
- [Using the Report Builder Wizard](#using-the-report-builder-wizard)
- [Using the Visual Report Builder](#using-the-visual-report-builder)
- [Selecting Data Sources](#selecting-data-sources)
- [Choosing Visualization Types](#choosing-visualization-types)
- [Configuring Filters](#configuring-filters)
- [Setting Up Columns and Sorting](#setting-up-columns-and-sorting)
- [Saving and Sharing Reports](#saving-and-sharing-reports)
- [Using Report Templates](#using-report-templates)
- [Advanced Techniques](#advanced-techniques)

---

## Overview

Logos Vision CRM provides multiple ways to create reports, each suited to different needs and skill levels:

- **Report Builder Wizard**: Step-by-step guided creation (best for beginners)
- **Visual Report Builder**: Drag-and-drop interface (best for visual learners)
- **Quick Reports**: One-click reports from data views (fastest option)
- **Templates**: Pre-configured reports ready to customize (time-saver)
- **Clone & Modify**: Duplicate existing reports (efficient reuse)

---

## Choosing Your Creation Method

### Decision Guide

**Use the Report Builder Wizard if you:**
- Are new to the Reports system
- Want guided step-by-step creation
- Need to build a straightforward report quickly
- Prefer a structured approach

**Use the Visual Report Builder if you:**
- Learn better with visual, drag-and-drop interfaces
- Want to see your report as you build it
- Need to create complex multi-chart reports
- Prefer more creative control

**Use Quick Reports if you:**
- Need a simple report immediately
- Are already viewing filtered data
- Want to save the current view as a report
- Don't need customization

**Use Templates if you:**
- Want industry-standard reports
- Need to maintain consistency across reports
- Don't want to start from scratch
- Can customize a close-enough starting point

---

## Using the Report Builder Wizard

The Report Builder Wizard guides you through creating a report in six easy steps.

### Step 1: Start the Wizard

1. Click **"Create Report"** button on the Reports home page
2. Select **"Report Builder Wizard"**
3. Click **"Start"**

**[Screenshot: Create Report modal with wizard option highlighted]**

### Step 2: Select Data Source

Choose the primary data you want to report on.

**Available Data Sources:**
- **Contacts**: Individual people
- **Organizations**: Companies and groups
- **Opportunities**: Sales pipeline
- **Tasks**: Activities and to-dos
- **Interactions**: Emails, calls, meetings
- **Custom Objects**: Your custom data types

**For each data source, you'll see:**
- Name and icon
- Description of what data it contains
- Record count (total available records)
- Related data sources that can be joined

**Example:**
```
Contacts (2,547 records)
├─ Organizations (related)
├─ Opportunities (related)
├─ Tasks (related)
└─ Interactions (related)
```

**To select:**
1. Click on the desired data source card
2. (Optional) Check boxes to include related data
3. Click **"Next"**

> **💡 Tip**: Include related data to access fields from connected records. For example, include Organizations to show Company Name on a Contacts report.

**[Screenshot: Data source selection with related data options]**

### Step 3: Choose Visualization Type

Select how you want to display your data.

#### Visualization Types

**Tables & Lists**
- **Table**: Rows and columns with sorting and filtering
- **List**: Card-based view of records
- **Pivot Table**: Cross-tabulated summary data

**Charts**
- **Bar Chart**: Compare categories (vertical bars)
- **Column Chart**: Compare categories (horizontal bars)
- **Line Chart**: Show trends over time
- **Area Chart**: Line chart with filled area
- **Pie Chart**: Show proportions of a whole
- **Donut Chart**: Pie chart with center hole
- **Scatter Plot**: Reveal correlations between two variables
- **Bubble Chart**: Scatter plot with size dimension

**Specialized Visualizations**
- **Heat Map**: Show patterns in matrix data
- **Funnel Chart**: Visualize conversion processes
- **Gauge**: Display progress toward a goal
- **Number**: Show a single key metric
- **Map**: Geographic visualization
- **Calendar**: Time-based event view

**To select:**
1. Click on a visualization type
2. Preview appears on the right
3. Read the description and use cases
4. Click **"Next"**

> **📊 When to Use What**:
> - **Table**: When you need detailed record lists
> - **Bar/Column Chart**: Comparing quantities across categories
> - **Line Chart**: Showing trends over time
> - **Pie Chart**: Showing parts of a whole (max 7-8 slices)
> - **Scatter Plot**: Finding relationships between two metrics
> - **Funnel**: Tracking multi-stage processes

**[Screenshot: Visualization type selection grid with previews]**

### Step 4: Configure Columns/Fields

Select which data fields to include in your report.

**For Table Reports:**

**Available Fields Panel (left)**
- Shows all fields from your data source
- Organized by category
- Search box to find fields quickly
- Field type icons (text, number, date, etc.)

**Selected Fields Panel (right)**
- Fields that will appear in your report
- Drag to reorder
- Click 'X' to remove
- Configure individual field settings

**Field Configuration Options:**
- **Label**: Display name (can be customized)
- **Format**: How to display the value
  - Numbers: Currency, percentage, decimal places
  - Dates: Short, long, relative (e.g., "2 days ago")
  - Text: Uppercase, lowercase, truncate
- **Aggregation** (for summary reports):
  - Count, Sum, Average, Min, Max, Median
- **Conditional Formatting**: Color coding based on values

**To add fields:**
1. Click **"Add Field"** or drag from Available Fields
2. Click on a field to configure it
3. Reorder by dragging fields up/down
4. Click **"Next"** when done

**[Screenshot: Column configuration interface with drag-and-drop]**

**For Chart Reports:**

**Chart-specific configuration:**
- **X-Axis**: What to show on the horizontal axis (usually categories or time)
- **Y-Axis**: What to measure on the vertical axis (usually numbers)
- **Series**: Groups to compare (optional, creates multiple bars/lines)
- **Aggregation**: How to summarize data (Sum, Count, Average, etc.)

**Example: Sales by Month**
- X-Axis: Month (from Close Date)
- Y-Axis: Amount (Sum)
- Series: Stage (to compare different stages)

**[Screenshot: Chart configuration with axis selection]**

### Step 5: Add Filters

Narrow down which records to include.

**Filter Types:**

**Quick Filters**
- Pre-defined common filters
- One-click application
- Examples: "Created Last 30 Days", "My Records", "Active Only"

**Custom Filters**
- Field-based filtering
- Various operators by field type
- Combine multiple conditions

**Filter Operators by Field Type:**

**Text Fields**
- Equals / Not Equals
- Contains / Doesn't Contain
- Starts With / Ends With
- Is Empty / Is Not Empty

**Number Fields**
- Equals / Not Equals
- Greater Than / Less Than
- Greater Than or Equal / Less Than or Equal
- Between / Not Between

**Date Fields**
- Equals / Not Equals
- Before / After
- Between
- Relative: Last/Next X Days/Weeks/Months/Years
- Specific: Today, Yesterday, This Week, Last Month, etc.

**Boolean Fields**
- Is True / Is False
- Is Set / Is Not Set

**To add filters:**
1. Click **"Add Filter"**
2. Select the field to filter on
3. Choose the operator
4. Enter the value(s)
5. (Optional) Add more filters
6. Choose AND/OR logic between filters
7. Click **"Next"**

> **⚠️ Important**: Filters with AND logic require all conditions to be met. Filters with OR logic require at least one condition to be met.

**[Screenshot: Filter configuration with multiple conditions]**

### Step 6: Configure Sorting & Options

Set the default sort order and display options.

**Sorting Configuration:**
- **Primary Sort**: Main sort field and direction (A-Z or Z-A)
- **Secondary Sort**: Tie-breaker when primary values match
- **Tertiary Sort**: Additional sorting level

**Example:**
```
Sort by:
1. Stage (A-Z)
2. Amount (Highest to Lowest)
3. Company Name (A-Z)
```

**Display Options:**

**For Tables:**
- **Rows per page**: 10, 25, 50, 100, or All
- **Show row numbers**: Yes/No
- **Enable search**: Yes/No
- **Enable column sorting**: Yes/No
- **Enable row selection**: Yes/No
- **Freeze first column**: Yes/No
- **Show summary row**: Yes/No (totals/averages)

**For Charts:**
- **Show legend**: Yes/No
- **Legend position**: Top, Bottom, Left, Right
- **Show data labels**: Yes/No
- **Show grid lines**: Yes/No
- **Enable zoom**: Yes/No
- **Enable drill-down**: Yes/No
- **Color scheme**: Select from presets or custom

**To configure:**
1. Set sort fields and directions
2. Adjust display options
3. Click **"Preview"** to see results
4. Click **"Create Report"**

**[Screenshot: Sort and display options panel]**

### Step 7: Save Your Report

Give your report a name and save it.

**Required Information:**
- **Report Name**: Clear, descriptive name
- **Description**: What the report shows and its purpose

**Optional Information:**
- **Folder**: Organize into folders
- **Tags**: Add keywords for easy searching
- **Access Level**: Private, Team, or Organization-wide
- **Default View**: How the report opens (table view, chart view, etc.)

**Best Practices for Naming:**
- Use descriptive names: "Monthly Sales by Region" not "Report 1"
- Include time period if relevant: "Q4 2025 Pipeline"
- Include data scope: "Active Contacts - USA Only"
- Use consistent naming conventions across reports

**To save:**
1. Enter report name and description
2. Select folder (or create new)
3. Add tags (optional)
4. Set access level
5. Click **"Create Report"**
6. Report is created and opened automatically

**[Screenshot: Save report dialog with all options]**

---

## Using the Visual Report Builder

The Visual Report Builder provides a drag-and-drop interface for creating reports with live preview.

### Overview

**Key Features:**
- Real-time preview as you build
- Drag-and-drop configuration
- Side-by-side setup and preview
- Visual feedback for all changes
- No need to navigate through steps

### Starting the Visual Builder

1. Click **"Create Report"** on Reports home page
2. Select **"Visual Report Builder"**
3. The builder opens with three panels:
   - **Left Panel**: Data and configuration
   - **Center Panel**: Live preview
   - **Right Panel**: Properties and settings

**[Screenshot: Visual Report Builder interface overview]**

### Building Your Report Visually

#### 1. Choose Your Canvas

Start with a blank canvas or template:
- **Blank Report**: Start from scratch
- **Template**: Choose from pre-designed layouts
- **Clone**: Start with an existing report

#### 2. Add Data Source

**Drag-and-drop approach:**
1. Find your data source in the left panel
2. Drag it onto the canvas
3. Data source appears in the center preview
4. Configuration options appear in right panel

**[Screenshot: Dragging data source onto canvas]**

#### 3. Add Visualizations

**Add charts and tables:**
1. Click **"Add Visualization"** in the toolbar
2. Choose visualization type from gallery
3. Visualization appears on canvas
4. Drag to reposition, drag corners to resize

**Configure visualization:**
1. Click on the visualization
2. Right panel shows properties
3. Drag fields to X-axis, Y-axis, etc.
4. Changes appear instantly in preview

**[Screenshot: Adding and configuring visualization]**

#### 4. Configure Fields

**For Tables:**
- Drag fields from data source to "Columns" area
- Reorder by dragging within Columns area
- Click field to configure format, label, etc.
- Remove by dragging back to data source

**For Charts:**
- Drag to X-Axis drop zone
- Drag to Y-Axis drop zone
- Drag to Series drop zone (for grouped charts)
- Click axis to configure aggregation

**[Screenshot: Dragging fields to configure chart]**

#### 5. Apply Filters

**Visual filter builder:**
1. Click **"Add Filter"** button
2. Filter panel slides out from right
3. Drag field to filter area
4. Configure filter operator and value
5. Preview updates immediately

**Filter panel features:**
- Visual operator selection (icons instead of dropdown)
- Smart value suggestions based on data
- Preview of filtered record count
- Quick filter templates

**[Screenshot: Visual filter configuration panel]**

#### 6. Style Your Report

**Styling options in right panel:**
- **Colors**: Choose color schemes or custom colors
- **Fonts**: Select font family and sizes
- **Spacing**: Adjust padding and margins
- **Borders**: Add or remove borders
- **Background**: Set background colors or images

**Theme presets:**
- Professional (blues and grays)
- Vibrant (bright colors)
- Minimal (black and white)
- Corporate (brand colors)
- Custom (build your own)

**[Screenshot: Style panel with color scheme selection]**

#### 7. Add Multiple Visualizations

**Create comprehensive reports:**
1. Click **"Add Visualization"** again
2. Add another chart or table
3. Arrange visualizations in grid layout
4. Resize to create visual hierarchy

**Layout grid:**
- Snap-to-grid for alignment
- Drag to reposition
- Resize proportionally or freely
- Auto-arrange option

**[Screenshot: Multi-visualization report layout]**

#### 8. Preview and Test

**Preview modes:**
- **Desktop**: How it looks on large screens
- **Tablet**: How it looks on tablets
- **Mobile**: How it looks on phones
- **Print**: How it prints on paper

**Interactive testing:**
- Click chart elements to drill down
- Sort table columns
- Test filters
- Export to various formats

**[Screenshot: Preview mode selector]**

#### 9. Save Your Visual Report

1. Click **"Save"** in top toolbar
2. Enter name and description
3. Choose folder and access level
4. Click **"Save Report"**

---

## Selecting Data Sources

### Understanding Data Sources

Every report starts with a data source - the "where" of your data.

### Primary Data Sources

**Contacts**
- Individual people in your CRM
- Best for: Contact lists, birthday reports, segmentation
- Key fields: Name, Email, Phone, Company, Tags, Custom Fields

**Organizations**
- Companies and groups
- Best for: Account lists, company analysis, territory reports
- Key fields: Company Name, Industry, Size, Location, Revenue

**Opportunities**
- Sales pipeline and deals
- Best for: Pipeline reports, forecast reports, win/loss analysis
- Key fields: Name, Amount, Stage, Probability, Close Date, Owner

**Tasks**
- Activities and to-dos
- Best for: Activity reports, productivity tracking, overdue tasks
- Key fields: Title, Due Date, Status, Priority, Assignee, Type

**Interactions**
- Emails, calls, meetings
- Best for: Engagement reports, communication tracking, response times
- Key fields: Type, Date, Subject, Duration, Participants

**Custom Objects**
- Your organization's custom data
- Best for: Industry-specific reporting
- Key fields: Varies by custom object

### Related Data Sources

Include related data to access fields from connected records.

**Relationships:**
```
Contacts
├─ Organization (Contact's company)
├─ Opportunities (Deals associated with contact)
├─ Tasks (Tasks assigned to/about contact)
└─ Interactions (Communications with contact)

Organizations
├─ Contacts (People at the company)
├─ Opportunities (Deals with the company)
└─ Tasks (Tasks related to company)

Opportunities
├─ Contact (Primary contact)
├─ Organization (Related company)
├─ Tasks (Opportunity-related tasks)
└─ Owner (Sales rep)
```

**Example: Contact Report with Related Data**

Primary Data Source: **Contacts**

Related Data Sources:
- ✓ Organizations (to show Company Name, Industry)
- ✓ Opportunities (to show Total Deal Value, Open Deals)

Available Fields Expand:
- Contact First Name, Last Name, Email (from Contacts)
- Company Name, Industry (from Organizations)
- Sum of Opportunity Amount (from Opportunities)
- Count of Open Opportunities (from Opportunities)

**[Screenshot: Related data source selection with relationship diagram]**

### Data Source Selection Tips

> **💡 Start with the primary entity**: Choose the data source that represents what you want to list/count/analyze
>
> **🔗 Add related sources for context**: Include related data to enrich your report
>
> **⚡ Performance consideration**: More related sources = more data to load. Only include what you need.
>
> **📊 Aggregation opportunity**: Related data can be aggregated (counted, summed, averaged)

---

## Choosing Visualization Types

### Visualization Decision Tree

Answer these questions to choose the right visualization:

**What are you trying to show?**

**→ Detailed record information** (who, what, where)
- Use: **Table** or **List**

**→ Single important number** (total, average, count)
- Use: **Number** or **Gauge**

**→ Trend over time** (change, growth, decline)
- Use: **Line Chart** or **Area Chart**

**→ Comparison across categories** (which is more/less)
- Use: **Bar Chart** or **Column Chart**

**→ Parts of a whole** (percentage breakdown)
- Use: **Pie Chart** or **Donut Chart**

**→ Relationship between two variables** (correlation)
- Use: **Scatter Plot** or **Bubble Chart**

**→ Geographic distribution** (where)
- Use: **Map**

**→ Multi-stage process** (conversion, progression)
- Use: **Funnel Chart**

**→ Pattern in matrix data** (intensity, frequency)
- Use: **Heat Map**

### Visualization Type Details

#### Table
**Best for**: Detailed data that needs to be searched, sorted, and scanned

**Use when:**
- Users need to see individual records
- Many fields need to be displayed
- Data will be exported to Excel
- Precise values matter more than visual trends

**Features:**
- Multi-column sorting
- Search and filtering
- Column show/hide
- Pagination
- Row selection
- Export capabilities

**Example use cases:**
- Contact directory
- Task list
- Opportunity pipeline detail
- Invoice list

**[Screenshot: Table visualization example]**

#### Bar/Column Chart
**Best for**: Comparing values across categories

**Use when:**
- Comparing 3-12 categories
- Exact values are important
- Categories have long names (use horizontal bars)
- Showing ranking or distribution

**Features:**
- Grouped bars (compare series)
- Stacked bars (show composition)
- Data labels
- Click to drill down
- Color by value

**Example use cases:**
- Sales by region
- Leads by source
- Opportunities by stage
- Tasks by assignee

**[Screenshot: Bar chart example with grouped bars]**

#### Line Chart
**Best for**: Showing trends and changes over time

**Use when:**
- Time is on the X-axis
- Showing continuous data
- Comparing multiple trends
- Highlighting rate of change

**Features:**
- Multiple lines (compare series)
- Area fill option
- Data point markers
- Zoom and pan
- Trend lines

**Example use cases:**
- Revenue over time
- New leads per month
- Pipeline growth
- Email open rates by week

**[Screenshot: Line chart showing multiple trends]**

#### Pie/Donut Chart
**Best for**: Showing parts of a whole (percentages)

**Use when:**
- Showing composition (what makes up the total)
- 3-7 slices (not too many categories)
- Percentages matter more than absolute values
- Simple, at-a-glance understanding needed

**Features:**
- Percentage labels
- Exploded slices
- Donut variant (center space for total)
- Click to filter
- Color coding

**Example use cases:**
- Opportunities by stage (percentage)
- Contacts by industry
- Support tickets by category
- Lead source distribution

**Avoid when:**
- You have more than 8 categories
- Comparing similar-sized segments (hard to distinguish)
- Showing trends over time

**[Screenshot: Pie and donut chart examples]**

#### Scatter Plot
**Best for**: Revealing relationships between two numeric variables

**Use when:**
- Looking for correlations
- Identifying outliers
- Showing distribution
- Analyzing two metrics together

**Features:**
- Color by category
- Size by third variable (bubble chart)
- Trend line
- Quadrant analysis
- Click points for details

**Example use cases:**
- Deal size vs. sales cycle length
- Email engagement vs. deal close rate
- Company size vs. opportunity value
- Response time vs. customer satisfaction

**[Screenshot: Scatter plot with trend line]**

#### Funnel Chart
**Best for**: Visualizing multi-stage processes and conversion rates

**Use when:**
- Showing stage-by-stage progression
- Highlighting drop-off points
- Analyzing conversion funnels
- Tracking sequential processes

**Features:**
- Automatic conversion rate calculation
- Color by conversion rate
- Click to see stage details
- Comparison to historical average

**Example use cases:**
- Sales pipeline stages
- Lead qualification process
- Website conversion funnel
- Recruitment pipeline

**[Screenshot: Funnel chart showing conversion rates]**

#### Gauge
**Best for**: Showing progress toward a single goal

**Use when:**
- Tracking a KPI against a target
- Showing percentage complete
- One number is the focus
- At-a-glance status check needed

**Features:**
- Color zones (red/yellow/green)
- Target indicator
- Min/max range
- Needle or bar style

**Example use cases:**
- Revenue vs. quota
- Tasks completed vs. goal
- Customer satisfaction score
- Project completion percentage

**[Screenshot: Gauge showing progress to goal]**

#### Number
**Best for**: Displaying a single key metric prominently

**Use when:**
- One metric is the focus
- Showing a total, average, or count
- Simple, impactful display needed
- Part of a dashboard with multiple numbers

**Features:**
- Large, readable font
- Comparison to previous period (% change)
- Trend indicator (up/down arrow)
- Sparkline mini-chart
- Color coding by performance

**Example use cases:**
- Total revenue
- New contacts this month
- Open opportunities
- Average deal size
- Tasks overdue

**[Screenshot: Number visualization with trend indicator]**

#### Heat Map
**Best for**: Showing patterns and intensity in matrix data

**Use when:**
- Comparing two categorical dimensions
- Showing intensity/frequency
- Identifying patterns
- Analyzing activity by time periods

**Features:**
- Color gradient (light to dark)
- Hover for exact values
- Customizable color schemes
- Row/column sorting

**Example use cases:**
- Email engagement by day/hour
- Activity by rep and week
- Support tickets by category and priority
- Sales by product and region

**[Screenshot: Heat map example]**

#### Map
**Best for**: Geographic data visualization

**Use when:**
- Location is a key dimension
- Showing regional distribution
- Territory analysis
- Planning travel/coverage

**Features:**
- Multiple map styles
- Markers, regions, or heat zones
- Zoom and pan
- Click for location details
- Route planning

**Example use cases:**
- Customers by location
- Sales territory coverage
- Office/store locations
- Regional performance

**[Screenshot: Map visualization]**

---

## Configuring Filters

Filters control which records appear in your report. See [Advanced Filtering](Advanced_Filtering.md) for complete details.

### Basic Filter Configuration

**Adding a filter:**
1. Click **"Add Filter"** button
2. Select the field to filter
3. Choose an operator
4. Enter the value(s)
5. Click **"Apply"**

**Example:**
```
Field: Close Date
Operator: Between
Values: 2026-01-01 to 2026-03-31
Result: Shows only Q1 2026 opportunities
```

### Common Filter Patterns

**Recent Records**
- Field: Created Date
- Operator: Last X Days
- Value: 30

**My Records**
- Field: Owner
- Operator: Equals
- Value: Current User

**Active Only**
- Field: Status
- Operator: Equals
- Value: Active

**High Value**
- Field: Amount
- Operator: Greater Than
- Value: 10000

**Specific Region**
- Field: State
- Operator: Is In
- Values: CA, NY, TX

---

## Setting Up Columns and Sorting

### Column Configuration

**For each column, you can configure:**

**Display Properties**
- **Label**: Custom column header
- **Width**: Fixed or auto
- **Alignment**: Left, center, or right
- **Wrap**: Allow text wrapping or truncate

**Formatting**
- **Number Formatting**:
  - Currency: $1,234.56
  - Percentage: 45.2%
  - Decimal places: 0, 1, 2, 3
  - Thousand separator: Yes/No

- **Date Formatting**:
  - Short: 1/17/26
  - Medium: Jan 17, 2026
  - Long: January 17, 2026
  - Relative: 2 days ago
  - Custom: MM/DD/YYYY HH:mm

- **Text Formatting**:
  - Uppercase/Lowercase
  - Truncate at X characters
  - Link (clickable URL)

**Conditional Formatting**
- Color code based on value
- Icons based on status
- Progress bars
- Heat map coloring

**Example: Amount Field Configuration**
```
Label: Deal Value
Format: Currency (USD)
Decimal Places: 0
Alignment: Right
Conditional Formatting:
  - If > 100000, background = green
  - If > 50000, background = yellow
  - If < 50000, background = none
```

**[Screenshot: Column configuration panel]**

### Sorting Configuration

**Sort Priority**
1. **Primary Sort**: Main sort order
2. **Secondary Sort**: Applied when primary values are equal
3. **Tertiary Sort**: Applied when secondary values are equal

**Sort Directions**
- **Ascending** (A-Z, 0-9, oldest to newest)
- **Descending** (Z-A, 9-0, newest to oldest)

**Example: Multi-level Sorting**
```
1. Stage (Custom order: Prospect, Qualified, Proposal, Negotiation, Closed Won)
2. Amount (Descending - highest first)
3. Close Date (Ascending - soonest first)
```

**Custom Sort Orders**
- Define custom order for text fields
- Example: Stages, Priorities, Statuses
- Override alphabetical sorting

**[Screenshot: Multi-level sort configuration]**

---

## Saving and Sharing Reports

### Saving Your Report

**Save Dialog Options:**

**Basic Information**
- **Name**: Required, 255 characters max
- **Description**: Recommended, helps others understand the report
- **Folder**: Organize reports into folders
- **Tags**: Keywords for searching

**Access Control**
- **Private**: Only you can see it
- **Team**: Your team can access it
- **Organization**: Everyone can access it
- **Custom**: Select specific users/teams

**Default Settings**
- **Auto-refresh**: How often to reload data
- **Default date range**: Initial date filter
- **Default view**: Table, chart, or mixed

**To save:**
1. Click **"Save"** or **"Save As"**
2. Fill in required fields
3. Set access level
4. Click **"Save Report"**

**[Screenshot: Save report dialog]**

### Sharing Reports

**Share Methods:**

**1. Direct Share**
- Click **"Share"** button on report
- Select users or teams
- Set permission level (View or Edit)
- Add optional message
- Click **"Send"**

**2. Share via Link**
- Click **"Get Link"** button
- Choose link type:
  - **Authenticated**: Requires login
  - **Public**: Anyone with link can view
- Set expiration date (optional)
- Copy and share link

**3. Add to Dashboard**
- Click **"Add to Dashboard"**
- Select existing dashboard or create new
- Position and size the widget
- Click **"Add"**

**4. Schedule Delivery**
- See [Scheduled Reports](Scheduled_Reports.md) for details
- Automated email delivery
- Configurable frequency

**Permission Levels:**
- **View**: Can see report, cannot edit
- **Edit**: Can modify report structure and filters
- **Admin**: Can edit and manage access

**[Screenshot: Share report dialog with permission options]**

### Report Versioning

**Automatic versioning:**
- Every save creates a new version
- Version history accessible via **"Versions"** button
- Can revert to previous versions
- Compare versions side-by-side

**Version information:**
- Date and time of save
- Who saved it
- Description of changes (optional)
- Thumbnail preview

**To revert:**
1. Click **"Versions"** button
2. Browse version history
3. Click **"Preview"** to see old version
4. Click **"Restore"** to revert
5. Confirm restoration

**[Screenshot: Version history panel]**

---

## Using Report Templates

### Template Library

Access pre-built report templates:

1. Click **"Create Report"** → **"From Template"**
2. Browse template categories:
   - Sales & Pipeline
   - Marketing & Campaigns
   - Customer Success
   - Activity & Productivity
   - Financial
   - Custom Objects

**Template Categories:**

**Sales & Pipeline Templates**
- Sales Pipeline by Stage
- Opportunity Forecast
- Win/Loss Analysis
- Sales Rep Performance
- Deal Velocity Report
- Pipeline Growth Trend

**Marketing Templates**
- Lead Source ROI
- Campaign Performance
- Email Engagement
- Website Conversion Funnel
- Content Performance
- Lead Qualification Rates

**Customer Success Templates**
- Customer Health Score
- Support Ticket Analysis
- Customer Satisfaction Trends
- Renewal Forecast
- Churn Risk Report
- Customer Engagement

**Activity Templates**
- Task Completion Rate
- Overdue Tasks by Owner
- Activity Leaderboard
- Meeting Summary
- Email Response Times
- Daily/Weekly Activity

**[Screenshot: Template library with categories]**

### Customizing Templates

**After selecting a template:**

1. **Preview**: See sample data
2. **Customize**: Click **"Customize"**
3. **Modify**: Adjust to your needs
   - Change filters
   - Add/remove columns
   - Adjust visualization
   - Update colors/styling
4. **Save As**: Save as your own report

**Template benefits:**
- ✓ Best practices built-in
- ✓ Professional design
- ✓ Tested and optimized
- ✓ Faster than starting from scratch
- ✓ Learning tool (see how it's built)

---

## Advanced Techniques

### Calculated Fields

Create custom calculations within reports.

**Common calculations:**
- **Deal Age**: Days since opportunity created
- **Response Time**: Time between interaction and reply
- **Win Rate**: Closed Won / Total Closed
- **Average Deal Size**: Total Revenue / Number of Deals

**To create:**
1. Click **"Add Calculated Field"**
2. Enter formula using available functions
3. Test with sample data
4. Add to report

**Formula examples:**
```
Deal Age (days):
= TODAY() - [Created Date]

Deal Size Category:
= IF([Amount] > 100000, "Large",
     IF([Amount] > 50000, "Medium", "Small"))

Discount Percentage:
= ([List Price] - [Sale Price]) / [List Price] * 100

Full Name:
= CONCAT([First Name], " ", [Last Name])
```

**Available functions:**
- Math: SUM, AVG, MIN, MAX, ROUND, ABS
- Text: CONCAT, UPPER, LOWER, LEFT, RIGHT, LEN
- Date: TODAY, YEAR, MONTH, DAY, DATEDIFF
- Logical: IF, AND, OR, NOT
- Aggregation: COUNT, DISTINCT, MEDIAN

**[Screenshot: Calculated field builder]**

### Cross-Object Reporting

Combine data from multiple related objects.

**Example: Contact with Opportunity Metrics**

Primary: Contacts
Related: Opportunities

Available aggregations:
- Count of Opportunities
- Sum of Opportunity Amount
- Average Deal Size
- Largest Deal
- Latest Opportunity Date
- Number of Open Opportunities
- Total Closed Won Amount

**Configuration:**
1. Select primary data source (Contacts)
2. Include related data (Opportunities)
3. Add aggregated fields:
   - Field: Opportunity Amount
   - Aggregation: Sum
   - Label: "Total Deal Value"

**[Screenshot: Cross-object reporting configuration]**

### Dynamic Filters with Parameters

Create interactive reports with user-selectable filters.

**Parameter types:**
- **Date Range**: User selects date range
- **Owner**: User selects which rep to view
- **Region**: User selects geographic area
- **Status**: User selects status values

**To create:**
1. Add filter as usual
2. Click **"Make Dynamic"**
3. Choose parameter type
4. Set default value
5. Users can adjust when viewing report

**Benefits:**
- One report serves multiple purposes
- Users explore data without editing report
- Reduces number of reports needed

**[Screenshot: Dynamic parameter configuration]**

### Report Subscriptions

Subscribe to report changes and updates.

**Subscription options:**
- **Data Changes**: Notified when report data changes significantly
- **Threshold Alerts**: Notified when metrics cross thresholds
- **Schedule**: Receive report on a schedule
- **Anomalies**: Notified of unusual patterns

**To subscribe:**
1. Click **"Subscribe"** on any report
2. Choose notification type
3. Set criteria (thresholds, schedule, etc.)
4. Select delivery method (email, in-app, Slack)
5. Click **"Create Subscription"**

---

## Related Topics

- [Advanced Tables](Advanced_Tables.md) - Master table features
- [Advanced Filtering](Advanced_Filtering.md) - Complex filter creation
- [Exporting Reports](Exporting_Reports.md) - Export options and formats
- [Dashboards](Dashboards.md) - Combine reports into dashboards
- [Tips and Best Practices](Tips_and_Best_Practices.md) - Optimization and design
- [Reports FAQ](Reports_FAQ.md) - Common questions

---

**Last Updated**: January 2026
**Version**: 3.0

---

*Next: Learn about [Advanced Tables](Advanced_Tables.md) to master data table features.*
