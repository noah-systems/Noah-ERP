import { useState } from 'react';
import { Plus, Filter, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { OpportunitiesKanban } from './opportunities/OpportunitiesKanban';
import { CreateOpportunityModal } from './opportunities/CreateOpportunityModal';
import Can from '@/auth/Can';
import { USE_MOCK } from '@/lib/api';
import { MockDataNotice } from '@/components/MockDataNotice';

export function OpportunitiesView() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const creationAvailable = USE_MOCK;

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
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              disabled={!creationAvailable}
              title={!creationAvailable ? 'Em breve' : undefined}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Oportunidade
            </Button>
          </Can>
        </div>
      </div>

      {USE_MOCK ? (
        <OpportunitiesKanban />
      ) : (
        <MockDataNotice description="O pipeline será carregado automaticamente quando os dados reais estiverem disponíveis." />
      )}

      <CreateOpportunityModal open={isCreateModalOpen && creationAvailable} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  );
}
