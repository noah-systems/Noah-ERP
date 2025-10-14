import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Checkbox } from '../../ui/checkbox';
import { Lock, FileText, Calendar } from 'lucide-react';

interface Opportunity {
  id: string;
  company: string;
  value: number;
  contactName: string;
  owner: string;
  modules: string[];
  trialEndsIn?: number;
  createdAt: string;
  url?: string;
}

interface OpportunityDetailModalProps {
  opportunity: Opportunity | null;
  open: boolean;
  onClose: () => void;
  userRole: string;
}

const catalogItems = [
  { id: 'user', name: 'Usuário', price: 45, unit: 'por usuário' },
  { id: 'whatsapp', name: 'WhatsApp', price: 120, unit: 'por conexão' },
  { id: 'instagram', name: 'Instagram', price: 80, unit: 'por conexão' },
  { id: 'facebook', name: 'Facebook', price: 80, unit: 'por conexão' },
  { id: 'waba', name: 'WABA', price: 200, unit: 'por conexão' },
  { id: 'campanha', name: 'Módulo Campanha', price: 150, unit: 'fixo' },
  { id: 'crm', name: 'Módulo CRM', price: 100, unit: 'fixo' },
  { id: 'voip', name: 'Módulo VOIP', price: 180, unit: 'fixo' },
  { id: 'glpi', name: 'Módulo GLPI', price: 120, unit: 'fixo' },
  { id: 'setup', name: 'Setup', price: 500, unit: 'único' },
];

