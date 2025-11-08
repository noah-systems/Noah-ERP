import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Skeleton } from '../../ui/skeleton';
import { opportunityStageLabels, OPPORTUNITY_STAGE_ORDER } from '@/hooks/useOpportunities';
import type { Opportunity } from '@/types/api';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

type OppsTableProps = {
  data: Opportunity[];
  loading: boolean;
};

function formatDate(value: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('pt-BR');
}

export function OppsTable({ data, loading }: OppsTableProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-200 bg-white py-10 text-center text-sm text-slate-500">
        Nenhuma oportunidade encontrada.
      </div>
    );
  }

  const ordered = [...data].sort((a, b) => {
    const stageDiff = OPPORTUNITY_STAGE_ORDER.indexOf(a.stage) - OPPORTUNITY_STAGE_ORDER.indexOf(b.stage);
    if (stageDiff !== 0) return stageDiff;
    const updatedDiff = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    if (updatedDiff !== 0) return updatedDiff;
    return a.companyName.localeCompare(b.companyName);
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Empresa</TableHead>
            <TableHead>Etapa</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Trial</TableHead>
            <TableHead>Atualizado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ordered.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium text-slate-900">{item.companyName}</TableCell>
              <TableCell>{opportunityStageLabels[item.stage]}</TableCell>
              <TableCell>{currencyFormatter.format(item.amount)}</TableCell>
              <TableCell>{item.ownerId.slice(0, 8)}…</TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="text-sm text-slate-700">{item.contactName}</div>
                  <div className="text-xs text-slate-500">{item.contactEmail ?? '—'}</div>
                </div>
              </TableCell>
              <TableCell>{formatDate(item.trialEndsAt)}</TableCell>
              <TableCell>{formatDate(item.updatedAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
