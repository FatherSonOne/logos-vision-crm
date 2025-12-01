import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file from the project root
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      // Make API keys available via import.meta.env
      'import.meta.env.VITE_API_KEY': JSON.stringify(env.VITE_API_KEY),
      'import.meta.env.VITE_GOOGLE_MAPS_KEY': JSON.stringify(env.VITE_GOOGLE_MAPS_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Split React and React DOM into their own chunk
            'react-vendor': ['react', 'react-dom'],
            // Split Recharts (charting library) into its own chunk
            'charts': ['recharts'],
            // Split Google GenAI into its own chunk
            'genai': ['@google/genai'],
            // Split Supabase into its own chunk
            'supabase': ['@supabase/supabase-js'],
            // Split Lucide React icons into their own chunk
            'icons': ['lucide-react'],
          }
        }
      },
      chunkSizeWarningLimit: 600, // Increase limit slightly to reduce warnings
    }
  };
});
