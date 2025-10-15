import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Bot,
  Building2,
  DollarSign,
  Plus,
  TrendingUp,
  Users,
  Wallet,
  Wrench,
  XCircle,
  UserCog,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import Can from '@/auth/Can';
import { useAuth } from '@/auth/AuthContext';

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const stats = useMemo(
    () => [
      { label: 'Leads', value: 47, icon: Users, color: 'bg-yellow-500', iconColor: 'text-white', trend: '+12%' },
      {
        label: 'Oportunidades',
        value: 23,
        icon: TrendingUp,
        color: 'bg-[var(--primary)]',
        iconColor: 'text-[#0A1400]',
        trend: '+8%',
      },
      { label: 'Implantação', value: 8, icon: Wrench, color: 'bg-purple-500', iconColor: 'text-white', trend: '+3' },
      { label: 'Canceladas', value: 5, icon: XCircle, color: 'bg-red-500', iconColor: 'text-white', trend: '-2' },
      { label: 'Bots', value: 152, icon: Bot, color: 'bg-red-400', iconColor: 'text-white', trend: '+18' },
      { label: 'Operadores', value: 89, icon: UserCog, color: 'bg-yellow-400', iconColor: 'text-white', trend: '+5' },
      {
        label: 'Estabelecimentos',
        value: 34,
        icon: Building2,
        color: 'bg-[color:rgba(168,230,15,0.2)]',
        iconColor: 'text-[var(--primary)]',
        trend: '+7%',
      },
      { label: 'Saldo', value: 'R$ 45.8k', icon: Wallet, color: 'bg-green-500', iconColor: 'text-white', trend: '+15%' },
    ],
    []
  );

  const funnelData = [
    { stage: 'Nutrição', count: 47, percentage: 100 },
    { stage: 'Qualificado', count: 32, percentage: 68 },
    { stage: 'Negociação', count: 23, percentage: 49 },
    { stage: 'Proposta', count: 15, percentage: 32 },
    { stage: 'Trial', count: 8, percentage: 17 },
    { stage: 'Ganho', count: 5, percentage: 11 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Visão geral do Noah ERP</p>
        </div>
        <div className="flex gap-2">
          <Can roles={['ADMIN_NOAH', 'SELLER']}>
            <Button onClick={() => navigate('/leads')}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Lead
            </Button>
          </Can>
          <Can roles={['ADMIN_NOAH', 'SELLER']}>
            <Button variant="outline" onClick={() => navigate('/opportunities')}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Oportunidade
            </Button>
          </Can>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const iconColor = stat.iconColor ?? 'text-white';
          return (
            <Card key={index} className="transition-shadow hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.trend} vs. mês passado</p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}>
                    <Icon className={`h-6 w-6 ${iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Funil de Vendas (Últimos 30 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {funnelData.map((stage, index) => (
                <div key={index}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-gray-700">{stage.stage}</span>
                    <span className="font-medium text-gray-900">{stage.count}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-[var(--primary)] transition-all"
                      style={{ width: `${stage.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atalhos Rápidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Can roles={['ADMIN_NOAH', 'SELLER']}>
                <button
                  onClick={() => navigate('/leads')}
                  className="flex w-full items-center justify-between rounded-lg border border-gray-200 p-4 text-left transition hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                      <Users className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Gerenciar Leads</div>
                      <div className="text-xs text-gray-500">47 leads ativos</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </button>
              </Can>

              <Can roles={['ADMIN_NOAH', 'SELLER']}>
                <button
                  onClick={() => navigate('/opportunities')}
                  className="flex w-full items-center justify-between rounded-lg border border-gray-200 p-4 text-left transition hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color:rgba(168,230,15,0.14)]">
                      <TrendingUp className="h-5 w-5 text-[var(--primary)]" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Pipeline de Vendas</div>
                      <div className="text-xs text-gray-500">23 oportunidades</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </button>
              </Can>

              <Can roles={['ADMIN_NOAH', 'SUPPORT_NOAH']}>
                <button
                  onClick={() => navigate('/implementation')}
                  className="flex w-full items-center justify-between rounded-lg border border-gray-200 p-4 text-left transition hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                      <Wrench className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Ir para Implantação</div>
                      <div className="text-xs text-gray-500">8 em andamento</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </button>
              </Can>

              <Can roles={['ADMIN_NOAH']}>
                <button
                  onClick={() => navigate('/pricing')}
                  className="flex w-full items-center justify-between rounded-lg border border-gray-200 p-4 text-left transition hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Catálogo e Regras</div>
                      <div className="text-xs text-gray-500">Gerenciar preços</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </button>
              </Can>
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-gray-400">Último acesso: {user?.updatedAt ? new Date(user.updatedAt).toLocaleString('pt-BR') : '—'}</p>
    </div>
  );
}
