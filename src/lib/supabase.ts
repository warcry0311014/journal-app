import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if the URL is valid to prevent Next.js from crashing when keys are missing
const isValidUrl = supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://');

// Create a single supabase client for interacting with your database
export const supabase = isValidUrl 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;
