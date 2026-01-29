import React, { useState, useEffect } from 'react';
import { triggerPulseSync, pollSyncStatus, getGoogleAuthUrl, pushContactsToGoogle, type SyncJob } from '../../services/pulseApiService';
import { logger } from '../../utils/logger';
import { ContactPreviewModal } from './ContactPreviewModal';

export function PulseSyncButton() {
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<SyncJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authorizationRequired, setAuthorizationRequired] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [pushResult, setPushResult] = useState<{ created: number; updated: number; failed: number } | null>(null);

  // Check for OAuth callback params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthSuccess = params.get('oauth_success');
    const oauthError = params.get('oauth_error');

    if (oauthSuccess === 'true') {
      logger.info('[PulseSyncButton] OAuth authorization successful!');
      // Clean up URL params
      window.history.replaceState({}, '', window.location.pathname);
    } else if (oauthError) {
      logger.error('[PulseSyncButton] OAuth error:', oauthError);
      setError(`Authorization failed: ${oauthError}`);
      // Clean up URL params
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleAuthorize = async () => {
    try {
      setSyncing(true);
      setError(null);
      logger.info('[PulseSyncButton] Getting Google OAuth authorization URL');

      const userId = 'feedaa8d-1f48-4ad1-b757-11c7b79b7510';

      // Get authorization URL
      const { auth_url } = await getGoogleAuthUrl(userId);

      logger.info('[PulseSyncButton] Redirecting to Google OAuth...');

      // Redirect to Google OAuth
      window.location.href = auth_url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('[PulseSyncButton] Authorization error:', err);
      setError(errorMessage);
      setSyncing(false);
    }
  };

  const handlePushToGoogle = async () => {
    try {
      setPushing(true);
      setError(null);
      setPushResult(null);
      logger.info('[PulseSyncButton] Starting push to Google');

      const userId = 'feedaa8d-1f48-4ad1-b757-11c7b79b7510';

      const result = await pushContactsToGoogle(userId);
      logger.info(`[PulseSyncButton] Push completed: ${result.created} created, ${result.updated} updated, ${result.failed} failed`);

      setPushResult(result);

      // Refresh page after successful push
      if (result.created > 0 || result.updated > 0) {
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('[PulseSyncButton] Push error:', err);

      // Check if error is OAuth-related
      if (errorMessage.includes('OAuth') || errorMessage.includes('tokens') || errorMessage.includes('authorize')) {
        setAuthorizationRequired(true);
        setError('Google authorization required. Please click "Authorize" to connect your Google account.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setPushing(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      setError(null);
      setAuthorizationRequired(false);
      setPushResult(null);
      logger.info('[PulseSyncButton] Starting Google Contacts sync');

      // Get current user ID from Supabase auth
      const userId = 'feedaa8d-1f48-4ad1-b757-11c7b79b7510';

      // Trigger sync
      const syncJob = await triggerPulseSync({
        workspace_id: userId,
        sync_type: 'contacts',
        filter: {
          label: 'Logos Vision', // Only sync contacts with this label
        },
      });

      logger.info(`[PulseSyncButton] Sync job created: ${syncJob.sync_id}`);
      setSyncProgress(syncJob);

      // Poll for status
      const finalStatus = await pollSyncStatus(
        syncJob.sync_id,
        (progress) => {
          logger.info(`[PulseSyncButton] Sync progress: ${progress.synced}/${progress.total_contacts}`);
          setSyncProgress(progress);
        }
      );

      logger.info(`[PulseSyncButton] Sync completed: ${finalStatus.status}`);
      setSyncProgress(finalStatus);

      // Check if sync failed due to OAuth issue
      if (finalStatus.status === 'failed' && finalStatus.message) {
        const errorMsg = finalStatus.message;
        if (errorMsg.includes('OAuth') || errorMsg.includes('tokens') || errorMsg.includes('authorize')) {
          throw new Error(errorMsg);
        }
        throw new Error(`Sync failed: ${errorMsg}`);
      }

      // Refresh page after successful sync
      if (finalStatus.status === 'completed') {
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('[PulseSyncButton] Sync error:', err);

      // Check if error is OAuth-related
      if (errorMessage.includes('OAuth') || errorMessage.includes('tokens') || errorMessage.includes('authorize')) {
        setAuthorizationRequired(true);
        setError('Google authorization required. Please click "Authorize" to connect your Google account.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <div className="inline-flex flex-col gap-2">
        {authorizationRequired ? (
          <button
            type="button"
            onClick={handleAuthorize}
            disabled={syncing}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm
              flex items-center gap-2
              transition-all duration-200
              ${syncing
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white shadow-md hover:shadow-lg'
              }
            `}
            aria-label="Authorize Google Contacts access"
          >
            <span>🔐</span>
            Authorize Google Contacts
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSync}
              disabled={syncing}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm
                flex items-center gap-2
                transition-all duration-200
                ${syncing
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg'
                }
              `}
              aria-label="Sync with Google Contacts via Pulse"
            >
              <span className={syncing ? 'animate-spin' : ''}>
                {syncing ? '⏳' : '🔄'}
              </span>
              {syncing ? 'Syncing...' : 'Sync All'}
            </button>
            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              disabled={syncing || pushing}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm
                flex items-center gap-2
                transition-all duration-200
                ${syncing || pushing
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg'
                }
              `}
              aria-label="Preview and select contacts to import"
            >
              <span>👁️</span>
              Preview & Select
            </button>
            <button
              type="button"
              onClick={handlePushToGoogle}
              disabled={syncing || pushing}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm
                flex items-center gap-2
                transition-all duration-200
                ${syncing || pushing
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg'
                }
              `}
              aria-label="Push Logos Vision contacts to Google"
            >
              <span className={pushing ? 'animate-spin' : ''}>
                {pushing ? '⏳' : '⬆️'}
              </span>
              {pushing ? 'Pushing...' : 'Push to Google'}
            </button>
          </div>
        )}

      {syncProgress && (
        <div className="text-xs space-y-1">
          {syncProgress.status === 'in_progress' && (
            <span className="text-gray-600 dark:text-gray-400">
              Syncing: {syncProgress.synced}/{syncProgress.total_contacts} contacts
            </span>
          )}
          {syncProgress.status === 'completed' && (
            <>
              <div className="text-green-600 dark:text-green-400">
                ✅ {syncProgress.synced} contacts imported successfully
              </div>
              {(syncProgress.skipped_no_identifier || 0) > 0 && (
                <div className="text-yellow-600 dark:text-yellow-400">
                  ⚠️ {syncProgress.skipped_no_identifier} skipped (no email/phone)
                </div>
              )}
              {syncProgress.failed > 0 && (
                <div className="text-orange-600 dark:text-orange-400">
                  ℹ️ {syncProgress.failed} contacts had issues
                </div>
              )}
              {(syncProgress.failed_database_error || 0) > 0 && (
                <div className="text-red-600 dark:text-red-400">
                  ❌ {syncProgress.failed_database_error} database errors
                </div>
              )}
            </>
          )}
          {syncProgress.status === 'failed' && (
            <span className="text-red-600 dark:text-red-400">
              ❌ Sync failed
            </span>
          )}
        </div>
      )}

      {pushResult && (
        <div className="text-xs space-y-1">
          <div className="text-green-600 dark:text-green-400">
            ✅ Pushed to Google: {pushResult.created} created, {pushResult.updated} updated
          </div>
          {pushResult.failed > 0 && (
            <div className="text-red-600 dark:text-red-400">
              ❌ {pushResult.failed} failed
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="text-xs text-red-600 dark:text-red-400">
          Error: {error}
        </div>
      )}
    </div>

    <ContactPreviewModal
      isOpen={showPreviewModal}
      onClose={() => setShowPreviewModal(false)}
      onImportComplete={() => {
        // Refresh page after import
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }}
      workspaceId="feedaa8d-1f48-4ad1-b757-11c7b79b7510"
    />
  </>
  );
}
