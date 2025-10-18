import { useMemo, useState } from 'react';
import { Plus, RotateCw } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '../ui/button';
import { OpportunitiesKanban } from './opportunities/OpportunitiesKanban';
import { CreateOpportunityModal } from './opportunities/CreateOpportunityModal';
import Can from '@/auth/Can';
import { useOpportunities, opportunityStageLabels } from '@/hooks/useOpportunities';
import { useLeads } from '@/hooks/useLeads';
import { ApiError } from '@/services/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function OpportunitiesView() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { grouped, loading, error, createOpportunity, moveOpportunity, refetch } = useOpportunities();
  const { leads } = useLeads();

  const leadOptions = useMemo(
    () =>
      leads.map((lead) => ({
        id: lead.id,
        label: lead.company || lead.name,
      })),
    [leads]
  );

  const handleCreateOpportunity = async (payload: Parameters<typeof createOpportunity>[0]) => {
    try {
      await createOpportunity(payload);
      toast.success('Oportunidade criada com sucesso.');
      setIsCreateModalOpen(false);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Não foi possível criar a oportunidade.';
      toast.error(message);
    }
  };

  const handleMoveOpportunity = async (id: string, stage: keyof typeof opportunityStageLabels) => {
    try {
      await moveOpportunity(id, stage, 0);
      toast.success(`Oportunidade movida para ${opportunityStageLabels[stage]}.`);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Não foi possível mover a oportunidade.';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Oportunidades / Pipeline de Vendas</h1>
          <p className="text-sm text-gray-500">Gerencie suas oportunidades de vendas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={loading}>
            <RotateCw className="mr-2 h-4 w-4" /> Atualizar
          </Button>
          <Can roles={['ADMIN_NOAH', 'SELLER']}>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Oportunidade
            </Button>
          </Can>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Erro ao carregar pipeline</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <OpportunitiesKanban groupedOpportunities={grouped} loading={loading} onMove={handleMoveOpportunity} />

      <CreateOpportunityModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateOpportunity}
        leads={leadOptions}
      />
    </div>
  );
}
