import type { TokenPair } from './types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

const ACCESS_TOKEN_KEY = 'idfb.accessToken';
const REFRESH_TOKEN_KEY = 'idfb.refreshToken';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const tokenStore = {
  getAccess(): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  getRefresh(): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  set(tokens: Pick<TokenPair, 'accessToken' | 'refreshToken'>): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  },
  clear(): void {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  auth?: boolean;
  isFormData?: boolean;
}

let refreshPromise: Promise<boolean> | null = null;

async function attemptRefresh(): Promise<boolean> {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) return false;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (!response.ok) {
          tokenStore.clear();
          return false;
        }
        const tokens = (await response.json()) as TokenPair;
        tokenStore.set(tokens);
        return true;
      } catch {
        tokenStore.clear();
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth = true, isFormData = false, headers, ...rest } = options;

  const buildHeaders = (): HeadersInit => {
    const base: Record<string, string> = {};
    if (!isFormData) {
      base['Content-Type'] = 'application/json';
    }
    if (auth) {
      const token = tokenStore.getAccess();
      if (token) {
        base.Authorization = `Bearer ${token}`;
      }
    }
    return { ...base, ...(headers as Record<string, string>) };
  };

  const doFetch = (): Promise<Response> =>
    fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: buildHeaders(),
      body: isFormData
        ? (body as BodyInit)
        : body !== undefined
          ? JSON.stringify(body)
          : undefined,
    });

  let response = await doFetch();

  if (response.status === 401 && auth) {
    const refreshed = await attemptRefresh();
    if (refreshed) {
      response = await doFetch();
    }
  }

  if (!response.ok) {
    let parsed: unknown;
    let message = `Request failed with status ${response.status}`;
    try {
      parsed = await response.json();
      const maybeMessage = (parsed as { message?: string | string[] }).message;
      if (Array.isArray(maybeMessage)) {
        message = maybeMessage.join(', ');
      } else if (typeof maybeMessage === 'string') {
        message = maybeMessage;
      }
    } catch {
      // response had no JSON body
    }
    throw new ApiError(response.status, message, parsed);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return (await response.json()) as T;
  }
  return (await response.text()) as unknown as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};

export { API_BASE_URL };
