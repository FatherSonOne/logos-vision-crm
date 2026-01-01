import React, { useState, useMemo } from 'react';
import type { Client, Donation, Volunteer, EmailCampaign, Event, Project } from '../types';

// Import all the outreach sub-components
import { Donations } from './Donations';
import { Stewardship } from './Stewardship';
import { CampaignManagement } from './CampaignManagement';
import { DonorPipeline } from './DonorPipeline';
import { CultivationPlanBuilder } from './CultivationPlanBuilder';
import { TouchpointTracker } from './TouchpointTracker';
import { VolunteerList } from './VolunteerList';
import { EmailCampaigns } from './EmailCampaigns';
import { EventEditor } from './EventEditor';

// Icons
const DonationIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
);

const StewardshipIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

const CampaignIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
);

const PipelineIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 2L2 22M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
);

const CultivationIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
    </svg>
);

const TouchpointIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
    </svg>
);

const VolunteersIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const EmailIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </svg>
);

const EventsIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

type OutreachTab =
    | 'donations'
    | 'stewardship'
    | 'campaigns'
    | 'pipeline'
    | 'cultivation'
    | 'touchpoints'
    | 'volunteers'
    | 'email'
    | 'events';

interface TabConfig {
    id: OutreachTab;
    label: string;
    icon: React.ReactNode;
    description: string;
    color: string;
}

const tabs: TabConfig[] = [
    { id: 'donations', label: 'Donations', icon: <DonationIcon />, description: 'Track and manage donations', color: 'var(--cmf-highlight-lime)' },
    { id: 'stewardship', label: 'Stewardship', icon: <StewardshipIcon />, description: 'Donor stewardship activities', color: 'var(--cmf-highlight-red)' },
    { id: 'campaigns', label: 'Campaigns', icon: <CampaignIcon />, description: 'Manage fundraising campaigns', color: 'var(--cmf-highlight-cyan)' },
    { id: 'pipeline', label: 'Donor Pipeline', icon: <PipelineIcon />, description: 'Donor moves management', color: 'var(--cmf-highlight-amber)' },
    { id: 'cultivation', label: 'Cultivation', icon: <CultivationIcon />, description: 'Build cultivation plans', color: 'var(--cmf-highlight-violet)' },
    { id: 'touchpoints', label: 'Touchpoints', icon: <TouchpointIcon />, description: 'Track donor interactions', color: 'var(--cmf-info)' },
    { id: 'volunteers', label: 'Volunteers', icon: <VolunteersIcon />, description: 'Manage volunteers', color: 'var(--cmf-success)' },
    { id: 'email', label: 'Email', icon: <EmailIcon />, description: 'Email campaigns', color: 'var(--cmf-warning)' },
    { id: 'events', label: 'Events', icon: <EventsIcon />, description: 'Event management', color: 'var(--cmf-error)' },
];

interface OutreachHubProps {
    clients: Client[];
    donations?: Donation[];
    volunteers?: Volunteer[];
    emailCampaigns?: EmailCampaign[];
    events?: Event[];
    projects?: Project[];
    onAddVolunteer?: () => void;
    onSaveEmailCampaign?: (campaign: any) => void;
    onSaveEvent?: (event: Event) => void;
    initialTab?: OutreachTab;
}

