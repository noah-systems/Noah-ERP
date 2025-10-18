import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

const svgDataUri = (width: number, height: number, body: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`
  )}`;

const fallbackLogo = (theme: 'light' | 'dark') =>
  svgDataUri(
    240,
    80,
    `
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${theme === 'light' ? '#0A1B2C' : '#F8FAFC'}" />
          <stop offset="100%" stop-color="${theme === 'light' ? '#142A44' : '#E2E8F0'}" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" rx="18" fill="url(#bg)" />
      <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="Inter,Segoe UI,system-ui,sans-serif" font-weight="600" font-size="32" fill="${
        theme === 'light' ? '#C3FF00' : '#0A1B2C'
      }">Noah ERP</text>
    `
  );

const FALLBACK_LOGO_LIGHT = fallbackLogo('light');
const FALLBACK_LOGO_DARK = fallbackLogo('dark');

const FALLBACK_FAVICON = svgDataUri(
  64,
  64,
  `
    <defs>
      <linearGradient id="fg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0A1B2C" />
        <stop offset="100%" stop-color="#142A44" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="18" fill="url(#fg)" />
    <text x="32" y="38" font-family="Inter,Segoe UI,system-ui,sans-serif" font-size="28" font-weight="600" text-anchor="middle" fill="#C3FF00">N</text>
  `
);

const FALLBACK_APPLE_TOUCH = svgDataUri(
  180,
  180,
  `
    <defs>
      <linearGradient id="apple-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0A1B2C" />
        <stop offset="100%" stop-color="#1F3F60" />
      </linearGradient>
    </defs>
    <rect width="180" height="180" rx="42" fill="url(#apple-bg)" />
    <text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle" font-family="Inter,Segoe UI,system-ui,sans-serif" font-weight="600" font-size="48" fill="#C3FF00">Noah</text>
  `
);

const gradientBackground = (width: number, height: number) => {
  const circle = (cx: number, cy: number, r: number, opacity = 1) =>
    `<circle cx="${(width * cx).toFixed(1)}" cy="${(height * cy).toFixed(1)}" r="${(
      Math.min(width, height) * r
    ).toFixed(1)}" fill="url(#glow)" opacity="${opacity}" />`;

  return svgDataUri(
    width,
    height,
    `
      <defs>
        <linearGradient id="base" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#05080F" />
          <stop offset="100%" stop-color="#0A1B2C" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="#C3FF00" stop-opacity="0.55" />
          <stop offset="100%" stop-color="#0A1B2C" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#base)" />
      ${circle(0.25, 0.32, 0.42, 0.75)}
      ${circle(0.78, 0.28, 0.34, 0.55)}
      ${circle(0.58, 0.76, 0.48, 0.35)}
    `
  );
};

const FALLBACK_LOGIN_BG = gradientBackground(1440, 960);
const FALLBACK_LOGIN_BG_2X = gradientBackground(2880, 1920);
const FALLBACK_LOGIN_BG_PORTRAIT = gradientBackground(1080, 1920);

export default defineConfig(({ mode }) => {
  const rawEnv = loadEnv(mode, process.cwd(), '');
  const fallback = (value: string | undefined, localFallback: string) => {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
    return localFallback;
  };

  const brandingEnv = {
    VITE_NOAH_FAVICON: fallback(rawEnv.VITE_NOAH_FAVICON, FALLBACK_FAVICON),
    VITE_NOAH_APPLE_TOUCH: fallback(rawEnv.VITE_NOAH_APPLE_TOUCH, FALLBACK_APPLE_TOUCH),
    VITE_LOGIN_BG: fallback(rawEnv.VITE_LOGIN_BG, FALLBACK_LOGIN_BG),
    VITE_LOGIN_BG_2X: fallback(rawEnv.VITE_LOGIN_BG_2X, FALLBACK_LOGIN_BG_2X),
    VITE_LOGIN_BG_PORTRAIT: fallback(rawEnv.VITE_LOGIN_BG_PORTRAIT, FALLBACK_LOGIN_BG_PORTRAIT),
    VITE_LOGO_LIGHT: fallback(rawEnv.VITE_LOGO_LIGHT, FALLBACK_LOGO_LIGHT),
    VITE_LOGO_DARK: fallback(rawEnv.VITE_LOGO_DARK, FALLBACK_LOGO_DARK),
  } as const;

  process.env.VITE_NOAH_FAVICON = brandingEnv.VITE_NOAH_FAVICON;
  process.env.VITE_NOAH_APPLE_TOUCH = brandingEnv.VITE_NOAH_APPLE_TOUCH;
  process.env.VITE_LOGIN_BG = brandingEnv.VITE_LOGIN_BG;
  process.env.VITE_LOGIN_BG_2X = brandingEnv.VITE_LOGIN_BG_2X;
  process.env.VITE_LOGIN_BG_PORTRAIT = brandingEnv.VITE_LOGIN_BG_PORTRAIT;
  process.env.VITE_LOGO_LIGHT = brandingEnv.VITE_LOGO_LIGHT;
  process.env.VITE_LOGO_DARK = brandingEnv.VITE_LOGO_DARK;

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_NOAH_FAVICON': JSON.stringify(brandingEnv.VITE_NOAH_FAVICON),
      'import.meta.env.VITE_NOAH_APPLE_TOUCH': JSON.stringify(brandingEnv.VITE_NOAH_APPLE_TOUCH),
      'import.meta.env.VITE_LOGIN_BG': JSON.stringify(brandingEnv.VITE_LOGIN_BG),
      'import.meta.env.VITE_LOGIN_BG_2X': JSON.stringify(brandingEnv.VITE_LOGIN_BG_2X),
      'import.meta.env.VITE_LOGIN_BG_PORTRAIT': JSON.stringify(brandingEnv.VITE_LOGIN_BG_PORTRAIT),
      'import.meta.env.VITE_LOGO_LIGHT': JSON.stringify(brandingEnv.VITE_LOGO_LIGHT),
      'import.meta.env.VITE_LOGO_DARK': JSON.stringify(brandingEnv.VITE_LOGO_DARK),
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        'vaul@1.1.2': 'vaul',
        'sonner@2.0.3': 'sonner',
        'recharts@2.15.2': 'recharts',
        'react-resizable-panels@2.1.7': 'react-resizable-panels',
        'react-hook-form@7.55.0': 'react-hook-form',
        'react-day-picker@8.10.1': 'react-day-picker',
        'next-themes@0.4.6': 'next-themes',
        'lucide-react@0.487.0': 'lucide-react',
        'input-otp@1.4.2': 'input-otp',
        'embla-carousel-react@8.6.0': 'embla-carousel-react',
        'cmdk@1.1.1': 'cmdk',
        'class-variance-authority@0.7.1': 'class-variance-authority',
        'react-router-dom': path.resolve(__dirname, './src/lib/router'),
        '@radix-ui/react-tooltip@1.1.8': '@radix-ui/react-tooltip',
        '@radix-ui/react-toggle@1.1.2': '@radix-ui/react-toggle',
        '@radix-ui/react-toggle-group@1.1.2': '@radix-ui/react-toggle-group',
        '@radix-ui/react-tabs@1.1.3': '@radix-ui/react-tabs',
        '@radix-ui/react-switch@1.1.3': '@radix-ui/react-switch',
        '@radix-ui/react-slot@1.1.2': '@radix-ui/react-slot',
        '@radix-ui/react-slider@1.2.3': '@radix-ui/react-slider',
        '@radix-ui/react-separator@1.1.2': '@radix-ui/react-separator',
        '@radix-ui/react-select@2.1.6': '@radix-ui/react-select',
        '@radix-ui/react-scroll-area@1.2.3': '@radix-ui/react-scroll-area',
        '@radix-ui/react-radio-group@1.2.3': '@radix-ui/react-radio-group',
        '@radix-ui/react-progress@1.1.2': '@radix-ui/react-progress',
        '@radix-ui/react-popover@1.1.6': '@radix-ui/react-popover',
        '@radix-ui/react-navigation-menu@1.2.5': '@radix-ui/react-navigation-menu',
        '@radix-ui/react-menubar@1.1.6': '@radix-ui/react-menubar',
        '@radix-ui/react-label@2.1.2': '@radix-ui/react-label',
        '@radix-ui/react-hover-card@1.1.6': '@radix-ui/react-hover-card',
        '@radix-ui/react-dropdown-menu@2.1.6': '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-dialog@1.1.6': '@radix-ui/react-dialog',
        '@radix-ui/react-context-menu@2.2.6': '@radix-ui/react-context-menu',
        '@radix-ui/react-collapsible@1.1.3': '@radix-ui/react-collapsible',
        '@radix-ui/react-checkbox@1.1.4': '@radix-ui/react-checkbox',
        '@radix-ui/react-avatar@1.1.3': '@radix-ui/react-avatar',
        '@radix-ui/react-aspect-ratio@1.1.2': '@radix-ui/react-aspect-ratio',
        '@radix-ui/react-alert-dialog@1.1.6': '@radix-ui/react-alert-dialog',
        '@radix-ui/react-accordion@1.2.3': '@radix-ui/react-accordion',
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'esnext',
      outDir: 'dist',
    },
    server: {
      port: 3000,
      open: true,
    },
  };
});
