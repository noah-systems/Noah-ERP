import { useState } from 'react';
import { MoreVertical, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { OpportunityDetailModal } from './OpportunityDetailModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';

interface Opportunity {
  id: string;
  company: string;
  value: number;
  contactName: string;
  owner: string;
  modules: string[];
  trialEndsIn?: number;
  createdAt: string;
  url?: string;
}

const mockOpportunities: Record<string, Opportunity[]> = {
  negociacao: [
    {
      id: '1',
      company: 'Distribuidora XYZ',
      value: 4500,
      contactName: 'Pedro Alves',
      owner: 'Maria Santos',
      modules: ['CRM', 'WhatsApp'],
      createdAt: '2025-10-08',
    },
  ],
  apresentacao: [
    {
      id: '2',
      company: 'Tech Solutions',
      value: 6800,
      contactName: 'Ana Costa',
      owner: 'Carlos Oliveira',
      modules: ['CRM', 'WhatsApp', 'Campanha'],
      createdAt: '2025-10-10',
    },
  ],
  proposta: [
    {
      id: '3',
      company: 'Varejo Plus',
      value: 8200,
      contactName: 'Roberto Lima',
      owner: 'Maria Santos',
      modules: ['CRM', 'WhatsApp', 'Instagram', 'Facebook'],
      createdAt: '2025-10-05',
    },
  ],
  trial: [
    {
      id: '4',
      company: 'Digital Store',
      value: 5900,
      contactName: 'Carla Mendes',
      owner: 'Carlos Oliveira',
      modules: ['CRM', 'WhatsApp', 'VOIP'],
      trialEndsIn: 3,
      createdAt: '2025-10-01',
      url: 'digitalstore',
    },
  ],
  vencimentoTrial: [
    {
      id: '5',
      company: 'Commerce Pro',
      value: 7500,
      contactName: 'Felipe Santos',
      owner: 'Maria Santos',
      modules: ['CRM', 'WhatsApp', 'Instagram'],
      trialEndsIn: 2,
      createdAt: '2025-09-28',
      url: 'commercepro',
    },
  ],
  vendaGanha: [],
  vendaPerdida: [],
};

const columns = [
  { id: 'negociacao', title: 'Negociação', color: 'bg-blue-100 border-blue-300' },
  { id: 'apresentacao', title: 'Apresentação Agendada', color: 'bg-purple-100 border-purple-300' },
  { id: 'proposta', title: 'Proposta Enviada', color: 'bg-yellow-100 border-yellow-300' },
  { id: 'trial', title: 'Trial', color: 'bg-cyan-100 border-cyan-300' },
  { id: 'vencimentoTrial', title: 'Vencimento Trial', color: 'bg-orange-100 border-orange-300' },
  { id: 'vendaGanha', title: 'Venda Ganha', color: 'bg-green-100 border-green-300' },
  { id: 'vendaPerdida', title: 'Venda Perdida', color: 'bg-red-100 border-red-300' },
];

export function OpportunitiesKanban() {
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-80">
            <div className={`rounded-lg border-2 ${column.color} p-4`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900">{column.title}</h3>
                <Badge variant="secondary">{mockOpportunities[column.id]?.length || 0}</Badge>
              </div>
              
              <div className="space-y-3">
                {mockOpportunities[column.id]?.map((opp) => (
                  <Card 
                    key={opp.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedOpportunity(opp)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-sm text-gray-900 mb-1">{opp.company}</h4>
                          <p className="text-green-600">
                            R$ {opp.value.toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <button className="p-1 hover:bg-gray-100 rounded">
                              <MoreVertical className="w-4 h-4 text-gray-400" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                            <DropdownMenuItem>Editar</DropdownMenuItem>
                            <DropdownMenuItem>Mover etapa</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Marcar como perdida</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      {opp.trialEndsIn !== undefined && (
                        <div className="flex items-center gap-2 mb-3 p-2 bg-orange-50 rounded text-xs">
                          <AlertCircle className="w-4 h-4 text-orange-600" />
                          <span className="text-orange-700">
                            Trial termina em {opp.trialEndsIn} dias
                          </span>
                        </div>
                      )}

                      {opp.url && (
                        <div className="text-xs text-gray-500 mb-2">
                          URL: {opp.url}.noahomni.com.br
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1 mb-3">
                        {opp.modules.map((module, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {module}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{opp.contactName}</span>
                        <span>{opp.owner}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {mockOpportunities[column.id]?.length === 0 && (
                  <div className="text-center py-8 text-sm text-gray-400">
                    Nenhuma oportunidade
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <OpportunityDetailModal
        opportunity={selectedOpportunity}
        open={!!selectedOpportunity}
        onClose={() => setSelectedOpportunity(null)}
      />
    </>
  );
}
