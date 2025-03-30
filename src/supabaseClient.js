import { createClient } from '@supabase/supabase-js';

// Hardcoded configuration (temporary solution)
const supabaseConfig = {
  url: 'https://vkopufpkafrfvdkdmtgk.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrb3B1ZnBrYWZyZnZka2RtdGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2NTIwMTUsImV4cCI6MjA1ODIyODAxNX0.6a-2FFKTSr6zZURKvxSuXdetKO6Tn15NxzLJSn5rEYo',
  options: {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined
    }
  }
};

// Debug output
console.log('[Supabase] Initializing with:', {
  url: supabaseConfig.url,
  key: supabaseConfig.key ? '***loaded***' : 'MISSING',
  environment: import.meta.env.MODE
});

// Validate configuration
if (!supabaseConfig.url || !supabaseConfig.key) {
  const errorMsg = 'Supabase configuration error: Missing URL or Key';
  console.error(errorMsg);
  throw new Error(errorMsg);
}

// Initialize client
export const supabase = createClient(
  supabaseConfig.url,
  supabaseConfig.key,
  supabaseConfig.options
);

// Test connection on startup
(async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (error) throw error;
    console.log('[Supabase] Connection test successful');
  } catch (error) {
    console.error('[Supabase] Connection test failed:', error.message);
  }
})();