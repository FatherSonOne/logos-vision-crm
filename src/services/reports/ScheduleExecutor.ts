/**
 * Schedule Executor Utility
 * Handles calculation of next run dates, timezone conversions, and validation for report schedules
 */

import type { ReportSchedule, ScheduleType } from '../reportService';

// ============================================
// TIMEZONE UTILITIES
// ============================================

/**
 * Get list of common timezones
 */
export function getTimezones(): Array<{ value: string; label: string; offset: string }> {
  return [
    { value: 'America/New_York', label: 'Eastern Time (ET)', offset: 'UTC-5/-4' },
    { value: 'America/Chicago', label: 'Central Time (CT)', offset: 'UTC-6/-5' },
    { value: 'America/Denver', label: 'Mountain Time (MT)', offset: 'UTC-7/-6' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', offset: 'UTC-8/-7' },
    { value: 'America/Phoenix', label: 'Arizona (AZ)', offset: 'UTC-7' },
    { value: 'America/Anchorage', label: 'Alaska (AK)', offset: 'UTC-9/-8' },
    { value: 'Pacific/Honolulu', label: 'Hawaii (HI)', offset: 'UTC-10' },
    { value: 'Europe/London', label: 'London (GMT/BST)', offset: 'UTC+0/+1' },
    { value: 'Europe/Paris', label: 'Paris (CET/CEST)', offset: 'UTC+1/+2' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: 'UTC+9' },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)', offset: 'UTC+8' },
    { value: 'Asia/Dubai', label: 'Dubai (GST)', offset: 'UTC+4' },
    { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)', offset: 'UTC+10/+11' },
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)', offset: 'UTC+0' },
  ];
}

/**
 * Convert a date/time from one timezone to another
 */
export function convertTimezone(date: Date, fromTimezone: string, toTimezone: string): Date {
  // Use Intl.DateTimeFormat for timezone conversion
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: fromTimezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const dateObj: Record<string, string> = {};
  parts.forEach(part => {
    if (part.type !== 'literal') {
      dateObj[part.type] = part.value;
    }
  });

  // Create a date string in the source timezone
  const isoString = `${dateObj.year}-${dateObj.month}-${dateObj.day}T${dateObj.hour}:${dateObj.minute}:${dateObj.second}`;

  // Parse in target timezone
  const targetFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: toTimezone,
  });

  return new Date(isoString);
}

/**
 * Get current date/time in a specific timezone
 */
export function getCurrentTimeInTimezone(timezone: string): Date {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const dateObj: Record<string, string> = {};
  parts.forEach(part => {
    if (part.type !== 'literal') {
      dateObj[part.type] = part.value;
    }
  });

  return new Date(`${dateObj.year}-${dateObj.month}-${dateObj.day}T${dateObj.hour}:${dateObj.minute}:${dateObj.second}`);
}

// ============================================
// DATE CALCULATION UTILITIES
// ============================================

/**
 * Calculate the next run date for a schedule
 */
