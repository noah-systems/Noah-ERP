import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Badge } from '../../ui/badge';
import { CheckCircle, XCircle, FileText, Paperclip } from 'lucide-react';

interface Lead {
  id: string;
  company: string;
  segment: string;
  employees: number;
  contactName: string;
  phone: string;
  email: string;
  origin: string;
  owner: string;
  createdAt: string;
  notes?: string;
}

interface LeadDetailModalProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
}

export function LeadDetailModal({ lead, open, onClose }: LeadDetailModalProps) {
  if (!lead) return null;

  const activities = [
    { type: 'created', user: 'Sistema', action: 'Lead criado', date: lead.createdAt, time: '14:30' },
    { type: 'note', user: lead.owner, action: 'Adicionou nota: "Cliente interessado em módulo CRM"', date: lead.createdAt, time: '15:45' },
    { type: 'moved', user: lead.owner, action: 'Moveu de Nutrição para Qualificado', date: lead.createdAt, time: '16:20' },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle>{lead.company}</DialogTitle>
              <p className="text-sm text-gray-500 mt-1">{lead.segment} • {lead.employees} funcionários</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <XCircle className="w-4 h-4 mr-2" />
                Descartar
              </Button>
              <Button size="sm">
                <CheckCircle className="w-4 h-4 mr-2" />
                Qualificar
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
                <h3 className="text-sm text-gray-500 mb-3">Informações da Empresa</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-gray-500">Razão Social</span>
                    <p className="text-sm">{lead.company}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Segmento</span>
                    <p className="text-sm">{lead.segment}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Quantidade de Funcionários</span>
                    <p className="text-sm">{lead.employees}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm text-gray-500 mb-3">Informações de Contato</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-gray-500">Nome</span>
                    <p className="text-sm">{lead.contactName}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Telefone</span>
                    <p className="text-sm">{lead.phone}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">E-mail</span>
                    <p className="text-sm">{lead.email}</p>
                  </div>
                </div>
              </div>

              <div className="col-span-2">
                <h3 className="text-sm text-gray-500 mb-3">Rastreamento</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-xs text-gray-500">Origem</span>
                    <p className="text-sm">
                      <Badge variant="secondary">{lead.origin}</Badge>
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Responsável</span>
                    <p className="text-sm">{lead.owner}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Criado em</span>
                    <p className="text-sm">{lead.createdAt}</p>
                  </div>
                </div>
              </div>

              {lead.notes && (
                <div className="col-span-2">
                  <h3 className="text-sm text-gray-500 mb-3">Observações</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{lead.notes}</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="atividades">
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[color:rgba(168,230,15,0.14)]">
                    <FileText className="h-4 w-4 text-[var(--primary)]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.user} • {activity.date} às {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="anexos">
            <div className="text-center py-12">
              <Paperclip className="w-12 h-12 text-gray-300 mx-auto mb-4" />
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
