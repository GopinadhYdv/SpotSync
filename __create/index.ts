import { AsyncLocalStorage } from 'node:async_hooks';
import nodeConsole from 'node:console';
import crypto from 'node:crypto';
import { skipCSRFCheck } from '@auth/core';
import Credentials from '@auth/core/providers/credentials';
import Google from '@auth/core/providers/google';
import { authHandler, initAuthConfig } from '@hono/auth-js';
import Razorpay from 'razorpay';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { hash, verify } from 'argon2';
import { Hono } from 'hono';
import { contextStorage, getContext } from 'hono/context-storage';
import { cors } from 'hono/cors';
import { proxy } from 'hono/proxy';
import { bodyLimit } from 'hono/body-limit';
import { requestId } from 'hono/request-id';
import { createHonoServer } from 'react-router-hono-server/node';
import { serializeError } from 'serialize-error';
import ws from 'ws';
import NeonAdapter from './adapter';
import { getHTMLForErrorPage } from './get-html-for-error-page';
import { isAuthAction } from './is-auth-action';
import { API_BASENAME, api } from './route-builder';
neonConfig.webSocketConstructor = ws;

const als = new AsyncLocalStorage<{ requestId: string }>();
const AUTH_BASE_PATH = '/api/auth';

function normalizeAuthUrl(value?: string | null, fallbackOrigin?: string) {
  const raw = value?.trim();
  const base = raw || fallbackOrigin;
  if (!base) return undefined;

  const url = new URL(base);
  const pathname = url.pathname === '/' ? AUTH_BASE_PATH : url.pathname.replace(/\/$/, '');
  url.pathname = pathname.endsWith(AUTH_BASE_PATH) ? pathname : `${pathname}${AUTH_BASE_PATH}`;
  url.search = '';
  url.hash = '';
  return url.toString().replace(/\/$/, '');
}

for (const method of ['log', 'info', 'warn', 'error', 'debug'] as const) {
  const original = nodeConsole[method].bind(console);

  console[method] = (...args: unknown[]) => {
    const requestId = als.getStore()?.requestId;
    if (requestId) {
      original(`[traceId:${requestId}]`, ...args);
    } else {
      original(...args);
    }
  };
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = NeonAdapter(pool);

const app = new Hono();

app.use('*', requestId());

app.use('*', (c, next) => {
  const requestId = c.get('requestId');
  return als.run({ requestId }, () => next());
});

app.use(contextStorage());

app.onError((err, c) => {
  if (c.req.method !== 'GET') {
    return c.json(
      {
        error: 'An error occurred in your app',
        details: serializeError(err),
      },
      500
    );
  }
  return c.html(getHTMLForErrorPage(err), 200);
});

if (process.env.CORS_ORIGINS) {
  app.use(
    '*',
    cors({
      origin: process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()),
    })
  );
}
for (const method of ['post', 'put', 'patch'] as const) {
  app[method](
    '*',
    bodyLimit({
      maxSize: 4.5 * 1024 * 1024, // 4.5mb to match vercel limit
      onError: (c) => {
        return c.json({ error: 'Body size limit exceeded' }, 413);
      },
    })
  );
}

