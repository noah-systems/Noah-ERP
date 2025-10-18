import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Badge } from '../../ui/badge';
import type { Opportunity } from '@/types/domain';
import { opportunityStageLabels } from '@/hooks/useOpportunities';

interface OpportunityDetailModalProps {
  opportunity: Opportunity | null;
  open: boolean;
  onClose: () => void;
}

function formatCurrency(value: number | null) {
  if (value == null) return '—';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  try {
    return format(new Date(value), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return value;
  }
}

export function OpportunityDetailModal({ opportunity, open, onClose }: OpportunityDetailModalProps) {
  if (!opportunity) return null;

  const lead = opportunity.lead;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle>{opportunity.name}</DialogTitle>
              <p className="mt-1 text-sm text-gray-500">
                {formatCurrency(opportunity.value)} • Responsável: {opportunity.owner?.name ?? '—'}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="resumo" className="mt-4">
          <TabsList>
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="atividades">Atividades</TabsTrigger>
          </TabsList>

          <TabsContent value="resumo" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="mb-3 text-sm text-gray-500">Empresa</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-xs text-gray-500">Cliente</span>
                    <p className="text-gray-900">{lead?.companyName ?? '—'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Contato</span>
                    <p className="text-gray-900">{opportunity.contactName ?? '—'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Etapa</span>
                    <p className="text-gray-900">{opportunityStageLabels[opportunity.stage]}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm text-gray-500">Detalhes</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-xs text-gray-500">Valor</span>
                    <p className="text-gray-900">{formatCurrency(opportunity.value)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Trial</span>
                    <p className="text-gray-900">{formatDate(opportunity.trialEndsAt)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Criado em</span>
                    <p className="text-gray-900">{formatDate(opportunity.createdAt)}</p>
                  </div>
                </div>
              </div>

              <div className="col-span-2">
                <h3 className="mb-3 text-sm text-gray-500">Módulos</h3>
                <div className="flex flex-wrap gap-2">
                  {opportunity.modules.length > 0 ? (
                    opportunity.modules.map((module) => (
                      <Badge key={module} variant="outline">
                        {module}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">Nenhum módulo informado.</span>
                  )}
                </div>
              </div>

              {opportunity.workspaceSlug && (
                <div className="col-span-2">
                  <h3 className="mb-3 text-sm text-gray-500">Ambiente</h3>
                  <p className="text-sm text-gray-700">
                    {opportunity.workspaceSlug}.noahomni.com.br
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="atividades">
            <p className="py-6 text-center text-sm text-gray-500">
              Histórico de atividades estará disponível em breve.
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