export function calculateNextRun(schedule: Partial<ReportSchedule>, fromDate?: Date): Date {
  const baseDate = fromDate || new Date();
  const scheduleTime = schedule.scheduleTime || '08:00:00';
  const [hours, minutes, seconds] = scheduleTime.split(':').map(Number);

  switch (schedule.scheduleType) {
    case 'once': {
      // For one-time schedules, use the scheduled_date
      if (!schedule.scheduledDate) {
        throw new Error('scheduled_date is required for one-time schedules');
      }
      const scheduledDate = new Date(schedule.scheduledDate);
      scheduledDate.setHours(hours, minutes, seconds || 0, 0);
      return scheduledDate;
    }

    case 'daily': {
      // Run every day at the specified time
      const nextRun = new Date(baseDate);
      nextRun.setHours(hours, minutes, seconds || 0, 0);

      // If the time has already passed today, schedule for tomorrow
      if (nextRun <= baseDate) {
        nextRun.setDate(nextRun.getDate() + 1);
      }

      return nextRun;
    }

    case 'weekly': {
      // Run every week on the specified day
      if (schedule.scheduleDayOfWeek === null || schedule.scheduleDayOfWeek === undefined) {
        throw new Error('schedule_day_of_week is required for weekly schedules');
      }

      const nextRun = new Date(baseDate);
      nextRun.setHours(hours, minutes, seconds || 0, 0);

      const currentDay = nextRun.getDay();
      const targetDay = schedule.scheduleDayOfWeek;

      let daysUntilTarget = targetDay - currentDay;

      // If target day is today but time has passed, or target day is in the past this week
      if (daysUntilTarget < 0 || (daysUntilTarget === 0 && nextRun <= baseDate)) {
        daysUntilTarget += 7;
      }

      nextRun.setDate(nextRun.getDate() + daysUntilTarget);
      return nextRun;
    }

    case 'monthly': {
      // Run every month on the specified day
      if (schedule.scheduleDayOfMonth === null || schedule.scheduleDayOfMonth === undefined) {
        throw new Error('schedule_day_of_month is required for monthly schedules');
      }

      const nextRun = new Date(baseDate);
      nextRun.setHours(hours, minutes, seconds || 0, 0);

      // Set to the target day of the current month
      nextRun.setDate(schedule.scheduleDayOfMonth);

      // If the date has already passed this month, move to next month
      if (nextRun <= baseDate) {
        nextRun.setMonth(nextRun.getMonth() + 1);
        nextRun.setDate(schedule.scheduleDayOfMonth);
      }

      // Handle months with fewer days (e.g., Feb 30 -> Feb 28/29)
      if (nextRun.getDate() !== schedule.scheduleDayOfMonth) {
        nextRun.setDate(0); // Set to last day of previous month
      }

      return nextRun;
    }

    case 'quarterly': {
      // Run every quarter (every 3 months)
      if (schedule.scheduleDayOfMonth === null || schedule.scheduleDayOfMonth === undefined) {
        throw new Error('schedule_day_of_month is required for quarterly schedules');
      }

      const nextRun = new Date(baseDate);
      nextRun.setHours(hours, minutes, seconds || 0, 0);

      // Determine the current quarter (0, 3, 6, 9)
      const currentMonth = nextRun.getMonth();
      const quarterStartMonth = Math.floor(currentMonth / 3) * 3;

      // Set to the first month of the current quarter
      nextRun.setMonth(quarterStartMonth);
      nextRun.setDate(schedule.scheduleDayOfMonth);

      // If the date has already passed, move to next quarter
      if (nextRun <= baseDate) {
        nextRun.setMonth(quarterStartMonth + 3);
        nextRun.setDate(schedule.scheduleDayOfMonth);
      }

      // Handle months with fewer days
      if (nextRun.getDate() !== schedule.scheduleDayOfMonth) {
        nextRun.setDate(0);
      }

      return nextRun;
    }

    case 'annually': {
      // Run once a year on the specified month and day
      if (schedule.scheduleMonth === null || schedule.scheduleMonth === undefined) {
        throw new Error('schedule_month is required for annual schedules');
      }
      if (schedule.scheduleDayOfMonth === null || schedule.scheduleDayOfMonth === undefined) {
        throw new Error('schedule_day_of_month is required for annual schedules');
      }

      const nextRun = new Date(baseDate);
      nextRun.setHours(hours, minutes, seconds || 0, 0);

      // Set to the target month and day of the current year
      nextRun.setMonth(schedule.scheduleMonth - 1); // Month is 0-indexed
      nextRun.setDate(schedule.scheduleDayOfMonth);

      // If the date has already passed this year, move to next year
      if (nextRun <= baseDate) {
        nextRun.setFullYear(nextRun.getFullYear() + 1);
        nextRun.setMonth(schedule.scheduleMonth - 1);
        nextRun.setDate(schedule.scheduleDayOfMonth);
      }

      // Handle invalid dates (e.g., Feb 30)
      if (nextRun.getDate() !== schedule.scheduleDayOfMonth) {
        nextRun.setDate(0);
      }

      return nextRun;
    }

    default:
      throw new Error(`Unsupported schedule type: ${schedule.scheduleType}`);
  }
}

