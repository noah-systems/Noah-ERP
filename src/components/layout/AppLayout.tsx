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
    <div className="flex min-h-screen bg-[var(--slate-50)] text-[var(--slate-900)]">
      <Sidebar module={module} onModuleChange={handleModuleChange} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[var(--app-max-width)] space-y-6 px-6 py-6 lg:px-10">
            <Outlet />
          </div>
        </main>
        <footer className="border-t border-[var(--border)] bg-white py-3 text-center text-xs text-[var(--slate-500)]">
          Desenvolvido por <strong className="font-semibold text-[var(--slate-700)]">Noah Omni</strong>
        </footer>
      </div>
    </div>
  );
}
