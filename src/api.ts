const RAW_API_BASE = import.meta.env.VITE_API_BASE ?? '/api';
const API_BASE = RAW_API_BASE.replace(/\/$/, '');

function buildUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const needsPrefix = !API_BASE.endsWith('/api') && !normalizedPath.startsWith('/api');
  const prefix = needsPrefix ? '/api' : '';
  return `${API_BASE}${prefix}${normalizedPath}` || `${prefix}${normalizedPath}`;
}

export async function api<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path), { ...init, headers });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status} – ${text || response.statusText}`);
  }
  return response.json();
}

export async function login(email: string, password: string) {
  const data = await api<{ token: string; user: unknown }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data.user;
}

export async function me() {
  return api('/auth/me');
}
