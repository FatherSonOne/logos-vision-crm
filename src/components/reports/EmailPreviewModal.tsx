/**
 * Email Preview Modal Component
 *
 * Modal for previewing and testing email templates before sending.
 * Used in ReportScheduler to preview scheduled report emails.
 *
 * @component EmailPreviewModal
 */

import React, { useState, useMemo } from 'react';
import { X, Mail, Send, Eye, Code } from 'lucide-react';
import { renderTemplate, sendTestEmail, TemplateVariables } from '../../services/emailService';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: string;
  bodyTemplate: string;
  sampleData: TemplateVariables;
  onSendTest?: (email: string) => Promise<void>;
}

export default function EmailPreviewModal({
  isOpen,
  onClose,
  subject,
  bodyTemplate,
  sampleData,
  onSendTest,
}: EmailPreviewModalProps) {
  const [viewMode, setViewMode] = useState<'preview' | 'html'>('preview');
  const [testEmail, setTestEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  const renderedEmail = useMemo(() => {
    return {
      subject: renderTemplate(subject, sampleData),
      body: renderTemplate(bodyTemplate, sampleData),
    };
  }, [subject, bodyTemplate, sampleData]);

  const handleSendTest = async () => {
    if (!testEmail) {
      setSendResult({ success: false, message: 'Please enter an email address' });
      return;
    }

    setIsSending(true);
    setSendResult(null);

    try {
      if (onSendTest) {
        await onSendTest(testEmail);
        setSendResult({ success: true, message: `Test email sent to ${testEmail}` });
      } else {
        const result = await sendTestEmail(testEmail);
        if (result.success) {
          setSendResult({ success: true, message: `Test email sent to ${testEmail}` });
        } else {
          setSendResult({ success: false, message: result.error || 'Failed to send test email' });
        }
      }
    } catch (error) {
      setSendResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send test email',
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Mail className="w-6 h-6 text-indigo-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Email Preview</h2>
              <p className="text-sm text-gray-500">Preview how your email will look to recipients</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg flex items-center gap-1.5 ${
                viewMode === 'preview'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={() => setViewMode('html')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg flex items-center gap-1.5 ${
                viewMode === 'html'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Code className="w-4 h-4" />
              HTML
            </button>
          </div>

          <div className="text-sm text-gray-600">
            Using sample data for preview
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {/* Subject Line */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Subject Line</div>
            <div className="font-medium text-gray-900">{renderedEmail.subject}</div>
          </div>

          {/* Email Body */}
          <div className="p-6">
            {viewMode === 'preview' && (
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                <iframe
                  title="Email Preview"
                  srcDoc={renderedEmail.body}
                  className="w-full h-[500px] border-0"
                  sandbox="allow-same-origin"
                />
              </div>
            )}

            {viewMode === 'html' && (
              <div className="border border-gray-200 rounded-lg bg-gray-50 p-4">
                <pre className="text-xs font-mono text-gray-800 whitespace-pre-wrap overflow-auto max-h-[500px]">
                  {renderedEmail.body}
                </pre>
              </div>
            )}
          </div>

          {/* Test Email Section */}
          <div className="px-6 pb-6">
            <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
              <h3 className="font-semibold text-gray-900 mb-3">Send Test Email</h3>
              <p className="text-sm text-gray-600 mb-4">
                Send a test email to yourself to see how it looks in your inbox
              </p>

              <div className="flex gap-3">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={isSending}
                />
                <button
                  onClick={handleSendTest}
                  disabled={isSending || !testEmail}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isSending ? 'Sending...' : 'Send Test'}
                </button>
              </div>

              {sendResult && (
                <div
                  className={`mt-3 p-3 rounded-lg ${
                    sendResult.success
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}
                >
                  <p className="text-sm font-medium">{sendResult.message}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            Variables have been replaced with sample data
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
