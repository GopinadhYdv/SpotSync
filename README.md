# SpotSync

Event discovery and ticketing app built with React Router, Hono, Neon, and Razorpay.

## Local setup

1. Install dependencies with `npm install`
2. Copy `.env.example` to `.env.local`
3. Apply the SQL in `database/schema.sql` to your Postgres database
4. Start the dev server with `npm run dev`

The app runs on `http://localhost:4000` by default.

## Google Login Setup

- Set `AUTH_URL=http://localhost:4000/api/auth`
- In Google Cloud, add `http://localhost:4000/api/auth/callback/google` as an authorized redirect URI
- Add `http://localhost:4000` as an authorized JavaScript origin

## Useful scripts

- `npm run dev` starts local development
- `npm run build` creates a production build
- `npm run typecheck` runs route type generation and TypeScript checks
- `npm start` runs the built production server on `http://localhost:3000`
- `npm run preview` builds and then starts the production server locally

## Deployment

The Vercel deployment runbook lives in [DEPLOYMENT.md](./DEPLOYMENT.md).
