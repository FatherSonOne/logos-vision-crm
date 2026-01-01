import { useState, useEffect } from 'react';
import { Calendar, Check, AlertCircle, ExternalLink, RefreshCw, Clock, Globe, Settings, ChevronDown, ChevronRight, Bell, Palette } from 'lucide-react';
import { calendarManager } from '../services/calendar';

interface SyncSettings {
  syncFrequency: 'realtime' | '5min' | '15min' | '30min' | 'hourly' | 'daily';
  biDirectional: boolean;
  syncToLogos: boolean;
  syncFromLogos: boolean;
  autoSync: boolean;
}

interface CalendarPreferences {
  weekStartDay: 0 | 1 | 6; // Sunday, Monday, Saturday
  timeZone: string;
  defaultView: 'month' | 'week' | 'day' | 'agenda' | 'timeline';
  workHoursStart: number;
  workHoursEnd: number;
  showWeekNumbers: boolean;
  defaultReminder: number;
  defaultEventColor: string;
}

const syncFrequencyOptions = [
  { value: 'realtime', label: 'Real-time', description: 'Sync immediately when changes occur' },
  { value: '5min', label: 'Every 5 minutes', description: 'Balanced performance and freshness' },
  { value: '15min', label: 'Every 15 minutes', description: 'Moderate sync frequency' },
  { value: '30min', label: 'Every 30 minutes', description: 'Less frequent updates' },
  { value: 'hourly', label: 'Every hour', description: 'Hourly sync updates' },
  { value: 'daily', label: 'Once daily', description: 'Minimal sync activity' },
];

const eventColors = [
  { name: 'Rose', value: '#f43f5e', class: 'bg-rose-500' },
  { name: 'Blue', value: '#3b82f6', class: 'bg-blue-500' },
  { name: 'Green', value: '#22c55e', class: 'bg-green-500' },
  { name: 'Purple', value: '#a855f7', class: 'bg-purple-500' },
  { name: 'Amber', value: '#f59e0b', class: 'bg-amber-500' },
  { name: 'Teal', value: '#14b8a6', class: 'bg-teal-500' },
  { name: 'Pink', value: '#ec4899', class: 'bg-pink-500' },
  { name: 'Indigo', value: '#6366f1', class: 'bg-indigo-500' },
];

const reminderOptions = [
  { value: 0, label: 'No reminder' },
  { value: 5, label: '5 minutes before' },
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 120, label: '2 hours before' },
  { value: 1440, label: '1 day before' },
  { value: 2880, label: '2 days before' },
];

