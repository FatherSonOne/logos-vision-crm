/**
 * Email Service Configuration
 *
 * Centralized configuration for email delivery system using Resend.
 * Supports scheduled reports, export notifications, and transactional emails.
 *
 * @module emailConfig
 * @category Configuration
 */

export interface EmailConfig {
  // API Configuration
  resendApiKey: string;

  // Sender Configuration
  fromEmail: string;
  fromName: string;
  replyToEmail: string;

  // Rate Limiting
  maxEmailsPerMinute: number;
  maxEmailsPerHour: number;
  maxEmailsPerDay: number;

  // Retry Configuration
  maxRetries: number;
  retryDelayMs: number;
  retryBackoffMultiplier: number;

  // Template Configuration
  defaultTemplateId?: string;
  templatesPath: string;

  // Attachment Limits
  maxAttachmentSize: number; // in bytes
  maxAttachmentsPerEmail: number;
  allowedAttachmentTypes: string[];

  // Delivery Settings
  enableTracking: boolean;
  enableBounceHandling: boolean;
  defaultTimezone: string;

  // Feature Flags
  enableTestMode: boolean;
  enableLogging: boolean;
  enableAnalytics: boolean;
}

/**
 * Default email configuration
 * Uses environment variables with sensible fallbacks
 */
export const emailConfig: EmailConfig = {
  // API Configuration
  resendApiKey: import.meta.env.VITE_RESEND_API_KEY || '',

  // Sender Configuration
  fromEmail: import.meta.env.VITE_EMAIL_FROM || 'reports@logosvision.com',
  fromName: import.meta.env.VITE_EMAIL_FROM_NAME || 'Logos Vision CRM',
  replyToEmail: import.meta.env.VITE_EMAIL_REPLY_TO || 'support@logosvision.com',

  // Rate Limiting (conservative defaults to avoid issues)
  maxEmailsPerMinute: parseInt(import.meta.env.VITE_EMAIL_MAX_PER_MINUTE || '10', 10),
  maxEmailsPerHour: parseInt(import.meta.env.VITE_EMAIL_MAX_PER_HOUR || '100', 10),
  maxEmailsPerDay: parseInt(import.meta.env.VITE_EMAIL_MAX_PER_DAY || '1000', 10),

  // Retry Configuration
  maxRetries: parseInt(import.meta.env.VITE_EMAIL_MAX_RETRIES || '3', 10),
  retryDelayMs: parseInt(import.meta.env.VITE_EMAIL_RETRY_DELAY_MS || '1000', 10),
  retryBackoffMultiplier: parseFloat(import.meta.env.VITE_EMAIL_RETRY_BACKOFF || '2'),

  // Template Configuration
  defaultTemplateId: import.meta.env.VITE_EMAIL_DEFAULT_TEMPLATE_ID,
  templatesPath: '/src/templates/email',

  // Attachment Limits
  maxAttachmentSize: parseInt(import.meta.env.VITE_EMAIL_MAX_ATTACHMENT_SIZE || '10485760', 10), // 10MB default
  maxAttachmentsPerEmail: parseInt(import.meta.env.VITE_EMAIL_MAX_ATTACHMENTS || '5', 10),
  allowedAttachmentTypes: [
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'image/png',
    'image/jpeg',
  ],

  // Delivery Settings
  enableTracking: import.meta.env.VITE_EMAIL_ENABLE_TRACKING !== 'false',
  enableBounceHandling: import.meta.env.VITE_EMAIL_ENABLE_BOUNCE_HANDLING !== 'false',
  defaultTimezone: import.meta.env.VITE_DEFAULT_TIMEZONE || 'America/New_York',

  // Feature Flags
  enableTestMode: import.meta.env.VITE_EMAIL_TEST_MODE === 'true',
  enableLogging: import.meta.env.VITE_EMAIL_ENABLE_LOGGING !== 'false',
  enableAnalytics: import.meta.env.VITE_EMAIL_ENABLE_ANALYTICS !== 'false',
};

/**
 * Email template variable definitions
 * These can be used in email templates with {{variableName}} syntax
 */
export interface TemplateVariables {
  reportName?: string;
  exportDate?: string;
  recordCount?: number;
  dateRange?: string;
  userName?: string;
  userEmail?: string;
  reportUrl?: string;
  unsubscribeUrl?: string;
  companyName?: string;
  companyLogo?: string;
  currentYear?: number;
  customMessage?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Email template presets for common use cases
 */
export const emailTemplatePresets = {
  scheduledReport: {
    subject: 'Scheduled Report: {{reportName}} - {{exportDate}}',
    previewText: 'Your {{reportName}} report is ready to view',
  },
  exportComplete: {
    subject: 'Export Complete: {{reportName}}',
    previewText: 'Your export of {{recordCount}} records is ready',
  },
  reportAlert: {
    subject: 'Report Alert: {{reportName}} - Threshold Exceeded',
    previewText: 'A KPI threshold has been exceeded in {{reportName}}',
  },
  sharingNotification: {
    subject: '{{userName}} shared a report with you',
    previewText: '{{userName}} has shared {{reportName}} with you',
  },
  errorNotification: {
    subject: 'Report Generation Error: {{reportName}}',
    previewText: 'There was an error generating your scheduled report',
  },
};

/**
 * Validates email configuration on app startup
 * Throws error if critical configuration is missing
 */
export function validateEmailConfig(): void {
  const errors: string[] = [];

  if (!emailConfig.resendApiKey) {
    errors.push('VITE_RESEND_API_KEY is not configured');
  }

  if (!emailConfig.fromEmail) {
    errors.push('VITE_EMAIL_FROM is not configured');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailConfig.fromEmail && !emailRegex.test(emailConfig.fromEmail)) {
    errors.push('VITE_EMAIL_FROM is not a valid email address');
  }

  if (emailConfig.replyToEmail && !emailRegex.test(emailConfig.replyToEmail)) {
    errors.push('VITE_EMAIL_REPLY_TO is not a valid email address');
  }

  // Validate rate limits
  if (emailConfig.maxEmailsPerMinute <= 0) {
    errors.push('maxEmailsPerMinute must be greater than 0');
  }

  if (emailConfig.maxRetries < 0) {
    errors.push('maxRetries cannot be negative');
  }

  if (errors.length > 0) {
    throw new Error(
      `Email configuration validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}`
    );
  }

  if (emailConfig.enableLogging) {
    console.log('[EmailConfig] Email service configured successfully', {
      fromEmail: emailConfig.fromEmail,
      testMode: emailConfig.enableTestMode,
      maxRetries: emailConfig.maxRetries,
    });
  }
}

/**
 * Gets email configuration with runtime overrides
 */
export function getEmailConfig(overrides?: Partial<EmailConfig>): EmailConfig {
  return {
    ...emailConfig,
    ...overrides,
  };
}
