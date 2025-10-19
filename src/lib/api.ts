const base = (import.meta.env.VITE_API_BASE as string) || '/api';
export const API_BASE = base.replace(/\/+$/, '');

const rawMock = import.meta.env.VITE_MOCK;
export const USE_MOCK =
  rawMock === undefined || rawMock === null
    ? false
    : !['0', 'false', 'off', 'no', ''].includes(String(rawMock).trim().toLowerCase());

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const endpoint = path.startsWith('/') ? path : `/${path}`;
  const headers = new Headers(init.headers as HeadersInit | undefined);
  const hasBody = init.body !== undefined && init.body !== null;
  const isFormData = typeof FormData !== 'undefined' && hasBody && init.body instanceof FormData;
  if (hasBody && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...init,
    headers,
    credentials: init.credentials ?? 'include',
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `${response.status} ${response.statusText}`);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}
