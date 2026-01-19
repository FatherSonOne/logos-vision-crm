/**
 * Documents Hub - Main Container Component
 * Phase 1: Foundation container following ReportsHub pattern
 *
 * This component acts as the main entry point for the enterprise document library,
 * providing routing, state management, and feature flag integration.
 */

import React, { useState, useEffect } from 'react';
import { DocumentLibrary } from '../DocumentLibrary';
import type { Document, Client, Project, TeamMember } from '../../types';
import type { EnhancedDocument } from '../../types/documents';

interface DocumentsHubProps {
  documents: Document[];
  clients: Client[];
  projects: Project[];
  teamMembers: TeamMember[];
}

// Feature flags for gradual rollout
const FEATURE_FLAGS = {
  useEnhancedLibrary: false, // Phase 1: Start with false for backward compatibility
  aiFeatures: false,         // Phase 2: Enable AI features
  pulseSync: false,          // Phase 3: Enable Pulse integration
  versionControl: false,     // Phase 5: Enable version control
  analytics: false,          // Phase 6: Enable analytics dashboard
};

export default function DocumentsHub({
  documents,
  clients,
  projects,
  teamMembers,
}: DocumentsHubProps) {
  const [currentView, setCurrentView] = useState<'library' | 'analytics'>('library');
  const [featureFlags, setFeatureFlags] = useState(FEATURE_FLAGS);

  useEffect(() => {
    // Load feature flags from localStorage or config
    const savedFlags = localStorage.getItem('document_feature_flags');
    if (savedFlags) {
      try {
        const parsed = JSON.parse(savedFlags);
        setFeatureFlags({ ...FEATURE_FLAGS, ...parsed });
      } catch (error) {
        console.error('Error loading feature flags:', error);
      }
    }

    // Listen for feature flag updates (for admin controls)
    const handleFeatureFlagUpdate = (event: CustomEvent) => {
      setFeatureFlags(prev => ({ ...prev, ...event.detail }));
      localStorage.setItem('document_feature_flags', JSON.stringify({
        ...featureFlags,
        ...event.detail,
      }));
    };

    window.addEventListener('update-document-features' as any, handleFeatureFlagUpdate);

    return () => {
      window.removeEventListener('update-document-features' as any, handleFeatureFlagUpdate);
    };
  }, []);

  // Phase 1: Use existing DocumentLibrary component
  // Future phases will add conditional rendering based on feature flags
  if (!featureFlags.useEnhancedLibrary) {
    return (
      <DocumentLibrary
        documents={documents}
        clients={clients}
        projects={projects}
        teamMembers={teamMembers}
      />
    );
  }

  // Enhanced library view (future phases)
  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Header - Future implementation */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <svg
                className="w-7 h-7 text-rose-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
              FileHub
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Enterprise document management with AI-powered features
            </p>
          </div>

          {/* View toggle - Future implementation */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentView('library')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentView === 'library'
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              Library
            </button>
            {featureFlags.analytics && (
              <button
                type="button"
                onClick={() => setCurrentView('analytics')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'analytics'
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Analytics
              </button>
            )}
          </div>
        </div>

        {/* Feature flags indicator (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-2">
              Active Features (Development):
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(featureFlags).map(([key, enabled]) => (
                <span
                  key={key}
                  className={`px-2 py-1 text-xs rounded ${
                    enabled
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                  }`}
                >
                  {key}: {enabled ? 'ON' : 'OFF'}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-hidden">
        {currentView === 'library' && (
          <DocumentLibrary
            documents={documents}
            clients={clients}
            projects={projects}
            teamMembers={teamMembers}
          />
        )}

        {currentView === 'analytics' && featureFlags.analytics && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <svg
                className="w-16 h-16 text-slate-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Analytics Dashboard
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Coming in Phase 6: Document usage analytics and insights
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Utility function to enable/disable features (for admin/testing)
 * Usage: updateDocumentFeatures({ aiFeatures: true })
 */
export function updateDocumentFeatures(updates: Partial<typeof FEATURE_FLAGS>) {
  const event = new CustomEvent('update-document-features', { detail: updates });
  window.dispatchEvent(event);
}
