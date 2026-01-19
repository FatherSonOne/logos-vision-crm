// Scheduled Report Execution - Edge Function
// Runs every 15 minutes via pg_cron to execute due report schedules

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================
// TYPES
// ============================================

interface ReportSchedule {
  id: string;
  report_id: string;
  is_active: boolean;
  schedule_type: string;
  schedule_time: string;
  schedule_day_of_week: number | null;
  schedule_day_of_month: number | null;
  schedule_month: number | null;
  timezone: string;
  scheduled_date: string | null;
  delivery_method: string;
  recipients: string[];
  export_format: string;
  include_filters: boolean;
  include_timestamp: boolean;
  email_subject: string | null;
  email_body: string | null;
  last_run_at: string | null;
  next_run_at: string | null;
  run_count: number;
  last_status: string | null;
  last_error: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface Report {
  id: string;
  name: string;
  description: string | null;
  report_type: string;
  category: string | null;
  data_source: any;
  visualization_type: string;
  filters: any;
  available_filters: any;
  columns: string[];
  sort_by: string | null;
  sort_direction: string;
  layout: any;
}

interface ExecutionResult {
  scheduleId: string;
  reportName: string;
  success: boolean;
  error?: string;
  rowCount?: number;
  filePath?: string;
  executionTimeMs: number;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate next run time for a schedule
 */
function calculateNextRun(schedule: ReportSchedule): Date {
  const baseDate = new Date();
  const [hours, minutes, seconds] = (schedule.schedule_time || '08:00:00').split(':').map(Number);

  switch (schedule.schedule_type) {
    case 'once': {
      // One-time schedules should be deactivated after execution
      return new Date(schedule.scheduled_date || baseDate);
    }

    case 'daily': {
      const nextRun = new Date(baseDate);
      nextRun.setHours(hours, minutes, seconds || 0, 0);

      if (nextRun <= baseDate) {
        nextRun.setDate(nextRun.getDate() + 1);
      }

      return nextRun;
    }

    case 'weekly': {
      const nextRun = new Date(baseDate);
      nextRun.setHours(hours, minutes, seconds || 0, 0);

      const currentDay = nextRun.getDay();
      const targetDay = schedule.schedule_day_of_week || 0;

      let daysUntilTarget = targetDay - currentDay;
      if (daysUntilTarget < 0 || (daysUntilTarget === 0 && nextRun <= baseDate)) {
        daysUntilTarget += 7;
      }

      nextRun.setDate(nextRun.getDate() + daysUntilTarget);
      return nextRun;
    }

    case 'monthly': {
      const nextRun = new Date(baseDate);
      nextRun.setHours(hours, minutes, seconds || 0, 0);
      nextRun.setDate(schedule.schedule_day_of_month || 1);

      if (nextRun <= baseDate) {
        nextRun.setMonth(nextRun.getMonth() + 1);
        nextRun.setDate(schedule.schedule_day_of_month || 1);
      }

      return nextRun;
    }

    case 'quarterly': {
      const nextRun = new Date(baseDate);
      nextRun.setHours(hours, minutes, seconds || 0, 0);

      const currentMonth = nextRun.getMonth();
      const quarterStartMonth = Math.floor(currentMonth / 3) * 3;

      nextRun.setMonth(quarterStartMonth);
      nextRun.setDate(schedule.schedule_day_of_month || 1);

      if (nextRun <= baseDate) {
        nextRun.setMonth(quarterStartMonth + 3);
        nextRun.setDate(schedule.schedule_day_of_month || 1);
      }

      return nextRun;
    }

    case 'annually': {
      const nextRun = new Date(baseDate);
      nextRun.setHours(hours, minutes, seconds || 0, 0);
      nextRun.setMonth((schedule.schedule_month || 1) - 1);
      nextRun.setDate(schedule.schedule_day_of_month || 1);

      if (nextRun <= baseDate) {
        nextRun.setFullYear(nextRun.getFullYear() + 1);
        nextRun.setMonth((schedule.schedule_month || 1) - 1);
        nextRun.setDate(schedule.schedule_day_of_month || 1);
      }

      return nextRun;
    }

    default:
      throw new Error(`Unsupported schedule type: ${schedule.schedule_type}`);
  }
}

/**
 * Replace template variables in email content
 */
function replaceTemplateVariables(
  template: string,
  variables: Record<string, string | number>
): string {
  let result = template;

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, String(value));
  }

