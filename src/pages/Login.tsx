import type { CSSProperties } from 'react';
import { FormEvent, useMemo, useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

import { BRAND } from '@/lib/brand';
import { ApiError, login } from '@/services/api';

import './login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const backgroundVars = useMemo<CSSProperties>(() => {
    const vars: CSSProperties = {};
    if (BRAND.loginBg) {
      vars['--login-background-image'] = `url('${BRAND.loginBg}')`;
    }
    if (BRAND.loginBg2x) {
      vars['--login-background-image-2x'] = `url('${BRAND.loginBg2x}')`;
    }
    if (BRAND.loginBgPortrait) {
      vars['--login-background-portrait'] = `url('${BRAND.loginBgPortrait}')`;
    }
    return vars;
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    setErr(null);
    setLoading(true);
    try {
      await login(email, pwd);
      window.location.href = '/';
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setErr('Credenciais inválidas. Verifique o e-mail e a senha.');
      } else {
        setErr('Não foi possível acessar agora. Tente novamente em instantes.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap" style={backgroundVars}>
      <main className="login-card" aria-live="polite">
        <header>
          <img className="logo" src={BRAND.logoLight} alt="Noah ERP" width={180} height={60} />
          <h1>Acessar o Noah ERP</h1>
        </header>

        <form onSubmit={submit} noValidate>
          <div className="form-group">
            <label htmlFor="login-email">E-mail</label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="email@empresa.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Senha</label>
            <div className="password-field">
              <input
                id="login-password"
                name="password"
                className="input"
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                value={pwd}
                onChange={(event) => setPwd(event.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="icon-toggle"
                onClick={() => setShow((state) => !state)}
                aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
                aria-pressed={show}
                disabled={loading}
              >
                {show ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {err && <div className="error">{err}</div>}

          <button type="submit" disabled={loading} aria-busy={loading}>
            {loading ? (
              <span className="button-loading">
                <Loader2 className="spinner" aria-hidden size={20} />
                Entrando...
              </span>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        <footer>
          <span>Use seu e-mail corporativo para acessar.</span>
          <strong>Precisa de ajuda? Contate o suporte Noah.</strong>
        </footer>
      </main>
    </div>
  );
}
