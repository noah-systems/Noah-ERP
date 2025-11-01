// src/types/vite-client-shim.d.ts
// Shim mínimo para fornecer tipos de import.meta.env sem depender de vite/client.
declare const __vite_ssr_import__: any;
declare const __vite_ssr_dynamic_import__: any;
declare const __vite_ssr_exports__: any;

declare interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_API_BASE?: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
