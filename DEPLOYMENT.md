# SpotSync Deployment Guide

## Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- Vercel account (https://vercel.com)
- GitHub repository connected to Vercel

## Environment Variables Setup

Before deploying, you need to configure the following environment variables in your Vercel dashboard:

### Database
- `DATABASE_URL` - Your database connection string (PostgreSQL recommended)

### Authentication
- `AUTH_SECRET` - A secure random string for authentication
- `AUTH_URL` - Your application URL (https://yourdomain.com for production)

### Spotify Integration
- `SPOTIFY_CLIENT_ID` - Spotify API Client ID
- `SPOTIFY_CLIENT_SECRET` - Spotify API Client Secret
- `NEXT_PUBLIC_SPOTIFY_REDIRECT_URI` - OAuth callback URL

### Payment Gateway (Razorpay)
- `RAZORPAY_KEY_ID` - Razorpay Key ID
- `RAZORPAY_KEY_SECRET` - Razorpay Key Secret
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` - Public Razorpay Key

### Google Maps
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps API Key

### Application URLs
- `NEXT_PUBLIC_API_URL` - API endpoint URL
- `NEXT_PUBLIC_APP_URL` - Application URL

## Local Development

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Access the app at http://localhost:4000

### Build
```bash
npm run build
```

### Type Checking
```bash
npm run typecheck
```

### Production Preview
```bash
npm run preview
```

## Deployment Options

### Option 1: GitHub Integration (Recommended)
1. Push your code to GitHub
2. Go to https://vercel.com/new
3. Select your repository
4. Add environment variables
5. Click "Deploy"

### Option 2: Vercel CLI
```bash
# Install Vercel CLI globally
npm i -g vercel

# Deploy
vercel --prod

# With environment variables
vercel env pull .env.local
vercel --prod
```

### Option 3: Git Push
1. Connect your GitHub repo to Vercel
2. Push to your main branch
3. Vercel automatically deploys

## Build and Deployment Process

1. **Build Phase**
   - Runs: `npm run build`
   - Output: `dist/` directory
   - Duration: ~2-5 minutes depending on dependencies

2. **Deployment Phase**
   - Vercel serves files from `dist/`
   - Environment variables are injected
   - SSL certificate is automatic

## Monitoring and Debugging

### View Logs
- Vercel Dashboard → Your Project → Deployments → View Logs

### Common Issues

#### 1. Build Failures
- Check Node version matches requirements (>=18.0.0)
- Verify all environment variables are set
- Run `npm ci` instead of `npm install` for consistent builds

#### 2. Runtime Errors
- Check application logs in Vercel dashboard
- Ensure database connection string is correct
- Verify API endpoints are accessible

#### 3. Dependency Issues
- Clear cache: `npm cache clean --force`
- Remove lock file and reinstall: `rm package-lock.json && npm install`
- Check `.npmrc` for correct settings

## Performance Optimization

1. **Image Optimization**
   - Use Next Image component when possible
   - Compress images before uploading

2. **Code Splitting**
   - React Router automatically code-splits routes

3. **Caching**
   - Static assets are cached via Vercel's CDN
   - Set appropriate cache headers in `vercel.json`

## Security Considerations

1. Never commit `.env` or `.env.local` files
2. Use `.env.example` as a template
3. Rotate secrets regularly
4. Enable Vercel's edge protection
5. Keep dependencies updated

## Support and Resources

- Vercel Documentation: https://vercel.com/docs
- React Router Documentation: https://reactrouter.com
- Hono Framework: https://hono.dev
- Troubleshooting: Check Vercel dashboard logs

## Redeployment

To redeploy:
1. Make changes to your code
2. Commit and push to main branch
3. Vercel automatically rebuilds and deploys
4. Or manually trigger: Vercel Dashboard → Redeploy

## Rolling Back

To rollback to a previous deployment:
1. Go to Vercel Dashboard
2. Select your project
3. Go to Deployments
4. Click on a previous deployment
5. Click "Promote to Production"
