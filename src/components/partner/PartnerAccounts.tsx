import { useState } from 'react';
import { Plus, Filter, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AccountsTable } from './accounts/AccountsTable';
import { CreateAccountModal } from './accounts/CreateAccountModal';

interface PartnerAccountsProps {
  userRole: string;
}

export function PartnerAccounts({ userRole }: PartnerAccountsProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const canCreate = userRole === 'partner-master' || userRole === 'partner-operacoes' || userRole === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl text-gray-900">Contas</h1>
          <p className="text-gray-500">Gerencie todas as contas do parceiro</p>
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
          {canCreate && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Conta
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Ativos</TabsTrigger>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="upgrade">Upgrade/Downgrade</TabsTrigger>
          <TabsTrigger value="canceled">Cancelados</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <AccountsTable status="active" userRole={userRole} />
        </TabsContent>

        <TabsContent value="pending">
          <AccountsTable status="pending" userRole={userRole} />
        </TabsContent>

        <TabsContent value="upgrade">
          <AccountsTable status="upgrade" userRole={userRole} />
        </TabsContent>

        <TabsContent value="canceled">
          <AccountsTable status="canceled" userRole={userRole} />
        </TabsContent>
      </Tabs>

      <CreateAccountModal 
        open={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
}
