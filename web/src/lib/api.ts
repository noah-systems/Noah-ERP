export const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined)?.trim() ||
  (import.meta.env.VITE_API_BASE as string | undefined)?.trim() ||
  '/api';
const rawMock = import.meta.env.VITE_MOCK;
export const USE_MOCK =
  rawMock === undefined || rawMock === null
    ? false
    : !['0', 'false', 'off', 'no', ''].includes(String(rawMock).trim().toLowerCase());
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const endpoint = path.startsWith('/') ? path : `/${path}`;
  const base = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
  const headers = new Headers(init.headers as any);
  const hasBody = init.body != null;
  const isForm = typeof FormData !== 'undefined' && hasBody && init.body instanceof FormData;
  if (hasBody && !isForm && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const res = await fetch(`${base}${endpoint}`, { ...init, headers, credentials: init.credentials ?? 'include' });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(t || `${res.status} ${res.statusText}`);
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}
