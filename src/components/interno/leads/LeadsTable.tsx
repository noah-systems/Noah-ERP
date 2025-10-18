import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Badge } from '../../ui/badge';
import { MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import type { Lead } from '@/types/domain';
import { leadStageLabels } from '@/hooks/useLeads';

interface LeadsTableProps {
  leads: Lead[];
  isLoading?: boolean;
}

export function LeadsTable({ leads, isLoading }: LeadsTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
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
          {isLoading && leads.length === 0
            ? Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`} className="animate-pulse">
                  {Array.from({ length: 10 }).map((__, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <div className="h-4 rounded bg-gray-100" />
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="h-4 rounded bg-gray-100" />
                  </TableCell>
                </TableRow>
              ))
            : leads.map((lead) => (
                <TableRow key={lead.id} className="transition hover:bg-gray-50">
                  <TableCell>{lead.companyName}</TableCell>
                  <TableCell>{lead.segment ?? '—'}</TableCell>
                  <TableCell>{lead.employees ?? '—'}</TableCell>
                  <TableCell>{lead.contactName ?? '—'}</TableCell>
                  <TableCell>{lead.contactPhone ?? '—'}</TableCell>
                  <TableCell>{lead.contactEmail ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{lead.origin ?? 'Não informado'}</Badge>
                  </TableCell>
                  <TableCell>{lead.owner?.name ?? 'Sem responsável'}</TableCell>
                  <TableCell>
                    <Badge>{leadStageLabels[lead.stage]}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="rounded p-1 text-gray-400 transition hover:bg-gray-100">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Excluir</DropdownMenuItem>
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
