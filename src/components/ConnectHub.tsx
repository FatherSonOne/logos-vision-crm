/**
 * ConnectHub - Unified Communication & Data Sync Center
 * =====================================================
 * Central hub for all external communication and meeting data imports.
 * Consolidates Pulse and Entomate sync functionality.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshIcon, CheckIcon, AlertIcon, ClockIcon, CloudIcon,
  ExternalLinkIcon, PlayIcon, InfoIcon, VideoIcon, ChatIcon, MicIcon
} from './icons';
import { pulseIntegrationService, type SyncStatus, type SyncLogEntry } from '../services/pulseIntegrationService';
import * as entomateService from '../services/entomateService';
import type { EntomateSyncSummary, EntoamteIntegrationConfig } from '../types';

interface ConnectHubProps {
  projects?: any[];
  clients?: any[];
  cases?: any[];
  tasks?: any[];
  activities?: any[];
  onSyncComplete?: () => void;
}

type ActiveTab = 'overview' | 'pulse' | 'entomate' | 'logs';

// Toggle Switch Component
const Toggle: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}> = ({ checked, onChange, label, description }) => (
  <div className="flex items-center justify-between py-3">
    <div>
      <div className="font-medium" style={{ color: 'var(--cmf-text)' }}>{label}</div>
      {description && (
        <div className="text-sm" style={{ color: 'var(--cmf-text-muted)' }}>{description}</div>
      )}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
      style={{ backgroundColor: checked ? 'var(--cmf-accent)' : 'var(--cmf-border-strong)' }}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

// Stat Card Component
const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtext?: string;
}> = ({ label, value, icon, color, subtext }) => (
  <div
    className="rounded-xl p-4 border"
    style={{
      backgroundColor: 'var(--cmf-surface)',
      borderColor: 'var(--cmf-border)'
    }}
  >
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold" style={{ color: 'var(--cmf-text)' }}>{value}</div>
        <div className="text-sm" style={{ color: 'var(--cmf-text-muted)' }}>{label}</div>
        {subtext && (
          <div className="text-xs mt-0.5" style={{ color: 'var(--cmf-text-faint)' }}>{subtext}</div>
        )}
      </div>
    </div>
  </div>
);

// Integration Status Badge
const StatusBadge: React.FC<{ status: 'connected' | 'syncing' | 'error' | 'idle' }> = ({ status }) => {
  const configs = {
    connected: { bg: 'var(--cmf-success)', text: 'Connected', icon: <CheckIcon /> },
    syncing: { bg: 'var(--cmf-accent)', text: 'Syncing...', icon: <RefreshIcon /> },
    error: { bg: 'var(--cmf-error)', text: 'Error', icon: <AlertIcon /> },
    idle: { bg: 'var(--cmf-text-faint)', text: 'Idle', icon: <ClockIcon /> }
  };
  const config = configs[status];

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: config.bg }}
    >
      <span className={status === 'syncing' ? 'animate-spin' : ''}>{config.icon}</span>
      {config.text}
    </span>
  );
};

export const ConnectHub: React.FC<ConnectHubProps> = ({
  projects = [],
  clients = [],
  cases = [],
  tasks = [],
  activities = [],
  onSyncComplete
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [pulseStatus, setPulseStatus] = useState<SyncStatus | null>(null);
  const [entomateConfig, setEntomateConfig] = useState<EntoamteIntegrationConfig | null>(null);
  const [entomateSummary, setEntomateSummary] = useState<EntomateSyncSummary | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLogEntry[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadPulseStatus();
    loadEntomateData();
    loadSyncLogs();
  }, []);

  const loadPulseStatus = async () => {
    try {
      const status = await pulseIntegrationService.getSyncStatus();
      setPulseStatus(status);
    } catch (error) {
      console.error('Error loading Pulse status:', error);
    }
  };

  const loadEntomateData = async () => {
    try {
      const config = await entomateService.getConfig();
      setEntomateConfig(config);
      // Load sync summary if available
      const summary = await entomateService.getSyncSummary?.();
      if (summary) setEntomateSummary(summary);
    } catch (error) {
      console.error('Error loading Entomate data:', error);
    }
  };

  const loadSyncLogs = async () => {
    try {
      const logs = await pulseIntegrationService.getSyncLogs?.() || [];
      setSyncLogs(logs);
    } catch (error) {
      console.error('Error loading sync logs:', error);
    }
  };

  const handleFullSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      // Sync Pulse data (bidirectional)
      await pulseIntegrationService.performFullSync(
        projects,
        clients,
        cases,
        tasks,
        activities
      );

      // Refresh Entomate sync summary (actual sync happens via webhooks)
      const entomateSummary = await entomateService.getSyncSummary();
      setEntomateSummary(entomateSummary);
      console.log('Entomate sync summary:', entomateSummary);

      setLastSyncTime(new Date().toISOString());
      await loadPulseStatus();
      await loadEntomateData();
      await loadSyncLogs();

      onSyncComplete?.();
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [projects, clients, cases, tasks, activities, onSyncComplete]);

  const handleEntomateConfigChange = async (updates: Partial<EntoamteIntegrationConfig>) => {
    if (!entomateConfig) return;
    const newConfig = { ...entomateConfig, ...updates };
    setEntomateConfig(newConfig);
    await entomateService.saveConfig(updates);
  };

  // Tab content renderers
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Meetings Synced"
          value={entomateSummary?.synced || 0}
          icon={<VideoIcon />}
          color="#8b5cf6"
          subtext="From Entomate"
        />
        <StatCard
          label="Action Items"
          value={entomateSummary?.pending || 0}
          icon={<CheckIcon />}
          color="#f59e0b"
          subtext="Pending sync"
        />
        <StatCard
          label="Messages"
          value={pulseStatus?.messageCount || 0}
          icon={<ChatIcon />}
          color="#3b82f6"
          subtext="From Pulse"
        />
        <StatCard
          label="Last Sync"
          value={lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString() : 'Never'}
          icon={<ClockIcon />}
          color="#10b981"
          subtext={lastSyncTime ? new Date(lastSyncTime).toLocaleDateString() : ''}
        />
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pulse Card */}
        <div
          className="rounded-xl border p-6"
          style={{
            backgroundColor: 'var(--cmf-surface)',
            borderColor: 'var(--cmf-border)'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--cmf-accent-muted)' }}
              >
                <CloudIcon />
              </div>
              <div>
                <h3 className="font-semibold text-lg" style={{ color: 'var(--cmf-text)' }}>Pulse</h3>
                <p className="text-sm" style={{ color: 'var(--cmf-text-muted)' }}>Team chat & collaboration</p>
              </div>
            </div>
            <StatusBadge status={pulseStatus?.isConnected ? 'connected' : 'idle'} />
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--cmf-text-muted)' }}>Channels synced</span>
              <span style={{ color: 'var(--cmf-text)' }}>{pulseStatus?.channelCount || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--cmf-text-muted)' }}>Documents linked</span>
              <span style={{ color: 'var(--cmf-text)' }}>{pulseStatus?.documentCount || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--cmf-text-muted)' }}>Auto-sync</span>
              <span style={{ color: 'var(--cmf-text)' }}>{pulseStatus?.autoSync ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('pulse')}
            className="w-full py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'var(--cmf-accent-muted)',
              color: 'var(--cmf-accent)'
            }}
          >
            Configure Pulse
          </button>
        </div>

        {/* Entomate Card */}
        <div
          className="rounded-xl border p-6"
          style={{
            backgroundColor: 'var(--cmf-surface)',
            borderColor: 'var(--cmf-border)'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: '#8b5cf620' }}
              >
                <MicIcon />
              </div>
              <div>
                <h3 className="font-semibold text-lg" style={{ color: 'var(--cmf-text)' }}>Entomate</h3>
                <p className="text-sm" style={{ color: 'var(--cmf-text-muted)' }}>Meeting intelligence & actions</p>
              </div>
            </div>
            <StatusBadge status={entomateConfig?.enabled ? 'connected' : 'idle'} />
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--cmf-text-muted)' }}>Meetings processed</span>
              <span style={{ color: 'var(--cmf-text)' }}>{entomateSummary?.total || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--cmf-text-muted)' }}>Action items synced</span>
              <span style={{ color: 'var(--cmf-text)' }}>{entomateSummary?.synced || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--cmf-text-muted)' }}>Pending items</span>
              <span style={{ color: entomateSummary?.pending ? '#f59e0b' : 'var(--cmf-text)' }}>
                {entomateSummary?.pending || 0}
              </span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('entomate')}
            className="w-full py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: '#8b5cf620',
              color: '#8b5cf6'
            }}
          >
            Configure Entomate
          </button>
        </div>
      </div>

      {/* Sync Now Button */}
      <div
        className="rounded-xl border p-6 text-center"
        style={{
          backgroundColor: 'var(--cmf-surface)',
          borderColor: 'var(--cmf-border)'
        }}
      >
        <h3 className="font-medium mb-2" style={{ color: 'var(--cmf-text)' }}>
          Sync All Communication Data
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--cmf-text-muted)' }}>
          Pull latest meetings, messages, and action items from all connected services
        </p>
        <button
          onClick={handleFullSync}
          disabled={isSyncing}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all disabled:opacity-50"
          style={{ backgroundColor: 'var(--cmf-accent)' }}
        >
          {isSyncing ? (
            <>
              <span className="animate-spin"><RefreshIcon /></span>
              Syncing...
            </>
          ) : (
            <>
              <RefreshIcon />
              Sync Now
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderPulseSettings = () => (
    <div
      className="rounded-xl border p-6"
      style={{
        backgroundColor: 'var(--cmf-surface)',
        borderColor: 'var(--cmf-border)'
      }}
    >
      <h3 className="font-semibold text-lg mb-4" style={{ color: 'var(--cmf-text)' }}>
        Pulse Integration Settings
      </h3>

      <div className="space-y-1 divide-y" style={{ borderColor: 'var(--cmf-divider)' }}>
        <Toggle
          checked={pulseIntegrationService.getConfig()?.autoSyncOnLoad || false}
          onChange={(checked) => pulseIntegrationService.setConfig({ autoSyncOnLoad: checked })}
          label="Auto-sync messages"
          description="Automatically sync new messages to activity feed"
        />
        <Toggle
          checked={pulseIntegrationService.getConfig()?.syncDocuments || false}
          onChange={(checked) => pulseIntegrationService.setConfig({ syncDocuments: checked })}
          label="Sync shared documents"
          description="Link documents shared in Pulse to Logos Vision"
        />
        <Toggle
          checked={pulseIntegrationService.getConfig()?.syncMeetings || false}
          onChange={(checked) => pulseIntegrationService.setConfig({ syncMeetings: checked })}
          label="Create activities from meetings"
          description="Automatically log scheduled meetings as activities"
        />
      </div>

      <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--cmf-divider)' }}>
        <a
          href="#"
          className="inline-flex items-center gap-2 text-sm font-medium"
          style={{ color: 'var(--cmf-accent)' }}
        >
          <ExternalLinkIcon />
          Open Pulse in new tab
        </a>
      </div>
    </div>
  );

  const renderEntomateSettings = () => (
    <div
      className="rounded-xl border p-6"
      style={{
        backgroundColor: 'var(--cmf-surface)',
        borderColor: 'var(--cmf-border)'
      }}
    >
      <h3 className="font-semibold text-lg mb-4" style={{ color: 'var(--cmf-text)' }}>
        Entomate Integration Settings
      </h3>

      <div className="space-y-1 divide-y" style={{ borderColor: 'var(--cmf-divider)' }}>
        <Toggle
          checked={entomateConfig?.enabled || false}
          onChange={(checked) => handleEntomateConfigChange({ enabled: checked })}
          label="Enable Entomate sync"
          description="Connect to Entomate for meeting intelligence"
        />
        <Toggle
          checked={entomateConfig?.autoSync || false}
          onChange={(checked) => handleEntomateConfigChange({ autoSync: checked })}
          label="Auto-sync action items"
          description="Automatically import action items as tasks"
        />
        <Toggle
          checked={entomateConfig?.syncMeetings || false}
          onChange={(checked) => handleEntomateConfigChange({ syncMeetings: checked })}
          label="Sync meeting summaries"
          description="Import AI-generated meeting summaries"
        />
        <Toggle
          checked={entomateConfig?.createActivitiesFromMeetings || false}
          onChange={(checked) => handleEntomateConfigChange({ createActivitiesFromMeetings: checked })}
          label="Log meetings as activities"
          description="Create activity records for synced meetings"
        />
      </div>

      <div className="mt-6">
        <label className="block mb-2 text-sm font-medium" style={{ color: 'var(--cmf-text)' }}>
          Sync Frequency
        </label>
        <select
          value={entomateConfig?.syncFrequency || '5min'}
          onChange={(e) => handleEntomateConfigChange({ syncFrequency: e.target.value as any })}
          className="w-full p-2 rounded-lg border"
          style={{
            backgroundColor: 'var(--cmf-bg)',
            borderColor: 'var(--cmf-border)',
            color: 'var(--cmf-text)'
          }}
        >
          <option value="realtime">Real-time</option>
          <option value="5min">Every 5 minutes</option>
          <option value="15min">Every 15 minutes</option>
          <option value="30min">Every 30 minutes</option>
          <option value="hourly">Hourly</option>
        </select>
      </div>
    </div>
  );

  const renderLogs = () => (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        backgroundColor: 'var(--cmf-surface)',
        borderColor: 'var(--cmf-border)'
      }}
    >
      <div className="p-4 border-b" style={{ borderColor: 'var(--cmf-divider)' }}>
        <h3 className="font-semibold" style={{ color: 'var(--cmf-text)' }}>Sync History</h3>
      </div>

      <div className="divide-y" style={{ borderColor: 'var(--cmf-divider)' }}>
        {syncLogs.length === 0 ? (
          <div className="p-8 text-center" style={{ color: 'var(--cmf-text-muted)' }}>
            <InfoIcon />
            <p className="mt-2">No sync logs available</p>
          </div>
        ) : (
          syncLogs.slice(0, 20).map((log, i) => (
            <div key={i} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={`w-2 h-2 rounded-full ${
                    log.status === 'success' ? 'bg-green-500' :
                    log.status === 'partial' ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                />
                <div>
                  <div className="font-medium text-sm" style={{ color: 'var(--cmf-text)' }}>
                    {log.source || 'Manual sync'}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--cmf-text-muted)' }}>
                    {log.itemsProcessed || 0} items processed
                  </div>
                </div>
              </div>
              <div className="text-xs" style={{ color: 'var(--cmf-text-faint)' }}>
                {new Date(log.timestamp).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const tabs: { id: ActiveTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'pulse', label: 'Pulse' },
    { id: 'entomate', label: 'Entomate' },
    { id: 'logs', label: 'Sync Logs' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--cmf-text)' }}>
          Connect Hub
        </h1>
        <p style={{ color: 'var(--cmf-text-muted)' }}>
          Manage communication integrations and sync meeting data from Pulse and Entomate
        </p>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 p-1 rounded-lg"
        style={{ backgroundColor: 'var(--cmf-surface)' }}
      >
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors"
            style={{
              backgroundColor: activeTab === tab.id ? 'var(--cmf-bg)' : 'transparent',
              color: activeTab === tab.id ? 'var(--cmf-text)' : 'var(--cmf-text-muted)',
              boxShadow: activeTab === tab.id ? 'var(--cmf-shadow-sm)' : 'none'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'pulse' && renderPulseSettings()}
      {activeTab === 'entomate' && renderEntomateSettings()}
      {activeTab === 'logs' && renderLogs()}
    </div>
  );
};

export default ConnectHub;
