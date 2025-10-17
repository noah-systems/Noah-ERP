import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, DollarSign, Plus, TrendingUp, Users, Wrench, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import Can from '@/auth/Can';
import { useAuth } from '@/auth/AuthContext';
import { api } from '@/lib/api';

type Stats = {
  leads: number;
  opportunities: number;
  implementacao: number;
  canceladas: number;
};

type MetricConfig = {
  key: keyof Stats;
  label: string;
  icon: typeof Users;
  accent: string;
  iconColor: string;
  helper?: string;
};

type MetricCard = {
  label: string;
  icon: typeof Users;
  accent: string;
  iconColor: string;
  value: string;
  helper?: string;
};

type ActionMessage = {
  type: 'success' | 'error';
  text: string;
};

const DEFAULT_STATS: Stats = {
  leads: 0,
  opportunities: 0,
  implementacao: 0,
  canceladas: 0,
};

const METRIC_BLUEPRINT: MetricConfig[] = [
  {
    key: 'leads',
    label: 'Leads',
    icon: Users,
    accent: 'bg-[rgba(91,225,0,0.14)] border border-[rgba(91,225,0,0.3)]',
    iconColor: 'text-[var(--noah-primary)]',
    helper: 'Novos leads capturados',
  },
  {
    key: 'opportunities',
    label: 'Oportunidades',
    icon: TrendingUp,
    accent: 'bg-[rgba(72,196,0,0.14)] border border-[rgba(72,196,0,0.32)]',
    iconColor: 'text-[var(--noah-primary-600)]',
    helper: 'Avanços no pipeline',
  },
  {
    key: 'implementacao',
    label: 'Implantação',
    icon: Wrench,
    accent: 'bg-[rgba(58,163,0,0.16)] border border-[rgba(58,163,0,0.32)]',
    iconColor: 'text-[var(--noah-primary-700)]',
    helper: 'Projetos em curso',
  },
  {
    key: 'canceladas',
    label: 'Canceladas',
    icon: XCircle,
    accent: 'bg-[rgba(255,107,107,0.16)] border border-[rgba(255,107,107,0.32)]',
    iconColor: 'text-[#ff9898]',
    helper: 'Contas que saíram',
  },
];

const toCount = (value: unknown): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.floor(parsed);
};

