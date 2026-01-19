# Email Delivery System Documentation

## Overview

The Email Delivery System provides robust email functionality for scheduled reports and notifications using Resend. It includes template management, delivery tracking, retry logic, and comprehensive analytics.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Email Delivery System                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Resend     │  │   Template   │  │   Delivery   │      │
│  │   Client     │  │   Rendering  │  │   Tracking   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Rate Limiter & Retry Logic                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Email Validation & Security                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Features

### Core Functionality

1. **Email Sending**
   - Send report emails with attachments (PDF, Excel, CSV)
   - Support for multiple recipients, CC, BCC
   - HTML email templates with responsive design
   - Variable substitution for dynamic content

2. **Template Management**
   - Rich template editor with live preview
   - Pre-built templates for common scenarios
   - Custom template creation and storage
   - Import/export template functionality

3. **Delivery Tracking**
   - Complete delivery status tracking
   - Open and click tracking (optional)
   - Bounce detection and handling
   - Error logging and diagnostics

4. **Retry Logic**
   - Automatic retry with exponential backoff
   - Configurable retry limits
   - Intelligent failure handling
   - Manual retry capability

5. **Rate Limiting**
   - Per-minute, per-hour, and per-day limits
   - Automatic throttling
   - Queue management
   - Status monitoring

6. **Analytics**
   - Delivery rates and statistics
   - Open and click-through rates
   - Bounce rate tracking
   - Historical analytics

## Setup

### 1. Install Dependencies

```bash
npm install resend @types/nodemailer
```

### 2. Configure Environment Variables

Add to your `.env.local` file:

```bash
# Required
VITE_RESEND_API_KEY=re_your_api_key_here
VITE_EMAIL_FROM=reports@logosvision.com
VITE_EMAIL_FROM_NAME=Logos Vision CRM

# Optional
VITE_EMAIL_REPLY_TO=support@logosvision.com
VITE_EMAIL_MAX_PER_MINUTE=10
VITE_EMAIL_MAX_PER_HOUR=100
VITE_EMAIL_MAX_PER_DAY=1000
VITE_EMAIL_TEST_MODE=false
```

### 3. Run Database Migration

```bash
# Apply the email delivery tracking migration
supabase migration up
```

This creates:
- `email_delivery_log` - Tracks all email deliveries
- `email_templates` - Stores reusable templates
- `email_delivery_analytics` - Materialized view for analytics

### 4. Verify Configuration

```typescript
import { validateEmailConfig } from './config/emailConfig';

// This will throw an error if configuration is invalid
validateEmailConfig();
```

## Usage

### Basic Email Sending

```typescript
import { sendReportEmail } from './services/emailService';

const result = await sendReportEmail(
  ['user@example.com'],
  'Monthly Report - January 2026',
  '<h1>Your Report</h1><p>See attachment.</p>',
  [
    {
      filename: 'report.pdf',
      content: pdfBuffer,
      contentType: 'application/pdf',
      size: pdfBuffer.length,
    },
  ]
);

if (result.success) {
  console.log('Email sent!', result.messageId);
} else {
  console.error('Failed to send:', result.error);
}
```

### Using Templates

```typescript
import { sendTemplatedEmail } from './services/emailService';
import scheduledReportTemplate from './templates/email/scheduledReport.html?raw';

const variables = {
  reportName: 'Monthly Donations Report',
  exportDate: 'January 17, 2026',
  recordCount: 1234,
  dateRange: 'January 1-31, 2026',
  userName: 'John Doe',
  reportUrl: 'https://app.logosvision.com/reports/123',
};

const result = await sendTemplatedEmail(
  ['recipient@example.com'],
  scheduledReportTemplate,
  'Scheduled Report: {{reportName}} - {{exportDate}}',
  variables,
  attachments
);
```

### Template Variables

Available variables for email templates:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{reportName}}` | Name of the report | Monthly Donations Report |
| `{{exportDate}}` | Date of export | January 17, 2026 |
| `{{recordCount}}` | Number of records | 1,234 |
| `{{dateRange}}` | Date range filter | Jan 1 - Jan 31, 2026 |
| `{{userName}}` | Recipient name | John Doe |
| `{{userEmail}}` | Recipient email | john@example.com |
| `{{reportUrl}}` | Link to view report | https://app.logosvision.com/reports/123 |
| `{{unsubscribeUrl}}` | Unsubscribe link | https://app.logosvision.com/unsubscribe |
| `{{companyName}}` | Company name | Logos Vision CRM |
| `{{currentYear}}` | Current year | 2026 |
| `{{customMessage}}` | Custom message | Thank you for your support |

### Email Validation

```typescript
import { validateEmail, validateEmailList } from './services/emailService';

// Validate single email
if (validateEmail('user@example.com')) {
  console.log('Valid email');
}

// Validate multiple emails
const { valid, invalid } = validateEmailList([
  'user@example.com',
  'invalid-email',
  'another@example.com',
]);

