import { useMemo, useState } from 'react';
import { AlertTriangle, Link2, MoreVertical } from 'lucide-react';

import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { Skeleton } from '../../ui/skeleton';
import { opportunityStageLabels, OPPORTUNITY_STAGE_ORDER } from '@/hooks/useOpportunities';
import type { GroupedOpportunities } from '@/hooks/useOpportunities';
import type { Opportunity, OpportunityStage } from '@/types/api';
import { cn } from '@/components/ui/utils';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

type OppsKanbanProps = {
  grouped: GroupedOpportunities;
  loading: boolean;
  onMove: (id: string, stage: OpportunityStage) => Promise<unknown> | unknown;
  onMarkWon: (opportunity: Opportunity) => Promise<unknown> | unknown;
  onMarkLost: (opportunity: Opportunity) => void;
  onEdit?: (opportunity: Opportunity) => void;
};

type DragState = { id: string; stage: OpportunityStage } | null;

type ColumnConfig = {
  title: string;
  accent: string;
};

const columnConfigs: Record<OpportunityStage, ColumnConfig> = {
  NEGOTIATION: { title: 'Negociação', accent: 'border-sky-200 bg-sky-50' },
  PRESENTATION: { title: 'Apresentação', accent: 'border-violet-200 bg-violet-50' },
  PROPOSAL: { title: 'Proposta', accent: 'border-amber-200 bg-amber-50' },
  TRIAL: { title: 'Trial', accent: 'border-cyan-200 bg-cyan-50' },
  TRIAL_EXPIRING: { title: 'Vencimento Trial', accent: 'border-orange-200 bg-orange-50' },
  WON: { title: 'Efetivadas', accent: 'border-emerald-200 bg-emerald-50' },
  LOST: { title: 'Perdidas', accent: 'border-rose-200 bg-rose-50' },
};

function ownerInitials(ownerId: string): string {
  const cleaned = ownerId.replace(/[^a-zA-Z0-9]/g, '');
  if (!cleaned) return '??';
  return cleaned.slice(0, 2).toUpperCase();
}

function trialMessage(trialEndsAt: string | null): { message: string; tone: 'warning' | 'muted' } | null {
  if (!trialEndsAt) return null;
  const end = new Date(trialEndsAt);
  if (Number.isNaN(end.getTime())) return null;
  const now = new Date();
  const diffDays = Math.round((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays > 0) {
    return { message: `Trial termina em ${diffDays} dia${diffDays === 1 ? '' : 's'}`, tone: diffDays <= 3 ? 'warning' : 'muted' };
  }
  if (diffDays === 0) {
    return { message: 'Trial termina hoje', tone: 'warning' };
  }
  return { message: `Trial expirou há ${Math.abs(diffDays)} dia${Math.abs(diffDays) === 1 ? '' : 's'}`, tone: 'warning' };
}

export function OppsKanban({ grouped, loading, onMove, onMarkWon, onMarkLost, onEdit }: OppsKanbanProps) {
  const [dragging, setDragging] = useState<DragState>(null);
  const columns = useMemo(() => OPPORTUNITY_STAGE_ORDER.map((stage) => ({ stage, ...columnConfigs[stage] })), []);

  const handleDragStart = (opportunity: Opportunity, stage: OpportunityStage) => {
    setDragging({ id: opportunity.id, stage });
  };

  const handleDragEnd = () => {
    setDragging(null);
  };

  const handleDrop = async (stage: OpportunityStage) => {
    if (!dragging || dragging.stage === stage) {
      setDragging(null);
      return;
    }
    try {
      await onMove(dragging.id, stage);
    } finally {
      setDragging(null);
    }
  };

  const isDragging = (id: string) => dragging?.id === id;

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map(({ stage, title, accent }) => {
        const opportunities = grouped[stage] ?? [];
        const highlight = dragging && dragging.stage !== stage;
        return (
          <div key={stage} className="w-80 flex-shrink-0">
            <div
              className={cn(
                'flex h-full flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm transition-colors',
                accent,
                highlight && 'border-dashed',
              )}
              onDragOver={(event) => {
                event.preventDefault();
              }}
              onDrop={(event) => {
                event.preventDefault();
                void handleDrop(stage);
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
                  <p className="text-xs text-slate-500">{opportunityStageLabels[stage]}</p>
                </div>
                <Badge variant="secondary">{opportunities.length}</Badge>
              </div>

              <div className="flex flex-1 flex-col gap-3">
                {loading && opportunities.length === 0 ? (
                  <div className="space-y-3">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ) : null}

                {opportunities.map((opportunity) => {
                  const trial = trialMessage(opportunity.trialEndsAt);
                  return (
                    <Card
                      key={opportunity.id}
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer?.setData('text/plain', opportunity.id);
                        event.dataTransfer?.setDragImage?.(event.currentTarget, 140, 20);
                        handleDragStart(opportunity, stage);
                      }}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        'cursor-grab border-slate-200 shadow-sm transition-shadow hover:shadow-md',
                        isDragging(opportunity.id) && 'opacity-70',
                      )}
                    >
                      <CardContent className="flex flex-col gap-3 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-slate-900">{opportunity.companyName}</p>
                            <p className="text-sm font-medium text-emerald-600">
                              {currencyFormatter.format(opportunity.amount)}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className="rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                onClick={(event) => event.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem
                                onSelect={(event) => {
                                  event.preventDefault();
                                  if (onEdit) onEdit(opportunity);
                                }}
                                disabled={!onEdit}
                              >
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={(event) => {
                                  event.preventDefault();
                                  void onMarkWon(opportunity);
                                }}
                                disabled={opportunity.stage === 'WON'}
                              >
                                Efetivar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={(event) => {
                                  event.preventDefault();
                                  onMarkLost(opportunity);
                                }}
                                className="text-rose-600"
                              >
                                Marcar como perdida
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {trial ? (
                          <div
                            className={cn(
                              'flex items-center gap-2 rounded-md px-2 py-1 text-xs',
                              trial.tone === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600',
                            )}
                          >
                            <AlertTriangle className="h-3.5 w-3.5" />
                            <span>{trial.message}</span>
                          </div>
                        ) : null}

                        {opportunity.subdomain ? (
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Link2 className="h-3.5 w-3.5" />
                            <span>{`${opportunity.subdomain}.noahomni.com.br`}</span>
                          </div>
                        ) : null}

                        {opportunity.tags.length ? (
                          <div className="flex flex-wrap gap-1">
                            {opportunity.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="border-slate-200 text-xs text-slate-600">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        ) : null}

                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{opportunity.contactName}</span>
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                            {ownerInitials(opportunity.ownerId)}
                          </div>
                        </div>

                        {opportunity.stage === 'LOST' && opportunity.lostReason ? (
                          <p className="text-xs text-rose-600">{opportunity.lostReason}</p>
                        ) : null}
                      </CardContent>
                    </Card>
                  );
                })}

                {!loading && opportunities.length === 0 ? (
                  <div className="rounded-md border border-dashed border-slate-200 bg-white/70 py-6 text-center text-sm text-slate-400">
                    Nenhuma oportunidade
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
