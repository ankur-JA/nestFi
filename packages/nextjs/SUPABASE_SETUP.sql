-- ============================================
-- NestFi Supabase Database Setup
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- ============================================

-- 1. Create page_views table for monthly visit tracking
CREATE TABLE IF NOT EXISTS page_views (
  id BIGSERIAL PRIMARY KEY,
  page TEXT NOT NULL DEFAULT 'landing',
  month_key TEXT NOT NULL, -- Format: "2025-01"
  year INTEGER NOT NULL,
  month INTEGER NOT NULL, -- 1-12
  count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page, month_key)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_page_views_month ON page_views(page, month_key);

-- Enable Row Level Security
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous inserts" ON page_views;
DROP POLICY IF EXISTS "Allow anonymous reads" ON page_views;

-- Allow anonymous inserts (for tracking)
CREATE POLICY "Allow anonymous inserts" ON page_views
  FOR INSERT WITH CHECK (true);

-- Allow anonymous reads (for displaying counts)
CREATE POLICY "Allow anonymous reads" ON page_views
  FOR SELECT USING (true);

-- ============================================
-- 2. Create newsletter_subscribers table
-- ============================================

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT DEFAULT 'website_footer'
);

-- Enable Row Level Security
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow anonymous inserts" ON newsletter_subscribers;

-- Allow anonymous inserts
CREATE POLICY "Allow anonymous inserts" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- ============================================
-- 3. Function to auto-update updated_at (optional)
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists
DROP TRIGGER IF EXISTS update_page_views_updated_at ON page_views;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_page_views_updated_at BEFORE UPDATE
    ON page_views FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Setup Complete!
-- ============================================
-- Now add these environment variables to Vercel:
-- NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
-- NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
