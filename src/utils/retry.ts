/**
 * Retry utility for handling transient failures
 */

export interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: 'linear' | 'exponential';
  onRetry?: (error: Error, attempt: number) => void;
  shouldRetry?: (error: Error) => boolean;
}

const defaultOptions: Required<RetryOptions> = {
  maxAttempts: 3,
  delay: 1000,
  backoff: 'exponential',
  onRetry: () => {},
  shouldRetry: () => true,
};

/**
 * Retry a function with exponential backoff
 *
 * @param fn - The function to retry
 * @param options - Retry options
 * @returns Promise that resolves with the function result or rejects after all retries fail
 *
 * @example
 * const result = await retryWithBackoff(
 *   () => fetch('https://api.example.com/data'),
 *   { maxAttempts: 5, delay: 1000 }
 * );
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...defaultOptions, ...options };
  let lastError: Error;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      const isLastAttempt = attempt === opts.maxAttempts;
      const shouldRetryError = opts.shouldRetry(lastError);

      if (isLastAttempt || !shouldRetryError) {
        throw lastError;
      }

      const delay = opts.backoff === 'exponential'
        ? opts.delay * Math.pow(2, attempt - 1)
        : opts.delay * attempt;

      opts.onRetry(lastError, attempt);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Wrap a function with retry logic
 *
 * @param fn - The function to wrap
 * @param options - Retry options
 * @returns A new function with retry logic built-in
 *
 * @example
 * const fetchWithRetry = withRetry(
 *   (url: string) => fetch(url).then(r => r.json()),
 *   { maxAttempts: 3 }
 * );
 * const data = await fetchWithRetry('https://api.example.com/data');
 */
export function withRetry<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  options: RetryOptions = {}
): (...args: TArgs) => Promise<TReturn> {
  return (...args: TArgs) => retryWithBackoff(() => fn(...args), options);
}

/**
 * React hook for retrying operations
 *
 * @param options - Retry options
 * @returns Object with retry function and state
 *
 * @example
 * const { retry, isRetrying, retryCount } = useRetry({
 *   maxAttempts: 3,
 *   onRetry: (error, attempt) => console.log(`Retry ${attempt} after error:`, error)
 * });
 *
 * const loadData = async () => {
 *   await retry(() => fetchData());
 * };
 */
export function useRetry(options: RetryOptions = {}) {
  const [isRetrying, setIsRetrying] = React.useState(false);
  const [retryCount, setRetryCount] = React.useState(0);
  const [error, setError] = React.useState<Error | null>(null);

  const retry = async <T,>(fn: () => Promise<T>): Promise<T> => {
    setIsRetrying(true);
    setError(null);
    setRetryCount(0);

    try {
      return await retryWithBackoff(fn, {
        ...options,
        onRetry: (err, attempt) => {
          setRetryCount(attempt);
          options.onRetry?.(err, attempt);
        },
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsRetrying(false);
    }
  };

  const reset = () => {
    setIsRetrying(false);
    setRetryCount(0);
    setError(null);
  };

  return {
    retry,
    isRetrying,
    retryCount,
    error,
    reset,
  };
}

// React import for the hook
import React from 'react';

/**
 * Common retry scenarios
 */

export const networkRetryOptions: RetryOptions = {
  maxAttempts: 3,
  delay: 1000,
  backoff: 'exponential',
  shouldRetry: (error) => {
    // Retry on network errors and 5xx server errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return true;
    }
    if ('status' in error) {
      const status = (error as any).status;
      return status >= 500 && status < 600;
    }
    return false;
  },
};

export const databaseRetryOptions: RetryOptions = {
  maxAttempts: 5,
  delay: 500,
  backoff: 'exponential',
  shouldRetry: (error) => {
    // Retry on connection errors and timeouts
    const message = error.message.toLowerCase();
    return (
      message.includes('connection') ||
      message.includes('timeout') ||
      message.includes('econnreset')
    );
  },
};
