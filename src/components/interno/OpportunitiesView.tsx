import { useEffect, useMemo, useState } from 'react';
import { FileDown, Filter, LayoutGrid, Loader2, Plus, RotateCw, Search, Table2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { OppsKanban } from './opportunities/OppsKanban';
import { CreateOpportunityModal } from './opportunities/CreateOpportunityModal';
import { MarkOpportunityLostDialog } from './opportunities/MarkOpportunityLostDialog';
import { OppsTable } from './opportunities/OppsTable';
import Can from '@/auth/Can';
import { useOpportunities, opportunityStageLabels } from '@/hooks/useOpportunities';
import type { CreateOpportunityPayload, Opportunity, OpportunityStage } from '@/types/api';

export function OpportunitiesView() {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [lostTarget, setLostTarget] = useState<Opportunity | null>(null);
  const [lostLoading, setLostLoading] = useState(false);

  const { grouped, opportunities, loading, error, refetch, createOpportunity, moveOpportunity, markOpportunityLost } =
    useOpportunities(debouncedSearch);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 350);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  const total = useMemo(() => opportunities.length, [opportunities.length]);

  const handleCreateOpportunity = async (payload: CreateOpportunityPayload) => {
    try {
      await createOpportunity(payload);
      toast.success('Oportunidade criada com sucesso.');
      setIsCreateOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível criar a oportunidade.';
      toast.error(message);
    }
  };

  const handleMoveOpportunity = async (id: string, stage: OpportunityStage) => {
    try {
      await moveOpportunity(id, stage);
      if (stage === 'WON') {
        toast.success('Efetivada! O Financeiro foi acionado.');
      } else {
        toast.success(`Etapa atualizada para ${opportunityStageLabels[stage]}.`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível mover a oportunidade.';
      toast.error(message);
    }
  };

  const handleMarkWon = async (opportunity: Opportunity) => {
    await handleMoveOpportunity(opportunity.id, 'WON');
  };

  const handleConfirmLost = async (reason: string) => {
    if (!lostTarget) return;
    setLostLoading(true);
    try {
      await markOpportunityLost(lostTarget.id, reason);
      toast.success('Etapa atualizada para Perdida.');
      setLostTarget(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível atualizar a oportunidade.';
      toast.error(message);
    } finally {
      setLostLoading(false);
    }
  };

  const handleExport = () => {
    toast.info('Exportação disponível em breve.');
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    void refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Oportunidades / Pipeline de Vendas</h1>
          <p className="text-sm text-slate-500">Acompanhe o funil comercial e avance negociações com agilidade.</p>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Button variant={viewMode === 'kanban' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('kanban')}>
              <LayoutGrid className="mr-2 h-4 w-4" /> Kanban
            </Button>
            <Button variant={viewMode === 'table' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('table')}>
              <Table2 className="mr-2 h-4 w-4" /> Tabela
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCw className="mr-2 h-4 w-4" />} Atualizar
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <FileDown className="mr-2 h-4 w-4" /> Exportar
            </Button>
            <Can roles={['ADMIN', 'USER']}>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Nova Oportunidade
              </Button>
            </Can>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar por empresa, contato ou domínio"
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" /> Filtros
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            Limpar
          </Button>
          <div className="text-sm text-slate-500">Total: {total}</div>
        </div>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Erro ao carregar pipeline</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {viewMode === 'kanban' ? (
        <OppsKanban
          grouped={grouped}
          loading={loading}
          onMove={handleMoveOpportunity}
          onMarkWon={handleMarkWon}
          onMarkLost={(opportunity) => setLostTarget(opportunity)}
        />
      ) : (
        <OppsTable data={opportunities} loading={loading} />
      )}

      <CreateOpportunityModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateOpportunity}
      />

      <MarkOpportunityLostDialog
        open={lostTarget !== null}
        opportunityName={lostTarget?.companyName}
        loading={lostLoading}
        onClose={() => {
          if (!lostLoading) setLostTarget(null);
        }}
        onConfirm={handleConfirmLost}
      />
    </div>
  );
}
