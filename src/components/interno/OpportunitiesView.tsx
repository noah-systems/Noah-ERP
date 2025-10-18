import { useCallback, useState } from 'react';
import { Plus, Filter, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { OpportunitiesKanban } from './opportunities/OpportunitiesKanban';
import { CreateOpportunityModal } from './opportunities/CreateOpportunityModal';
import Can from '@/auth/Can';
import { useOpportunities } from '@/hooks/useOpportunities';

export function OpportunitiesView() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const {
    opportunities,
    isLoading,
    createOpportunity,
    creating,
    moveOpportunity,
  } = useOpportunities();

  const handleCreateOpportunity = useCallback(
    async (payload: Parameters<typeof createOpportunity>[0]) => {
      await createOpportunity(payload);
      setIsCreateModalOpen(false);
    },
    [createOpportunity]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Oportunidades / Pipeline de Vendas</h1>
          <p className="text-sm text-gray-500">Gerencie suas oportunidades de vendas</p>
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
              Nova Oportunidade
            </Button>
          </Can>
        </div>
      </div>

      <OpportunitiesKanban
        opportunities={opportunities}
        isLoading={isLoading}
        onMove={moveOpportunity}
      />

      <CreateOpportunityModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateOpportunity}
        submitting={creating}
      />
    </div>
  );
}
