import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import './login.css';

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const logo = import.meta.env.VITE_NOAH_LOGO_LIGHT as string | undefined;

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (error) {
      console.error(error);
      setErr('E-mail ou senha inválidos.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        {logo && <img src={logo} alt="Noah Omni" className="logo" />}
        <h1>Acessar</h1>
        <form onSubmit={onSubmit}>
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
          {err && <div className="error">{err}</div>}
          <button type="submit" disabled={submitting}>
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <footer>
          Desenvolvido por <strong>Noah Omni</strong>
        </footer>
      </div>
    </div>
  );
}
