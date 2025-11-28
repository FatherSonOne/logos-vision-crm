import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useStore } from '../store/useStore';

// Configure React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      onError: (error: any) => {
        const addNotification = useStore.getState().addNotification;
        addNotification({
          type: 'error',
          title: 'Operation Failed',
          message: error.message || 'An error occurred while processing your request',
        });
      },
    },
  },
});

export const QueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export { queryClient };
