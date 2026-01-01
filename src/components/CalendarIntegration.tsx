import { useEffect, useState } from 'react';
import { Calendar, Check, AlertCircle, ExternalLink, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { calendarManager } from '../services/calendar';

export function CalendarIntegration() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [calendars, setCalendars] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  
  // OAuth callback handling
  const [isProcessingCallback, setIsProcessingCallback] = useState(false);
  const [callbackStatus, setCallbackStatus] = useState<'processing' | 'success' | 'error' | null>(null);
  const [callbackError, setCallbackError] = useState<string>('');

  useEffect(() => {
    // Check if this is an OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    const state = urlParams.get('state');

    if (code || error) {
      handleOAuthCallback(code, error, state);
    } else {
      // Check if already connected
      const credentials = localStorage.getItem('google_calendar_credentials');
      if (credentials) {
        setIsConnected(true);
        loadCalendars();
      }
    }
  }, []);

  const handleOAuthCallback = async (
    code: string | null,
    error: string | null,
    state: string | null
  ) => {
    setIsProcessingCallback(true);
    setCallbackStatus('processing');

    try {
      // Handle error from Google
      if (error) {
        setCallbackStatus('error');
        setCallbackError(`Authorization failed: ${error}`);
        return;
      }

      // Check if we have a code
      if (!code) {
        setCallbackStatus('error');
        setCallbackError('No authorization code received');
        return;
      }

      // Exchange code for tokens
      const credentials = await calendarManager.handleCallback('google', code, state || undefined);

      // Store credentials in localStorage
      localStorage.setItem('google_calendar_credentials', JSON.stringify(credentials));

      setCallbackStatus('success');
      setIsConnected(true);

      // Load calendars
      await loadCalendars();

      // Clear URL parameters after 2 seconds
      setTimeout(() => {
        window.history.replaceState({}, document.title, window.location.pathname);
        setIsProcessingCallback(false);
        setCallbackStatus(null);
      }, 2000);
    } catch (err) {
      console.error('Calendar authorization error:', err);
      setCallbackStatus('error');
      setCallbackError(err instanceof Error ? err.message : 'Failed to authorize calendar');
    }
  };

  const loadCalendars = async () => {
    try {
      const credentialsStr = localStorage.getItem('google_calendar_credentials');
      if (!credentialsStr) return;

      const credentials = JSON.parse(credentialsStr);
      calendarManager.setCredentials('google', credentials);
      
      const calendarList = await calendarManager.listCalendars('google');
      setCalendars(calendarList);
    } catch (error) {
      console.error('Failed to load calendars:', error);
    }
  };

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Generate a random state for security
      const state = Math.random().toString(36).substring(7);
      
      // Get authorization URL and redirect
      const authUrl = calendarManager.getAuthUrl('google', state);
      window.location.href = authUrl;
    } catch (error) {
      console.error('Failed to connect calendar:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect');
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('google_calendar_credentials');
    setIsConnected(false);
    setCalendars([]);
  };

  // Show callback processing overlay
  if (isProcessingCallback && callbackStatus) {
    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl">
          <div className="text-center">
            {callbackStatus === 'processing' && (
              <>
                <Loader2 className="w-16 h-16 text-rose-500 animate-spin mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">
                  Connecting Your Calendar
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Please wait while we complete the authorization...
                </p>
              </>
            )}

            {callbackStatus === 'success' && (
              <>
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">
                  Successfully Connected!
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Your Google Calendar is now connected.
                </p>
              </>
            )}

            {callbackStatus === 'error' && (
              <>
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">
                  Connection Failed
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {callbackError}
                </p>
                <button
                  onClick={() => {
                    window.history.replaceState({}, document.title, window.location.pathname);
                    setIsProcessingCallback(false);
                    setCallbackStatus(null);
                  }}
                  className="px-6 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Calendar Integration</h2>
        <p className="text-slate-600 dark:text-slate-400">
          Connect your Google Calendar to sync events and schedules
        </p>
      </div>

      {/* Connection Status */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 rounded-lg">
              <Calendar className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <h3 className="font-semibold">Google Calendar</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {isConnected ? 'Connected' : 'Not connected'}
              </p>
            </div>
          </div>

          {isConnected ? (
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg transition-colors text-sm"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isLoading}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-500/50 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  Connect Calendar
                </>
              )}
            </button>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-600 dark:text-red-400">Connection Failed</p>
              <p className="text-sm text-red-600/80 dark:text-red-300/80 mt-1">{error}</p>
            </div>
          </div>
        )}

        {isConnected && calendars.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-medium mb-3">
              Available Calendars ({calendars.length})
            </h4>
            <div className="space-y-2">
              {calendars.slice(0, 5).map((calendar) => (
                <div
                  key={calendar.id}
                  className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: calendar.backgroundColor || '#ef4444' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{calendar.summary}</p>
                    {calendar.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                        {calendar.description}
                      </p>
                    )}
                  </div>
                  {calendar.primary && (
                    <span className="text-xs px-2 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded">
                      Primary
                    </span>
                  )}
                </div>
              ))}
              {calendars.length > 5 && (
                <p className="text-sm text-slate-600 dark:text-slate-400 text-center py-2">
                  + {calendars.length - 5} more calendars
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Additional Info */}
      <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900 dark:text-blue-300">
            <p className="font-medium mb-1">Privacy & Permissions</p>
            <p className="text-blue-800/80 dark:text-blue-300/80">
              We only request read and write access to your calendar events. Your data is stored
              securely and never shared with third parties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
