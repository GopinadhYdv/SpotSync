import { Auth } from '@auth/core';
import { createAuthConfig } from '../../../../../api/_lib/auth-config.js';
import { normalizeAuthUrl } from '../../../../../api/_lib/env.js';

function resolveAuthUrl(request) {
  const origin = new URL(request.url).origin;
  return normalizeAuthUrl(process.env.AUTH_URL, origin);
}

async function handleAuth(request) {
  try {
    process.env.AUTH_URL = resolveAuthUrl(request);
    return await Auth(request, createAuthConfig());
  } catch (error) {
    console.error('Auth route error:', error);
    return new Response(JSON.stringify({ error: 'Authentication failed' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function GET(request) {
  return handleAuth(request);
}

export async function POST(request) {
  return handleAuth(request);
}
