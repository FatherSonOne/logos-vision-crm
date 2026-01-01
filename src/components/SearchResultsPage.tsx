import React from 'react';
// FIX: Import SearchResults from types.ts to avoid circular dependency with App.tsx
import type { Client, Project, EnrichedTask, TeamMember, Activity, Volunteer, Case, Document, Page, WebSearchResult, SearchResults, NavSearchResult, FeatureSearchResult, SearchMeta } from '../types';
import { GlobeIcon, FolderIcon, BuildingIcon, CheckSquareIcon, BriefcaseIcon, ClipboardListIcon, HandHeartIcon, CaseIcon, DocumentsIcon, DashboardIcon } from './icons';
import { Zap, Navigation, ArrowRight, Cpu, Search, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

// Search status indicator component
const SearchStatusIndicator: React.FC<{ meta?: SearchMeta }> = ({ meta }) => {
    if (!meta) return null;

    const localTime = meta.localSearchTime ? `${meta.localSearchTime.toFixed(0)}ms` : '';
    const aiTime = meta.aiSearchTime ? `${(meta.aiSearchTime / 1000).toFixed(1)}s` : '';

    return (
        <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
            {/* Local Search Status */}
            <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{
                    backgroundColor: meta.localSearchComplete ? 'rgba(16, 185, 129, 0.1)' : 'var(--cmf-surface-2)',
                    color: meta.localSearchComplete ? 'var(--cmf-success)' : 'var(--cmf-text-muted)',
                }}
            >
                <Search className="w-3.5 h-3.5" />
                <span className="font-medium">Local</span>
                {meta.localSearchComplete && (
                    <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {localTime && <span className="text-xs opacity-75">{localTime}</span>}
                    </>
                )}
            </div>

            {/* AI Search Status */}
            {meta.aiSearchEnabled && (
                <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                    style={{
                        backgroundColor: meta.aiSearchComplete
                            ? (meta.aiSearchError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(139, 92, 246, 0.1)')
                            : 'var(--cmf-surface-2)',
                        color: meta.aiSearchComplete
                            ? (meta.aiSearchError ? 'var(--cmf-error)' : 'rgb(139, 92, 246)')
                            : 'var(--cmf-text-muted)',
                    }}
                >
                    <Cpu className="w-3.5 h-3.5" />
                    <span className="font-medium">Gemini AI</span>
                    {!meta.aiSearchComplete ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : meta.aiSearchError ? (
                        <AlertCircle className="w-3.5 h-3.5" title={meta.aiSearchError} />
                    ) : (
                        <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {aiTime && <span className="text-xs opacity-75">{aiTime}</span>}
                        </>
                    )}
                </div>
            )}

            {/* AI Disabled indicator */}
            {!meta.aiSearchEnabled && (
                <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                    style={{
                        backgroundColor: 'var(--cmf-surface-2)',
                        color: 'var(--cmf-text-muted)',
                    }}
                    title="Configure VITE_API_KEY to enable AI-powered search"
                >
                    <Cpu className="w-3.5 h-3.5 opacity-50" />
                    <span className="font-medium opacity-50">AI Disabled</span>
                </div>
            )}
        </div>
    );
};

// Helper component to highlight the search query in a string.
const Highlight: React.FC<{ text: string | undefined; query: string }> = ({ text, query }) => {
    if (!text) return null;
    if (!query) return <>{text}</>;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === query.toLowerCase() ? (
                    <mark key={i} className="bg-yellow-200 dark:bg-yellow-500 text-black rounded px-1 py-0.5 font-bold">
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </>
    );
};

// Card component for displaying a single result
interface ResultCardProps {
    type: string;
    title: React.ReactNode;
    context1?: React.ReactNode;
    context2?: React.ReactNode;
    onClick: () => void;
    icon: React.ReactNode;
}

const ResultCard: React.FC<ResultCardProps> = ({ type, title, context1, context2, onClick, icon }) => (
    <button onClick={onClick} className="w-full text-left p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-violet-400 dark:hover:border-violet-500 hover:shadow-md transition-all flex items-start gap-4">
        <div className="text-violet-500 mt-1 flex-shrink-0">{icon}</div>
        <div className="flex-1 overflow-hidden">
            <div className="flex justify-between items-center gap-2">
                <h3 className="text-md font-semibold text-slate-800 dark:text-slate-100 truncate">{title}</h3>
                <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full dark:bg-slate-700 dark:text-slate-300 flex-shrink-0">{type}</span>
            </div>
            {context1 && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 truncate">{context1}</p>}
            {context2 && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{context2}</p>}
        </div>
    </button>
);

const WebResultCard: React.FC<{ result: WebSearchResult, query: string }> = ({ result, query }) => (
    <div className="w-full text-left p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-fuchsia-400 dark:hover:border-fuchsia-500 hover:shadow-md transition-all flex items-start gap-4">
        <div className="text-fuchsia-500 mt-1 flex-shrink-0"><GlobeIcon /></div>
        <div className="flex-1 overflow-hidden">
            <div className="flex justify-between items-center gap-2">
                <h3 className="text-md font-semibold text-slate-800 dark:text-slate-100 truncate">
                    <Highlight text={result.name} query={query} />
                </h3>
                <span className="text-xs font-medium bg-fuchsia-100 text-fuchsia-700 px-2 py-1 rounded-full dark:bg-fuchsia-900/50 dark:text-fuchsia-300 flex-shrink-0">Web Lead</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                <Highlight text={result.description} query={query} />
            </p>
            <div className="mt-2 flex items-center gap-4 text-xs">
                {result.url && <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold truncate">Visit Website</a>}
                {result.source && result.source !== '#' && <a href={result.source} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:underline truncate">Source</a>}
            </div>
        </div>
    </div>
);

// Navigation result card - for app pages
const NavResultCard: React.FC<{ result: NavSearchResult, query: string, onClick: () => void }> = ({ result, query, onClick }) => (
    <button
        onClick={onClick}
        className="w-full text-left p-4 rounded-lg border transition-all flex items-center gap-4 group"
        style={{
            backgroundColor: 'var(--cmf-surface)',
            borderColor: 'var(--cmf-border)',
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--cmf-accent)';
            e.currentTarget.style.boxShadow = 'var(--cmf-shadow-md)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--cmf-border)';
            e.currentTarget.style.boxShadow = 'none';
        }}
    >
        <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--cmf-accent-subtle)', color: 'var(--cmf-accent)' }}
        >
            <Navigation className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
                <h3
                    className="font-semibold truncate"
                    style={{ color: 'var(--cmf-text)' }}
                >
                    <Highlight text={result.label} query={query} />
                </h3>
                <span
                    className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: 'var(--cmf-surface-2)', color: 'var(--cmf-text-muted)' }}
                >
                    {result.section}
                </span>
            </div>
            <p
                className="text-sm mt-0.5 truncate"
                style={{ color: 'var(--cmf-text-muted)' }}
            >
                Go to {result.label} page
            </p>
        </div>
        <ArrowRight
            className="w-5 h-5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: 'var(--cmf-accent)' }}
        />
    </button>
);

