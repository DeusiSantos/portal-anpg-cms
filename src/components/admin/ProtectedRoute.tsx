import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: 'admin' | 'content' | 'operations' | 'investors';
}

export function ProtectedRoute({ children, requiredPermission }: ProtectedRouteProps) {
  const { user, loading, hasBackofficeAccess, isAdmin, canManageContent, canManageOperations, canManageInvestors } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // No backoffice access
  if (!hasBackofficeAccess) {
    return <Navigate to="/" replace />;
  }

  // Check specific permission
  if (requiredPermission) {
    let hasPermission = false;
    switch (requiredPermission) {
      case 'admin':
        hasPermission = isAdmin;
        break;
      case 'content':
        hasPermission = canManageContent;
        break;
      case 'operations':
        hasPermission = canManageOperations;
        break;
      case 'investors':
        hasPermission = canManageInvestors;
        break;
    }

    if (!hasPermission) {
      return <Navigate to="/admin" replace />;
    }
  }

  return <>{children}</>;
}
