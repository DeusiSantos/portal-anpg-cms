// ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: 'ADMIN' | 'content' | 'operations' | 'investors';
}

export function ProtectedRoute({ children, requiredPermission }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Verificar permissões baseado no roleCode do usuário
  const hasAccess = (): boolean => {
    if (!user) return false;
    
    // Por enquanto, apenas ADMIN tem acesso ao backoffice
    // Se no futuro houver mais roles, adicionar aqui
    return user.roleCode === 'ADMIN';
  };

  const isADMIN = (): boolean => {
    return user?.roleCode === 'ADMIN';
  };

  const canManageContent = (): boolean => {
    return user?.roleCode === 'ADMIN'; // Apenas ADMIN por enquanto
  };

  const canManageOperations = (): boolean => {
    return user?.roleCode === 'ADMIN';
  };

  const canManageInvestors = (): boolean => {
    return user?.roleCode === 'ADMIN';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in - redireciona para login
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // No backoffice access - redireciona para home
  if (!hasAccess()) {
    return <Navigate to="/" replace />;
  }

  // Check specific permission
  if (requiredPermission) {
    let hasPermission = false;
    switch (requiredPermission) {
      case 'ADMIN':
        hasPermission = isADMIN();
        break;
      case 'content':
        hasPermission = canManageContent();
        break;
      case 'operations':
        hasPermission = canManageOperations();
        break;
      case 'investors':
        hasPermission = canManageInvestors();
        break;
    }

    if (!hasPermission) {
      return <Navigate to="/admin" replace />;
    }
  }

  return <>{children}</>;
}