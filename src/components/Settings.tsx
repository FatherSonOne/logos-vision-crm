import React, { useState, useMemo, useEffect } from 'react';
import { Button } from './ui/Button';
import { HighlightPicker } from './ui/HighlightPicker';
import {
    SettingsIcon, UsersIcon, DonationIcon, MoonIcon, SunIcon, SearchIcon
} from './icons';
import type { ThemeMode } from '../theme/theme';
import { getStoredThemeMode, setThemeMode, resolveTheme } from '../theme/theme';

interface SettingsProps {
    userEmail?: string;
    organizationName?: string;
}

interface SettingsSection {
    id: string;
    label: string;
    icon: React.ReactNode;
    color: string;
}

// Icons for sections
const UserIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
);

const BellIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
);

const LinkIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
);

const CloudIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
    </svg>
);

const ShieldIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
);

const DownloadIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

const CogIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const sections: SettingsSection[] = [
    { id: 'account', label: 'Account', icon: <UserIcon />, color: 'blue' },
    { id: 'general', label: 'General', icon: <SettingsIcon />, color: 'gray' },
    { id: 'appearance', label: 'Appearance', icon: <SunIcon />, color: 'purple' },
    { id: 'ai-search', label: 'AI & Search', icon: <SearchIcon />, color: 'cyan' },
    { id: 'integrations', label: 'Integrations', icon: <LinkIcon />, color: 'green' },
    { id: 'connectors', label: 'Connectors', icon: <CloudIcon />, color: 'indigo' },
    { id: 'notifications', label: 'Notifications', icon: <BellIcon />, color: 'yellow' },
    { id: 'privacy', label: 'Privacy & Security', icon: <ShieldIcon />, color: 'red' },
    { id: 'team', label: 'Team', icon: <UsersIcon />, color: 'pink' },
    { id: 'backup', label: 'Backup & Export', icon: <DownloadIcon />, color: 'teal' },
    { id: 'advanced', label: 'Advanced', icon: <CogIcon />, color: 'slate' },
];

// Computer/Monitor icon for System theme
const ComputerIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
);

