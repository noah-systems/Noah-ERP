import { ReactNode } from 'react';
import { useAuth } from './AuthContext';

type CanProps = {
  roles: Array<'ADMIN_NOAH' | 'SUPPORT_NOAH' | 'SELLER' | 'ADMIN_PARTNER'>;
  children: ReactNode;
};

export default function Can({ roles, children }: CanProps) {
  const { hasRole } = useAuth();
  return hasRole(...roles) ? <>{children}</> : null;
}
