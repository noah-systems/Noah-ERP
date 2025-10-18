const API_BASE = import.meta.env.VITE_API_BASE || '/api';
const TOKEN_STORAGE_KEY = 'noah-erp:token';

let authToken: string | null = null;

if (typeof window !== 'undefined') {
  const stored = window.localStorage.getItem(TOKEN_STORAGE_KEY);
  if (stored) {
    authToken = stored;
  }
}

export class ApiError extends Error {
  status: number;
  payload?: unknown;

  constructor(status: number, message: string, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

function resolveUrl(path: string): string {
  if (/^https?:/i.test(path)) {
    return path;
  }
  const base = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

function resolveHeaders(init?: RequestInit): Headers {
  const headers = new Headers(init?.headers ?? {});
  const isFormData = typeof FormData !== 'undefined' && init?.body instanceof FormData;
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }
  if (init?.body && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return headers;
}

async function parseBody<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }
  const text = await response.text();
  if (!text) {
    return undefined as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = resolveUrl(path);
  const headers = resolveHeaders(init);
  const body = init.body && !(init.body instanceof FormData) && typeof init.body !== 'string'
    ? JSON.stringify(init.body)
    : init.body;

  const response = await fetch(url, {
    ...init,
    headers,
    body,
  });

  if (!response.ok) {
    if (response.status === 401) {
      setAuthToken(null);
    }

    const payload = await parseBody<unknown>(response).catch(() => undefined);
    const message =
      (payload && typeof payload === 'object' && 'error' in payload && typeof (payload as Record<string, unknown>).error === 'string'
        ? (payload as Record<string, unknown>).error as string
        : undefined) || response.statusText || 'Erro inesperado';
    throw new ApiError(response.status, message, payload);
  }

  return parseBody<T>(response);
}

export const api = {
  get: <T>(path: string, init?: RequestInit) => request<T>(path, { ...init, method: 'GET' }),
  post: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>(path, { ...init, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>(path, { ...init, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>(path, { ...init, method: 'PATCH', body }),
  delete: <T>(path: string, init?: RequestInit) => request<T>(path, { ...init, method: 'DELETE' }),
};

export function setAuthToken(token: string | null) {
  authToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }
}

export function getAuthToken(): string | null {
  return authToken;
}

export function loadStoredToken(): string | null {
  if (authToken) {
    return authToken;
  }
  if (typeof window === 'undefined') {
    return null;
  }
  const stored = window.localStorage.getItem(TOKEN_STORAGE_KEY);
  authToken = stored;
  return stored;
}