export const Settings: React.FC<SettingsProps> = ({
    userEmail,
    organizationName = 'My Organization'
}) => {
    const [activeSection, setActiveSection] = useState('account');
    const [searchQuery, setSearchQuery] = useState('');
    const [themeMode, setThemeModeState] = useState<ThemeMode>(() => getStoredThemeMode());

    // Handle theme mode changes
    const handleThemeModeChange = (mode: ThemeMode) => {
        setThemeModeState(mode);
        setThemeMode(mode);
    };

    const [settings, setSettings] = useState(() => {
        // Load settings from localStorage
        const loadSetting = (key: string, defaultValue: any) => {
            const saved = localStorage.getItem(key);
            if (saved === null) return defaultValue;
            try {
                return JSON.parse(saved);
            } catch {
                return saved;
            }
        };

        return {
            // Account
            displayName: loadSetting('displayName', ''),
            profilePicture: loadSetting('profilePicture', ''),
            // General
            organizationName: organizationName,
            fiscalYearStart: loadSetting('fiscalYearStart', 'january'),
            currency: loadSetting('currency', 'USD'),
            dateFormat: loadSetting('dateFormat', 'MM/DD/YYYY'),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: loadSetting('language', 'en'),
            // Appearance
            themeMode: getStoredThemeMode(),
            accentColor: loadSetting('accentColor', 'rose'),
            fontSize: loadSetting('fontSize', 'normal'),
            compactMode: loadSetting('compactMode', false),
            showAnimations: loadSetting('showAnimations', true),
            // AI & Search
            webSearchEnabled: loadSetting('webSearchEnabled', true),
            searchResultLimit: loadSetting('searchResultLimit', 10),
            aiResearchMode: loadSetting('aiResearchMode', false),
            defaultAiModel: loadSetting('defaultAiModel', 'gemini'),
            researchDepth: loadSetting('researchDepth', 'normal'),
            // Integrations
            supabaseConnected: true,
            googleConnected: loadSetting('googleConnected', false),
            pulseConnected: loadSetting('pulseConnected', false),
            // Connectors
            googleCalendarSync: loadSetting('googleCalendarSync', false),
            googleDriveSync: loadSetting('googleDriveSync', false),
            outlookSync: loadSetting('outlookSync', false),
            oneDriveSync: loadSetting('oneDriveSync', false),
            dropboxSync: loadSetting('dropboxSync', false),
            // Notifications
            emailNotifications: loadSetting('emailNotifications', true),
            inAppNotifications: loadSetting('inAppNotifications', true),
            soundNotifications: loadSetting('soundNotifications', false),
            notificationFrequency: loadSetting('notificationFrequency', 'realtime'),
            taskReminders: loadSetting('taskReminders', true),
            donationAlerts: loadSetting('donationAlerts', true),
            pledgeReminders: loadSetting('pledgeReminders', true),
            weeklyDigest: loadSetting('weeklyDigest', true),
            // Privacy & Security
            dataVisibility: loadSetting('dataVisibility', 'private'),
            twoFactorEnabled: loadSetting('twoFactorEnabled', false),
            activityLogging: loadSetting('activityLogging', true),
            // Donations (keeping for compatibility)
            defaultCampaign: loadSetting('defaultCampaign', ''),
            enableAnonymous: loadSetting('enableAnonymous', true),
            requireNotes: loadSetting('requireNotes', false),
            autoThankYou: loadSetting('autoThankYou', true),
            thankYouDelay: loadSetting('thankYouDelay', 1),
            // Calendar
            defaultView: loadSetting('defaultView', 'month'),
            weekStartsOn: loadSetting('weekStartsOn', 'sunday'),
            showWeekends: loadSetting('showWeekends', true),
            workingHoursStart: loadSetting('workingHoursStart', '09:00'),
            workingHoursEnd: loadSetting('workingHoursEnd', '17:00'),
            // Backup
            autoBackup: loadSetting('autoBackup', false),
            backupFrequency: loadSetting('backupFrequency', 'weekly'),
            lastBackup: loadSetting('lastBackup', null),
            // Advanced
            developerMode: loadSetting('developerMode', false),
            debugLogging: loadSetting('debugLogging', false),
            experimentalFeatures: loadSetting('experimentalFeatures', false),
        };
    });

    const [hasChanges, setHasChanges] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Filter sections based on search
    const filteredSections = useMemo(() => {
        if (!searchQuery.trim()) return sections;
        const query = searchQuery.toLowerCase();
        return sections.filter(s =>
            s.label.toLowerCase().includes(query) ||
            s.id.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    const updateSetting = (key: string, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
        setSaved(false);

        // Persist to localStorage immediately for certain settings
        const persistKeys = [
            'webSearchEnabled', 'searchResultLimit', 'aiResearchMode',
            'compactMode', 'showAnimations', 'accentColor', 'fontSize',
            'developerMode', 'debugLogging', 'displayName'
        ];
        if (persistKeys.includes(key)) {
            localStorage.setItem(key, JSON.stringify(value));
        }

        // Theme mode is handled separately via theme.ts
        if (key === 'themeMode') {
            handleThemeModeChange(value as ThemeMode);
        }
    };

    const handleSave = async () => {
        setSaving(true);

        // Save all settings to localStorage
        Object.entries(settings).forEach(([key, value]) => {
            if (key !== 'themeMode') { // themeMode is managed separately
                localStorage.setItem(key, JSON.stringify(value));
            }
        });

        // Simulate API save delay
        await new Promise(resolve => setTimeout(resolve, 800));

        setSaving(false);
        setSaved(true);
        setHasChanges(false);

        // Auto-hide saved notification
        setTimeout(() => setSaved(false), 3000);
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    const handleClearCache = () => {
        if (confirm('Clear application cache? This will log you out and reset local data.')) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload();
        }
    };

    const handleExportData = () => {
        const data = {
            settings: settings,
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logos-vision-settings-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const renderSectionContent = () => {
        switch (activeSection) {
            case 'account':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Account & Profile
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white text-2xl font-bold">
                                        {settings.displayName ? settings.displayName.charAt(0).toUpperCase() : userEmail?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <Button variant="outline" size="sm">Upload Photo</Button>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">JPG, PNG up to 2MB</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Display Name
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.displayName}
                                        onChange={(e) => updateSetting('displayName', e.target.value)}
                                        placeholder="Enter your display name"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={userEmail || ''}
                                        readOnly
                                        className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Contact support to change your email address
                                    </p>
                                </div>
                                <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Password</h4>
                                    <Button variant="outline" size="sm">Change Password</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'general':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Organization Settings
                            </h3>
                            <div className="grid gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Organization Name
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.organizationName}
                                        onChange={(e) => updateSetting('organizationName', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Fiscal Year Start
                                        </label>
                                        <select
                                            value={settings.fiscalYearStart}
                                            onChange={(e) => updateSetting('fiscalYearStart', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                                        >
                                            <option value="january">January</option>
                                            <option value="april">April</option>
                                            <option value="july">July</option>
                                            <option value="october">October</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Currency
                                        </label>
                                        <select
                                            value={settings.currency}
                                            onChange={(e) => updateSetting('currency', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                                        >
                                            <option value="USD">USD ($)</option>
                                            <option value="EUR">EUR</option>
                                            <option value="GBP">GBP</option>
                                            <option value="CAD">CAD ($)</option>
                                            <option value="AUD">AUD ($)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Date Format
                                        </label>
                                        <select
                                            value={settings.dateFormat}
                                            onChange={(e) => updateSetting('dateFormat', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                                        >
                                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Language
                                        </label>
                                        <select
                                            value={settings.language}
                                            onChange={(e) => updateSetting('language', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                                        >
                                            <option value="en">English</option>
                                            <option value="es">Spanish</option>
                                            <option value="fr">French</option>
                                            <option value="de">German</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Timezone
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.timezone}
                                        readOnly
                                        className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'appearance':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Theme & Display
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        Color Theme
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        <button
                                            onClick={() => updateSetting('themeMode', 'system')}
                                            className={`p-4 rounded-xl border-2 transition-all ${
                                                themeMode === 'system'
                                                    ? 'border-[var(--cmf-accent)] bg-[var(--cmf-accent-muted)]'
                                                    : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white to-slate-800 border border-gray-200 flex items-center justify-center text-gray-600">
                                                    <ComputerIcon />
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-medium text-gray-900 dark:text-white">System</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Auto-detect</p>
                                                </div>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => updateSetting('themeMode', 'light')}
                                            className={`p-4 rounded-xl border-2 transition-all ${
                                                themeMode === 'light'
                                                    ? 'border-[var(--cmf-accent)] bg-[var(--cmf-accent-muted)]'
                                                    : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-amber-500">
                                                    <SunIcon />
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-medium text-gray-900 dark:text-white">Light</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Classic light</p>
                                                </div>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => updateSetting('themeMode', 'dark')}
                                            className={`p-4 rounded-xl border-2 transition-all ${
                                                themeMode === 'dark'
                                                    ? 'border-[var(--cmf-accent)] bg-[var(--cmf-accent-muted)]'
                                                    : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-[var(--cmf-accent)]">
                                                    <MoonIcon />
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-medium text-gray-900 dark:text-white">Dark</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Matte black</p>
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <HighlightPicker
                                        label="Accent Color (CMF)"
                                        showLabels={true}
                                        size="lg"
                                    />
                                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        Choose your preferred highlight color. This affects buttons, links, and active states throughout the app.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Font Size
                                    </label>
                                    <select
                                        value={settings.fontSize}
                                        onChange={(e) => updateSetting('fontSize', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                                    >
                                        <option value="small">Small</option>
                                        <option value="normal">Normal</option>
                                        <option value="large">Large</option>
                                    </select>
                                </div>

                                <ToggleSetting
                                    label="Compact Mode"
                                    description="Use smaller spacing and fonts for more content on screen"
                                    checked={settings.compactMode}
                                    onChange={(v) => updateSetting('compactMode', v)}
                                />
                                <ToggleSetting
                                    label="Show Animations"
                                    description="Enable UI animations and transitions"
                                    checked={settings.showAnimations}
                                    onChange={(v) => updateSetting('showAnimations', v)}
                                />
                            </div>
                        </div>
                    </div>
                );

            case 'ai-search':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Web Search Settings
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                Configure how the CRM searches the web for new leads and information.
                            </p>
                            <div className="space-y-4">
                                <ToggleSetting
                                    label="Enable Web Search"
                                    description="Allow AI tools and global search to search the web for new leads and information"
                                    checked={settings.webSearchEnabled}
                                    onChange={(v) => updateSetting('webSearchEnabled', v)}
                                />

                                {settings.webSearchEnabled && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Search Result Limit
                                            </label>
                                            <select
                                                value={settings.searchResultLimit}
                                                onChange={(e) => updateSetting('searchResultLimit', parseInt(e.target.value))}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                                            >
                                                <option value={5}>5 results</option>
                                                <option value={10}>10 results</option>
                                                <option value={20}>20 results</option>
                                                <option value={50}>50 results</option>
                                            </select>
                                        </div>

                                        <ToggleSetting
                                            label="AI Research Mode"
                                            description="Enable deeper AI analysis of web search results for more comprehensive insights"
                                            checked={settings.aiResearchMode}
                                            onChange={(v) => updateSetting('aiResearchMode', v)}
                                        />
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                AI Model Settings
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Default AI Model
                                    </label>
                                    <select
                                        value={settings.defaultAiModel}
                                        onChange={(e) => updateSetting('defaultAiModel', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                                    >
                                        <option value="gemini">Google Gemini</option>
                                        <option value="claude">Anthropic Claude</option>
                                        <option value="gpt4">OpenAI GPT-4</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Research Depth
                                    </label>
                                    <select
                                        value={settings.researchDepth}
                                        onChange={(e) => updateSetting('researchDepth', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                                    >
                                        <option value="quick">Quick - Fast responses</option>
                                        <option value="normal">Normal - Balanced</option>
                                        <option value="deep">Deep - Comprehensive analysis</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'integrations':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Connected Services
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                Manage your connected third-party services and APIs.
                            </p>
                            <div className="space-y-4">
                                <IntegrationCard
                                    name="Supabase"
                                    description="Database and authentication backend"
                                    connected={settings.supabaseConnected}
                                    icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M21.362 9.354H12V.396a.396.396 0 0 0-.716-.233L2.203 12.424l-.401.562a1.04 1.04 0 0 0 .836 1.659H12v8.959a.396.396 0 0 0 .716.233l9.081-12.261.401-.562a1.04 1.04 0 0 0-.836-1.66z"/></svg>}
                                    statusLabel="Active"
                                />
                                <IntegrationCard
                                    name="Google Services"
                                    description="Gmail, Drive, Calendar integration"
                                    connected={settings.googleConnected}
                                    icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>}
                                    onConnect={() => updateSetting('googleConnected', !settings.googleConnected)}
                                />
                                <IntegrationCard
                                    name="Pulse"
                                    description="Communication and messaging platform"
                                    connected={settings.pulseConnected}
                                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
                                    onConnect={() => updateSetting('pulseConnected', !settings.pulseConnected)}
                                />
                                <IntegrationCard
                                    name="Stripe"
                                    description="Payment processing for donations"
                                    connected={false}
                                    icon={<DonationIcon />}
                                />
                                <IntegrationCard
                                    name="Mailchimp"
                                    description="Email marketing campaigns"
                                    connected={false}
                                    icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>}
                                />
                            </div>
                        </div>
                    </div>
                );

            case 'connectors':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Data Sync Connectors
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                Configure automatic synchronization with external services.
                            </p>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Calendar Sync</h4>
                                    <div className="space-y-3">
                                        <ToggleSetting
                                            label="Google Calendar"
                                            description="Sync events with Google Calendar"
                                            checked={settings.googleCalendarSync}
                                            onChange={(v) => updateSetting('googleCalendarSync', v)}
                                        />
                                        <ToggleSetting
                                            label="Outlook Calendar"
                                            description="Sync events with Microsoft Outlook"
                                            checked={settings.outlookSync}
                                            onChange={(v) => updateSetting('outlookSync', v)}
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Document Storage</h4>
                                    <div className="space-y-3">
                                        <ToggleSetting
                                            label="Google Drive"
                                            description="Sync documents with Google Drive"
                                            checked={settings.googleDriveSync}
                                            onChange={(v) => updateSetting('googleDriveSync', v)}
                                        />
                                        <ToggleSetting
                                            label="OneDrive"
                                            description="Sync documents with Microsoft OneDrive"
                                            checked={settings.oneDriveSync}
                                            onChange={(v) => updateSetting('oneDriveSync', v)}
                                        />
                                        <ToggleSetting
                                            label="Dropbox"
                                            description="Sync documents with Dropbox"
                                            checked={settings.dropboxSync}
                                            onChange={(v) => updateSetting('dropboxSync', v)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'notifications':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Notification Preferences
                            </h3>
                            <div className="space-y-4">
                                <ToggleSetting
                                    label="Email Notifications"
                                    description="Receive important updates via email"
                                    checked={settings.emailNotifications}
                                    onChange={(v) => updateSetting('emailNotifications', v)}
                                />
                                <ToggleSetting
                                    label="In-App Notifications"
                                    description="Show notifications within the application"
                                    checked={settings.inAppNotifications}
                                    onChange={(v) => updateSetting('inAppNotifications', v)}
                                />
                                <ToggleSetting
                                    label="Sound Notifications"
                                    description="Play sounds for new notifications"
                                    checked={settings.soundNotifications}
                                    onChange={(v) => updateSetting('soundNotifications', v)}
                                />

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Notification Frequency
                                    </label>
                                    <select
                                        value={settings.notificationFrequency}
                                        onChange={(e) => updateSetting('notificationFrequency', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                                    >
                                        <option value="realtime">Real-time</option>
                                        <option value="hourly">Hourly digest</option>
                                        <option value="daily">Daily digest</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Event Notifications
                            </h3>
                            <div className="space-y-4">
                                <ToggleSetting
                                    label="Task Reminders"
                                    description="Get reminded about upcoming and overdue tasks"
                                    checked={settings.taskReminders}
                                    onChange={(v) => updateSetting('taskReminders', v)}
                                />
                                <ToggleSetting
                                    label="Donation Alerts"
                                    description="Receive alerts when new donations come in"
                                    checked={settings.donationAlerts}
                                    onChange={(v) => updateSetting('donationAlerts', v)}
                                />
                                <ToggleSetting
                                    label="Pledge Reminders"
                                    description="Get reminded about pledge payments coming due"
                                    checked={settings.pledgeReminders}
                                    onChange={(v) => updateSetting('pledgeReminders', v)}
                                />
                                <ToggleSetting
                                    label="Weekly Digest"
                                    description="Receive a weekly summary of activity"
                                    checked={settings.weeklyDigest}
                                    onChange={(v) => updateSetting('weeklyDigest', v)}
                                />
                            </div>
                        </div>
                    </div>
                );

            case 'privacy':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Privacy Settings
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Data Visibility
                                    </label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                        Control who can see your data within the organization
                                    </p>
                                    <select
                                        value={settings.dataVisibility}
                                        onChange={(e) => updateSetting('dataVisibility', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                                    >
                                        <option value="private">Private - Only you</option>
                                        <option value="team">Team - Your team members</option>
                                        <option value="organization">Organization - Everyone in org</option>
                                    </select>
                                </div>

                                <ToggleSetting
                                    label="Activity Logging"
                                    description="Log your activity for security and audit purposes"
                                    checked={settings.activityLogging}
                                    onChange={(v) => updateSetting('activityLogging', v)}
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Security
                            </h3>
                            <div className="space-y-4">
                                <ToggleSetting
                                    label="Two-Factor Authentication"
                                    description="Add an extra layer of security to your account"
                                    checked={settings.twoFactorEnabled}
                                    onChange={(v) => updateSetting('twoFactorEnabled', v)}
                                />

                                <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Active Sessions</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                        Manage devices where you're currently logged in
                                    </p>
                                    <Button variant="outline" size="sm">View Sessions</Button>
                                </div>

                                <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Login History</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                        View your recent login activity
                                    </p>
                                    <Button variant="outline" size="sm">View History</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'team':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Team Management
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                Manage your team members, roles, and permissions.
                            </p>

                            <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg mb-4">
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Currently logged in as: <strong>{userEmail || 'Unknown'}</strong>
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Role: Administrator
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Invite Team Members</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                        Add new members to your organization
                                    </p>
                                    <Button variant="primary" size="sm">Invite Member</Button>
                                </div>

                                <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Role Management</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                        Configure roles and permissions for your team
                                    </p>
                                    <Button variant="outline" size="sm">Manage Roles</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'backup':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Backup & Export
                            </h3>

                            <div className="space-y-4">
                                <ToggleSetting
                                    label="Automatic Backups"
                                    description="Automatically backup your data on a schedule"
                                    checked={settings.autoBackup}
                                    onChange={(v) => updateSetting('autoBackup', v)}
                                />

                                {settings.autoBackup && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Backup Frequency
                                        </label>
                                        <select
                                            value={settings.backupFrequency}
                                            onChange={(e) => updateSetting('backupFrequency', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                                        >
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                    </div>
                                )}

                                <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Last backup: {settings.lastBackup ? new Date(settings.lastBackup).toLocaleString() : 'Never'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Export Data
                            </h3>
                            <div className="space-y-4">
                                <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Export Settings</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                        Download your settings configuration as JSON
                                    </p>
                                    <Button variant="outline" size="sm" onClick={handleExportData}>
                                        Export Settings
                                    </Button>
                                </div>
                                <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Export All Data</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                        Download all your organization's data in CSV format
                                    </p>
                                    <Button variant="outline" size="sm">Export CSV</Button>
                                </div>
                                <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Import Data</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                        Import contacts and donations from CSV files
                                    </p>
                                    <Button variant="outline" size="sm">Import Data</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'advanced':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Developer Options
                            </h3>
                            <div className="space-y-4">
                                <ToggleSetting
                                    label="Developer Mode"
                                    description="Enable developer tools and additional debugging information"
                                    checked={settings.developerMode}
                                    onChange={(v) => updateSetting('developerMode', v)}
                                />
                                <ToggleSetting
                                    label="Debug Logging"
                                    description="Log detailed debug information to the console"
                                    checked={settings.debugLogging}
                                    onChange={(v) => updateSetting('debugLogging', v)}
                                />
                                <ToggleSetting
                                    label="Experimental Features"
                                    description="Enable features that are still in development"
                                    checked={settings.experimentalFeatures}
                                    onChange={(v) => updateSetting('experimentalFeatures', v)}
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Cache & Data
                            </h3>
                            <div className="space-y-4">
                                <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Clear Cache</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                        Clear application cache and temporary data
                                    </p>
                                    <Button variant="outline" size="sm" onClick={handleClearCache}>
                                        Clear Cache
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
                                Danger Zone
                            </h3>
                            <div className="p-4 border border-red-200 dark:border-red-900/50 rounded-lg bg-red-50 dark:bg-red-900/20">
                                <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">Reset All Settings</h4>
                                <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                                    Reset all settings to their default values. This cannot be undone.
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-red-300 text-red-600 hover:bg-red-100"
                                    onClick={handleReset}
                                >
                                    Reset Settings
                                </Button>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                About
                            </h3>
                            <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    <strong>Logos Vision CRM</strong>
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Version 1.0.0
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Built with React, TypeScript, and Supabase
                                </p>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="h-full flex">
            {/* Sidebar */}
            <div className="w-64 border-r border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 p-4 flex flex-col">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Settings</h2>

                {/* Search */}
                <div className="relative mb-4">
                    <input
                        type="text"
                        placeholder="Search settings..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                    <SearchIcon />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                <nav className="space-y-1 flex-1 overflow-y-auto">
                    {filteredSections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                                activeSection === section.id
                                    ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                            }`}
                        >
                            <span className={activeSection === section.id ? 'text-rose-500' : 'text-gray-400'}>
                                {section.icon}
                            </span>
                            {section.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-2xl mx-auto p-6">
                    {renderSectionContent()}

                    {/* Save bar */}
                    {hasChanges && (
                        <div className="fixed bottom-0 left-64 right-0 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 p-4 flex items-center justify-end gap-3 z-10">
                            <span className="text-sm text-gray-500 dark:text-gray-400 mr-auto">
                                You have unsaved changes
                            </span>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setHasChanges(false);
                                    window.location.reload();
                                }}
                            >
                                Discard
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    )}

                    {/* Saved notification */}
                    {saved && (
                        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-20">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Settings saved successfully
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Toggle setting component
interface ToggleSettingProps {
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

const ToggleSetting: React.FC<ToggleSettingProps> = ({ label, description, checked, onChange }) => (
    <div className="flex items-center justify-between py-3">
        <div>
            <p className="font-medium text-gray-900 dark:text-white">{label}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        <button
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                checked ? 'bg-rose-500' : 'bg-gray-200 dark:bg-slate-700'
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

// Integration card component
interface IntegrationCardProps {
    name: string;
    description: string;
    connected: boolean;
    icon: React.ReactNode;
    onConnect?: () => void;
    statusLabel?: string;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({ name, description, connected, icon, onConnect, statusLabel }) => (
    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg text-gray-600 dark:text-gray-400">
                {icon}
            </div>
            <div>
                <p className="font-medium text-gray-900 dark:text-white">{name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
            </div>
        </div>
        {statusLabel ? (
            <span className="px-3 py-1 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                {statusLabel}
            </span>
        ) : (
            <Button
                variant={connected ? 'outline' : 'primary'}
                size="sm"
                onClick={onConnect}
            >
                {connected ? 'Disconnect' : 'Connect'}
            </Button>
        )}
    </div>
);
