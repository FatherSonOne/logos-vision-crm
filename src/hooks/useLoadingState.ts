import { useState, useCallback } from 'react';

export interface LoadingState {
  isLoading: boolean;
  error: Error | null;
  data: any | null;
}

/**
 * Hook for managing loading states
 *
 * @example
 * const { isLoading, error, execute } = useLoadingState();
 *
 * const loadData = async () => {
 *   await execute(async () => {
 *     const data = await fetchData();
 *     setData(data);
 *   });
 * };
 */
export const useLoadingState = (initialLoading: boolean = false) => {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async <T,>(fn: () => Promise<T>): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fn();
      return result;
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    execute,
    reset,
    setIsLoading,
    setError,
  };
};

/**
 * Hook for managing multiple async operations
 *
 * @example
 * const { states, executeAll } = useMultipleLoadingStates(['users', 'projects']);
 *
 * await executeAll({
 *   users: () => fetchUsers(),
 *   projects: () => fetchProjects(),
 * });
 */
export const useMultipleLoadingStates = (keys: string[]) => {
  const [states, setStates] = useState<Record<string, LoadingState>>(
    keys.reduce((acc, key) => ({
      ...acc,
      [key]: { isLoading: false, error: null, data: null },
    }), {})
  );

  const setLoading = useCallback((key: string, isLoading: boolean) => {
    setStates(prev => ({
      ...prev,
      [key]: { ...prev[key], isLoading },
    }));
  }, []);

  const setError = useCallback((key: string, error: Error | null) => {
    setStates(prev => ({
      ...prev,
      [key]: { ...prev[key], error },
    }));
  }, []);

  const setData = useCallback((key: string, data: any) => {
    setStates(prev => ({
      ...prev,
      [key]: { ...prev[key], data },
    }));
  }, []);

  const execute = useCallback(async <T,>(key: string, fn: () => Promise<T>): Promise<T | null> => {
    setLoading(key, true);
    setError(key, null);

    try {
      const result = await fn();
      setData(key, result);
      return result;
    } catch (err) {
      setError(key, err as Error);
      return null;
    } finally {
      setLoading(key, false);
    }
  }, [setLoading, setError, setData]);

  const executeAll = useCallback(async (operations: Record<string, () => Promise<any>>) => {
    const promises = Object.entries(operations).map(([key, fn]) =>
      execute(key, fn)
    );
    return await Promise.all(promises);
  }, [execute]);

  const isAnyLoading = Object.values(states).some(state => state.isLoading);
  const hasAnyError = Object.values(states).some(state => state.error !== null);

  return {
    states,
    execute,
    executeAll,
    isAnyLoading,
    hasAnyError,
    setLoading,
    setError,
    setData,
  };
};

/**
 * Suspense-like loading wrapper
 */
export interface AsyncDataProps<T> {
  isLoading: boolean;
  error: Error | null;
  data: T | null;
  loadingComponent?: React.ReactNode;
  errorComponent?: (error: Error) => React.ReactNode;
  children: (data: T) => React.ReactNode;
}

export function AsyncData<T>({
  isLoading,
  error,
  data,
  loadingComponent,
  errorComponent,
  children,
}: AsyncDataProps<T>) {
  if (isLoading) {
    return <>{loadingComponent || <div>Loading...</div>}</>;
  }

  if (error) {
    return <>{errorComponent ? errorComponent(error) : <div>Error: {error.message}</div>}</>;
  }

  if (!data) {
    return <div>No data</div>;
  }

  return <>{children(data)}</>;
}
