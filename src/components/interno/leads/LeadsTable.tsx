import { MoreVertical } from 'lucide-react';

import { Badge } from '../../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import type { Lead } from '@/types/api';
import { leadStageLabels } from '@/hooks/useLeads';

type LeadsTableProps = {
  leads: Lead[];
  loading?: boolean;
};

const dateFormatter = new Intl.DateTimeFormat('pt-BR');

export function LeadsTable({ leads, loading }: LeadsTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Empresa</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Origem</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && leads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-sm text-slate-500">
                Carregando…
              </TableCell>
            </TableRow>
          ) : leads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-sm text-slate-400">
                Nenhum lead cadastrado até o momento.
              </TableCell>
            </TableRow>
          ) : (
            leads.map((lead) => {
              const createdAt = dateFormatter.format(new Date(lead.createdAt));
              return (
                <TableRow key={lead.id} className="hover:bg-slate-50">
                  <TableCell>{lead.company || lead.name}</TableCell>
                  <TableCell>{lead.name}</TableCell>
                  <TableCell>{lead.phone || '—'}</TableCell>
                  <TableCell>{lead.email || '—'}</TableCell>
                  <TableCell>
                    {lead.source ? (
                      <Badge variant="secondary" className="font-normal">
                        {lead.source}
                      </Badge>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{leadStageLabels[lead.stage]}</Badge>
                  </TableCell>
                  <TableCell>{createdAt}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem disabled>Ver detalhes</DropdownMenuItem>
                        <DropdownMenuItem disabled>Editar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
