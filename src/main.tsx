import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './theme.css';
import { BRAND, applyBrandingToHead } from './lib/brand';

applyBrandingToHead();

const updateBranding = () => {
  const root = document.documentElement;
  const themeColor = BRAND.theme || getComputedStyle(root).getPropertyValue('--noah-primary') || '#9FEF00';
  root.style.setProperty('--noah-primary', themeColor);
  root.style.setProperty('--primary', themeColor);
  root.style.setProperty('--ring', themeColor);

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', themeColor);
  }
};

updateBranding();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