if (process.env.AUTH_SECRET) {
  app.use(
    '*',
    initAuthConfig((c) => ({
      secret: c.env.AUTH_SECRET,
      basePath: AUTH_BASE_PATH,
      trustHost: true,
      pages: {
        signIn: '/account/signin',
      },
      skipCSRFCheck,
      session: {
        strategy: 'jwt',
      },
      callbacks: {
        session({ session, token }) {
          if (token.sub) {
            session.user.id = token.sub;
          }
          return session;
        },
      },

      providers: [
        Google({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        // Dev-only provider for simulated social sign-in (Google, Facebook, etc.)
        // Creates or finds a user by email without requiring a password.
        ...(process.env.NEXT_PUBLIC_CREATE_ENV === 'DEVELOPMENT'
          ? [
              Credentials({
                id: 'dev-social',
                name: 'Development Social Sign-in',
                credentials: {
                  email: { label: 'Email', type: 'email' },
                  name: { label: 'Name', type: 'text' },
                  provider: { label: 'Provider', type: 'text' },
                },
                authorize: async (credentials) => {
                  const { email, name, provider } = credentials;
                  if (!email || typeof email !== 'string') return null;

                  const existing = await adapter.getUserByEmail(email);
                  if (existing) return existing;

                  const allowedProviders = new Set(['google', 'facebook', 'twitter', 'apple']);
                  const providerName =
                    typeof provider === 'string' && allowedProviders.has(provider.toLowerCase())
                      ? provider.toLowerCase()
                      : 'google';
                  const newUser = await adapter.createUser({
                    emailVerified: null,
                    email,
                    name:
                      typeof name === 'string' && name.length > 0
                        ? name
                        : undefined,
                  });
                  await adapter.linkAccount({
                    type: 'oauth',
                    userId: newUser.id,
                    provider: providerName,
                    providerAccountId: `dev-${newUser.id}`,
                  });
                  return newUser;
                },
              }),
            ]
          : []),
        Credentials({
          id: 'credentials-signin',
          name: 'Credentials Sign in',
          credentials: {
            email: {
              label: 'Email',
              type: 'email',
            },
            password: {
              label: 'Password',
              type: 'password',
            },
          },
          authorize: async (credentials) => {
            const { email, password } = credentials;
            if (!email || !password) {
              return null;
            }
            if (typeof email !== 'string' || typeof password !== 'string') {
              return null;
            }

            // logic to verify if user exists
            const user = await adapter.getUserByEmail(email);
            if (!user) {
              return null;
            }
            const matchingAccount = user.accounts.find(
              (account) => account.provider === 'credentials'
            );
            const accountPassword = matchingAccount?.password;
            if (!accountPassword) {
              return null;
            }

            const isValid = await verify(accountPassword, password);
            if (!isValid) {
              return null;
            }

            // return user object with the their profile data
            return user;
          },
        }),
        Credentials({
          id: 'credentials-signup',
          name: 'Credentials Sign up',
          credentials: {
            email: {
              label: 'Email',
              type: 'email',
            },
            password: {
              label: 'Password',
              type: 'password',
            },
            name: { label: 'Name', type: 'text' },
            image: { label: 'Image', type: 'text', required: false },
          },
          authorize: async (credentials) => {
            const { email, password, name, image } = credentials;
            if (!email || !password) {
              return null;
            }
            if (typeof email !== 'string' || typeof password !== 'string') {
              return null;
            }

            // logic to verify if user exists
            const user = await adapter.getUserByEmail(email);
            if (!user) {
              const newUser = await adapter.createUser({
                emailVerified: null,
                email,
                name: typeof name === 'string' && name.length > 0 ? name : undefined,
                image: typeof image === 'string' && image.length > 0 ? image : undefined,
              });
              await adapter.linkAccount({
                extraData: {
                  password: await hash(password),
                },
                type: 'credentials',
                userId: newUser.id,
                providerAccountId: newUser.id,
                provider: 'credentials',
              });
              return newUser;
            }
            return null;
          },
        }),
      ],
    }))
  );
}
app.all('/integrations/:path{.+}', async (c, next) => {
  const queryParams = c.req.query();
  const url = `${process.env.NEXT_PUBLIC_CREATE_BASE_URL ?? 'https://www.create.xyz'}/integrations/${c.req.param('path')}${Object.keys(queryParams).length > 0 ? `?${new URLSearchParams(queryParams).toString()}` : ''}`;

  return proxy(url, {
    method: c.req.method,
    body: c.req.raw.body ?? null,
    // @ts-expect-error -- duplex is accepted by the runtime even though the
    // type declarations don't include it; required for streaming integrations
    duplex: 'half',
    redirect: 'manual',
    headers: {
      ...c.req.header(),
      'X-Forwarded-For': process.env.NEXT_PUBLIC_CREATE_HOST,
      'x-createxyz-host': process.env.NEXT_PUBLIC_CREATE_HOST,
      Host: process.env.NEXT_PUBLIC_CREATE_HOST,
      'x-createxyz-project-group-id': process.env.NEXT_PUBLIC_PROJECT_GROUP_ID,
    },
  });
});

app.use('/api/auth/*', async (c, next) => {
  const runtimeEnv = c.env ?? process.env;
  runtimeEnv.AUTH_URL = normalizeAuthUrl(runtimeEnv.AUTH_URL, new URL(c.req.url).origin);

  if (isAuthAction(c.req.path)) {
    return authHandler()(c, next);
  }
  return next();
});
const getRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

app.post('/api/razorpay/create-order', async (c) => {
  try {
    const razorpay = getRazorpayClient();
    if (!razorpay) {
      return c.json({ error: 'Razorpay is not configured' }, 503);
    }

    const { amount, currency = 'INR', receipt } = await c.req.json();
    const options = {
      amount: amount * 100, // amount in the smallest currency unit
      currency,
      receipt,
    };
    const order = await razorpay.orders.create(options);
    return c.json(order);
  } catch (error) {
    console.error('Razorpay Create Order Error:', error);
    return c.json({ error: 'Failed to create order' }, 500);
  }
});

app.post('/api/razorpay/verify-payment', async (c) => {
  try {
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return c.json({ error: 'Razorpay is not configured' }, 503);
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await c.req.json();
    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature === razorpay_signature) {
      return c.json({ status: 'success' });
    } else {
      return c.json({ status: 'failure', message: 'Invalid signature' }, 400);
    }
  } catch (error) {
    console.error('Razorpay Verify Payment Error:', error);
    return c.json({ error: 'Verification failed' }, 500);
  }
});

app.post('/api/bookings/confirm', async (c) => {
  try {
    const { 
      ticketId, eventId, userId, userName, userEmail, 
      ticketCount, totalAmount, paymentId, orderId, seats 
    } = await c.req.json();

    // 1. Create booking
    const bookingSql = `
      INSERT INTO bookings (id, event_id, user_id, user_name, user_email, ticket_count, total_amount, payment_id, order_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'confirmed')
      RETURNING id
    `;
    const bookingResult = await pool.query(bookingSql, [
      ticketId, eventId, userId, userName, userEmail, 
      ticketCount, totalAmount, paymentId, orderId
    ]);
    const bookingId = bookingResult.rows[0].id;

    // 2. Insert seats
    if (seats && Array.isArray(seats)) {
      for (const seat of seats) {
        const seatSql = `
          INSERT INTO seats (event_id, booking_id, seat_identifier, section_id, row_label, col_index)
          VALUES ($1, $2, $3, $4, $5, $6)
        `;
        const parts = seat.split('-');
        const sectionId = parts[0];
        const seatPos = parts[1];
        const rowLabel = seatPos?.charAt(0) || '';
        const colIndex = parseInt(seatPos?.substring(1) || '0');
        await pool.query(seatSql, [eventId, bookingId, seat, sectionId, rowLabel, colIndex]);
      }
    }
    return c.json({ status: 'success', bookingId });
  } catch (error) {
    console.error('Booking Confirmation Error:', error);
    return c.json({ error: 'Failed to confirm booking' }, 500);
  }
});

app.route(API_BASENAME, api);

export default createHonoServer({
  app,
  defaultLogger: false,
});
