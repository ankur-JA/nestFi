# Supabase Setup Guide for NestFi

## Problem: "0 views" or Newsletter not working?

This usually means Supabase isn't configured yet. Follow these steps:

---

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for it to finish setting up

---

## Step 2: Create Database Tables

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the entire contents of `SUPABASE_SETUP.sql`
4. Click **Run** (or press Cmd/Ctrl + Enter)
5. You should see "Success. No rows returned"

---

## Step 3: Get Your Credentials

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

---

## Step 4: Add to Vercel

1. Go to your Vercel project
2. **Settings** → **Environment Variables**
3. Add these two variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

4. **Important:** Redeploy your project after adding variables!

---

## Step 5: Verify It's Working

1. Visit your site (nestfi.io)
2. Check browser console (F12) - should NOT see "Supabase not configured"
3. Check Vercel logs for any errors
4. In Supabase Dashboard → **Table Editor** → `page_views` - you should see new rows

---

## Troubleshooting

### Still showing "0 views"?

1. **Check environment variables are set:**
   - Vercel Dashboard → Settings → Environment Variables
   - Make sure they're set for Production, Preview, and Development

2. **Redeploy after adding variables:**
   - Vercel won't use new env vars until you redeploy

3. **Check browser console:**
   - Open DevTools (F12)
   - Look for errors when page loads

4. **Check Supabase logs:**
   - Supabase Dashboard → Logs → API Logs
   - Should see POST requests to your tables

5. **Verify table exists:**
   - Supabase Dashboard → Table Editor
   - Should see `page_views` and `newsletter_subscribers` tables

### Newsletter not saving?

1. Same steps as above
2. Check `newsletter_subscribers` table in Supabase
3. Check browser network tab when subscribing

---

## Testing Locally

Create `.env.local` in `packages/nextjs/`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Then restart your dev server.

---

## Monthly Reset

The view counter automatically resets each month:
- December views: `2025-12`
- January views: `2026-01` (starts from 0)

No action needed - it's automatic! 🎉
