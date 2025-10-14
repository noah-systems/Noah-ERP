import './style.css';
import { branding } from './branding';

const app = document.getElementById('app')!;
app.innerHTML = `
  <header class="noah-header">
    <img class="noah-logo" alt="Noah" />
    <h1>${branding.appName || 'Noah ERP'}</h1>
  </header>
  <main class="noah-main">
    <div class="noah-card">
      <h2>Bem-vindo</h2>
      <p>App placeholder — API: <code>${import.meta.env.VITE_API_URL || '/api'}</code></p>
    </div>
  </main>
`;
const logoEl = document.querySelector<HTMLImageElement>('.noah-logo')!;
const setLogo = () => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  logoEl.src = prefersDark ? (branding.logoDark || branding.logoLight) : (branding.logoLight || branding.logoDark);
};
setLogo();
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', setLogo);
