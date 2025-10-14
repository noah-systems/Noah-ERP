import { useState } from 'react';
import { Plus, Filter, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { OpportunitiesKanban } from './opportunities/OpportunitiesKanban';
import { CreateOpportunityModal } from './opportunities/CreateOpportunityModal';

interface OpportunitiesViewProps {
  userRole: string;
}

export function OpportunitiesView({ userRole }: OpportunitiesViewProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl text-gray-900">Oportunidades / Pipeline de Vendas</h1>
          <p className="text-gray-500">Gerencie suas oportunidades de vendas</p>
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
            Nova Oportunidade
          </Button>
        </div>
      </div>

      <OpportunitiesKanban userRole={userRole} />

      <CreateOpportunityModal 
        open={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
}
