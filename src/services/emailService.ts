/**
 * Email Delivery Service
 *
 * Robust email delivery system for scheduled reports and notifications.
 * Features:
 * - Email validation and sanitization
 * - Retry logic with exponential backoff
 * - Template rendering with variable substitution
 * - Attachment handling (PDF, Excel, CSV)
 * - Rate limiting and error handling
 * - Delivery tracking and logging
 *
 * @module emailService
 * @category Services
 */

import { Resend } from 'resend';
import { emailConfig, TemplateVariables, validateEmailConfig } from '../config/emailConfig';
import { supabase } from './supabaseClient';

// Initialize Resend client
let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    if (!emailConfig.resendApiKey) {
      throw new Error('Resend API key not configured. Set VITE_RESEND_API_KEY in environment variables.');
    }
    resendClient = new Resend(emailConfig.resendApiKey);
  }
  return resendClient;
}

/**
 * Email attachment interface
 */
export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType: string;
  size: number;
}

/**
 * Email send options
 */
export interface SendEmailOptions {
  recipients: string[];
  subject: string;
  body: string;
  attachments?: EmailAttachment[];
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
  tags?: Record<string, string>;
  metadata?: Record<string, string>;
  reportScheduleId?: string;
  exportHistoryId?: string;
}

/**
 * Email send result
 */
export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  deliveryLogId?: string;
  timestamp: string;
}

/**
 * Email delivery status
 */
export enum EmailDeliveryStatus {
  PENDING = 'pending',
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  BOUNCED = 'bounced',
  REJECTED = 'rejected',
}

/**
 * Rate limiter for email sending
 */
class EmailRateLimiter {
  private emailsSentInMinute: number = 0;
  private emailsSentInHour: number = 0;
  private emailsSentInDay: number = 0;
  private lastMinuteReset: number = Date.now();
  private lastHourReset: number = Date.now();
  private lastDayReset: number = Date.now();

  canSend(): boolean {
    this.resetCountersIfNeeded();

    return (
      this.emailsSentInMinute < emailConfig.maxEmailsPerMinute &&
      this.emailsSentInHour < emailConfig.maxEmailsPerHour &&
      this.emailsSentInDay < emailConfig.maxEmailsPerDay
    );
  }

  recordSent(): void {
    this.resetCountersIfNeeded();
    this.emailsSentInMinute++;
    this.emailsSentInHour++;
    this.emailsSentInDay++;
  }

  private resetCountersIfNeeded(): void {
    const now = Date.now();

    if (now - this.lastMinuteReset >= 60000) {
      this.emailsSentInMinute = 0;
      this.lastMinuteReset = now;
    }

    if (now - this.lastHourReset >= 3600000) {
      this.emailsSentInHour = 0;
      this.lastHourReset = now;
    }

    if (now - this.lastDayReset >= 86400000) {
      this.emailsSentInDay = 0;
      this.lastDayReset = now;
    }
  }

  getStatus(): { minute: number; hour: number; day: number } {
    this.resetCountersIfNeeded();
    return {
      minute: this.emailsSentInMinute,
      hour: this.emailsSentInHour,
      day: this.emailsSentInDay,
    };
  }
}

const rateLimiter = new EmailRateLimiter();

/**
 * Validates email addresses
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates multiple email addresses
 */
export function validateEmailList(emails: string[]): { valid: string[]; invalid: string[] } {
  const valid: string[] = [];
  const invalid: string[] = [];

  emails.forEach(email => {
    const trimmed = email.trim();
    if (validateEmail(trimmed)) {
      valid.push(trimmed);
    } else {
      invalid.push(trimmed);
    }
  });

  return { valid, invalid };
}

/**
 * Renders email template with variable substitution
 */
export function renderTemplate(template: string, variables: TemplateVariables): string {
  let rendered = template;

  // Add default variables
  const defaultVars: TemplateVariables = {
    companyName: emailConfig.fromName,
    currentYear: new Date().getFullYear(),
    ...variables,
  };

  // Replace all {{variableName}} patterns
  Object.entries(defaultVars).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    rendered = rendered.replace(regex, String(value ?? ''));
  });

  // Remove any unreplaced variables
  rendered = rendered.replace(/{{[^}]+}}/g, '');

  return rendered;
}

/**
 * Validates email attachments
 */