export const OutreachHub: React.FC<OutreachHubProps> = ({
    clients,
    donations = [],
    volunteers = [],
    emailCampaigns = [],
    events = [],
    projects = [],
    onAddVolunteer,
    onSaveEmailCampaign,
    onSaveEvent,
    initialTab = 'donations'
}) => {
    const [activeTab, setActiveTab] = useState<OutreachTab>(initialTab);
    const [isHoveredTab, setIsHoveredTab] = useState<OutreachTab | null>(null);

    const activeTabConfig = useMemo(() =>
        tabs.find(t => t.id === activeTab) || tabs[0],
    [activeTab]);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'donations':
                return <Donations />;
            case 'stewardship':
                return <Stewardship />;
            case 'campaigns':
                return <CampaignManagement />;
            case 'pipeline':
                return <DonorPipeline clients={clients} />;
            case 'cultivation':
                return <CultivationPlanBuilder clients={clients} />;
            case 'touchpoints':
                return <TouchpointTracker clients={clients} />;
            case 'volunteers':
                return <VolunteerList
                    volunteers={volunteers}
                    clients={clients}
                    projects={projects}
                    onAddVolunteer={onAddVolunteer || (() => {})}
                />;
            case 'email':
                return <EmailCampaigns
                    campaigns={emailCampaigns}
                    clients={clients}
                    onSaveCampaign={onSaveEmailCampaign || (() => {})}
                />;
            case 'events':
                return <EventEditor
                    events={events}
                    clients={clients}
                    volunteers={volunteers}
                    onSave={onSaveEvent || (() => {})}
                />;
            default:
                return <Donations />;
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Hub Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div
                        className="p-2.5 rounded-xl"
                        style={{
                            backgroundColor: 'var(--cmf-accent-muted)',
                            color: 'var(--cmf-accent)'
                        }}
                    >
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                    </div>
                    <div>
                        <h1
                            className="text-2xl font-bold"
                            style={{ color: 'var(--cmf-text)' }}
                        >
                            Outreach Hub
                        </h1>
                        <p
                            className="text-sm"
                            style={{ color: 'var(--cmf-text-muted)' }}
                        >
                            Manage donations, campaigns, volunteers, and donor relationships
                        </p>
                    </div>
                </div>
            </div>

            {/* Tab Navigation - Grid style */}
            <div
                className="mb-6 p-1.5 rounded-xl"
                style={{
                    backgroundColor: 'var(--cmf-surface)',
                    border: '1px solid var(--cmf-border)'
                }}
            >
                <div className="flex flex-wrap gap-1">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        const isHovered = isHoveredTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                onMouseEnter={() => setIsHoveredTab(tab.id)}
                                onMouseLeave={() => setIsHoveredTab(null)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-out"
                                style={{
                                    backgroundColor: isActive
                                        ? 'var(--cmf-accent)'
                                        : isHovered
                                            ? 'var(--cmf-hover-overlay)'
                                            : 'transparent',
                                    color: isActive
                                        ? 'var(--cmf-accent-text)'
                                        : isHovered
                                            ? 'var(--cmf-text)'
                                            : 'var(--cmf-text-secondary)',
                                    transform: isActive ? 'scale(1)' : isHovered ? 'scale(1.02)' : 'scale(1)',
                                }}
                                title={tab.description}
                            >
                                <span className="flex-shrink-0">{tab.icon}</span>
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Active Tab Info Bar */}
            <div
                className="mb-4 px-4 py-3 rounded-lg flex items-center gap-3"
                style={{
                    backgroundColor: 'var(--cmf-accent-subtle)',
                    border: '1px solid var(--cmf-accent-muted)'
                }}
            >
                <span style={{ color: 'var(--cmf-accent)' }}>
                    {activeTabConfig.icon}
                </span>
                <div>
                    <span
                        className="font-semibold"
                        style={{ color: 'var(--cmf-text)' }}
                    >
                        {activeTabConfig.label}
                    </span>
                    <span
                        className="mx-2"
                        style={{ color: 'var(--cmf-text-faint)' }}
                    >
                        &bull;
                    </span>
                    <span style={{ color: 'var(--cmf-text-muted)' }}>
                        {activeTabConfig.description}
                    </span>
                </div>
            </div>

            {/* Tab Content */}
            <div
                className="flex-1 rounded-xl overflow-hidden"
                style={{
                    backgroundColor: 'var(--cmf-surface)',
                    border: '1px solid var(--cmf-border)'
                }}
            >
                <div className="h-full overflow-auto p-4">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default OutreachHub;
