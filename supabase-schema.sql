-- Supabase Database Schema for Journal App MVP

-- Create the entries table
CREATE TABLE IF NOT EXISTS entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) - Optional for initial local MVP, but required for production
-- ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- Note: Once authentication is added, you would typically add a `user_id` column to the entries table 
-- and create RLS policies so users can only access their own data.
