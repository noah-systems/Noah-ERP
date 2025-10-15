import { LogOut, Search, User } from 'lucide-react';
import { useMemo } from 'react';
import { useAuth, type Role } from '@/auth/AuthContext';

const ROLE_LABELS: Record<Role, string> = {
  ADMIN_NOAH: 'Admin Noah',
  SUPPORT_NOAH: 'Suporte Noah',
  SELLER: 'Time Comercial',
  ADMIN_PARTNER: 'Admin Parceiro',
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
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar... (pressione / para focar)"
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-700 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
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
          <p className="text-sm font-medium text-gray-900">{user?.name ?? 'Noah Omni'}</p>
          <p className="text-xs text-gray-500">{user ? ROLE_LABELS[user.role] : 'Acesso Noah'}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
          {user?.name ? initials : <User className="h-5 w-5" />}
        </div>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </header>
  );
}
