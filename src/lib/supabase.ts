import { createClient } from '@supabase/supabase-js';

const configuredSupabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const configuredSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(configuredSupabaseUrl && configuredSupabaseAnonKey);
const supabaseUrl = configuredSupabaseUrl || 'https://missing-supabase-configuration.invalid';
const supabaseAnonKey = configuredSupabaseAnonKey || 'missing-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const EDGE_FUNCTION_URL = `${supabaseUrl}/functions/v1/analyze-job`;
