/**
 * Camada mínima de HTTP com fallback de base URL.
 * Não lança erro por falta de VITE_API_BASE: usa '/api' por padrão.
 */
export const apiBase = ((import.meta as any)?.env?.VITE_API_BASE || '/api').replace(/\/+$/, '');

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = `${apiBase}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} – ${body}`);
  }
  return res.json() as Promise<T>;
}
