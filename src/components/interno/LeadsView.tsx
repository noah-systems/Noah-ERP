import { useState } from 'react';
import { Plus, LayoutGrid, Table2, Filter, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { LeadsKanban } from './leads/LeadsKanban';
import { LeadsTable } from './leads/LeadsTable';
import { CreateLeadModal } from './leads/CreateLeadModal';
import Can from '@/auth/Can';
import { USE_MOCK } from '@/lib/api';
import { MockDataNotice } from '@/components/MockDataNotice';

export function LeadsView() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  const creationAvailable = USE_MOCK;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500">Gerencie e qualifique seus leads</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Can roles={['ADMIN_NOAH', 'SELLER']}>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              disabled={!creationAvailable}
              title={!creationAvailable ? 'Em breve' : undefined}
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Lead
            </Button>
          </Can>
        </div>
      </div>

      {USE_MOCK ? (
        <>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('kanban')}
            >
              <LayoutGrid className="mr-2 h-4 w-4" />
              Kanban
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <Table2 className="mr-2 h-4 w-4" />
              Tabela
            </Button>
          </div>

          {viewMode === 'kanban' ? <LeadsKanban /> : <LeadsTable />}
        </>
      ) : (
        <MockDataNotice description="A listagem de leads será exibida assim que a API estiver conectada." />
      )}

      <CreateLeadModal open={isCreateModalOpen && creationAvailable} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  );
}
