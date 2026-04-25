# Ease Events Vercel Deployment Guide

This guide matches the current repository state:

- `npm run typecheck` passes
- `npm run build` passes
- `npm start` serves the production build locally on `http://localhost:3000`

## 1. Prerequisites

- Vercel account
- GitHub repository connected to Vercel
- Node.js `18+`
- npm `9+`
- A working PostgreSQL connection string
- Google OAuth credentials if Google sign-in will be enabled
- Razorpay credentials if live payments will be enabled

## 2. Required environment variables

Create the variables from [.env.example](./.env.example) in Vercel for `Production`, `Preview`, and `Development` as needed.

### Core

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_URL`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_APP_URL`
- `CORS_ORIGINS`

### Google auth

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

### Razorpay

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`

### Maps

- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

### Optional Create.xyz variables

- `NEXT_PUBLIC_CREATE_ENV`
- `NEXT_PUBLIC_CREATE_BASE_URL`
- `NEXT_PUBLIC_CREATE_API_BASE_URL`
- `NEXT_PUBLIC_CREATE_HOST`
- `NEXT_PUBLIC_PROJECT_GROUP_ID`

## 3. Recommended production values

- `AUTH_URL=https://your-domain.com/api/auth`
- `NEXT_PUBLIC_APP_URL=https://your-domain.com`
- `NEXT_PUBLIC_API_URL=https://your-domain.com`
- `CORS_ORIGINS=https://your-domain.com`
- `NEXT_PUBLIC_CREATE_ENV=PRODUCTION`

For preview deployments, use the preview URL for `AUTH_URL`, `NEXT_PUBLIC_APP_URL`, and `NEXT_PUBLIC_API_URL`, or use your stable custom preview domain if you have one.

## 4. Verify locally before deploying

```bash
npm install
npm run typecheck
npm run build
npm start
```

Expected result:

- the build is created under `build/`
- the production server starts on port `3000`

## 5. Deploy with the Vercel dashboard

1. Push the current branch to GitHub.
2. In Vercel, click `Add New...` -> `Project`.
3. Import the repository.
4. Keep the project root pointed at this app directory.
5. Add the environment variables from `.env.example`.
6. Leave the framework build settings on auto-detect unless you have a specific reason to override them.
7. Deploy.

## 6. Deploy with the Vercel CLI

```bash
npm i -g vercel
vercel link
vercel env pull .env.local
vercel
vercel --prod
```

Use `vercel` for a preview deployment and `vercel --prod` for a production deployment.

## 7. Google OAuth checklist

In Google Cloud Console, configure:

- Authorized JavaScript origin: `https://your-domain.com`
- Authorized redirect URI: `https://your-domain.com/api/auth/callback/google`

If you use preview deployments for OAuth testing, add the matching preview domain values there too.

## 8. Razorpay checklist

- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are server-side keys
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` is the public key exposed to the client
- If Razorpay keys are missing, the app will still boot, but payment endpoints return `503 Razorpay is not configured`

## 9. Post-deploy checks

After the first deployment, verify:

1. Home page loads.
2. `/events`, `/news`, and `/account/signin` load.
3. Google sign-in redirects to the correct callback URL.
4. API routes respond without `500` errors.
5. Payment flow only appears in environments where Razorpay keys are configured.

## 10. Common failure points

### Auth loop or callback failure

- `AUTH_URL` must include `/api/auth`
- Google OAuth redirect URI must exactly match the deployed domain

### Database errors

- `DATABASE_URL` is missing or invalid
- the database does not allow connections from Vercel

### Client calling the wrong backend URL

- `NEXT_PUBLIC_API_URL` should point to the deployed app origin for this repo

### CORS failures

- `CORS_ORIGINS` must include the deployed frontend origin
- multiple origins should be comma-separated

### Payments failing immediately

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`

All three must match the same Razorpay environment.

## 11. Current repo notes

- `vercel.json` now only keeps headers and region settings
- the broken `dist/` references have been removed
- build output is `build/`, which matches the actual React Router + Hono server output
