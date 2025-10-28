const env = (name: string): string | undefined => {
  if (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.[name]) {
    return (import.meta as any).env[name] as string;
  }
  if (typeof process !== 'undefined' && process.env?.[name]) {
    return process.env[name];
  }
  return undefined;
};

const svgDataUri = (width: number, height: number, body: string): string =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`
  )}`;

const fallbackLogo = (theme: 'light' | 'dark'): string =>
  svgDataUri(
    240,
    80,
    `
      <defs>
        <linearGradient id="brand-logo" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${theme === 'light' ? '#0A1B2C' : '#F8FAFC'}" />
          <stop offset="100%" stop-color="${theme === 'light' ? '#142A44' : '#E2E8F0'}" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" rx="18" fill="url(#brand-logo)" />
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
      <linearGradient id="brand-favicon" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0A1B2C" />
        <stop offset="100%" stop-color="#142A44" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="18" fill="url(#brand-favicon)" />
    <text x="32" y="38" font-family="Inter,Segoe UI,system-ui,sans-serif" font-size="28" font-weight="600" text-anchor="middle" fill="#C3FF00">N</text>
  `
);

const FALLBACK_APPLE_TOUCH = svgDataUri(
  180,
  180,
  `
    <defs>
      <linearGradient id="brand-apple" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0A1B2C" />
        <stop offset="100%" stop-color="#1F3F60" />
      </linearGradient>
    </defs>
    <rect width="180" height="180" rx="42" fill="url(#brand-apple)" />
    <text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle" font-family="Inter,Segoe UI,system-ui,sans-serif" font-weight="600" font-size="48" fill="#C3FF00">Noah</text>
  `
);

const gradientBackground = (width: number, height: number): string => {
  const circle = (cx: number, cy: number, r: number, opacity = 1) =>
    `<circle cx="${(width * cx).toFixed(1)}" cy="${(height * cy).toFixed(1)}" r="${(
      Math.min(width, height) * r
    ).toFixed(1)}" fill="url(#brand-glow)" opacity="${opacity}" />`;

  return svgDataUri(
    width,
    height,
    `
      <defs>
        <linearGradient id="brand-base" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#05080F" />
          <stop offset="100%" stop-color="#0A1B2C" />
        </linearGradient>
        <radialGradient id="brand-glow" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="#C3FF00" stop-opacity="0.55" />
          <stop offset="100%" stop-color="#0A1B2C" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#brand-base)" />
      ${circle(0.25, 0.32, 0.42, 0.75)}
      ${circle(0.78, 0.28, 0.34, 0.55)}
      ${circle(0.58, 0.76, 0.48, 0.35)}
    `
  );
};

const FALLBACK_LOGIN_BG = gradientBackground(1440, 960);
const FALLBACK_LOGIN_BG_2X = gradientBackground(2880, 1920);
const FALLBACK_LOGIN_BG_PORTRAIT = gradientBackground(1080, 1920);

const sanitizeAsset = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const v = value.trim();
  if (!v) return undefined;
  if (v.startsWith('data:image')) return v;
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
    FALLBACK_LOGO_LIGHT
  ),
  LOGO_DARK: asset(
    ['VITE_NOAH_LOGO_DARK', 'VITE_LOGO_DARK', 'NEXT_PUBLIC_LOGO_DARK'],
    FALLBACK_LOGO_DARK
  ),
  FAVICON: asset(
    ['VITE_NOAH_FAVICON', 'VITE_FAVICON', 'NEXT_PUBLIC_FAVICON'],
    FALLBACK_FAVICON
  ),
  APPLE_TOUCH: asset(
    ['VITE_NOAH_APPLE_TOUCH', 'VITE_APPLE_TOUCH', 'NEXT_PUBLIC_APPLE_TOUCH'],
    FALLBACK_APPLE_TOUCH
  ),
  LOGIN_BG: asset(
    ['VITE_LOGIN_BG', 'VITE_NOAH_LOGIN_BG', 'NEXT_PUBLIC_LOGIN_BG'],
    FALLBACK_LOGIN_BG
  ),
  LOGIN_BG_2X: asset(
    ['VITE_LOGIN_BG_2X', 'VITE_NOAH_LOGIN_BG_2X', 'NEXT_PUBLIC_LOGIN_BG_2X'],
    FALLBACK_LOGIN_BG_2X,
    FALLBACK_LOGIN_BG
  ),
  LOGIN_BG_PORTRAIT: asset(
    [
      'VITE_LOGIN_BG_PORTRAIT',
      'VITE_NOAH_LOGIN_BG_PORTRAIT',
      'NEXT_PUBLIC_LOGIN_BG_PORTRAIT',
    ],
    FALLBACK_LOGIN_BG_PORTRAIT,
    FALLBACK_LOGIN_BG
  ),
};

const theme =
  env('VITE_NOAH_THEME_COLOR') || env('VITE_THEME_COLOR') || env('NEXT_PUBLIC_THEME_COLOR') || '#0ea5e9';

export const BRAND = {
  ...raw,
  theme,
  logoLight: raw.LOGO_LIGHT,
  logoDark: raw.LOGO_DARK,
  favicon: raw.FAVICON,
  faviconFallback: raw.FAVICON,
  apple: raw.APPLE_TOUCH,
  appleTouch: raw.APPLE_TOUCH,
  appleFallback: raw.APPLE_TOUCH,
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

  ensure('link[rel="icon"]', 'icon').href = BRAND.favicon;
  ensure('link[rel="icon"][type="image/svg+xml"]', 'icon', 'image/svg+xml').href = BRAND.favicon;
  ensure('link[rel="apple-touch-icon"]', 'apple-touch-icon').href = BRAND.apple;
}
