import React, { useState, useEffect } from 'react';
import { getAutoSyncConfig, updateAutoSyncConfig } from '../../services/pulseApiService';
import { logger } from '../../utils/logger';

export function AutoSyncSettings() {
  const [config, setConfig] = useState({
    enabled: false,
    interval_hours: 24,
    next_sync_at: null as string | null,
    auto_label_enabled: false
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [updatingLabel, setUpdatingLabel] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const userId = 'feedaa8d-1f48-4ad1-b757-11c7b79b7510';
      const data = await getAutoSyncConfig(userId);
      setConfig(data);
    } catch (err) {
      logger.error('[AutoSync] Failed to load config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    setUpdating(true);
    try {
      const userId = 'feedaa8d-1f48-4ad1-b757-11c7b79b7510';
      const newConfig = await updateAutoSyncConfig(userId, {
        enabled: !config.enabled,
        interval_hours: config.interval_hours,
        auto_label_enabled: config.auto_label_enabled
      });
      setConfig(newConfig);
      logger.info(`[AutoSync] ${newConfig.enabled ? 'Enabled' : 'Disabled'}`);
    } catch (err) {
      logger.error('[AutoSync] Failed to update config:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleLabelToggle = async () => {
    setUpdatingLabel(true);
    try {
      const userId = 'feedaa8d-1f48-4ad1-b757-11c7b79b7510';
      const newConfig = await updateAutoSyncConfig(userId, {
        enabled: config.enabled,
        interval_hours: config.interval_hours,
        auto_label_enabled: !config.auto_label_enabled
      });
      setConfig(newConfig);
      logger.info(`[AutoLabel] ${newConfig.auto_label_enabled ? 'Enabled' : 'Disabled'}`);
    } catch (err) {
      logger.error('[AutoLabel] Failed to update config:', err);
    } finally {
      setUpdatingLabel(false);
    }
  };

  const formatNextSync = (dateString: string | null) => {
    if (!dateString) return 'Not scheduled';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours < 0) return 'Overdue';
    if (diffHours === 0 && diffMinutes < 60) return `in ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
    if (diffHours < 24) return `in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;

    const diffDays = Math.floor(diffHours / 24);
    return `in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
      {/* Auto-Sync Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <span>⏰</span>
            Automatic Sync
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Sync contacts from Google every {config.interval_hours} hours
          </p>
          {config.enabled && config.next_sync_at && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Next sync: {formatNextSync(config.next_sync_at)}
            </p>
          )}
        </div>

        <button
          onClick={handleToggle}
          disabled={updating}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full
            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${config.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}
            ${updating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          role="switch"
          aria-checked={config.enabled}
          aria-label="Toggle automatic sync"
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white shadow-lg
              transition-transform duration-200 ease-in-out
              ${config.enabled ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700"></div>

      {/* Auto-Labeling Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <span>🏷️</span>
            Auto-Labeling
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Automatically add "Logos Vision" label to synced contacts in Google
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {config.auto_label_enabled
              ? '✓ Contacts will be labeled when imported'
              : 'Contacts will not be labeled'
            }
          </p>
        </div>

        <button
          onClick={handleLabelToggle}
          disabled={updatingLabel}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full
            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
            ${config.auto_label_enabled ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}
            ${updatingLabel ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          role="switch"
          aria-checked={config.auto_label_enabled}
          aria-label="Toggle automatic labeling"
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white shadow-lg
              transition-transform duration-200 ease-in-out
              ${config.auto_label_enabled ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>
    </div>
  );
}
