import { useEffect, useState } from 'react';
import { http } from '../lib/api';

type Plan = { id: string | number; name: string; price: number; period?: string; features?: string[] };

export default function Pricing() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await http<Plan[]>('/pricing');
        setPlans(Array.isArray(data) ? data : []);
      } catch (e:any) {
        setError(e?.message || 'Falha ao carregar pricing');
      }
    })();
  }, []);

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontWeight: 800 }}>Planos</div>
      </div>
      {error && <div style={{ color: '#ff6b6b', marginBottom: 8 }}>{error}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 12 }}>
        {plans.map(p => (
          <div key={String(p.id)} className="card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>{p.name}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--color-primary)' }}>
              R$ {p.price} <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>{p.period || '/mês'}</span>
            </div>
            <ul>
              {(p.features || []).map((f, i) => <li key={i} style={{ color: 'var(--color-muted)' }}>{f}</li>)}
            </ul>
            <button className="btn" style={{ width: '100%', marginTop: 8 }}>Assinar</button>
          </div>
        ))}
        {!plans.length && !error && <div style={{ color: 'var(--color-muted)' }}>Sem planos definidos</div>}
      </div>
    </div>
  );
}
