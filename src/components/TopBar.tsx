import { Search, User, ChevronDown } from 'lucide-react';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface TopBarProps {
  userRole: string;
  onRoleChange: (role: any) => void;
  isPartnerModule: boolean;
}

export function TopBar({ userRole, onRoleChange, isPartnerModule }: TopBarProps) {
  const roleLabels: Record<string, string> = {
    'admin': 'Admin Noah',
    'vendas': 'Vendas',
    'suporte': 'Suporte Noah',
    'financeiro': 'Financeiro Noah',
    'partner-master': 'Parceiro Master',
    'partner-financeiro': 'Parceiro Financeiro',
    'partner-operacoes': 'Parceiro Operações',
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar... (pressione / para focar)"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === '/') {
                e.preventDefault();
              }
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                <User className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-sm">Usuário Demo</div>
                <div className="text-xs text-gray-500">{roleLabels[userRole]}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-2 text-xs text-gray-500">Trocar Perfil (Demo)</div>
            <DropdownMenuItem onClick={() => onRoleChange('admin')}>
              Admin Noah
              {userRole === 'admin' && <Badge variant="secondary" className="ml-auto">Atual</Badge>}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRoleChange('vendas')}>
              Vendas
              {userRole === 'vendas' && <Badge variant="secondary" className="ml-auto">Atual</Badge>}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRoleChange('suporte')}>
              Suporte Noah
              {userRole === 'suporte' && <Badge variant="secondary" className="ml-auto">Atual</Badge>}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRoleChange('financeiro')}>
              Financeiro Noah
              {userRole === 'financeiro' && <Badge variant="secondary" className="ml-auto">Atual</Badge>}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRoleChange('partner-master')}>
              Parceiro Master
              {userRole === 'partner-master' && <Badge variant="secondary" className="ml-auto">Atual</Badge>}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRoleChange('partner-financeiro')}>
              Parceiro Financeiro
              {userRole === 'partner-financeiro' && <Badge variant="secondary" className="ml-auto">Atual</Badge>}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRoleChange('partner-operacoes')}>
              Parceiro Operações
              {userRole === 'partner-operacoes' && <Badge variant="secondary" className="ml-auto">Atual</Badge>}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
