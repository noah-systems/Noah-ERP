import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BRAND, applyBrandingToHead } from './lib/brand';

applyBrandingToHead();

const updateBranding = () => {
  const root = document.documentElement;
  root.style.setProperty('--primary', BRAND.theme);

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', BRAND.theme);
  }
};

updateBranding();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
