import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--noah-bg)] text-[color:rgba(230,247,230,0.72)]">
        Carregando...
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
