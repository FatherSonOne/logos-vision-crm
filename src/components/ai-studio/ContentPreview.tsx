import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Copy, Download, Mail, Check, Eye, EyeOff, 
  FileText, MessageSquare, Share2, Printer 
} from 'lucide-react';

export type ContentFormat = 'letter' | 'email' | 'social' | 'narrative' | 'plain';

export interface ContentPreviewProps {
  content: string;
  format?: ContentFormat;
  subject?: string;
  recipient?: string;
  onCopy?: () => void;
  onExport?: () => void;
  onSendEmail?: () => void;
  onPrint?: () => void;
  showFormatToggle?: boolean;
  className?: string;
}

const formatConfig: Record<ContentFormat, { 
  label: string; 
  icon: React.ReactNode; 
  style: string;
  fontFamily: string;
}> = {
  letter: { 
    label: 'Letter', 
    icon: <FileText className="w-4 h-4" />,
    style: 'leading-relaxed',
    fontFamily: 'font-serif'
  },
  email: { 
    label: 'Email', 
    icon: <Mail className="w-4 h-4" />,
    style: 'leading-normal',
    fontFamily: 'font-sans'
  },
  social: { 
    label: 'Social Post', 
    icon: <Share2 className="w-4 h-4" />,
    style: 'text-lg leading-snug',
    fontFamily: 'font-sans'
  },
  narrative: { 
    label: 'Narrative', 
    icon: <MessageSquare className="w-4 h-4" />,
    style: 'leading-loose',
    fontFamily: 'font-serif'
  },
  plain: { 
    label: 'Plain Text', 
    icon: <FileText className="w-4 h-4" />,
    style: '',
    fontFamily: 'font-mono'
  },
};

/**
 * ContentPreview
 * ==============
 * A component for previewing and exporting AI-generated content.
 */
export const ContentPreview: React.FC<ContentPreviewProps> = ({
  content,
  format = 'plain',
  subject,
  recipient,
  onCopy,
  onExport,
  onSendEmail,
  onPrint,
  showFormatToggle = true,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [activeFormat, setActiveFormat] = useState(format);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopy?.();
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleExport = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onExport?.();
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Content</title>
            <style>
              body { 
                font-family: ${activeFormat === 'letter' || activeFormat === 'narrative' ? 'Georgia, serif' : 'system-ui, sans-serif'};
                line-height: 1.6;
                max-width: 800px;
                margin: 40px auto;
                padding: 20px;
              }
              .subject { font-weight: bold; margin-bottom: 10px; }
              .recipient { color: #666; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            ${subject ? `<div class="subject">Subject: ${subject}</div>` : ''}
            ${recipient ? `<div class="recipient">To: ${recipient}</div>` : ''}
            <div style="white-space: pre-wrap;">${content}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      onPrint?.();
    }
  };

  const config = formatConfig[activeFormat];

  if (!content) {
    return null;
  }

  return (
    <Card variant="elevated" padding="none" className={className}>
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--cmf-border)' }}
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            leftIcon={showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          >
            {showPreview ? 'Hide' : 'Show'} Preview
          </Button>

          {showFormatToggle && (
            <div className="flex items-center gap-1 border-l pl-3" style={{ borderColor: 'var(--cmf-border)' }}>
              {(Object.entries(formatConfig) as [ContentFormat, typeof formatConfig[ContentFormat]][])
                .slice(0, 3) // Show only first 3 format options
                .map(([key, cfg]) => (
                  <Button
                    key={key}
                    variant={activeFormat === key ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveFormat(key)}
                    leftIcon={cfg.icon}
                    className="px-2"
                  >
                    <span className="hidden sm:inline">{cfg.label}</span>
                  </Button>
                ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          >
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            leftIcon={<Download className="w-4 h-4" />}
          >
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            <span className="hidden sm:inline">Print</span>
          </Button>
          {onSendEmail && (
            <Button
              variant="aurora"
              size="sm"
              onClick={onSendEmail}
              leftIcon={<Mail className="w-4 h-4" />}
            >
              Send
            </Button>
          )}
        </div>
      </div>

      {/* Content Preview */}
      {showPreview && (
        <div className="p-6">
          {/* Email-style header */}
          {(activeFormat === 'email' || activeFormat === 'letter') && (subject || recipient) && (
            <div 
              className="mb-4 pb-4"
              style={{ borderBottom: '1px solid var(--cmf-border)' }}
            >
              {subject && (
                <div className="mb-2">
                  <span 
                    className="text-xs font-medium uppercase tracking-wide"
                    style={{ color: 'var(--cmf-text-muted)' }}
                  >
                    Subject
                  </span>
                  <p 
                    className="text-lg font-semibold"
                    style={{ color: 'var(--cmf-text)' }}
                  >
                    {subject}
                  </p>
                </div>
              )}
              {recipient && (
                <div>
                  <span 
                    className="text-xs font-medium uppercase tracking-wide"
                    style={{ color: 'var(--cmf-text-muted)' }}
                  >
                    To
                  </span>
                  <p style={{ color: 'var(--cmf-text-secondary)' }}>
                    {recipient}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div
            className={`
              whitespace-pre-wrap 
              ${config.style} 
              ${config.fontFamily}
            `}
            style={{ color: 'var(--cmf-text)' }}
          >
            {content}
          </div>

          {/* Social post character count */}
          {activeFormat === 'social' && (
            <div 
              className="mt-4 pt-4 flex items-center justify-between"
              style={{ borderTop: '1px solid var(--cmf-border)' }}
            >
              <span 
                className="text-xs"
                style={{ color: 'var(--cmf-text-muted)' }}
              >
                Character count: {content.length}
              </span>
              <div className="flex gap-2">
                <span 
                  className={`text-xs px-2 py-1 rounded ${content.length <= 280 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}`}
                >
                  Twitter: {content.length <= 280 ? 'OK' : 'Too long'}
                </span>
                <span 
                  className={`text-xs px-2 py-1 rounded ${content.length <= 2200 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}`}
                >
                  Instagram: {content.length <= 2200 ? 'OK' : 'Too long'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default ContentPreview;
