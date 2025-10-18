const env = (name: string): string | undefined => {
  if (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.[name]) {
    return (import.meta as any).env[name] as string;
  }
  if (typeof process !== 'undefined' && process.env?.[name]) {
    return process.env[name];
  }
  return undefined;
};

const sanitizeAsset = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const v = value.trim();
  if (!v) return undefined;
  if (v.startsWith('/')) return v;
  if (v.startsWith('http://') || v.startsWith('https://')) {
    try {
      const url = new URL(v);
      if (typeof window !== 'undefined' && url.host !== window.location.host) {
        return undefined;
      }
      return url.href;
    } catch {
      return undefined;
    }
  }
  return undefined;
};

const asset = (names: string[], ...fallbacks: string[]): string => {
  for (const name of names) {
    const candidate = sanitizeAsset(env(name));
    if (candidate) {
      return candidate;
    }
  }
  for (const fallback of fallbacks) {
    const sanitized = sanitizeAsset(fallback) ?? fallback;
    if (sanitized) {
      return sanitized;
    }
  }
  return fallbacks[0];
};

const raw = {
  LOGO_LIGHT: asset(
    ['VITE_NOAH_LOGO_LIGHT', 'VITE_LOGO_LIGHT', 'NEXT_PUBLIC_LOGO_LIGHT'],
    '/brand/logo-light.png'
  ),
  LOGO_DARK: asset(
    ['VITE_NOAH_LOGO_DARK', 'VITE_LOGO_DARK', 'NEXT_PUBLIC_LOGO_DARK'],
    '/brand/logo-dark.png'
  ),
  FAVICON: asset(
    ['VITE_NOAH_FAVICON', 'VITE_FAVICON', 'NEXT_PUBLIC_FAVICON'],
    '/brand/favicon.ico',
    '/brand/favicon.png'
  ),
  APPLE_TOUCH: asset(
    ['VITE_NOAH_APPLE_TOUCH', 'VITE_APPLE_TOUCH', 'NEXT_PUBLIC_APPLE_TOUCH'],
    '/brand/apple-touch-icon.png',
    '/brand/apple-touch.png'
  ),
  LOGIN_BG: asset(
    ['VITE_LOGIN_BG', 'VITE_NOAH_LOGIN_BG', 'NEXT_PUBLIC_LOGIN_BG'],
    '/brand/login-eclipse-desktop.png'
  ),
  LOGIN_BG_2X: asset(
    ['VITE_LOGIN_BG_2X', 'VITE_NOAH_LOGIN_BG_2X', 'NEXT_PUBLIC_LOGIN_BG_2X'],
    '/brand/login-eclipse@2x.png',
    '/brand/login-eclipse-desktop.png'
  ),
  LOGIN_BG_PORTRAIT: asset(
    [
      'VITE_LOGIN_BG_PORTRAIT',
      'VITE_NOAH_LOGIN_BG_PORTRAIT',
      'NEXT_PUBLIC_LOGIN_BG_PORTRAIT',
    ],
    '/brand/login-eclipse-mobile.png',
    '/brand/login-eclipse-desktop.png'
  ),
};

const theme =
  env('VITE_NOAH_THEME_COLOR') || env('VITE_THEME_COLOR') || env('NEXT_PUBLIC_THEME_COLOR') || '#d4183d';

const faviconPrimary = raw.FAVICON.endsWith('.ico') ? raw.FAVICON : '/brand/favicon.ico';
const faviconFallback = raw.FAVICON.endsWith('.png') ? raw.FAVICON : '/brand/favicon.png';

const applePrimary = raw.APPLE_TOUCH.endsWith('.png') ? raw.APPLE_TOUCH : '/brand/apple-touch-icon.png';
const appleFallback = applePrimary === '/brand/apple-touch-icon.png' ? '/brand/apple-touch.png' : applePrimary;

export const BRAND = {
  ...raw,
  theme,
  logoLight: raw.LOGO_LIGHT,
  logoDark: raw.LOGO_DARK,
  favicon: faviconPrimary,
  faviconFallback,
  apple: applePrimary,
  appleTouch: applePrimary,
  appleFallback,
  loginBg: raw.LOGIN_BG,
  loginBg2x: raw.LOGIN_BG_2X,
  loginBgPortrait: raw.LOGIN_BG_PORTRAIT,
} as const;

export function applyBrandingToHead() {
  const ensure = (selector: string, rel?: string, type?: string) => {
    let el = document.querySelector<HTMLLinkElement>(selector);
    if (!el) {
      el = document.createElement('link');
      if (rel) el.rel = rel;
      if (type) el.type = type;
      document.head.appendChild(el);
    }
    if (type) {
      el.type = type;
    }
    return el;
  };

  ensure('link[rel="icon"][type="image/x-icon"]', 'icon', 'image/x-icon').href = BRAND.favicon;
  ensure('link[rel="icon"][type="image/png"]', 'icon', 'image/png').href = BRAND.faviconFallback;
  ensure('link[rel="apple-touch-icon"]', 'apple-touch-icon').href = BRAND.apple;
}
