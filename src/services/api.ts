import axios, { type AxiosError } from 'axios';

const resolveApiBase = () => {
  const envBase =
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE) ||
    (typeof process !== 'undefined' && process.env?.VITE_API_BASE) ||
    '';

  const normalized = envBase.trim().replace(/\/?$/, '');
  if (!normalized) {
    throw new Error('VITE_API_BASE não está configurado.');
  }
  return normalized;
};

const apiBase = resolveApiBase();

export const apiClient = axios.create({
  baseURL: apiBase,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string }>) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      window.localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string } | undefined;
    return data?.error ?? error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Erro desconhecido.';
}
