import { Plus, Download, MoreVertical } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useAuth } from '@/auth/AuthContext';
import { USE_MOCK } from '@/lib/api';
import { MockDataNotice } from '@/components/MockDataNotice';

const activeAccounts = [
  { id: '1', url: 'empresaativa1', company: 'Empresa Ativa 1 Ltda', users: 15, connections: 3, createdAt: '01/08/2025' },
  { id: '2', url: 'empresaativa2', company: 'Empresa Ativa 2 Ltda', users: 8, connections: 2, createdAt: '15/08/2025' },
  { id: '3', url: 'empresaativa3', company: 'Empresa Ativa 3 Ltda', users: 20, connections: 4, createdAt: '20/09/2025' },
];

const pendingAccounts = [
  { id: '1', url: 'novaconta1', company: 'Nova Conta 1 Ltda', users: 10, connections: 2, requestedAt: '10/10/2025' },
  { id: '2', url: 'novaconta2', company: 'Nova Conta 2 Ltda', users: 12, connections: 3, requestedAt: '12/10/2025' },
];

const upgradeDowngrade = [
  { id: '1', url: 'empresaupgrade', company: 'Empresa Upgrade Ltda', type: 'upgrade', from: '10 usuários', to: '15 usuários', requestedAt: '13/10/2025', status: 'pending' },
  { id: '2', url: 'empresadown', company: 'Empresa Downgrade Ltda', type: 'downgrade', from: '20 usuários', to: '15 usuários', requestedAt: '14/10/2025', status: 'completed' },
];

export function PartnerDashboard() {
  const { hasRole } = useAuth();
  const allowed = hasRole('ADMIN_NOAH', 'ADMIN_PARTNER');
  const canCreate = hasRole('ADMIN_NOAH', 'ADMIN_PARTNER');

  if (!allowed) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
        Você não possui acesso ao módulo de parceiros.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Painel do Parceiro</h1>
          <p className="text-sm text-gray-500">Gerencie suas contas e clientes</p>
        </div>
        <div className="flex gap-2">
          {canCreate && (
            <Button disabled={!USE_MOCK} title={!USE_MOCK ? 'Em breve' : undefined}>
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar Nova Conta
            </Button>
          )}
          <Button variant="outline" disabled={!USE_MOCK} title={!USE_MOCK ? 'Em breve' : undefined}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {USE_MOCK ? (
        <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ativos</CardTitle>
            <Badge variant="secondary">{activeAccounts.length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="max-h-[400px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>URL</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Usuários</TableHead>
                    <TableHead>Conexões</TableHead>
                    <TableHead>Data Criação</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell>
                        <span className="text-xs text-gray-600">{account.url}.noahomni.com.br</span>
                      </TableCell>
                      <TableCell>{account.company}</TableCell>
                      <TableCell>{account.users}</TableCell>
                      <TableCell>{account.connections}</TableCell>
                      <TableCell>{account.createdAt}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-700">Ativo</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="rounded p-1 hover:bg-gray-100">
                              <MoreVertical className="h-4 w-4 text-gray-400" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                            <DropdownMenuItem>Editar</DropdownMenuItem>
                            <DropdownMenuItem>Upgrade/Downgrade</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Solicitar cancelamento</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pendentes Criação</CardTitle>
            <Badge variant="secondary">{pendingAccounts.length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="max-h-[400px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>URL</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Usuários</TableHead>
                    <TableHead>Conexões</TableHead>
                    <TableHead>Data Solicitação</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell>
                        <span className="text-xs text-gray-600">{account.url}.noahomni.com.br</span>
                      </TableCell>
                      <TableCell>{account.company}</TableCell>
                      <TableCell>{account.users}</TableCell>
                      <TableCell>{account.connections}</TableCell>
                      <TableCell>{account.requestedAt}</TableCell>
                      <TableCell>
                        <Badge className="bg-yellow-100 text-yellow-700">Pendente</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="rounded p-1 hover:bg-gray-100">
                              <MoreVertical className="h-4 w-4 text-gray-400" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upgrade / Downgrade</CardTitle>
            <Badge variant="secondary">{upgradeDowngrade.length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="max-h-[400px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>URL</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>De</TableHead>
                    <TableHead>Para</TableHead>
                    <TableHead>Data Solicitação</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upgradeDowngrade.map((item) => (
                    <TableRow key={item.id}>
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
                      <TableCell>
                        <Badge className={item.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                          {item.status === 'completed' ? 'Concluído' : 'Pendente'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        </div>
      ) : (
        <MockDataNotice description="As contas de parceiros serão exibidas assim que a integração com a API for concluída." />
      )}
    </div>
  );
}
