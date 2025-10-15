import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/auth/AuthContext';
import PrivateRoute from '@/auth/PrivateRoute';
import LoginPage from '@/pages/Login';
import { AppLayout } from '@/components/layout/AppLayout';
import { Dashboard } from '@/components/interno/Dashboard';
import { LeadsView } from '@/components/interno/LeadsView';
import { OpportunitiesView } from '@/components/interno/OpportunitiesView';
import { ImplementationView } from '@/components/interno/ImplementationView';
import { CanceledView } from '@/components/interno/CanceledView';
import { PricingView } from '@/components/interno/PricingView';
import { SettingsView } from '@/components/interno/SettingsView';
import { PartnerDashboard } from '@/components/partner/PartnerDashboard';
import { PartnerAccounts } from '@/components/partner/PartnerAccounts';
import { CreatePartner } from '@/components/partner/CreatePartner';
import { SupportPanel } from '@/components/partner/SupportPanel';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={(
              <PrivateRoute>
                <AppLayout />
              </PrivateRoute>
            )}
          >
            <Route index element={<Dashboard />} />
            <Route path="leads" element={<LeadsView />} />
            <Route path="opportunities" element={<OpportunitiesView />} />
            <Route path="implementation" element={<ImplementationView />} />
            <Route path="canceled" element={<CanceledView />} />
            <Route path="pricing" element={<PricingView />} />
            <Route path="settings" element={<SettingsView />} />
            <Route path="partner" element={<PartnerDashboard />} />
            <Route path="partner/accounts" element={<PartnerAccounts />} />
            <Route path="partner/create" element={<CreatePartner />} />
            <Route path="partner/support" element={<SupportPanel />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