  return result;
}

/**
 * Fetch report data from database
 */
async function fetchReportData(supabase: any, report: Report): Promise<any[]> {
  const dataSource = report.data_source;
  const tableName = dataSource.table || dataSource.view;

  if (!tableName) {
    throw new Error('No data source specified in report');
  }

  let query = supabase.from(tableName).select('*');

  // Apply filters
  const filters = report.filters || {};
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'object' && 'start' in value && 'end' in value) {
        if (value.start) query = query.gte(key, value.start);
        if (value.end) query = query.lte(key, value.end);
      } else if (Array.isArray(value)) {
        query = query.in(key, value);
      } else {
        query = query.eq(key, value);
      }
    }
  }

  // Apply sorting
  if (report.sort_by) {
    query = query.order(report.sort_by, { ascending: report.sort_direction === 'asc' });
  }

  // Limit to prevent memory issues
  query = query.limit(10000);

  const { data, error } = await query;
  if (error) throw error;

  return data || [];
}

/**
 * Generate export file based on format
 */
async function generateExport(
  format: string,
  reportData: any[],
  reportName: string
): Promise<{ content: Uint8Array; mimeType: string; extension: string }> {
  switch (format.toLowerCase()) {
    case 'csv': {
      // Generate CSV
      if (reportData.length === 0) {
        return {
          content: new TextEncoder().encode('No data available'),
          mimeType: 'text/csv',
          extension: 'csv'
        };
      }

      const headers = Object.keys(reportData[0]);
      const csvRows = [
        headers.join(','),
        ...reportData.map(row =>
          headers.map(header => {
            const value = row[header];
            // Escape commas and quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ];

      return {
        content: new TextEncoder().encode(csvRows.join('\n')),
        mimeType: 'text/csv',
        extension: 'csv'
      };
    }

    case 'json': {
      // Generate JSON
      return {
        content: new TextEncoder().encode(JSON.stringify(reportData, null, 2)),
        mimeType: 'application/json',
        extension: 'json'
      };
    }

    case 'excel':
    case 'pdf':
    case 'png': {
      // These formats require additional libraries
      // For now, return CSV as fallback
      console.warn(`Format ${format} not yet implemented, falling back to CSV`);
      return generateExport('csv', reportData, reportName);
    }

    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

/**
 * Upload export to Supabase Storage
 */
async function uploadToStorage(
  supabase: any,
  fileName: string,
  content: Uint8Array,
  mimeType: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from('report-exports')
    .upload(fileName, content, {
      contentType: mimeType,
      upsert: true,
    });

  if (error) throw error;

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from('report-exports')
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}

/**
 * Send email with report attachment
 */
async function sendEmail(
  supabase: any,
  recipients: string[],
  subject: string,
  body: string,
  attachmentUrl: string,
  reportName: string
): Promise<void> {
  // TODO: Implement email sending using Resend or similar service
  // For now, just log
  console.log('Email would be sent to:', recipients);
  console.log('Subject:', subject);
  console.log('Body:', body);
  console.log('Attachment URL:', attachmentUrl);

  // In production, integrate with email service:
  /*
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY not configured");
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'reports@yourcompany.com',
      to: recipients,
      subject: subject,
      html: `${body}<br><br><a href="${attachmentUrl}">Download Report</a>`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Email sending failed: ${await response.text()}`);
  }
  */
}

/**
 * Execute a single scheduled report
 */
async function executeSchedule(
  supabase: any,
  schedule: ReportSchedule
): Promise<ExecutionResult> {
  const startTime = Date.now();

  try {
    console.log(`Executing schedule ${schedule.id} for report ${schedule.report_id}`);

    // Fetch report configuration
    const { data: reportData, error: reportError } = await supabase
      .from('reports')
      .select('*')
      .eq('id', schedule.report_id)
      .single();

    if (reportError || !reportData) {
      throw new Error(`Report not found: ${schedule.report_id}`);
    }

    const report: Report = reportData;

    // Fetch report data
    const data = await fetchReportData(supabase, report);

    // Generate export
    const exportFormat = schedule.export_format || 'csv';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${report.name.replace(/[^a-z0-9]/gi, '_')}_${timestamp}.${exportFormat}`;

    const { content, mimeType } = await generateExport(
      exportFormat,
      data,
      report.name
    );

    // Upload to storage
    const filePath = await uploadToStorage(supabase, fileName, content, mimeType);

    // Send email if configured
    if (schedule.delivery_method === 'email' && schedule.recipients.length > 0) {
      const variables = {
        report_name: report.name,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        format: exportFormat.toUpperCase(),
        row_count: data.length,
        generated_by: 'Automated System',
      };

      const subject = replaceTemplateVariables(
        schedule.email_subject || `Scheduled Report: {{report_name}}`,
        variables
      );

      const body = replaceTemplateVariables(
        schedule.email_body || `Your scheduled report is ready. Report contains {{row_count}} rows.`,
        variables
      );

      await sendEmail(
        supabase,
        schedule.recipients,
        subject,
        body,
        filePath,
        report.name
      );
    }

    const executionTime = Date.now() - startTime;

    // Log export to history
    await supabase.from('report_export_history').insert({
      report_id: schedule.report_id,
      schedule_id: schedule.id,
      export_format: exportFormat,
      row_count: data.length,
      execution_time_ms: executionTime,
      file_size_bytes: content.length,
      file_path: filePath,
      success: true,
      exported_at: new Date().toISOString(),
    });

    // Update schedule
    const nextRun = calculateNextRun(schedule);
    await supabase
      .from('report_schedules')
      .update({
        last_run_at: new Date().toISOString(),
        next_run_at: schedule.schedule_type === 'once' ? null : nextRun.toISOString(),
        run_count: (schedule.run_count || 0) + 1,
        last_status: 'success',
        last_error: null,
        is_active: schedule.schedule_type === 'once' ? false : schedule.is_active,
      })
      .eq('id', schedule.id);

    return {
      scheduleId: schedule.id,
      reportName: report.name,
      success: true,
      rowCount: data.length,
      filePath,
      executionTimeMs: executionTime,
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    const errorMessage = error.message || 'Unknown error';

    console.error(`Error executing schedule ${schedule.id}:`, error);

    // Log failed export
    await supabase.from('report_export_history').insert({
      report_id: schedule.report_id,
      schedule_id: schedule.id,
      export_format: schedule.export_format,
      row_count: 0,
      execution_time_ms: executionTime,
      success: false,
      error_message: errorMessage,
      exported_at: new Date().toISOString(),
    });

    // Update schedule with error
    const nextRun = calculateNextRun(schedule);
    await supabase
      .from('report_schedules')
      .update({
        last_run_at: new Date().toISOString(),
        next_run_at: nextRun.toISOString(),
        run_count: (schedule.run_count || 0) + 1,
        last_status: 'error',
        last_error: errorMessage,
      })
      .eq('id', schedule.id);

    return {
      scheduleId: schedule.id,
      reportName: 'Unknown',
      success: false,
      error: errorMessage,
      executionTimeMs: executionTime,
    };
  }
}

// ============================================
// MAIN HANDLER
// ============================================

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log('Starting scheduled report execution...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all active schedules that are due to run
    const now = new Date().toISOString();
    const { data: dueSchedules, error: fetchError } = await supabase
      .from("report_schedules")
      .select("*")
      .eq("is_active", true)
      .lte("next_run_at", now)
      .order("next_run_at", { ascending: true });

    if (fetchError) {
      throw new Error(`Failed to fetch schedules: ${fetchError.message}`);
    }

    if (!dueSchedules || dueSchedules.length === 0) {
      console.log('No schedules due for execution');
      return new Response(
        JSON.stringify({
          success: true,
          processed: 0,
          successCount: 0,
          errorCount: 0,
          message: "No schedules due for execution",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log(`Found ${dueSchedules.length} schedules due for execution`);

    // Execute each schedule (with rate limiting)
    const results: ExecutionResult[] = [];
    let successCount = 0;
    let errorCount = 0;

    for (const schedule of dueSchedules) {
      // Add small delay to prevent rate limiting (100ms between executions)
      if (results.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const result = await executeSchedule(supabase, schedule);
      results.push(result);

      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }
    }

    console.log(`Execution complete: ${successCount} succeeded, ${errorCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: dueSchedules.length,
        successCount,
        errorCount,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Scheduled report execution error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
