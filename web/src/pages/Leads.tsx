import { useEffect, useState } from 'react';
import { http } from '../lib/api';

type Lead = { id: number | string; name?: string; email?: string; stage?: string };

export default function Leads() {
  const [rows, setRows] = useState<Lead[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        // ajuste o endpoint se o seu backend usar outro nome/plural
        const data = await http<Lead[]>('/leads');
        setRows(Array.isArray(data) ? data : []);
      } catch (e:any) {
        // fallback elegante: não quebra tela se backend ainda não tem rota
        setError(e?.message || 'Falha ao carregar leads');
      }
    })();
  }, []);

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontWeight: 800 }}>Leads</div>
      </div>
      {error && <div style={{ color: '#ff6b6b', marginBottom: 8 }}>{error}</div>}
      <table className="table">
        <thead>
          <tr><th>ID</th><th>Nome</th><th>Email</th><th>Etapa</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={String(r.id)}>
              <td>{r.id}</td><td>{r.name || '-'}</td><td>{r.email || '-'}</td><td>{r.stage || '-'}</td>
            </tr>
          ))}
          {!rows.length && !error && <tr><td colSpan={4} style={{ color: 'var(--color-muted)' }}>Sem dados</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
