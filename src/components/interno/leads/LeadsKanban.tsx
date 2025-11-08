import { useMemo, useState } from 'react';
import { MoreVertical } from 'lucide-react';

import { Badge } from '../../ui/badge';
import { Card, CardContent } from '../../ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { Skeleton } from '../../ui/skeleton';
import type { Lead, LeadStatus } from '@/types/api';
import { leadStatusLabels } from '@/hooks/useLeads';

const columnStyles: Record<LeadStatus, string> = {
  NURTURING: 'bg-emerald-50 border-emerald-200',
  QUALIFIED: 'bg-indigo-50 border-indigo-200',
  DISQUALIFIED: 'bg-slate-50 border-slate-200',
};

type LeadsKanbanProps = {
  groupedLeads: Record<LeadStatus, Lead[]>;
  loading?: boolean;
  onMove: (leadId: string, status: LeadStatus) => Promise<void> | void;
};

export function LeadsKanban({ groupedLeads, loading, onMove }: LeadsKanbanProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const statuses = useMemo(() => Object.keys(leadStatusLabels) as LeadStatus[], []);

  const handleDragStart = (leadId: string) => (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData('text/plain', leadId);
    event.dataTransfer.effectAllowed = 'move';
    setDraggingId(leadId);
  };

  const handleDragEnd = () => setDraggingId(null);

  const handleDrop = (status: LeadStatus) => async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const id = event.dataTransfer.getData('text/plain');
    if (id) {
      await onMove(id, status);
    }
    setDraggingId(null);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const renderSkeleton = (key: string) => (
    <Card key={`lead-skeleton-${key}`} className="border border-dashed">
      <CardContent className="space-y-3 p-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </CardContent>
    </Card>
  );

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {statuses.map((status) => {
        const leads = groupedLeads[status] ?? [];
        return (
          <div key={status} className="flex w-80 flex-shrink-0 flex-col">
            <div
              className={`flex h-full flex-col rounded-xl border p-4 shadow-sm ${columnStyles[status]}`}
              onDragOver={handleDragOver}
              onDrop={handleDrop(status)}
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-700">{leadStatusLabels[status]}</h3>
                  <p className="text-xs text-slate-500">{leads.length} leads</p>
                </div>
                <Badge variant="secondary">{leads.length}</Badge>
              </div>

              <div className="flex-1 space-y-3">
                {loading && leads.length === 0 ? (
                  <div className="space-y-3">
                    {Array.from({ length: 2 }).map((_, index) => renderSkeleton(`${status}-${index}`))}
                  </div>
                ) : leads.length === 0 ? (
                  <div className="rounded border border-dashed border-slate-300 bg-white/60 p-4 text-center text-xs text-slate-500">
                    Nenhum lead nesta etapa.
                  </div>
                ) : (
                  leads.map((lead) => (
                    <Card
                      key={lead.id}
                      draggable
                      onDragStart={handleDragStart(lead.id)}
                      onDragEnd={handleDragEnd}
                      className={`cursor-grab border-none shadow-none transition hover:shadow ${
                        draggingId === lead.id ? 'opacity-70' : ''
                      }`}
                    >
                      <CardContent className="space-y-3 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-semibold text-slate-800">{lead.companyName}</h4>
                            {lead.contactName && (
                              <p className="text-xs text-slate-600">{lead.contactName}</p>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="rounded p-1 text-slate-400 transition hover:bg-white hover:text-slate-600">
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {statuses
                                .filter((target) => target !== status)
                                .map((target) => (
                                  <DropdownMenuItem key={`${lead.id}-${target}`} onSelect={() => onMove(lead.id, target)}>
                                    Mover para {leadStatusLabels[target]}
                                  </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="space-y-1 text-xs text-slate-600">
                          {lead.email && <p>{lead.email}</p>}
                          {lead.phone && <p>{lead.phone}</p>}
                          {lead.source && (
                            <Badge variant="outline" className="mt-1 border-slate-200 text-xs">
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
