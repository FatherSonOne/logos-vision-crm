# Scheduled Reports Guide

Automate report generation and delivery with scheduled reports. Set up recurring reports that run automatically and email results to you and your team.

## Table of Contents
- [Overview](#overview)
- [Setting Up Scheduled Reports](#setting-up-scheduled-reports)
- [Schedule Frequency Options](#schedule-frequency-options)
- [Email Delivery Configuration](#email-delivery-configuration)
- [Customizing Email Templates](#customizing-email-templates)
- [Managing Recipients](#managing-recipients)
- [Viewing Schedule History](#viewing-schedule-history)
- [Troubleshooting Failed Deliveries](#troubleshooting-failed-deliveries)
- [Advanced Scheduling](#advanced-scheduling)

---

## Overview

Scheduled reports automatically generate and deliver reports on a regular basis, saving you time and ensuring stakeholders always have current data.

### Why Use Scheduled Reports?

**Benefits:**
- ✓ **Save time**: No manual report generation
- ✓ **Consistency**: Reports delivered at predictable times
- ✓ **Stay informed**: Receive updates without having to check
- ✓ **Share insights**: Distribute to team automatically
- ✓ **Historical record**: Email archive of report snapshots
- ✓ **Compliance**: Regular reporting for audits

**Common use cases:**
- Daily sales pipeline reports every morning
- Weekly activity summaries on Fridays
- Monthly performance reports on the 1st
- Quarterly executive dashboards
- End-of-day task completion reports
- Real-time alerts for critical metrics

**[Screenshot: Scheduled reports overview page]**

---

## Setting Up Scheduled Reports

### Quick Start: Schedule Your First Report

**From any report:**
1. Open the report you want to schedule
2. Click **"Schedule"** button in toolbar
3. Configure schedule (see sections below)
4. Click **"Create Schedule"**
5. Report now runs automatically

**[Screenshot: Schedule button on report]**

### Schedule Creation Wizard

The Schedule Wizard guides you through setup.

#### Step 1: Choose Report

If starting from Scheduled Reports page:
1. Click **"Create Schedule"**
2. Select report to schedule
3. Preview report
4. Click **"Next"**

If starting from a report, this step is skipped.

**[Screenshot: Report selection for scheduling]**

#### Step 2: Set Frequency

Choose how often the report runs.

**Frequency options:**
- **One-time**: Run once at specified date/time
- **Daily**: Every day or every X days
- **Weekly**: Specific days of week
- **Monthly**: Specific day(s) of month
- **Quarterly**: First or last day of quarter
- **Yearly**: Specific date each year
- **Custom**: Advanced scheduling patterns

**Time of day:**
- Choose specific time (e.g., 8:00 AM)
- Timezone: Select recipient timezone or fixed timezone
- Consider: When do recipients need this data?

**[Screenshot: Frequency selection interface]**

See [Schedule Frequency Options](#schedule-frequency-options) for details.

#### Step 3: Configure Delivery

Choose how to deliver the report.

**Delivery methods:**
- **Email**: Send as attachment
- **Email with link**: Send link to report instead of attachment
- **Save to shared folder**: Save to network location
- **Upload to cloud storage**: Save to Dropbox, Google Drive, etc.
- **Post to Slack/Teams**: Send to team channel
- **Webhook**: Send to external system

**Most common: Email delivery**
- Choose format (PDF, Excel, CSV)
- Add recipients
- Customize email message

**[Screenshot: Delivery method selection]**

#### Step 4: Set Email Options

Configure email delivery details.

**Email settings:**
- **Recipients**: Add email addresses
- **Subject**: Email subject line (can include variables)
- **Message**: Email body text
- **From name**: How sender appears
- **Reply-to**: Where replies go
- **Format**: PDF, Excel, CSV, or multiple
- **Attachment options**: Compress, password protect

**[Screenshot: Email configuration panel]**

See [Email Delivery Configuration](#email-delivery-configuration) for details.

#### Step 5: Review and Activate

Review your schedule before activating.

**Review screen shows:**
- Report name and description
- Schedule frequency and time
- Recipients list
- Delivery format
- Email preview

**Options:**
- **Test**: Send test email immediately
- **Save as Draft**: Save without activating
- **Activate**: Start schedule immediately

**To activate:**
1. Review all settings
2. (Optional) Click **"Send Test"** to verify
3. Click **"Activate Schedule"**
4. Schedule is now active

**[Screenshot: Schedule review and activation]**

---

## Schedule Frequency Options

### Daily Schedules

Run report every day or every X days.

**Options:**
- **Every day**: Runs daily at specified time
- **Every weekday**: Monday-Friday only
- **Every X days**: Every 2 days, 3 days, etc.

**Time settings:**
- Specific time: 8:00 AM, 5:00 PM, etc.
- Multiple times: 9:00 AM and 5:00 PM
- Timezone: Select timezone for time

**Example use cases:**
- Morning pipeline report at 8:00 AM every weekday
- End-of-day task summary at 6:00 PM daily
- Every 3 days: Follow-up report

**[Screenshot: Daily schedule configuration]**

### Weekly Schedules

Run report on specific days of the week.

**Options:**
- Select days: Monday, Tuesday, Wednesday, etc.
- Multiple days: Monday and Friday
- Every X weeks: Every 2 weeks, 3 weeks, etc.

**Time settings:**
- Same time for all days
- Different time per day (advanced)

**Example use cases:**
- Monday morning pipeline review (8:00 AM Mondays)
- Friday weekly summary (5:00 PM Fridays)
- Tuesday and Thursday activity reports
- Bi-weekly team report (every other Monday)

**[Screenshot: Weekly schedule with day selection]**

### Monthly Schedules

Run report on specific day(s) of the month.

**Options:**
- **Specific day**: Day 1, 15, 31, etc.
- **Relative day**: First Monday, Last Friday, etc.
- **Multiple days**: 1st and 15th of month
- **Every X months**: Every 2 months, 3 months, etc.

**Day selection:**
- Specific: 1st, 5th, 15th, 31st (adjusts for short months)
- Relative: First/Last/Second/Third Monday/Tuesday/etc.

**Time settings:**
- Specific time on scheduled day

**Example use cases:**
- 1st of month: Monthly revenue report
- Last day of month: End-of-month summary
- 1st and 15th: Bi-monthly reports
- First Monday: Monthly team meeting report

**[Screenshot: Monthly schedule with day options]**

### Quarterly Schedules

Run report at beginning or end of quarters.

**Options:**
- **First day of quarter**: January 1, April 1, July 1, October 1
- **Last day of quarter**: March 31, June 30, September 30, December 31
- **Specific day of first month**: e.g., 15th of Jan, Apr, Jul, Oct
- **Relative**: First Monday of quarter, Last Friday of quarter

**Fiscal year alignment:**
- Calendar year: Q1 = Jan-Mar
- Custom fiscal year: Define your Q1 start

**Example use cases:**
- Quarterly executive dashboard (1st day of quarter)
- Quarterly sales review (last day of quarter)
- Mid-quarter check-in (15th of 2nd month of quarter)

**[Screenshot: Quarterly schedule configuration]**

### Yearly Schedules

Run report once per year on specific date.

**Options:**
- **Specific date**: January 15, December 31, etc.
- **Relative date**: First Monday of January, Last day of fiscal year

**Example use cases:**
- Annual performance report (January 1)
- Year-end summary (December 31)
- Anniversary report (company founding date)

**[Screenshot: Yearly schedule selection]**

### Custom Schedules

Create complex scheduling patterns.

**Advanced patterns:**
- **Cron expression**: For maximum flexibility
- **Business days only**: Skip weekends and holidays
- **Date ranges**: Run only during specific date range
- **Conditional**: Run only if certain conditions met

**Example custom schedules:**
```
First and third Monday of every month at 9 AM
Last business day of each quarter at 5 PM
Every weekday at 8 AM and 6 PM, except holidays
15th of Jan, Apr, Jul, Oct (quarterly, mid-month)
```

**To create custom schedule:**
1. Choose **"Custom"** frequency
2. Enter cron expression or use visual builder
3. Preview next 10 run dates
4. Save

**Cron expression examples:**
```
0 8 * * 1-5     = 8 AM Monday-Friday
0 9 1,15 * *    = 9 AM on 1st and 15th
0 17 L * *      = 5 PM last day of month
0 8 * * 1#1     = 8 AM first Monday of month
```

**[Screenshot: Custom schedule with cron expression builder]**

### Holiday Handling

Configure how schedules handle holidays.

**Options:**
- **Run on holidays**: No change to schedule
- **Skip holidays**: Don't run on holidays
- **Move to next business day**: Run day after holiday
- **Move to previous business day**: Run day before holiday

**Holiday calendar:**
- Default: US Federal holidays
- Custom: Define your organization's holidays
- Multiple calendars: Different schedules use different holiday lists

**To configure:**
1. Schedule settings → **"Holidays"**
2. Choose holiday handling
3. Select holiday calendar
4. Save

**[Screenshot: Holiday handling configuration]**

---

## Email Delivery Configuration

### Basic Email Settings

**To configure email delivery:**
1. In Schedule Wizard, choose **"Email"** delivery
2. Configure basic settings:
   - **To**: Recipient email addresses
   - **Subject**: Email subject
   - **Message**: Email body
   - **Format**: PDF, Excel, CSV, or multiple
3. Click **"Next"**

**[Screenshot: Basic email delivery settings]**

### Email Recipients

**Adding recipients:**
- **Individual emails**: Type email address
- **CRM users**: Select from user list
- **Teams**: Select team (emails all members)
- **Distribution lists**: Select saved distribution list
- **Dynamic**: Based on report data (e.g., owner of records)

**Recipient types:**
- **To**: Primary recipients
- **CC**: Carbon copy recipients
- **BCC**: Blind carbon copy (hidden from other recipients)

**Example:**
```
To: sales-team@company.com
CC: manager@company.com
BCC: ceo@company.com
```

**[Screenshot: Recipient selection interface]**

### Email Subject

**Subject line customization:**
- Static text: "Daily Sales Report"
- Variables: "Sales Report - {date}"
- Dynamic data: "Pipeline Report - ${total_revenue}"

**Available variables:**
```
{date}               = 2026-01-17
{time}               = 2:30 PM
{report_name}        = Sales Pipeline
{user}               = Your Name
{frequency}          = Daily
${metric_name}       = Values from report (e.g., total revenue)
```

**Example subjects:**
```
Daily Sales Report - {date}
Weekly Pipeline ({date}) - $${total_value}
Monthly Summary for {month} {year}
{report_name} - Generated {time}
```

**[Screenshot: Email subject with variables]**

### Email Body

**Message customization:**
- **Plain text**: Simple text message
- **Rich text**: Formatted with bold, italics, links
- **HTML**: Full HTML email templates

**Plain text example:**
```
Hello,

Attached is your Daily Sales Report for {date}.

Key highlights:
- Total Revenue: ${total_revenue}
- Open Opportunities: {open_count}
- Close Rate: {close_rate}%

Best regards,
Logos Vision CRM
```

**Rich text features:**
- Bold, italic, underline
- Bullet and numbered lists
- Hyperlinks
- Text colors
- Headings

**Variables in message:**
- Same variables as subject
- Report metrics: Embed values from report
- Conditional text: Show different text based on conditions

**[Screenshot: Email body editor with formatting toolbar]**

### Attachment Options

**Format selection:**
- **PDF**: Best for viewing, printing
- **Excel**: Best for analysis, manipulation
- **CSV**: Best for data import
- **Multiple formats**: Attach PDF and Excel

**Attachment settings:**
- **Filename**: Customize attachment name
  - Example: `Sales_Report_{date}.pdf`
- **Compression**: ZIP multiple files or large attachments
- **Password protection**: Require password to open
  - Static password
  - Dynamic password (emailed separately or based on pattern)

**File size management:**
- **Compress large files**: Auto-compress if > X MB
- **Split large reports**: Create multiple files if > Y MB
- **Link instead of attach**: If file > Z MB, send link to download

**[Screenshot: Attachment format and options]**

See [Customizing Email Templates](#customizing-email-templates) for advanced email design.

---

## Customizing Email Templates

Create professional, branded email templates for scheduled reports.

### Template Editor

**To create email template:**
1. Go to **Reports** → **Settings** → **Email Templates**
2. Click **"Create Template"**
3. Enter template name
4. Design template using editor
5. Save

**[Screenshot: Email template editor]**

### Template Components

**Header section:**
- Company logo
- Header banner image
- Branding colors
- Report title

**Body section:**
- Introduction text
- Report summary
- Key metrics (dynamically inserted)
- Call-to-action buttons
- Footer text

**Footer section:**
- Company information
- Social media links
- Unsubscribe link (required for compliance)
- Legal disclaimer

**[Screenshot: Email template components]**

### Using Variables in Templates

**Dynamic content:**
```html
<h1>{report_name}</h1>
<p>Generated on {date} at {time}</p>

<h2>Key Metrics</h2>
<ul>
  <li>Total Revenue: $${total_revenue}</li>
  <li>New Leads: {new_leads_count}</li>
  <li>Conversion Rate: {conversion_rate}%</li>
</ul>

<p>This report contains {record_count} records.</p>
```

**Conditional content:**
```html
{{#if total_revenue > 100000}}
  <p style="color: green;">Congratulations! Revenue exceeded $100K!</p>
{{else}}
  <p>Revenue this period: $${total_revenue}</p>
{{/if}}
```

**Loops (for multi-record highlights):**
```html
<h2>Top 5 Deals</h2>
{{#each top_deals}}
  <li>{{name}} - ${{amount}}</li>
{{/each}}
```

**[Screenshot: Template with variables highlighted]**

### Built-in Templates

**Pre-designed templates:**
- **Professional**: Corporate styling, logo, clean layout
- **Minimal**: Simple, text-focused
- **Executive**: High-level summary, key metrics prominent
- **Data-Rich**: Detailed metrics, charts embedded
- **Marketing**: Colorful, engaging, brand-forward

**To use built-in template:**
1. When creating schedule, choose **"Use Email Template"**
2. Select template
3. Template applies to email
4. Customize as needed

**[Screenshot: Email template gallery]**

### Embedding Charts in Emails

**Include chart images in email body:**

**To embed chart:**
1. In email template editor, click **"Insert Chart"**
2. Select which chart(s) from report
3. Configure size and placement
4. Chart renders as image in email

**Chart embedding options:**
- **Inline**: Chart appears in email body
- **Attachment**: Chart attached as separate image
- **Link**: Clickable chart links to full report

**Example:**
```html
<h2>Revenue Trend</h2>
<img src="{{chart:revenue_trend}}" alt="Revenue Trend Chart" width="600" />
```

**Best practices:**
- Keep chart images under 200 KB
- Use PNG format (better for email)
- Test in multiple email clients
- Provide alt text for accessibility

**[Screenshot: Email with embedded chart]**

### Email Styling

**Customize email appearance:**

**Colors:**
- Header background
- Button colors
- Link colors
- Text colors
- Border colors

**Typography:**
- Font family (web-safe fonts recommended)
- Font sizes (headings, body, captions)
- Line height
- Text alignment

**Layout:**
- Single column (recommended for mobile)
- Two columns
- Sidebar layout
- Width (600px recommended for email)

**Branding:**
- Upload company logo
- Set brand colors
- Add social media icons
- Include company address/contact

**[Screenshot: Email styling options panel]**

### Preview and Test

**Before saving template:**
1. Click **"Preview"**
2. View in different email clients:
   - Gmail
   - Outlook
   - Apple Mail
   - Mobile (iOS, Android)
3. Check all variables populate correctly
4. Verify links work
5. Test responsive design

**Send test email:**
1. Click **"Send Test"**
2. Enter your email address
3. Receive test email
4. Review in actual email client
5. Make adjustments as needed

**[Screenshot: Email preview in multiple clients]**

---

## Managing Recipients

### Recipient Lists

**Create reusable recipient lists:**
1. Go to **Reports** → **Settings** → **Recipient Lists**
2. Click **"Create List"**
3. Enter list name (e.g., "Sales Team", "Executive Team")
4. Add recipients:
   - Manual email addresses
   - CRM users
   - Teams
   - Dynamic queries (e.g., all users with role "Sales Manager")
5. Save list

**Using recipient lists in schedules:**
1. When configuring schedule email delivery
2. Click **"Add Recipients"** → **"Select List"**
3. Choose recipient list
4. All list members receive report

**Benefits:**
- Update list in one place, applies to all schedules
- Easier management of large distribution groups
- Audit who receives what

**[Screenshot: Recipient list editor]**

### Dynamic Recipients

**Automatically determine recipients based on report data:**

**Example: Send each sales rep their own pipeline report**
1. Create report filtered to `Owner = Current Recipient`
2. Schedule with **"Dynamic Recipients"**
3. Choose **"One email per record owner"**
4. Each owner receives personalized report with only their data

**Dynamic recipient options:**
- **Per owner**: One email per unique owner
- **Per team**: One email per team
- **Per region**: One email per region
- **Custom field**: One email per unique value in any field

**Personalization:**
- Each recipient sees only their data
- Email subject can include their name
- Greeting can be personalized

**[Screenshot: Dynamic recipients configuration]**

### Subscription Management

**Allow users to subscribe/unsubscribe:**

**Self-service subscription:**
1. Users visit **Reports** → **Subscriptions**
2. Browse available scheduled reports
3. Click **"Subscribe"** to receive
4. Click **"Unsubscribe"** to stop receiving

**Admin-controlled subscriptions:**
- Admins manage who receives what
- Users cannot unsubscribe from required reports
- Users can still opt-in to optional reports

**Unsubscribe link in emails:**
- All scheduled report emails include unsubscribe link (required by law)
- Clicking unsubscribe removes user from that specific schedule
- User preferences saved

**[Screenshot: User subscriptions management page]**

### Bounce Handling

**Automatic handling of failed deliveries:**

**Soft bounces (temporary failures):**
- Recipient inbox full
- Server temporarily unavailable
- System retries 3 times over 24 hours

**Hard bounces (permanent failures):**
- Email address doesn't exist
- Domain doesn't exist
- Recipient permanently blocked sender
- Recipient automatically removed from schedule after 3 hard bounces

**Bounce notifications:**
- Schedule owner notified of hard bounces
- Weekly summary of bounce statistics
- Recipient list automatically cleaned

**[Screenshot: Bounce handling report]**

---

## Viewing Schedule History

Track execution history of all scheduled reports.

### Schedule History Page

**To view history:**
1. Navigate to **Reports** → **Scheduled Reports**
2. Click on a schedule
3. Click **"History"** tab
4. View execution log

**History shows:**
- **Date/Time**: When report ran
- **Status**: Success, Failed, Skipped
- **Recipients**: Who received it
- **File Size**: Size of generated report
- **Delivery Method**: Email, saved file, etc.
- **Duration**: How long generation took

**[Screenshot: Schedule execution history]**

### Execution Details

**Click any history entry for details:**
- Exact time started and completed
- Number of records in report
- Filters applied
- Recipients (and delivery status per recipient)
- Generated files (download available)
- Any errors or warnings
- Server that executed the schedule

**Actions from history:**
- **Re-send**: Send the report again to same or different recipients
- **Download**: Download the generated report file
- **View**: View the report as HTML (if available)
- **Debug**: View detailed logs (admins only)

**[Screenshot: Execution detail view]**

### Failed Executions

**When a schedule fails:**
- Status shows as "Failed"
- Error message explains why
- Schedule owner receives email notification
- Automatic retry (depending on error type)

**Common failure reasons:**
- Report query timeout (too much data)
- Email delivery failed (invalid address)
- Insufficient permissions (report data access changed)
- System maintenance window
- File size too large for email

**Resolving failures:**
1. Review error message in history
2. Fix underlying issue (e.g., add filters to reduce data)
3. Test report manually
4. Failed schedule automatically retries on next scheduled run

**[Screenshot: Failed execution with error details]**

### Download Past Reports

**Access previously generated reports:**
1. View schedule history
2. Click **"Download"** for any successful execution
3. File downloads in original format (PDF, Excel, etc.)

**Retention policy:**
- Generated files kept for 90 days (configurable)
- After retention period, history remains but file is deleted
- Storage quota per organization

**Use cases:**
- Retrieve report from last week
- Compare reports over time
- Share old report with new stakeholder
- Compliance and audit trails

**[Screenshot: Download links in history]**

---

## Troubleshooting Failed Deliveries

Common issues and solutions for schedule delivery problems.

### Email Not Received

**Check these first:**
1. ✓ Check spam/junk folder
2. ✓ Verify email address is correct
3. ✓ Check schedule history - did it actually send?
4. ✓ Check email quota (inbox not full?)

**Possible causes:**

**Schedule didn't run:**
- View history - no entry for expected time
- Check schedule is active (not paused)
- Check schedule time and timezone
- Server maintenance window during scheduled time

**Email blocked by recipient server:**
- Recipient's email server blocked sender
- Solution: Whitelist sender email address
- Solution: Use authenticated email (SPF, DKIM)

**Email filtered to spam:**
- Email client marked as spam
- Solution: Add sender to safe senders list
- Solution: Contact admin to verify email authentication

**File size too large:**
- Some email servers reject large attachments (>10-25 MB)
- Solution: Enable compression in schedule settings
- Solution: Use "Send link" instead of attachment
- Solution: Apply filters to reduce report size

**[Screenshot: Email delivery diagnostics]**

### Report Generation Failed

**Error: "Query timeout"**
- Report has too much data or complex query
- **Solution**: Add filters to limit data
- **Solution**: Optimize report query
- **Solution**: Contact admin to increase timeout

**Error: "Insufficient permissions"**
- Schedule owner lost access to report or data
- **Solution**: Admin grants necessary permissions
- **Solution**: Change schedule owner to user with access

**Error: "Report not found"**
- Report was deleted or moved
- **Solution**: Edit schedule to select different report
- **Solution**: Restore report from recycle bin

**Error: "Export failed"**
- Issue generating PDF, Excel, or CSV
- **Solution**: Try different export format
- **Solution**: Reduce report complexity
- **Solution**: Check for invalid characters in data

**[Screenshot: Report generation error messages]**

### Schedule Not Running

**Schedule appears inactive:**
1. Check schedule status (Active vs. Paused vs. Disabled)
2. Verify start date hasn't passed end date
3. Check "Skip holidays" setting - today might be a holiday
4. View history for error messages

**Schedule is active but not running:**
- Check next run date/time - might be in future
- Verify schedule frequency is correct
- Check for conditional logic preventing runs
- Server clock might be incorrect (rare, contact admin)

**Pause vs. Disable:**
- **Paused**: Temporarily stopped, can be resumed
- **Disabled**: Stopped due to errors (requires fixing)
- **Ended**: Passed end date (edit to extend)

**[Screenshot: Schedule status indicators]**

### Recipient Issues

**Recipient says they didn't receive, but history shows success:**
- Email went to spam folder
- Email delivered to incorrect address (typo)
- Email client filter moved it to folder
- Distribution list membership issue

**Some recipients receive, others don't:**
- Check individual delivery status in history
- Some email addresses may be invalid
- Some domains may block sender
- Check hard bounce list - recipient might be blocked

**Dynamic recipients not working:**
- Verify data contains values for dynamic field
- Check dynamic recipient logic (per owner, per team, etc.)
- Ensure users have email addresses in system
- Check recipient filter isn't excluding users

**[Screenshot: Per-recipient delivery status]**

### Performance Issues

**Schedule takes too long to run:**
- Large dataset (>50,000 rows)
- Complex calculations or joins
- Multiple formats being generated
- Peak usage time

**Solutions:**
- **Optimize report**: Add filters, reduce columns
- **Schedule during off-peak**: Night or early morning
- **Use CSV format**: Fastest to generate
- **Split into multiple schedules**: Separate schedules per region/team
- **Increase timeout**: Contact admin (if query is legitimately complex)

**Storage quota exceeded:**
- Organization storage limit reached
- Too many scheduled reports with long retention
- Solution: Reduce retention period
- Solution: Delete old generated files
- Solution: Upgrade storage quota

**[Screenshot: Performance metrics and optimization tips]**

---

## Advanced Scheduling

### Conditional Schedules

Run schedules only when certain conditions are met.

**To add condition:**
1. Edit schedule → **"Advanced"** → **"Conditions"**
2. Click **"Add Condition"**
3. Configure:
   - If `{metric}` `{operator}` `{value}`
   - Example: If `Total Revenue` `>` `100000`
4. Choose action:
   - Run report
   - Skip and notify
   - Run alternative report
5. Save

**Example conditional schedules:**
```
Run only if: Open Opportunities > 10
Run only if: Close Rate < 50% (alert when performance drops)
Run only if: Today is last business day of month
Run only if: Overdue Tasks count > 0
```

**[Screenshot: Conditional schedule configuration]**

### Chained Schedules

Run multiple schedules in sequence, where one triggers another.

**To create chain:**
1. Create primary schedule
2. Add **"On Success" action** → **"Trigger another schedule"**
3. Select next schedule in chain
4. Repeat for additional schedules

**Example chain:**
```
1. Generate Daily Sales Report (8:00 AM)
   → On Success →
2. Generate Team Activity Summary (using sales data)
   → On Success →
3. Generate Executive Dashboard (combining both)
   → Email to CEO
```

**Use cases:**
- Multi-step reporting processes
- Dependent reports (one needs data from another)
- Escalation workflows (alert if metrics cross threshold)

**[Screenshot: Schedule chain configuration]**

### Burst Delivery

Send personalized reports to multiple recipients based on data.

**Example: Send each sales rep their own report**
1. Create report with dynamic filter: `Owner = {Recipient}`
2. Enable **"Burst Delivery"**
3. Choose burst field: `Owner`
4. Each owner receives email with only their data

**Burst configuration:**
- **Burst by**: Field to determine recipients (Owner, Region, Team, etc.)
- **Email field**: Which field contains recipient's email
- **File naming**: Each file can include recipient name
- **Subject/Message**: Can include recipient-specific variables

**Benefits:**
- Personalized reports for each user
- Data security (users only see their data)
- Scalable (100 reps get 100 personalized reports)

**[Screenshot: Burst delivery configuration]**

### Data-Driven Scheduling

Adjust schedule frequency based on data changes.

**Smart scheduling:**
- **High change period**: Run more frequently
- **Low change period**: Run less frequently
- **Threshold-based**: Run when metric crosses threshold

**To enable:**
1. Schedule settings → **"Smart Scheduling"**
2. Enable **"Adjust frequency based on data changes"**
3. Configure:
   - Normal frequency: Weekly
   - If data changes >20%: Daily
   - If data changes <5%: Monthly
4. Save

**[Screenshot: Smart scheduling configuration]**

### Multi-Format Delivery

Send same report in multiple formats to different recipients.

**Example:**
```
To: executives@company.com
  - Format: PDF (for viewing)

To: analysts@company.com
  - Format: Excel (for analysis)

To: data-warehouse@company.com
  - Format: CSV (for import)
```

**To configure:**
1. Schedule settings → **"Delivery"** → **"Multiple Formats"**
2. Click **"Add Format"**
3. For each format:
   - Choose format (PDF, Excel, CSV)
   - Select recipients
   - Customize email message
4. Save

**[Screenshot: Multi-format delivery setup]**

---

## Related Topics

- [Creating Reports](Creating_Reports.md) - Build reports to schedule
- [Exporting Reports](Exporting_Reports.md) - Export formats and options
- [Email Templates](Email_Templates.md) - Customize scheduled emails
- [Dashboards](Dashboards.md) - Schedule dashboard delivery
- [KPIs and Metrics](KPIs_and_Metrics.md) - Schedule KPI reports
- [Reports FAQ](Reports_FAQ.md) - Scheduling questions

---

**Last Updated**: January 2026
**Version**: 3.0

---

*Next: Learn about [KPIs and Metrics](KPIs_and_Metrics.md) to track your most important business metrics.*
