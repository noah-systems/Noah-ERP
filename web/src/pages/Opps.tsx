import { useEffect, useState } from 'react';
import { http } from '../lib/api';

type Opp = { id: number | string; title?: string; value?: number; stage?: string };

export default function Opps() {
  const [rows, setRows] = useState<Opp[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await http<Opp[]>('/opps');
        setRows(Array.isArray(data) ? data : []);
      } catch (e:any) {
        setError(e?.message || 'Falha ao carregar oportunidades');
      }
    })();
  }, []);

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontWeight: 800 }}>Oportunidades</div>
      </div>
      {error && <div style={{ color: '#ff6b6b', marginBottom: 8 }}>{error}</div>}
      <table className="table">
        <thead>
          <tr><th>ID</th><th>Título</th><th>Valor</th><th>Etapa</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={String(r.id)}>
              <td>{r.id}</td><td>{r.title || '-'}</td><td>{r.value ?? '-'}</td><td>{r.stage || '-'}</td>
            </tr>
          ))}
          {!rows.length && !error && <tr><td colSpan={4} style={{ color: 'var(--color-muted)' }}>Sem dados</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
