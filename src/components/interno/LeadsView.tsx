import { useEffect, useState } from 'react';
import { Filter, LayoutGrid, Loader2, Plus, RotateCw, Search, Table2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { LeadsKanban } from './leads/LeadsKanban';
import { LeadsTable } from './leads/LeadsTable';
import { CreateLeadModal } from './leads/CreateLeadModal';
import Can from '@/auth/Can';
import { useAuth } from '@/auth/AuthContext';
import { useLeads, leadStatusLabels } from '@/hooks/useLeads';
import type { LeadPayload, LeadStatus } from '@/types/api';

export function LeadsView() {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { user } = useAuth();
  const { grouped, leads, loading, error, createLead, moveLead, refetch } = useLeads(debouncedSearch);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const handleCreateLead = async (payload: LeadPayload) => {
    try {
      await createLead(payload);
      toast.success('Lead criado com sucesso.');
      setIsCreateModalOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível criar o lead.';
      toast.error(message);
    }
  };

  const handleMoveLead = async (leadId: string, status: LeadStatus) => {
    try {
      await moveLead(leadId, status);
      toast.success(`Lead movido para ${leadStatusLabels[status]}.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível mover o lead.';
      toast.error(message);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500">Gerencie e qualifique seus leads em tempo real.</p>
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
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCw className="mr-2 h-4 w-4" />}
              Atualizar
            </Button>
            <Can roles={['ADMIN', 'USER']}>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Novo Lead
              </Button>
            </Can>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Buscar por empresa ou contato"
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" size="sm">
            <Filter className="h-4 w-4" /> Filtros
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            Limpar
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Falha ao carregar dados</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {viewMode === 'kanban' ? (
        <LeadsKanban groupedLeads={grouped} loading={loading} onMove={handleMoveLead} />
      ) : (
        <LeadsTable leads={leads} loading={loading} />
      )}

      <CreateLeadModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateLead}
        defaultOwnerId={user?.id}
      />
    </div>
  );
}
