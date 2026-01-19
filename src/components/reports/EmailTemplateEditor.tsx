/**
 * Email Template Editor Component
 *
 * Rich editor for creating and customizing email templates for scheduled reports.
 * Features:
 * - Rich text editing with HTML preview
 * - Variable insertion dropdown
 * - Live preview with sample data
 * - Template library with presets
 * - Save/load functionality
 *
 * @component EmailTemplateEditor
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Mail,
  Eye,
  Code,
  Save,
  X,
  Plus,
  FileText,
  Sparkles,
  Copy,
  Download,
  Upload,
} from 'lucide-react';
import { renderTemplate, TemplateVariables } from '../../services/emailService';
import { emailTemplatePresets } from '../../config/emailConfig';

interface EmailTemplateEditorProps {
  initialSubject?: string;
  initialBody?: string;
  onSave?: (subject: string, body: string) => void;
  onCancel?: () => void;
  showPresetLibrary?: boolean;
}

interface TemplatePreset {
  id: string;
  name: string;
  description: string;
  category: 'report' | 'notification' | 'alert' | 'custom';
  subject: string;
  body: string;
  variables: string[];
}

const availableVariables: { name: string; description: string; example: string }[] = [
  { name: 'reportName', description: 'Name of the report', example: 'Monthly Donations Report' },
  { name: 'exportDate', description: 'Date of export', example: 'January 17, 2026' },
  { name: 'recordCount', description: 'Number of records', example: '1,234' },
  { name: 'dateRange', description: 'Date range filter', example: 'Jan 1 - Jan 31, 2026' },
  { name: 'userName', description: 'Recipient name', example: 'John Doe' },
  { name: 'userEmail', description: 'Recipient email', example: 'john@example.com' },
  { name: 'reportUrl', description: 'Link to view report', example: 'https://app.logosvision.com/reports/123' },
  { name: 'companyName', description: 'Company name', example: 'Logos Vision CRM' },
  { name: 'currentYear', description: 'Current year', example: '2026' },
  { name: 'customMessage', description: 'Custom message text', example: 'Thank you for your continued support.' },
];

const templatePresets: TemplatePreset[] = [
  {
    id: 'scheduled-report',
    name: 'Scheduled Report',
    description: 'Standard template for scheduled report delivery',
    category: 'report',
    subject: emailTemplatePresets.scheduledReport.subject,
    body: `<h2>Your Scheduled Report: {{reportName}}</h2>
<p>Hello {{userName}},</p>
<p>Your scheduled report is ready for review. This report contains {{recordCount}} records for the period {{dateRange}}.</p>
<p>The report is attached to this email and can also be viewed online at any time.</p>
<p><strong>Report Details:</strong></p>
<ul>
  <li>Generated: {{exportDate}}</li>
  <li>Records: {{recordCount}}</li>
  <li>Period: {{dateRange}}</li>
</ul>
<p><a href="{{reportUrl}}" style="background-color: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Report Online</a></p>
<p>{{customMessage}}</p>`,
    variables: ['reportName', 'userName', 'recordCount', 'dateRange', 'exportDate', 'reportUrl', 'customMessage'],
  },
  {
    id: 'export-complete',
    name: 'Export Complete',
    description: 'Notification when an on-demand export completes',
    category: 'notification',
    subject: emailTemplatePresets.exportComplete.subject,
    body: `<h2>Export Complete</h2>
<p>Hello {{userName}},</p>
<p>Your export of {{reportName}} has completed successfully!</p>
<p><strong>Export Summary:</strong></p>
<ul>
  <li>Records exported: {{recordCount}}</li>
  <li>Export date: {{exportDate}}</li>
  <li>Date range: {{dateRange}}</li>
</ul>
<p>The exported file is attached to this email. You can also access it through your dashboard.</p>
<p><a href="{{reportUrl}}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View in Dashboard</a></p>`,
    variables: ['reportName', 'userName', 'recordCount', 'exportDate', 'dateRange', 'reportUrl'],
  },
  {
    id: 'kpi-alert',
    name: 'KPI Alert',
    description: 'Alert when a KPI threshold is exceeded',
    category: 'alert',
    subject: emailTemplatePresets.reportAlert.subject,
    body: `<h2>KPI Alert: {{reportName}}</h2>
<p>Hello {{userName}},</p>
<p>A KPI threshold has been exceeded in your {{reportName}} report.</p>
<p><strong>Alert Details:</strong></p>
<p>{{customMessage}}</p>
<p>Please review the report for more details.</p>
<p><a href="{{reportUrl}}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Review Report</a></p>`,
    variables: ['reportName', 'userName', 'customMessage', 'reportUrl'],
  },
  {
    id: 'simple',
    name: 'Simple Message',
    description: 'Basic template with minimal formatting',
    category: 'custom',
    subject: '{{reportName}} - {{exportDate}}',
    body: `<p>Hello {{userName}},</p>
<p>Please find your {{reportName}} report attached.</p>
<p>Report period: {{dateRange}}</p>
<p>Records included: {{recordCount}}</p>
<p>Thank you,<br>{{companyName}}</p>`,
    variables: ['userName', 'reportName', 'dateRange', 'recordCount', 'companyName'],
  },
];

const sampleData: TemplateVariables = {
  reportName: 'Monthly Donations Report',
  exportDate: 'January 17, 2026',
  recordCount: 1234,
  dateRange: 'January 1 - January 31, 2026',
  userName: 'John Doe',
  userEmail: 'john.doe@example.com',
  reportUrl: 'https://app.logosvision.com/reports/sample',
  unsubscribeUrl: 'https://app.logosvision.com/unsubscribe',
  companyName: 'Logos Vision CRM',
  currentYear: new Date().getFullYear(),
  customMessage: 'Thank you for your continued support. We appreciate your partnership.',
};

export default function EmailTemplateEditor({
  initialSubject = '',
  initialBody = '',
  onSave,
  onCancel,
  showPresetLibrary = true,
}: EmailTemplateEditorProps) {
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [previewMode, setPreviewMode] = useState<'html' | 'code' | 'preview'>('code');
  const [showVariables, setShowVariables] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [previewIframeKey, setPreviewIframeKey] = useState(0);

  const renderedPreview = useMemo(() => {
    return {
      subject: renderTemplate(subject, sampleData),
      body: renderTemplate(body, sampleData),
    };
  }, [subject, body]);

  // Update iframe when preview changes
  useEffect(() => {
    if (previewMode === 'preview') {
      setPreviewIframeKey(prev => prev + 1);
    }
  }, [renderedPreview.body, previewMode]);

  const handleInsertVariable = (variableName: string) => {
    const variable = `{{${variableName}}}`;
    const textarea = document.getElementById('template-body') as HTMLTextAreaElement;

    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newBody = body.substring(0, start) + variable + body.substring(end);
      setBody(newBody);

      // Reset cursor position after variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    } else {
      setBody(body + variable);
    }

    setShowVariables(false);
  };

  const handleLoadPreset = (presetId: string) => {
    const preset = templatePresets.find(p => p.id === presetId);
    if (preset) {
      setSubject(preset.subject);
      setBody(preset.body);
      setSelectedPreset(presetId);
      setShowPresets(false);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(subject, body);
    }
  };

  const handleExport = () => {
    const template = {
      subject,
      body,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-template-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const template = JSON.parse(e.target?.result as string);
          if (template.subject) setSubject(template.subject);
          if (template.body) setBody(template.body);
        } catch (error) {
          console.error('Error importing template:', error);
          alert('Failed to import template. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="email-template-editor bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="w-6 h-6 text-indigo-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Email Template Editor</h2>
              <p className="text-sm text-gray-500">Customize your email template with variables and formatting</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-gray-200 px-6 py-3 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex bg-white border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setPreviewMode('code')}
                className={`px-3 py-1.5 text-sm font-medium flex items-center gap-1.5 ${
                  previewMode === 'code'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Code className="w-4 h-4" />
                Code
              </button>
              <button
                onClick={() => setPreviewMode('html')}
                className={`px-3 py-1.5 text-sm font-medium flex items-center gap-1.5 border-l border-gray-300 ${
                  previewMode === 'html'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FileText className="w-4 h-4" />
                HTML
              </button>
              <button
                onClick={() => setPreviewMode('preview')}
                className={`px-3 py-1.5 text-sm font-medium flex items-center gap-1.5 border-l border-gray-300 ${
                  previewMode === 'preview'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
            </div>

            {/* Insert Variable Button */}
            <div className="relative">
              <button
                onClick={() => setShowVariables(!showVariables)}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Insert Variable
              </button>

              {/* Variables Dropdown */}
              {showVariables && (
                <div className="absolute top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto">
                  <div className="p-3 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-semibold text-sm text-gray-900">Available Variables</h3>
                    <p className="text-xs text-gray-500 mt-1">Click to insert into template</p>
                  </div>
                  <div className="p-2">
                    {availableVariables.map((variable) => (
                      <button
                        key={variable.name}
                        onClick={() => handleInsertVariable(variable.name)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm text-indigo-600">
                            {`{{${variable.name}}}`}
                          </span>
                          <Copy className="w-3 h-3 text-gray-400" />
                        </div>
                        <span className="text-xs text-gray-600">{variable.description}</span>
                        <span className="text-xs text-gray-400 italic">Example: {variable.example}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Preset Templates */}
            {showPresetLibrary && (
              <div className="relative">
                <button
                  onClick={() => setShowPresets(!showPresets)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  Templates
                </button>

                {/* Presets Dropdown */}
                {showPresets && (
                  <div className="absolute top-full mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto">
                    <div className="p-3 border-b border-gray-200 bg-gray-50">
                      <h3 className="font-semibold text-sm text-gray-900">Template Library</h3>
                      <p className="text-xs text-gray-500 mt-1">Choose a preset template to get started</p>
                    </div>
                    <div className="p-2">
                      {templatePresets.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => handleLoadPreset(preset.id)}
                          className={`w-full text-left px-3 py-3 rounded-lg hover:bg-gray-100 flex flex-col gap-1 ${
                            selectedPreset === preset.id ? 'bg-indigo-50 border border-indigo-200' : ''
                          }`}
                        >
                          <div className="font-semibold text-sm text-gray-900">{preset.name}</div>
                          <div className="text-xs text-gray-600">{preset.description}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {preset.variables.slice(0, 3).map((v) => (
                              <span
                                key={v}
                                className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded"
                              >
                                {v}
                              </span>
                            ))}
                            {preset.variables.length > 3 && (
                              <span className="text-xs px-2 py-0.5 text-gray-500">
                                +{preset.variables.length - 3} more
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Import/Export */}
            <button
              onClick={handleExport}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <label className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer">
              <Upload className="w-4 h-4" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="p-6">
        {/* Subject Line */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject Line
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter email subject (you can use variables like {{reportName}})"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {previewMode === 'preview' && (
            <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Preview:</div>
              <div className="font-medium text-gray-900">{renderedPreview.subject}</div>
            </div>
          )}
        </div>

        {/* Email Body */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Body
          </label>

          {previewMode === 'code' && (
            <textarea
              id="template-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Enter email body HTML. Use variables like {{reportName}}, {{recordCount}}, etc."
              rows={16}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          )}

          {previewMode === 'html' && (
            <div className="border border-gray-300 rounded-lg bg-gray-50 p-4 overflow-auto max-h-96">
              <pre className="text-xs font-mono text-gray-800 whitespace-pre-wrap">
                {body}
              </pre>
            </div>
          )}

          {previewMode === 'preview' && (
            <div className="border border-gray-300 rounded-lg bg-white overflow-hidden">
              <iframe
                key={previewIframeKey}
                title="Email Preview"
                srcDoc={renderedPreview.body}
                className="w-full h-96 border-0"
                sandbox="allow-same-origin"
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between rounded-b-lg">
        <div className="text-sm text-gray-500">
          Variables will be replaced with actual values when the email is sent
        </div>
        <div className="flex items-center gap-3">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Template
          </button>
        </div>
      </div>
    </div>
  );
}
