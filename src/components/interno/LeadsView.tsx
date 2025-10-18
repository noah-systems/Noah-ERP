import { useCallback, useState } from 'react';
import { Plus, LayoutGrid, Table2, Filter, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { LeadsKanban } from './leads/LeadsKanban';
import { LeadsTable } from './leads/LeadsTable';
import { CreateLeadModal } from './leads/CreateLeadModal';
import Can from '@/auth/Can';
import { useLeads } from '@/hooks/useLeads';

export type LeadsViewMode = 'kanban' | 'table';

export function LeadsView() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<LeadsViewMode>('kanban');
  const {
    leads,
    isLoading,
    createLead,
    creating,
    moveLead,
  } = useLeads();

  const handleCreateLead = useCallback(
    async (payload: Parameters<typeof createLead>[0]) => {
      await createLead(payload);
      setIsCreateModalOpen(false);
    },
    [createLead]
  );

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
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Lead
            </Button>
          </Can>
        </div>
      </div>

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

      {viewMode === 'kanban' ? (
        <LeadsKanban leads={leads} isLoading={isLoading} onMove={moveLead} />
      ) : (
        <LeadsTable leads={leads} isLoading={isLoading} />
      )}

      <CreateLeadModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateLead}
        submitting={creating}
      />
    </div>
  );
}
