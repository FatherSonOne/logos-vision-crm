import React from 'react';
import { GlobalSearch } from './GlobalSearch';
import type { Page } from '../types';
import { MoonIcon, SunIcon, QuestionMarkCircleIcon } from './icons';
import { Button, IconButton } from './ui/Button';
import { Badge } from './ui/Badge';

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
    userEmail?: string;
    onLogout?: () => void;
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
    userEmail,
    onLogout
}) => {
    return (
        <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-4 pt-4 flex flex-col z-10 flex-shrink-0 shadow-sm">
            {/* Top row for search and theme toggle */}
            <div className="flex items-start justify-between w-full">
                <div className="flex-1 flex-shrink-0">
                    {/* Left Spacer */}
                </div>
                <div className="px-4">
                    <div className="relative w-full max-w-sm">
                        <GlobalSearch onSearch={onSearch} />
                        {isSearching && (
                            <div className="absolute right-3 top-2.5">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-rose-500"></div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex-1 flex justify-end items-center gap-2">
                    {userEmail && (
                        <Badge variant="neutral" size="md">
                            {userEmail}
                        </Badge>
                    )}
                    {onLogout && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onLogout}
                            className="rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                            Logout
                        </Button>
                    )}
                    <IconButton
                        id="guided-tour-button"
                        variant="outline"
                        size="sm"
                        onClick={onStartTour}
                        icon={<QuestionMarkCircleIcon />}
                        aria-label="Start guided tour"
                        className="rounded-full"
                    />
                    <IconButton
                        variant="outline"
                        size="sm"
                        onClick={onToggleTheme}
                        icon={theme === 'light' ? <MoonIcon /> : <SunIcon />}
                        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                        className="rounded-full"
                    />
                </div>
            </div>
            
            {/* Bottom row for tabs */}
            <div className="w-full overflow-x-auto scrollbar-hide mt-3">
                <div role="tablist" aria-label="Open pages" className="flex items-end border-b-2 border-gray-200 dark:border-slate-700">
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
                                className={`fade-in flex items-center h-10 px-4 py-2 text-sm font-medium rounded-t-lg cursor-pointer group transition-all duration-200 border-b-2 shrink-0
                                    ${isActive
                                        ? 'bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white border-rose-500 shadow-sm'
                                        : 'bg-transparent text-gray-700 dark:text-gray-300 border-transparent hover:bg-gray-100 dark:hover:bg-slate-700/50'
                                    }`}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <span className="capitalize whitespace-nowrap">{page.replace('-', ' ')}</span>
                                {openTabs.length > 1 && (
                                    <button
                                        onClick={(e) => onCloseTab(page, e)}
                                        className="ml-3 -mr-1 p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600 hover:text-gray-800 dark:hover:text-white transition-colors"
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