// Feature/Action result card - for quick actions
const FeatureResultCard: React.FC<{ result: FeatureSearchResult, query: string, onClick: () => void }> = ({ result, query, onClick }) => (
    <button
        onClick={onClick}
        className="w-full text-left p-4 rounded-lg border transition-all flex items-center gap-4 group"
        style={{
            backgroundColor: 'var(--cmf-surface)',
            borderColor: 'var(--cmf-border)',
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--cmf-success)';
            e.currentTarget.style.boxShadow = 'var(--cmf-shadow-md)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--cmf-border)';
            e.currentTarget.style.boxShadow = 'none';
        }}
    >
        <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--cmf-success)' }}
        >
            <Zap className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
            <h3
                className="font-semibold truncate"
                style={{ color: 'var(--cmf-text)' }}
            >
                <Highlight text={result.label} query={query} />
            </h3>
            <p
                className="text-sm mt-0.5 truncate"
                style={{ color: 'var(--cmf-text-muted)' }}
            >
                <Highlight text={result.description} query={query} />
            </p>
        </div>
        <ArrowRight
            className="w-5 h-5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: 'var(--cmf-success)' }}
        />
    </button>
);


// Main search results page component
interface SearchResultsPageProps {
  query: string;
  isLoading: boolean;
  results: SearchResults | null;
  onNavigateToProject: (projectId: string) => void;
  onNavigateToPage: (page: Page) => void;
  onFeatureAction?: (action: string) => void;
}


