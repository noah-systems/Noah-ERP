import { useState } from 'react';
import { login } from '../lib/api';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('admin@noahomni.com.br');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const res = await login(email, password);
      const token = (res?.access_token || res?.token) as string | undefined;
      if (!token) throw new Error('Não recebi token do servidor.');
      localStorage.setItem('token', token);
      nav('/');
    } catch (e: any) {
      setErr(e?.message || 'Falha no login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <form onSubmit={onSubmit} className="card" style={{ padding: 24, width: 360, display: 'grid', gap: 12 }}>
        <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Entrar</div>
        <input className="input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="input" placeholder="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        {err && <div style={{ color: '#ff6b6b', fontSize: 13 }}>{err}</div>}
        <button className="btn" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
      </form>
    </div>
  );
}
