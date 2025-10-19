/**
 * Camada mínima de HTTP com fallback de base URL.
 * Não quebra se VITE_API_BASE não estiver definido.
 */
const fromEnv =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE) ||
  (typeof process !== 'undefined' && (process as any).env?.VITE_API_BASE) ||
  '';

export const API_BASE = (fromEnv.trim().replace(/\/+$/, '') || '/api');

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const endpoint = path.startsWith('/') ? path : `/${path}`;
  const res = await fetch(`${API_BASE}${endpoint}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(body || `HTTP ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}
