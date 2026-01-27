/**
 * CollaborationErrorBoundary Component
 * =====================================
 * Error boundary for collaboration components to gracefully handle errors
 * without breaking the entire page.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class CollaborationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Collaboration component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-semibold">Unable to load collaboration features</span>
          </div>
          <p className="text-sm text-red-600 dark:text-red-300">
            {this.state.error?.message || 'An unexpected error occurred. Please try refreshing the page.'}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default CollaborationErrorBoundary;
