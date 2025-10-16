const env = (key: string): string | undefined =>
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.[key]) ||
  (typeof process !== 'undefined' && process.env?.[key]) ||
  undefined;

export const BRAND = {
  logoLight:
    env('VITE_NOAH_LOGO_LIGHT') ||
    env('VITE_LOGO_LIGHT') ||
    env('NEXT_PUBLIC_LOGO_LIGHT') ||
    '/brand/logo-light.png',
  logoDark:
    env('VITE_NOAH_LOGO_DARK') ||
    env('VITE_LOGO_DARK') ||
    env('NEXT_PUBLIC_LOGO_DARK') ||
    '/brand/logo-dark.png',
  favicon:
    env('VITE_NOAH_FAVICON') ||
    env('VITE_FAVICON') ||
    env('NEXT_PUBLIC_FAVICON') ||
    '/brand/favicon.png',
  apple:
    env('VITE_NOAH_APPLE_TOUCH') ||
    env('VITE_APPLE_TOUCH') ||
    env('NEXT_PUBLIC_APPLE_TOUCH') ||
    '/brand/apple-touch.png',
  theme:
    env('VITE_NOAH_THEME_COLOR') ||
    env('VITE_THEME_COLOR') ||
    env('NEXT_PUBLIC_THEME_COLOR') ||
    '#A8E60F',
  loginBg:
    env('VITE_NOAH_LOGIN_BG') ||
    env('VITE_LOGIN_BG') ||
    env('NEXT_PUBLIC_LOGIN_BG') ||
    '/brand/login-bg.jpg',
};
