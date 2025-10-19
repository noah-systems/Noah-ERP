import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { API_BASE } from './lib/api';
import './styles/theme.css';

export default function App() {
  const nav = useNavigate();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: '100vh' }}>
      <aside className="card" style={{ margin: 16, padding: 16 }}>
        <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 16 }}>
          <span style={{ color: 'var(--color-primary)' }}>●</span> Noah ERP
        </div>
        <nav style={{ display: 'grid', gap: 10 }}>
          <NavLink to="/" end className="btn ghost">Dashboard</NavLink>
          <NavLink to="/leads" className="btn ghost">Leads</NavLink>
          <NavLink to="/opps" className="btn ghost">Oportunidades</NavLink>
          <NavLink to="/pricing" className="btn ghost">Pricing</NavLink>
        </nav>
        <div style={{ marginTop: 'auto', fontSize: 12, color: 'var(--color-muted)' }}>
          <div style={{ marginTop: 16 }}>API: {API_BASE}</div>
        </div>
      </aside>
      <main style={{ padding: 16 }}>
        <header className="card" style={{ padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>Bem-vindo 👋</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn ghost" onClick={() => nav('/login')}>Trocar usuário</button>
          </div>
        </header>
        <section className="container">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
