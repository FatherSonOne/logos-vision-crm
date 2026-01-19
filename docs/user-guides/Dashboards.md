# Dashboards Guide

Create powerful, real-time dashboards that provide at-a-glance insights into your most important metrics and data.

## Table of Contents
- [Overview](#overview)
- [Creating Custom Dashboards](#creating-custom-dashboards)
- [Adding Widgets](#adding-widgets)
- [Arranging and Resizing Widgets](#arranging-and-resizing-widgets)
- [Real-Time Dashboard Updates](#real-time-dashboard-updates)
- [Dashboard Sharing and Permissions](#dashboard-sharing-and-permissions)
- [Setting Default Dashboards](#setting-default-dashboards)
- [Auto-Refresh Settings](#auto-refresh-settings)
- [Dashboard Templates](#dashboard-templates)
- [Advanced Features](#advanced-features)

---

## Overview

Dashboards in Logos Vision CRM combine multiple reports, KPIs, and visualizations into a single, comprehensive view. Think of dashboards as your command center for monitoring business performance.

### What is a Dashboard?

A **dashboard** is a customizable canvas where you arrange multiple widgets (reports, charts, KPIs, metrics) to create a comprehensive view of your data.

**Dashboard benefits:**
- ✓ See multiple metrics at once
- ✓ Real-time data updates
- ✓ Personalized views for different roles
- ✓ Drill down from high-level to details
- ✓ Share insights with teams
- ✓ Monitor KPIs against targets

### Dashboard vs. Report

**Dashboards:**
- Show multiple visualizations
- High-level overview
- Real-time monitoring
- Interactive and dynamic
- Best for monitoring and alerts

**Reports:**
- Show single dataset/visualization
- Detailed analysis
- On-demand or scheduled
- Static snapshot
- Best for deep-dive analysis

**[Screenshot: Example dashboard with multiple widgets]**

---

## Creating Custom Dashboards

### Quick Start: Create Your First Dashboard

**Method 1: From Dashboard Home**

1. Navigate to **Reports** → **Dashboards**
2. Click **"Create Dashboard"** button
3. Choose creation method:
   - **Blank Dashboard**: Start from scratch
   - **From Template**: Use pre-built dashboard
   - **Clone Existing**: Copy another dashboard
4. Enter dashboard name: "My Sales Dashboard"
5. Click **"Create"**

**[Screenshot: Create dashboard dialog]**

**Method 2: From Report**

1. Open any report
2. Click **"Add to Dashboard"** button
3. Choose **"Create New Dashboard"**
4. Enter dashboard name
5. Dashboard created with report as first widget

### Dashboard Builder Interface

When you create or edit a dashboard, you enter the Dashboard Builder:

**Top Toolbar:**
- Dashboard name (click to edit)
- Save button
- Auto-refresh toggle and settings
- Share button
- Export dashboard
- More options (...)

**Left Sidebar:**
- **Widgets**: Available widget types
- **Reports**: Existing reports to add
- **KPIs**: KPI metrics
- **Templates**: Widget templates
- **Custom**: HTML widgets, iframes

**Main Canvas:**
- Grid-based layout
- Drag-and-drop widgets
- Resize widgets
- Live preview

**Right Panel:**
- Widget properties
- Layout settings
- Style options
- Data configuration

**[Screenshot: Dashboard builder interface with panels labeled]**

### Dashboard Layout Options

**Grid System:**
- 12-column responsive grid
- Widgets snap to grid
- Automatic resizing for different screen sizes

**Layout modes:**
- **Free-form**: Place widgets anywhere
- **Auto-arrange**: System arranges widgets optimally
- **Template-based**: Use pre-defined layout templates

**Responsive behavior:**
- **Desktop** (1920px): Full 12-column layout
- **Tablet** (768px): Stacks to 6 columns
- **Mobile** (480px): Single column, widgets stack vertically

---

## Adding Widgets

Widgets are the building blocks of dashboards. Each widget displays specific data or visualization.

### Widget Types

#### Report Widgets

Display existing reports on your dashboard.

**To add report widget:**
1. Click **"Add Widget"** button
2. Select **"Report"**
3. Choose report from list
4. Widget appears on canvas
5. Resize and position as desired

**Report widget options:**
- Show report title: Yes/No
- Show filters: Yes/No
- Show export button: Yes/No
- Refresh interval: Configure separately or inherit dashboard setting

**[Screenshot: Adding report widget]**

#### KPI Widgets

Display key metrics with targets and trends.

**To add KPI widget:**
1. Click **"Add Widget"** → **"KPI"**
2. Choose KPI from list or create new
3. Configure display:
   - Show target line
   - Show trend indicator
   - Show sparkline (mini trend chart)
   - Color coding (red/yellow/green)
4. Widget appears on dashboard

**KPI widget layouts:**
- **Number**: Large number display
- **Gauge**: Semi-circle or full-circle gauge
- **Progress Bar**: Linear progress indicator
- **Trend**: Number with trend line
- **Comparison**: Current vs. previous period

**[Screenshot: Various KPI widget styles]**

#### Chart Widgets

Create standalone charts without building full reports.

**To add chart widget:**
1. Click **"Add Widget"** → **"Chart"**
2. Choose chart type (bar, line, pie, etc.)
3. Select data source
4. Configure X-axis, Y-axis
5. Apply filters
6. Style the chart
7. Widget appears on dashboard

**Quick chart wizard:**
- Simplified report building
- Focused on visualization
- Perfect for simple, focused charts

**[Screenshot: Chart widget configuration]**

#### Number Widgets

Display single important metrics.

**To add number widget:**
1. Click **"Add Widget"** → **"Number"**
2. Choose metric (count, sum, average, etc.)
3. Select data source and field
4. Apply filters
5. Configure formatting (currency, percentage, etc.)
6. Optional: Add comparison to previous period

**Number widget features:**
- Large, readable number
- Trend indicator (up/down arrow)
- Percentage change from previous period
- Color coding based on performance
- Optional sparkline mini-chart

**Example:**
```
Total Revenue
$847,523
↑ 23% vs. last month
[mini trend line chart]
```

**[Screenshot: Number widget examples]**

#### Table Widgets

Show data tables on dashboards.

**To add table widget:**
1. Click **"Add Widget"** → **"Table"**
2. Select data source
3. Choose columns to display
4. Apply filters and sorting
5. Set row limit (typically 5-10 for dashboards)
6. Widget appears on dashboard

**Table widget best practices:**
- Limit to 5-10 rows (dashboards are for high-level views)
- Show only essential columns
- Use for "Top 10" or "Recent Items" lists
- Link to full report for details

**[Screenshot: Compact table widget on dashboard]**

#### Calendar Widgets

Display events, tasks, or deals on a calendar view.

**To add calendar widget:**
1. Click **"Add Widget"** → **"Calendar"**
2. Select data source (Tasks, Interactions, Opportunities)
3. Choose date field
4. Configure view (month, week, day)
5. Color code by category
6. Widget appears on dashboard

**Use cases:**
- Upcoming tasks
- Meeting calendar
- Deal close date calendar
- Activity timeline

**[Screenshot: Calendar widget on dashboard]**

#### Map Widgets

Geographic visualization of data.

**To add map widget:**
1. Click **"Add Widget"** → **"Map"**
2. Select data source
3. Choose location field
4. Configure markers/regions
5. Apply filters
6. Widget appears on dashboard

**Use cases:**
- Customer locations
- Sales territory coverage
- Event locations
- Office/store locations

**[Screenshot: Map widget on dashboard]**

#### Custom HTML Widgets

Add custom HTML, JavaScript, or iframe content.

**To add HTML widget:**
1. Click **"Add Widget"** → **"Custom HTML"**
2. Enter HTML code
3. Preview
4. Widget appears on dashboard

**Use cases:**
- Embed external dashboards
- Custom visualizations
- Third-party integrations
- Custom branding elements

**Example HTML:**
```html
<div style="text-align: center; padding: 20px;">
  <h2>Welcome to Sales Dashboard</h2>
  <p>Updated every 5 minutes</p>
</div>
```

> **⚠️ Security Note**: HTML widgets are restricted by Content Security Policy. JavaScript is sandboxed. Use with caution.

**[Screenshot: Custom HTML widget]**

#### Text/Note Widgets

Add explanatory text, notes, or instructions.

**To add text widget:**
1. Click **"Add Widget"** → **"Text"**
2. Enter text (supports Markdown)
3. Style the text
4. Widget appears on dashboard

**Use cases:**
- Dashboard instructions
- Important announcements
- Context for metrics
- Section headers

**[Screenshot: Text widget with Markdown formatting]**

### Widget Library

Browse pre-configured widgets ready to add to your dashboard.

**To access widget library:**
1. Click **"Widget Library"** in left sidebar
2. Browse categories:
   - Sales widgets
   - Marketing widgets
   - Customer success widgets
   - Activity widgets
   - Financial widgets
3. Click widget to preview
4. Click **"Add to Dashboard"**

**Widget library features:**
- Pre-configured reports and KPIs
- Best practice visualizations
- Industry-specific widgets
- Customizable after adding

**[Screenshot: Widget library browser]**

---

## Arranging and Resizing Widgets

### Positioning Widgets

**Drag-and-drop positioning:**
1. Click widget header and hold
2. Drag to desired position
3. Other widgets shift automatically
4. Release to place

**Grid snapping:**
- Widgets snap to 12-column grid
- Alignment guides appear while dragging
- Other widgets highlight to show where yours will fit

**[Screenshot: Dragging widget with alignment guides]**

### Resizing Widgets

**Manual resize:**
1. Hover over widget corner or edge
2. Cursor changes to resize cursor (⇔ or ⇕)
3. Click and drag to resize
4. Release to set size

**Size constraints:**
- Minimum size per widget type (e.g., charts need minimum height)
- Maximum size: Full dashboard width/height
- Maintains aspect ratio (for charts, optional)

**Quick size buttons:**
- Each widget has size presets in header menu:
  - Small (3 columns × 2 rows)
  - Medium (6 columns × 4 rows)
  - Large (12 columns × 6 rows)
  - Full Width (12 columns)
  - Custom (specify exact size)

**[Screenshot: Resizing widget with size handles]**

### Widget Layering

**Z-index (stacking order):**
- Normally widgets don't overlap
- Custom HTML widgets can overlap
- Right-click widget → **"Bring to Front"** or **"Send to Back"**

### Auto-Arrange

Let the system arrange widgets optimally.

**To auto-arrange:**
1. Click **"Auto-Arrange"** button in toolbar
2. System analyzes widget sizes
3. Arranges to minimize white space
4. Optimizes for readability

**Auto-arrange algorithms:**
- **Compact**: Minimize vertical space
- **Balanced**: Equal distribution
- **Priority**: Largest/most important widgets at top
- **Grid**: Perfect grid alignment

**[Screenshot: Before and after auto-arrange]**

### Layout Templates

Apply pre-designed layouts to your dashboard.

**To apply layout template:**
1. Click **"Layout"** button in toolbar
2. Choose template:
   - **Single Focus**: One large widget, several small
   - **Balanced Grid**: Equal-sized widgets
   - **Two-Column**: Two main widgets side-by-side
   - **Dashboard Classic**: Large chart, KPIs, table
   - **Executive**: Focus on KPIs and key metrics
3. Template applies to current widgets
4. Adjust as needed

**[Screenshot: Layout template gallery]**

### Responsive Preview

Preview how your dashboard looks on different devices.

**Preview modes:**
1. Click **"Preview"** button
2. Choose device:
   - Desktop (1920×1080)
   - Laptop (1366×768)
   - Tablet (768×1024)
   - Mobile (375×667)
3. Dashboard adjusts to show responsive layout

**Responsive design tips:**
- Test on all device sizes before sharing
- Ensure KPIs are readable on mobile
- Limit dashboard to 6-8 widgets for mobile compatibility
- Use responsive widget types (Number, KPI work well on mobile)

**[Screenshot: Responsive preview on multiple devices]**

---

## Real-Time Dashboard Updates

Dashboards can refresh automatically to show the latest data.

### Auto-Refresh Configuration

**Dashboard-level auto-refresh:**
1. Click **"Auto-Refresh"** toggle in toolbar
2. Choose refresh interval:
   - 30 seconds
   - 1 minute
   - 5 minutes (default)
   - 15 minutes
   - 30 minutes
   - 1 hour
   - Custom interval
3. All widgets refresh on this schedule

**Widget-level auto-refresh:**
1. Click widget menu (⋮)
2. Choose **"Refresh Settings"**
3. Options:
   - **Inherit**: Use dashboard setting
   - **Custom**: Set widget-specific interval
   - **Manual only**: Don't auto-refresh this widget
4. Click **"Save"**

**[Screenshot: Auto-refresh settings panel]**

### Refresh Indicators

**Visual refresh indicators:**
- **Spinner**: Widget shows loading spinner while refreshing
- **Timestamp**: "Updated 2 minutes ago" appears below widget
- **Pulse**: Widget border pulses when refreshing
- **Progress bar**: Shows refresh countdown

**Configure indicators:**
1. Dashboard Settings → **"Display"**
2. Choose refresh indicator style
3. Show/hide "last updated" timestamps
4. Click **"Save"**

**[Screenshot: Widget refresh indicators]**

### Manual Refresh

**Refresh entire dashboard:**
- Click **"Refresh All"** button in toolbar
- Keyboard shortcut: **Ctrl+R** (or **Cmd+R** on Mac)
- All widgets reload data simultaneously

**Refresh individual widget:**
- Click widget menu (⋮) → **"Refresh"**
- Only that widget reloads
- Useful when auto-refresh is disabled

### Live Data Mode

For mission-critical dashboards, enable **Live Data Mode**:

**To enable:**
1. Dashboard Settings → **"Performance"**
2. Enable **"Live Data Mode"**
3. Choose technology:
   - **WebSocket**: Real-time push (recommended)
   - **Polling**: Frequent pull requests
4. Click **"Save"**

**Live Data Mode:**
- Updates appear instantly when data changes
- No refresh interval needed
- Uses WebSocket connection
- Best for: Sales boards, support dashboards, real-time monitoring
- Note: Increased server load, use sparingly

**[Screenshot: Live data mode configuration]**

### Refresh Performance

**Optimize dashboard refresh performance:**

✓ **Limit widgets**: 8-10 widgets max per dashboard
✓ **Increase interval**: Refresh every 5 minutes, not 30 seconds (unless needed)
✓ **Filter data**: Apply filters to reduce data loaded
✓ **Simplify queries**: Complex reports take longer to refresh
✓ **Use caching**: Enable widget caching in settings
✓ **Stagger refreshes**: Don't refresh all widgets simultaneously

**Performance settings:**
1. Dashboard Settings → **"Performance"**
2. Configure:
   - Enable caching: Yes
   - Stagger widget refresh: Yes (refreshes widgets in sequence, not all at once)
   - Cache duration: 5 minutes
   - Lazy load: Yes (load widgets as they scroll into view)
3. Click **"Save"**

---

## Dashboard Sharing and Permissions

Share dashboards with team members or across your organization.

### Sharing a Dashboard

**To share dashboard:**
1. Open dashboard
2. Click **"Share"** button
3. Choose sharing method:
   - Share with specific users
   - Share with teams
   - Share with organization
   - Generate shareable link
4. Set permissions
5. Click **"Share"**

**[Screenshot: Dashboard share dialog]**

### Permission Levels

**View Only:**
- Can view dashboard
- Can refresh data
- Can export widgets
- Cannot edit layout or settings

**Edit:**
- All "View Only" permissions
- Can add/remove widgets
- Can resize and arrange
- Can change settings
- Cannot delete dashboard or change sharing

**Admin:**
- All "Edit" permissions
- Can delete dashboard
- Can change sharing and permissions
- Can transfer ownership

**[Screenshot: Permission level selection]**

### Sharing with Teams

**To share with team:**
1. Click **"Share"** → **"Share with Team"**
2. Select team(s)
3. Set permission level
4. (Optional) Add message
5. Click **"Share"**
6. All team members get access

**Team dashboard visibility:**
- Appears in team members' "Shared with Me" folder
- Updates when dashboard is edited
- Can be added to team members' favorites

### Shareable Links

Generate links to share dashboards.

**Link types:**

**Authenticated Link:**
- Requires user to log in
- Respects permission levels
- Secure for internal sharing
- Never expires (unless you revoke)

**Public Link:**
- No login required
- Anyone with link can view
- Read-only access
- Optional expiration date
- Optional password protection

**Embed Link:**
- For embedding in websites, intranets
- iframe-compatible
- Customizable appearance (hide toolbar, etc.)
- Domain whitelist for security

**To generate link:**
1. Click **"Share"** → **"Get Link"**
2. Choose link type
3. Configure options:
   - Expiration date
   - Password protection
   - Allowed domains (for embed)
4. Click **"Generate Link"**
5. Copy and share

**[Screenshot: Shareable link generator]**

### Embedding Dashboards

Embed dashboards in external websites or intranets.

**Embed code:**
```html
<iframe
  src="https://your-crm.com/dashboards/embed/abc123"
  width="100%"
  height="600"
  frameborder="0">
</iframe>
```

**Embed options:**
- **Hide toolbar**: Clean appearance for embedding
- **Hide widget titles**: More compact view
- **Disable interactions**: View-only mode
- **Auto-refresh**: Enable/disable
- **Theme**: Light, dark, or custom

**Security:**
- Whitelist allowed domains
- Require authentication (iframe SSO)
- Disable embedding entirely (dashboard settings)

**[Screenshot: Embed code and options]**

---

## Setting Default Dashboards

Set which dashboard appears when you navigate to the Reports section.

### Personal Default Dashboard

**To set your default:**
1. Open the dashboard you want as default
2. Click menu (⋮) → **"Set as My Default"**
3. Confirmation appears
4. This dashboard now opens when you visit Reports

**Reset to system default:**
1. Navigate to Reports
2. Click **"Reset Default Dashboard"**
3. Returns to standard dashboard

**[Screenshot: Set as default option]**

### Team Default Dashboard

Admins can set a default dashboard for entire team.

**To set team default:**
1. Open dashboard
2. Click menu (⋮) → **"Set as Team Default"**
3. Select team(s)
4. Click **"Save"**
5. Team members see this dashboard by default

**Override option:**
- Team members can still set their own personal default
- Personal default overrides team default

### Organization Default

Set the organization-wide default dashboard (Admins only).

**To set organization default:**
1. Open dashboard
2. Click menu (⋮) → **"Set as Organization Default"**
3. Confirm
4. All users without personal default see this dashboard

**Default priority:**
1. Personal default (highest priority)
2. Team default
3. Organization default
4. System default (built-in)

---

## Auto-Refresh Settings

Detailed control over how and when dashboards refresh.

### Global Auto-Refresh Settings

**Configure organization-wide settings:**
1. Go to **Admin** → **Reports Settings** → **Auto-Refresh**
2. Configure:
   - **Default refresh interval**: 5 minutes
   - **Minimum refresh interval**: 30 seconds (prevent excessive load)
   - **Maximum refresh interval**: 1 hour
   - **Allow users to customize**: Yes/No
   - **Refresh on dashboard load**: Yes/No
   - **Pause refresh when tab inactive**: Yes (saves resources)
3. Click **"Save"**

**[Screenshot: Global auto-refresh settings]**

### Smart Refresh

Intelligent refresh that optimizes performance.

**Smart refresh features:**
- **Pause when inactive**: Stops refreshing when browser tab is inactive
- **Slow refresh on stale data**: If data hasn't changed in X refreshes, reduce frequency
- **Priority refresh**: Refresh visible widgets first, off-screen widgets later
- **Conditional refresh**: Only refresh if filters change or data is old

**To enable:**
1. Dashboard Settings → **"Auto-Refresh"**
2. Enable **"Smart Refresh"**
3. Configure thresholds
4. Click **"Save"**

### Refresh Schedules

Advanced: Set different refresh rates for different times.

**Example schedule:**
```
Business hours (8 AM - 6 PM): Every 5 minutes
After hours (6 PM - 8 AM): Every 30 minutes
Weekends: Every 1 hour
```

**To configure:**
1. Dashboard Settings → **"Auto-Refresh"** → **"Schedule"**
2. Click **"Add Schedule Rule"**
3. Set time range and refresh interval
4. Add more rules as needed
5. Click **"Save"**

**[Screenshot: Refresh schedule configuration]**

### Refresh Notifications

Get notified when data changes significantly.

**To enable:**
1. Dashboard Settings → **"Notifications"**
2. Enable **"Notify on significant changes"**
3. Define "significant":
   - KPI changes by > X%
   - New records appear
   - Thresholds crossed
4. Choose notification method:
   - Browser notification
   - Email
   - In-app alert
5. Click **"Save"**

**[Screenshot: Change notification settings]**

---

## Dashboard Templates

Use pre-built dashboard templates for common scenarios.

### Template Library

**To browse templates:**
1. Navigate to **Dashboards** → **Templates**
2. Browse categories:
   - Sales dashboards
   - Marketing dashboards
   - Customer success dashboards
   - Executive dashboards
   - Financial dashboards
   - Custom industry templates
3. Click template to preview
4. Click **"Use Template"** to create dashboard

**[Screenshot: Dashboard template library]**

### Popular Templates

**Sales Dashboard:**
- Revenue metrics
- Pipeline funnel
- Top deals
- Sales rep leaderboard
- Win/loss rate
- Monthly trend

**Marketing Dashboard:**
- Lead generation metrics
- Campaign performance
- Website traffic
- Conversion rates
- Lead source breakdown
- Email engagement

**Executive Dashboard:**
- Key company metrics
- Revenue trends
- Customer growth
- Employee productivity
- Financial summary
- Strategic KPIs

**Customer Success Dashboard:**
- Customer health scores
- Support ticket metrics
- NPS/satisfaction scores
- Renewal forecast
- Churn risk
- Customer engagement

**Activity Dashboard:**
- Task completion rate
- Meeting calendar
- Email activity
- Call volume
- Overdue tasks
- Team activity leaderboard

**[Screenshot: Examples of each template type]**

### Customizing Templates

**After creating from template:**
1. Dashboard opens in edit mode
2. Modify as needed:
   - Remove unwanted widgets
   - Add new widgets
   - Change colors and branding
   - Adjust layout
   - Update filters
3. Click **"Save"**

**Template customization is permanent** - creates a new dashboard, doesn't modify template.

### Creating Your Own Templates

Save your dashboards as templates for reuse.

**To save as template:**
1. Open dashboard
2. Click menu (⋮) → **"Save as Template"**
3. Enter template name and description
4. Choose category
5. Set thumbnail (screenshot of dashboard)
6. Choose who can use:
   - Only me
   - My team
   - Organization
7. Click **"Save Template"**

**Template best practices:**
- Use generic names (not specific to your data)
- Include clear description of purpose
- Test with different data sets
- Use placeholders for customizable elements
- Document any required setup

**[Screenshot: Save as template dialog]**

---

## Advanced Features

### Dashboard Filters

Apply filters that affect all widgets on the dashboard.

**To add dashboard filter:**
1. Click **"Add Filter"** in dashboard toolbar
2. Choose field (must exist across multiple widget data sources)
3. Configure filter
4. Filter applies to all compatible widgets

**Common dashboard filters:**
- **Date Range**: Filter all widgets to same time period
- **Owner**: Filter to specific sales rep across all widgets
- **Region**: Filter all widgets to specific geographic area
- **Status**: Active/Inactive filter across all data

**Filter persistence:**
- Saved with dashboard
- Can be made user-adjustable
- Shareable (filters pass through links)

**[Screenshot: Dashboard-level filter panel]**

### Drill-Down Navigation

Create click-through navigation between dashboards and reports.

**To configure drill-down:**
1. Edit widget
2. Configure **"On-Click Action"**:
   - Open specific report
   - Open related dashboard
   - Filter current dashboard
   - Run workflow
3. Pass filters (click filters drill-down target)
4. Save

**Example flow:**
```
Dashboard: Executive Overview
  → Click "Revenue" number widget
    → Opens detailed Sales Report
      → Click specific opportunity
        → Opens Opportunity detail page
```

**[Screenshot: Drill-down configuration]**

### Widget Linking

Link widgets so interacting with one affects others.

**To link widgets:**
1. Edit dashboard
2. Select primary widget (the one that will drive filters)
3. Click **"Link Widget"**
4. Select target widget(s) to be filtered
5. Map fields (e.g., clicking bar chart filters table to that category)
6. Save

**Example:**
- Click bar in "Sales by Region" chart
- "Top Deals" table filters to show only that region
- "Rep Performance" chart filters to that region

**[Screenshot: Widget linking configuration]**

### Custom Themes

Apply custom color schemes and branding to dashboards.

**To create theme:**
1. Dashboard Settings → **"Appearance"** → **"Custom Theme"**
2. Configure:
   - Primary color
   - Secondary color
   - Background color
   - Widget border color
   - Font family
   - Widget spacing
   - Border radius (rounded corners)
3. Preview changes
4. Click **"Save Theme"**
5. Theme applies to dashboard

**Save theme for reuse:**
1. After creating theme, click **"Save as Template"**
2. Name theme
3. Use on other dashboards via **"Apply Theme"**

**[Screenshot: Custom theme editor]**

### Dashboard Variables

Create dynamic dashboards with user-selectable parameters.

**To add variable:**
1. Dashboard Settings → **"Variables"**
2. Click **"Add Variable"**
3. Configure:
   - Name: e.g., "Selected Quarter"
   - Type: Date range, picklist, number
   - Default value
   - Show control on dashboard: Yes
4. Click **"Save"**
5. Use variable in widget filters: `{$Selected_Quarter}`

**Example:**
```
Variable: Selected_Rep (User picklist)
Variable: Selected_Quarter (Date range)

Widgets use variables in filters:
- Revenue Chart: Filter by {$Selected_Quarter} and {$Selected_Rep}
- Pipeline Table: Filter by {$Selected_Rep}
- Activity Summary: Filter by {$Selected_Quarter}
```

User selects values via dropdowns at top of dashboard, all widgets update.

**[Screenshot: Dashboard with variable controls]**

### Exporting Dashboards

Export entire dashboard as PDF or PowerPoint.

**To export:**
1. Click **"Export"** button
2. Choose format:
   - **PDF**: All widgets in single document
   - **PowerPoint**: Each widget on separate slide
   - **PNG**: Dashboard screenshot
3. Configure options
4. Click **"Export"**

**Export options:**
- **Page layout**: Portrait, landscape
- **Widget arrangement**: One per page, multiple per page, current layout
- **Include filters**: Show active filter criteria
- **Include metadata**: Date generated, user, etc.

**[Screenshot: Dashboard export options]**

---

## Related Topics

- [Creating Reports](Creating_Reports.md) - Build reports to add to dashboards
- [KPIs and Metrics](KPIs_and_Metrics.md) - Create KPIs for dashboards
- [Real-Time Updates](Real-Time_Updates.md) - Configure live data
- [Scheduled Reports](Scheduled_Reports.md) - Schedule dashboard delivery
- [Tips and Best Practices](Tips_and_Best_Practices.md) - Dashboard design best practices

---

**Last Updated**: January 2026
**Version**: 3.0

---

*Next: Learn about [Scheduled Reports](Scheduled_Reports.md) to automate report and dashboard delivery.*
