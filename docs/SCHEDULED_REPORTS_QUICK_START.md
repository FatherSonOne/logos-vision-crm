# Scheduled Reports Quick Start Guide

## Table of Contents
1. [Installation](#installation)
2. [Basic Usage](#basic-usage)
3. [API Reference](#api-reference)
4. [Common Patterns](#common-patterns)
5. [Troubleshooting](#troubleshooting)

---

## Installation

### 1. Run Database Migration
```bash
# Apply the migration
supabase migration up

# Verify it worked
supabase db inspect
```

### 2. Deploy Edge Function
```bash
# Deploy the function
supabase functions deploy execute-scheduled-reports

# Set required secrets
supabase secrets set SUPABASE_URL=<your-project-url>
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<your-service-key>

# Optional: Email service
supabase secrets set RESEND_API_KEY=<your-resend-api-key>
```

### 3. Create Storage Bucket
Via Supabase Dashboard:
- Go to Storage
- Create bucket: `report-exports`
- Set as Public
- Set file size limit: 50MB

### 4. Enable pg_cron
Via Supabase Dashboard:
- Go to Database → Extensions
- Enable `pg_cron`

---

## Basic Usage

### Creating a Schedule (UI)

```tsx
import ReportScheduler from '@/components/reports/ReportScheduler';

function MyReportPage() {
  const [showScheduler, setShowScheduler] = useState(false);

  return (
    <>
      <Button onClick={() => setShowScheduler(true)}>
        Schedule Report
      </Button>

      <ReportScheduler
        reportId={report.id}
        reportName={report.name}
        open={showScheduler}
        onClose={() => setShowScheduler(false)}
        onScheduleCreated={(schedule) => {
          console.log('Created:', schedule);
          setShowScheduler(false);
        }}
      />
    </>
  );
}
```

### Creating a Schedule (Programmatic)

```typescript
import { reportService } from '@/services/reportService';

// Daily report at 8 AM
const dailySchedule = await reportService.createSchedule({
  reportId: 'report-id',
  scheduleType: 'daily',
  scheduleTime: '08:00:00',
  timezone: 'America/New_York',
  deliveryMethod: 'email',
  recipients: ['user@example.com'],
  exportFormat: 'pdf',
  includeFilters: true,
  includeTimestamp: true,
  emailSubject: 'Daily Report: {{report_name}}',
  emailBody: 'Your daily report is ready with {{row_count}} rows.',
});

// Weekly report every Monday
const weeklySchedule = await reportService.createSchedule({
  reportId: 'report-id',
  scheduleType: 'weekly',
  scheduleTime: '09:00:00',
  scheduleDayOfWeek: 1, // Monday (0 = Sunday)
  timezone: 'America/New_York',
  deliveryMethod: 'email',
  recipients: ['team@example.com'],
  exportFormat: 'excel',
});

// Monthly report on the 1st
const monthlySchedule = await reportService.createSchedule({
  reportId: 'report-id',
  scheduleType: 'monthly',
  scheduleTime: '06:00:00',
  scheduleDayOfMonth: 1,
  timezone: 'America/New_York',
  deliveryMethod: 'email',
  recipients: ['finance@example.com'],
  exportFormat: 'csv',
});

// One-time report
const onceSchedule = await reportService.createSchedule({
  reportId: 'report-id',
  scheduleType: 'once',
  scheduleTime: '14:00:00',
  scheduledDate: '2026-01-25',
  timezone: 'America/New_York',
  deliveryMethod: 'download',
  exportFormat: 'pdf',
});
```

---

## API Reference

### reportService.createSchedule()
```typescript
interface CreateScheduleParams {
  reportId: string;                    // Required
  scheduleType: ScheduleType;          // Required: 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually'
  scheduleTime: string;                // Required: 'HH:MM:SS'
  scheduleDayOfWeek?: number;          // 0-6 (Sunday = 0), required for 'weekly'
  scheduleDayOfMonth?: number;         // 1-31, required for 'monthly', 'quarterly', 'annually'
  scheduleMonth?: number;              // 1-12, required for 'annually'
  scheduledDate?: string;              // ISO date, required for 'once'
  timezone?: string;                   // Default: 'America/New_York'
  deliveryMethod?: 'email' | 'download'; // Default: 'email'
  recipients?: string[];               // Required if deliveryMethod = 'email'
  exportFormat?: ExportFormat;         // Default: 'pdf'
  includeFilters?: boolean;            // Default: true
  includeTimestamp?: boolean;          // Default: true
  emailSubject?: string;               // Email template
  emailBody?: string;                  // Email template
  isActive?: boolean;                  // Default: true
}

const schedule = await reportService.createSchedule(params);
```

### reportService.updateSchedule()
```typescript
const updated = await reportService.updateSchedule(
  scheduleId,
  {
    isActive: false,  // Disable schedule
    recipients: ['new@example.com'],
  }
);
```

### reportService.deleteSchedule()
```typescript
await reportService.deleteSchedule(scheduleId);
```

### reportService.getSchedulesByReport()
```typescript
const schedules = await reportService.getSchedulesByReport(reportId);
```

### reportService.getScheduleHistory()
```typescript
const history = await reportService.getScheduleHistory(scheduleId, 10);
// Returns last 10 execution records
```

### ScheduleExecutor Utilities
```typescript
import {
  calculateNextRun,
  validateSchedule,
  formatScheduleDescription,
  getTimezones,
} from '@/services/reports/ScheduleExecutor';

// Calculate next run
const nextRun = calculateNextRun(schedule);

// Validate before saving
const { valid, errors } = validateSchedule(schedule);
if (!valid) {
  console.error('Validation errors:', errors);
}

// Get human-readable description
const description = formatScheduleDescription(schedule);
// "Daily at 8:00 AM"
// "Weekly on Monday at 9:00 AM"
// "Monthly on day 1 at 6:00 AM"

// Get available timezones
const timezones = getTimezones();
```

---

## Common Patterns

### 1. Daily Morning Report
```typescript
await reportService.createSchedule({
  reportId: reportId,
  scheduleType: 'daily',
  scheduleTime: '08:00:00',
  timezone: 'America/New_York',
  deliveryMethod: 'email',
  recipients: ['team@example.com'],
  exportFormat: 'pdf',
  emailSubject: 'Daily Report - {{date}}',
  emailBody: 'Good morning! Here is your daily report with {{row_count}} records.',
});
```

### 2. Weekly Team Summary
```typescript
await reportService.createSchedule({
  reportId: reportId,
  scheduleType: 'weekly',
  scheduleDayOfWeek: 1, // Monday
  scheduleTime: '09:00:00',
  timezone: 'America/New_York',
  deliveryMethod: 'email',
  recipients: ['team@example.com', 'manager@example.com'],
  exportFormat: 'excel',
  emailSubject: 'Weekly Summary - Week of {{date}}',
  emailBody: 'Your weekly summary is attached.',
});
```

### 3. Month-End Financial Report
```typescript
await reportService.createSchedule({
  reportId: reportId,
  scheduleType: 'monthly',
  scheduleDayOfMonth: 1, // First day of month
  scheduleTime: '06:00:00',
  timezone: 'America/New_York',
  deliveryMethod: 'email',
  recipients: ['finance@example.com', 'cfo@example.com'],
  exportFormat: 'csv',
  emailSubject: 'Monthly Financial Report - {{date}}',
  emailBody: 'Monthly financial summary attached with {{row_count}} transactions.',
});
```

### 4. Quarterly Board Report
```typescript
await reportService.createSchedule({
  reportId: reportId,
  scheduleType: 'quarterly',
  scheduleDayOfMonth: 15, // 15th of Jan, Apr, Jul, Oct
  scheduleTime: '08:00:00',
  timezone: 'America/New_York',
  deliveryMethod: 'email',
  recipients: ['board@example.com'],
  exportFormat: 'pdf',
  emailSubject: 'Q{{quarter}} Board Report',
  emailBody: 'Quarterly board report is ready for review.',
});
```

### 5. Annual Year-End Report
```typescript
await reportService.createSchedule({
  reportId: reportId,
  scheduleType: 'annually',
  scheduleMonth: 1, // January
  scheduleDayOfMonth: 2,
  scheduleTime: '07:00:00',
  timezone: 'America/New_York',
  deliveryMethod: 'email',
  recipients: ['executive@example.com'],
  exportFormat: 'pdf',
  emailSubject: 'Annual Report - {{year}}',
  emailBody: 'Year-end report for {{year}} is now available.',
});
```

### 6. One-Time Event Report
```typescript
await reportService.createSchedule({
  reportId: reportId,
  scheduleType: 'once',
  scheduledDate: '2026-06-15',
  scheduleTime: '14:00:00',
  timezone: 'America/New_York',
  deliveryMethod: 'download',
  exportFormat: 'csv',
  // No email - just generates and stores
});
```

### 7. Multiple Recipients with Custom Template
```typescript
await reportService.createSchedule({
  reportId: reportId,
  scheduleType: 'daily',
  scheduleTime: '17:00:00',
  timezone: 'America/New_York',
  deliveryMethod: 'email',
  recipients: [
    'sales@example.com',
    'marketing@example.com',
    'operations@example.com',
  ],
  exportFormat: 'excel',
  emailSubject: 'End of Day Report - {{date}}',
  emailBody: `
    Hi Team,

    Your end-of-day report is ready.

    Report: {{report_name}}
    Date: {{date}}
    Time: {{time}}
    Format: {{format}}
    Records: {{row_count}}

    Best regards,
    Automated Reporting System
  `,
});
```

---

## Troubleshooting

### Schedule Not Executing

**Check if schedule is active:**
```sql
SELECT * FROM scheduled_reports_status
WHERE schedule_id = '<your-id>';
```

**Manually trigger for testing:**
```sql
SELECT trigger_schedule_now('<schedule-id>');
```

**Check cron job status:**
```sql
SELECT * FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 5;
```

### Email Not Sending

**Verify email integration is configured:**
```bash
# Check if RESEND_API_KEY is set
supabase secrets list
```

**Enable email in edge function:**
Uncomment the email sending code in `supabase/functions/execute-scheduled-reports/index.ts`

**Check execution logs:**
```bash
supabase functions logs execute-scheduled-reports --tail
```

### Export File Not Found

**Check storage bucket:**
```sql
SELECT * FROM storage.objects
WHERE bucket_id = 'report-exports'
ORDER BY created_at DESC
LIMIT 10;
```

**Verify bucket exists and is public:**
- Supabase Dashboard → Storage
- Bucket: `report-exports`
- Public: ✓

### Next Run Time Incorrect

**Recalculate next run:**
```sql
-- Force trigger recalculation
UPDATE report_schedules
SET updated_at = NOW()
WHERE id = '<schedule-id>';
```

**Check timezone:**
```typescript
import { calculateNextRun } from '@/services/reports/ScheduleExecutor';

const schedule = { /* your schedule */ };
const nextRun = calculateNextRun(schedule);
console.log('Next run:', nextRun);
console.log('In timezone:', schedule.timezone);
```

### Validation Errors

**Use validator before saving:**
```typescript
import { validateSchedule } from '@/services/reports/ScheduleExecutor';

const { valid, errors } = validateSchedule(scheduleData);
if (!valid) {
  console.error('Validation failed:', errors);
  // Show errors to user
}
```

---

## Monitoring

### View All Schedules
```sql
SELECT * FROM scheduled_reports_status
ORDER BY next_run_at;
```

### View Execution History
```sql
SELECT
  rs.id AS schedule_id,
  r.name AS report_name,
  reh.exported_at,
  reh.success,
  reh.row_count,
  reh.execution_time_ms,
  reh.error_message
FROM report_export_history reh
JOIN report_schedules rs ON reh.schedule_id = rs.id
JOIN reports r ON rs.report_id = r.id
ORDER BY reh.exported_at DESC
LIMIT 20;
```

### Check Overdue Schedules
```sql
SELECT * FROM scheduled_reports_status
WHERE status = 'Overdue';
```

### Performance Metrics
```sql
SELECT
  export_format,
  AVG(execution_time_ms) AS avg_time_ms,
  AVG(row_count) AS avg_rows,
  COUNT(*) AS total_exports,
  SUM(CASE WHEN success THEN 1 ELSE 0 END)::FLOAT / COUNT(*) * 100 AS success_rate
FROM report_export_history
WHERE exported_at > NOW() - INTERVAL '7 days'
GROUP BY export_format;
```

---

## Best Practices

### 1. Use Descriptive Email Templates
```typescript
emailSubject: 'Daily Sales Report - {{date}}'
emailBody: 'Sales summary for {{date}} with {{row_count}} transactions.'
```

### 2. Set Appropriate Timezones
```typescript
timezone: 'America/New_York'  // Match your users' timezone
```

### 3. Validate Before Creating
```typescript
const { valid, errors } = validateSchedule(scheduleData);
if (!valid) {
  alert('Invalid schedule: ' + errors.join(', '));
  return;
}
```

### 4. Handle Large Datasets
- Export limit: 10,000 rows
- For larger datasets, use filters
- Consider pagination or summary reports

### 5. Test with One-Time Schedules
```typescript
// Test first with once schedule
scheduleType: 'once',
scheduledDate: new Date().toISOString().split('T')[0],
// Then convert to recurring
```

### 6. Monitor Execution History
```typescript
const history = await reportService.getScheduleHistory(scheduleId);
const lastRun = history[0];
if (!lastRun.success) {
  console.error('Last run failed:', lastRun.error_message);
}
```

### 7. Clean Up Old Schedules
```typescript
// Disable instead of deleting
await reportService.updateSchedule(scheduleId, {
  isActive: false
});
```

---

## Quick Reference

### Schedule Types
| Type | Requires | Example |
|------|----------|---------|
| once | scheduledDate | One-time report on 2026-01-25 |
| daily | - | Every day at 8 AM |
| weekly | scheduleDayOfWeek | Every Monday at 9 AM |
| monthly | scheduleDayOfMonth | 1st of every month at 6 AM |
| quarterly | scheduleDayOfMonth | Jan/Apr/Jul/Oct 15th at 8 AM |
| annually | scheduleMonth, scheduleDayOfMonth | Every Jan 1st at 7 AM |

### Export Formats
- `pdf` - PDF document (requires implementation)
- `excel` - Excel workbook (requires implementation)
- `csv` - Comma-separated values ✓
- `png` - PNG image (requires implementation)
- `json` - JSON data ✓

### Email Template Variables
- `{{report_name}}` - Report name
- `{{date}}` - Current date
- `{{time}}` - Current time
- `{{format}}` - Export format
- `{{row_count}}` - Number of rows
- `{{generated_by}}` - Creator name

### Common SQL Queries
```sql
-- All active schedules
SELECT * FROM report_schedules WHERE is_active = TRUE;

-- Schedules due in next hour
SELECT * FROM scheduled_reports_status WHERE status = 'Due soon';

-- Failed executions
SELECT * FROM report_export_history WHERE success = FALSE;

-- Execution statistics
SELECT
  COUNT(*) AS total,
  AVG(execution_time_ms) AS avg_time,
  AVG(row_count) AS avg_rows
FROM report_export_history
WHERE exported_at > NOW() - INTERVAL '7 days';
```

---

## Support

### Documentation
- Full Guide: `docs/SCHEDULED_REPORTS_IMPLEMENTATION.md`
- Architecture: See "System Architecture" section
- API Reference: See "API Reference" section above

### Common Issues
1. Schedule not executing → Check cron job status
2. Email not sending → Verify RESEND_API_KEY
3. Export not found → Check storage bucket
4. Timezone issues → Use IANA timezone identifiers

### Testing
```sql
-- Test immediate execution
SELECT trigger_schedule_now('<schedule-id>');

-- View execution result
SELECT * FROM report_export_history
ORDER BY exported_at DESC
LIMIT 1;
```

---

**Last Updated:** 2026-01-21
**Version:** 1.0.0
