import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  Wrench, 
  XCircle, 
  DollarSign, 
  Settings,
  Building2,
  UserPlus,
  Briefcase,
  LifeBuoy
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isPartnerModule: boolean;
  onModuleChange: (isPartner: boolean) => void;
  userRole: string;
}

export function Sidebar({ currentView, onNavigate, isPartnerModule, onModuleChange, userRole }: SidebarProps) {
  const internoMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'opportunities', label: 'Oportunidades', icon: TrendingUp },
    { id: 'implementation', label: 'Implantação', icon: Wrench },
    { id: 'canceled', label: 'Canceladas', icon: XCircle },
    { id: 'pricing', label: 'Valores & Preços', icon: DollarSign },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const partnerMenuItems = [
    { id: 'partner-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'partner-accounts', label: 'Contas', icon: Briefcase },
    ...(userRole === 'partner-master' || userRole === 'admin' ? [
      { id: 'create-partner', label: 'Criar Parceiro', icon: UserPlus }
    ] : []),
    ...(userRole === 'admin' || userRole === 'suporte' ? [
      { id: 'support-panel', label: 'Painel Suporte', icon: LifeBuoy }
    ] : []),
  ];

  const menuItems = isPartnerModule ? partnerMenuItems : internoMenuItems;

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6">
        <h1 className="text-xl tracking-wide">Noah ERP</h1>
      </div>
      
      <div className="px-4 mb-4">
        <div className="flex gap-2 bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => onModuleChange(false)}
            className={`flex-1 px-3 py-2 rounded text-sm transition-colors ${
              !isPartnerModule ? 'bg-blue-600' : 'hover:bg-gray-700'
            }`}
          >
            Interno
          </button>
          <button
            onClick={() => onModuleChange(true)}
            className={`flex-1 px-3 py-2 rounded text-sm transition-colors ${
              isPartnerModule ? 'bg-blue-600' : 'hover:bg-gray-700'
            }`}
          >
            Partner
          </button>
        </div>
      </div>

      <nav className="flex-1 px-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <Building2 className="w-5 h-5" />
          <span>Noah Tech</span>
        </div>
      </div>
    </aside>
  );
}