console.log('Valid:', valid);   // ['user@example.com', 'another@example.com']
console.log('Invalid:', invalid); // ['invalid-email']
```

### Template Rendering

```typescript
import { renderTemplate } from './services/emailService';

const template = 'Hello {{userName}}, your report {{reportName}} is ready!';
const variables = {
  userName: 'John',
  reportName: 'Monthly Report',
};

const rendered = renderTemplate(template, variables);
// Output: "Hello John, your report Monthly Report is ready!"
```

### Sending Test Email

```typescript
import { sendTestEmail } from './services/emailService';

const result = await sendTestEmail('admin@example.com');

if (result.success) {
  console.log('Test email sent successfully');
} else {
  console.error('Test failed:', result.error);
}
```

### Getting Delivery Statistics

```typescript
import { getEmailDeliveryStats } from './services/emailService';

const startDate = new Date('2026-01-01');
const endDate = new Date('2026-01-31');

const stats = await getEmailDeliveryStats(startDate, endDate);

console.log('Total sent:', stats.sent);
console.log('Failed:', stats.failed);
console.log('Bounced:', stats.bounced);
console.log('Delivery rate:', stats.total > 0 ? (stats.sent / stats.total * 100).toFixed(2) + '%' : '0%');
```

### Checking Rate Limiter Status

```typescript
import { getRateLimiterStatus } from './services/emailService';

const status = getRateLimiterStatus();

console.log('Emails sent this minute:', status.minute);
console.log('Emails sent this hour:', status.hour);
console.log('Emails sent today:', status.day);
console.log('Limits:', status.limits);
```

## Email Template Editor Component

### Using the EmailTemplateEditor

```typescript
import EmailTemplateEditor from './components/reports/EmailTemplateEditor';

function MyComponent() {
  const [showEditor, setShowEditor] = useState(false);

  const handleSave = (subject: string, body: string) => {
    console.log('Template saved:', { subject, body });
    // Save to database or state
    setShowEditor(false);
  };

  return (
    <div>
      <button onClick={() => setShowEditor(true)}>
        Edit Email Template
      </button>

      {showEditor && (
        <EmailTemplateEditor
          initialSubject="Report: {{reportName}}"
          initialBody="<h2>Hello {{userName}}</h2>"
          onSave={handleSave}
          onCancel={() => setShowEditor(false)}
          showPresetLibrary={true}
        />
      )}
    </div>
  );
}
```

### Template Editor Features

1. **Code View** - Edit HTML directly
2. **HTML View** - View formatted HTML code
3. **Preview Mode** - See rendered email with sample data
4. **Variable Insertion** - Click to insert template variables
5. **Template Library** - Choose from preset templates
6. **Import/Export** - Save and load templates as JSON

## Integration with Report Scheduling

### Example: Scheduled Report Email

```typescript
import { sendTemplatedEmail } from './services/emailService';
import { supabase } from './services/supabaseClient';
import scheduledReportTemplate from './templates/email/scheduledReport.html?raw';

