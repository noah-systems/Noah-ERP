import { type ComponentType } from 'react';
import {
  Briefcase,
  Building2,
  DollarSign,
  LayoutDashboard,
  LifeBuoy,
  Settings,
  TrendingUp,
  UserPlus,
  Users,
  Wrench,
  XCircle,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import type { Role } from '@/auth/AuthContext';
import { BRAND } from '@/lib/brand';

type ModuleKind = 'internal' | 'partner';

type MenuItem = {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  to: string;
  exact?: boolean;
  roles?: Role[];
};

type SidebarProps = {
  module: ModuleKind;
  onModuleChange: (module: ModuleKind) => void;
};

const INTERNAL_MENU: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, to: '/', exact: true },
  { id: 'leads', label: 'Leads', icon: Users, to: '/leads', roles: ['ADMIN', 'USER'] },
  { id: 'opportunities', label: 'Oportunidades', icon: TrendingUp, to: '/opportunities', roles: ['ADMIN', 'USER'] },
  { id: 'implementation', label: 'Implantação', icon: Wrench, to: '/implementation', roles: ['ADMIN'] },
  { id: 'canceled', label: 'Canceladas', icon: XCircle, to: '/canceled', roles: ['ADMIN'] },
  { id: 'pricing', label: 'Valores & Preços', icon: DollarSign, to: '/pricing', roles: ['ADMIN'] },
  { id: 'settings', label: 'Configurações', icon: Settings, to: '/settings', roles: ['ADMIN'] },
];

const PARTNER_MENU: MenuItem[] = [
  { id: 'partner-dashboard', label: 'Dashboard', icon: LayoutDashboard, to: '/partner', exact: true, roles: ['ADMIN'] },
  { id: 'partner-accounts', label: 'Contas', icon: Briefcase, to: '/partner/accounts', roles: ['ADMIN'] },
  { id: 'create-partner', label: 'Criar Parceiro', icon: UserPlus, to: '/partner/create', roles: ['ADMIN'] },
  { id: 'support-panel', label: 'Painel Suporte', icon: LifeBuoy, to: '/partner/support', roles: ['ADMIN'] },
];

export function Sidebar({ module, onModuleChange }: SidebarProps) {
  const { hasRole } = useAuth();
  const logo = BRAND.logoDark;
  const canAccessPartner = hasRole('ADMIN');

  const items = (module === 'partner' ? PARTNER_MENU : INTERNAL_MENU).filter((item) =>
    item.roles ? hasRole(...item.roles) : true
  );

  return (
    <aside className="flex w-64 flex-col bg-gray-900 text-white">
      <div className="flex items-center justify-center px-6 py-6">
        {logo ? (
          <img src={logo} alt="Noah Omni" className="max-h-12 object-contain" />
        ) : (
          <h1 className="text-lg font-semibold tracking-wide">Noah ERP</h1>
        )}
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 rounded-xl bg-gray-800 p-1 text-sm">
          <button
            type="button"
            className={`flex-1 rounded-lg px-3 py-2 transition-colors ${
              module === 'internal'
                ? 'bg-[var(--primary)] text-[#0A1400] shadow-[0_10px_24px_rgba(12,24,4,0.35)]'
                : 'hover:bg-gray-700 text-gray-300'
            }`}
            onClick={() => onModuleChange('internal')}
          >
            Interno
          </button>
          <button
            type="button"
            className={`flex-1 rounded-lg px-3 py-2 transition-colors ${
              module === 'partner'
                ? 'bg-[var(--primary)] text-[#0A1400] shadow-[0_10px_24px_rgba(12,24,4,0.35)]'
                : 'hover:bg-gray-700 text-gray-300'
            } ${canAccessPartner ? '' : 'cursor-not-allowed opacity-40'}`}
            onClick={() => canAccessPartner && onModuleChange('partner')}
            disabled={!canAccessPartner}
          >
            Partner
          </button>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4">
        {items.map(({ id, label, icon: Icon, to, exact }) => (
          <NavLink
            key={id}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors ${
                isActive
                  ? 'bg-[var(--primary)] text-[#0A1400] shadow-[0_16px_32px_rgba(12,24,4,0.3)]'
                  : 'text-gray-300 hover:bg-gray-800'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </NavLink>
        ))}
        {items.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-700 px-4 py-8 text-center text-xs text-gray-400">
            Sem permissões para este módulo.
          </div>
        )}
      </nav>

      <div className="px-6 py-4 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          <span>Noah Omni</span>
        </div>
      </div>
    </aside>
  );
}
