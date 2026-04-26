import { Auth } from '@auth/core';
import { createAuthConfig } from '../_lib/auth-config.js';
import {
  getRequestOrigin,
  normalizeAuthUrl,
  sendWebResponse,
  toWebRequest,
} from '../_lib/env.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  try {
    process.env.AUTH_URL = normalizeAuthUrl(process.env.AUTH_URL, getRequestOrigin(req));
    const request = await toWebRequest(req);
    const response = await Auth(request, createAuthConfig());
    await sendWebResponse(res, response);
  } catch (error) {
    console.error('Auth route error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}
