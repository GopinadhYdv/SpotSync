import { skipCSRFCheck } from '@auth/core';
import Credentials from '@auth/core/providers/credentials';
import Google from '@auth/core/providers/google';
import { hash, verify } from 'argon2';
import { getPool } from './db.js';
import NeonAdapter from './neon-adapter.js';

const pool = getPool();
const adapter = NeonAdapter(pool);

function getProviders() {
  const providers = [];

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    );
  }

  if (process.env.NEXT_PUBLIC_CREATE_ENV === 'DEVELOPMENT') {
    providers.push(
      Credentials({
        id: 'dev-social',
        name: 'Development Social Sign-in',
        credentials: {
          email: { label: 'Email', type: 'email' },
          name: { label: 'Name', type: 'text' },
          provider: { label: 'Provider', type: 'text' },
        },
        authorize: async (credentials) => {
          const { email, name, provider } = credentials ?? {};
          if (!email || typeof email !== 'string') return null;

          const existing = await adapter.getUserByEmail(email);
          if (existing) return existing;

          const allowedProviders = new Set(['google', 'facebook', 'twitter', 'apple']);
          const providerName =
            typeof provider === 'string' && allowedProviders.has(provider.toLowerCase())
              ? provider.toLowerCase()
              : 'google';

          const user = await adapter.createUser({
            email,
            emailVerified: null,
            name: typeof name === 'string' && name.length > 0 ? name : undefined,
          });

          await adapter.linkAccount({
            type: 'oauth',
            userId: user.id,
            provider: providerName,
            providerAccountId: `dev-${user.id}`,
          });

          return user;
        },
      })
    );
  }

  providers.push(
    Credentials({
      id: 'credentials-signin',
      name: 'Credentials Sign in',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const { email, password } = credentials ?? {};
        if (typeof email !== 'string' || typeof password !== 'string') return null;

        const user = await adapter.getUserByEmail(email);
        if (!user) return null;

        const account = user.accounts.find((entry) => entry.provider === 'credentials');
        if (!account?.password) return null;

        const isValid = await verify(account.password, password);
        return isValid ? user : null;
      },
    })
  );

  providers.push(
    Credentials({
      id: 'credentials-signup',
      name: 'Credentials Sign up',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        name: { label: 'Name', type: 'text' },
        image: { label: 'Image', type: 'text', required: false },
      },
      authorize: async (credentials) => {
        const { email, password, name, image } = credentials ?? {};
        if (typeof email !== 'string' || typeof password !== 'string') return null;

        const existing = await adapter.getUserByEmail(email);
        if (existing) return null;

        const user = await adapter.createUser({
          email,
          emailVerified: null,
          name: typeof name === 'string' && name.length > 0 ? name : undefined,
          image: typeof image === 'string' && image.length > 0 ? image : undefined,
        });

        await adapter.linkAccount({
          extraData: {
            password: await hash(password),
          },
          type: 'credentials',
          userId: user.id,
          providerAccountId: user.id,
          provider: 'credentials',
        });

        return user;
      },
    })
  );

  return providers;
}

export function createAuthConfig() {
  return {
    adapter,
    basePath: '/api/auth',
    trustHost: true,
    secret: process.env.AUTH_SECRET,
    pages: {
      signIn: '/account/signin',
    },
    skipCSRFCheck,
    session: {
      strategy: 'jwt',
    },
    callbacks: {
      session({ session, token }) {
        if (token?.sub) {
          session.user.id = token.sub;
        }
        return session;
      },
    },
    providers: getProviders(),
  };
}
