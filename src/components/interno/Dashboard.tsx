import { Users, TrendingUp, Wrench, XCircle, Bot, UserCog, Building2, Wallet, Plus, ArrowRight, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

interface DashboardProps {
  onNavigate: (view: string) => void;
  userRole: string;
}

export function Dashboard({ onNavigate, userRole }: DashboardProps) {
  const stats = [
    { label: 'Leads', value: 47, icon: Users, color: 'bg-yellow-500', trend: '+12%' },
    { label: 'Oportunidades', value: 23, icon: TrendingUp, color: 'bg-blue-500', trend: '+8%' },
    { label: 'Implantação', value: 8, icon: Wrench, color: 'bg-purple-500', trend: '+3' },
    { label: 'Canceladas', value: 5, icon: XCircle, color: 'bg-red-500', trend: '-2' },
    { label: 'Bots', value: 152, icon: Bot, color: 'bg-red-400', trend: '+18' },
    { label: 'Operadores', value: 89, icon: UserCog, color: 'bg-yellow-400', trend: '+5' },
    { label: 'Estabelecimentos', value: 34, icon: Building2, color: 'bg-blue-400', trend: '+7' },
    { label: 'Saldo', value: 'R$ 45.8k', icon: Wallet, color: 'bg-green-500', trend: '+15%' },
  ];

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Visão geral do Noah ERP</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => onNavigate('leads')}>
            <Plus className="w-4 h-4 mr-2" />
            Criar Lead
          </Button>
          <Button variant="outline" onClick={() => onNavigate('opportunities')}>
            <Plus className="w-4 h-4 mr-2" />
            Criar Oportunidade
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.trend} vs. mês passado</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Funil de Vendas (Últimos 30 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {funnelData.map((stage, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{stage.stage}</span>
                    <span className="text-gray-900">{stage.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
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
              <button
                onClick={() => onNavigate('leads')}
                className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm">Gerenciar Leads</div>
                    <div className="text-xs text-gray-500">47 leads ativos</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </button>

              <button
                onClick={() => onNavigate('opportunities')}
                className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm">Pipeline de Vendas</div>
                    <div className="text-xs text-gray-500">23 oportunidades</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </button>

              <button
                onClick={() => onNavigate('implementation')}
                className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm">Ir para Implantação</div>
                    <div className="text-xs text-gray-500">8 em andamento</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </button>

              <button
                onClick={() => onNavigate('pricing')}
                className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm">Catálogo e Regras</div>
                    <div className="text-xs text-gray-500">Gerenciar preços</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
