import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';

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

type AuthMeResponse = { authenticated: false } | { authenticated: true; user: RawUser };

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
  logout: () => void;
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

  async function fetchMe() {
    setLoading(true);
    try {
      const response = await api<AuthMeResponse>('/auth/me');
      if (!response.authenticated) {
        setUser(null);
        return;
      }
      const me = response.user;
      setUser(toUser(me));
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMe();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await api<{ authenticated: true; user: RawUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (!result?.authenticated) {
      throw new Error('Autenticação falhou');
    }
    setUser(toUser(result.user));
  };

  const logout = () => {
    setUser(null);
    void api('/auth/logout', { method: 'POST' }).catch(() => undefined);
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