/**
 * Calculate next run in the schedule's timezone and convert to UTC
 */
export function calculateNextRunUTC(schedule: Partial<ReportSchedule>, fromDate?: Date): Date {
  const timezone = schedule.timezone || 'America/New_York';

  // Calculate next run in the schedule's timezone
  const nextRunLocal = calculateNextRun(schedule, fromDate);

  // Convert to UTC for storage
  // This is a simplified conversion - in production, use a library like date-fns-tz or Luxon
  const localTime = nextRunLocal.toLocaleString('en-US', { timeZone: timezone });
  const utcTime = new Date(localTime + ' UTC');

  return utcTime;
}

// ============================================
// VALIDATION UTILITIES
// ============================================

/**
 * Validate a schedule configuration
 */
export function validateSchedule(schedule: Partial<ReportSchedule>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Required fields
  if (!schedule.reportId) {
    errors.push('Report ID is required');
  }

  if (!schedule.scheduleType) {
    errors.push('Schedule type is required');
  }

  if (!schedule.scheduleTime) {
    errors.push('Schedule time is required');
  } else {
    // Validate time format (HH:MM:SS or HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    if (!timeRegex.test(schedule.scheduleTime)) {
      errors.push('Invalid time format. Use HH:MM or HH:MM:SS');
    }
  }

  // Type-specific validations
  switch (schedule.scheduleType) {
    case 'once':
      if (!schedule.scheduledDate) {
        errors.push('Scheduled date is required for one-time schedules');
      } else {
        const scheduleDate = new Date(schedule.scheduledDate);
        if (isNaN(scheduleDate.getTime())) {
          errors.push('Invalid scheduled date');
        } else if (scheduleDate < new Date()) {
          errors.push('Scheduled date must be in the future');
        }
      }
      break;

    case 'weekly':
      if (schedule.scheduleDayOfWeek === null || schedule.scheduleDayOfWeek === undefined) {
        errors.push('Day of week is required for weekly schedules');
      } else if (schedule.scheduleDayOfWeek < 0 || schedule.scheduleDayOfWeek > 6) {
        errors.push('Day of week must be between 0 (Sunday) and 6 (Saturday)');
      }
      break;

    case 'monthly':
      if (schedule.scheduleDayOfMonth === null || schedule.scheduleDayOfMonth === undefined) {
        errors.push('Day of month is required for monthly schedules');
      } else if (schedule.scheduleDayOfMonth < 1 || schedule.scheduleDayOfMonth > 31) {
        errors.push('Day of month must be between 1 and 31');
      }
      break;

    case 'quarterly':
      if (schedule.scheduleDayOfMonth === null || schedule.scheduleDayOfMonth === undefined) {
        errors.push('Day of month is required for quarterly schedules');
      } else if (schedule.scheduleDayOfMonth < 1 || schedule.scheduleDayOfMonth > 31) {
        errors.push('Day of month must be between 1 and 31');
      }
      break;

    case 'annually':
      if (schedule.scheduleMonth === null || schedule.scheduleMonth === undefined) {
        errors.push('Month is required for annual schedules');
      } else if (schedule.scheduleMonth < 1 || schedule.scheduleMonth > 12) {
        errors.push('Month must be between 1 (January) and 12 (December)');
      }

      if (schedule.scheduleDayOfMonth === null || schedule.scheduleDayOfMonth === undefined) {
        errors.push('Day of month is required for annual schedules');
      } else if (schedule.scheduleDayOfMonth < 1 || schedule.scheduleDayOfMonth > 31) {
        errors.push('Day of month must be between 1 and 31');
      }
      break;

    case 'daily':
      // No additional validation needed
      break;

    default:
      if (schedule.scheduleType) {
        errors.push(`Invalid schedule type: ${schedule.scheduleType}`);
      }
  }

  // Delivery configuration
  if (schedule.deliveryMethod === 'email') {
    if (!schedule.recipients || schedule.recipients.length === 0) {
      errors.push('At least one recipient email is required for email delivery');
    } else {
      // Validate email addresses
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = schedule.recipients.filter(email => !emailRegex.test(email));
      if (invalidEmails.length > 0) {
        errors.push(`Invalid email addresses: ${invalidEmails.join(', ')}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================
// FORMATTING UTILITIES
// ============================================

/**
 * Format a date for display
 */
export function formatDate(date: Date | string, timezone?: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (timezone) {
    return d.toLocaleString('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format schedule description for display
 */
export function formatScheduleDescription(schedule: Partial<ReportSchedule>): string {
  const time = schedule.scheduleTime || '08:00:00';
  const [hours, minutes] = time.split(':');
  const displayTime = new Date(2000, 0, 1, parseInt(hours), parseInt(minutes)).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  switch (schedule.scheduleType) {
    case 'once':
      return `Once on ${formatDate(schedule.scheduledDate || new Date())} at ${displayTime}`;

    case 'daily':
      return `Daily at ${displayTime}`;

    case 'weekly': {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = days[schedule.scheduleDayOfWeek || 0];
      return `Weekly on ${dayName} at ${displayTime}`;
    }

    case 'monthly':
      return `Monthly on day ${schedule.scheduleDayOfMonth} at ${displayTime}`;

    case 'quarterly':
      return `Quarterly on day ${schedule.scheduleDayOfMonth} at ${displayTime}`;

    case 'annually': {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthName = months[(schedule.scheduleMonth || 1) - 1];
      return `Annually on ${monthName} ${schedule.scheduleDayOfMonth} at ${displayTime}`;
    }

    default:
      return 'Invalid schedule';
  }
}

/**
 * Get day of week options
 */
export function getDaysOfWeek(): Array<{ value: number; label: string; short: string }> {
  return [
    { value: 0, label: 'Sunday', short: 'Sun' },
    { value: 1, label: 'Monday', short: 'Mon' },
    { value: 2, label: 'Tuesday', short: 'Tue' },
    { value: 3, label: 'Wednesday', short: 'Wed' },
    { value: 4, label: 'Thursday', short: 'Thu' },
    { value: 5, label: 'Friday', short: 'Fri' },
    { value: 6, label: 'Saturday', short: 'Sat' },
  ];
}

/**
 * Get month options
 */
export function getMonths(): Array<{ value: number; label: string; short: string }> {
  return [
    { value: 1, label: 'January', short: 'Jan' },
    { value: 2, label: 'February', short: 'Feb' },
    { value: 3, label: 'March', short: 'Mar' },
    { value: 4, label: 'April', short: 'Apr' },
    { value: 5, label: 'May', short: 'May' },
    { value: 6, label: 'June', short: 'Jun' },
    { value: 7, label: 'July', short: 'Jul' },
    { value: 8, label: 'August', short: 'Aug' },
    { value: 9, label: 'September', short: 'Sep' },
    { value: 10, label: 'October', short: 'Oct' },
    { value: 11, label: 'November', short: 'Nov' },
    { value: 12, label: 'December', short: 'Dec' },
  ];
}

/**
 * Parse email recipients from comma-separated string
 */
export function parseRecipients(input: string): string[] {
  return input
    .split(',')
    .map(email => email.trim())
    .filter(email => email.length > 0);
}

/**
 * Get email template variables
 */
export function getEmailTemplateVariables(): Array<{ variable: string; description: string }> {
  return [
    { variable: '{{report_name}}', description: 'Name of the report' },
    { variable: '{{date}}', description: 'Current date' },
    { variable: '{{time}}', description: 'Current time' },
    { variable: '{{format}}', description: 'Export format (PDF, Excel, CSV)' },
    { variable: '{{row_count}}', description: 'Number of rows in the report' },
    { variable: '{{generated_by}}', description: 'User who created the schedule' },
  ];
}

/**
 * Replace template variables in email content
 */
export function replaceTemplateVariables(
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
