import React, { useState, lazy, Suspense } from 'react';
import { Tabs, type Tab } from './ui/Tabs';
import { Card, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { LoadingSpinner } from './ui/Loading';
import { Mail, Megaphone, FileText, Image, Sparkles } from 'lucide-react';

// Lazy load tab components for better performance
const CommunicationsTab = lazy(() => import('./ai-studio/CommunicationsTab').then(m => ({ default: m.CommunicationsTab })));
const CampaignsTab = lazy(() => import('./ai-studio/CampaignsTab').then(m => ({ default: m.CampaignsTab })));
const GrantsTab = lazy(() => import('./ai-studio/GrantsTab').then(m => ({ default: m.GrantsTab })));
const MediaTab = lazy(() => import('./ai-studio/MediaTab').then(m => ({ default: m.MediaTab })));

/**
 * AI Content Studio
 * =================
 * A powerful, CRM-integrated content creation workspace for nonprofit/ministry teams.
 * 
 * Features:
 * - Communications: Donor thank-you letters, appeal letters, follow-up emails
 * - Campaigns: Newsletter content, social media posts, event materials
 * - Grants: Grant narratives, impact stories, proposal sections
 * - Media: Image/video analysis, audio transcription
 */

// Loading fallback component
const TabLoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center py-16">
    <LoadingSpinner size="lg" />
  </div>
);

// Page header component
const PageHeader: React.FC<{
  title: string;
  description: string;
  icon?: React.ReactNode;
}> = ({ title, description, icon }) => (
  <div className="flex items-start gap-4 mb-6">
    {icon && (
      <div 
        className="p-3 rounded-xl"
        style={{ 
          background: 'linear-gradient(135deg, var(--aurora-teal), var(--aurora-cyan))',
          boxShadow: 'var(--aurora-glow-sm)'
        }}
      >
        <span className="text-slate-900">{icon}</span>
      </div>
    )}
    <div>
      <h1 
        className="text-3xl font-bold"
        style={{ color: 'var(--cmf-text)' }}
      >
        {title}
      </h1>
      <p 
        className="mt-1 text-base"
        style={{ color: 'var(--cmf-text-muted)' }}
      >
        {description}
      </p>
    </div>
  </div>
);

// Quick stats component
const QuickStats: React.FC = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    {[
      { label: 'Content Generated', value: '24', sublabel: 'This week' },
      { label: 'Time Saved', value: '8.5h', sublabel: 'Estimated' },
      { label: 'Templates Used', value: '12', sublabel: 'Unique' },
      { label: 'AI Requests', value: '156', sublabel: 'This month' },
    ].map((stat, i) => (
      <Card key={i} variant="ghost" padding="sm">
        <div className="text-center">
          <div 
            className="text-2xl font-bold"
            style={{ color: 'var(--aurora-teal)' }}
          >
            {stat.value}
          </div>
          <div 
            className="text-sm font-medium"
            style={{ color: 'var(--cmf-text)' }}
          >
            {stat.label}
          </div>
          <div 
            className="text-xs"
            style={{ color: 'var(--cmf-text-faint)' }}
          >
            {stat.sublabel}
          </div>
        </div>
      </Card>
    ))}
  </div>
);

export const AiContentStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState('communications');

  // Define tabs with icons
  const tabs: Tab[] = [
    {
      id: 'communications',
      label: 'Communications',
      icon: <Mail className="w-4 h-4" />,
      content: (
        <Suspense fallback={<TabLoadingFallback />}>
          <CommunicationsTab />
        </Suspense>
      ),
    },
    {
      id: 'campaigns',
      label: 'Campaigns',
      icon: <Megaphone className="w-4 h-4" />,
      content: (
        <Suspense fallback={<TabLoadingFallback />}>
          <CampaignsTab />
        </Suspense>
      ),
    },
    {
      id: 'grants',
      label: 'Grants',
      icon: <FileText className="w-4 h-4" />,
      content: (
        <Suspense fallback={<TabLoadingFallback />}>
          <GrantsTab />
        </Suspense>
      ),
    },
    {
      id: 'media',
      label: 'Media Analysis',
      icon: <Image className="w-4 h-4" />,
      content: (
        <Suspense fallback={<TabLoadingFallback />}>
          <MediaTab />
        </Suspense>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="AI Content Studio"
        description="Create compelling content powered by your CRM data. Generate donor communications, campaign materials, grant narratives, and more."
        icon={<Sparkles className="w-6 h-6" />}
      />

      {/* Quick Stats */}
      <QuickStats />

      {/* Main Content with Tabs */}
      <Card variant="elevated" padding="lg">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          variant="pills"
          size="md"
        />
      </Card>
    </div>
  );
};

// Default export for lazy loading
export default AiContentStudio;
