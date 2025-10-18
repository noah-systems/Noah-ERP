import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, DollarSign, Plus, TrendingUp, Users, Wrench, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import Can from '@/auth/Can';
import { useAuth } from '@/auth/AuthContext';
import { useLeads, leadStageLabels } from '@/hooks/useLeads';
import { useOpportunities, opportunityStageLabels } from '@/hooks/useOpportunities';
import { useImplantacoes } from '@/hooks/useImplantacoes';
import { useCancellations } from '@/hooks/useCancellations';
import type { LeadStage, OpportunityStage } from '@/types/domain';

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { leads, isLoading: leadsLoading } = useLeads();
  const { opportunities, isLoading: opportunitiesLoading } = useOpportunities();
  const { implementations, isLoading: implementationsLoading } = useImplantacoes();
  const { cancellations, isLoading: cancellationsLoading } = useCancellations();

  const isLoading = leadsLoading || opportunitiesLoading || implementationsLoading || cancellationsLoading;

  const totalLeads = leads.length;
  const leadCounts = useMemo(() => {
    return leads.reduce(
      (acc, lead) => {
        acc[lead.stage] = (acc[lead.stage] ?? 0) + 1;
        return acc;
      },
      { NUTRICAO: 0, QUALIFICADO: 0, NAO_QUALIFICADO: 0 } as Record<LeadStage, number>
    );
  }, [leads]);
  const qualifiedLeads = leadCounts.QUALIFICADO;

  const opportunityCounts = useMemo(() => {
    return opportunities.reduce(
      (acc, opportunity) => {
        acc[opportunity.stage] = (acc[opportunity.stage] ?? 0) + 1;
        return acc;
      },
      {
        NEGOCIACAO: 0,
        APRESENTACAO: 0,
        PROPOSTA: 0,
        TRIAL: 0,
        VENC_TRIAL: 0,
        VENDAS: 0,
      } as Record<OpportunityStage, number>
    );
  }, [opportunities]);

  const totalOpportunities = opportunities.length;
  const wonOpportunities = opportunityCounts.VENDAS;
  const trialsActive = opportunityCounts.TRIAL + opportunityCounts.VENC_TRIAL;
  const pipelineValue = useMemo(
    () => opportunities.reduce((total, opportunity) => total + (opportunity.value ?? 0), 0),
    [opportunities]
  );
  const pipelineFormatted = useMemo(
    () =>
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
        Number.isFinite(pipelineValue) ? pipelineValue : 0
      ),
    [pipelineValue]
  );

  const scheduledImplementations = useMemo(
    () => implementations.filter((implementation) => implementation.status === 'SCHEDULED').length,
    [implementations]
  );
  const completedImplementations = useMemo(
    () => implementations.filter((implementation) => implementation.status === 'COMPLETED').length,
    [implementations]
  );

  const cancellationsTotal = cancellations.length;
  const cancellationsThisMonth = useMemo(() => {
    const now = new Date();
    return cancellations.filter((item) => {
      const cancelledAt = new Date(item.cancelledAt);
      return cancelledAt.getMonth() === now.getMonth() && cancelledAt.getFullYear() === now.getFullYear();
    }).length;
  }, [cancellations]);

  const stats = useMemo(
    () => [
      {
        label: 'Leads ativos',
        value: isLoading ? '…' : totalLeads.toString(),
        icon: Users,
        iconBg: 'bg-[color:rgba(15,157,118,0.12)]',
        iconColor: 'text-[var(--noah-green-600)]',
        helper: isLoading ? 'Carregando leads…' : `${qualifiedLeads} qualificados`,
      },
      {
        label: 'Oportunidades',
        value: isLoading ? '…' : totalOpportunities.toString(),
        icon: TrendingUp,
        iconBg: 'bg-[color:rgba(15,157,118,0.12)]',
        iconColor: 'text-[var(--noah-green-600)]',
        helper: isLoading ? 'Carregando pipeline…' : `${wonOpportunities} convertidas`,
      },
      {
        label: 'Valor em pipeline',
        value: isLoading ? '…' : pipelineFormatted,
        icon: DollarSign,
        iconBg: 'bg-[color:rgba(37,99,235,0.12)]',
        iconColor: 'text-blue-600',
        helper: isLoading ? 'Carregando valores…' : `${trialsActive} trials ativos`,
      },
      {
        label: 'Implantações agendadas',
        value: isLoading ? '…' : scheduledImplementations.toString(),
        icon: Wrench,
        iconBg: 'bg-[color:rgba(168,85,247,0.12)]',
        iconColor: 'text-purple-600',
        helper: isLoading ? 'Carregando implantações…' : `${completedImplementations} concluídas`,
      },
      {
        label: 'Cancelamentos',
        value: isLoading ? '…' : cancellationsTotal.toString(),
        icon: XCircle,
        iconBg: 'bg-[color:rgba(248,113,113,0.12)]',
        iconColor: 'text-red-600',
        helper: isLoading ? 'Carregando histórico…' : `${cancellationsThisMonth} neste mês`,
      },
    ],
    [
      cancellationsThisMonth,
      cancellationsTotal,
      completedImplementations,
      isLoading,
      pipelineFormatted,
      qualifiedLeads,
      scheduledImplementations,
      totalLeads,
      totalOpportunities,
      trialsActive,
      wonOpportunities,
    ]
  );

  const funnelData = useMemo(() => {
    const entries = [
      { stage: leadStageLabels.NUTRICAO, count: leadCounts.NUTRICAO },
      { stage: leadStageLabels.QUALIFICADO, count: leadCounts.QUALIFICADO },
      { stage: opportunityStageLabels.NEGOCIACAO, count: opportunityCounts.NEGOCIACAO },
      { stage: opportunityStageLabels.PROPOSTA, count: opportunityCounts.PROPOSTA },
      { stage: opportunityStageLabels.TRIAL, count: opportunityCounts.TRIAL },
      { stage: opportunityStageLabels.VENC_TRIAL, count: opportunityCounts.VENC_TRIAL },
      { stage: opportunityStageLabels.VENDAS, count: opportunityCounts.VENDAS },
    ];
    const maxCount = entries.reduce((max, entry) => Math.max(max, entry.count), 0);
    return entries.map((entry) => ({
      ...entry,
      percentage: maxCount === 0 ? 0 : Math.round((entry.count / maxCount) * 100),
    }));
  }, [leadCounts, opportunityCounts]);

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="transition-shadow hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.helper}</p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.iconBg}`}>
                    <Icon className={`h-6 w-6 ${stat.iconColor}`} />
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
                      <div className="text-xs text-gray-500">
                        {isLoading ? 'Carregando…' : `${totalLeads} leads ativos`}
                      </div>
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
                      <div className="text-xs text-gray-500">
                        {isLoading ? 'Carregando…' : `${totalOpportunities} oportunidades`}
                      </div>
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
                      <div className="text-xs text-gray-500">
                        {isLoading ? 'Carregando…' : `${scheduledImplementations} agendadas`}
                      </div>
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
