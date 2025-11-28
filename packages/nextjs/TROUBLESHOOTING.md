# Frontend Not Loading - Troubleshooting Guide 🔧

## Quick Fix Steps

### 1. Kill Existing Processes
```bash
# Kill any running Next.js processes
pkill -f "next dev" || true
lsof -ti:3000 | xargs kill -9 || true
```

### 2. Clean and Restart
```bash
# From packages/nextjs directory:
cd /Users/gearhead/Gearhead/Scaffold-ETH/nestfi/packages/nextjs

# Remove build artifacts
rm -rf .next
rm -rf node_modules/.cache

# Restart dev server
yarn dev
```

### 3. Check for Errors
Open the terminal and look for:
- ❌ **Build errors** - TypeScript or syntax errors
- ❌ **Module not found** - Missing imports
- ❌ **Port conflicts** - Port 3000 already in use

## Common Issues & Solutions

### Issue 1: "Cannot find module"
**Error**: `Module not found: Can't resolve '~~/components/...'`

**Solution**:
```bash
# Check if the file exists
ls -la components/ClientOnly.tsx
ls -la components/ui/

# If files are missing, they should be re-created
```

### Issue 2: "Port 3000 is already in use"
**Solution**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 yarn dev
```

### Issue 3: "Build failed"
**Check the error message carefully**, then:

```bash
# 1. Check TypeScript
yarn check-types

# 2. Clear everything and reinstall
rm -rf .next node_modules
yarn install
yarn dev
```

### Issue 4: "White/blank screen"
**Possible causes**:
- JavaScript errors in browser console
- Hydration mismatch
- Missing CSS

**Solution**:
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests

### Issue 5: "Tailwind classes not working"
**Error**: Unknown utility classes

**Solution**:
```bash
# Restart dev server completely
pkill -f "next dev"
yarn dev
```

## Verify Installation

### Check Key Files Exist:
```bash
# From packages/nextjs directory:
ls -la components/ClientOnly.tsx
ls -la components/ui/card.tsx
ls -la components/ui/button.tsx
ls -la components/dashboard/StatsCard.tsx
ls -la app/dashboard/page.tsx
ls -la app/dashboard/investor/page.tsx
ls -la app/dashboard/manager/page.tsx
```

All should show file sizes (not "No such file").

### Check Package.json:
```bash
cat package.json | grep -A2 dependencies | head -20
```

Should include:
- next
- react
- wagmi
- framer-motion
- daisyui

## Manual Test Steps

### Step 1: Start Fresh
```bash
# Terminal 1
cd /Users/gearhead/Gearhead/Scaffold-ETH/nestfi/packages/nextjs
rm -rf .next
yarn dev
```

### Step 2: Check Terminal Output
You should see:
```
✓ Ready in Xms
○ Compiling / ...
✓ Compiled / in Xs
```

### Step 3: Open Browser
```
http://localhost:3000
```

Should load the landing page.

### Step 4: Check Browser Console
Open DevTools (F12) → Console tab
- ✅ **No red errors** = Good
- ❌ **Red errors** = Copy and share them

## Debugging Checklist

- [ ] Node version 18+ (`node -v`)
- [ ] Yarn installed (`yarn -v`)
- [ ] In correct directory (`pwd` shows `.../packages/nextjs`)
- [ ] No port conflicts (`lsof -i:3000` shows nothing)
- [ ] Clean .next directory (`rm -rf .next`)
- [ ] Dev server running (`yarn dev`)
- [ ] Browser open to localhost:3000
- [ ] Console clear of errors

## Get More Info

### 1. Check Node/Yarn versions:
```bash
node -v    # Should be v18+
yarn -v    # Should be v1.22+ or v3+
```

### 2. Check what's running:
```bash
lsof -i:3000
ps aux | grep next
```

### 3. Check build output:
```bash
yarn build 2>&1 | tee build-log.txt
```

### 4. Check for syntax errors:
```bash
yarn check-types
```

## Still Not Working?

### Collect this information:
1. **Terminal output** when running `yarn dev`
2. **Browser console errors** (F12 → Console tab)
3. **Network errors** (F12 → Network tab)
4. **Node/Yarn versions** from above commands

### Nuclear Option (Fresh Install):
```bash
cd /Users/gearhead/Gearhead/Scaffold-ETH/nestfi/packages/nextjs

# Backup
cp package.json package.json.backup

# Clean everything
rm -rf node_modules .next

# Reinstall
yarn install

# Try again
yarn dev
```

## Expected Working State

When everything works:

**Terminal:**
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
✓ Ready in 2-3s
```

**Browser (localhost:3000):**
- Landing page loads
- No console errors
- Styles working
- Images loading

**Browser (localhost:3000/dashboard):**
- Redirects based on wallet state
- Dashboard loads
- Sidebar visible
- No errors

---

**If you're still stuck, share:**
1. The exact error message from terminal
2. Any browser console errors
3. Output of `node -v` and `yarn -v`

