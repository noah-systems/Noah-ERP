import { useState } from 'react';
import { Plus, LayoutGrid, Table2, RotateCw } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '../ui/button';
import { LeadsKanban } from './leads/LeadsKanban';
import { LeadsTable } from './leads/LeadsTable';
import { CreateLeadModal } from './leads/CreateLeadModal';
import Can from '@/auth/Can';
import { useLeads } from '@/hooks/useLeads';
import { ApiError } from '@/services/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { leadStageLabels } from '@/hooks/useLeads';

export function LeadsView() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const { grouped, leads, loading, error, createLead, moveLead, refetch } = useLeads();

  const handleCreateLead = async (payload: Parameters<typeof createLead>[0]) => {
    try {
      await createLead(payload);
      toast.success('Lead criado com sucesso.');
      setIsCreateModalOpen(false);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Não foi possível criar o lead.';
      toast.error(message);
    }
  };

  const handleMoveLead = async (leadId: string, stage: keyof typeof leadStageLabels) => {
    try {
      await moveLead(leadId, stage, 0);
      toast.success(`Lead movido para ${leadStageLabels[stage]}.`);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Não foi possível mover o lead.';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500">Gerencie e qualifique seus leads</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={loading}>
            <RotateCw className="mr-2 h-4 w-4" /> Atualizar
          </Button>
          <Can roles={['ADMIN', 'USER']}>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Lead
            </Button>
          </Can>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Falha ao carregar dados</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
        <LeadsKanban groupedLeads={grouped} loading={loading} onMove={handleMoveLead} />
      ) : (
        <LeadsTable leads={leads} loading={loading} />
      )}

      <CreateLeadModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateLead}
      />
    </div>
  );
}
