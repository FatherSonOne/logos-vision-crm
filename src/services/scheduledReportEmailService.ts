/**
 * Scheduled Report Email Service
 *
 * Integration service that connects the email delivery system
 * with the report scheduling system.
 *
 * @module scheduledReportEmailService
 * @category Services
 */

import { sendTemplatedEmail, EmailAttachment, TemplateVariables } from './emailService';
import { supabase } from './supabaseClient';
import { ExportRouter } from './export/ExportRouter';

/**
 * Content type mapping for export formats
 */
const CONTENT_TYPE_MAP: Record<string, string> = {
  pdf: 'application/pdf',
  excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  csv: 'text/csv',
  png: 'image/png',
};

/**
 * Gets content type for export format
 */
function getContentType(format: string): string {
  return CONTENT_TYPE_MAP[format.toLowerCase()] || 'application/octet-stream';
}

/**
 * Interface for scheduled report email result
 */
interface ScheduledReportEmailResult {
  success: boolean;
  messageId?: string;
  deliveryLogId?: string;
  error?: string;
  recipientCount: number;
}

/**
 * Sends a scheduled report email with attachment
 *
 * This function:
 * 1. Fetches the schedule and report configuration
 * 2. Generates the report export
 * 3. Prepares email template variables
 * 4. Sends the email with the report attachment
 * 5. Updates the schedule's last run status
 * 6. Logs the delivery to the database
 */
