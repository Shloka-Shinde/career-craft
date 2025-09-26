import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://sckyfycbjlpsoqgcedob.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNja3lmeWNiamxwc29xZ2NlZG9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MzgyMDksImV4cCI6MjA3MzUxNDIwOX0.ZwumZxaBygpfYBDq5YN_sWL6Mvu2DFvKyKg6Op1HfHM";

// Import the Supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
