import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import type { Page, RecentItem } from '../types';
import { mainNav, navigationSections } from './navigationConfig';

/**
 * CMF Nothing Design System - Sidebar Component
 * ==============================================
 * Clean, stable navigation sidebar using CMF design tokens.
 * No dynamic sections that would cause layout shifts.
 */

interface NavItemProps {
  pageId: Page;
  label: string;
  icon: React.ReactNode;
  currentPage: string;
  onNavigate: (page: Page) => void;
  hasNotification: boolean;
  collapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ pageId, label, icon, currentPage, onNavigate, hasNotification, collapsed }) => {
    const isActive = currentPage === pageId;

    return (
        <li className="relative group menu-item-enter">
            <a
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    onNavigate(pageId);
                }}
                className={`
                    relative flex items-center px-3 py-2.5 text-sm font-medium rounded-lg
                    transition-all duration-200 ease-out
                    hover:scale-[1.02] active:scale-[0.98]
                    ${collapsed ? 'justify-center' : ''}
                `}
                style={{
                    backgroundColor: isActive
                        ? 'var(--cmf-accent-muted)'
                        : 'transparent',
                    color: isActive
                        ? 'var(--cmf-accent)'
                        : 'var(--cmf-text-secondary)'
                }}
                aria-label={label}
                title={collapsed ? label : undefined}
            >
                {/* Active indicator - aurora glow effect */}
                {isActive && (
                    <span
                        className="absolute inset-y-0 left-0 w-1 rounded-r-full transition-all duration-300"
                        style={{
                            backgroundColor: 'var(--cmf-accent)',
                            boxShadow: '0 0 8px var(--cmf-accent)'
                        }}
                        aria-hidden="true"
                    />
                )}

                {/* Hover background glow */}
                <span
                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                        background: 'linear-gradient(135deg, var(--cmf-accent-subtle) 0%, transparent 100%)'
                    }}
                    aria-hidden="true"
                />

                {/* Icon with subtle animation */}
                <span className={`
                    w-5 h-5 flex items-center justify-center flex-shrink-0 relative z-10
                    transition-transform duration-200
                    group-hover:scale-110
                    ${collapsed ? '' : 'mr-3'}
                `}>
                    {icon}
                </span>

                {/* Label - hidden when collapsed */}
                {!collapsed && (
                    <span className="flex-1 truncate relative z-10 transition-colors duration-200">{label}</span>
                )}

                {/* Notification badge - aurora pulse */}
                {hasNotification && (
                    <span
                        className={`
                            h-2 w-2 rounded-full relative z-10
                            ${collapsed ? 'absolute -top-0.5 -right-0.5' : 'ml-auto'}
                        `}
                        style={{
                            backgroundColor: 'var(--cmf-accent)',
                            boxShadow: '0 0 6px var(--cmf-accent)',
                            animation: 'auroraGlowPulse 2s ease-in-out infinite'
                        }}
                        aria-label="New notification"
                    />
                )}
            </a>

            {/* Tooltip for collapsed state - enhanced with aurora styling */}
            {collapsed && (
                <div
                    className="absolute left-full ml-2 px-3 py-2 text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none dropdown-enter"
                    style={{
                        backgroundColor: 'var(--cmf-surface)',
                        color: 'var(--cmf-text)',
                        boxShadow: 'var(--cmf-shadow-lg), var(--aurora-glow-sm)',
                        border: '1px solid var(--cmf-border)',
                    }}
                >
                    {label}
                </div>
            )}
        </li>
    );
};

const NavSection: React.FC<{title: string; children: React.ReactNode; collapsed: boolean}> = ({ title, children, collapsed }) => (
    <div className="mt-6 first:mt-0 animate-fadeIn">
        {!collapsed && (
            <h3
                className="px-3 text-xs font-semibold uppercase tracking-wider mb-2 transition-colors duration-200"
                style={{ color: 'var(--cmf-text-faint)' }}
            >
                {title}
            </h3>
        )}
        {collapsed && (
            <div
                className="h-px my-2 mx-2 transition-all duration-300"
                style={{
                    backgroundColor: 'var(--cmf-divider)',
                    background: 'linear-gradient(90deg, transparent, var(--cmf-divider), transparent)'
                }}
                aria-hidden="true"
            />
        )}
        <ul className="space-y-1 menu-stagger">
            {children}
        </ul>
    </div>
);

