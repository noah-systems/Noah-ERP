import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, ApiError, loadStoredToken, setAuthToken } from '@/services/api';

export type Role = 'ADMIN_NOAH' | 'SUPPORT_NOAH' | 'SELLER' | 'ADMIN_PARTNER';
type RawRole =
  | Role
  | 'FINANCE_NOAH'
  | 'PARTNER_MASTER'
  | 'PARTNER_FINANCE'
  | 'PARTNER_OPS';

type RawUser = {
  id?: string;
  name?: string;
  email: string;
  role?: RawRole;
};

type User = {
  id?: string;
  name?: string;
  email: string;
  role: Role;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (...roles: Role[]) => boolean;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const ROLE_ALIASES: Record<Role, RawRole[]> = {
  ADMIN_NOAH: ['ADMIN_NOAH', 'FINANCE_NOAH'],
  SUPPORT_NOAH: ['SUPPORT_NOAH'],
  SELLER: ['SELLER'],
  ADMIN_PARTNER: ['ADMIN_PARTNER', 'PARTNER_MASTER', 'PARTNER_FINANCE', 'PARTNER_OPS'],
};

function normalizeRole(role?: RawRole): Role {
  if (!role) return 'ADMIN_NOAH';
  const normalized = (Object.entries(ROLE_ALIASES) as Array<[Role, RawRole[]]>).find(([, aliases]) =>
    aliases.includes(role)
  );
  if (normalized) {
    return normalized[0];
  }
  return 'SELLER';
}

export const useAuth = () => useContext(AuthContext);

function toUser(raw: RawUser): User {
  const fallbackName = raw.email?.split('@')[0] ?? 'Usuário';
  return {
    id: raw.id,
    name: raw.name ?? fallbackName,
    email: raw.email,
    role: normalizeRole(raw.role),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  async function fetchMe() {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get<{ user: RawUser }>('/auth/me');
      setUser(toUser(response.user));
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setAuthToken(null);
        setToken(null);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const stored = loadStoredToken();
    if (stored) {
      setToken(stored);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token === null) {
      setUser(null);
      setLoading(false);
      return;
    }
    void fetchMe();
  }, [token]);

  const login = async (email: string, password: string) => {
    const result = await api.post<{ token: string; user: RawUser }>('/auth/login', { email, password });
    setAuthToken(result.token);
    setToken(result.token);
    setUser(toUser(result.user));
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      if (!(error instanceof ApiError)) {
        throw error;
      }
    } finally {
      setAuthToken(null);
      setToken(null);
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      hasRole: (...roles: Role[]) => {
        if (!user) return false;
        const rawRole = user.role;
        return roles.some((role) => ROLE_ALIASES[role]?.includes(rawRole));
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