function validateAttachments(attachments: EmailAttachment[]): void {
  if (attachments.length > emailConfig.maxAttachmentsPerEmail) {
    throw new Error(
      `Too many attachments. Maximum allowed: ${emailConfig.maxAttachmentsPerEmail}, provided: ${attachments.length}`
    );
  }

  attachments.forEach(attachment => {
    if (attachment.size > emailConfig.maxAttachmentSize) {
      throw new Error(
        `Attachment "${attachment.filename}" exceeds maximum size of ${emailConfig.maxAttachmentSize} bytes`
      );
    }

    if (!emailConfig.allowedAttachmentTypes.includes(attachment.contentType)) {
      throw new Error(
        `Attachment type "${attachment.contentType}" is not allowed. Allowed types: ${emailConfig.allowedAttachmentTypes.join(', ')}`
      );
    }
  });
}

/**
 * Logs email delivery to database
 */
async function logEmailDelivery(
  options: SendEmailOptions,
  result: EmailSendResult,
  status: EmailDeliveryStatus
): Promise<string | undefined> {
  try {
    const { data, error } = await supabase
      .from('email_delivery_log')
      .insert({
        recipient: options.recipients.join(', '),
        subject: options.subject,
        status,
        message_id: result.messageId,
        error_message: result.error,
        report_schedule_id: options.reportScheduleId,
        export_history_id: options.exportHistoryId,
        metadata: {
          cc: options.cc,
          bcc: options.bcc,
          attachmentCount: options.attachments?.length || 0,
          tags: options.tags,
          ...options.metadata,
        },
      })
      .select('id')
      .single();

    if (error) {
      console.error('[EmailService] Failed to log email delivery:', error);
      return undefined;
    }

    return data?.id;
  } catch (error) {
    console.error('[EmailService] Error logging email delivery:', error);
    return undefined;
  }
}

/**
 * Sends email with retry logic
 */
