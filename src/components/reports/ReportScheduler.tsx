import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Calendar, Clock, Mail, Download, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { reportService, type ReportSchedule, type ScheduleType, type ExportFormat } from '../../services/reportService';
import {
  calculateNextRun,
  validateSchedule,
  formatScheduleDescription,
  getTimezones,
  getDaysOfWeek,
  getMonths,
  parseRecipients,
  getEmailTemplateVariables,
  formatDate,
} from '../../services/reports/ScheduleExecutor';

interface ReportSchedulerProps {
  reportId: string;
  reportName: string;
  open: boolean;
  onClose: () => void;
  onScheduleCreated?: (schedule: ReportSchedule) => void;
  existingSchedule?: ReportSchedule;
}

export default function ReportScheduler({
  reportId,
  reportName,
  open,
  onClose,
  onScheduleCreated,
  existingSchedule,
}: ReportSchedulerProps) {
  // Form state
  const [scheduleType, setScheduleType] = useState<ScheduleType>('daily');
  const [scheduleTime, setScheduleTime] = useState('08:00');
  const [scheduleDayOfWeek, setScheduleDayOfWeek] = useState<number | null>(null);
  const [scheduleDayOfMonth, setScheduleDayOfMonth] = useState<number | null>(1);
  const [scheduleMonth, setScheduleMonth] = useState<number | null>(1);
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [timezone, setTimezone] = useState('America/New_York');
  const [deliveryMethod, setDeliveryMethod] = useState<'email' | 'download'>('email');
  const [recipients, setRecipients] = useState('');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf');
  const [includeFilters, setIncludeFilters] = useState(true);
  const [includeTimestamp, setIncludeTimestamp] = useState(true);
  const [emailSubject, setEmailSubject] = useState(`Scheduled Report: ${reportName}`);
  const [emailBody, setEmailBody] = useState('Your scheduled report is ready. Report contains {{row_count}} rows.');
  const [isActive, setIsActive] = useState(true);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [scheduleHistory, setScheduleHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showTemplateVariables, setShowTemplateVariables] = useState(false);

  // Load existing schedule if editing
  useEffect(() => {
    if (existingSchedule && open) {
      setScheduleType(existingSchedule.scheduleType);
      setScheduleTime(existingSchedule.scheduleTime.substring(0, 5)); // HH:MM format
      setScheduleDayOfWeek(existingSchedule.scheduleDayOfWeek);
      setScheduleDayOfMonth(existingSchedule.scheduleDayOfMonth);
      setScheduleMonth(existingSchedule.scheduleMonth);
      setScheduledDate(existingSchedule.scheduledDate || '');
      setTimezone(existingSchedule.timezone);
      setDeliveryMethod(existingSchedule.deliveryMethod as 'email' | 'download');
      setRecipients(existingSchedule.recipients.join(', '));
      setExportFormat(existingSchedule.exportFormat);
      setIncludeFilters(existingSchedule.includeFilters);
      setIncludeTimestamp(existingSchedule.includeTimestamp);
      setEmailSubject(existingSchedule.emailSubject || `Scheduled Report: ${reportName}`);
      setEmailBody(existingSchedule.emailBody || 'Your scheduled report is ready.');
      setIsActive(existingSchedule.isActive);

      // Load history
      loadScheduleHistory(existingSchedule.id);
    }
  }, [existingSchedule, open, reportName]);

  // Load schedule history
  const loadScheduleHistory = async (scheduleId: string) => {
    try {
      const history = await reportService.getScheduleHistory(scheduleId, 10);
      setScheduleHistory(history);
    } catch (err) {
      console.error('Failed to load schedule history:', err);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const schedule: Partial<ReportSchedule> = {
      reportId,
      scheduleType,
      scheduleTime: scheduleTime + ':00',
      scheduleDayOfWeek,
      scheduleDayOfMonth,
      scheduleMonth,
      scheduledDate,
      timezone,
      deliveryMethod,
      recipients: parseRecipients(recipients),
      exportFormat,
    };

    const validation = validateSchedule(schedule);
    setValidationErrors(validation.errors);
    return validation.valid;
  };

  // Calculate next run preview
  const getNextRunPreview = (): string => {
    try {
      const schedule: Partial<ReportSchedule> = {
        scheduleType,
        scheduleTime: scheduleTime + ':00',
        scheduleDayOfWeek,
        scheduleDayOfMonth,
        scheduleMonth,
        scheduledDate,
        timezone,
      } as any;

      const nextRun = calculateNextRun(schedule);
      return formatDate(nextRun, timezone);
    } catch (err) {
      return 'Invalid configuration';
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const scheduleData: Partial<ReportSchedule> = {
        reportId,
        isActive,
        scheduleType,
        scheduleTime: scheduleTime + ':00',
        scheduleDayOfWeek,
        scheduleDayOfMonth,
        scheduleMonth,
        timezone,
        scheduledDate: scheduledDate || null,
        deliveryMethod,
        recipients: parseRecipients(recipients),
        exportFormat,
        includeFilters,
        includeTimestamp,
        emailSubject,
        emailBody,
      };

      let schedule: ReportSchedule;

      if (existingSchedule) {
        schedule = await reportService.updateSchedule(existingSchedule.id, scheduleData);
      } else {
        schedule = await reportService.createSchedule(scheduleData);
      }

      onScheduleCreated?.(schedule);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save schedule');
    } finally {
      setLoading(false);
    }
  };

  // Render schedule-specific fields
  const renderScheduleFields = () => {
    switch (scheduleType) {
      case 'once':
        return (
          <div className="space-y-2">
            <Label htmlFor="scheduled-date">Date</Label>
            <Input
              id="scheduled-date"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        );

      case 'weekly':
        return (
          <div className="space-y-2">
            <Label htmlFor="day-of-week">Day of Week</Label>
            <Select
              value={scheduleDayOfWeek?.toString()}
              onValueChange={(value) => setScheduleDayOfWeek(parseInt(value))}
            >
              <SelectTrigger id="day-of-week">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {getDaysOfWeek().map((day) => (
                  <SelectItem key={day.value} value={day.value.toString()}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'monthly':
        return (
          <div className="space-y-2">
            <Label htmlFor="day-of-month">Day of Month</Label>
            <Select
              value={scheduleDayOfMonth?.toString()}
              onValueChange={(value) => setScheduleDayOfMonth(parseInt(value))}
            >
              <SelectTrigger id="day-of-month">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <SelectItem key={day} value={day.toString()}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'quarterly':
        return (
          <div className="space-y-2">
            <Label htmlFor="day-of-month-quarterly">Day of Quarter</Label>
            <Select
              value={scheduleDayOfMonth?.toString()}
              onValueChange={(value) => setScheduleDayOfMonth(parseInt(value))}
            >
              <SelectTrigger id="day-of-month-quarterly">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <SelectItem key={day} value={day.toString()}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Runs on the first month of each quarter (Jan, Apr, Jul, Oct)
            </p>
          </div>
        );

      case 'annually':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Select
                value={scheduleMonth?.toString()}
                onValueChange={(value) => setScheduleMonth(parseInt(value))}
              >
                <SelectTrigger id="month">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {getMonths().map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="day-of-year">Day</Label>
              <Select
                value={scheduleDayOfMonth?.toString()}
                onValueChange={(value) => setScheduleDayOfMonth(parseInt(value))}
              >
                <SelectTrigger id="day-of-year">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <SelectItem key={day} value={day.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingSchedule ? 'Edit' : 'Create'} Report Schedule
          </DialogTitle>
          <p className="text-sm text-gray-500">
            Schedule automatic delivery of "{reportName}"
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Toggle */}
          {existingSchedule && (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label>Schedule Active</Label>
                <p className="text-sm text-gray-500">
                  Enable or disable this schedule
                </p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          )}

          {/* Frequency */}
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select value={scheduleType} onValueChange={(value) => setScheduleType(value as ScheduleType)}>
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="once">Once (One-time)</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="annually">Annually</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="time"
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getTimezones().map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label} ({tz.offset})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Schedule-specific fields */}
          {renderScheduleFields()}

          {/* Next Run Preview */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Next Run</p>
                <p className="text-sm text-blue-700">{getNextRunPreview()}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {formatScheduleDescription({ scheduleType, scheduleTime: scheduleTime + ':00', scheduleDayOfWeek, scheduleDayOfMonth, scheduleMonth, scheduledDate } as any)}
                </p>
              </div>
            </div>
          </div>

          {/* Delivery Method */}
          <div className="space-y-2">
            <Label htmlFor="delivery">Delivery Method</Label>
            <Select value={deliveryMethod} onValueChange={(value) => setDeliveryMethod(value as 'email' | 'download')}>
              <SelectTrigger id="delivery">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                </SelectItem>
                <SelectItem value="download">
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download (Storage)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Email Recipients */}
          {deliveryMethod === 'email' && (
            <div className="space-y-2">
              <Label htmlFor="recipients">Recipients</Label>
              <Input
                id="recipients"
                type="text"
                placeholder="email1@example.com, email2@example.com"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Separate multiple email addresses with commas
              </p>
            </div>
          )}

          {/* Export Format */}
          <div className="space-y-2">
            <Label htmlFor="format">Export Format</Label>
            <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as ExportFormat)}>
              <SelectTrigger id="format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="png">PNG Image</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Include Filters</Label>
                <p className="text-sm text-gray-500">
                  Apply current report filters to export
                </p>
              </div>
              <Switch checked={includeFilters} onCheckedChange={setIncludeFilters} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Include Timestamp</Label>
                <p className="text-sm text-gray-500">
                  Add timestamp to filename
                </p>
              </div>
              <Switch checked={includeTimestamp} onCheckedChange={setIncludeTimestamp} />
            </div>
          </div>

          {/* Email Template (only for email delivery) */}
          {deliveryMethod === 'email' && (
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Email Template</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTemplateVariables(!showTemplateVariables)}
                >
                  Variables
                </Button>
              </div>

              {showTemplateVariables && (
                <div className="p-3 bg-gray-50 rounded text-xs space-y-1">
                  <p className="font-medium mb-2">Available Variables:</p>
                  {getEmailTemplateVariables().map((v) => (
                    <div key={v.variable} className="flex gap-2">
                      <code className="bg-white px-1 rounded">{v.variable}</code>
                      <span className="text-gray-600">- {v.description}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Scheduled Report: {{report_name}}"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Body</Label>
                <Textarea
                  id="body"
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Your scheduled report is ready..."
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-red-900">Validation Errors</p>
                  <ul className="list-disc list-inside text-sm text-red-700 mt-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Schedule History */}
          {existingSchedule && scheduleHistory.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Schedule History</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                >
                  {showHistory ? 'Hide' : 'Show'}
                </Button>
              </div>

              {showHistory && (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left">Date</th>
                        <th className="px-3 py-2 text-left">Status</th>
                        <th className="px-3 py-2 text-left">Format</th>
                        <th className="px-3 py-2 text-right">Rows</th>
                        <th className="px-3 py-2 text-right">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {scheduleHistory.map((run) => (
                        <tr key={run.id}>
                          <td className="px-3 py-2">
                            {new Date(run.exported_at).toLocaleDateString()}
                          </td>
                          <td className="px-3 py-2">
                            {run.success ? (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Success
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <XCircle className="h-3 w-3 mr-1" />
                                Error
                              </Badge>
                            )}
                          </td>
                          <td className="px-3 py-2 uppercase">
                            {run.export_format}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {run.row_count?.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {run.execution_time_ms}ms
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : existingSchedule ? 'Update Schedule' : 'Create Schedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
