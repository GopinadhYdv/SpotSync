import { getToken } from '@auth/core/jwt';
import { getSecureCookieFlag, toWebRequest } from '../_lib/env.js';

export default async function handler(req, res) {
  try {
    const request = await toWebRequest(req);
    const secureCookie = getSecureCookieFlag(req);

    const [rawToken, jwt] = await Promise.all([
      getToken({
        req: request,
        secret: process.env.AUTH_SECRET,
        secureCookie,
        raw: true,
      }),
      getToken({
        req: request,
        secret: process.env.AUTH_SECRET,
        secureCookie,
      }),
    ]);

    if (!jwt) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    res.status(200).json({
      jwt: rawToken,
      user: {
        id: jwt.sub,
        email: jwt.email,
        name: jwt.name,
      },
    });
  } catch (error) {
    console.error('Token route error:', error);
    res.status(500).json({ error: 'Failed to read token' });
  }
}
