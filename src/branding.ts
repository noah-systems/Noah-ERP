const env = (name: string): string | undefined => {
  if (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.[name]) {
    return (import.meta as any).env[name] as string;
  }
  if (typeof process !== 'undefined' && process.env?.[name]) {
    return process.env[name];
  }
  return undefined;
};

const sanitizeAsset = (value: string | undefined, fallback: string): string => {
  if (!value) return fallback;
  const v = value.trim();
  if (!v) return fallback;
  if (v.startsWith('/')) return v;
  if (v.startsWith('http://') || v.startsWith('https://')) {
    try {
      const url = new URL(v);
      if (typeof window !== 'undefined' && url.host !== window.location.host) {
        return fallback;
      }
      return url.href;
    } catch {
      return fallback;
    }
  }
  return fallback;
};

const asset = (names: string[], fallback: string): string => {
  for (const name of names) {
    const candidate = sanitizeAsset(env(name), fallback);
    if (candidate !== fallback) {
      return candidate;
    }
  }
  return fallback;
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
    '/brand/favicon.png'
  ),
  APPLE_TOUCH: asset(
    ['VITE_NOAH_APPLE_TOUCH', 'VITE_APPLE_TOUCH', 'NEXT_PUBLIC_APPLE_TOUCH'],
    '/brand/apple-touch.png'
  ),
  LOGIN_BG: asset(
    ['VITE_LOGIN_BG', 'VITE_NOAH_LOGIN_BG', 'NEXT_PUBLIC_LOGIN_BG'],
    '/brand/login-bg.jpg'
  ),
};

const theme =
  env('VITE_NOAH_THEME_COLOR') || env('VITE_THEME_COLOR') || env('NEXT_PUBLIC_THEME_COLOR') || '#A8E60F';

export const BRAND = {
  ...raw,
  theme,
  logoLight: raw.LOGO_LIGHT,
  logoDark: raw.LOGO_DARK,
  favicon: raw.FAVICON,
  apple: raw.APPLE_TOUCH,
  appleTouch: raw.APPLE_TOUCH,
  loginBg: raw.LOGIN_BG,
} as const;

export function applyBrandingToHead() {
  const ensure = (selector: string, rel?: string) => {
    let el = document.querySelector<HTMLLinkElement>(selector);
    if (!el) {
      el = document.createElement('link');
      if (rel) el.rel = rel;
      document.head.appendChild(el);
    }
    return el;
  };

  ensure('link[rel="icon"]', 'icon').href = BRAND.FAVICON;
  ensure('link[rel="apple-touch-icon"]', 'apple-touch-icon').href = BRAND.APPLE_TOUCH;
}
