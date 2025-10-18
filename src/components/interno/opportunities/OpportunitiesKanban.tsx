import { differenceInCalendarDays } from 'date-fns';
import { useMemo, useState } from 'react';
import { AlertCircle, MoreVertical } from 'lucide-react';

import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { OpportunityDetailModal } from './OpportunityDetailModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import type { Opportunity, OpportunityStage } from '@/types/domain';
import { opportunityStageLabels } from '@/hooks/useOpportunities';

interface OpportunitiesKanbanProps {
  opportunities: Opportunity[];
  isLoading?: boolean;
  onMove: (params: { id: string; stage: OpportunityStage; position: number }) => Promise<unknown>;
}

const columns: Array<{ id: OpportunityStage; title: string; color: string }> = [
  { id: 'NEGOCIACAO', title: 'Negociação', color: 'bg-blue-50 border-blue-200' },
  { id: 'APRESENTACAO', title: 'Apresentação Agendada', color: 'bg-purple-50 border-purple-200' },
  { id: 'PROPOSTA', title: 'Proposta Enviada', color: 'bg-amber-50 border-amber-200' },
  { id: 'TRIAL', title: 'Trial', color: 'bg-cyan-50 border-cyan-200' },
  { id: 'VENC_TRIAL', title: 'Vencimento Trial', color: 'bg-orange-50 border-orange-200' },
  { id: 'VENDAS', title: 'Vendas', color: 'bg-emerald-50 border-emerald-200' },
];

export function OpportunitiesKanban({ opportunities, isLoading, onMove }: OpportunitiesKanbanProps) {
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);

  const grouped = useMemo(() => {
    const base: Record<OpportunityStage, Opportunity[]> = {
      NEGOCIACAO: [],
      APRESENTACAO: [],
      PROPOSTA: [],
      TRIAL: [],
      VENC_TRIAL: [],
      VENDAS: [],
    };
    opportunities.forEach((opportunity) => {
      base[opportunity.stage]?.push(opportunity);
    });
    (Object.keys(base) as OpportunityStage[]).forEach((stage) => {
      base[stage].sort((a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt));
    });
    return base;
  }, [opportunities]);

  const handleMove = async (opportunity: Opportunity, stage: OpportunityStage) => {
    await onMove({ id: opportunity.id, stage, position: 0 });
  };

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => {
          const items = grouped[column.id] ?? [];
          return (
            <div key={column.id} className="w-80 flex-shrink-0">
              <div className={`rounded-lg border-2 ${column.color} p-4`}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-700">{column.title}</h3>
                  <Badge variant="secondary">{items.length}</Badge>
                </div>

                {isLoading && items.length === 0 ? (
                  <div className="space-y-3">
                    {Array.from({ length: 2 }).map((_, index) => (
                      <div key={index} className="h-28 animate-pulse rounded-md bg-white/60" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((opportunity) => {
                      const trialDays = opportunity.trialEndsAt
                        ? differenceInCalendarDays(new Date(opportunity.trialEndsAt), new Date())
                        : null;
                      return (
                        <Card
                          key={opportunity.id}
                          className="transition-shadow hover:shadow-md"
                          onClick={() => setSelectedOpportunity(opportunity)}
                        >
                          <CardContent className="p-4">
                            <div className="mb-3 flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="mb-1 text-sm font-semibold text-slate-900">
                                  {opportunity.lead?.companyName ?? opportunity.name}
                                </h4>
                                <p className="text-sm font-medium text-emerald-700">
                                  {opportunity.value != null
                                    ? `R$ ${opportunity.value.toLocaleString('pt-BR', {
                                        minimumFractionDigits: 2,
                                      })}`
                                    : 'Valor não informado'}
                                </p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  asChild
                                  onClick={(event) => event.stopPropagation()}
                                >
                                  <button className="rounded p-1 text-slate-400 transition hover:bg-slate-100">
                                    <MoreVertical className="h-4 w-4" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setSelectedOpportunity(opportunity)}>
                                    Ver detalhes
                                  </DropdownMenuItem>
                                  {columns
                                    .filter((target) => target.id !== opportunity.stage)
                                    .map((target) => (
                                      <DropdownMenuItem
                                        key={target.id}
                                        onClick={() => handleMove(opportunity, target.id)}
                                      >
                                        Mover para {opportunityStageLabels[target.id]}
                                      </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            {trialDays !== null && (
                              <div className="mb-3 flex items-center gap-2 rounded bg-orange-50 p-2 text-xs text-orange-700">
                                <AlertCircle className="h-4 w-4" />
                                <span>
                                  Trial termina {trialDays >= 0 ? `em ${trialDays} dia(s)` : 'hoje'}
                                </span>
                              </div>
                            )}

                            {opportunity.workspaceSlug && (
                              <div className="mb-2 text-xs text-slate-500">
                                URL: {opportunity.workspaceSlug}.noahomni.com.br
                              </div>
                            )}

                            <div className="mb-3 flex flex-wrap gap-1">
                              {opportunity.modules.map((module, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {module}
                                </Badge>
                              ))}
                            </div>

                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span>{opportunity.contactName ?? 'Contato não informado'}</span>
                              <span>{opportunity.owner?.name ?? 'Sem responsável'}</span>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}

                    {items.length === 0 && !isLoading && (
                      <div className="rounded border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                        Nenhuma oportunidade nesta etapa
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <OpportunityDetailModal
        opportunity={selectedOpportunity}
        open={Boolean(selectedOpportunity)}
        onClose={() => setSelectedOpportunity(null)}
      />
    </>
  );
}
