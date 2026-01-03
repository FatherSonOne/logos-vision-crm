import React, { useState, useCallback } from 'react';
import type { Page } from '../types';
import { MoonIcon, SunIcon, QuestionMarkCircleIcon, SearchIcon } from './icons';
import { NotificationCenter, sampleNotifications, type Notification } from './NotificationCenter';

interface HeaderProps {
    onSearch: (query: string, includeWeb: boolean) => void;
    isSearching: boolean;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
    openTabs: Page[];
    currentPage: Page;
    onNavigate: (page: Page) => void;
    onCloseTab: (page: Page, e: React.MouseEvent) => void;
    onStartTour: () => void;
    onOpenGlobalSearch: () => void;
    onOpenKeyboardShortcuts: () => void;
}

export const Header: React.FC<HeaderProps> = ({
    onSearch,
    isSearching,
    theme,
    onToggleTheme,
    openTabs,
    currentPage,
    onNavigate,
    onCloseTab,
    onStartTour,
    onOpenGlobalSearch,
    onOpenKeyboardShortcuts
}) => {
    // Notification state management
    const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);

    const handleMarkAsRead = useCallback((id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    }, []);

    const handleMarkAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }, []);

    const handleDismiss = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const handleClearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    const handleNotificationAction = useCallback((notification: Notification) => {
        // Mark as read when taking action
        handleMarkAsRead(notification.id);
        // Navigate to the action URL if provided
        if (notification.actionUrl) {
            // Extract page from URL (e.g., '/donations/1' -> 'donations')
            const page = notification.actionUrl.split('/')[1];
            if (page) {
                onNavigate(page as Page);
            }
        }
    }, [handleMarkAsRead, onNavigate]);

    return (
        <header className="bg-white/20 dark:bg-slate-900/40 backdrop-blur-xl border-b border-white/20 dark:border-white/10 px-6 pt-6 pb-2 flex flex-col z-10 flex-shrink-0">
            {/* Top row for search and theme toggle - Increased spacing */}
            <div className="flex items-start justify-between w-full mb-5">
                <div className="flex-1 flex-shrink-0">
                    {/* Left Spacer */}
                </div>
                <div className="px-4">
                    {/* Global Search Button */}
                    <button
                        onClick={onOpenGlobalSearch}
                        className="group flex items-center gap-3 w-full max-w-md px-4 py-2.5 bg-white/30 dark:bg-slate-800/50 hover:bg-white/40 dark:hover:bg-slate-800/70 border border-white/30 dark:border-slate-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                    >
                        <SearchIcon className="text-slate-500 dark:text-slate-400" />
                        <span className="flex-1 text-left text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300">
                            Search organizations, projects, and more...
                        </span>
                        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-white/50 dark:bg-slate-900/50 border border-white/30 dark:border-slate-700 rounded text-xs font-semibold text-slate-600 dark:text-slate-400">
                            <span className="text-xs">⌘</span>K
                        </kbd>
                    </button>
                </div>
                <div className="flex-1 flex justify-end items-center gap-3">
                    {/* Notification Center */}
                    <NotificationCenter
                        notifications={notifications}
                        onMarkAsRead={handleMarkAsRead}
                        onMarkAllAsRead={handleMarkAllAsRead}
                        onDismiss={handleDismiss}
                        onClearAll={handleClearAll}
                        onAction={handleNotificationAction}
                    />
                    <button
                        onClick={onOpenKeyboardShortcuts}
                        className="p-2.5 rounded-full text-slate-700 dark:text-slate-200 bg-gradient-to-b from-white/50 to-white/20 dark:from-white/20 dark:to-transparent border border-white/30 dark:border-white/10 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                        aria-label="Show keyboard shortcuts"
                        title="Keyboard Shortcuts (Press ?)"
                    >
                        <QuestionMarkCircleIcon />
                    </button>
                    <button
                        onClick={onToggleTheme}
                        className="p-2.5 rounded-full text-slate-700 dark:text-slate-200 bg-gradient-to-b from-white/50 to-white/20 dark:from-white/20 dark:to-transparent border border-white/30 dark:border-white/10 shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 dark:focus:ring-offset-slate-900 btn-hover-scale"
                        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                    >
                        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                    </button>
                </div>
            </div>
            
            {/* Bottom row for tabs */}
            <div className="w-full overflow-x-auto scrollbar-hide">
                <div role="tablist" aria-label="Open pages" className="flex items-end border-b-2 border-white/20 dark:border-white/10">
                    {openTabs.map((page, index) => {
                        const isActive = page === currentPage;
                        return (
                            <div
                                key={page}
                                role="tab"
                                aria-selected={isActive}
                                aria-controls={`panel-${page}`}
                                id={`tab-${page}`}
                                onClick={() => onNavigate(page)}
                                className={`fade-in flex items-center h-11 px-5 py-2.5 text-sm font-medium rounded-t-lg cursor-pointer group transition-all duration-200 border-b-2 shrink-0
                                    ${isActive
                                        ? 'bg-white/30 dark:bg-slate-800/50 text-slate-900 dark:text-white border-cyan-500 shadow-inner'
                                        : 'bg-transparent text-slate-700 dark:text-slate-300 border-transparent hover:bg-white/20 dark:hover:bg-black/30'
                                    }`}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <span className="capitalize whitespace-nowrap text-shadow-strong">{page.replace('-', ' ')}</span>
                                {openTabs.length > 1 && (
                                    <button
                                        onClick={(e) => onCloseTab(page, e)}
                                        className="ml-3 -mr-1 p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-black/10 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white transition-all duration-200"
                                        aria-label={`Close ${page} tab`}
                                    >
                                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </header>
    );
};
