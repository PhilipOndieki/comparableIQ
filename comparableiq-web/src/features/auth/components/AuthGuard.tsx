import { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '@/types';

interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: UserRole;
  fallback?: ReactNode;
}

export function AuthGuard({ children, requiredRole, fallback = null }: AuthGuardProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <>{fallback}</>;
  if (requiredRole && user?.role !== requiredRole) return <>{fallback}</>;

  return <>{children}</>;
}
