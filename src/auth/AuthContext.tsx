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
  id: string;
  name: string;
  email: string;
  role: RawRole;
  createdAt: string;
  updatedAt: string;
};

type User = Omit<RawUser, 'role'> & { role: Role };

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

function normalizeRole(role: RawRole): Role {
  const normalized = (Object.entries(ROLE_ALIASES) as Array<[Role, RawRole[]]>).find(([, aliases]) =>
    aliases.includes(role)
  );
  if (normalized) {
    return normalized[0];
  }
  return 'SELLER';
}

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchMe() {
    try {
      const me = await api<RawUser>('/auth/me');
      setUser({ ...me, role: normalizeRole(me.role) });
    } catch {
      setUser(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMe();
  }, []);

  const login = async (email: string, password: string) => {
    const { token, user: me } = await api<{ token: string; user: RawUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('token', token);
    setUser({ ...me, role: normalizeRole(me.role) });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
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
