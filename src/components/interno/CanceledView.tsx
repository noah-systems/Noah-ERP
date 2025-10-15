import { Filter, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';

const mockCanceled = [
  {
    id: '1',
    client: 'Empresa Teste A',
    subdomain: 'empresateste',
    reason: 'Preço elevado',
    requestDate: '01/09/2025',
    effectiveDate: '30/09/2025',
    responsible: 'João Suporte',
    notes: 'Cliente informou que encontrou solução mais barata',
  },
  {
    id: '2',
    client: 'Tech Services Ltda',
    subdomain: 'techservices',
    reason: 'Baixo uso da plataforma',
    requestDate: '15/09/2025',
    effectiveDate: '15/10/2025',
    responsible: 'Maria Suporte',
    notes: 'Cliente não conseguiu engajar equipe',
  },
  {
    id: '3',
    client: 'Comércio Digital',
    subdomain: 'comerciodigital',
    reason: 'Fechamento da empresa',
    requestDate: '20/09/2025',
    effectiveDate: '20/09/2025',
    responsible: 'João Suporte',
    notes: 'Empresa encerrou atividades',
  },
];

const reasonColors: Record<string, string> = {
  'Preço elevado': 'bg-red-100 text-red-700',
  'Baixo uso da plataforma': 'bg-yellow-100 text-yellow-700',
  'Fechamento da empresa': 'bg-gray-100 text-gray-700',
  'Insatisfação com suporte': 'bg-orange-100 text-orange-700',
};

export function CanceledView() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl text-gray-900">Vendas Canceladas</h1>
          <p className="text-gray-500">Histórico de cancelamentos e motivos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Subdomínio</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead>Data Solicitação</TableHead>
              <TableHead>Data Efetiva</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Observações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockCanceled.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.client}</TableCell>
                <TableCell>
                  <span className="text-xs text-gray-500">{item.subdomain}.noahomni.com.br</span>
                </TableCell>
                <TableCell>
                  <Badge className={reasonColors[item.reason] || 'bg-gray-100 text-gray-700'}>
                    {item.reason}
                  </Badge>
                </TableCell>
                <TableCell>{item.requestDate}</TableCell>
                <TableCell>{item.effectiveDate}</TableCell>
                <TableCell>{item.responsible}</TableCell>
                <TableCell className="max-w-xs truncate">{item.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
