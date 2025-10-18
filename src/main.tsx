import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

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

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  </React.StrictMode>
);
