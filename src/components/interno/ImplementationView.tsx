import { useState } from 'react';
import { Calendar, CheckCircle, XCircle, MoreVertical } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface Implementation {
  id: string;
  company: string;
  url: string;
  modules: string[];
  responsible: string;
  scheduledDate?: string;
}

export function ImplementationView() {
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedImpl, setSelectedImpl] = useState<Implementation | null>(null);

  const implementations: Record<string, Implementation[]> = {
    pendente: [
      {
        id: '1',
        company: 'Digital Store',
        url: 'digitalstore',
        modules: ['CRM', 'WhatsApp', 'VOIP'],
        responsible: 'João Suporte',
      },
      {
        id: '2',
        company: 'Commerce Pro',
        url: 'commercepro',
        modules: ['CRM', 'WhatsApp', 'Instagram'],
        responsible: 'Maria Suporte',
      },
    ],
    agendado: [
      {
        id: '3',
        company: 'Varejo Plus',
        url: 'varejoplus',
        modules: ['CRM', 'WhatsApp', 'Campanha'],
        responsible: 'João Suporte',
        scheduledDate: '2025-10-20',
      },
    ],
    realizado: [],
    semSucesso: [],
  };

  const columns = [
    { id: 'pendente', title: 'Pendente Agendamento', color: 'bg-yellow-100 border-yellow-300' },
    { id: 'agendado', title: 'Agendado', color: 'bg-blue-100 border-blue-300' },
    { id: 'realizado', title: 'Implantação Realizada', color: 'bg-green-100 border-green-300' },
    { id: 'semSucesso', title: 'Sem Sucesso', color: 'bg-red-100 border-red-300' },
  ];

  const handleSchedule = (impl: Implementation) => {
    setSelectedImpl(impl);
    setScheduleModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl text-gray-900">Implantação</h1>
          <p className="text-gray-500">Gerencie as implantações de novos clientes</p>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-80">
            <div className={`rounded-lg border-2 ${column.color} p-4`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900">{column.title}</h3>
                <Badge variant="secondary">{implementations[column.id]?.length || 0}</Badge>
              </div>
              
              <div className="space-y-3">
                {implementations[column.id]?.map((impl) => (
                  <Card key={impl.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-sm text-gray-900 mb-1">{impl.company}</h4>
                          <p className="text-xs text-gray-500">{impl.url}.noahomni.com.br</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1 hover:bg-gray-100 rounded">
                              <MoreVertical className="w-4 h-4 text-gray-400" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSchedule(impl)}>
                              Agendar
                            </DropdownMenuItem>
                            <DropdownMenuItem>Concluir</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              Marcar sem sucesso
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {impl.scheduledDate && (
                        <div className="flex items-center gap-2 mb-3 text-xs text-blue-700 bg-blue-50 p-2 rounded">
                          <Calendar className="w-4 h-4" />
                          <span>Agendado: {new Date(impl.scheduledDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1 mb-3">
                        {impl.modules.map((module, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {module}
                          </Badge>
                        ))}
                      </div>

                      <div className="text-xs text-gray-500">
                        Responsável: {impl.responsible}
                      </div>

                      {column.id === 'pendente' && (
                        <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1" onClick={() => handleSchedule(impl)}>
                            <Calendar className="w-3 h-3 mr-1" />
                            Agendar
                          </Button>
                        </div>
                      )}

                      {column.id === 'agendado' && (
                        <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Concluir
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {implementations[column.id]?.length === 0 && (
                  <div className="text-center py-8 text-sm text-gray-400">
                    Nenhuma implantação
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendar Implantação</DialogTitle>
          </DialogHeader>
          
          {selectedImpl && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Cliente</p>
                <p className="text-gray-900">{selectedImpl.company}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduleDate">Data e Hora</Label>
                <Input id="scheduleDate" type="datetime-local" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsible">Responsável</Label>
                <Input id="responsible" defaultValue={selectedImpl.responsible} />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setScheduleModalOpen(false)}>
              Confirmar Agendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
