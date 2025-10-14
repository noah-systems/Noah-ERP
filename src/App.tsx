import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Dashboard } from './components/interno/Dashboard';
import { LeadsView } from './components/interno/LeadsView';
import { OpportunitiesView } from './components/interno/OpportunitiesView';
import { ImplementationView } from './components/interno/ImplementationView';
import { CanceledView } from './components/interno/CanceledView';
import { PricingView } from './components/interno/PricingView';
import { SettingsView } from './components/interno/SettingsView';
import { PartnerDashboard } from './components/partner/PartnerDashboard';
import { CreatePartner } from './components/partner/CreatePartner';
import { PartnerAccounts } from './components/partner/PartnerAccounts';
import { SupportPanel } from './components/partner/SupportPanel';

type UserRole = 'admin' | 'vendas' | 'suporte' | 'financeiro' | 'partner-master' | 'partner-financeiro' | 'partner-operacoes';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [isPartnerModule, setIsPartnerModule] = useState(false);

  const renderContent = () => {
    if (isPartnerModule) {
      switch (currentView) {
        case 'partner-dashboard':
          return <PartnerDashboard userRole={userRole} />;
        case 'create-partner':
          return <CreatePartner />;
        case 'partner-accounts':
          return <PartnerAccounts userRole={userRole} />;
        case 'support-panel':
          return <SupportPanel />;
        default:
          return <PartnerDashboard userRole={userRole} />;
      }
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentView} userRole={userRole} />;
      case 'leads':
        return <LeadsView userRole={userRole} />;
      case 'opportunities':
        return <OpportunitiesView userRole={userRole} />;
      case 'implementation':
        return <ImplementationView userRole={userRole} />;
      case 'canceled':
        return <CanceledView userRole={userRole} />;
      case 'pricing':
        return <PricingView userRole={userRole} />;
      case 'settings':
        return <SettingsView userRole={userRole} />;
      default:
        return <Dashboard onNavigate={setCurrentView} userRole={userRole} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        currentView={currentView} 
        onNavigate={setCurrentView}
        isPartnerModule={isPartnerModule}
        onModuleChange={setIsPartnerModule}
        userRole={userRole}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          userRole={userRole} 
          onRoleChange={setUserRole}
          isPartnerModule={isPartnerModule}
        />
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
