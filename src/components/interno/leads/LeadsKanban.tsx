import { MoreVertical, Tag } from 'lucide-react';

import { Badge } from '../../ui/badge';
import { Card, CardContent } from '../../ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import type { Lead, LeadStage } from '@/types/api';
import { leadStageLabels } from '@/hooks/useLeads';

type LeadsKanbanProps = {
  groupedLeads: Record<LeadStage, Lead[]>;
  loading?: boolean;
  onMove: (leadId: string, stage: LeadStage) => Promise<void> | void;
};

const columnStyles: Record<LeadStage, string> = {
  NUTRICAO: 'bg-[#f1f8f5] border-[#c1e5d1]',
  QUALIFICADO: 'bg-[#f5f4ff] border-[#d8d4ff]',
  NAO_QUALIFICADO: 'bg-[#f7f7f8] border-[#e0e0e5]',
};

const originColors: Record<string, string> = {
  inbound: 'bg-emerald-100 text-emerald-700',
  outbound: 'bg-blue-100 text-blue-700',
  evento: 'bg-purple-100 text-purple-700',
};

export function LeadsKanban({ groupedLeads, loading, onMove }: LeadsKanbanProps) {
  const orderedStages = Object.keys(leadStageLabels) as LeadStage[];
  const stages = orderedStages.filter((stage) => stage in groupedLeads);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {stages.map((stage) => {
        const leads = groupedLeads[stage] ?? [];
        const availableMoves = orderedStages.filter((item) => item !== stage);

        return (
          <div key={stage} className="flex w-80 flex-shrink-0 flex-col">
            <div className={`rounded-lg border ${columnStyles[stage] ?? 'bg-white'} p-4 shadow-sm`}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-700">{leadStageLabels[stage]}</h3>
                <Badge variant="secondary">{leads.length}</Badge>
              </div>

              <div className="space-y-3">
                {loading && leads.length === 0 ? (
                  <div className="rounded border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500">
                    Carregando…
                  </div>
                ) : leads.length === 0 ? (
                  <div className="rounded border border-dashed border-slate-200 p-4 text-center text-sm text-slate-400">
                    Nenhum lead nesta etapa
                  </div>
                ) : (
                  leads.map((lead) => (
                    <Card key={lead.id} className="shadow-none transition hover:shadow-sm">
                      <CardContent className="space-y-3 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="text-sm font-medium text-slate-800">
                              {lead.company || lead.name}
                            </h4>
                            {lead.email && (
                              <p className="text-xs text-slate-500">{lead.email}</p>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-600">
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {availableMoves.map((target) => (
                                <DropdownMenuItem
                                  key={`${lead.id}-${target}`}
                                  onSelect={() => onMove(lead.id, target)}
                                >
                                  Mover para {leadStageLabels[target]}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="text-xs text-slate-600">
                          {lead.phone && <p>Telefone: {lead.phone}</p>}
                          {lead.source && (
                            <Badge
                              variant="outline"
                              className={`mt-2 border-transparent ${
                                originColors[lead.source.toLowerCase()] ?? 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              <Tag className="mr-1 h-3 w-3" />
                              {lead.source}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
