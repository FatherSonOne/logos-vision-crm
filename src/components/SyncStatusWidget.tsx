// src/components/SyncStatusWidget.tsx
// A compact widget showing Pulse sync status
// Can be displayed in the header or sidebar

import React, { useState, useEffect } from 'react';
import {
  pulseIntegrationService,
  type SyncStatus
} from '../services/pulseIntegrationService';
import { RefreshIcon, CheckIcon, AlertIcon, CloudIcon } from './icons';

interface SyncStatusWidgetProps {
  variant?: 'compact' | 'full';
  onOpenSettings?: () => void;
  projects?: any[];
  clients?: any[];
  cases?: any[];
  tasks?: any[];
  activities?: any[];
}

export const SyncStatusWidget: React.FC<SyncStatusWidgetProps> = ({
  variant = 'compact',
  onOpenSettings,
  projects = [],
  clients = [],
  cases = [],
  tasks = [],
  activities = [],
}) => {
  const [status, setStatus] = useState<SyncStatus>(pulseIntegrationService.getSyncStatus());
  const [isHovered, setIsHovered] = useState(false);

  // Subscribe to status changes
  useEffect(() => {
    const unsubscribe = pulseIntegrationService.onStatusChange(setStatus);
    return unsubscribe;
  }, []);

  // Handle manual sync
  const handleSync = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (status.isSyncing) return;

    try {
      await pulseIntegrationService.performFullSync(projects, clients, cases, tasks, activities);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  // Get status indicator
  const getStatusIndicator = () => {
    if (status.isSyncing) {
      return {
        color: 'text-amber-500',
        bgColor: 'bg-amber-100 dark:bg-amber-900/30',
        icon: <RefreshIcon />,
        text: 'Syncing...',
        animate: true,
      };
    }
    if (status.isConnected) {
      return {
        color: 'text-teal-500',
        bgColor: 'bg-teal-100 dark:bg-teal-900/30',
        icon: <CheckIcon />,
        text: 'Connected',
        animate: false,
      };
    }
    return {
      color: 'text-red-500',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      icon: <AlertIcon />,
      text: 'Disconnected',
      animate: false,
    };
  };

  const indicator = getStatusIndicator();

  // Compact variant - just an icon button
  if (variant === 'compact') {
    return (
      <div className="relative">
        <button
          onClick={onOpenSettings || handleSync}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`relative p-2 rounded-lg transition-all ${indicator.bgColor} ${indicator.color} hover:scale-105`}
          title={`Pulse: ${indicator.text}`}
        >
          <span className={indicator.animate ? 'animate-spin' : ''}>
            <CloudIcon />
          </span>
          {/* Status dot */}
          <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
            status.isSyncing ? 'bg-amber-500 animate-pulse' :
            status.isConnected ? 'bg-teal-500' : 'bg-red-500'
          }`} />
        </button>

        {/* Hover tooltip */}
        {isHovered && (
          <div className="absolute right-0 mt-2 w-64 p-3 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-white/20 dark:border-slate-700 z-50">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center text-white`}>
                <CloudIcon />
              </div>
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                  Pulse Integration
                </div>
                <div className={`text-xs ${indicator.color}`}>
                  {indicator.text}
                </div>
              </div>
            </div>

            {status.isSyncing && (
              <div className="mb-2">
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all"
                    style={{ width: `${status.syncProgress}%` }}
                  />
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {status.currentOperation}
                </div>
              </div>
            )}

            <div className="text-xs text-slate-500 dark:text-slate-400">
              {status.lastSyncTime ? (
                <>Last sync: {new Date(status.lastSyncTime).toLocaleString()}</>
              ) : (
                <>Never synced</>
              )}
            </div>

            <div className="flex gap-2 mt-3">
              <button
                onClick={handleSync}
                disabled={status.isSyncing}
                className="flex-1 px-2 py-1 text-xs font-medium bg-teal-500 text-white rounded hover:bg-teal-600 disabled:opacity-50"
              >
                Sync Now
              </button>
              {onOpenSettings && (
                <button
                  onClick={onOpenSettings}
                  className="flex-1 px-2 py-1 text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded hover:bg-slate-300 dark:hover:bg-slate-600"
                >
                  Settings
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full variant - shows more details
  return (
    <div className="p-4 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-xl border border-white/20 dark:border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center text-white">
            <CloudIcon />
          </div>
          <div>
            <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
              Pulse Sync
            </div>
            <div className={`text-xs flex items-center gap-1 ${indicator.color}`}>
              <span className={indicator.animate ? 'animate-spin' : ''}>{indicator.icon}</span>
              {indicator.text}
            </div>
          </div>
        </div>
        <button
          onClick={handleSync}
          disabled={status.isSyncing}
          className={`p-2 rounded-lg transition-all ${
            status.isSyncing
              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-500'
              : 'bg-teal-100 dark:bg-teal-900/30 text-teal-500 hover:bg-teal-200 dark:hover:bg-teal-900/50'
          }`}
        >
          <RefreshIcon />
        </button>
      </div>

      {/* Sync Progress */}
      {status.isSyncing && (
        <div className="mb-3">
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all"
              style={{ width: `${status.syncProgress}%` }}
            />
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {status.currentOperation}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="p-2 bg-white/50 dark:bg-black/20 rounded-lg">
          <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
            {status.statistics.totalSyncs}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Total Syncs</div>
        </div>
        <div className="p-2 bg-white/50 dark:bg-black/20 rounded-lg">
          <div className="text-lg font-bold text-violet-600 dark:text-violet-400">
            {status.statistics.itemsSynced}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Items</div>
        </div>
      </div>

      {/* Last Sync Time */}
      <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 text-center">
        {status.lastSyncTime ? (
          <>Last sync: {new Date(status.lastSyncTime).toLocaleString()}</>
        ) : (
          <>Never synced</>
        )}
      </div>

      {/* Settings Link */}
      {onOpenSettings && (
        <button
          onClick={onOpenSettings}
          className="w-full mt-3 px-3 py-2 text-xs font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors"
        >
          Integration Settings →
        </button>
      )}
    </div>
  );
};
