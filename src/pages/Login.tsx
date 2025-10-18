import { FormEvent, type CSSProperties, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { BRAND } from '@/lib/brand';
import './login.css';

const STORAGE_EMAIL_KEY = 'noah-erp:login-email';

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const logo = BRAND.logoLight;
  const backgroundImage = BRAND.loginBg;
  const backgroundImage2x = BRAND.loginBg2x ?? BRAND.loginBg;
  const backgroundImagePortrait = BRAND.loginBgPortrait ?? BRAND.loginBg;

  const backgroundStyle = useMemo(
    () =>
      ({
        ['--login-background-image' as const]: `url(${backgroundImage})`,
        ['--login-background-image-2x' as const]: `url(${backgroundImage2x})`,
        ['--login-background-portrait' as const]: `url(${backgroundImagePortrait})`,
      }) as CSSProperties,
    [backgroundImage, backgroundImage2x, backgroundImagePortrait]
  );

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const storedEmail = localStorage.getItem(STORAGE_EMAIL_KEY);
      if (storedEmail) {
        setEmail(storedEmail);
        setRememberEmail(true);
      }
    } catch (error) {
      console.warn('Não foi possível ler e-mail salvo.', error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (rememberEmail && email) {
        localStorage.setItem(STORAGE_EMAIL_KEY, email);
      } else if (!rememberEmail) {
        localStorage.removeItem(STORAGE_EMAIL_KEY);
      }
    } catch (error) {
      console.warn('Não foi possível persistir e-mail.', error);
    }
  }, [email, rememberEmail]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (error) {
      console.error(error);
      setErr('Usuário ou senha inválidos.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-wrap" style={backgroundStyle}>
      <div className="login-card">
        {logo && <img src={logo} alt="Noah Omni" className="logo" />}
        <h1>Acessar</h1>
        <form onSubmit={onSubmit} aria-busy={submitting}>
          <div className="form-group">
            <label htmlFor="login-email">E-mail</label>
            <input
              id="login-email"
              type="email"
              placeholder="Digite seu e-mail corporativo"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              inputMode="email"
              autoCapitalize="off"
              autoCorrect="off"
              aria-label="E-mail"
              aria-invalid={Boolean(err)}
              aria-describedby={err ? 'login-error' : undefined}
              disabled={submitting}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="login-password">Senha</label>
            <div className="password-field">
              <input
                id="login-password"
                type={showPwd ? 'text' : 'password'}
                className="input"
                placeholder="Informe sua senha"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                aria-label="Senha"
                aria-invalid={Boolean(err)}
                aria-describedby={err ? 'login-error' : undefined}
                disabled={submitting}
                required
              />
              <button
                type="button"
                className="icon-toggle"
                aria-label={showPwd ? 'Ocultar senha' : 'Mostrar senha'}
                aria-pressed={showPwd}
                disabled={submitting}
                onClick={() => setShowPwd((value) => !value)}
              >
                {showPwd ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
              </button>
            </div>
          </div>
          <div className="login-actions">
            <label className="remember">
              <input
                type="checkbox"
                checked={rememberEmail}
                onChange={(event) => setRememberEmail(event.target.checked)}
                disabled={submitting}
              />
              Lembrar e-mail neste dispositivo
            </label>
            <a
              href="#"
              className="forgot-password"
              onClick={(event) => event.preventDefault()}
            >
              Esqueci minha senha
            </a>
          </div>
          {err && (
            <div className="error" id="login-error" role="alert">
              {err}
            </div>
          )}
          <button type="submit" disabled={submitting} aria-live="assertive">
            {submitting ? 'Autenticando…' : 'Entrar'}
          </button>
        </form>
        <footer>
          <span>Desenvolvido por <strong>Noah Omni</strong></span>
        </footer>
      </div>
    </div>
  );
}
