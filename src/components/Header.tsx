import React, { useState } from 'react';
import { GlobalSearch } from './GlobalSearch';
import type { Page, TeamMember } from '../types';
import { Button } from './ui/Button';
import { ThemeToggle } from './ui/ThemeToggle';
import { HelpToggle } from './ui/HelpToggle';
import { InviteTeamModal } from './InviteTeamModal';
import { UserAvatarMenu } from './UserAvatarMenu';
import { NotificationCenter } from './collaboration/NotificationCenter';
import { UserPlus } from 'lucide-react';


/**
 * CMF Nothing Design System - Header Component
 * =============================================
 * Minimal header with search and user controls.
 * Navigation state is shown via sidebar highlighting only.
 */

interface HeaderProps {
    onSearch: (query: string, includeWeb: boolean) => void;
    isSearching: boolean;
    currentPage: Page;
    currentUser?: TeamMember | null;  // For collaboration features
    onNavigate?: (url: string) => void;  // For notification navigation
    // Keep these props for compatibility but don't use them
    breadcrumbs?: any[];
    onGoBack?: () => void;
    onGoForward?: () => void;
    canGoBack?: boolean;
    canGoForward?: boolean;
    onStartTour?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
    onSearch,
    isSearching,
    currentUser,
    onNavigate,
}) => {
    const [showInviteModal, setShowInviteModal] = useState(false);

    return (
        <>
        <InviteTeamModal
            isOpen={showInviteModal}
            onClose={() => setShowInviteModal(false)}
        />
        <header
            className="border-b px-4 py-3 flex items-center z-10 flex-shrink-0"
            style={{
                backgroundColor: 'var(--cmf-bg)',
                borderColor: 'var(--cmf-border)'
            }}
        >
            {/* Clean single row layout */}
            <div className="flex items-center justify-between w-full gap-4">
                {/* Left spacer for balance */}
                <div className="flex-1" />

                {/* Center: Search */}
                <div className="flex-shrink-0">
                    <div className="relative w-full max-w-md">
                        <GlobalSearch onSearch={onSearch} />
                        {isSearching && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div
                                    className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent"
                                    style={{ borderColor: 'var(--cmf-accent)', borderTopColor: 'transparent' }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Right section: User controls */}
                <div className="flex items-center gap-2 flex-1 justify-end">
                    {/* Invite Team Button */}
                    <button
                        onClick={() => setShowInviteModal(true)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200 group
                            bg-transparent hover:bg-[var(--cmf-accent)]/10
                            border-[var(--cmf-border)] hover:border-[var(--cmf-accent)]/50
                            text-[var(--cmf-text-secondary)] hover:text-[var(--cmf-accent)]"
                        title="Invite Team Member"
                        aria-label="Invite team member"
                        type="button"
                    >
                        <UserPlus className="w-4 h-4" aria-hidden="true" />
                        <span className="text-xs font-medium hidden sm:inline">Invite</span>
                    </button>
                    {currentUser ? (
                        <NotificationCenter
                            currentUser={currentUser}
                            onNavigate={onNavigate}
                        />
                    ) : (
                        <div className="w-8 h-8 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full" />
                    )}
                    <HelpToggle />
                    <ThemeToggle size="sm" />
                    {/* User Avatar Menu */}
                    <UserAvatarMenu />
                </div>
            </div>
        </header>
        </>
    );
};
