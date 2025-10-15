import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { useAuth } from '@/auth/AuthContext';

const pendingCreation = [
  { id: '1', partner: 'Parceiro A', url: 'novaconta1', company: 'Nova Conta 1', users: 10, modules: ['CRM', 'WhatsApp'], requestedAt: '10/10/2025', requestedBy: 'João Operações' },
  { id: '2', partner: 'Parceiro B', url: 'novaconta2', company: 'Nova Conta 2', users: 15, modules: ['CRM', 'Campanha'], requestedAt: '12/10/2025', requestedBy: 'Maria Operações' },
];

const pendingUpgrade = [
  { id: '1', partner: 'Parceiro A', url: 'conta1', company: 'Conta Upgrade', from: '10 usuários', to: '15 usuários', type: 'upgrade', requestedAt: '13/10/2025', requestedBy: 'João Operações' },
  { id: '2', partner: 'Parceiro C', url: 'conta2', company: 'Conta Downgrade', from: '20 usuários', to: '10 usuários', type: 'downgrade', requestedAt: '14/10/2025', requestedBy: 'Pedro Operações' },
];

const pendingCancelation = [
  { id: '1', partner: 'Parceiro B', url: 'contacancel', company: 'Conta para Cancelar', reason: 'Solicitação do cliente', requestedAt: '11/10/2025', requestedBy: 'Maria Operações' },
];

export function SupportPanel() {
  const { hasRole } = useAuth();
  const allowed = hasRole('ADMIN_NOAH', 'SUPPORT_NOAH');

  if (!allowed) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
        Você não possui acesso ao painel de suporte.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-gray-900">Painel de Suporte Noah</h1>
        <p className="text-gray-500">Gerencie solicitações pendentes dos parceiros</p>
      </div>

      <Tabs defaultValue="creation">
        <TabsList>
          <TabsTrigger value="creation">
            Criação de Contas
            <Badge variant="secondary" className="ml-2">{pendingCreation.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="upgrade">
            Upgrade/Downgrade
            <Badge variant="secondary" className="ml-2">{pendingUpgrade.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="cancelation">
            Cancelamentos
            <Badge variant="secondary" className="ml-2">{pendingCancelation.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="creation">
          <Card>
            <CardHeader>
              <CardTitle>Solicitações de Criação Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parceiro</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Usuários</TableHead>
                    <TableHead>Módulos</TableHead>
                    <TableHead>Solicitado em</TableHead>
                    <TableHead>Por</TableHead>
                    <TableHead className="w-32">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingCreation.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.partner}</TableCell>
                      <TableCell>
                        <span className="text-xs text-gray-600">{item.url}.noahomni.com.br</span>
                      </TableCell>
                      <TableCell>{item.company}</TableCell>
                      <TableCell>{item.users}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {item.modules.map((mod, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">{mod}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{item.requestedAt}</TableCell>
                      <TableCell className="text-sm">{item.requestedBy}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Criar
                          </Button>
                          <Button size="sm" variant="outline">
                            <XCircle className="w-3 h-3 mr-1" />
                            Recusar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upgrade">
          <Card>
            <CardHeader>
              <CardTitle>Solicitações de Upgrade/Downgrade Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parceiro</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>De</TableHead>
                    <TableHead>Para</TableHead>
                    <TableHead>Solicitado em</TableHead>
                    <TableHead>Por</TableHead>
                    <TableHead className="w-32">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingUpgrade.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.partner}</TableCell>
                      <TableCell>
                        <span className="text-xs text-gray-600">{item.url}.noahomni.com.br</span>
                      </TableCell>
                      <TableCell>{item.company}</TableCell>
                      <TableCell>
                        <Badge className={item.type === 'upgrade' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}>
                          {item.type === 'upgrade' ? 'Upgrade' : 'Downgrade'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{item.from}</TableCell>
                      <TableCell className="text-sm">{item.to}</TableCell>
                      <TableCell>{item.requestedAt}</TableCell>
                      <TableCell className="text-sm">{item.requestedBy}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Executar
                          </Button>
                          <Button size="sm" variant="outline">
                            <XCircle className="w-3 h-3 mr-1" />
                            Recusar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cancelation">
          <Card>
            <CardHeader>
              <CardTitle>Solicitações de Cancelamento Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parceiro</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Solicitado em</TableHead>
                    <TableHead>Por</TableHead>
                    <TableHead className="w-32">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingCancelation.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.partner}</TableCell>
                      <TableCell>
                        <span className="text-xs text-gray-600">{item.url}.noahomni.com.br</span>
                      </TableCell>
                      <TableCell>{item.company}</TableCell>
                      <TableCell>{item.reason}</TableCell>
                      <TableCell>{item.requestedAt}</TableCell>
                      <TableCell className="text-sm">{item.requestedBy}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Cancelar
                          </Button>
                          <Button size="sm" variant="outline">
                            <XCircle className="w-3 h-3 mr-1" />
                            Recusar
                          </Button>
                        </div>
                      </TableCell>
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
