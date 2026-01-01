/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_API_KEY: string
  readonly VITE_GEMINI_API_KEY: string
  readonly VITE_GOOGLE_MAPS_API_KEY: string
  readonly VITE_GOOGLE_CLIENT_ID: string
  readonly VITE_GOOGLE_CLIENT_SECRET: string
  readonly VITE_OUTLOOK_CLIENT_ID: string
  readonly VITE_OUTLOOK_CLIENT_SECRET: string
  readonly VITE_PULSE_SUPABASE_URL: string
  readonly VITE_PULSE_SUPABASE_ANON_KEY: string
  readonly VITE_LOGOS_SUPABASE_URL: string
  readonly VITE_LOGOS_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
