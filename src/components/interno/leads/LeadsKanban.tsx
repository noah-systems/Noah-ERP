import { useMemo, useState } from 'react';
import { MoreVertical, Tag } from 'lucide-react';

import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { LeadDetailModal } from './LeadDetailModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import type { Lead, LeadStage } from '@/types/domain';
import { leadStageLabels } from '@/hooks/useLeads';

interface LeadsKanbanProps {
  leads: Lead[];
  isLoading?: boolean;
  onMove: (params: { id: string; stage: LeadStage; position: number }) => Promise<unknown>;
}

const columns: Array<{ id: LeadStage; title: string; color: string }> = [
  { id: 'NUTRICAO', title: 'Nutrição', color: 'bg-emerald-50 border-emerald-200' },
  { id: 'QUALIFICADO', title: 'Qualificado', color: 'bg-sky-50 border-sky-200' },
  { id: 'NAO_QUALIFICADO', title: 'Não Qualificado', color: 'bg-slate-100 border-slate-200' },
];

const originColors: Record<string, string> = {
  'Google Ads': 'bg-blue-100 text-blue-700',
  Meta: 'bg-purple-100 text-purple-700',
  Manual: 'bg-gray-100 text-gray-700',
};

export function LeadsKanban({ leads, isLoading, onMove }: LeadsKanbanProps) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const groupedLeads = useMemo(() => {
    const base: Record<LeadStage, Lead[]> = {
      NUTRICAO: [],
      QUALIFICADO: [],
      NAO_QUALIFICADO: [],
    };
    leads.forEach((lead) => {
      base[lead.stage]?.push(lead);
    });
    (Object.keys(base) as LeadStage[]).forEach((stage) => {
      base[stage].sort((a, b) => a.order - b.order || a.companyName.localeCompare(b.companyName));
    });
    return base;
  }, [leads]);

  const handleMove = async (lead: Lead, stage: LeadStage) => {
    await onMove({ id: lead.id, stage, position: 0 });
  };

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => {
          const columnLeads = groupedLeads[column.id] ?? [];
          return (
            <div key={column.id} className="w-80 flex-shrink-0">
              <div className={`rounded-lg border-2 ${column.color} p-4`}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-700">{column.title}</h3>
                  <Badge variant="secondary">{columnLeads.length}</Badge>
                </div>

                {isLoading && columnLeads.length === 0 ? (
                  <div className="space-y-3">
                    {Array.from({ length: 2 }).map((_, index) => (
                      <div key={index} className="h-24 animate-pulse rounded-md bg-white/60" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {columnLeads.map((lead) => (
                      <Card
                        key={lead.id}
                        className="transition-shadow hover:shadow-md"
                        onClick={() => setSelectedLead(lead)}
                      >
                        <CardContent className="p-4">
                          <div className="mb-3 flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="mb-1 text-sm font-semibold text-slate-900">
                                {lead.companyName}
                              </h4>
                              <p className="text-xs text-slate-500">{lead.segment ?? '—'}</p>
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
                                <DropdownMenuItem onClick={() => setSelectedLead(lead)}>
                                  Ver detalhes
                                </DropdownMenuItem>
                                {lead.stage !== 'QUALIFICADO' && (
                                  <DropdownMenuItem onClick={() => handleMove(lead, 'QUALIFICADO')}>
                                    Mover para Qualificado
                                  </DropdownMenuItem>
                                )}
                                {lead.stage !== 'NUTRICAO' && (
                                  <DropdownMenuItem onClick={() => handleMove(lead, 'NUTRICAO')}>
                                    Voltar para Nutrição
                                  </DropdownMenuItem>
                                )}
                                {lead.stage !== 'NAO_QUALIFICADO' && (
                                  <DropdownMenuItem onClick={() => handleMove(lead, 'NAO_QUALIFICADO')}>
                                    Marcar como Não Qualificado
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="space-y-2 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">Contato:</span>
                              <span className="text-slate-900">{lead.contactName ?? '—'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">Funcionários:</span>
                              <span className="text-slate-900">{lead.employees ?? '—'}</span>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                            <Badge
                              variant="secondary"
                              className={lead.origin ? originColors[lead.origin] ?? 'bg-slate-100 text-slate-700' : ''}
                            >
                              <Tag className="mr-1 h-3 w-3" />
                              {lead.origin ?? 'Origem não informada'}
                            </Badge>
                            <span className="text-slate-500">
                              {lead.owner?.name ?? 'Sem responsável'}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {columnLeads.length === 0 && !isLoading && (
                      <div className="rounded border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                        Nenhum lead nesta etapa
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <LeadDetailModal
        lead={selectedLead}
        open={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
        stageLabels={leadStageLabels}
      />
    </>
  );
}
