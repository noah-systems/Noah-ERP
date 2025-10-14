import { useState } from 'react';
import { Plus, LayoutGrid, Table2, Filter, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { LeadsKanban } from './leads/LeadsKanban';
import { LeadsTable } from './leads/LeadsTable';
import { CreateLeadModal } from './leads/CreateLeadModal';

interface LeadsViewProps {
  userRole: string;
}

export function LeadsView({ userRole }: LeadsViewProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl text-gray-900">Leads</h1>
          <p className="text-gray-500">Gerencie e qualifique seus leads</p>
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
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Lead
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant={viewMode === 'kanban' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('kanban')}
        >
          <LayoutGrid className="w-4 h-4 mr-2" />
          Kanban
        </Button>
        <Button
          variant={viewMode === 'table' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('table')}
        >
          <Table2 className="w-4 h-4 mr-2" />
          Tabela
        </Button>
      </div>

      {viewMode === 'kanban' ? (
        <LeadsKanban userRole={userRole} />
      ) : (
        <LeadsTable userRole={userRole} />
      )}

      <CreateLeadModal 
        open={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
}
