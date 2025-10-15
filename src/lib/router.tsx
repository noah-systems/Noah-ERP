import {
  Children,
  ReactElement,
  ReactNode,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type NavigateOptions = { replace?: boolean };

type RouterContextValue = {
  path: string;
  navigate: (to: string, options?: NavigateOptions) => void;
};

const RouterContext = createContext<RouterContextValue | null>(null);
const OutletContext = createContext<ReactNode>(null);

function normalizePath(path: string) {
  if (!path) return '/';
  if (!path.startsWith('/')) return `/${path}`;
  return path;
}

function stripTrailingSlash(path: string) {
  if (path.length > 1 && path.endsWith('/')) {
    return path.replace(/\/+$/, '');
  }
  return path;
}

function getLocationSnapshot() {
  const { pathname, search, hash } = window.location;
  return `${pathname}${search}${hash}`;
}

export function BrowserRouter({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(() => getLocationSnapshot());

  useEffect(() => {
    const handler = () => setPath(getLocationSnapshot());
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  const navigate = (to: string, options?: NavigateOptions) => {
    const target = normalizePath(to);
    if (options?.replace) {
      window.history.replaceState(null, '', target);
    } else {
      window.history.pushState(null, '', target);
    }
    setPath(getLocationSnapshot());
  };

  const value = useMemo<RouterContextValue>(() => ({ path, navigate }), [path]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) {
    throw new Error('useRouter must be used within a BrowserRouter');
  }
  return ctx;
}

export function useLocation() {
  const { path } = useRouter();
  const [pathname, search = '', hash = ''] = path.split(/([?#].*)/);
  const queryIndex = search.indexOf('?');
  const actualSearch = queryIndex >= 0 ? search.slice(queryIndex) : '';
  const actualHash = hash.startsWith('#') ? hash : '';
  return { pathname: stripTrailingSlash(pathname || '/'), search: actualSearch, hash: actualHash };
}

export function useNavigate() {
  const { navigate } = useRouter();
  return (to: string, options?: NavigateOptions) => navigate(to, options);
}

export function Navigate({ to, replace = false }: { to: string; replace?: boolean }) {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to, { replace });
  }, [navigate, to, replace]);
  return null;
}

type NavLinkProps = {
  to: string;
  end?: boolean;
  className?: string | ((props: { isActive: boolean }) => string);
  children: ReactNode | ((props: { isActive: boolean }) => ReactNode);
};

export function NavLink({ to, end, className, children }: NavLinkProps) {
  const { path, navigate } = useRouter();
  const pathname = stripTrailingSlash(path.split(/[?#]/)[0] || '/');
  const target = stripTrailingSlash(normalizePath(to));
  const isActive = end ? pathname === target : pathname === target || pathname.startsWith(`${target}/`);
  const computedClassName = typeof className === 'function' ? className({ isActive }) : className;
  const content = typeof children === 'function' ? children({ isActive }) : children;
  return (
    <a
      href={to}
      className={computedClassName}
      onClick={(event) => {
        event.preventDefault();
        navigate(to);
      }}
    >
      {content}
    </a>
  );
}

type RouteProps = {
  path?: string;
  index?: boolean;
  element?: ReactElement | null;
  children?: ReactNode;
};

function joinPaths(base: string, segment?: string) {
  const basePath = stripTrailingSlash(base === '' ? '/' : base);
  if (!segment || segment === '/') {
    return basePath || '/';
  }
  if (segment.startsWith('/')) {
    return stripTrailingSlash(segment) || '/';
  }
  if (basePath === '/' || basePath === '') {
    return `/${segment}`.replace(/\/+/, '/');
  }
  return `${basePath}/${segment}`.replace(/\/+/, '/');
}

function renderWithOutlet(element: ReactElement | null | undefined, child: ReactNode | null) {
  if (element) {
    return <OutletContext.Provider value={child}>{element}</OutletContext.Provider>;
  }
  return child ?? null;
}

function matchRoutes(nodes: ReactNode[], pathname: string, basePath: string): ReactNode | null {
  const normalizedPath = stripTrailingSlash(pathname || '/');

  for (const node of nodes) {
    if (!isValidElement<RouteProps>(node)) continue;
    const props = node.props as RouteProps;
    const hasChildren = Children.count(props.children) > 0;
    const currentPath = props.path ? joinPaths(basePath, props.path) : basePath;

    if (props.index) {
      const matchBase = stripTrailingSlash(basePath || '/');
      if (normalizedPath === matchBase) {
        const childMatch = hasChildren
          ? matchRoutes(Children.toArray(props.children), normalizedPath, currentPath)
          : null;
        return renderWithOutlet(props.element, childMatch);
      }
      continue;
    }

    if (props.path === '*') {
      const wildcardBase = basePath || '/';
      const childMatch = hasChildren
        ? matchRoutes(Children.toArray(props.children), normalizedPath, wildcardBase)
        : null;
      return renderWithOutlet(props.element, childMatch);
    }

    if (props.path) {
      const normalizedRoute = stripTrailingSlash(currentPath || '/');
      const isExactMatch = normalizedPath === normalizedRoute;
      const isNestedMatch = !isExactMatch && normalizedPath.startsWith(`${normalizedRoute}/`);
      if (isExactMatch || (hasChildren && isNestedMatch)) {
        const childMatch = hasChildren
          ? matchRoutes(Children.toArray(props.children), normalizedPath, normalizedRoute)
          : null;
        if (props.element) {
          return renderWithOutlet(props.element, childMatch);
        }
        if (childMatch) {
          return childMatch;
        }
        continue;
      }
    }
  }

  return null;
}

export function Routes({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const match = matchRoutes(Children.toArray(children), pathname, '/');
  return match ? <>{match}</> : null;
}

export function Route(_: RouteProps): null {
  return null;
}

export function Outlet() {
  const outlet = useContext(OutletContext);
  return <>{outlet ?? null}</>;
}
