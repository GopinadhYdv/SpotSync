export const AUTH_BASE_PATH = '/api/auth';

function getSingleHeader(value) {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function getRequestOrigin(req) {
  const proto =
    getSingleHeader(req.headers['x-forwarded-proto']) ||
    getSingleHeader(req.headers['x-forwarded-protocol']) ||
    'http';
  const host =
    getSingleHeader(req.headers['x-forwarded-host']) ||
    getSingleHeader(req.headers.host);

  if (!host) {
    throw new Error('Unable to determine request host');
  }

  return `${proto}://${host}`;
}

export function normalizeAuthUrl(value, fallbackOrigin) {
  const raw = value?.trim();
  const shouldIgnoreRaw =
    raw != null &&
    (() => {
      try {
        const parsed = new URL(raw);
        return ['localhost', '127.0.0.1', '0.0.0.0'].includes(parsed.hostname);
      } catch {
        return false;
      }
    })();
  const base = !shouldIgnoreRaw && raw ? raw : fallbackOrigin;
  if (!base) return undefined;

  const url = new URL(base);
  const pathname = url.pathname === '/' ? AUTH_BASE_PATH : url.pathname.replace(/\/$/, '');
  url.pathname = pathname.endsWith(AUTH_BASE_PATH) ? pathname : `${pathname}${AUTH_BASE_PATH}`;
  url.search = '';
  url.hash = '';
  return url.toString().replace(/\/$/, '');
}

export async function readRawBody(req) {
  if (req.body && typeof req.body === 'string') {
    return Buffer.from(req.body);
  }

  if (req.body && Buffer.isBuffer(req.body)) {
    return req.body;
  }

  if (req.body && typeof req.body === 'object' && !(req.body instanceof Uint8Array)) {
    return Buffer.from(JSON.stringify(req.body));
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export async function toWebRequest(req) {
  const origin = getRequestOrigin(req);
  const url = new URL(req.url || '/', origin).toString();
  const method = (req.method || 'GET').toUpperCase();
  const headers = new Headers();

  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item);
    } else {
      headers.set(key, value);
    }
  }

  const init = { method, headers };
  if (method !== 'GET' && method !== 'HEAD') {
    const body = await readRawBody(req);
    init.body = body;
    init.duplex = 'half';
  }

  return new Request(url, init);
}

export async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return req.body;
  }

  const body = await readRawBody(req);
  if (!body.length) return {};
  return JSON.parse(body.toString('utf8'));
}

export function getSecureCookieFlag(req) {
  const forwardedProto = getSingleHeader(req.headers['x-forwarded-proto']);
  if (forwardedProto) return forwardedProto === 'https';

  const authUrl = process.env.AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || '';
  return authUrl.startsWith('https://');
}

function getSetCookieHeaders(webResponse) {
  if (typeof webResponse.headers.getSetCookie === 'function') {
    return webResponse.headers.getSetCookie();
  }

  const combined = webResponse.headers.get('set-cookie');
  return combined ? [combined] : [];
}

export async function sendWebResponse(res, webResponse) {
  res.statusCode = webResponse.status;

  webResponse.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') return;
    res.setHeader(key, value);
  });

  const setCookies = getSetCookieHeaders(webResponse);
  if (setCookies.length) {
    res.setHeader('set-cookie', setCookies);
  }

  const body = Buffer.from(await webResponse.arrayBuffer());
  res.end(body);
}
