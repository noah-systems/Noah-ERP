// Cliente HTTP com fallback para '/api' (funciona sem configurar env em dev/prod proxificado)
const fromEnv =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE) ||
  (typeof process !== 'undefined' && (process as any).env?.VITE_API_BASE) ||
  '';

export const API_BASE = (fromEnv.trim().replace(/\/+$/, '') || '/api');

export async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  const endpoint = path.startsWith('/') ? path : `/${path}`;
  const headers = { 'Content-Type': 'application/json', ...(init.headers || {}) } as Record<string, string>;
  const res = await fetch(`${API_BASE}${endpoint}`, { ...init, headers, credentials: 'include' });
  if (!res.ok) {
    // tenta extrair mensagem do backend
    let msg = '';
    try { msg = await res.text(); } catch {}
    throw new Error(msg || `HTTP ${res.status} ${res.statusText}`);
  }
  // se não houver body (204), retorna undefined
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export async function login(email: string, password: string) {
  // ajuste o endpoint se seu auth tiver outro path
  return http<{ token?: string; access_token?: string; user?: any }>(
    '/auth/login',
    { method: 'POST', body: JSON.stringify({ email, password }) }
  );
}
