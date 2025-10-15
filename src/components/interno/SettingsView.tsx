import { Plus, Edit, Trash } from 'lucide-react';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import Can from '@/auth/Can';
import { useAuth } from '@/auth/AuthContext';

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

export function SettingsView() {
  const { hasRole } = useAuth();
  const canEdit = hasRole('ADMIN_NOAH');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Configurações</h1>
          <p className="text-sm text-gray-500">Configure o sistema Noah ERP</p>
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
              <Can roles={['ADMIN_NOAH']}>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Status
                </Button>
              </Can>
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
                          <div className="h-6 w-6 rounded border" style={{ backgroundColor: status.color }} />
                          <span className="text-sm text-gray-600">{status.color}</span>
                        </div>
                      </TableCell>
                      <TableCell>{status.order}</TableCell>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stages">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Etapas do Pipeline de Vendas</CardTitle>
              <Can roles={['ADMIN_NOAH']}>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Etapa
                </Button>
              </Can>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Fornecedores de Hospedagem</CardTitle>
              <Can roles={['ADMIN_NOAH']}>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Fornecedor
                </Button>
              </Can>
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
                        <code className="rounded bg-gray-100 px-2 py-1 text-sm">{provider.ipTemplate}</code>
                      </TableCell>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Usuários e Perfis</CardTitle>
              <Can roles={['ADMIN_NOAH']}>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Usuário
                </Button>
              </Can>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="text-gray-900">Admin Noah</p>
                    <p className="text-sm text-gray-500">Acesso total ao ERP</p>
                  </div>
                  <Badge>2 usuários</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="text-gray-900">Suporte Noah</p>
                    <p className="text-sm text-gray-500">Implantação e suporte técnico</p>
                  </div>
                  <Badge>5 usuários</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="text-gray-900">Time Comercial</p>
                    <p className="text-sm text-gray-500">Leads e oportunidades</p>
                  </div>
                  <Badge>12 usuários</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Integrações</CardTitle>
              <Can roles={['ADMIN_NOAH']}>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Integração
                </Button>
              </Can>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Integração</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Conta</TableHead>
                    {canEdit && <TableHead className="w-24">Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {integrations.map((integration) => (
                    <TableRow key={integration.id}>
                      <TableCell>{integration.name}</TableCell>
                      <TableCell>
                        <Badge variant={integration.status === 'connected' ? 'secondary' : 'outline'}>
                          {integration.status === 'connected' ? 'Conectado' : 'Desconectado'}
                        </Badge>
                      </TableCell>
                      <TableCell>{integration.account}</TableCell>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
