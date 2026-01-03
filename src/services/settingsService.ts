// Settings Service - Handles user settings persistence to Supabase
// Falls back to localStorage for anonymous users or when offline

import { supabase } from './supabaseClient';

// ============================================
// TYPES
// ============================================

export interface UserSettings {
  // Account settings
  displayName: string;
  profilePicture: string;

  // General settings
  organizationName: string;
  fiscalYearStart: string;
  currency: string;
  dateFormat: string;
  timezone: string;
  language: string;

  // Appearance settings
  themeMode: 'system' | 'light' | 'dark';
  accentColor: string;
  fontSize: string;
  compactMode: boolean;
  showAnimations: boolean;

  // AI & Search settings
  webSearchEnabled: boolean;
  searchResultLimit: number;
  aiResearchMode: boolean;
  defaultAiModel: string;
  researchDepth: string;

  // Notification settings
  emailNotifications: boolean;
  inAppNotifications: boolean;
  notificationSound: boolean;
  notificationFrequency: string;
  notifyNewDonations: boolean;
  notifyTaskReminders: boolean;
  notifyTeamUpdates: boolean;
  notifySystemAlerts: boolean;

  // Privacy & Security settings
  dataVisibility: string;
  activityLogging: boolean;
  twoFactorEnabled: boolean;

  // Advanced settings
  developerMode: boolean;
  debugLogging: boolean;
  experimentalFeatures: boolean;

  // Backup settings
  autoBackup: boolean;
  backupFrequency: string;
}

// Default settings for new users
export const defaultSettings: UserSettings = {
  displayName: '',
  profilePicture: '',
  organizationName: '',
  fiscalYearStart: 'january',
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  timezone: 'America/New_York',
  language: 'en',
  themeMode: 'system',
  accentColor: 'cyan',
  fontSize: 'medium',
  compactMode: false,
  showAnimations: true,
  webSearchEnabled: true,
  searchResultLimit: 10,
  aiResearchMode: true,
  defaultAiModel: 'claude-sonnet',
  researchDepth: 'balanced',
  emailNotifications: true,
  inAppNotifications: true,
  notificationSound: true,
  notificationFrequency: 'instant',
  notifyNewDonations: true,
  notifyTaskReminders: true,
  notifyTeamUpdates: true,
  notifySystemAlerts: true,
  dataVisibility: 'team',
  activityLogging: true,
  twoFactorEnabled: false,
  developerMode: false,
  debugLogging: false,
  experimentalFeatures: false,
  autoBackup: true,
  backupFrequency: 'weekly',
};

// Map camelCase to snake_case for database columns
function toSnakeCase(settings: Partial<UserSettings>): Record<string, any> {
  const snakeCaseMap: Record<string, string> = {
    displayName: 'display_name',
    profilePicture: 'profile_picture',
    organizationName: 'organization_name',
    fiscalYearStart: 'fiscal_year_start',
    dateFormat: 'date_format',
    themeMode: 'theme_mode',
    accentColor: 'accent_color',
    fontSize: 'font_size',
    compactMode: 'compact_mode',
    showAnimations: 'show_animations',
    webSearchEnabled: 'web_search_enabled',
    searchResultLimit: 'search_result_limit',
    aiResearchMode: 'ai_research_mode',
    defaultAiModel: 'default_ai_model',
    researchDepth: 'research_depth',
    emailNotifications: 'email_notifications',
    inAppNotifications: 'in_app_notifications',
    notificationSound: 'notification_sound',
    notificationFrequency: 'notification_frequency',
    notifyNewDonations: 'notify_new_donations',
    notifyTaskReminders: 'notify_task_reminders',
    notifyTeamUpdates: 'notify_team_updates',
    notifySystemAlerts: 'notify_system_alerts',
    dataVisibility: 'data_visibility',
    activityLogging: 'activity_logging',
    twoFactorEnabled: 'two_factor_enabled',
    developerMode: 'developer_mode',
    debugLogging: 'debug_logging',
    experimentalFeatures: 'experimental_features',
    autoBackup: 'auto_backup',
    backupFrequency: 'backup_frequency',
  };

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(settings)) {
    const snakeKey = snakeCaseMap[key] || key;
    result[snakeKey] = value;
  }
  return result;
}

