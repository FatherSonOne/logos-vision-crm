import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Copy, Download, Mail, Check, RefreshCw, Sparkles } from 'lucide-react';

export interface GeneratedContentCardProps {
  title: string;
  content: string;
  isLoading?: boolean;
  onRegenerate?: () => void;
  onSendEmail?: (content: string) => void;
  format?: 'letter' | 'email' | 'social' | 'narrative' | 'plain';
  showActions?: boolean;
  className?: string;
}

/**
 * GeneratedContentCard
 * ====================
 * A card component for displaying AI-generated content with copy/export actions.
 */
export const GeneratedContentCard: React.FC<GeneratedContentCardProps> = ({
  title,
  content,
  isLoading = false,
  onRegenerate,
  onSendEmail,
  format = 'plain',
  showActions = true,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Format-specific styling
  const getContentStyle = () => {
    switch (format) {
      case 'letter':
      case 'email':
        return 'font-serif leading-relaxed';
      case 'social':
        return 'text-lg font-medium';
      case 'narrative':
        return 'leading-loose';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <Card variant="outlined" className={className}>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div 
              className="w-12 h-12 rounded-full animate-pulse flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--aurora-teal), var(--aurora-cyan))' }}
            >
              <Sparkles className="w-6 h-6 text-slate-900 animate-spin" />
            </div>
            <div className="text-center">
              <p style={{ color: 'var(--cmf-text)' }} className="font-medium">
                Generating content...
              </p>
              <p style={{ color: 'var(--cmf-text-muted)' }} className="text-sm mt-1">
                This may take a few seconds
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!content) {
    return (
      <Card variant="outlined" className={className}>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--cmf-surface-2)' }}
            >
              <Sparkles className="w-6 h-6" style={{ color: 'var(--cmf-text-faint)' }} />
            </div>
            <p style={{ color: 'var(--cmf-text-muted)' }} className="text-sm text-center">
              Generated content will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined" className={`${className} card-glow-hover`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {onRegenerate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRegenerate}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Regenerate
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div 
          className={`
            p-4 rounded-lg whitespace-pre-wrap max-h-96 overflow-y-auto
            ${getContentStyle()}
          `}
          style={{ 
            backgroundColor: 'var(--cmf-surface-2)',
            color: 'var(--cmf-text)',
            border: '1px solid var(--cmf-border)'
          }}
        >
          {content}
        </div>
      </CardContent>

      {showActions && (
        <CardFooter align="right">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Download
          </Button>
          {onSendEmail && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onSendEmail(content)}
              leftIcon={<Mail className="w-4 h-4" />}
            >
              Send Email
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default GeneratedContentCard;
