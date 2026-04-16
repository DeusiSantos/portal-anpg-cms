import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: 'admin' | 'content' | 'operations' | 'investors';
}

export function ProtectedRoute({ children, requiredPermission }: ProtectedRouteProps) {
  const { user, isLoading, userAllData } = useAuth();
  const location = useLocation();

  // Funções auxiliares para verificar permissões baseadas nos roles do userAllData
  // ProtectedRoute.tsx

  const hasBackofficeAccess = (): boolean => {
    if (!userAllData?.roles || userAllData.roles.length === 0) return false;
    const normalized = userAllData.roles.map(r => r.toLowerCase());
    return normalized.some(role =>
      ['admin', 'editor_comunicacao', 'editor_tecnico', 'gestor_investidores' , 'viewer'].includes(role)
    );
  };

  const isAdmin = (): boolean => {
    return userAllData?.roles?.map(r => r.toLowerCase()).includes('admin') ?? false;
  };

  const canManageContent = (): boolean => {
    const roles = userAllData?.roles?.map(r => r.toLowerCase()) ?? [];
    return roles.includes('editor_comunicacao') || roles.includes('admin');
  };

  const canManageOperations = (): boolean => {
    const roles = userAllData?.roles?.map(r => r.toLowerCase()) ?? [];
    return roles.includes('editor_tecnico') || roles.includes('admin');
  };

  const canManageInvestors = (): boolean => {
    const roles = userAllData?.roles?.map(r => r.toLowerCase()) ?? [];
    return roles.includes('gestor_investidores') || roles.includes('admin');
  };
  const canView = (): boolean => {
    const roles = userAllData?.roles?.map(r => r.toLowerCase()) ?? [];
    return roles.includes('viewer') || roles.includes('admin');
    }

  // Loading state - aguarda o carregamento do user e dos dados completos
  if (isLoading || (!userAllData && user)) {
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
  if (!hasBackofficeAccess()) {
    return <Navigate to="/" replace />;
  }

  // Check specific permission
  if (requiredPermission) {
    let hasPermission = false;
    switch (requiredPermission) {
      case 'admin':
        hasPermission = isAdmin();
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