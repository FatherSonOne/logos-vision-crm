# Email Delivery System - Quick Start Guide

## Setup (5 minutes)

### 1. Install Dependencies

```bash
npm install resend @types/nodemailer
```

### 2. Get Resend API Key

1. Go to https://resend.com
2. Sign up or log in
3. Navigate to API Keys
4. Create new API key
5. Copy the key (starts with `re_`)

### 3. Configure Environment

Create or edit `.env.local`:

```bash
VITE_RESEND_API_KEY=re_your_actual_api_key_here
VITE_EMAIL_FROM=reports@logosvision.com
VITE_EMAIL_FROM_NAME=Logos Vision CRM
```

### 4. Run Migration

```bash
supabase migration up
```

### 5. Send Test Email

```typescript
import { sendTestEmail } from './services/emailService';

const result = await sendTestEmail('your-email@example.com');
console.log(result.success ? 'Success!' : 'Failed');
```

## Common Use Cases

### Send Scheduled Report

```typescript
import { sendScheduledReportEmail } from './services/scheduledReportEmailService';

// Call from your scheduler/cron job
const result = await sendScheduledReportEmail(scheduleId);
```

### Send Export Notification

```typescript
import { sendExportCompleteEmail } from './services/scheduledReportEmailService';

await sendExportCompleteEmail(exportHistoryId, 'user@example.com');
```

### Preview Email Template

```tsx
import EmailPreviewModal from './components/reports/EmailPreviewModal';

<EmailPreviewModal
  isOpen={true}
  onClose={() => {}}
  subject="Report: {{reportName}}"
  bodyTemplate={htmlTemplate}
  sampleData={{ reportName: 'Test' }}
/>
```

### Edit Email Template

```tsx
import EmailTemplateEditor from './components/reports/EmailTemplateEditor';

<EmailTemplateEditor
  onSave={(subject, body) => console.log(subject, body)}
  showPresetLibrary={true}
/>
```

## Template Variables

Use these in email subject or body:

- `{{reportName}}` - Report name
- `{{exportDate}}` - Export date
- `{{recordCount}}` - Number of records
- `{{dateRange}}` - Date range
- `{{userName}}` - User name
- `{{reportUrl}}` - Report URL
- `{{companyName}}` - Company name
- `{{currentYear}}` - Current year

## Troubleshooting

### Emails not sending?

1. Check API key: `console.log(import.meta.env.VITE_RESEND_API_KEY)`
2. Verify sender email in Resend dashboard
3. Check email logs: Query `email_delivery_log` table
4. Enable test mode: `VITE_EMAIL_TEST_MODE=true`

### Rate limit errors?

Adjust in `.env.local`:
```bash
VITE_EMAIL_MAX_PER_MINUTE=20
VITE_EMAIL_MAX_PER_HOUR=200
```

### Template not rendering?

1. Check variable names match exactly
2. Use `renderTemplate()` to test
3. View in EmailPreviewModal

## Next Steps

1. Read full documentation: `docs/EMAIL_DELIVERY_SYSTEM.md`
2. Customize email templates in `src/templates/email/`
3. Set up monitoring queries
4. Configure production rate limits
5. Test with real recipients

## File Locations

- **Service**: `src/services/emailService.ts`
- **Config**: `src/config/emailConfig.ts`
- **Templates**: `src/templates/email/`
- **Components**: `src/components/reports/Email*.tsx`
- **Migration**: `supabase/migrations/20260122000000_create_email_delivery_log.sql`
- **Docs**: `docs/EMAIL_DELIVERY_SYSTEM.md`

## Support

Full documentation: `docs/EMAIL_DELIVERY_SYSTEM.md`

Questions? support@logosvision.com
