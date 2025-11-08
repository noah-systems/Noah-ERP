import { Skeleton } from '../../ui/skeleton';
import { Badge } from '../../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import type { Lead } from '@/types/api';
import { leadStatusLabels } from '@/hooks/useLeads';

type LeadsTableProps = {
  leads: Lead[];
  loading?: boolean;
};

const dateFormatter = new Intl.DateTimeFormat('pt-BR');

export function LeadsTable({ leads, loading }: LeadsTableProps) {
  const renderSkeleton = (key: number) => (
    <TableRow key={`lead-skeleton-${key}`}>
      <TableCell colSpan={7}>
        <div className="flex items-center gap-4 py-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Empresa</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Segmento</TableHead>
            <TableHead>Colab.</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Origem</TableHead>
            <TableHead>Criado em</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && leads.length === 0
            ? Array.from({ length: 3 }).map((_, index) => renderSkeleton(index))
            : leads.length === 0
              ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-6 text-center text-sm text-slate-400">
                      Nenhum lead cadastrado ainda.
                    </TableCell>
                  </TableRow>
                )
              : leads.map((lead) => {
                  const createdAt = dateFormatter.format(new Date(lead.createdAt));
                  return (
                    <TableRow key={lead.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium">{lead.companyName}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{lead.contactName ?? '—'}</span>
                          {lead.email && <span className="text-xs text-slate-500">{lead.email}</span>}
                        </div>
                      </TableCell>
                      <TableCell>{lead.segment ?? '—'}</TableCell>
                      <TableCell>{lead.employeesCount ?? '—'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{leadStatusLabels[lead.status]}</Badge>
                      </TableCell>
                      <TableCell>{lead.source ?? '—'}</TableCell>
                      <TableCell>{createdAt}</TableCell>
                    </TableRow>
                  );
                })}
        </TableBody>
      </Table>
    </div>
  );
}
