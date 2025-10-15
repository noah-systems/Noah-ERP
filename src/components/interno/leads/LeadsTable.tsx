import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Badge } from '../../ui/badge';
import { MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';

const mockLeadsData = [
  {
    id: '1',
    company: 'Empresa A Ltda',
    segment: 'Varejo',
    employees: 50,
    contactName: 'João Silva',
    phone: '(11) 98765-4321',
    email: 'joao@empresaa.com',
    origin: 'Google Ads',
    owner: 'Maria Santos',
    status: 'Nutrição',
    createdAt: '10/10/2025',
  },
  {
    id: '2',
    company: 'Tech Solutions',
    segment: 'Tecnologia',
    employees: 25,
    contactName: 'Ana Costa',
    phone: '(21) 99876-5432',
    email: 'ana@techsolutions.com',
    origin: 'Meta',
    owner: 'Carlos Oliveira',
    status: 'Nutrição',
    createdAt: '12/10/2025',
  },
  {
    id: '3',
    company: 'Distribuidora XYZ',
    segment: 'Distribuição',
    employees: 100,
    contactName: 'Pedro Alves',
    phone: '(11) 97654-3210',
    email: 'pedro@distribuidoraxyz.com',
    origin: 'Manual',
    owner: 'Maria Santos',
    status: 'Qualificado',
    createdAt: '08/10/2025',
  },
];

const statusColors: Record<string, string> = {
  'Nutrição': 'bg-yellow-100 text-yellow-700',
  'Qualificado': 'bg-green-100 text-green-700',
  'Não Qualificado': 'bg-gray-100 text-gray-700',
};

export function LeadsTable() {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Empresa</TableHead>
            <TableHead>Segmento</TableHead>
            <TableHead>Funcionários</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Origem</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockLeadsData.map((lead) => (
            <TableRow key={lead.id} className="cursor-pointer hover:bg-gray-50">
              <TableCell>{lead.company}</TableCell>
              <TableCell>{lead.segment}</TableCell>
              <TableCell>{lead.employees}</TableCell>
              <TableCell>{lead.contactName}</TableCell>
              <TableCell>{lead.phone}</TableCell>
              <TableCell>{lead.email}</TableCell>
              <TableCell>
                <Badge variant="secondary">{lead.origin}</Badge>
              </TableCell>
              <TableCell>{lead.owner}</TableCell>
              <TableCell>
                <Badge className={statusColors[lead.status]}>{lead.status}</Badge>
              </TableCell>
              <TableCell>{lead.createdAt}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                    <DropdownMenuItem>Qualificar</DropdownMenuItem>
                    <DropdownMenuItem>Editar</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Descartar</DropdownMenuItem>
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
