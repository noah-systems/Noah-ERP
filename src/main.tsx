import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BRAND } from './lib/brand';

const updateBranding = () => {
  const root = document.documentElement;
  root.style.setProperty('--primary', BRAND.theme);

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', BRAND.theme);
  }

  const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (favicon) {
    favicon.href = BRAND.favicon;
  }

  const apple = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
  if (apple) {
    apple.href = BRAND.apple;
  }
};

updateBranding();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
