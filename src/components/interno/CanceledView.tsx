import { Download, Filter } from 'lucide-react';

import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { useCancellations } from '@/hooks/useCancellations';

const reasonColors: Record<string, string> = {
  'Preço elevado': 'bg-red-100 text-red-700',
  'Baixo uso': 'bg-yellow-100 text-yellow-700',
  'Fechamento': 'bg-gray-100 text-gray-700',
};

export function CanceledView() {
  const { cancellations, isLoading } = useCancellations();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Vendas Canceladas</h1>
          <p className="text-sm text-gray-500">Histórico de cancelamentos registrados</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" /> Filtros
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Exportar
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Oportunidade</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead>Data solicitação</TableHead>
              <TableHead>Notas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && cancellations.length === 0
              ? Array.from({ length: 4 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`} className="animate-pulse">
                    {Array.from({ length: 5 }).map((__, cell) => (
                      <TableCell key={cell}>
                        <div className="h-4 rounded bg-gray-100" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : cancellations.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.lead?.companyName ?? '—'}</TableCell>
                    <TableCell>{item.opportunity?.name ?? '—'}</TableCell>
                    <TableCell>
                      <Badge className={reasonColors[item.reason] || 'bg-slate-100 text-slate-700'}>
                        {item.reason}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(item.cancelledAt).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="max-w-md truncate text-sm text-gray-600">
                      {item.details ?? '—'}
                    </TableCell>
                  </TableRow>
                ))}

            {!isLoading && cancellations.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-6 text-center text-sm text-gray-500">
                  Nenhum cancelamento registrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
