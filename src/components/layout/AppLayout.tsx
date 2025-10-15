import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';

type ModuleKind = 'internal' | 'partner';

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [module, setModule] = useState<ModuleKind>(
    location.pathname.startsWith('/partner') ? 'partner' : 'internal'
  );

  useEffect(() => {
    setModule(location.pathname.startsWith('/partner') ? 'partner' : 'internal');
  }, [location.pathname]);

  const handleModuleChange = (next: ModuleKind) => {
    if (next === module) return;
    setModule(next);
    navigate(next === 'partner' ? '/partner' : '/', { replace: false });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar module={module} onModuleChange={handleModuleChange} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="mx-auto w-full max-w-7xl space-y-10 p-6">
            <Outlet />
          </div>
        </main>
        <footer className="border-t border-gray-200 bg-white py-3 text-center text-xs text-gray-500">
          Desenvolvido por <strong className="font-semibold text-gray-700">Noah Omni</strong>
        </footer>
      </div>
    </div>
  );
}
