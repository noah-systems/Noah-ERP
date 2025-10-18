import { format } from 'date-fns';
import { Calendar, CheckCircle, Clock } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import type { ImplementationStatus } from '@/types/domain';
import {
  ImplementationCreatePayload,
  useImplantacoes,
} from '@/hooks/useImplantacoes';
import { opportunityStageLabels } from '@/hooks/useOpportunities';

const statusColumns: Array<{
  id: ImplementationStatus;
  title: string;
  description: string;
  color: string;
  emptyMessage: string;
}> = [
  {
    id: 'SCHEDULED',
    title: 'Agendadas',
    description: 'Implantações com data marcada',
    color: 'bg-blue-50 border-blue-200',
    emptyMessage: 'Nenhuma implantação agendada',
  },
  {
    id: 'COMPLETED',
    title: 'Concluídas',
    description: 'Implantações finalizadas',
    color: 'bg-emerald-50 border-emerald-200',
    emptyMessage: 'Nenhuma implantação concluída',
  },
  {
    id: 'CANCELLED',
    title: 'Canceladas',
    description: 'Implantações canceladas',
    color: 'bg-rose-50 border-rose-200',
    emptyMessage: 'Nenhum cancelamento registrado',
  },
];

interface ScheduleFormValues extends ImplementationCreatePayload {}

export function ImplementationView() {
  const {
    implementations,
    isLoading,
    createImplementation,
    creating,
    updateImplementation,
  } = useImplantacoes();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const { register, handleSubmit, reset } = useForm<ScheduleFormValues>();

  const grouped = useMemo(() => {
    return statusColumns.reduce(
      (acc, column) => {
        acc[column.id] = implementations.filter((impl) => impl.status === column.id);
        return acc;
      },
      {} as Record<ImplementationStatus, typeof implementations>
    );
  }, [implementations]);

  const openScheduleModal = (opportunityId?: string) => {
    setSelectedOpportunityId(opportunityId ?? null);
    reset({
      opportunityId: opportunityId ?? '',
      scheduledFor: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const onSubmit = handleSubmit(async (values) => {
    await createImplementation({
      opportunityId: values.opportunityId,
      scheduledFor: values.scheduledFor,
      notes: values.notes,
    });
    setIsModalOpen(false);
    reset({ opportunityId: '', scheduledFor: '', notes: '' });
  });

  const markAsCompleted = async (id: string) => {
    await updateImplementation({
      id,
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Implantação</h1>
          <p className="text-sm text-gray-500">Acompanhe o agendamento e execução das implantações</p>
        </div>
        <Button onClick={() => openScheduleModal()}>
          <Calendar className="mr-2 h-4 w-4" /> Agendar implantação
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {statusColumns.map((column) => {
          const items = grouped[column.id] ?? [];
          return (
            <div key={column.id} className="w-96 flex-shrink-0">
              <div className={`rounded-lg border-2 ${column.color} p-4`}>
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700">{column.title}</h3>
                    <p className="text-xs text-slate-500">{column.description}</p>
                  </div>
                  <Badge variant="secondary">{items.length}</Badge>
                </div>

                {isLoading && items.length === 0 ? (
                  <div className="space-y-3">
                    {Array.from({ length: 2 }).map((_, index) => (
                      <div key={index} className="h-24 animate-pulse rounded-md bg-white/60" />
                    ))}
                  </div>
                ) : items.length === 0 ? (
                  <div className="rounded border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                    {column.emptyMessage}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((implementation) => (
                      <Card key={implementation.id}>
                        <CardContent className="space-y-3 p-4 text-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="font-semibold text-slate-900">
                                {implementation.opportunity.name}
                              </h4>
                              {implementation.opportunity.lead?.companyName && (
                                <p className="text-xs text-slate-500">
                                  {implementation.opportunity.lead.companyName}
                                </p>
                              )}
                            </div>
                            <Badge variant="outline">{opportunityStageLabels[implementation.opportunity.stage]}</Badge>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Clock className="h-4 w-4" />
                            <span>
                              Agendado para {format(new Date(implementation.scheduledFor), 'dd/MM/yyyy HH:mm')}
                            </span>
                          </div>

                          {implementation.notes && (
                            <div className="rounded-md bg-slate-50 p-2 text-xs text-slate-600">
                              {implementation.notes}
                            </div>
                          )}

                          {column.id === 'SCHEDULED' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => openScheduleModal(implementation.opportunity.id)}
                              >
                                <Calendar className="mr-2 h-4 w-4" /> Reagendar
                              </Button>
                              <Button
                                size="sm"
                                className="flex-1"
                                onClick={() => markAsCompleted(implementation.id)}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" /> Marcar como concluída
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendar implantação</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="opportunityId">ID da oportunidade</Label>
              <Input
                id="opportunityId"
                placeholder="insira o ID da oportunidade"
                defaultValue={selectedOpportunityId ?? ''}
                {...register('opportunityId', { required: true })}
                disabled={creating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduledFor">Data e hora</Label>
              <Input id="scheduledFor" type="datetime-local" {...register('scheduledFor', { required: true })} disabled={creating} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Input id="notes" {...register('notes')} placeholder="Informações adicionais" disabled={creating} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={creating}>
                Cancelar
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? 'Agendando...' : 'Agendar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
