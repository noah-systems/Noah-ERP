import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle, FileText, Paperclip, XCircle } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Badge } from '../../ui/badge';
import type { Lead, LeadStage } from '@/types/domain';

interface LeadDetailModalProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
  stageLabels: Record<LeadStage, string>;
}

function formatDate(date?: string | null) {
  if (!date) return '—';
  try {
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return date;
  }
}

export function LeadDetailModal({ lead, open, onClose, stageLabels }: LeadDetailModalProps) {
  if (!lead) return null;

  const activities = [
    {
      type: 'created',
      user: lead.owner?.name ?? 'Sistema',
      action: 'Lead criado',
      timestamp: lead.createdAt,
    },
    {
      type: 'stage',
      user: lead.owner?.name ?? 'Sistema',
      action: `Movido para ${stageLabels[lead.stage]}`,
      timestamp: lead.updatedAt,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle>{lead.companyName}</DialogTitle>
              <p className="mt-1 text-sm text-gray-500">
                {lead.segment ?? 'Segmento não informado'} • {lead.employees ?? '—'} funcionários
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => onClose()}>
                <XCircle className="mr-2 h-4 w-4" />
                Fechar
              </Button>
              <Button size="sm" variant="secondary">
                <CheckCircle className="mr-2 h-4 w-4" />
                Marcar como Qualificado
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="resumo" className="mt-4">
          <TabsList>
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="atividades">Atividades</TabsTrigger>
            <TabsTrigger value="anexos">Anexos</TabsTrigger>
          </TabsList>

          <TabsContent value="resumo" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="mb-3 text-sm text-gray-500">Informações da Empresa</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-xs text-gray-500">Razão Social</span>
                    <p className="text-gray-900">{lead.companyName}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Segmento</span>
                    <p className="text-gray-900">{lead.segment ?? '—'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Quantidade de Funcionários</span>
                    <p className="text-gray-900">{lead.employees ?? '—'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm text-gray-500">Informações de Contato</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-xs text-gray-500">Nome</span>
                    <p className="text-gray-900">{lead.contactName ?? '—'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Telefone</span>
                    <p className="text-gray-900">{lead.contactPhone ?? '—'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">E-mail</span>
                    <p className="text-gray-900">{lead.contactEmail ?? '—'}</p>
                  </div>
                </div>
              </div>

              <div className="col-span-2">
                <h3 className="mb-3 text-sm text-gray-500">Rastreamento</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-gray-500">Origem</span>
                    <p className="text-gray-900">
                      <Badge variant="secondary">{lead.origin ?? 'Não informado'}</Badge>
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Responsável</span>
                    <p className="text-gray-900">{lead.owner?.name ?? 'Sem responsável'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Etapa</span>
                    <p className="text-gray-900">{stageLabels[lead.stage]}</p>
                  </div>
                </div>
              </div>

              <div className="col-span-2 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-xs text-gray-500">Criado em</span>
                  <p className="text-gray-900">{formatDate(lead.createdAt)}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Atualizado em</span>
                  <p className="text-gray-900">{formatDate(lead.updatedAt)}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Oportunidades</span>
                  <p className="text-gray-900">{lead.opportunities?.length ?? 0}</p>
                </div>
              </div>

              {lead.notes && (
                <div className="col-span-2">
                  <h3 className="mb-3 text-sm text-gray-500">Observações</h3>
                  <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">{lead.notes}</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="atividades">
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={`${activity.type}-${index}`} className="flex gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
                    <FileText className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="text-gray-900">{activity.action}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {activity.user} • {formatDate(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="anexos">
            <div className="py-12 text-center">
              <Paperclip className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <p className="text-sm text-gray-500">Nenhum anexo ainda</p>
              <Button variant="outline" size="sm" className="mt-4">
                Adicionar Anexo
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
