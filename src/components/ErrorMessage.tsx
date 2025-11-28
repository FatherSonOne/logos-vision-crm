import React from 'react';
import { AlertCircleIcon, RefreshIcon, HomeIcon } from './icons';

export interface ErrorMessageProps {
  title?: string;
  message?: string;
  error?: Error;
  showDetails?: boolean;
  onRetry?: () => void;
  onGoHome?: () => void;
  className?: string;
}

/**
 * User-friendly error message component
 *
 * Features:
 * - Clear error title and message
 * - Optional stack trace
 * - Retry button
 * - Go home button
 * - Friendly error suggestions
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Something went wrong',
  message,
  error,
  showDetails = false,
  onRetry,
  onGoHome,
  className = '',
}) => {
  const [showStack, setShowStack] = React.useState(false);

  // Get user-friendly error message
  const getUserFriendlyMessage = () => {
    if (message) return message;

    const errorMsg = error?.message?.toLowerCase() || '';

    // Network errors
    if (errorMsg.includes('network') || errorMsg.includes('fetch failed')) {
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    }

    // Timeout errors
    if (errorMsg.includes('timeout')) {
      return 'The request took too long to complete. Please try again.';
    }

    // Permission errors
    if (errorMsg.includes('permission') || errorMsg.includes('unauthorized')) {
      return 'You don\'t have permission to perform this action. Please contact your administrator.';
    }

    // Not found errors
    if (errorMsg.includes('not found') || errorMsg.includes('404')) {
      return 'The requested resource was not found.';
    }

    // Validation errors
    if (errorMsg.includes('validation')) {
      return 'Please check your input and try again.';
    }

    // Generic error
    return error?.message || 'An unexpected error occurred. Please try again later.';
  };

  return (
    <div className={`rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <AlertCircleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
            {title}
          </h3>

          <p className="text-sm text-red-800 dark:text-red-200 mb-4">
            {getUserFriendlyMessage()}
          </p>

          {/* Error details */}
          {showDetails && error && (
            <div className="mt-4">
              <button
                onClick={() => setShowStack(!showStack)}
                className="text-sm text-red-700 dark:text-red-300 hover:underline mb-2"
              >
                {showStack ? 'Hide' : 'Show'} technical details
              </button>

              {showStack && (
                <details className="mt-2 text-xs text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/40 p-3 rounded border border-red-200 dark:border-red-700 overflow-auto max-h-48">
                  <summary className="font-semibold cursor-pointer mb-2">
                    Error: {error.name}
                  </summary>
                  <pre className="whitespace-pre-wrap font-mono">
                    {error.stack || error.message}
                  </pre>
                </details>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mt-4">
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-semibold transition-colors"
              >
                <RefreshIcon className="h-4 w-4" />
                Try Again
              </button>
            )}

            {onGoHome && (
              <button
                onClick={onGoHome}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md text-sm font-semibold transition-colors"
              >
                <HomeIcon className="h-4 w-4" />
                Go to Dashboard
              </button>
            )}
          </div>

          {/* Help text */}
          <div className="mt-4 p-3 bg-white dark:bg-slate-900/50 rounded border border-red-200 dark:border-red-800">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              <strong>Need help?</strong> If this problem persists, please contact support with the error details above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Inline error message (smaller variant)
 */
export const InlineErrorMessage: React.FC<{
  message: string;
  onDismiss?: () => void;
}> = ({ message, onDismiss }) => {
  return (
    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-800 dark:text-red-200">
      <AlertCircleIcon className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
      <p className="flex-1">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
};

/**
 * Empty state with error (for lists that failed to load)
 */
export const EmptyErrorState: React.FC<{
  title?: string;
  message?: string;
  onRetry?: () => void;
}> = ({
  title = 'Failed to load data',
  message = 'We couldn\'t load the data. Please try again.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
        <AlertCircleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
      </div>

      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>

      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-md">
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-sm font-semibold transition-colors"
        >
          <RefreshIcon className="h-4 w-4" />
          Try Again
        </button>
      )}
    </div>
  );
};
