import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { login as apiLogin, me as apiMe } from "@/services/api";

export type Role = "ADMIN" | "USER";

type RawUser = {
  id?: string;
  name?: string;
  email?: string;
  role?: Role;
};

type User = {
  id: string;
  name: string;
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

export const useAuth = () => useContext(AuthContext);

function toUser(raw: RawUser): User {
  const email = raw.email ?? "";
  const fallbackName = email.split("@")[0] || "Usuário";
  return {
    id: raw.id ?? "",
    name: raw.name && raw.name.trim() ? raw.name : fallbackName,
    email,
    role: raw.role ?? "USER",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    setLoading(true);
    try {
      const data = await apiMe();
      if (data && data.email) {
        setUser(toUser(data));
      } else {
        setUser(null);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.warn("/auth/me failed", error.message);
      }
      localStorage.removeItem("noah_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("noah_token") : null;
    if (!stored) {
      setLoading(false);
      return;
    }
    void fetchMe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await apiLogin(email, password);
      setUser(toUser(result));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    localStorage.removeItem("noah_token");
    setUser(null);
    setLoading(false);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      hasRole: (...roles: Role[]) => {
        if (!user) return false;
        return roles.includes(user.role);
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
