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
      return res
        .status(401)
        .setHeader('Content-Type', 'text/html')
        .end(`
          <html>
            <body>
              <script>
                window.parent.postMessage({ type: 'AUTH_ERROR', error: 'Unauthorized' }, '*');
              </script>
            </body>
          </html>
        `);
    }

    const message = JSON.stringify({
      type: 'AUTH_SUCCESS',
      jwt: rawToken,
      user: {
        id: jwt.sub,
        email: jwt.email,
        name: jwt.name,
      },
    });

    res
      .status(200)
      .setHeader('Content-Type', 'text/html')
      .end(`
        <html>
          <body>
            <script>
              window.parent.postMessage(${message}, '*');
            </script>
          </body>
        </html>
      `);
  } catch (error) {
    console.error('Expo auth success route error:', error);
    res.status(500).send('Authentication failed');
  }
}
