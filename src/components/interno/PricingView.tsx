import { Plus, Edit, Trash } from 'lucide-react';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import Can from '@/auth/Can';
import { useAuth } from '@/auth/AuthContext';

const catalogItems = [
  { id: '1', name: 'Usuário', description: 'Licença de usuário do sistema', unit: 'por usuário', price: 45 },
  { id: '2', name: 'WhatsApp', description: 'Conexão WhatsApp Business', unit: 'por conexão', price: 120 },
  { id: '3', name: 'Instagram', description: 'Conexão Instagram Direct', unit: 'por conexão', price: 80 },
  { id: '4', name: 'Facebook', description: 'Conexão Facebook Messenger', unit: 'por conexão', price: 80 },
  { id: '5', name: 'WABA', description: 'WhatsApp Business API', unit: 'por conexão', price: 200 },
  { id: '6', name: 'Módulo Campanha', description: 'Sistema de campanhas de marketing', unit: 'fixo', price: 150 },
  { id: '7', name: 'Módulo CRM', description: 'Customer Relationship Management', unit: 'fixo', price: 100 },
  { id: '8', name: 'Módulo VOIP', description: 'Sistema de telefonia VoIP', unit: 'fixo', price: 180 },
  { id: '9', name: 'Módulo GLPI', description: 'Gestão de tickets e chamados', unit: 'fixo', price: 120 },
  { id: '10', name: 'Setup', description: 'Taxa de implantação inicial', unit: 'único', price: 500 },
];

const discountPolicies = [
  { role: 'Vendas', maxDiscount: 15 },
  { role: 'Gestor Vendas', maxDiscount: 25 },
  { role: 'Admin Noah', maxDiscount: 100 },
];

export function PricingView() {
  const { hasRole } = useAuth();
  const canEdit = hasRole('ADMIN');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Valores & Preços</h1>
          <p className="text-sm text-gray-500">Catálogo de itens e regras de precificação</p>
        </div>
        <Can roles={['ADMIN']}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Item
          </Button>
        </Can>
      </div>

      <Tabs defaultValue="catalog">
        <TabsList>
          <TabsTrigger value="catalog">Catálogo de Itens</TabsTrigger>
          <TabsTrigger value="discount">Política de Desconto</TabsTrigger>
          <TabsTrigger value="taxes">Impostos/Taxas</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog">
          <div className="rounded-lg border border-gray-200 bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Preço Base (R$)</TableHead>
                  {canEdit && <TableHead className="w-24">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {catalogItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="text-sm text-gray-600">{item.description}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>R$ {item.price.toFixed(2)}</TableCell>
                    {canEdit && (
                      <TableCell>
                        <div className="flex gap-2">
                          <button className="rounded p-1 transition hover:bg-gray-100">
                            <Edit className="h-4 w-4 text-gray-600" />
                          </button>
                          <button className="rounded p-1 transition hover:bg-gray-100">
                            <Trash className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="discount">
          <Card>
            <CardHeader>
              <CardTitle>Política de Desconto por Perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {discountPolicies.map((policy, index) => (
                  <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="text-gray-900">{policy.role}</p>
                      <p className="text-sm text-gray-500">Desconto máximo permitido</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input type="number" defaultValue={policy.maxDiscount} className="w-20" disabled={!canEdit} />
                      <span className="text-gray-600">%</span>
                    </div>
                  </div>
                ))}

                <Can roles={['ADMIN']}>
                  <Button variant="outline" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Perfil
                  </Button>
                </Can>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="taxes">
          <Card>
            <CardHeader>
              <CardTitle>Impostos e Taxas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-12 text-center text-gray-500">
                <p className="mb-4">Configuração de impostos e taxas</p>
                <Can roles={['ADMIN']}>
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Taxa
                  </Button>
                </Can>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
