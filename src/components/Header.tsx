import React, { useState } from 'react';
import { GlobalSearch } from './GlobalSearch';
import type { Page } from '../types';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { ThemeToggle } from './ui/ThemeToggle';
import { HelpToggle } from './ui/HelpToggle';
import { InviteTeamModal } from './InviteTeamModal';
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
    // Keep these props for compatibility but don't use them
    breadcrumbs?: any[];
    onGoBack?: () => void;
    onGoForward?: () => void;
    canGoBack?: boolean;
    canGoForward?: boolean;
    onStartTour?: () => void;
    userEmail?: string;
    onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
    onSearch,
    isSearching,
    userEmail,
    onLogout
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
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowInviteModal(true)}
                        className="flex items-center gap-1.5"
                        title="Invite Team Member"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span className="hidden sm:inline">Invite</span>
                    </Button>
                    {userEmail && (
                        <Badge variant="neutral" size="md">
                            {userEmail}
                        </Badge>
                    )}
                    {onLogout && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onLogout}
                        >
                            Logout
                        </Button>
                    )}
                    <HelpToggle />
                    <ThemeToggle size="sm" />
                </div>
            </div>
        </header>
        </>
    );
};
