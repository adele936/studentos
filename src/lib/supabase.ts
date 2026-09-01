import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pwozfqpqgpqwmedivdtc.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3b3pmcXBxZ3Bxd21lZGl2ZHRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NDIwNTUsImV4cCI6MjEwMjAxODA1NX0.PL9NDUDRxAk6R9p1ghYVz7hcKf05bDiOnfNE-L6iQgg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
