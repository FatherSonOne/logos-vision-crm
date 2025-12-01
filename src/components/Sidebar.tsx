import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import type { Page } from '../types';
import { mainNav, navigationSections } from './navigationConfig';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

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
        <li className="relative group">
            <a
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    onNavigate(pageId);
                }}
                className={`relative flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive 
                    ? 'bg-white/30 dark:bg-white/20 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-700 hover:bg-white/20 dark:text-slate-200 dark:hover:bg-white/10 hover:shadow-sm'
                } ${collapsed ? 'justify-center' : ''}`}
                aria-label={label}
                title={collapsed ? label : undefined}
            >
                {/* Active indicator */}
                {isActive && (
                    <span className="absolute inset-y-0 left-0 w-1 bg-cyan-500 rounded-r-full transition-all duration-300" aria-hidden="true"></span>
                )}
                
                {/* Icon */}
                <span className={`w-5 h-5 flex items-center justify-center flex-shrink-0 ${collapsed ? '' : 'mr-3'}`}>
                    {icon}
                </span>
                
                {/* Label - hidden when collapsed */}
                {!collapsed && (
                    <span className="flex-1 truncate">{label}</span>
                )}
                
                {/* Notification badge */}
                {hasNotification && (
                    <span 
                        className={`h-2 w-2 rounded-full bg-cyan-500 animate-pulse ${collapsed ? 'absolute -top-0.5 -right-0.5' : 'ml-auto'}`}
                        aria-label="New notification"
                    />
                )}
            </a>
            
            {/* Tooltip for collapsed state */}
            {collapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-slate-900 dark:bg-slate-700 text-white text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                    {label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900 dark:border-r-slate-700" />
                </div>
            )}
        </li>
    );
};

const NavSection: React.FC<{title: string; children: React.ReactNode; collapsed: boolean}> = ({ title, children, collapsed }) => (
    <div className="mt-6 first:mt-0">
        {!collapsed && (
            <h3 className="px-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                {title}
            </h3>
        )}
        {collapsed && (
            <div className="h-px bg-slate-300/50 dark:bg-slate-600/50 my-2 mx-2" aria-hidden="true" />
        )}
        <ul className="space-y-1">
            {children}
        </ul>
    </div>
);

interface SidebarProps {
    currentPage: string;
    onNavigate: (page: Page) => void;
    notifications: Set<Page>;
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
            className={`bg-white/25 dark:bg-slate-900/40 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out shadow-sm ${
                collapsed ? 'w-20' : 'w-64'
            }`}
        >
            {/* Header with Logo and Toggle */}
            <div className="p-4 border-b border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between">
                    {!collapsed && (
                        <div className="flex-1">
                            <Logo />
                        </div>
                    )}
                    <button
                        onClick={toggleCollapsed}
                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/50 dark:bg-slate-800/50 hover:bg-white/70 dark:hover:bg-slate-700/70 text-slate-700 dark:text-slate-300 transition-all duration-200 hover:shadow-md"
                        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {collapsed ? (
                            <ChevronRightIcon className="w-5 h-5" />
                        ) : (
                            <ChevronLeftIcon className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
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

            {/* Footer hint when collapsed */}
            {collapsed && (
                <div className="p-3 border-t border-slate-200/50 dark:border-slate-700/50">
                    <div className="flex justify-center">
                        <div className="w-8 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                    </div>
                </div>
            )}
        </aside>
    );
};
