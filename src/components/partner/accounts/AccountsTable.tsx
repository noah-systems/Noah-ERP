import { MoreVertical } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Badge } from '../../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';

interface AccountsTableProps {
  status: 'active' | 'pending' | 'upgrade' | 'canceled';
  userRole: string;
}

const mockData = {
  active: [
    { id: '1', url: 'conta1', company: 'Conta Ativa 1', users: 10, whatsapp: 1, instagram: 1, facebook: 0, waba: 0, createdAt: '01/08/2025' },
    { id: '2', url: 'conta2', company: 'Conta Ativa 2', users: 15, whatsapp: 2, instagram: 0, facebook: 1, waba: 0, createdAt: '15/08/2025' },
  ],
  pending: [
    { id: '3', url: 'novaconta', company: 'Nova Conta Pendente', users: 8, whatsapp: 1, instagram: 1, facebook: 0, waba: 0, requestedAt: '10/10/2025' },
  ],
  upgrade: [
    { id: '4', url: 'contaupgrade', company: 'Conta Upgrade', users: '10 → 15', change: 'Upgrade', requestedAt: '12/10/2025', status: 'pending' },
  ],
  canceled: [
    { id: '5', url: 'contacancelada', company: 'Conta Cancelada', users: 10, canceledAt: '01/10/2025', reason: 'Solicitação do cliente' },
  ],
};

export function AccountsTable({ status, userRole }: AccountsTableProps) {
  const data = mockData[status] || [];

  if (status === 'active' || status === 'pending') {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>URL</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Usuários</TableHead>
              <TableHead>Conexões</TableHead>
              <TableHead>{status === 'pending' ? 'Solicitado em' : 'Criado em'}</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((account: any) => (
              <TableRow key={account.id}>
                <TableCell>
                  <span className="text-xs text-gray-600">{account.url}.noahomni.com.br</span>
                </TableCell>
                <TableCell>{account.company}</TableCell>
                <TableCell>{account.users}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {account.whatsapp > 0 && (
                      <Badge variant="outline" className="text-xs">
                        WA: {account.whatsapp}
                      </Badge>
                    )}
                    {account.instagram > 0 && (
                      <Badge variant="outline" className="text-xs">
                        IG: {account.instagram}
                      </Badge>
                    )}
                    {account.facebook > 0 && (
                      <Badge variant="outline" className="text-xs">
                        FB: {account.facebook}
                      </Badge>
                    )}
                    {account.waba > 0 && (
                      <Badge variant="outline" className="text-xs">
                        WABA: {account.waba}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{account.createdAt || account.requestedAt}</TableCell>
                <TableCell>
                  <Badge className={status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                    {status === 'active' ? 'Ativo' : 'Pendente'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                      {status === 'active' && (
                        <>
                          <DropdownMenuItem>Editar</DropdownMenuItem>
                          <DropdownMenuItem>Upgrade/Downgrade</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Solicitar cancelamento</DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (status === 'upgrade') {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>URL</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Alteração</TableHead>
              <TableHead>Solicitado em</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((account: any) => (
              <TableRow key={account.id}>
                <TableCell>
                  <span className="text-xs text-gray-600">{account.url}.noahomni.com.br</span>
                </TableCell>
                <TableCell>{account.company}</TableCell>
                <TableCell>
                  <Badge className="bg-blue-100 text-blue-700">{account.change}</Badge>
                </TableCell>
                <TableCell className="text-sm">{account.users} usuários</TableCell>
                <TableCell>{account.requestedAt}</TableCell>
                <TableCell>
                  <Badge className={account.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}>
                    {account.status === 'pending' ? 'Pendente' : 'Realizado'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>URL</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Usuários</TableHead>
            <TableHead>Cancelado em</TableHead>
            <TableHead>Motivo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((account: any) => (
            <TableRow key={account.id}>
              <TableCell>
                <span className="text-xs text-gray-600">{account.url}.noahomni.com.br</span>
              </TableCell>
              <TableCell>{account.company}</TableCell>
              <TableCell>{account.users}</TableCell>
              <TableCell>{account.canceledAt}</TableCell>
              <TableCell>{account.reason}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
