// src/components/PulseIntegrationSettings.tsx
// Settings page for Pulse Integration configuration
// Allows users to configure sync settings, view logs, and manage the integration

import React, { useState, useEffect } from 'react';
import {
  pulseIntegrationService,
  type PulseIntegrationConfig,
  type SyncStatus,
  type SyncLogEntry
} from '../services/pulseIntegrationService';
import {
  SettingsIcon, RefreshIcon, CheckIcon, AlertIcon, ClockIcon,
  CloudIcon, ExternalLinkIcon, TrashIcon, PlayIcon, InfoIcon
} from './icons';

interface PulseIntegrationSettingsProps {
  projects?: any[];
  clients?: any[];
  cases?: any[];
  tasks?: any[];
  activities?: any[];
  onSyncComplete?: () => void;
}

// Toggle Switch Component
const Toggle: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}> = ({ checked, onChange, label, description }) => (
  <div className="flex items-center justify-between py-3">
    <div>
      <div className="font-medium text-slate-800 dark:text-slate-200">{label}</div>
      {description && (
        <div className="text-sm text-slate-500 dark:text-slate-400">{description}</div>
      )}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

// Select Component
const Select: React.FC<{
  value: string;
  onChange: (value: string) => void;
  label: string;
  options: { value: string; label: string }[];
  description?: string;
}> = ({ value, onChange, label, options, description }) => (
  <div className="py-3">
    <label className="block">
      <div className="font-medium text-slate-800 dark:text-slate-200 mb-1">{label}</div>
      {description && (
        <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">{description}</div>
      )}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full p-2 bg-white/50 dark:bg-black/20 border border-white/30 dark:border-white/20 rounded-lg text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  </div>
);

// Sync Log Entry Component
const SyncLogItem: React.FC<{ log: SyncLogEntry }> = ({ log }) => {
  const getStatusBadge = () => {
    switch (log.status) {
      case 'success':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300 rounded-full text-xs font-medium">
            <CheckIcon /> Success
          </span>
        );
      case 'partial':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 rounded-full text-xs font-medium">
            <AlertIcon /> Partial
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 rounded-full text-xs font-medium">
            <AlertIcon /> Failed
          </span>
        );
    }
  };

  const formatDirection = (dir: string) => {
    switch (dir) {
      case 'logos_to_pulse': return 'Logos → Pulse';
      case 'pulse_to_logos': return 'Pulse → Logos';
      case 'bidirectional': return 'Bidirectional';
      default: return dir;
    }
  };

  return (
    <div className="p-3 bg-white/30 dark:bg-black/20 rounded-lg border border-white/20 dark:border-white/10">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {formatDirection(log.direction)}
          </span>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {new Date(log.timestamp).toLocaleString()}
        </span>
      </div>
      <div className="text-sm text-slate-700 dark:text-slate-300">
        {log.itemsSynced} items synced
        {log.itemsFailed > 0 && `, ${log.itemsFailed} failed`}
        <span className="text-slate-500 dark:text-slate-400"> · {log.duration}ms</span>
      </div>
      {log.error && (
        <div className="mt-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
          {log.error}
        </div>
      )}
    </div>
  );
};

