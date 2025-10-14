import { Plus, Edit, Trash } from 'lucide-react';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';

interface SettingsViewProps {
  userRole: string;
}

const leadStatuses = [
  { id: '1', name: 'Nutrição', color: '#EAB308', order: 1 },
  { id: '2', name: 'Qualificado', color: '#22C55E', order: 2 },
  { id: '3', name: 'Não Qualificado', color: '#6B7280', order: 3 },
];

const pipelineStages = [
  { id: '1', name: 'Negociação', order: 1 },
  { id: '2', name: 'Apresentação Agendada', order: 2 },
  { id: '3', name: 'Proposta Enviada', order: 3 },
  { id: '4', name: 'Trial', order: 4 },
  { id: '5', name: 'Vencimento Trial', order: 5 },
  { id: '6', name: 'Venda Ganha', order: 6 },
  { id: '7', name: 'Venda Perdida', order: 7 },
];

const hostingProviders = [
  { id: '1', name: 'AWS', address: 'us-east-1', ipTemplate: '54.XXX.XXX.XXX' },
  { id: '2', name: 'Digital Ocean', address: 'NYC3', ipTemplate: '167.XXX.XXX.XXX' },
  { id: '3', name: 'Google Cloud', address: 'us-central1', ipTemplate: '35.XXX.XXX.XXX' },
];

const integrations = [
  { id: '1', name: 'Google Ads', status: 'connected', account: 'noah@ads.google.com' },
  { id: '2', name: 'Meta Ads', status: 'connected', account: 'noah@business.facebook.com' },
  { id: '3', name: 'RD Station', status: 'disconnected', account: '-' },
];

export function SettingsView({ userRole }: SettingsViewProps) {
  const canEdit = userRole === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl text-gray-900">Configurações</h1>
          <p className="text-gray-500">Configure o sistema Noah ERP</p>
        </div>
      </div>

      <Tabs defaultValue="statuses">
        <TabsList>
          <TabsTrigger value="statuses">Status de Lead</TabsTrigger>
          <TabsTrigger value="stages">Etapas do Pipeline</TabsTrigger>
          <TabsTrigger value="providers">Fornecedores</TabsTrigger>
          <TabsTrigger value="users">Usuários & Perfis</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
        </TabsList>

        <TabsContent value="statuses">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Status de Lead</CardTitle>
              {canEdit && (
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Status
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Cor</TableHead>
                    <TableHead>Ordem</TableHead>
                    {canEdit && <TableHead className="w-24">Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leadStatuses.map((status) => (
                    <TableRow key={status.id}>
                      <TableCell>{status.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded border" 
                            style={{ backgroundColor: status.color }}
                          />
                          <span className="text-sm text-gray-600">{status.color}</span>
                        </div>
                      </TableCell>
                      <TableCell>{status.order}</TableCell>
                      {canEdit && (
                        <TableCell>
                          <div className="flex gap-2">
                            <button className="p-1 hover:bg-gray-100 rounded">
                              <Edit className="w-4 h-4 text-gray-600" />
                            </button>
                            <button className="p-1 hover:bg-gray-100 rounded">
                              <Trash className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stages">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Etapas do Pipeline de Vendas</CardTitle>
              {canEdit && (
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Etapa
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Ordem</TableHead>
                    {canEdit && <TableHead className="w-24">Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pipelineStages.map((stage) => (
                    <TableRow key={stage.id}>
                      <TableCell>{stage.name}</TableCell>
                      <TableCell>{stage.order}</TableCell>
                      {canEdit && (
                        <TableCell>
                          <div className="flex gap-2">
                            <button className="p-1 hover:bg-gray-100 rounded">
                              <Edit className="w-4 h-4 text-gray-600" />
                            </button>
                            <button className="p-1 hover:bg-gray-100 rounded">
                              <Trash className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Fornecedores de Hospedagem</CardTitle>
              {canEdit && (
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Fornecedor
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Endereço/Região</TableHead>
                    <TableHead>Template IP</TableHead>
                    {canEdit && <TableHead className="w-24">Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hostingProviders.map((provider) => (
                    <TableRow key={provider.id}>
                      <TableCell>{provider.name}</TableCell>
                      <TableCell>{provider.address}</TableCell>
                      <TableCell>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {provider.ipTemplate}
                        </code>
                      </TableCell>
                      {canEdit && (
                        <TableCell>
                          <div className="flex gap-2">
                            <button className="p-1 hover:bg-gray-100 rounded">
                              <Edit className="w-4 h-4 text-gray-600" />
                            </button>
                            <button className="p-1 hover:bg-gray-100 rounded">
                              <Trash className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Usuários e Perfis</CardTitle>
              {canEdit && (
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Usuário
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <p>Gerenciamento de usuários e permissões</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integrações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations.map((integration) => (
                  <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="text-gray-900">{integration.name}</p>
                      <p className="text-sm text-gray-500">{integration.account}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={integration.status === 'connected' ? 'default' : 'secondary'}
                        className={integration.status === 'connected' ? 'bg-green-600' : ''}
                      >
                        {integration.status === 'connected' ? 'Conectado' : 'Desconectado'}
                      </Badge>
                      {canEdit && (
                        <Button size="sm" variant="outline">
                          {integration.status === 'connected' ? 'Configurar' : 'Conectar'}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
