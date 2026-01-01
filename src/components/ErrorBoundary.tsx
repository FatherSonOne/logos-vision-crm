import React from 'react';

interface Props {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

// @ts-ignore - Class component with explicit types
export class ErrorBoundary extends React.Component<Props, State> {
    state: State = { hasError: false, error: null, errorInfo: null };

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        (this as any).setState({ errorInfo });
        const onError = (this as any).props.onError;
        if (onError) {
            onError(error, errorInfo);
        }
        console.error('Error caught by boundary:', error, errorInfo);
    }

    handleRetry = (): void => {
        (this as any).setState({ hasError: false, error: null, errorInfo: null });
    };

    render(): React.ReactNode {
        const { hasError, error, errorInfo } = this.state;
        const { fallback, children } = (this as any).props as Props;

        if (hasError) {
            if (fallback) {
                return fallback;
            }

            return (
                <div className="min-h-[400px] flex items-center justify-center p-8">
                    <div className="text-center max-w-md">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <svg
                                className="w-8 h-8 text-red-600 dark:text-red-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Something went wrong
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            An error occurred while rendering this component. Please try again or refresh the page.
                        </p>
                        {error && (
                            <details className="mb-4 text-left bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
                                <summary className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                    Error Details
                                </summary>
                                <pre className="mt-2 text-xs text-red-600 dark:text-red-400 overflow-auto max-h-32">
                                    {error.toString()}
                                    {errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={this.handleRetry}
                                className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors font-medium"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors font-medium"
                            >
                                Refresh Page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return children;
    }
}

// Page-level error boundary with navigation context
interface PageErrorBoundaryProps {
    children: React.ReactNode;
    pageName?: string;
    onNavigateHome?: () => void;
}

export const PageErrorBoundary: React.FC<PageErrorBoundaryProps> = ({
    children,
    pageName = 'this page',
    onNavigateHome
}) => {
    return (
        <ErrorBoundary
            fallback={
                <div className="min-h-[600px] flex items-center justify-center p-8 bg-gray-50 dark:bg-slate-900">
                    <div className="text-center max-w-lg">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <svg
                                className="w-10 h-10 text-red-600 dark:text-red-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            Oops! Something broke
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            We encountered an error loading {pageName}. Our team has been notified and is working on a fix.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-5 py-2.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors font-medium"
                            >
                                Refresh Page
                            </button>
                            {onNavigateHome && (
                                <button
                                    onClick={onNavigateHome}
                                    className="px-5 py-2.5 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors font-medium"
                                >
                                    Go to Dashboard
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            }
        >
            {children}
        </ErrorBoundary>
    );
};

// Loading state component
interface LoadingStateProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
    message = 'Loading...',
    size = 'md'
}) => {
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-10 h-10',
        lg: 'w-16 h-16'
    };

    return (
        <div className="flex flex-col items-center justify-center p-8">
            <div className={`${sizeClasses[size]} animate-spin`}>
                <svg className="w-full h-full text-rose-500" fill="none" viewBox="0 0 24 24">
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            </div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">{message}</p>
        </div>
    );
};

// Empty state component
interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    action
}) => {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
            {icon && (
                <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-400 dark:text-gray-500">
                    {icon}
                </div>
            )}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {title}
            </h3>
            {description && (
                <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-sm">
                    {description}
                </p>
            )}
            {action && (
                <button
                    onClick={action.onClick}
                    className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors font-medium"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
};

// Skeleton loader components
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`animate-pulse bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 ${className}`}>
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-3" />
        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mb-2" />
        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-2/3" />
    </div>
);

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
    <div className="animate-pulse">
        <div className="h-10 bg-gray-100 dark:bg-slate-700 rounded mb-2" />
        {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="h-14 bg-gray-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 flex items-center px-4 gap-4">
                <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded flex-1" />
                <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-24" />
                <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-32" />
                <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-20" />
            </div>
        ))}
    </div>
);

export const SkeletonList: React.FC<{ items?: number }> = ({ items = 5 }) => (
    <div className="animate-pulse space-y-3">
        {Array.from({ length: items }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <div className="w-10 h-10 bg-gray-200 dark:bg-slate-700 rounded-full" />
                <div className="flex-1">
                    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
                    <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded w-1/2" />
                </div>
            </div>
        ))}
    </div>
);
