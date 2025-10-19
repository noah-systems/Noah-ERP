import { LogOut, Search, User } from 'lucide-react';
import { useMemo } from 'react';
import { useAuth, type Role } from '@/auth/AuthContext';

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Admin Noah',
  USER: 'Time Comercial',
};

export function TopBar() {
  const { user, logout } = useAuth();
  const initials = useMemo(() => {
    if (!user?.name) return 'NO';
    return user.name
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }, [user?.name]);

  return (
    <header className="flex items-center justify-between border-b border-[color:color-mix(in_srgb,var(--border)_85%,transparent)] bg-[var(--card)] px-6 py-4 text-[var(--foreground)]">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:color-mix(in_srgb,var(--muted-foreground)_80%,transparent)]" />
          <input
            type="text"
            placeholder="Buscar... (pressione / para focar)"
            className="w-full rounded-lg border border-[color:var(--border)] bg-[var(--input-background)] py-2 pl-10 pr-4 text-sm text-[var(--foreground)] shadow-[0_6px_16px_color-mix(in_srgb,var(--border)_28%,transparent)] transition focus:border-[color:var(--ring)] focus:outline-none focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--ring)_45%,transparent)]"
            onKeyDown={(event) => {
              if (event.key === '/') {
                event.preventDefault();
              }
            }}
          />
        </div>
      </div>

      <div className="ml-6 flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-[var(--foreground)]">{user?.name ?? 'Noah Omni'}</p>
          <p className="text-xs text-[color:color-mix(in_srgb,var(--muted-foreground)_80%,transparent)]">{user ? ROLE_LABELS[user.role] : 'Acesso Noah'}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-semibold text-[var(--primary-foreground)] shadow-[0_10px_20px_color-mix(in_srgb,var(--primary)_28%,transparent)]">
          {user?.name ? initials : <User className="h-5 w-5" />}
        </div>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-lg border border-[color:color-mix(in_srgb,var(--border)_90%,transparent)] bg-[color:color-mix(in_srgb,var(--card)_92%,transparent)] px-3 py-2 text-sm font-medium text-[color:color-mix(in_srgb,var(--foreground)_80%,transparent)] transition hover:border-[color:color-mix(in_srgb,var(--destructive)_35%,transparent)] hover:bg-[color:color-mix(in_srgb,var(--destructive)_12%,var(--card)_88%)] hover:text-[var(--destructive)]"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </header>
  );
}
