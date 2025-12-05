# Supabase Setup for NestFi

## 1. Create Page Views Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create page_views table for monthly visit tracking
CREATE TABLE page_views (
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
CREATE INDEX idx_page_views_month ON page_views(page, month_key);

-- Enable Row Level Security
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for tracking)
CREATE POLICY "Allow anonymous inserts" ON page_views
  FOR INSERT WITH CHECK (true);

-- Allow anonymous reads (for displaying counts)
CREATE POLICY "Allow anonymous reads" ON page_views
  FOR SELECT USING (true);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_page_views_updated_at BEFORE UPDATE
    ON page_views FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## 2. Newsletter Subscribers Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create newsletter_subscribers table
CREATE TABLE newsletter_subscribers (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT DEFAULT 'website_footer'
);

-- Enable Row Level Security
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts
CREATE POLICY "Allow anonymous inserts" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);
```

## 3. Environment Variables

Add these to your Vercel project (Settings → Environment Variables):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## How It Works

- **Monthly Tracking**: Views are tracked per month with a `month_key` (e.g., "2025-01")
- **Auto-Reset**: Each new month creates a new entry, effectively resetting the count
- **Session-Based**: Each user session only counts as 1 view (uses sessionStorage)
- **Display**: Footer shows current month's count with format like "1.2k views this January"
