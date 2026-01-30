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
      include: ['lucide-react'],
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
              // React core (exclude lucide-react from this check)
              if (id.includes('react-dom')) {
                return 'react-vendor';
              }
              // Skip lucide-react - let Vite handle it automatically
              if (id.includes('lucide-react')) {
                return undefined; // Don't manually chunk it
              }
              if (id.includes('react') && !id.includes('lucide')) {
                return 'react-vendor';
              }
              // Router
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
      // Enable minification
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // Remove console.logs in production
          drop_debugger: true,
        },
      },
      // Optimize CSS
      cssCodeSplit: true,
      // Increase chunk size limit for better caching
      assetsInlineLimit: 4096,
    }
  };
});