async function sendWithRetry(
  options: SendEmailOptions,
  attemptNumber: number = 1
): Promise<EmailSendResult> {
  const client = getResendClient();

  try {
    // Check rate limits
    if (!rateLimiter.canSend()) {
      const status = rateLimiter.getStatus();
      throw new Error(
        `Rate limit exceeded. Emails sent: ${status.minute}/min, ${status.hour}/hour, ${status.day}/day`
      );
    }

    // Prepare attachments for Resend
    const resendAttachments = options.attachments?.map(att => ({
      filename: att.filename,
      content: Buffer.isBuffer(att.content)
        ? att.content
        : Buffer.from(att.content),
    }));

    // Send email via Resend
    const response = await client.emails.send({
      from: `${emailConfig.fromName} <${emailConfig.fromEmail}>`,
      to: options.recipients,
      cc: options.cc,
      bcc: options.bcc,
      subject: options.subject,
      html: options.body,
      replyTo: options.replyTo || emailConfig.replyToEmail,
      attachments: resendAttachments,
      tags: options.tags,
    });

    rateLimiter.recordSent();

    const result: EmailSendResult = {
      success: true,
      messageId: response.id,
      timestamp: new Date().toISOString(),
    };

    // Log successful delivery
    const logId = await logEmailDelivery(options, result, EmailDeliveryStatus.SENT);
    result.deliveryLogId = logId;

    if (emailConfig.enableLogging) {
      console.log('[EmailService] Email sent successfully:', {
        messageId: response.id,
        recipients: options.recipients,
        subject: options.subject,
        attempt: attemptNumber,
      });
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Check if we should retry
    if (attemptNumber < emailConfig.maxRetries) {
      const delay = emailConfig.retryDelayMs * Math.pow(emailConfig.retryBackoffMultiplier, attemptNumber - 1);

      if (emailConfig.enableLogging) {
        console.warn(`[EmailService] Attempt ${attemptNumber} failed, retrying in ${delay}ms...`, errorMessage);
      }

      await new Promise(resolve => setTimeout(resolve, delay));
      return sendWithRetry(options, attemptNumber + 1);
    }

    // Max retries exceeded
    const result: EmailSendResult = {
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    };

    // Log failed delivery
    const logId = await logEmailDelivery(options, result, EmailDeliveryStatus.FAILED);
    result.deliveryLogId = logId;

    if (emailConfig.enableLogging) {
      console.error('[EmailService] Email send failed after all retries:', {
        error: errorMessage,
        recipients: options.recipients,
        attempts: attemptNumber,
      });
    }

    return result;
  }
}

/**
 * Sends a report email with attachments
 */
export async function sendReportEmail(
  recipients: string[],
  subject: string,
  body: string,
  attachments?: EmailAttachment[],
  options?: {
    cc?: string[];
    bcc?: string[];
    replyTo?: string;
    reportScheduleId?: string;
    exportHistoryId?: string;
    tags?: Record<string, string>;
    metadata?: Record<string, string>;
  }
): Promise<EmailSendResult> {
  try {
    // Validate configuration
    validateEmailConfig();

    // Validate recipients
    const { valid: validRecipients, invalid: invalidRecipients } = validateEmailList(recipients);

    if (invalidRecipients.length > 0) {
      throw new Error(`Invalid email addresses: ${invalidRecipients.join(', ')}`);
    }

    if (validRecipients.length === 0) {
      throw new Error('No valid recipients provided');
    }

    // Validate attachments
    if (attachments && attachments.length > 0) {
      validateAttachments(attachments);
    }

    // Test mode: Don't actually send
    if (emailConfig.enableTestMode) {
      const testResult: EmailSendResult = {
        success: true,
        messageId: `test-${Date.now()}`,
        timestamp: new Date().toISOString(),
      };

      console.log('[EmailService] TEST MODE - Email would be sent:', {
        recipients: validRecipients,
        subject,
        attachmentCount: attachments?.length || 0,
      });

      return testResult;
    }

    // Send email with retry logic
    return await sendWithRetry({
      recipients: validRecipients,
      subject,
      body,
      attachments,
      cc: options?.cc,
      bcc: options?.bcc,
      replyTo: options?.replyTo,
      reportScheduleId: options?.reportScheduleId,
      exportHistoryId: options?.exportHistoryId,
      tags: options?.tags,
      metadata: options?.metadata,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[EmailService] Error sending report email:', errorMessage);

    return {
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Sends a templated email
 */
export async function sendTemplatedEmail(
  recipients: string[],
  templateHtml: string,
  subject: string,
  variables: TemplateVariables,
  attachments?: EmailAttachment[],
  options?: {
    cc?: string[];
    bcc?: string[];
    replyTo?: string;
    reportScheduleId?: string;
    exportHistoryId?: string;
    tags?: Record<string, string>;
  }
): Promise<EmailSendResult> {
  const renderedBody = renderTemplate(templateHtml, variables);
  const renderedSubject = renderTemplate(subject, variables);

  return sendReportEmail(recipients, renderedSubject, renderedBody, attachments, options);
}

/**
 * Sends a test email to verify configuration
 */
export async function sendTestEmail(recipient: string): Promise<EmailSendResult> {
  const testBody = `
    <html>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Email Configuration Test</h2>
        <p>This is a test email from Logos Vision CRM.</p>
        <p>If you received this email, your email configuration is working correctly.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          Sent at: ${new Date().toISOString()}<br>
          From: ${emailConfig.fromEmail}<br>
          Configuration: ${emailConfig.enableTestMode ? 'Test Mode' : 'Production'}
        </p>
      </body>
    </html>
  `;

  return sendReportEmail(
    [recipient],
    'Logos Vision CRM - Email Configuration Test',
    testBody,
    undefined,
    {
      tags: { type: 'test' },
    }
  );
}

/**
 * Gets email delivery statistics
 */
export async function getEmailDeliveryStats(
  startDate?: Date,
  endDate?: Date
): Promise<{
  total: number;
  sent: number;
  failed: number;
  pending: number;
  bounced: number;
}> {
  try {
    let query = supabase.from('email_delivery_log').select('status', { count: 'exact' });

    if (startDate) {
      query = query.gte('sent_at', startDate.toISOString());
    }

    if (endDate) {
      query = query.lte('sent_at', endDate.toISOString());
    }

    const { data, error, count } = await query;

    if (error) throw error;

    const stats = {
      total: count || 0,
      sent: 0,
      failed: 0,
      pending: 0,
      bounced: 0,
    };

    if (data) {
      data.forEach(record => {
        if (record.status === EmailDeliveryStatus.SENT || record.status === EmailDeliveryStatus.DELIVERED) {
          stats.sent++;
        } else if (record.status === EmailDeliveryStatus.FAILED || record.status === EmailDeliveryStatus.REJECTED) {
          stats.failed++;
        } else if (record.status === EmailDeliveryStatus.PENDING || record.status === EmailDeliveryStatus.SENDING) {
          stats.pending++;
        } else if (record.status === EmailDeliveryStatus.BOUNCED) {
          stats.bounced++;
        }
      });
    }

    return stats;
  } catch (error) {
    console.error('[EmailService] Error fetching email delivery stats:', error);
    return {
      total: 0,
      sent: 0,
      failed: 0,
      pending: 0,
      bounced: 0,
    };
  }
}

/**
 * Gets rate limiter status
 */
export function getRateLimiterStatus() {
  return {
    ...rateLimiter.getStatus(),
    limits: {
      perMinute: emailConfig.maxEmailsPerMinute,
      perHour: emailConfig.maxEmailsPerHour,
      perDay: emailConfig.maxEmailsPerDay,
    },
  };
}
