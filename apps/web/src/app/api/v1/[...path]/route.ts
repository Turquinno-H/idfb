import type { NextRequest } from 'next/server';

// Same-origin proxy in front of the NestJS API.
//
// The browser bundle talks to `/api/v1/...` on its own origin and this handler
// forwards the call to the backend. The target is read at request time, unlike
// NEXT_PUBLIC_API_URL which Next.js inlines into the client bundle at build
// time — so a prebuilt image can be pointed at any backend by changing an
// environment variable, and no CORS grant is ever required.

// Render's blueprint deploys the API as `<prefix>-api` next to the frontend's
// `<prefix>-web`. Deriving the sibling from the incoming Host keeps a
// deployment whose API_PROXY_TARGET was never set from falling back to the
// local development port, which on a hosted origin resolves to the visitor's
// own machine and fails every request.
function inferRenderSibling(host: string | null): string | null {
  if (host === null) {
    return null;
  }
  const match = /^(.+)-web\.onrender\.com$/.exec(host.split(':')[0]);
  return match === null ? null : `https://${match[1]}-api.onrender.com`;
}

function resolveApiTarget(request: NextRequest): string {
  const target =
    process.env.API_PROXY_TARGET ??
    inferRenderSibling(request.headers.get('host')) ??
    'http://localhost:3001';
  return target.replace(/\/+$/, '');
}

// Headers that describe a single transport hop and must not be relayed.
const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'content-encoding',
  'content-length',
  'host',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

function forwardHeaders(source: Headers): Headers {
  const headers = new Headers();
  source.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });
  return headers;
}

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  const { path } = await context.params;
  const target = `${resolveApiTarget(request)}/api/v1/${path
    .map((segment) => encodeURIComponent(segment))
    .join('/')}${request.nextUrl.search}`;

  const headers = forwardHeaders(request.headers);
  const clientIp = request.headers.get('x-forwarded-for');
  if (clientIp) {
    headers.set('x-forwarded-for', clientIp);
  }

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      redirect: 'manual',
      cache: 'no-store',
    });
  } catch {
    return Response.json(
      { statusCode: 502, message: 'API sunucusuna ulaşılamadı' },
      { status: 502 },
    );
  }

  // A platform-level failure — the API service crash-looping, restarting or
  // still waking up — comes back as an HTML error page, which the client can
  // only report as a bare status code. Naming the upstream makes the cause
  // readable from the screen instead of requiring the service logs.
  const contentType = upstream.headers.get('content-type') ?? '';
  if (upstream.status >= 500 && !contentType.includes('application/json')) {
    return Response.json(
      {
        statusCode: upstream.status,
        message: `API sunucusu yanıt vermiyor (${new URL(target).host} → ${upstream.status}). Servis yeniden başlıyor olabilir, birkaç dakika sonra tekrar deneyin.`,
      },
      { status: upstream.status },
    );
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: forwardHeaders(upstream.headers),
  });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const HEAD = proxy;
export const OPTIONS = proxy;
