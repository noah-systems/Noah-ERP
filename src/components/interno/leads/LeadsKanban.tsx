import { useState } from 'react';
import { MoreVertical, Tag } from 'lucide-react';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { LeadDetailModal } from './LeadDetailModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';

interface Lead {
  id: string;
  company: string;
  segment: string;
  employees: number;
  contactName: string;
  phone: string;
  email: string;
  origin: 'Google Ads' | 'Meta' | 'Manual';
  owner: string;
  createdAt: string;
  notes?: string;
}

const mockLeads: Record<string, Lead[]> = {
  nutricao: [
    {
      id: '1',
      company: 'Empresa A Ltda',
      segment: 'Varejo',
      employees: 50,
      contactName: 'João Silva',
      phone: '(11) 98765-4321',
      email: 'joao@empresaa.com',
      origin: 'Google Ads',
      owner: 'Maria Santos',
      createdAt: '2025-10-10',
    },
    {
      id: '2',
      company: 'Tech Solutions',
      segment: 'Tecnologia',
      employees: 25,
      contactName: 'Ana Costa',
      phone: '(21) 99876-5432',
      email: 'ana@techsolutions.com',
      origin: 'Meta',
      owner: 'Carlos Oliveira',
      createdAt: '2025-10-12',
    },
  ],
  qualificado: [
    {
      id: '3',
      company: 'Distribuidora XYZ',
      segment: 'Distribuição',
      employees: 100,
      contactName: 'Pedro Alves',
      phone: '(11) 97654-3210',
      email: 'pedro@distribuidoraxyz.com',
      origin: 'Manual',
      owner: 'Maria Santos',
      createdAt: '2025-10-08',
    },
  ],
  naoQualificado: [
    {
      id: '4',
      company: 'Pequena Loja',
      segment: 'Varejo',
      employees: 3,
      contactName: 'José Souza',
      phone: '(11) 96543-2109',
      email: 'jose@pequeналoja.com',
      origin: 'Google Ads',
      owner: 'Carlos Oliveira',
      createdAt: '2025-10-05',
      notes: 'Empresa muito pequena, sem orçamento para a solução',
    },
  ],
};

const columns = [
  { id: 'nutricao', title: 'Nutrição', color: 'bg-yellow-100 border-yellow-300' },
  { id: 'qualificado', title: 'Qualificado', color: 'bg-green-100 border-green-300' },
  { id: 'naoQualificado', title: 'Não Qualificado', color: 'bg-gray-100 border-gray-300' },
];

const originColors = {
  'Google Ads': 'bg-blue-100 text-blue-700',
  'Meta': 'bg-purple-100 text-purple-700',
  'Manual': 'bg-gray-100 text-gray-700',
};

export function LeadsKanban() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-80">
            <div className={`rounded-lg border-2 ${column.color} p-4`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900">{column.title}</h3>
                <Badge variant="secondary">{mockLeads[column.id]?.length || 0}</Badge>
              </div>
              
              <div className="space-y-3">
                {mockLeads[column.id]?.map((lead) => (
                  <Card 
                    key={lead.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedLead(lead)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-sm text-gray-900 mb-1">{lead.company}</h4>
                          <p className="text-xs text-gray-500">{lead.segment}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <button className="p-1 hover:bg-gray-100 rounded">
                              <MoreVertical className="w-4 h-4 text-gray-400" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                            <DropdownMenuItem>Qualificar</DropdownMenuItem>
                            <DropdownMenuItem>Descartar</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Contato:</span>
                          <span className="text-gray-900">{lead.contactName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Funcionários:</span>
                          <span className="text-gray-900">{lead.employees}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <Badge className={originColors[lead.origin]} variant="secondary">
                          <Tag className="w-3 h-3 mr-1" />
                          {lead.origin}
                        </Badge>
                        <span className="text-xs text-gray-500">{lead.owner}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <LeadDetailModal
        lead={selectedLead}
        open={!!selectedLead}
        onClose={() => setSelectedLead(null)}
      />
    </>
  );
}
