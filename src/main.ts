import './style.css';
import { login, me } from './api';
import { branding } from './branding';

const root = document.querySelector<HTMLDivElement>('#app');

if (!root) {
  throw new Error('Root element #app not found');
}

document.title = branding.appName ?? 'Noah ERP';

function renderLogged(user: any) {
  root.innerHTML = `
    <div class="card">
      <header>
        <h1>${branding.appName ?? 'Noah ERP'}</h1>
        <p class="muted">Sessão autenticada</p>
      </header>
      <section>
        <p>Olá, <strong>${user?.name ?? 'usuário'}</strong></p>
        <p>Perfil: <code>${user?.role ?? 'unknown'}</code></p>
      </section>
      <div class="row">
        <a class="btn ghost" href="#" id="logout">Sair</a>
      </div>
    </div>
  `;

  document.getElementById('logout')?.addEventListener('click', (event) => {
    event.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    renderLogin();
  });
}

function renderLogin() {
  root.innerHTML = `
    <div class="card">
      <header>
        <img class="logo" alt="${branding.appName ?? 'Noah ERP'}" />
        <h1>${branding.appName ?? 'Noah ERP'}</h1>
      </header>
      <form id="login-form">
        <label for="email">Email</label>
        <input id="email" type="email" value="admin@noahomni.com.br" required />
        <label for="password">Senha</label>
        <input id="password" type="password" placeholder="••••••••" required />
        <button class="btn" type="submit">Entrar</button>
      </form>
      <p class="muted">API: <code>${import.meta.env.VITE_API_BASE ?? '/api'}</code></p>
    </div>
  `;

  const logo = document.querySelector<HTMLImageElement>('.logo');
  if (logo) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    logo.src = prefersDark ? branding.logoDark ?? branding.logoLight ?? '' : branding.logoLight ?? branding.logoDark ?? '';
    logo.alt = branding.appName ?? 'Noah ERP';
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
      const isDark = (event.matches ?? prefersDark) as boolean;
      logo.src = isDark ? branding.logoDark ?? branding.logoLight ?? '' : branding.logoLight ?? branding.logoDark ?? '';
    });
  }

  document.getElementById('login-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    try {
      const user = await login(email, password);
      renderLogged(user);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Falha no login';
      alert(message);
    }
  });
}

(async () => {
  try {
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      renderLogged(JSON.parse(cachedUser));
      return;
    }

    const user = await me().catch(() => null);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      renderLogged(user);
      return;
    }
  } catch (error) {
    console.warn('Failed to restore session', error);
  }

  renderLogin();
})();