const normalizeStats = (payload: Partial<Record<string, unknown>>): Stats => ({
  leads: toCount(payload.leads),
  opportunities: toCount(payload.opportunities),
  implementacao: toCount(payload.implementacao ?? payload.implantacao),
  canceladas: toCount(payload.canceladas ?? payload.canceled ?? payload.cancelled),
});

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const numberFormatter = useMemo(() => new Intl.NumberFormat('pt-BR'), []);
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<ActionMessage | null>(null);
  const [creating, setCreating] = useState({ lead: false, opportunity: false });

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    (async () => {
      setLoadingStats(true);
      try {
        const payload = await api<Partial<Record<string, unknown>>>('/dashboard', {
          signal: controller.signal,
        });
        if (!active) {
          return;
        }
        setStats(normalizeStats(payload));
        setLoadError(null);
      } catch (error) {
        if (!active || (error instanceof DOMException && error.name === 'AbortError')) {
          return;
        }
        console.error('Falha ao carregar indicadores do dashboard', error);
        setStats(DEFAULT_STATS);
        setLoadError('Não foi possível carregar os indicadores agora.');
      } finally {
        if (active) {
          setLoadingStats(false);
        }
      }
    })();

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!actionMessage) return;
    const timer = window.setTimeout(() => setActionMessage(null), actionMessage.type === 'success' ? 4000 : 6000);
    return () => window.clearTimeout(timer);
  }, [actionMessage]);

  const metricCards: MetricCard[] = useMemo(
    () =>
      METRIC_BLUEPRINT.map((metric) => ({
        label: metric.label,
        icon: metric.icon,
        accent: metric.accent,
        iconColor: metric.iconColor,
        helper: metric.helper,
        value: loadingStats ? '—' : numberFormatter.format(stats[metric.key]),
      })),
    [loadingStats, numberFormatter, stats],
  );

  const quickActions = useMemo(
    () => [
      {
        label: 'Gerenciar Leads',
        description: loadingStats ? 'Carregando…' : `${numberFormatter.format(stats.leads)} leads ativos`,
        icon: Users,
        accent: 'bg-[rgba(91,225,0,0.14)] text-[var(--noah-primary)]',
        navigateTo: '/leads',
      },
      {
        label: 'Pipeline de Vendas',
        description: loadingStats
          ? 'Carregando…'
          : `${numberFormatter.format(stats.opportunities)} oportunidades`,
        icon: TrendingUp,
        accent: 'bg-[rgba(72,196,0,0.14)] text-[var(--noah-primary-600)]',
        navigateTo: '/opportunities',
      },
      {
        label: 'Implantação',
        description: loadingStats
          ? 'Carregando…'
          : `${numberFormatter.format(stats.implementacao)} em andamento`,
        icon: Wrench,
        accent: 'bg-[rgba(58,163,0,0.16)] text-[var(--noah-primary-700)]',
        navigateTo: '/implementation',
      },
      {
        label: 'Financeiro',
        description: 'Painel Noah Omni',
        icon: DollarSign,
        accent: 'bg-[rgba(15,24,25,0.9)] text-[var(--noah-text)]',
        navigateTo: '/pricing',
      },
    ],
    [loadingStats, numberFormatter, stats],
  );

  const handleCreate = async (kind: 'lead' | 'opportunity') => {
    if (creating[kind]) return;
    setActionMessage(null);
    setCreating((prev) => ({ ...prev, [kind]: true }));
    const endpoint = kind === 'lead' ? '/leads' : '/opportunities';

    try {
      const payload = await api<Partial<Record<string, unknown>>>(endpoint, { method: 'POST' });
      setStats(normalizeStats(payload));
      setActionMessage({
        type: 'success',
        text: kind === 'lead' ? 'Lead registrado com sucesso.' : 'Oportunidade registrada com sucesso.',
      });
    } catch (error) {
      console.error(`Falha ao registrar ${kind}`, error);
      setActionMessage({
        type: 'error',
        text: 'Não foi possível registrar agora. Tente novamente em instantes.',
      });
    } finally {
      setCreating((prev) => ({ ...prev, [kind]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--noah-text)]">Dashboard</h1>
          <p className="text-sm text-[rgba(230,247,230,0.68)]">
            {user?.name ? `Bem-vindo de volta, ${user.name}!` : 'Visão geral do Noah ERP'}
          </p>
        </div>
        <div className="flex gap-2">
          <Can roles={['ADMIN_NOAH', 'SELLER']}>
            <Button
              onClick={() => void handleCreate('lead')}
              disabled={creating.lead || loadingStats}
              aria-live="polite"
            >
              <Plus className="mr-2 h-4 w-4" />
              {creating.lead ? 'Registrando…' : 'Criar Lead'}
            </Button>
          </Can>
          <Can roles={['ADMIN_NOAH', 'SELLER']}>
            <Button
              variant="outline"
              onClick={() => void handleCreate('opportunity')}
              disabled={creating.opportunity || loadingStats}
              aria-live="polite"
            >
              <Plus className="mr-2 h-4 w-4" />
              {creating.opportunity ? 'Registrando…' : 'Criar Oportunidade'}
            </Button>
          </Can>
        </div>
      </div>

      {actionMessage && (
        <div
          role="status"
          aria-live={actionMessage.type === 'error' ? 'assertive' : 'polite'}
          className={
            actionMessage.type === 'success'
              ? 'rounded-lg border border-[rgba(91,225,0,0.35)] bg-[rgba(91,225,0,0.12)] p-4 text-sm text-[var(--noah-primary)]'
              : 'rounded-lg border border-[rgba(255,107,107,0.4)] bg-[rgba(255,107,107,0.1)] p-4 text-sm text-[#ff9f9f]'
          }
        >
          {actionMessage.text}
        </div>
      )}

      {loadError && (
        <div
          role="alert"
          className="rounded-lg border border-[rgba(255,107,107,0.4)] bg-[rgba(255,107,107,0.1)] p-4 text-sm text-[#ff9f9f]"
        >
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="bg-[rgba(15,24,25,0.85)] transition-shadow hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-[rgba(230,247,230,0.68)]">{metric.label}</p>
                    <p className="text-2xl font-semibold text-[rgba(230,247,230,0.95)]">{metric.value}</p>
                    {metric.helper && (
                      <p className="text-xs text-[rgba(230,247,230,0.6)]">{metric.helper}</p>
                    )}
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${metric.accent}`}>
                    <Icon className={`h-6 w-6 ${metric.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="bg-[rgba(15,24,25,0.85)]">
          <CardHeader>
            <CardTitle>Funil de Vendas (Últimos 30 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[rgba(230,247,230,0.68)]">
              Os dados do funil estarão disponíveis assim que a integração com a API estiver concluída.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[rgba(15,24,25,0.85)]">
          <CardHeader>
            <CardTitle>Atalhos Rápidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.navigateTo)}
                    className="flex w-full items-center justify-between rounded-lg border border-[rgba(255,255,255,0.12)] bg-[rgba(15,24,25,0.92)] p-4 text-left transition hover:bg-[rgba(24,36,37,0.92)]"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.accent}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[rgba(230,247,230,0.95)]">{action.label}</div>
                        <div className="text-xs text-[rgba(230,247,230,0.68)]">{action.description}</div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[rgba(230,247,230,0.55)]" />
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
