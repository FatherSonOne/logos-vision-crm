import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file from the project root
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      port: 5176,
      host: '0.0.0.0',
    },
    optimizeDeps: {
      exclude: ['lucide-react'], // Prevent over-optimization
    },
    plugins: [react()],
    define: {
      // Make API keys available via import.meta.env
      'import.meta.env.VITE_API_KEY': JSON.stringify(env.VITE_API_KEY),
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
      'import.meta.env.VITE_GOOGLE_MAPS_KEY': JSON.stringify(env.VITE_GOOGLE_MAPS_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      // Enable source maps for production debugging (optional)
      sourcemap: false,
      // Optimize chunks
      rollupOptions: {
        output: {
          // Ensure react-vendor loads before other chunks
          manualChunks: (id) => {
            // Vendor chunks
            if (id.includes('node_modules')) {
              // React core ecosystem - must load first (includes react, react-dom, scheduler, jsx-runtime)
              if (id.includes('/react-dom/') || id.includes('/react/') || id.includes('scheduler') ||
                  id.match(/\/react\/[^\/]*\.js$/)) {
                return 'react-vendor';
              }
              // lucide-react in separate chunk that loads after React
              if (id.includes('lucide-react')) {
                return 'lucide-icons';
              }
              // Router (depends on React, so separate from react-vendor)
              if (id.includes('react-router')) {
                return 'router';
              }
              // Charts
              if (id.includes('recharts')) {
                return 'charts';
              }
              // AI/ML libraries
              if (id.includes('@google/genai') || id.includes('@anthropic-ai/sdk')) {
                return 'genai';
              }
              // Database
              if (id.includes('supabase')) {
                return 'supabase';
              }
              // Google Maps
              if (id.includes('@react-google-maps')) {
                return 'maps';
              }
              // Analytics
              if (id.includes('@vercel/analytics') || id.includes('@vercel/speed-insights')) {
                return 'analytics';
              }
              // Other vendor code
              return 'vendor';
            }

            // App code chunks by feature
            if (id.includes('/src/components/')) {
              // Calendar components
              if (id.includes('/calendar/')) {
                return 'calendar-components';
              }
              // Task components
              if (id.includes('/tasks/')) {
                return 'task-components';
              }
              // Large components get their own chunks
              if (id.includes('Dashboard.tsx') || id.includes('AnalyticsDashboard.tsx')) {
                return 'dashboard';
              }
              if (id.includes('CalendarView.tsx')) {
                return 'calendar-view';
              }
              if (id.includes('TaskView.tsx')) {
                return 'task-view';
              }
            }

            // Services
            if (id.includes('/src/services/')) {
              if (id.includes('taskAiService') || id.includes('taskAutomationService')) {
                return 'ai-services';
              }
            }
          },
          // Optimize chunk file names
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        }
      },
      chunkSizeWarningLimit: 600,
      // Use esbuild minification (faster and avoids module init issues)
      minify: 'esbuild',
      esbuild: {
        drop: ['console', 'debugger'], // Remove console.logs and debugger in production
        keepNames: false,
      },
      // Optimize CSS
      cssCodeSplit: true,
      // Increase chunk size limit for better caching
      assetsInlineLimit: 4096,
    }
  };
});
