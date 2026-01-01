import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { calendarManager } from '../services/calendar';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export function GoogleCalendarCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get authorization code from URL
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const state = searchParams.get('state');

        // Handle error from Google
        if (error) {
          setStatus('error');
          setErrorMessage(`Authorization failed: ${error}`);
          return;
        }

        // Check if we have a code
        if (!code) {
          setStatus('error');
          setErrorMessage('No authorization code received');
          return;
        }

        // Exchange code for tokens
        const credentials = await calendarManager.handleCallback('google', code, state || undefined);

        // Store credentials in localStorage (you might want to use a more secure method)
        localStorage.setItem('google_calendar_credentials', JSON.stringify(credentials));

        setStatus('success');

        // Redirect to settings after 2 seconds
        setTimeout(() => {
          navigate('/settings?tab=calendar&success=true');
        }, 2000);
      } catch (error) {
        console.error('Calendar authorization error:', error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Failed to authorize calendar');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full">
        <div className="text-center">
          {status === 'processing' && (
            <>
              <Loader2 className="w-16 h-16 text-rose-400 animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Connecting Your Calendar
              </h2>
              <p className="text-slate-400">
                Please wait while we complete the authorization...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Successfully Connected!
              </h2>
              <p className="text-slate-400">
                Your Google Calendar is now connected. Redirecting...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Connection Failed
              </h2>
              <p className="text-slate-400 mb-4">
                {errorMessage}
              </p>
              <button
                onClick={() => navigate('/settings?tab=calendar')}
                className="px-6 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-lg transition-colors"
              >
                Back to Settings
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
