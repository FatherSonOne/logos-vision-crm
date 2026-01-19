# Reports FAQ

Frequently asked questions about the Logos Vision CRM Reports system. Find quick answers to common questions and troubleshooting help.

## Table of Contents
- [Getting Started](#getting-started)
- [Creating and Editing Reports](#creating-and-editing-reports)
- [Dashboards](#dashboards)
- [Exporting and Sharing](#exporting-and-sharing)
- [Scheduled Reports](#scheduled-reports)
- [Performance and Technical](#performance-and-technical)
- [Data and Calculations](#data-and-calculations)
- [Permissions and Access](#permissions-and-access)
- [Troubleshooting](#troubleshooting)

---

## Getting Started

### How do I create my first report?

1. Navigate to **Reports**
2. Click **"Create Report"**
3. Choose **"Report Builder Wizard"** (easier for beginners)
4. Select data source (e.g., Contacts, Opportunities)
5. Choose visualization type (Table recommended for first report)
6. Select columns to display
7. Apply filters (optional)
8. Save and view your report

See [Getting Started Guide](Reports_Getting_Started.md) for detailed walkthrough.

---

### What's the difference between a report and a dashboard?

**Report:**
- Single visualization or table
- Shows one dataset
- Focused analysis
- Can be added to dashboards

**Dashboard:**
- Multiple widgets/reports combined
- Overview of many metrics
- High-level monitoring
- Contains multiple reports

Think of reports as building blocks, dashboards as the complete picture.

See [Dashboards Guide](Dashboards.md) for more information.

---

### Where can I find pre-built report templates?

1. Click **"Create Report"**
2. Choose **"From Template"**
3. Browse categories:
   - Sales & Pipeline
   - Marketing & Campaigns
   - Customer Success
   - Activity & Productivity
   - Financial

Templates are starting points you can customize to your needs.

---

### How do I learn what each feature does?

**In-app help:**
- Hover over any button or field for tooltip
- Click **"?"** icon for context-sensitive help
- Click **"Help"** in top navigation for documentation

**Documentation:**
- [Getting Started Guide](Reports_Getting_Started.md) - Start here
- [Creating Reports](Creating_Reports.md) - Comprehensive creation guide
- Topic-specific guides for advanced features

---

## Creating and Editing Reports

### Can I edit a report after creating it?

Yes! Reports can always be edited.

**To edit:**
1. Open the report
2. Click **"Edit"** button
3. Make changes
4. Click **"Save"**

**Version history** is kept, so you can revert if needed.

---

### How do I add more columns to my table report?

1. Open report
2. Click **"Edit"**
3. Click **"Add Column"** or drag fields from left panel
4. Reorder by dragging column headers
5. Click **"Save"**

See [Advanced Tables Guide](Advanced_Tables.md) for more table customization.

---

### Can I change the chart type after creating a report?

Yes, you can switch between visualization types.

**To change:**
1. Edit report
2. Click **"Visualization Type"**
3. Select new chart type
4. Re-configure axes if needed (charts have different requirements)
5. Save

**Note:** Some data works better with certain charts. Table → Chart usually works, but complex charts → simpler charts may lose configuration.

---

### How do I filter my report to show only certain records?

**Simple filtering:**
1. Click **"Filter"** button
2. Choose field, operator, value
3. Click **"Apply"**

**Advanced filtering:**
1. Click **"Filter"** → **"Advanced"**
2. Build complex multi-condition filters
3. Use AND/OR logic
4. Save as template for reuse

See [Advanced Filtering Guide](Advanced_Filtering.md) for complex filter scenarios.

---

### Can I sort by multiple columns?

Yes! Tables support multi-column sorting.

**To sort by multiple columns:**
1. Click first column header to sort
2. Hold **Shift** and click second column header
3. Hold **Shift** and click third column header
4. Etc.

Numbers in column headers (①②③) show sort priority.

See [Advanced Tables - Multi-Column Sorting](Advanced_Tables.md#multi-column-sorting) for more details.

---

## Dashboards

### How many widgets can I add to a dashboard?

**Technical limit:** 50 widgets
**Recommended:** 8-10 widgets

**Why limit widgets?**
- Each widget is a separate query
- Too many widgets = slow load time
- Dashboard becomes overwhelming
- Mobile experience suffers

**Best practice:** Create multiple focused dashboards instead of one mega-dashboard.

---

### Can I have different dashboards for different purposes?

Yes! Create as many dashboards as you need.

**Common dashboard types:**
- Personal dashboard (your key metrics)
- Team dashboard (shared team metrics)
- Executive dashboard (high-level company metrics)
- Sales dashboard, Marketing dashboard, Support dashboard, etc.
- Project-specific dashboards

**Organize with folders** and set different dashboards as default for different users/teams.

---

### How do I make a dashboard my default view?

1. Open the dashboard you want as default
2. Click menu (⋮) → **"Set as My Default"**
3. This dashboard now opens when you go to Reports

**To revert to system default:**
- Reports page → **"Reset Default Dashboard"**

See [Dashboards - Setting Default](Dashboards.md#setting-default-dashboards) for more options.

---

### Can dashboards auto-refresh?

Yes! Dashboards can refresh automatically.

**To enable auto-refresh:**
1. Open dashboard
2. Click **"Auto-Refresh"** toggle
3. Choose interval (30 seconds to 1 hour)
4. Dashboard refreshes on that schedule

**Per-widget refresh:**
- Individual widgets can have different refresh rates
- Click widget menu → **"Refresh Settings"**

See [Dashboards - Real-Time Updates](Dashboards.md#real-time-dashboard-updates) for configuration.

---

## Exporting and Sharing

### What formats can I export reports to?

**Available formats:**
- **PDF** - For viewing, printing, sharing
- **Excel** - For analysis and manipulation
- **CSV** - For importing to other systems
- **PNG** - For images of charts

Each format has configuration options (orientation, quality, etc.).

See [Exporting Reports Guide](Exporting_Reports.md) for detailed export options.

---

### How do I email a report to someone?

**Method 1: Export and attach**
1. Open report
2. Click **"Export"** → **"PDF"** (or other format)
3. Download file
4. Attach to email manually

**Method 2: Share link**
1. Click **"Share"** button
2. Choose **"Get Link"**
3. Copy link and paste in email
4. Recipient clicks link to view in CRM (requires login)

**Method 3: Schedule delivery**
1. Click **"Schedule"** button
2. Set frequency (one-time, daily, weekly, etc.)
3. Add recipient email addresses
4. Report automatically emails on schedule

See [Scheduled Reports Guide](Scheduled_Reports.md) for automated delivery.

---

### Can people outside my organization view reports?

**Yes, with public links:**
1. Click **"Share"** → **"Get Link"**
2. Choose **"Public Link"** (no login required)
3. Set optional password and expiration date
4. Share link with anyone

**Security considerations:**
- Only share non-sensitive data publicly
- Use password protection for sensitive reports
- Set expiration dates
- Monitor link usage

**Alternative:** Export to PDF and send as email attachment.

---

### How do I embed a report or dashboard in a website?

1. Click **"Share"** → **"Get Link"** → **"Embed Link"**
2. Configure embed options:
   - Hide toolbar (cleaner appearance)
   - Allowed domains (security whitelist)
   - Auto-refresh
3. Copy iframe code
4. Paste into your website HTML

**Example iframe code:**
```html
<iframe
  src="https://your-crm.com/reports/embed/abc123"
  width="100%"
  height="600"
  frameborder="0">
</iframe>
```

See [Dashboards - Embedding](Dashboards.md#embedding-dashboards) for more options.

---

## Scheduled Reports

### How do I set up a report to email automatically?

1. Open report
2. Click **"Schedule"** button
3. Configure schedule:
   - Frequency (daily, weekly, monthly, etc.)
   - Time of day
   - Recipients
   - Email format (PDF, Excel, CSV)
4. Click **"Activate Schedule"**

Report now sends automatically on schedule.

See [Scheduled Reports Guide](Scheduled_Reports.md) for complete scheduling options.

---

### Can I schedule a report to go to different people on different days?

**Not directly, but you can:**

**Option 1: Multiple schedules**
- Create separate schedule for each recipient/day combination
- Example: Daily to Manager, Weekly to Team, Monthly to Executives

**Option 2: Distribution lists**
- Create recipient lists
- Schedule sends to list
- Update list membership as needed

**Option 3: Conditional schedules**
- Advanced feature
- Send to different people based on data conditions

See [Scheduled Reports - Advanced Scheduling](Scheduled_Reports.md#advanced-scheduling).

---

### My scheduled report didn't send. What happened?

**Check these:**

1. **Schedule History**
   - Reports → Scheduled Reports → Click schedule → History tab
   - Shows if it ran and any errors

2. **Common issues:**
   - Schedule is paused or disabled
   - Email address invalid
   - Report query failed (timeout, permissions)
   - Email bounced (check spam folder)
   - File size too large for email

3. **Error messages**
   - History tab shows specific error
   - Address the error and schedule will retry

See [Scheduled Reports - Troubleshooting](Scheduled_Reports.md#troubleshooting-failed-deliveries).

---

### Can I stop receiving a scheduled report?

**If you're on the recipient list:**
1. Click **"Unsubscribe"** link in any scheduled report email
2. You're removed from that specific schedule

**To view all your subscriptions:**
1. Reports → **"My Subscriptions"**
2. See all scheduled reports you receive
3. Click **"Unsubscribe"** next to any report

**Note:** Some organization-wide reports may require admin to remove you.

---

## Performance and Technical

### My report is slow to load. How can I speed it up?

**Try these optimizations:**

1. **Apply filters** to reduce data
   - Limit to last 90 days instead of all time
   - Filter to specific status, region, etc.

2. **Reduce columns** in tables
   - Only show columns you need
   - Each column adds processing time

3. **Limit related objects**
   - Only include related data you actually use
   - Each relationship adds complexity

4. **Use aggregation** for large datasets
   - Summary reports faster than detail reports
   - Group by month instead of day

5. **Enable caching**
   - Report Settings → Performance → Enable Cache
   - Cached reports load instantly

See [Tips and Best Practices - Performance](Tips_and_Best_Practices.md#performance-optimization).

---

### Can I increase the timeout for complex reports?

**Standard timeout:** 2 minutes
**Maximum timeout:** 10 minutes (admin can configure)

**To request increase:**
- Contact your CRM administrator
- Admin can increase timeout globally or for specific reports
- Note: Very long queries may indicate report needs optimization

**Better approach:**
- Optimize report instead of increasing timeout
- Apply filters, reduce complexity
- Use scheduled reports (no timeout for scheduled generation)

---

### How much data can a report show?

**Limits:**
- **Table view:** Up to 50,000 rows (with pagination)
- **Chart view:** Recommend < 1,000 data points for readability
- **Export:** Up to 100,000 rows (CSV), 65,000 rows (Excel)
- **Dashboard widget:** Recommend < 10,000 rows

**For larger datasets:**
- Use filtering to reduce size
- Create summary/aggregated reports
- Use scheduled exports to generate offline
- Contact admin about increasing limits

---

### Why do my numbers not match between two reports?

**Common causes:**

1. **Different filters**
   - One report filtered to "Active", other to "All"
   - Check filter criteria carefully

2. **Different date ranges**
   - One uses "This Month", other uses "Last 30 Days"
   - These give different results

3. **Different data sources**
   - One counts Opportunities, other counts Contacts
   - Ensure comparing apples to apples

4. **Timing of snapshot**
   - Reports generated at different times
   - Data changed between generations
   - Use same "As Of" date for consistency

5. **Aggregation differences**
   - One uses Sum, other uses Average
   - One uses Distinct Count, other uses Count

**To debug:** Export both reports to Excel and compare row-by-row.

---

## Data and Calculations

### Can I create calculated fields in reports?

Yes! Calculated fields allow custom formulas.

**To create:**
1. Edit report
2. Click **"Add Calculated Field"**
3. Enter formula using available functions
4. Test with sample data
5. Add to report

**Example formulas:**
```
Deal Age (days): TODAY() - [Created Date]
Discount %: ([List Price] - [Sale Price]) / [List Price] * 100
Full Name: CONCAT([First Name], " ", [Last Name])
```

See [Creating Reports - Calculated Fields](Creating_Reports.md#calculated-fields).

---

### What functions are available in formulas?

**Categories:**

**Math:** SUM, AVG, MIN, MAX, ROUND, ABS, CEILING, FLOOR

**Text:** CONCAT, UPPER, LOWER, LEFT, RIGHT, LEN, TRIM, SUBSTITUTE

**Date:** TODAY, NOW, YEAR, MONTH, DAY, DATE DIFF, ADDDAYS, ADDMONTHS

**Logical:** IF, AND, OR, NOT, ISBLANK, ISNULL

**Aggregation:** COUNT, DISTINCT, MEDIAN, PERCENTILE

Full function reference available in formula builder help.

---

### Can I show data from related objects?

Yes! Include related objects when creating report.

**Example: Contact report with Organization data**
1. Select **Contacts** as data source
2. Check **"Include related: Organizations"**
3. Now you can show:
   - Contact fields (First Name, Email, etc.)
   - Organization fields (Company Name, Industry, etc.)

**Aggregations:**
- Count of related records
- Sum/Average of related numeric fields
- Latest/Earliest related date

See [Creating Reports - Cross-Object Reporting](Creating_Reports.md#cross-object-reporting).

---

### How do I calculate percentages in reports?

**Method 1: Percentage aggregation**
- Choose Percentage calculation type
- Define numerator and denominator
- Example: Closed Won / Total Opportunities = Win Rate

**Method 2: Calculated field**
```
Formula: ([Field A] / [Field B]) * 100
Example: ([Closed Won Count] / [Total Opportunities]) * 100
```

**Method 3: Table summary row**
- Enable summary row
- Choose "Percentage of Total" aggregation

**Formatting:** Set field format to "Percentage" to display with % symbol.

---

## Permissions and Access

### Who can see my reports?

**Depends on report access level:**
- **Private:** Only you
- **Team:** You and your team members
- **Organization:** Everyone in the organization

**To check/change access:**
1. Edit report
2. View **"Access Level"** setting
3. Change as needed
4. Save

**Note:** Users also need permission to see the underlying data (e.g., if they can't see Opportunities, they can't see Opportunity reports).

---

### Can I restrict who can edit my report?

Yes, through sharing permissions.

**Permission levels:**
- **View:** Can see report, cannot edit
- **Edit:** Can modify report configuration
- **Admin:** Can edit and manage sharing/permissions

**To set:**
1. Click **"Share"** on report
2. Add users/teams
3. Set permission level for each
4. Save

**Note:** Report creator and organization admins always have full access.

---

### Why can't I see certain fields in my report?

**Possible reasons:**

1. **Field-level security**
   - Admin has restricted access to that field
   - Contact admin to request access

2. **Record-level security**
   - You can't see records, so can't see their fields
   - Check with admin about record access

3. **Field is hidden**
   - Field exists but is hidden in layouts
   - Admin can make field available

4. **Wrong object selected**
   - Field belongs to related object
   - Include related object to access field

---

### Can I give view-only access to a report?

Yes!

**Method 1: Share with View permission**
1. Click **"Share"**
2. Add user
3. Set permission to **"View Only"**
4. User can see but not edit

**Method 2: Public link**
1. Click **"Share"** → **"Get Link"**
2. Public link is automatically view-only
3. Share link (anyone with link can view, no one can edit)

---

## Troubleshooting

### The report shows no data, but I know there should be records.

**Check these:**

1. **Filters too restrictive**
   - Click **"Clear All Filters"**
   - Do records appear now?
   - If yes, adjust filters

2. **Date range**
   - Expand date range to "All Time"
   - Records outside your date filter?

3. **Permissions**
   - You may not have access to see these records
   - Try with different data source or check with admin

4. **Data source**
   - Verify correct object selected
   - Check if records actually exist in database

---

### My export failed. What do I do?

**Common issues:**

**File too large**
- Reduce rows by applying filters
- Export in batches
- Use CSV instead of PDF (smaller file)

**Browser timeout**
- Use scheduled export instead
- Exports run on server (no browser timeout)

**Format-specific error**
- Try different format
- Example: If PDF fails, try Excel

**Check error message** for specific guidance.

See [Exporting Reports - Troubleshooting](Exporting_Reports.md#troubleshooting).

---

### The chart looks wrong or distorted.

**Common fixes:**

**Bars too short/tall**
- Adjust Y-axis scale
- Chart settings → Axis → Scale

**Labels overlap**
- Reduce number of categories
- Rotate labels
- Use horizontal bar chart instead of vertical

**Colors don't match data**
- Check series configuration
- Verify color mappings
- Use consistent color scheme

**Chart empty**
- Check if data exists for date range
- Verify aggregation is correct
- Check for null values

---

### I can't find a report I created.

**Where to look:**

1. **My Reports** section
   - Reports home page → My Reports
   - All your created reports

2. **Search**
   - Use search box
   - Search by report name

3. **Folders**
   - Check if you put it in a folder
   - Browse folders

4. **Shared with Me**
   - Maybe someone else created it
   - Check Shared with Me section

5. **Recycle Bin**
   - If accidentally deleted
   - Admin can restore from recycle bin

---

### How do I get help if my question isn't answered here?

**Support options:**

1. **In-app help**
   - Click **"?"** icon in top-right
   - Context-sensitive help for current page

2. **Documentation**
   - Comprehensive guides for every feature
   - Start with [Getting Started Guide](Reports_Getting_Started.md)

3. **Support ticket**
   - Click **"Help"** → **"Contact Support"**
   - Describe issue and include:
     - Report name or link
     - Steps to reproduce
     - Error message (if any)
     - Screenshots

4. **Community forum**
   - Ask questions, share tips
   - Learn from other users

5. **Training**
   - Live webinars
   - On-demand video tutorials
   - One-on-one training sessions

---

## Related Topics

- [Getting Started](Reports_Getting_Started.md) - Introduction and first report
- [Creating Reports](Creating_Reports.md) - Comprehensive creation guide
- [Advanced Tables](Advanced_Tables.md) - Table features and customization
- [Exporting Reports](Exporting_Reports.md) - Export formats and options
- [Dashboards](Dashboards.md) - Creating and managing dashboards
- [Scheduled Reports](Scheduled_Reports.md) - Automated report delivery
- [KPIs and Metrics](KPIs_and_Metrics.md) - Tracking key metrics
- [AI Insights](AI_Insights.md) - AI-powered analytics
- [Advanced Filtering](Advanced_Filtering.md) - Complex data filtering
- [Tips and Best Practices](Tips_and_Best_Practices.md) - Optimization and design
- [Reports Glossary](Reports_Glossary.md) - Terminology reference

---

**Last Updated**: January 2026
**Version**: 3.0

---

*Can't find your answer? [Contact Support](mailto:support@logosvisioncrm.com) for personalized assistance.*
