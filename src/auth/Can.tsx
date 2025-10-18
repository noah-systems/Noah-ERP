import { ReactNode } from 'react';
import { useAuth } from './AuthContext';

type CanProps = {
  roles: Array<'ADMIN' | 'USER'>;
  children: ReactNode;
};

export default function Can({ roles, children }: CanProps) {
  const { hasRole } = useAuth();
  return hasRole(...roles) ? <>{children}</> : null;
}
