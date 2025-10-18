import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Users, Wrench, XCircle, ArrowRight } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useLeads } from '@/hooks/useLeads';
import { useOpportunities } from '@/hooks/useOpportunities';
import { useImplantacoes } from '@/hooks/useImplantacoes';
import { useCancellations } from '@/hooks/useCancellations';

export function Dashboard() {
  const navigate = useNavigate();
  const { leads, loading: leadsLoading } = useLeads();
  const { opportunities, loading: opportunitiesLoading } = useOpportunities();
  const { items: implementations, loading: implementationsLoading } = useImplantacoes();
  const { items: cancellations, loading: cancellationsLoading } = useCancellations();

  const loading = leadsLoading || opportunitiesLoading || implementationsLoading || cancellationsLoading;

  const metrics = useMemo(
    () => [
      {
        label: 'Leads ativos',
        value: leads.length,
        icon: Users,
        accent: 'bg-emerald-50 text-emerald-700',
      },
      {
        label: 'Oportunidades',
        value: opportunities.length,
        icon: TrendingUp,
        accent: 'bg-blue-50 text-blue-700',
      },
      {
        label: 'Implantações em andamento',
        value: implementations.filter((item) => item.status !== 'COMPLETED').length,
        icon: Wrench,
        accent: 'bg-indigo-50 text-indigo-700',
      },
      {
        label: 'Canceladas no histórico',
        value: cancellations.length,
        icon: XCircle,
        accent: 'bg-rose-50 text-rose-700',
      },
    ],
    [cancellations.length, implementations, leads.length, opportunities.length]
  );

  const shortcuts = [
    {
      label: 'Ir para Leads',
      description: 'Gerencie captação e nutrição',
      href: '/leads',
    },
    {
      label: 'Ver Pipeline',
      description: 'Acompanhe oportunidades por etapa',
      href: '/opportunities',
    },
    {
      label: 'Implantação',
      description: 'Planejamento e execução',
      href: '/implementation',
    },
    {
      label: 'Cancelamentos',
      description: 'Motivos e histórico',
      href: '/canceled',
    },
  ];

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Visão geral</h1>
          <p className="text-sm text-slate-500">
            Acompanhe os principais indicadores das suas operações comerciais e de implantação.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric.label} className="border border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">{metric.label}</CardTitle>
                <metric.icon className={`h-5 w-5 ${metric.accent}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-slate-900">
                  {loading ? '—' : metric.value.toLocaleString('pt-BR')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium text-slate-900">Ações rápidas</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {shortcuts.map((item) => (
            <Card key={item.href} className="border border-slate-200">
              <CardContent className="flex h-full flex-col justify-between gap-4 p-5">
                <div>
                  <h3 className="text-base font-semibold text-slate-800">{item.label}</h3>
                  <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="justify-between"
                  onClick={() => navigate(item.href)}
                >
                  Abrir
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
