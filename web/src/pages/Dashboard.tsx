import { useEffect, useState } from 'react';
import { http } from '../lib/api';

export default function Dashboard() {
  const [health, setHealth] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const h = await http<{ ok: boolean; ts?: string }>('/health');
        setHealth(h);
      } catch (e:any) {
        setError(e?.message || 'Falha ao consultar saúde da API');
      }
    })();
  }, []);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 800, marginBottom: 8 }}>Status da API</div>
        {health ? (
          <pre style={{ margin: 0 }}>{JSON.stringify(health, null, 2)}</pre>
        ) : error ? (
          <div style={{ color: '#ff6b6b' }}>{error}</div>
        ) : (
          <div>Carregando...</div>
        )}
      </div>
    </div>
  );
}