// Map snake_case to camelCase for application use
function toCamelCase(data: Record<string, any>): Partial<UserSettings> {
  const camelCaseMap: Record<string, keyof UserSettings> = {
    display_name: 'displayName',
    profile_picture: 'profilePicture',
    organization_name: 'organizationName',
    fiscal_year_start: 'fiscalYearStart',
    date_format: 'dateFormat',
    theme_mode: 'themeMode',
    accent_color: 'accentColor',
    font_size: 'fontSize',
    compact_mode: 'compactMode',
    show_animations: 'showAnimations',
    web_search_enabled: 'webSearchEnabled',
    search_result_limit: 'searchResultLimit',
    ai_research_mode: 'aiResearchMode',
    default_ai_model: 'defaultAiModel',
    research_depth: 'researchDepth',
    email_notifications: 'emailNotifications',
    in_app_notifications: 'inAppNotifications',
    notification_sound: 'notificationSound',
    notification_frequency: 'notificationFrequency',
    notify_new_donations: 'notifyNewDonations',
    notify_task_reminders: 'notifyTaskReminders',
    notify_team_updates: 'notifyTeamUpdates',
    notify_system_alerts: 'notifySystemAlerts',
    data_visibility: 'dataVisibility',
    activity_logging: 'activityLogging',
    two_factor_enabled: 'twoFactorEnabled',
    developer_mode: 'developerMode',
    debug_logging: 'debugLogging',
    experimental_features: 'experimentalFeatures',
    auto_backup: 'autoBackup',
    backup_frequency: 'backupFrequency',
  };

  const result: Partial<UserSettings> = {};
  for (const [key, value] of Object.entries(data)) {
    const camelKey = camelCaseMap[key];
    if (camelKey && value !== null && value !== undefined) {
      (result as any)[camelKey] = value;
    }
  }
  return result;
}

// ============================================
// LOCAL STORAGE HELPERS (fallback)
// ============================================

const LOCAL_STORAGE_KEY = 'user_settings';

function getLocalSettings(): UserSettings {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      return { ...defaultSettings, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load settings from localStorage:', e);
  }
  return { ...defaultSettings };
}

function saveLocalSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage:', e);
  }
}

// ============================================
// SUPABASE OPERATIONS
// ============================================

/**
 * Get user settings from Supabase
 * Falls back to localStorage if user is not authenticated
 */
export async function getUserSettings(): Promise<UserSettings> {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Not authenticated, use localStorage
      return getLocalSettings();
    }

    // Fetch settings from Supabase
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      // If no settings exist yet, return defaults
      if (error.code === 'PGRST116') {
        return { ...defaultSettings };
      }
      throw error;
    }

    // Merge with defaults in case new settings were added
    return { ...defaultSettings, ...toCamelCase(data) };
  } catch (e) {
    console.error('Failed to load settings from Supabase, falling back to localStorage:', e);
    return getLocalSettings();
  }
}

/**
 * Save user settings to Supabase
 * Falls back to localStorage if user is not authenticated
 */
export async function saveUserSettings(settings: UserSettings): Promise<void> {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Not authenticated, use localStorage
      saveLocalSettings(settings);
      return;
    }

    // Convert to snake_case for database
    const dbSettings = toSnakeCase(settings);

    // Upsert settings (insert or update)
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        ...dbSettings,
      }, {
        onConflict: 'user_id',
      });

    if (error) throw error;

    // Also save to localStorage as backup/cache
    saveLocalSettings(settings);
  } catch (e) {
    console.error('Failed to save settings to Supabase, saving to localStorage:', e);
    saveLocalSettings(settings);
    throw e; // Re-throw so caller knows save partially failed
  }
}

/**
 * Update specific settings (partial update)
 */
export async function updateUserSettings(updates: Partial<UserSettings>): Promise<UserSettings> {
  const currentSettings = await getUserSettings();
  const newSettings = { ...currentSettings, ...updates };
  await saveUserSettings(newSettings);
  return newSettings;
}

/**
 * Reset settings to defaults
 */
export async function resetUserSettings(): Promise<UserSettings> {
  await saveUserSettings({ ...defaultSettings });
  return { ...defaultSettings };
}

/**
 * Sync local settings to Supabase (useful after login)
 * This merges localStorage settings with any existing Supabase settings
 */
export async function syncSettingsAfterLogin(): Promise<UserSettings> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return getLocalSettings();
    }

    // Get existing Supabase settings
    const { data: supabaseData } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Get local settings
    const localSettings = getLocalSettings();

    if (supabaseData) {
      // Supabase settings exist, use them (they're the source of truth)
      const supabaseSettings = { ...defaultSettings, ...toCamelCase(supabaseData) };
      // Update local cache
      saveLocalSettings(supabaseSettings);
      return supabaseSettings;
    } else {
      // No Supabase settings, upload local settings
      await saveUserSettings(localSettings);
      return localSettings;
    }
  } catch (e) {
    console.error('Failed to sync settings after login:', e);
    return getLocalSettings();
  }
}

/**
 * Subscribe to real-time settings changes (for multi-device sync)
 */
export function subscribeToSettingsChanges(
  callback: (settings: UserSettings) => void
): () => void {
  const channel = supabase
    .channel('user_settings_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_settings',
      },
      async (payload) => {
        if (payload.new) {
          const settings = { ...defaultSettings, ...toCamelCase(payload.new as Record<string, any>) };
          saveLocalSettings(settings);
          callback(settings);
        }
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
}
