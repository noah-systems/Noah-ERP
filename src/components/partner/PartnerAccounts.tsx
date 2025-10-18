import { useState } from 'react';
import { Plus, Filter, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AccountsTable } from './accounts/AccountsTable';
import { CreateAccountModal } from './accounts/CreateAccountModal';
import { useAuth } from '@/auth/AuthContext';
import { USE_MOCK } from '@/lib/api';
import { MockDataNotice } from '@/components/MockDataNotice';

export function PartnerAccounts() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { hasRole } = useAuth();
  const allowed = hasRole('ADMIN');
  const canCreate = hasRole('ADMIN');

  if (!allowed) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
        Você não possui acesso ao módulo de parceiros.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Contas</h1>
          <p className="text-sm text-gray-500">Gerencie todas as contas do parceiro</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={!USE_MOCK} title={!USE_MOCK ? 'Em breve' : undefined}>
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
          <Button variant="outline" disabled={!USE_MOCK} title={!USE_MOCK ? 'Em breve' : undefined}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          {canCreate && (
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              disabled={!USE_MOCK}
              title={!USE_MOCK ? 'Em breve' : undefined}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Conta
            </Button>
          )}
        </div>
      </div>

      {USE_MOCK ? (
        <>
          <Tabs defaultValue="active">
            <TabsList>
              <TabsTrigger value="active">Ativos</TabsTrigger>
              <TabsTrigger value="pending">Pendentes</TabsTrigger>
              <TabsTrigger value="upgrade">Upgrade/Downgrade</TabsTrigger>
              <TabsTrigger value="canceled">Cancelados</TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              <AccountsTable status="active" />
            </TabsContent>

            <TabsContent value="pending">
              <AccountsTable status="pending" />
            </TabsContent>

            <TabsContent value="upgrade">
              <AccountsTable status="upgrade" />
            </TabsContent>

            <TabsContent value="canceled">
              <AccountsTable status="canceled" />
            </TabsContent>
          </Tabs>

          <CreateAccountModal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
        </>
      ) : (
        <MockDataNotice description="As contas serão sincronizadas a partir da API real. Enquanto isso, nenhuma conta é exibida." />
      )}
    </div>
  );
}
