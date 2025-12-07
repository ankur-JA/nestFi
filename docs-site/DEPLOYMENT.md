# Deployment Guide for docs.nestfi.io

This guide explains how to deploy the NestFi documentation coming soon page to `docs.nestfi.io`.

## Option 1: Vercel (Recommended)

### Step 1: Create a Repository

1. Create a new GitHub repository (e.g., `nestfi-docs`)
2. Push the `docs-site` directory to this repository

```bash
cd docs-site
git init
git add .
git commit -m "Initial commit: NestFi docs coming soon page"
git remote add origin https://github.com/your-username/nestfi-docs.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your `nestfi-docs` repository
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (or leave empty if the repo only contains docs-site)
   - **Build Command**: `pnpm build` (or `npm run build`)
   - **Output Directory**: `.next`
   - **Install Command**: `pnpm install` (or `npm install`)

5. Click "Deploy"

### Step 3: Configure Custom Domain

1. In your Vercel project dashboard, go to **Settings** → **Domains**
2. Add `docs.nestfi.io` as a custom domain
3. Vercel will provide DNS records to add:
   - Add a CNAME record: `docs` → `cname.vercel-dns.com`
   - Or add an A record if provided

4. Wait for DNS propagation (usually 5-30 minutes)
5. Vercel will automatically provision SSL certificates

## Option 2: Netlify

### Step 1: Create Repository (same as Vercel)

### Step 2: Deploy to Netlify

1. Go to [Netlify](https://netlify.com) and sign in
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repository
4. Configure build settings:
   - **Build command**: `pnpm build`
   - **Publish directory**: `.next`
   - **Base directory**: Leave empty

5. Click "Deploy site"

### Step 3: Configure Custom Domain

1. Go to **Site settings** → **Domain management**
2. Click "Add custom domain"
3. Enter `docs.nestfi.io`
4. Follow Netlify's DNS configuration instructions
5. SSL will be automatically provisioned

## Option 3: Cloudflare Pages

### Step 1: Create Repository (same as Vercel)

### Step 2: Deploy to Cloudflare Pages

1. Go to Cloudflare Dashboard → **Pages**
2. Click "Create a project" → "Connect to Git"
3. Select your repository
4. Configure build settings:
   - **Framework preset**: Next.js
   - **Build command**: `pnpm build`
   - **Build output directory**: `.next`

5. Click "Save and Deploy"

### Step 3: Configure Custom Domain

1. Go to your Pages project → **Custom domains**
2. Add `docs.nestfi.io`
3. Update DNS in Cloudflare:
   - Add a CNAME record: `docs` → `pages.dev` (or the provided subdomain)

## DNS Configuration

Regardless of hosting provider, you'll need to configure DNS:

### If using a subdomain (docs.nestfi.io):

Add a CNAME record:
```
Type: CNAME
Name: docs
Value: [provided by your hosting provider]
TTL: Auto or 3600
```

### Example DNS Records:

**Vercel:**
```
Type: CNAME
Name: docs
Value: cname.vercel-dns.com
```

**Netlify:**
```
Type: CNAME
Name: docs
Value: [your-site].netlify.app
```

**Cloudflare Pages:**
```
Type: CNAME
Name: docs
Value: [your-project].pages.dev
```

## Verification

After deployment:

1. Wait for DNS propagation (check with `dig docs.nestfi.io` or `nslookup docs.nestfi.io`)
2. Visit `https://docs.nestfi.io` in your browser
3. Verify:
   - ✅ Page loads correctly
   - ✅ Theme toggle works
   - ✅ Social links work
   - ✅ SSL certificate is valid (HTTPS)
   - ✅ Mobile responsive

## Troubleshooting

### DNS Issues

- **Problem**: Domain not resolving
- **Solution**: Wait 24-48 hours for DNS propagation, or check DNS records are correct

### Build Errors

- **Problem**: Build fails
- **Solution**: 
  - Check Node.js version (should be 18+)
  - Ensure all dependencies are in `package.json`
  - Check build logs in hosting provider dashboard

### SSL Certificate Issues

- **Problem**: HTTPS not working
- **Solution**: 
  - Most providers auto-provision SSL, wait 5-10 minutes
  - Verify DNS is correctly configured
  - Check hosting provider's SSL status page

## Maintenance

- The page will automatically update when you push to the main branch (if using Git integration)
- To update manually, trigger a new deployment from your hosting provider's dashboard