export const PulseIntegrationSettings: React.FC<PulseIntegrationSettingsProps> = ({
  projects = [],
  clients = [],
  cases = [],
  tasks = [],
  activities = [],
  onSyncComplete
}) => {
  const [config, setConfig] = useState<PulseIntegrationConfig>(pulseIntegrationService.getConfig());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(pulseIntegrationService.getSyncStatus());
  const [syncLogs, setSyncLogs] = useState<SyncLogEntry[]>(pulseIntegrationService.getSyncLogs(20));
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);

  // Subscribe to status changes
  useEffect(() => {
    const unsubscribe = pulseIntegrationService.onStatusChange(status => {
      setSyncStatus(status);
      setSyncLogs(status.recentLogs);
    });
    return unsubscribe;
  }, []);

  // Update config
  const updateConfig = (updates: Partial<PulseIntegrationConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    pulseIntegrationService.setConfig(updates);
  };

  // Manual sync
  const handleManualSync = async () => {
    try {
      await pulseIntegrationService.performFullSync(projects, clients, cases, tasks, activities);
      onSyncComplete?.();
    } catch (error) {
      console.error('Manual sync failed:', error);
    }
  };

  // Check connection
  const handleCheckConnection = async () => {
    setIsCheckingConnection(true);
    await pulseIntegrationService.checkConnection();
    setIsCheckingConnection(false);
  };

  // Clear sync logs
  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear all sync logs?')) {
      pulseIntegrationService.clearSyncLogs();
      setSyncLogs([]);
    }
  };

  // Open Pulse app
  const handleOpenPulse = () => {
    pulseIntegrationService.openPulseApp();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center text-white">
              <CloudIcon />
            </div>
            Pulse Integration
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Configure synchronization between Logos Vision and Pulse
          </p>
        </div>
        <button
          onClick={handleOpenPulse}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg hover:from-violet-600 hover:to-purple-600 transition-all"
        >
          <ExternalLinkIcon />
          Open Pulse App
        </button>
      </div>

      {/* Connection Status Card */}
      <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-xl p-6 border border-white/20 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <SettingsIcon />
          Connection Status
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Connection Status */}
          <div className="p-4 bg-white/50 dark:bg-black/20 rounded-lg">
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Status</div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${syncStatus.isConnected ? 'bg-teal-500' : 'bg-red-500'}`} />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {syncStatus.isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <button
              onClick={handleCheckConnection}
              disabled={isCheckingConnection}
              className="mt-2 text-xs text-teal-600 dark:text-teal-400 hover:underline disabled:opacity-50"
            >
              {isCheckingConnection ? 'Checking...' : 'Check connection'}
            </button>
          </div>

          {/* Last Sync */}
          <div className="p-4 bg-white/50 dark:bg-black/20 rounded-lg">
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Last Sync</div>
            <div className="font-semibold text-slate-800 dark:text-slate-200">
              {syncStatus.lastSyncTime
                ? new Date(syncStatus.lastSyncTime).toLocaleString()
                : 'Never'}
            </div>
          </div>

          {/* Sync Progress */}
          <div className="p-4 bg-white/50 dark:bg-black/20 rounded-lg">
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">
              {syncStatus.isSyncing ? 'Syncing...' : 'Ready'}
            </div>
            {syncStatus.isSyncing ? (
              <>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all"
                    style={{ width: `${syncStatus.syncProgress}%` }}
                  />
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {syncStatus.currentOperation}
                </div>
              </>
            ) : (
              <button
                onClick={handleManualSync}
                disabled={syncStatus.isSyncing || !syncStatus.isConnected}
                className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <PlayIcon />
                Sync Now
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Card */}
      <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-xl p-6 border border-white/20 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <InfoIcon />
          Sync Statistics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white/50 dark:bg-black/20 rounded-lg text-center">
            <div className="text-3xl font-bold text-slate-800 dark:text-slate-200">
              {syncStatus.statistics.totalSyncs}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Total Syncs</div>
          </div>
          <div className="p-4 bg-white/50 dark:bg-black/20 rounded-lg text-center">
            <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">
              {syncStatus.statistics.successfulSyncs}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Successful</div>
          </div>
          <div className="p-4 bg-white/50 dark:bg-black/20 rounded-lg text-center">
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              {syncStatus.statistics.failedSyncs}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Failed</div>
          </div>
          <div className="p-4 bg-white/50 dark:bg-black/20 rounded-lg text-center">
            <div className="text-3xl font-bold text-violet-600 dark:text-violet-400">
              {syncStatus.statistics.itemsSynced}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Items Synced</div>
          </div>
        </div>
      </div>

      {/* Configuration Card */}
      <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-xl p-6 border border-white/20 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <SettingsIcon />
          Sync Configuration
        </h2>

        <div className="divide-y divide-white/20 dark:divide-slate-700">
          <Toggle
            checked={config.isEnabled}
            onChange={checked => updateConfig({ isEnabled: checked })}
            label="Enable Integration"
            description="Turn on/off synchronization with Pulse"
          />

          <Select
            value={config.syncDirection}
            onChange={value => updateConfig({ syncDirection: value as any })}
            label="Sync Direction"
            description="Choose which direction data should flow"
            options={[
              { value: 'bidirectional', label: 'Bidirectional (Both ways)' },
              { value: 'logos_to_pulse', label: 'Logos → Pulse only' },
              { value: 'pulse_to_logos', label: 'Pulse → Logos only' },
            ]}
          />

          <Select
            value={config.syncFrequency}
            onChange={value => updateConfig({ syncFrequency: value as any })}
            label="Sync Frequency"
            description="How often should data be synchronized"
            options={[
              { value: 'manual', label: 'Manual only' },
              { value: 'realtime', label: 'Real-time (WebSocket)' },
              { value: '5min', label: 'Every 5 minutes' },
              { value: '15min', label: 'Every 15 minutes' },
              { value: 'hourly', label: 'Every hour' },
            ]}
          />

          <Select
            value={config.conflictResolution}
            onChange={value => updateConfig({ conflictResolution: value as any })}
            label="Conflict Resolution"
            description="How to handle conflicts when the same data is modified in both apps"
            options={[
              { value: 'newest_wins', label: 'Most recent change wins' },
              { value: 'logos_wins', label: 'Logos Vision always wins' },
              { value: 'pulse_wins', label: 'Pulse always wins' },
            ]}
          />

          <Toggle
            checked={config.autoSyncOnLoad}
            onChange={checked => updateConfig({ autoSyncOnLoad: checked })}
            label="Auto-sync on Load"
            description="Automatically sync when the app loads"
          />
        </div>

        <h3 className="text-md font-semibold text-slate-800 dark:text-slate-200 mt-6 mb-4">
          Data Types to Sync
        </h3>

        <div className="divide-y divide-white/20 dark:divide-slate-700">
          <Toggle
            checked={config.syncTeamMembers}
            onChange={checked => updateConfig({ syncTeamMembers: checked })}
            label="Team Members"
            description="Sync team member profiles and status"
          />
          <Toggle
            checked={config.syncProjects}
            onChange={checked => updateConfig({ syncProjects: checked })}
            label="Projects"
            description="Sync project information and channels"
          />
          <Toggle
            checked={config.syncClients}
            onChange={checked => updateConfig({ syncClients: checked })}
            label="Clients/Contacts"
            description="Sync client and contact information"
          />
          <Toggle
            checked={config.syncActivities}
            onChange={checked => updateConfig({ syncActivities: checked })}
            label="Activities"
            description="Sync activities and meeting notes"
          />
          <Toggle
            checked={config.syncMeetings}
            onChange={checked => updateConfig({ syncMeetings: checked })}
            label="Meetings"
            description="Sync calendar meetings and video calls"
          />
          <Toggle
            checked={config.syncDocuments}
            onChange={checked => updateConfig({ syncDocuments: checked })}
            label="Documents"
            description="Sync shared documents and files"
          />
        </div>
      </div>

      {/* Sync Logs Card */}
      <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-xl p-6 border border-white/20 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ClockIcon />
            Sync History
          </h2>
          {syncLogs.length > 0 && (
            <button
              onClick={handleClearLogs}
              className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <TrashIcon />
              Clear Logs
            </button>
          )}
        </div>

        {syncLogs.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {syncLogs.map(log => (
              <SyncLogItem key={log.id} log={log} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <ClockIcon />
            <p className="mt-2">No sync history yet</p>
            <p className="text-sm">Run a sync to see history here</p>
          </div>
        )}
      </div>
    </div>
  );
};