export async function sendScheduledReportEmail(
  scheduleId: string
): Promise<ScheduledReportEmailResult> {
  try {
    // 1. Fetch schedule details
    const { data: schedule, error: scheduleError } = await supabase
      .from('report_schedules')
      .select(`
        *,
        reports (
          id,
          name,
          description,
          data_source,
          filters
        )
      `)
      .eq('id', scheduleId)
      .single();

    if (scheduleError || !schedule) {
      throw new Error(`Schedule not found: ${scheduleError?.message}`);
    }

    if (!schedule.is_active) {
      throw new Error('Schedule is not active');
    }

    if (!schedule.recipients || schedule.recipients.length === 0) {
      throw new Error('No recipients configured for this schedule');
    }

    // 2. Generate report export
    console.log('[ScheduledReportEmail] Generating export for report:', schedule.reports.name);

    const exportRouter = new ExportRouter();
    const exportData = await exportRouter.exportReport(
      schedule.report_id,
      schedule.export_format,
      {
        filters: schedule.filters || schedule.reports.filters || {},
        includeTimestamp: schedule.include_timestamp,
      }
    );

    // 3. Load email template
    let emailTemplate: string;
    try {
      const templateResponse = await fetch('/src/templates/email/scheduledReport.html');
      emailTemplate = await templateResponse.text();
    } catch (error) {
      console.warn('[ScheduledReportEmail] Failed to load template, using default');
      emailTemplate = `
        <h2>Your Scheduled Report: {{reportName}}</h2>
        <p>Hello {{userName}},</p>
        <p>Your scheduled report is ready for review. This report contains {{recordCount}} records for the period {{dateRange}}.</p>
        <p>The report is attached to this email.</p>
        <p>{{customMessage}}</p>
      `;
    }

    // 4. Prepare template variables
    const now = new Date();
    const variables: TemplateVariables = {
      reportName: schedule.reports.name,
      exportDate: now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      recordCount: exportData.metadata?.rowCount || 0,
      dateRange: formatDateRange(schedule.filters),
      userName: 'Valued User', // TODO: Fetch actual user names
      reportUrl: `${window.location.origin}/reports/${schedule.report_id}`,
      unsubscribeUrl: `${window.location.origin}/settings/email-preferences`,
      companyName: 'Logos Vision CRM',
      currentYear: now.getFullYear(),
      customMessage: schedule.email_body || 'This is your scheduled report delivery.',
    };

    // 5. Prepare attachment
    const attachment: EmailAttachment = {
      filename: `${sanitizeFilename(schedule.reports.name)}.${schedule.export_format}`,
      content: exportData.data,
      contentType: getContentType(schedule.export_format),
      size: exportData.data.length,
    };

    // 6. Send email
    console.log('[ScheduledReportEmail] Sending email to:', schedule.recipients.length, 'recipients');

    const result = await sendTemplatedEmail(
      schedule.recipients,
      emailTemplate,
      schedule.email_subject || 'Scheduled Report: {{reportName}} - {{exportDate}}',
      variables,
      [attachment],
      {
        reportScheduleId: scheduleId,
        tags: {
          type: 'scheduled_report',
          reportId: schedule.report_id,
          scheduleId: scheduleId,
          format: schedule.export_format,
        },
        metadata: {
          reportName: schedule.reports.name,
          scheduleType: schedule.schedule_type,
          generatedAt: now.toISOString(),
        },
      }
    );

    // 7. Update schedule status
    const updateData: any = {
      last_run_at: now.toISOString(),
      run_count: (schedule.run_count || 0) + 1,
      last_status: result.success ? 'success' : 'error',
    };

    if (!result.success) {
      updateData.last_error = result.error;
    } else {
      updateData.last_error = null;
    }

    // Calculate next run time
    if (schedule.schedule_type !== 'once') {
      updateData.next_run_at = calculateNextRunTime(schedule);
    }

    await supabase
      .from('report_schedules')
      .update(updateData)
      .eq('id', scheduleId);

    // 8. Log to export history
    await supabase.from('report_export_history').insert({
      report_id: schedule.report_id,
      export_format: schedule.export_format,
      file_size: exportData.data.length,
      row_count: exportData.metadata?.rowCount || 0,
      filters_applied: schedule.filters,
      status: result.success ? 'completed' : 'failed',
      error_message: result.error,
      delivery_method: 'email',
      recipients: schedule.recipients,
      scheduled_send: true,
      schedule_id: scheduleId,
    });

    console.log('[ScheduledReportEmail] Email sent successfully:', result.messageId);

    return {
      success: result.success,
      messageId: result.messageId,
      deliveryLogId: result.deliveryLogId,
      error: result.error,
      recipientCount: schedule.recipients.length,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[ScheduledReportEmail] Failed to send scheduled report email:', errorMessage);

    // Update schedule with error
    await supabase
      .from('report_schedules')
      .update({
        last_run_at: new Date().toISOString(),
        last_status: 'error',
        last_error: errorMessage,
      })
      .eq('id', scheduleId);

    return {
      success: false,
      error: errorMessage,
      recipientCount: 0,
    };
  }
}

/**
 * Sends export complete notification email
 */
export async function sendExportCompleteEmail(
  exportHistoryId: string,
  recipientEmail: string
): Promise<boolean> {
  try {
    // Fetch export history details
    const { data: exportHistory, error } = await supabase
      .from('report_export_history')
      .select(`
        *,
        reports (
          id,
          name,
          description
        )
      `)
      .eq('id', exportHistoryId)
      .single();

    if (error || !exportHistory) {
      throw new Error(`Export history not found: ${error?.message}`);
    }

    // Load template
    let emailTemplate: string;
    try {
      const templateResponse = await fetch('/src/templates/email/exportComplete.html');
      emailTemplate = await templateResponse.text();
    } catch (error) {
      emailTemplate = `
        <h2>Export Complete</h2>
        <p>Hello,</p>
        <p>Your export of {{reportName}} has completed successfully with {{recordCount}} records.</p>
        <p><a href="{{reportUrl}}">View in Dashboard</a></p>
      `;
    }

    const variables: TemplateVariables = {
      reportName: exportHistory.reports.name,
      exportDate: new Date(exportHistory.exported_at).toLocaleDateString(),
      recordCount: exportHistory.row_count || 0,
      dateRange: formatDateRange(exportHistory.filters_applied),
      userName: recipientEmail.split('@')[0], // Basic name extraction
      reportUrl: `${window.location.origin}/reports/${exportHistory.report_id}`,
      companyName: 'Logos Vision CRM',
      currentYear: new Date().getFullYear(),
    };

    const result = await sendTemplatedEmail(
      [recipientEmail],
      emailTemplate,
      'Export Complete: {{reportName}}',
      variables,
      undefined,
      {
        exportHistoryId,
        tags: {
          type: 'export_complete',
          reportId: exportHistory.report_id,
          format: exportHistory.export_format,
        },
      }
    );

    return result.success;
  } catch (error) {
    console.error('[ScheduledReportEmail] Failed to send export complete email:', error);
    return false;
  }
}

/**
 * Formats date range for display
 */
function formatDateRange(filters: any): string {
  if (!filters || !filters.dateRange) {
    return 'All Time';
  }

  const { start, end } = filters.dateRange;
  if (start && end) {
    const startDate = new Date(start).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const endDate = new Date(end).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return `${startDate} - ${endDate}`;
  }

  return 'Custom Range';
}

/**
 * Sanitizes filename for safe file naming
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9_\-\.]/gi, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}

/**
 * Calculates next run time for a schedule
 */
function calculateNextRunTime(schedule: any): string {
  const now = new Date();
  const scheduleTime = schedule.schedule_time || '08:00:00';
  const [hours, minutes] = scheduleTime.split(':').map(Number);

  switch (schedule.schedule_type) {
    case 'daily': {
      const next = new Date(now);
      next.setHours(hours, minutes, 0, 0);
      if (next <= now) {
        next.setDate(next.getDate() + 1);
      }
      return next.toISOString();
    }

    case 'weekly': {
      const next = new Date(now);
      next.setHours(hours, minutes, 0, 0);
      const targetDay = schedule.schedule_day_of_week || 0;
      const currentDay = next.getDay();
      const daysUntilTarget = (targetDay - currentDay + 7) % 7 || 7;
      next.setDate(next.getDate() + daysUntilTarget);
      if (next <= now) {
        next.setDate(next.getDate() + 7);
      }
      return next.toISOString();
    }

    case 'monthly': {
      const next = new Date(now);
      next.setHours(hours, minutes, 0, 0);
      next.setDate(schedule.schedule_day_of_month || 1);
      if (next <= now) {
        next.setMonth(next.getMonth() + 1);
      }
      return next.toISOString();
    }

    case 'quarterly': {
      const next = new Date(now);
      next.setHours(hours, minutes, 0, 0);
      next.setMonth(next.getMonth() + 3 - (next.getMonth() % 3));
      next.setDate(1);
      if (next <= now) {
        next.setMonth(next.getMonth() + 3);
      }
      return next.toISOString();
    }

    case 'annually': {
      const next = new Date(now);
      next.setHours(hours, minutes, 0, 0);
      next.setMonth(schedule.schedule_month - 1 || 0);
      next.setDate(1);
      if (next <= now) {
        next.setFullYear(next.getFullYear() + 1);
      }
      return next.toISOString();
    }

    default:
      return now.toISOString();
  }
}

/**
 * Processes all pending scheduled reports
 * This function should be called by a cron job or scheduled task
 */
export async function processPendingScheduledReports(): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
}> {
  const stats = {
    processed: 0,
    succeeded: 0,
    failed: 0,
  };

  try {
    // Get all active schedules that are due to run
    const { data: schedules, error } = await supabase
      .from('report_schedules')
      .select('id, next_run_at, reports(name)')
      .eq('is_active', true)
      .lte('next_run_at', new Date().toISOString())
      .order('next_run_at', { ascending: true });

    if (error) {
      console.error('[ProcessSchedules] Error fetching schedules:', error);
      return stats;
    }

    if (!schedules || schedules.length === 0) {
      console.log('[ProcessSchedules] No schedules due to run');
      return stats;
    }

    console.log(`[ProcessSchedules] Processing ${schedules.length} scheduled reports...`);

    // Process each schedule
    for (const schedule of schedules) {
      stats.processed++;

      try {
        const result = await sendScheduledReportEmail(schedule.id);
        if (result.success) {
          stats.succeeded++;
          console.log(`[ProcessSchedules] ✓ Sent: ${schedule.reports.name}`);
        } else {
          stats.failed++;
          console.error(`[ProcessSchedules] ✗ Failed: ${schedule.reports.name} - ${result.error}`);
        }
      } catch (error) {
        stats.failed++;
        console.error(
          `[ProcessSchedules] ✗ Error processing schedule ${schedule.id}:`,
          error instanceof Error ? error.message : error
        );
      }
    }

    console.log('[ProcessSchedules] Complete:', stats);
    return stats;
  } catch (error) {
    console.error('[ProcessSchedules] Fatal error:', error);
    return stats;
  }
}
