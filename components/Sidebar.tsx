import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import type { Page } from '../types';
import { mainNav, navigationSections } from './navigationConfig';

interface NavItemProps {
  pageId: Page;
  label: string;
  icon: React.ReactNode;
  currentPage: string;
  onNavigate: (page: Page) => void;
  hasNotification: boolean;
  isCollapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ pageId, label, icon, currentPage, onNavigate, hasNotification, isCollapsed }) => {
    const isActive = currentPage === pageId;
    
    return (
        <li className="relative group">
            <a
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    onNavigate(pageId);
                }}
                className={`relative flex items-center ${isCollapsed ? 'justify-center px-3' : 'px-4'} py-2.5 text-sm font-medium rounded-lg transition-all duration-200 text-shadow-strong ${
                    isActive
                    ? 'font-semibold bg-white/30 dark:bg-white/20 text-slate-900 dark:text-white shadow-md' 
                    : 'text-slate-800 hover:bg-white/20 dark:text-slate-100 dark:hover:bg-white/10 hover:shadow-sm'
                }`}
                title={isCollapsed ? label : undefined}
            >
                {isActive && (
                    <span className="absolute inset-y-0 left-0 w-1 bg-primary-500 rounded-r-full transition-all duration-300" aria-hidden="true"></span>
                )}
                
                <span className={`flex items-center ${isCollapsed ? '' : 'transition-transform duration-200 ease-in-out group-hover:translate-x-1'}`}>
                    <span className={`w-5 h-5 flex items-center justify-center flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`}>
                        {icon}
                    </span>
                    {!isCollapsed && (
                        <span className="truncate">{label}</span>
                    )}
                </span>
                
                {hasNotification && (
                    <span 
                        className={`absolute ${isCollapsed ? 'top-1 right-1' : 'right-3 top-1/2 -translate-y-1/2'} h-2 w-2 rounded-full bg-primary-500 animate-pulse`} 
                        aria-label="New notification"
                    ></span>
                )}
            </a>
            
            {/* Tooltip when collapsed */}
            {isCollapsed && (
                <div className="sidebar-tooltip absolute left-full ml-2 px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                    {label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900 dark:border-r-slate-800"></div>
                </div>
            )}
        </li>
    );
};

const NavSection: React.FC<{title: string; children: React.ReactNode; isCollapsed: boolean}> = ({ title, children, isCollapsed }) => (
    <div className="mt-6">
        {!isCollapsed && (
            <h3 className="px-3 text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 dark:text-slate-300 text-shadow-strong transition-opacity duration-200">
                {title}
            </h3>
        )}
        {isCollapsed && (
            <div className="px-3 mb-2">
                <div className="h-px bg-slate-300 dark:bg-slate-700"></div>
            </div>
        )}
        <ul className="space-y-1">
            {children}
        </ul>
    </div>
);

const CollapseButton: React.FC<{isCollapsed: boolean; onClick: () => void}> = ({ isCollapsed, onClick }) => (
    <button
        onClick={onClick}
        className="flex items-center justify-center w-full py-2.5 px-3 text-slate-700 hover:bg-white/20 dark:text-slate-300 dark:hover:bg-white/10 rounded-lg transition-all duration-200 group mb-4 focus-ring-primary relative"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={isCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
    >
        <svg 
            className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
        {!isCollapsed && (
            <>
                <span className="ml-2 text-sm font-medium">Collapse</span>
                <span className="ml-auto text-xs text-slate-500 dark:text-slate-400 opacity-60 font-mono">⌘B</span>
            </>
        )}
    </button>
);

export const Sidebar: React.FC<{ currentPage: string; onNavigate: (page: Page) => void; notifications: Set<Page>; }> = ({ currentPage, onNavigate, notifications }) => {
    // Load collapsed state from localStorage
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebar-collapsed');
        return saved === 'true';
    });

    // Save to localStorage whenever state changes
    useEffect(() => {
        localStorage.setItem('sidebar-collapsed', String(isCollapsed));
        
        // Dispatch custom event for other components to react to sidebar state
        window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: { isCollapsed } }));
    }, [isCollapsed]);

    // Keyboard shortcut: Ctrl/Cmd + B to toggle sidebar
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                setIsCollapsed(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const toggleCollapsed = () => {
        setIsCollapsed(prev => !prev);
    };

    return (
        <aside 
            id="main-sidebar" 
            className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white/25 dark:bg-slate-900/50 backdrop-blur-xl border-r border-white/30 dark:border-slate-700/50 p-4 flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out`}
        >
            {/* Logo */}
            <div className={`mb-6 transition-all duration-300 ${isCollapsed ? 'overflow-hidden' : ''}`}>
                {isCollapsed ? (
                    <div className="flex items-center justify-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            L
                        </div>
                    </div>
                ) : (
                    <Logo />
                )}
            </div>

            {/* Collapse/Expand Button */}
            <CollapseButton isCollapsed={isCollapsed} onClick={toggleCollapsed} />

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden pr-2 -mr-2 custom-scrollbar">
                <NavItem
                    pageId={mainNav.pageId}
                    label={mainNav.label}
                    icon={mainNav.icon}
                    currentPage={currentPage}
                    onNavigate={onNavigate}
                    hasNotification={notifications.has(mainNav.pageId)}
                    isCollapsed={isCollapsed}
                />

                {navigationSections.map(section => (
                    <NavSection key={section.title} title={section.title} isCollapsed={isCollapsed}>
                        {section.items.map(item => (
                            <NavItem
                                key={item.pageId}
                                pageId={item.pageId}
                                label={item.label}
                                icon={item.icon}
                                currentPage={currentPage}
                                onNavigate={onNavigate}
                                hasNotification={notifications.has(item.pageId)}
                                isCollapsed={isCollapsed}
                            />
                        ))}
                    </NavSection>
                ))}
            </nav>

            {/* Footer hint when collapsed */}
            {isCollapsed && (
                <div className="mt-4 pt-4 border-t border-slate-300 dark:border-slate-700">
                    <div className="flex justify-center group relative">
                        <div className="text-slate-500 dark:text-slate-400 text-xs opacity-50 hover:opacity-100 transition-opacity cursor-help">
                            ⌘B
                        </div>
                        {/* Tooltip for keyboard shortcut */}
                        <div className="sidebar-tooltip absolute bottom-full mb-2 px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap pointer-events-none">
                            Press Ctrl+B to toggle
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800"></div>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
};