export function OpportunityDetailModal({ opportunity, open, onClose, userRole }: OpportunityDetailModalProps) {
  if (!opportunity) return null;

  const canViewHosting = userRole === 'admin' || userRole === 'suporte';
  const canViewFinancial = userRole === 'admin' || userRole === 'financeiro';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle>{opportunity.company}</DialogTitle>
              <p className="text-sm text-gray-500 mt-1">
                Valor: R$ {opportunity.value.toLocaleString('pt-BR')} • Responsável: {opportunity.owner}
              </p>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="cliente" className="mt-4">
          <TabsList>
            <TabsTrigger value="cliente">Dados do Cliente</TabsTrigger>
            <TabsTrigger value="conta">Informações da Conta</TabsTrigger>
            <TabsTrigger value="valores">Valores & Preços</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
            <TabsTrigger value="perda">Motivos de Perda</TabsTrigger>
          </TabsList>

          <TabsContent value="cliente" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Razão Social</Label>
                <Input defaultValue={opportunity.company} />
              </div>
              <div className="space-y-2">
                <Label>CNPJ</Label>
                <Input placeholder="00.000.000/0000-00" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Endereço</Label>
                <Input placeholder="Rua, número, bairro, cidade, estado" />
              </div>
              
              <div className="col-span-2">
                <h3 className="text-sm text-gray-700 mb-3">Contato Financeiro</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>E-mail Financeiro</Label>
                    <Input type="email" placeholder="financeiro@empresa.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Responsável Financeiro</Label>
                    <Input placeholder="Nome completo" />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone Financeiro</Label>
                    <Input placeholder="(00) 00000-0000" />
                  </div>
                </div>
              </div>

              <div className="col-span-2">
                <h3 className="text-sm text-gray-700 mb-3">Contato Principal</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>E-mail Contato</Label>
                    <Input type="email" defaultValue={`${opportunity.contactName.toLowerCase().replace(' ', '')}@empresa.com`} />
                  </div>
                  <div className="space-y-2">
                    <Label>Responsável Contato</Label>
                    <Input defaultValue={opportunity.contactName} />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone Contato</Label>
                    <Input placeholder="(00) 00000-0000" />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="conta" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>URL (Subdomínio)</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    defaultValue={opportunity.url || opportunity.company.toLowerCase().replace(/\s+/g, '')} 
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-500">.noahomni.com.br</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Qtd. de Usuários</Label>
                <Input type="number" defaultValue="10" />
              </div>

              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input type="number" defaultValue="1" />
              </div>

              <div className="space-y-2">
                <Label>Instagram</Label>
                <Input type="number" defaultValue="0" />
              </div>

              <div className="space-y-2">
                <Label>Facebook</Label>
                <Input type="number" defaultValue="0" />
              </div>

              <div className="space-y-2">
                <Label>WABA</Label>
                <Input type="number" defaultValue="0" />
              </div>

              <div className="col-span-2">
                <Label className="mb-3 block">Módulos</Label>
                <div className="grid grid-cols-4 gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="mod-campanha" defaultChecked />
                    <label htmlFor="mod-campanha" className="text-sm">Campanha</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="mod-crm" defaultChecked />
                    <label htmlFor="mod-crm" className="text-sm">CRM</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="mod-voip" />
                    <label htmlFor="mod-voip" className="text-sm">VOIP</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="mod-glpi" />
                    <label htmlFor="mod-glpi" className="text-sm">GLPI</label>
                  </div>
                </div>
              </div>

              <div className="col-span-2 space-y-2">
                <Label className="flex items-center gap-2">
                  Hospedagem (Fornecedor)
                  {!canViewHosting && (
                    <Badge variant="secondary" className="text-xs">
                      <Lock className="w-3 h-3 mr-1" />
                      Admin/Suporte
                    </Badge>
                  )}
                </Label>
                <Input disabled={!canViewHosting} placeholder="Selecione o fornecedor" />
              </div>

              <div className="col-span-2 space-y-2">
                <Label className="flex items-center gap-2">
                  IP do Servidor
                  {!canViewHosting && (
                    <Badge variant="secondary" className="text-xs">
                      <Lock className="w-3 h-3 mr-1" />
                      Admin/Suporte
                    </Badge>
                  )}
                </Label>
                <Input disabled={!canViewHosting} placeholder="000.000.000.000" />
              </div>

              <div className="space-y-2">
                <Label>Início Trial</Label>
                <Input type="date" />
              </div>

              <div className="space-y-2">
                <Label>Data de Efetivação</Label>
                <Input type="date" />
              </div>

              <div className="space-y-2">
                <Label>Data de Cancelamento</Label>
                <Input type="date" />
              </div>

              <div className="space-y-2">
                <Label>Dia Base de Cobrança</Label>
                <Input type="number" min="1" max="31" placeholder="1-31" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="valores" className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm text-gray-700 mb-4">Catálogo de Itens</h3>
              <div className="space-y-2">
                {catalogItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded border">
                    <div className="flex items-center gap-3">
                      <Checkbox id={`item-${item.id}`} />
                      <label htmlFor={`item-${item.id}`} className="text-sm">
                        {item.name}
                      </label>
                    </div>
                    <div className="text-sm text-gray-600">
                      R$ {item.price} <span className="text-xs text-gray-400">({item.unit})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>% Desconto</Label>
                <Input type="number" min="0" max="100" defaultValue="0" />
                <p className="text-xs text-gray-500">
                  Máximo permitido para seu perfil: 25%
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Subtotal</span>
                <span className="text-sm">R$ 1.000,00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Desconto (0%)</span>
                <span className="text-sm">R$ 0,00</span>
              </div>
              <div className="flex justify-between border-t border-blue-200 pt-2">
                <span className="text-gray-900">Total Mensal</span>
                <span className="text-gray-900">R$ 1.000,00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Setup (único)</span>
                <span className="text-sm text-gray-600">R$ 500,00</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline">Gerar Proposta (PDF)</Button>
              <Button>Enviar Proposta</Button>
            </div>
          </TabsContent>

          <TabsContent value="historico">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Oportunidade criada</p>
                  <p className="text-xs text-gray-500 mt-1">Sistema • {opportunity.createdAt}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Apresentação agendada para 20/10/2025</p>
                  <p className="text-xs text-gray-500 mt-1">{opportunity.owner} • {opportunity.createdAt}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="perda">
            <div className="text-center py-12">
              <p className="text-sm text-gray-500 mb-4">
                Esta oportunidade ainda não foi marcada como perdida
              </p>
              <Button variant="outline" size="sm">
                Marcar como Venda Perdida
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
