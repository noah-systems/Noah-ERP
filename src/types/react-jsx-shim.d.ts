// src/types/react-jsx-shim.d.ts
// Shim mínimo para permitir JSX sem @types/react, usado em ambiente com proxy 403.
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
  interface Element {}
  interface ElementClass {
    render?: any;
  }
  interface ElementAttributesProperty {
    props: any;
  }
  interface ElementChildrenAttribute {
    children: any;
  }
}

declare namespace React {
  type ReactNode = any;
  type ReactElement<P = any> = { props: P };
  interface CSSProperties {
    [key: string]: any;
  }
  type ComponentProps<T> = any;
  type ComponentType<P = any> = any;
  type FC<P = {}> = (props: P & { children?: ReactNode }) => any;
  type FormEvent<T = any> = any;
  type KeyboardEvent<T = any> = any;
}

declare module 'react' {
  export type ReactNode = React.ReactNode;
  export type ReactElement = React.ReactElement;
  export interface CSSProperties extends React.CSSProperties {}
  export type ComponentProps<T> = any;
  export type ComponentType<P = any> = any;
  export type FC<P = {}> = React.FC<P>;
  export type FormEvent<T = any> = React.FormEvent<T>;
  export type KeyboardEvent<T = any> = React.KeyboardEvent<T>;
  export const Fragment: any;
  export const Children: any;
  export function memo<T>(component: T): T;
  export function forwardRef<T, P = {}>(render: any): any;
  export function createContext<T = any>(defaultValue: T): any;
  export function useContext<T = any>(context: any): T;
  export function useEffect(effect: (...args: any[]) => any, deps?: any[]): void;
  export function useMemo<T>(factory: () => T, deps?: any[]): T;
  export function useCallback<T extends (...args: any[]) => any>(fn: T, deps?: any[]): T;
  export function useState<S = any>(initial?: S | (() => S)):
    [S, (value: S | ((prev: S) => S)) => void];
  export function useRef<T = any>(initial?: T): { current: T };
  export function useId(): string;
  export function isValidElement<P = any>(element: any): element is React.ReactElement<P>;
  export const startTransition: (...args: any[]) => void;
  export const StrictMode: any;
  export default any;
}

declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

declare module 'react-router-dom' {
  export const RouterProvider: any;
  export const BrowserRouter: any;
  export const createBrowserRouter: any;
  export const useNavigate: any;
  export const useLocation: any;
  export const useParams: any;
  export const Link: any;
  export const Navigate: any;
  export const NavLink: any;
  export const Outlet: any;
  export const Route: any;
  export const Routes: any;
  const mod: any;
  export default mod;
}

declare const process: {
  env?: Record<string, string | undefined>;
};
