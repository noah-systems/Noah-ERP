const resolveApiBase = () => {
  const viteBase =
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE) ||
    (typeof process !== 'undefined' && process.env?.VITE_API_BASE) ||
    '';

  const normalized = viteBase.trim().replace(/\/?$/, '');
  if (!normalized) {
    throw new Error('VITE_API_BASE is not configured.');
  }
  return normalized;
};

export const API_BASE = resolveApiBase();

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers || {}),
  } as Record<string, string>;

  const endpoint = path.startsWith('/') ? path : `/${path}`;
  const res = await fetch(`${API_BASE}${endpoint}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `${res.status} ${res.statusText}`);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}
