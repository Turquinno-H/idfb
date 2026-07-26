import type { NextRequest } from 'next/server';

// Same-origin proxy in front of the NestJS API.
//
// The browser bundle talks to `/api/v1/...` on its own origin and this handler
// forwards the call to the backend. The target is read at request time, unlike
// NEXT_PUBLIC_API_URL which Next.js inlines into the client bundle at build
// time — so a prebuilt image can be pointed at any backend by changing an
// environment variable, and no CORS grant is ever required.
const API_TARGET = (
  process.env.API_PROXY_TARGET ?? 'http://localhost:3001'
).replace(/\/+$/, '');

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
  const target = `${API_TARGET}/api/v1/${path
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
