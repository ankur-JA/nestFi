# NestFi Documentation Site

Coming soon page for NestFi documentation at docs.nestfi.io.

## Getting Started

### Install Dependencies

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the page.

### Build

```bash
pnpm build
```

### Start Production Server

```bash
pnpm start
```

## Deployment to Vercel

### Option 1: Deploy as Separate Project (Recommended)

1. Push the `docs-site` directory to a separate GitHub repository
2. Import the project in Vercel
3. Vercel will automatically detect Next.js and configure it
4. Add custom domain `docs.nestfi.io` in Vercel project settings

### Option 2: Deploy from Monorepo

If deploying from the main repository:

1. In Vercel project settings, set:
   - **Root Directory**: `docs-site`
   - **Build Command**: `pnpm install && pnpm build`
   - **Output Directory**: `.next`
   - **Install Command**: `pnpm install`

2. Add custom domain `docs.nestfi.io`

## Features

- ✅ NestFi theme matching main site
- ✅ Dark/Light mode toggle
- ✅ Responsive design
- ✅ Contact information and social links
- ✅ Smooth animations with Framer Motion