export function CalendarSettings() {
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isOutlookConnected, setIsOutlookConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const [calendars, setCalendars] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Expanded sections
  const [expandedSection, setExpandedSection] = useState<string | null>('connections');

  // Sync settings
  const [syncSettings, setSyncSettings] = useState<SyncSettings>(() => {
    const saved = localStorage.getItem('calendar_sync_settings');
    return saved ? JSON.parse(saved) : {
      syncFrequency: '5min',
      biDirectional: true,
      syncToLogos: true,
      syncFromLogos: true,
      autoSync: true,
    };
  });

  // Calendar preferences
  const [preferences, setPreferences] = useState<CalendarPreferences>(() => {
    const saved = localStorage.getItem('calendar_preferences');
    return saved ? JSON.parse(saved) : {
      weekStartDay: 0,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      defaultView: 'month',
      workHoursStart: 9,
      workHoursEnd: 17,
      showWeekNumbers: false,
      defaultReminder: 15,
      defaultEventColor: '#f43f5e',
    };
  });

  useEffect(() => {
    // Check connection status
    const googleCreds = localStorage.getItem('google_calendar_credentials');
    const outlookCreds = localStorage.getItem('outlook_calendar_credentials');

    if (googleCreds) {
      setIsGoogleConnected(true);
      loadCalendars('google');
    }
    if (outlookCreds) {
      setIsOutlookConnected(true);
    }
  }, []);

  // Save settings when changed
  useEffect(() => {
    localStorage.setItem('calendar_sync_settings', JSON.stringify(syncSettings));
  }, [syncSettings]);

  useEffect(() => {
    localStorage.setItem('calendar_preferences', JSON.stringify(preferences));
  }, [preferences]);

  const loadCalendars = async (provider: 'google' | 'outlook') => {
    try {
      const credentialsStr = localStorage.getItem(`${provider}_calendar_credentials`);
      if (!credentialsStr) return;

      const credentials = JSON.parse(credentialsStr);
      calendarManager.setCredentials(provider, credentials);

      const calendarList = await calendarManager.listCalendars(provider);
      setCalendars(calendarList);
    } catch (error) {
      console.error(`Failed to load ${provider} calendars:`, error);
    }
  };

  const handleConnect = async (provider: 'google' | 'outlook') => {
    try {
      setConnectingProvider(provider);
      setError('');

      const state = Math.random().toString(36).substring(7);

      if (provider === 'google') {
        const authUrl = calendarManager.getAuthUrl('google', state);
        window.location.href = authUrl;
      } else if (provider === 'outlook') {
        // Outlook OAuth would go here
        // For now, show a message that it's coming soon
        setError('Outlook Calendar integration coming soon! Please use Google Calendar for now.');
        setConnectingProvider(null);
      }
    } catch (error) {
      console.error(`Failed to connect ${provider}:`, error);
      setError(error instanceof Error ? error.message : 'Failed to connect');
      setConnectingProvider(null);
    }
  };

  const handleDisconnect = (provider: 'google' | 'outlook') => {
    localStorage.removeItem(`${provider}_calendar_credentials`);
    if (provider === 'google') {
      setIsGoogleConnected(false);
    } else {
      setIsOutlookConnected(false);
    }
    setCalendars([]);
    setSuccessMessage(`${provider === 'google' ? 'Google' : 'Outlook'} Calendar disconnected`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const SectionHeader = ({ id, title, icon: Icon, description }: { id: string; title: string; icon: any; description: string }) => (
    <button
      onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
          <Icon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
        </div>
        <div className="text-left">
          <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
      </div>
      {expandedSection === id ? (
        <ChevronDown className="w-5 h-5 text-slate-400" />
      ) : (
        <ChevronRight className="w-5 h-5 text-slate-400" />
      )}
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
          <p className="text-sm font-medium text-green-800 dark:text-green-300">{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Calendar Connections Section */}
      <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <SectionHeader
          id="connections"
          title="Calendar Connections"
          icon={Calendar}
          description="Connect your external calendars"
        />

        {expandedSection === 'connections' && (
          <div className="px-4 pb-4 space-y-4">
            {/* Google Calendar */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-200">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">Google Calendar</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {isGoogleConnected ? 'Connected and syncing' : 'Not connected'}
                    </p>
                  </div>
                </div>

                {isGoogleConnected ? (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                      <Check className="w-4 h-4" />
                      Connected
                    </span>
                    <button
                      onClick={() => handleDisconnect('google')}
                      className="px-3 py-1.5 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleConnect('google')}
                    disabled={connectingProvider === 'google'}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
                  >
                    {connectingProvider === 'google' ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4" />
                        Connect
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Connected calendars list */}
              {isGoogleConnected && calendars.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Synced Calendars ({calendars.length})
                  </h5>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {calendars.map((cal) => (
                      <div key={cal.id} className="flex items-center gap-2 text-sm">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cal.backgroundColor || '#3b82f6' }}
                        />
                        <span className="text-slate-600 dark:text-slate-400 truncate">
                          {cal.summary}
                        </span>
                        {cal.primary && (
                          <span className="text-xs px-1.5 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Outlook Calendar */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0078d4] flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21.75 3H8.25C7.56 3 7 3.56 7 4.25v3.5h-.75C5.56 7.75 5 8.31 5 9v10.75c0 .69.56 1.25 1.25 1.25h7.5c.69 0 1.25-.56 1.25-1.25V16h6.75c.69 0 1.25-.56 1.25-1.25V4.25C23 3.56 22.44 3 21.75 3zM13 19H7V9h6v10zm8-5h-6V4.5h6V14z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">Microsoft Outlook</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {isOutlookConnected ? 'Connected and syncing' : 'Coming soon'}
                    </p>
                  </div>
                </div>

                {isOutlookConnected ? (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                      <Check className="w-4 h-4" />
                      Connected
                    </span>
                    <button
                      onClick={() => handleDisconnect('outlook')}
                      className="px-3 py-1.5 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleConnect('outlook')}
                    disabled={true}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg cursor-not-allowed flex items-center gap-2 text-sm"
                  >
                    Coming Soon
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sync Settings Section */}
      <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <SectionHeader
          id="sync"
          title="Sync Settings"
          icon={RefreshCw}
          description="Configure how calendars synchronize"
        />

        {expandedSection === 'sync' && (
          <div className="px-4 pb-4 space-y-4">
            {/* Sync Frequency */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Sync Frequency
              </label>
              <select
                value={syncSettings.syncFrequency}
                onChange={(e) => setSyncSettings({ ...syncSettings, syncFrequency: e.target.value as any })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
              >
                {syncFrequencyOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {syncFrequencyOptions.find(o => o.value === syncSettings.syncFrequency)?.description}
              </p>
            </div>

            {/* Sync Direction */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Sync Direction
              </label>

              <label className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <input
                  type="checkbox"
                  checked={syncSettings.biDirectional}
                  onChange={(e) => setSyncSettings({ ...syncSettings, biDirectional: e.target.checked })}
                  className="w-4 h-4 text-rose-500 rounded focus:ring-rose-500"
                />
                <div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">Bi-directional sync</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Changes sync both ways automatically</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <input
                  type="checkbox"
                  checked={syncSettings.syncToLogos}
                  onChange={(e) => setSyncSettings({ ...syncSettings, syncToLogos: e.target.checked })}
                  className="w-4 h-4 text-rose-500 rounded focus:ring-rose-500"
                />
                <div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">Import to Logos Vision</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Show external events in Logos calendar</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <input
                  type="checkbox"
                  checked={syncSettings.syncFromLogos}
                  onChange={(e) => setSyncSettings({ ...syncSettings, syncFromLogos: e.target.checked })}
                  className="w-4 h-4 text-rose-500 rounded focus:ring-rose-500"
                />
                <div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">Export from Logos Vision</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Push Logos events to external calendars</p>
                </div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Display Preferences Section */}
      <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <SectionHeader
          id="display"
          title="Display Preferences"
          icon={Settings}
          description="Customize calendar appearance"
        />

        {expandedSection === 'display' && (
          <div className="px-4 pb-4 space-y-4">
            {/* Week Start Day */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Week Starts On
              </label>
              <select
                value={preferences.weekStartDay}
                onChange={(e) => setPreferences({ ...preferences, weekStartDay: parseInt(e.target.value) as 0 | 1 | 6 })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
              >
                <option value={0}>Sunday</option>
                <option value={1}>Monday</option>
                <option value={6}>Saturday</option>
              </select>
            </div>

            {/* Time Zone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Time Zone
              </label>
              <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm">
                <Globe className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600 dark:text-slate-400">{preferences.timeZone}</span>
              </div>
            </div>

            {/* Default View */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Default View
              </label>
              <select
                value={preferences.defaultView}
                onChange={(e) => setPreferences({ ...preferences, defaultView: e.target.value as any })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
              >
                <option value="month">Month</option>
                <option value="week">Week</option>
                <option value="day">Day</option>
                <option value="agenda">Agenda</option>
                <option value="timeline">Timeline</option>
              </select>
            </div>

            {/* Work Hours */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Work Hours
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={preferences.workHoursStart}
                  onChange={(e) => setPreferences({ ...preferences, workHoursStart: parseInt(e.target.value) })}
                  className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
                    </option>
                  ))}
                </select>
                <span className="text-slate-500">to</span>
                <select
                  value={preferences.workHoursEnd}
                  onChange={(e) => setPreferences({ ...preferences, workHoursEnd: parseInt(e.target.value) })}
                  className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Show Week Numbers */}
            <label className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50">
              <input
                type="checkbox"
                checked={preferences.showWeekNumbers}
                onChange={(e) => setPreferences({ ...preferences, showWeekNumbers: e.target.checked })}
                className="w-4 h-4 text-rose-500 rounded focus:ring-rose-500"
              />
              <div>
                <span className="text-sm font-medium text-slate-900 dark:text-white">Show week numbers</span>
                <p className="text-xs text-slate-500 dark:text-slate-400">Display week numbers in calendar views</p>
              </div>
            </label>
          </div>
        )}
      </div>

      {/* Event Defaults Section */}
      <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <SectionHeader
          id="events"
          title="Event Defaults"
          icon={Bell}
          description="Default settings for new events"
        />

        {expandedSection === 'events' && (
          <div className="px-4 pb-4 space-y-4">
            {/* Default Reminder */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Default Reminder
              </label>
              <select
                value={preferences.defaultReminder}
                onChange={(e) => setPreferences({ ...preferences, defaultReminder: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
              >
                {reminderOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Default Event Color */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Default Event Color
              </label>
              <div className="flex flex-wrap gap-2">
                {eventColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setPreferences({ ...preferences, defaultEventColor: color.value })}
                    className={`w-8 h-8 rounded-full ${color.class} transition-all ${
                      preferences.defaultEventColor === color.value
                        ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110'
                        : 'hover:scale-105'
                    }`}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Privacy Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-300 mb-1">Privacy & Security</p>
            <p className="text-blue-700 dark:text-blue-400/80">
              Calendar credentials are stored locally in your browser. For production use, we recommend
              setting up server-side OAuth for enhanced security. Your data is never shared with third parties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
