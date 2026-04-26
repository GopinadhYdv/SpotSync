import { Auth } from '@auth/core';
import { normalizeAuthUrl } from '../../../../../api/_lib/env.js';

function resolveAuthUrl(request) {
  const origin = new URL(request.url).origin;
  return normalizeAuthUrl(process.env.AUTH_URL, origin);
}

async function handleAuth(request) {
  try {
    // Dynamically import to avoid initialization errors
    const { createAuthConfig } = await import('../../../../../api/_lib/auth-config.js');
    
    process.env.AUTH_URL = resolveAuthUrl(request);
    const config = createAuthConfig();
    
    if (!config.secret) {
      console.error('AUTH_SECRET not configured');
      return new Response(
        JSON.stringify({ message: 'Server configuration error: AUTH_SECRET not set' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return await Auth(request, config);
  } catch (error) {
    console.error('Auth route error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        message: 'Authentication server error',
        detail: message 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

export async function GET(request) {
  return handleAuth(request);
}

export async function POST(request) {
  return handleAuth(request);
}