// Sidebar collapse/expand icon - double chevron style
const CollapseIcon: React.FC<{ collapsed: boolean }> = ({ collapsed }) => (
    <svg
        className={`w-3 h-3 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        {/* Double chevron for clear collapse indication */}
        <path d="M11 17l-5-5 5-5" />
        <path d="M18 17l-5-5 5-5" />
    </svg>
);

interface SidebarProps {
    currentPage: string;
    onNavigate: (page: Page) => void;
    notifications: Set<Page>;
    recentItems?: RecentItem[]; // Keep prop for compatibility but don't render
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, notifications }) => {
    // Load collapsed state from localStorage
    const [collapsed, setCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebarCollapsed');
        return saved === 'true';
    });

    // Save collapsed state to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', collapsed.toString());
    }, [collapsed]);

    const toggleCollapsed = () => {
        setCollapsed(prev => !prev);
    };

    return (
        <aside
            id="main-sidebar"
            className={`border-r flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out ${
                collapsed ? 'w-20' : 'w-64'
            }`}
            style={{
                backgroundColor: 'var(--cmf-bg)',
                borderColor: 'var(--cmf-border)'
            }}
        >
            {/* Header with Logo and Toggle */}
            <div
                className="p-4 border-b relative"
                style={{ borderColor: 'var(--cmf-border)' }}
            >
                <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'}`}>
                    {/* Show full logo when expanded */}
                    <div
                        className={`transition-all duration-300 ease-out overflow-hidden ${
                            collapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'
                        }`}
                    >
                        <Logo size="lg" showBackground={false} />
                    </div>
                    {/* Show icon-only logo when collapsed */}
                    <div
                        className={`transition-all duration-300 ease-out ${
                            collapsed ? 'opacity-100' : 'opacity-0 w-0 hidden'
                        }`}
                    >
                        <Logo size="md" showText={false} showBackground={false} />
                    </div>
                </div>
                {/* Collapse toggle button - aurora styled */}
                <button
                    onClick={toggleCollapsed}
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-6 h-6 rounded-full border transition-all duration-200 ease-out hover:scale-110 active:scale-95 focus:outline-none aurora-focus group/btn"
                    style={{
                        backgroundColor: 'var(--cmf-surface)',
                        borderColor: 'var(--cmf-border-strong)',
                        color: 'var(--cmf-text-muted)',
                        boxShadow: 'var(--cmf-shadow-sm)',
                    }}
                >
                    <span className="transition-all duration-200 group-hover/btn:text-[var(--cmf-accent)]">
                        <CollapseIcon collapsed={collapsed} />
                    </span>
                </button>
            </div>

            {/* Navigation - clean, stable layout */}
            <nav className="flex-1 overflow-y-auto p-3 scrollbar-thin">
                {/* Main Dashboard Nav */}
                <NavItem
                    pageId={mainNav.pageId}
                    label={mainNav.label}
                    icon={mainNav.icon}
                    currentPage={currentPage}
                    onNavigate={onNavigate}
                    hasNotification={notifications.has(mainNav.pageId)}
                    collapsed={collapsed}
                />

                {/* Navigation Sections */}
                {navigationSections.map(section => (
                    <NavSection key={section.title} title={section.title} collapsed={collapsed}>
                        {section.items.map(item => (
                            <NavItem
                                key={item.pageId}
                                pageId={item.pageId}
                                label={item.label}
                                icon={item.icon}
                                currentPage={currentPage}
                                onNavigate={onNavigate}
                                hasNotification={notifications.has(item.pageId)}
                                collapsed={collapsed}
                            />
                        ))}
                    </NavSection>
                ))}
            </nav>
        </aside>
    );
};