async function sendScheduledReport(scheduleId: string) {
  // Get schedule details
  const { data: schedule } = await supabase
    .from('report_schedules')
    .select('*, reports(*)')
    .eq('id', scheduleId)
    .single();

  if (!schedule) {
    throw new Error('Schedule not found');
  }

  // Generate report export
  const exportData = await generateReportExport(schedule.report_id);

  // Prepare template variables
  const variables = {
    reportName: schedule.reports.name,
    exportDate: new Date().toLocaleDateString(),
    recordCount: exportData.rowCount,
    dateRange: schedule.filters?.dateRange || 'All Time',
    userName: 'User', // Get from user record
    reportUrl: `${window.location.origin}/reports/${schedule.report_id}`,
    customMessage: schedule.email_body || '',
  };

  // Send email with attachment
  const result = await sendTemplatedEmail(
    schedule.recipients,
    scheduledReportTemplate,
    schedule.email_subject || 'Scheduled Report: {{reportName}}',
    variables,
    [
      {
        filename: `${schedule.reports.name}.${schedule.export_format}`,
        content: exportData.buffer,
        contentType: getContentType(schedule.export_format),
        size: exportData.buffer.length,
      },
    ],
    {
      reportScheduleId: scheduleId,
      tags: { type: 'scheduled_report', reportId: schedule.report_id },
    }
  );

  // Update schedule last run
  await supabase
    .from('report_schedules')
    .update({
      last_run_at: new Date().toISOString(),
      last_status: result.success ? 'success' : 'error',
      last_error: result.error,
      run_count: schedule.run_count + 1,
    })
    .eq('id', scheduleId);

  return result;
}
```

## Database Schema

### email_delivery_log

Tracks all email deliveries with comprehensive metadata.

```sql
CREATE TABLE email_delivery_log (
    id UUID PRIMARY KEY,
    report_schedule_id UUID REFERENCES report_schedules(id),
    export_history_id UUID REFERENCES report_export_history(id),
    recipient VARCHAR(500) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    status VARCHAR(50) NOT NULL,
    message_id VARCHAR(255),
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    attachment_count INTEGER DEFAULT 0,
    tags JSONB,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### email_templates

Stores reusable email templates.

```sql
CREATE TABLE email_templates (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    subject VARCHAR(500) NOT NULL,
    body_html TEXT NOT NULL,
    available_variables JSONB,
    is_default BOOLEAN DEFAULT FALSE,
    is_system BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Error Handling

### Common Errors

1. **Invalid API Key**
```typescript
Error: Resend API key not configured
```
Solution: Set `VITE_RESEND_API_KEY` in environment variables

2. **Rate Limit Exceeded**
```typescript
Error: Rate limit exceeded. Emails sent: 10/min, 100/hour, 1000/day
```
Solution: Adjust rate limits or implement queueing

3. **Invalid Email Address**
```typescript
Error: Invalid email addresses: invalid-email
```
Solution: Validate emails before sending

4. **Attachment Too Large**
```typescript
Error: Attachment "report.pdf" exceeds maximum size of 10485760 bytes
```
Solution: Reduce attachment size or increase limit

### Handling Failed Emails

```typescript
// Get emails pending retry
const { data: pendingEmails } = await supabase
  .rpc('get_emails_pending_retry');

// Retry each email
for (const email of pendingEmails) {
  await retryFailedEmail(email.id);
}
```

## Testing

### Test Mode

Enable test mode to prevent actual email sending:

```bash
VITE_EMAIL_TEST_MODE=true
```

In test mode:
- No emails are actually sent
- All operations return success
- Logs show what would have been sent

### Manual Testing

```typescript
import { sendTestEmail } from './services/emailService';

// Send test email to yourself
const result = await sendTestEmail('your-email@example.com');

console.log('Test result:', result);
```

## Security Considerations

1. **Email Validation** - All recipient emails are validated before sending
2. **Rate Limiting** - Prevents email bombing and abuse
3. **Retry Limits** - Prevents infinite retry loops
4. **Content Sanitization** - Template variables are escaped
5. **Attachment Validation** - File types and sizes are validated
6. **Error Logging** - Failed attempts are logged for security monitoring

## Performance Optimization

1. **Rate Limiter** - Automatic throttling to stay within provider limits
2. **Retry Logic** - Exponential backoff prevents server overload
3. **Template Caching** - Rendered templates can be cached
4. **Batch Sending** - Send to multiple recipients efficiently
5. **Materialized Views** - Pre-computed analytics for faster queries

## Analytics Queries

### Get delivery stats for last 30 days

```sql
SELECT * FROM get_email_delivery_stats(
  NOW() - INTERVAL '30 days',
  NOW()
);
```

### Get daily email volume

```sql
SELECT
  date,
  SUM(email_count) as total_emails,
  SUM(opened_count) as total_opens,
  SUM(clicked_count) as total_clicks
FROM email_delivery_analytics
WHERE date >= NOW() - INTERVAL '30 days'
GROUP BY date
ORDER BY date DESC;
```

### Find bounced emails

```sql
SELECT
  recipient,
  bounce_type,
  bounce_reason,
  bounced_at
FROM email_delivery_log
WHERE status = 'bounced'
ORDER BY bounced_at DESC
LIMIT 100;
```

## Troubleshooting

### Emails Not Sending

1. Check API key is configured correctly
2. Verify sender email is verified in Resend dashboard
3. Check rate limits haven't been exceeded
4. Review error logs in `email_delivery_log` table

### High Bounce Rate

1. Validate email addresses before adding to lists
2. Remove bounced emails from recipient lists
3. Check domain reputation
4. Ensure email content isn't triggering spam filters

### Slow Delivery

1. Check rate limiter status
2. Verify network connectivity
3. Review Resend service status
4. Consider implementing email queue

## Best Practices

1. **Always validate emails** before sending
2. **Use templates** for consistent branding
3. **Monitor bounce rates** and remove bad addresses
4. **Test emails** before sending to large lists
5. **Track delivery metrics** to optimize content
6. **Implement unsubscribe** functionality
7. **Respect rate limits** to avoid throttling
8. **Log all deliveries** for audit trails
9. **Handle retries** with exponential backoff
10. **Use meaningful subjects** for better open rates

## Support

For issues or questions:
1. Check the error logs in `email_delivery_log`
2. Review Resend dashboard for delivery status
3. Check environment variable configuration
4. Review this documentation
5. Contact support at support@logosvision.com

## References

- [Resend Documentation](https://resend.com/docs)
- [Email Best Practices](https://www.mailgun.com/blog/email/email-best-practices/)
- [Email Template Design](https://templates.mailchimp.com/)
