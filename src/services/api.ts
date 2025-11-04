import axios, { AxiosError, AxiosHeaders } from "axios";

export type Role = "ADMIN" | "USER";

export type AuthUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: Role;
};

const TOKEN_KEY = "noah_token";

export class ApiError extends Error {
  status: number;
  payload?: unknown;

  constructor(status: number, message: string, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

const apiBase =
  (import.meta.env.VITE_API_URL as string | undefined)?.trim() ||
  (import.meta.env.VITE_API_BASE as string | undefined)?.trim() ||
  "/api";

export const api = axios.create({
  baseURL: apiBase,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (token) {
      const headers = config.headers ?? new AxiosHeaders();
      if (headers instanceof AxiosHeaders) {
        headers.set("Authorization", `Bearer ${token}`);
      } else {
        (headers as Record<string, string>).Authorization = `Bearer ${token}`;
      }
      config.headers = headers;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string }>) => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401 && typeof window !== "undefined") {
        window.localStorage.removeItem(TOKEN_KEY);
      }
      const message =
        (data && typeof data === "object" && typeof data.error === "string"
          ? data.error
          : error.message) || "Erro inesperado";
      throw new ApiError(status, message, data);
    }
    throw new ApiError(0, error.message || "Erro inesperado");
  }
);

export async function login(email: string, password: string) {
  const { data } = await api.post<{ token: string; user: AuthUser }>("/auth/login", { email, password });
  if (typeof window !== "undefined") {
    window.localStorage.setItem(TOKEN_KEY, data.token);
  }
  return data.user;
}

export async function me() {
  const { data } = await api.get<{ user?: AuthUser }>("/auth/me");
  return data.user ?? null;
}

export const Leads = {
  list: async () => (await api.get("/leads")).data,
  create: async (payload: any) => (await api.post("/leads", payload)).data,
  move: async (id: string, stage: string) =>
    (await api.put(`/leads/${id}/move`, { stage })).data,
};

export const Opportunities = {
  list: async () => (await api.get("/opportunities")).data,
  create: async (payload: any) => (await api.post("/opportunities", payload)).data,
};

export default api;