export const SearchResultsPage: React.FC<SearchResultsPageProps> = ({
    query,
    isLoading,
    results,
    onNavigateToProject,
    onNavigateToPage,
    onFeatureAction,
}) => {

    // Calculate total results including navigation and features
    const totalResults = results
    ? (results.navigation?.length || 0) +
      (results.features?.length || 0) +
      (results.projects?.length || 0) +
      (results.clients?.length || 0) +
      (results.tasks?.length || 0) +
      (results.teamMembers?.length || 0) +
      (results.activities?.length || 0) +
      (results.volunteers?.length || 0) +
      (results.cases?.length || 0) +
      (results.documents?.length || 0) +
      (results.webResults?.length || 0)
    : 0;
    
    // These helpers are needed because the results objects are minimal
    const clients = results?.clients || [];
    const projects = results?.projects || [];

    const getClientName = (clientId: string | null | undefined) => clients.find(c => c.id === clientId)?.name || 'N/A';
    const getProjectName = (projectId: string | null | undefined) => projects.find(p => p.id === projectId)?.name || 'N/A';

    if (isLoading || !results) {
         return (
            <div>
                 <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Searching...</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                    Finding results for <span className="font-semibold text-violet-600 dark:text-violet-400">"{query}"</span>
                </p>
                <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
                    <p className="text-slate-500 dark:text-slate-400 font-semibold mt-4">Searching your CRM...</p>
                </div>
            </div>
        )
    }

    // Check if there are navigation/feature results
    const hasNavResults = (results.navigation?.length || 0) > 0;
    const hasFeatureResults = (results.features?.length || 0) > 0;

    // Check if there are CRM data results (excluding nav, features, and web)
    const hasCrmDataResults =
      (results.projects?.length || 0) +
      (results.clients?.length || 0) +
      (results.tasks?.length || 0) +
      (results.teamMembers?.length || 0) +
      (results.activities?.length || 0) +
      (results.volunteers?.length || 0) +
      (results.cases?.length || 0) +
      (results.documents?.length || 0) > 0;

    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Search Results</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-2">
                Found {totalResults} result{totalResults !== 1 ? 's' : ''} for <span className="font-semibold text-violet-600 dark:text-violet-400">"{query}"</span>
            </p>

            {/* Search Status Indicator */}
            <SearchStatusIndicator meta={results.meta} />

            {totalResults > 0 ? (
                <div className="space-y-8">
                    {/* Navigation & Quick Actions Section - show first for instant results */}
                    {(hasNavResults || hasFeatureResults) && (
                        <div>
                            <h3
                                className="text-xl font-semibold mb-4 border-b pb-2"
                                style={{ color: 'var(--cmf-text)', borderColor: 'var(--cmf-border)' }}
                            >
                                Quick Navigation & Actions
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Navigation Results */}
                                {results.navigation?.map(nav => (
                                    <NavResultCard
                                        key={`nav-${nav.pageId}`}
                                        result={nav}
                                        query={query}
                                        onClick={() => onNavigateToPage(nav.pageId)}
                                    />
                                ))}
                                {/* Feature/Action Results */}
                                {results.features?.map(feat => (
                                    <FeatureResultCard
                                        key={`feat-${feat.action}`}
                                        result={feat}
                                        query={query}
                                        onClick={() => onFeatureAction?.(feat.action)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Web Results Section */}
                    {results.webResults && results.webResults.length > 0 && (
                        <div>
                            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4 border-b pb-2 dark:border-slate-700">Potential New Leads from the Web</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {results.webResults.map((res, i) => (
                                    <WebResultCard key={`web-${i}`} result={res} query={query} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Internal CRM Results Section */}
                    {hasCrmDataResults && (
                        <div>
                             <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4 border-b pb-2 dark:border-slate-700">Results from your CRM</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* FIX: Corrected property names from '...Results' to match the 'SearchResults' interface (e.g., 'projectResults' to 'projects'). */}
                                {results.projects.map(p => <ResultCard key={`proj-${p.id}`} type="Project" title={<Highlight text={p.name} query={query} />} context1={<>Client: {getClientName(p.clientId)}</>} context2={<Highlight text={p.description} query={query} />} onClick={() => onNavigateToProject(p.id)} icon={<FolderIcon />} />)}
                                {results.clients.map(c => <ResultCard key={`client-${c.id}`} type="Organization" title={<Highlight text={c.name} query={query} />} context1={<>Contact: <Highlight text={c.contactPerson} query={query} /></>} onClick={() => onNavigateToPage('organizations')} icon={<BuildingIcon />} />)}
                                {results.tasks.map(t => <ResultCard key={`task-${t.id}`} type="Task" title={<Highlight text={t.description} query={query} />} context1={<>Project: {t.projectName}</>} onClick={() => onNavigateToProject(t.projectId)} icon={<CheckSquareIcon />} />)}
                                {results.teamMembers.map(tm => <ResultCard key={`tm-${tm.id}`} type="Team Member" title={<Highlight text={tm.name} query={query} />} context1={<Highlight text={tm.role} query={query} />} onClick={() => onNavigateToPage('team')} icon={<BriefcaseIcon />} />)}
                                {results.activities.map(a => <ResultCard key={`act-${a.id}`} type="Activity" title={<Highlight text={a.title} query={query} />} context1={<>Client: {getClientName(a.clientId)} / Project: {getProjectName(a.projectId)}</>} context2={<Highlight text={a.notes} query={query} />} onClick={() => onNavigateToPage('activities')} icon={<ClipboardListIcon />} />)}
                                {results.volunteers.map(v => <ResultCard key={`vol-${v.id}`} type="Volunteer" title={<Highlight text={v.name} query={query} />} context1={<>Skills: <Highlight text={v.skills.join(', ')} query={query} /></>} onClick={() => onNavigateToPage('volunteers')} icon={<HandHeartIcon />} />)}
                                {results.cases.map(c => <ResultCard key={`case-${c.id}`} type="Case" title={<Highlight text={c.title} query={query} />} context1={<>Client: {getClientName(c.clientId)}</>} context2={<Highlight text={c.description} query={query} />} onClick={() => onNavigateToPage('case')} icon={<CaseIcon />} />)}
                                {results.documents.map(d => <ResultCard key={`doc-${d.id}`} type="Document" title={<Highlight text={d.name} query={query} />} context1={<>Category: {d.category}</>} onClick={() => onNavigateToPage('documents')} icon={<DocumentsIcon />} />)}
                             </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                    <p className="text-slate-500 dark:text-slate-400 font-semibold">No results found.</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Try searching for something else, or rephrasing your query.</p>
                </div>
            )}
        </div>
    );
};
