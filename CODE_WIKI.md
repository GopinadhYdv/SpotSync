# SpotSync Code Wiki

## 1) What This Repo Is

SpotSync is an event discovery + ticketing web app built on:

- React Router (SSR enabled)
- Vite (dev/build)
- Hono (Node server adapter via `react-router-hono-server`)
- Postgres (Neon in production, `pg` used by some API modules)
- Clerk (authentication)
- Razorpay (payments)
- Ably (optional realtime seat-lock sync; falls back to `BroadcastChannel`)

The main application lives under [web](file:///c:/SpotSync/SpotSync/SpotSync/web).

## 2) High-Level Architecture

### Runtime Pieces

- **SSR Web App**: React Router renders pages on the server and hydrates on the client.
- **Node Server**: A Hono app is created and then wrapped by React Router’s Hono server adapter.
- **API Layer**: API endpoints are implemented as file-based route modules under `src/app/api/**/route.js` and mounted into Hono under `/api`.
- **Database**: Postgres schema lives in [schema.sql](file:///c:/SpotSync/SpotSync/SpotSync/web/database/schema.sql). Server code queries via:
  - Neon serverless pool in the Hono server entry ([__create/index.ts](file:///c:/SpotSync/SpotSync/SpotSync/web/__create/index.ts))
  - `pg.Pool` in some API utilities ([sql.js](file:///c:/SpotSync/SpotSync/SpotSync/web/src/app/api/utils/sql.js))

### Request Flow (Dev + Prod Conceptually)

1. Browser requests a page (e.g. `/events`).
2. React Router SSR pipeline runs `root.tsx` loader and route loaders/actions.
3. The Hono server adapter handles routing:
   - `/api/**` requests are routed to Hono routes generated from `src/app/api/**/route.js`.
   - other requests are handled by React Router server rendering.
4. Clerk middleware attaches auth context to the request.
5. Client receives HTML + JS, hydrates, then uses fetch to call `/api/**` endpoints.

## 3) Repository Layout (Key Directories)

Within [web](file:///c:/SpotSync/SpotSync/SpotSync/web):

- **src/app/**: React Router app directory (pages + API route modules)
  - `page.jsx` files implement pages.
  - `layout.jsx` files implement hierarchical layouts (wrapped via a Vite plugin).
  - `root.tsx` defines app shell, SSR loader, and middleware.
  - `routes.ts` declares the route table for React Router.
- **src/components/**: shared UI components (Navbar, SeatMap, PaymentModal, etc.)
- **src/utils/**: client utilities and hooks (auth wrappers, Razorpay, Ably, stores)
- **src/app/api/**: server endpoints (file-based API routes)
- **__create/**: server and tooling glue used by the development server and production server build
- **plugins/**: custom Vite plugins (layouts, aliases, render-id injection, env shims, restarts)
- **api/**: legacy / alternate serverless-style endpoints (not used by React Router routes.ts)
- **database/**: SQL schema

## 4) Major Modules and Responsibilities

### 4.1 App Entry: `src/app/root.tsx`

File: [root.tsx](file:///c:/SpotSync/SpotSync/SpotSync/web/src/app/root.tsx)

- **Exports**
  - `middleware`: React Router v7 middleware array used on the server.
  - `loader`: wraps Clerk’s root auth loader.
  - `links`, `Layout`, default `App`: app shell + `<ClerkProvider>` + `<Outlet>`.
- **Key Responsibilities**
  - Set up SSR-safe font loading and Vite development heartbeat logic.
  - Provide global HTML layout, `<Scripts/>`, `<ScrollRestoration/>`.
  - Provide Clerk integration:
    - `rootAuthLoader(args)` populates `loaderData` for `ClerkProvider`.
    - `middleware = [clerkMiddleware()]` attaches Clerk auth to requests.

### 4.2 Routing Table: `src/app/routes.ts`

File: [routes.ts](file:///c:/SpotSync/SpotSync/SpotSync/web/src/app/routes.ts)

- Defines the route map using `@react-router/dev/routes`.
- Mixes **UI pages** (e.g. `/events`, `/news`) and **API routes** (e.g. `/api/events`).
- API routes point to `src/app/api/**/route.js` modules.

### 4.3 Node Server Entry: `__create/index.ts`

File: [index.ts](file:///c:/SpotSync/SpotSync/SpotSync/web/__create/index.ts)

- Creates a Hono app and configures:
  - request IDs and async-local trace IDs
  - error handling (JSON for non-GET, HTML error page for GET)
  - optional CORS via `CORS_ORIGINS`
  - body size limits for write methods
  - proxying `/integrations/*` to Create.xyz based on env
  - Razorpay routes:
    - `POST /api/razorpay/create-order`
    - `POST /api/razorpay/verify-payment`
  - Booking confirmation route:
    - `POST /api/bookings/confirm`
  - Mounts generated API routes under `/api` (see `route-builder.ts`)
- Wraps the Hono app using `createHonoServer(...)` from `react-router-hono-server/node`.

### 4.4 API Route Auto-Registration: `__create/route-builder.ts`

File: [route-builder.ts](file:///c:/SpotSync/SpotSync/SpotSync/web/__create/route-builder.ts)

- Uses `import.meta.glob('../src/app/api/**/route.js', { eager: true })` to find API route modules.
- Converts file paths into Hono route patterns, including:
  - `[id]` -> `:id`
  - `[...path]` -> `:path{.+}`
- Registers HTTP method exports from each module (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) onto a Hono router.

### 4.5 Server-Side SQL Utility: `src/app/api/utils/sql.js`

File: [sql.js](file:///c:/SpotSync/SpotSync/SpotSync/web/src/app/api/utils/sql.js)

- Lazy-creates a `pg.Pool` using `process.env.DATABASE_URL`.
- Exposes a template-tag style `sql\`SELECT ...\`` function.
- Includes `sql.transaction(async tx => ...)` helper.

### 4.6 Payments: Razorpay (Client + Server)

- **Server routes**: [__create/index.ts](file:///c:/SpotSync/SpotSync/SpotSync/web/__create/index.ts)
  - order creation
  - signature verification
  - booking confirmation
- **Client hook**: [useRazorpay.js](file:///c:/SpotSync/SpotSync/SpotSync/web/src/utils/useRazorpay.js)
  - loads Razorpay script
  - creates server order
  - opens checkout
  - verifies payment server-side

### 4.7 Realtime Seat Sync: Ably + Local Fallback

File: [ably.ts](file:///c:/SpotSync/SpotSync/SpotSync/web/src/utils/ably.ts)

- If `NEXT_PUBLIC_ABLY_API_KEY` is set, uses Ably Realtime channels.
- Otherwise falls back to a `BroadcastChannel`-based local channel implementation.
- Primary accessor: `getEventChannel(eventId)` → used by UI to sync seat locks.

### 4.8 Admin Data Store (Client-Side)

File: [adminStore.js](file:///c:/SpotSync/SpotSync/SpotSync/web/src/utils/adminStore.js)

- Stores “admin mode” events and ratings in `localStorage`.
- Seeds defaults from [data.js](file:///c:/SpotSync/SpotSync/SpotSync/web/src/utils/data.js).
- Provides helpers like `getStoredEvents()`, `saveEvents()`, `subscribeToEvents()`.

## 5) Build / Dev Tooling

### 5.1 Vite Config

File: [vite.config.ts](file:///c:/SpotSync/SpotSync/SpotSync/web/vite.config.ts)

- Uses `reactRouter()` and `reactRouterHonoServer(...)` to run React Router SSR with a Hono server.
- Dev server runs on port `4000`.
- `envPrefix: ['NEXT_PUBLIC_', 'VITE_']` to expose client env vars.
- Aliases:
  - `@` → `src/`
  - `stripe` → local shim under `src/__create/stripe`
  - plus several compatibility aliases.

### 5.2 Custom Vite Plugins

- **Hierarchical layouts**: [layouts.ts](file:///c:/SpotSync/SpotSync/SpotSync/web/plugins/layouts.ts)
  - Wraps `page.jsx` modules with parent `layout.jsx` components found while walking up directories.
  - Supports route param injection for `[id]` and `[...slug]` patterns.
- **Alias resolver**: [aliases.ts](file:///c:/SpotSync/SpotSync/SpotSync/web/plugins/aliases.ts)
  - Ensures `@/...` resolves to the correct file extension.
- **NEXT_PUBLIC process.env shim**: [nextPublicProcessEnv.ts](file:///c:/SpotSync/SpotSync/SpotSync/web/plugins/nextPublicProcessEnv.ts)
  - Provides `process.env.NEXT_PUBLIC_*` in the browser without leaking other env keys.
- **Dev restart watcher**: [restart.ts](file:///c:/SpotSync/SpotSync/SpotSync/web/plugins/restart.ts)
  - Restarts the dev server when key route files change.
- **Console forwarding (dev)**: [console-to-parent.ts](file:///c:/SpotSync/SpotSync/SpotSync/web/plugins/console-to-parent.ts)
  - Forwards console logs to a parent window (useful for embedded previews).

## 6) Auth (Clerk)

- Client components and hooks use `@clerk/react-router` (e.g. sign-in page).
- Server integration uses:
  - `rootAuthLoader` from `@clerk/react-router/ssr.server`
  - `clerkMiddleware` from `@clerk/react-router/server`

Relevant entrypoint: [root.tsx](file:///c:/SpotSync/SpotSync/SpotSync/web/src/app/root.tsx)

## 7) Dependency Relationships (Practical View)

- `vite.config.ts`
  - depends on `plugins/*`
  - depends on `__create/index.ts` via `reactRouterHonoServer({ serverEntryPoint })`
- `__create/index.ts`
  - depends on `__create/route-builder.ts` to mount API routes
  - depends on Neon + Hono + React Router server adapter
- `src/app/root.tsx`
  - depends on Clerk SSR + server entrypoints
  - defines middleware/loader used by the server runtime
- `src/app/routes.ts`
  - ties URLs to page modules and API route modules
- `src/app/api/**/route.js`
  - often depends on `src/app/api/utils/sql.js`
- `src/utils/*`
  - consumed by page components and shared UI

## 8) How To Run

Primary instructions are in [README.md](file:///c:/SpotSync/SpotSync/SpotSync/web/README.md).

### Local Development

1. Install Node.js `18+` and npm `9+`.
2. From [web](file:///c:/SpotSync/SpotSync/SpotSync/web):

```bash
npm install
cp .env.example .env.local
```

3. Apply database schema: [database/schema.sql](file:///c:/SpotSync/SpotSync/SpotSync/web/database/schema.sql)
4. Run:

```bash
npm run dev
```

App defaults to `http://localhost:4000`.

### Typecheck / Build / Start

```bash
npm run typecheck
npm run build
npm start
```

### Environment Variables

See [DEPLOYMENT.md](file:///c:/SpotSync/SpotSync/SpotSync/web/DEPLOYMENT.md) and [.env.example](file:///c:/SpotSync/SpotSync/SpotSync/web/.env.example).

## 9) Troubleshooting

### Vite SSR error: “does not provide an export named clerkMiddleware”

Cause: importing `clerkMiddleware` from `@clerk/react-router/ssr.server`, which exports `rootAuthLoader` but not `clerkMiddleware`.

Fix: import `clerkMiddleware` from `@clerk/react-router/server` and keep `rootAuthLoader` from `@clerk/react-router/ssr.server`.

