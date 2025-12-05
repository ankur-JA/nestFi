# 🚀 Automatic Vercel Deployment Setup

This guide will help you set up automatic deployments to Vercel whenever you push changes to your GitHub repository.

## Prerequisites

- ✅ GitHub repository connected (already set up: `ankur-JA/nestFi`)
- ✅ Vercel account (sign up at [vercel.com](https://vercel.com) if needed)

## Step 1: Connect Repository to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Sign in or create an account

2. **Import Your Project**
   - Click **"Add New..."** → **"Project"**
   - Select **"Import Git Repository"**
   - Find and select your repository: `ankur-JA/nestFi`
   - Click **"Import"**

3. **Configure Project Settings**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `packages/nextjs` (important for monorepo!)
   - **Build Command**: `yarn build` (or leave default)
   - **Output Directory**: `.next` (or leave default)
   - **Install Command**: `yarn install` (or leave default)

4. **Environment Variables**
   - Add any required environment variables:
     - `NEXT_PUBLIC_CHAIN_ID`
     - `NEXT_PUBLIC_RPC_URL`
     - Any other variables from `.env.local`
   - ⚠️ **Never commit `.env.local`** - use Vercel's environment variables instead

5. **Deploy**
   - Click **"Deploy"**
   - Vercel will automatically build and deploy your project

### Option B: Via Vercel CLI

```bash
# 1. Install Vercel CLI (if not already installed)
npm i -g vercel

# 2. Login to Vercel
cd packages/nextjs
yarn vercel:login

# 3. Link your project
yarn vercel

# 4. Follow the prompts:
#    - Link to existing project? Yes
#    - Select your project
#    - Override settings? No (use vercel.json)
```

## Step 2: Enable Automatic Deployments

Once connected, Vercel automatically:

- ✅ **Deploys on every push** to `main`/`master` branch (Production)
- ✅ **Creates preview deployments** for pull requests
- ✅ **Creates preview deployments** for other branches

### Branch Configuration

Vercel will automatically:
- **Production**: Deploys from `main` or `master` branch
- **Preview**: Creates preview URLs for all other branches and PRs

## Step 3: Verify Auto-Deployment

1. **Make a small change** to your code
2. **Commit and push**:
   ```bash
   git add .
   git commit -m "Test auto-deployment"
   git push origin main
   ```
3. **Check Vercel Dashboard**
   - Go to your project dashboard
   - You should see a new deployment starting automatically
   - Wait for it to complete (usually 1-3 minutes)

## Step 4: Configure Deployment Settings (Optional)

### Custom Domain

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions

### Build Settings

The `vercel.json` in the root is already configured for your monorepo:

```json
{
  "buildCommand": "cd packages/nextjs && yarn build",
  "outputDirectory": "packages/nextjs/.next",
  "installCommand": "yarn install",
  "framework": "nextjs",
  "rootDirectory": "packages/nextjs"
}
```

### Environment Variables

1. Go to **Settings** → **Environment Variables**
2. Add variables for:
   - **Production**: Used in production deployments
   - **Preview**: Used in preview deployments
   - **Development**: Used in local development

Example variables:
```
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
```

## Troubleshooting

### Build Fails

1. **Check Build Logs**
   - Go to deployment → **"View Function Logs"**
   - Look for error messages

2. **Common Issues**:
   - **Missing dependencies**: Ensure `yarn install` runs correctly
   - **Type errors**: Fix TypeScript errors before pushing
   - **Environment variables**: Make sure all required vars are set

3. **Ignore Build Errors** (for testing):
   ```bash
   # Use the yolo command (not recommended for production)
   yarn vercel:yolo
   ```

### Monorepo Issues

If builds fail due to monorepo structure:
- Ensure `rootDirectory` is set to `packages/nextjs` in Vercel dashboard
- Check that `vercel.json` is in the root directory
- Verify build commands are correct

### Deployment Not Triggering

1. **Check GitHub Integration**
   - Go to **Settings** → **Git**
   - Verify repository is connected
   - Check if webhooks are set up correctly

2. **Check Branch Settings**
   - Go to **Settings** → **Git**
   - Verify production branch is set correctly

## Quick Commands

```bash
# Deploy manually (production)
cd packages/nextjs
yarn vercel --prod

# Deploy preview
yarn vercel

# Check deployment status
# Visit: https://vercel.com/dashboard
```

## Workflow Summary

```
┌─────────────────┐
│  Make Changes   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  git commit      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  git push        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Vercel Webhook │
│  (Automatic)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Build & Deploy │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Live Site! 🚀  │
└─────────────────┘
```

## Next Steps

1. ✅ Connect repository to Vercel
2. ✅ Configure environment variables
3. ✅ Test with a small change
4. ✅ Set up custom domain (optional)
5. ✅ Configure branch protection (optional)

---

**Need Help?**
- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
