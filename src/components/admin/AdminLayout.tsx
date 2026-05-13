import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Settings, LogOut, ChevronDown, Moon, Sun } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

function getRoleBadge(roleCode: string) {
  const roleLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
    ADMIN: { label: 'Admin', variant: 'destructive' },
    CONTENT_MANAGER: { label: 'Conteúdo', variant: 'default' },
    OPERATIONS_MANAGER: { label: 'Operações', variant: 'secondary' },
    INVESTORS_MANAGER: { label: 'Investidores', variant: 'outline' },
  };
  return roleLabels[roleCode] || { label: roleCode, variant: 'outline' as const };
}

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const { user, signOut } = useAuth();
  
  // Obter as iniciais do utilizador
  const fullName = user ? `${user.firstName} ${user.lastName}` : '';
  const initials = fullName
    ? fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || 'U';

  return (
    <SidebarProvider>
      {/* Container principal */}
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />

        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out relative">
          {/* Top bar com Glassmorphism e layout mais alto (h-16) */}
          <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border/40 bg-background/80 px-6 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-sm transition-all duration-300">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-2 h-9 w-9 hover:bg-muted/60 transition-colors" />

              {title ? (
                <div className="flex-col justify-center hidden sm:flex">
                  <h1 className="text-lg font-semibold tracking-tight truncate text-foreground">{title}</h1>
                  {subtitle && <p className="text-xs text-muted-foreground truncate font-medium">{subtitle}</p>}
                </div>
              ) : null}
            </div>

            <div className="flex items-center gap-2 shrink-0">

              {/* Menu de Perfil / Utilizador num Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="h-10 pe-2 ps-2 group flex items-center gap-2.5 hover:bg-muted/60 transition-all duration-200 rounded-full"
                  >
                    <Avatar className="h-8 w-8 shadow-sm border border-border/50 group-hover:border-primary/20 transition-colors">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs transition-colors group-hover:bg-primary/20">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col items-start gap-0.5 text-left transition-opacity">
                      <span className="text-sm font-semibold leading-none text-foreground/90 group-hover:text-foreground">{fullName || user?.email || '—'}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 border-border/50 shadow-lg rounded-xl" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal p-3">
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm font-semibold leading-none">{fullName || 'Utilizador'}</p>
                      <p className="text-xs leading-none text-muted-foreground font-medium">
                        {user?.email || ''}
                      </p>
                      {user?.roleCode && (
                        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border/40">
                          {(() => {
                            const { label, variant } = getRoleBadge(user.roleCode);
                            return (
                              <Badge key={user.roleCode} variant={variant} className="text-[10px] px-2 py-0.5 shadow-none font-medium capitalize">
                                {label}
                              </Badge>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border/40" />
                  <DropdownMenuItem asChild className="p-2.5 cursor-pointer rounded-md focus:bg-muted/80">
                    <Link to="/admin/settings" className="w-full flex items-center">
                      <Settings className="mr-2.5 h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Configurações</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border/40" />
                  <DropdownMenuItem onClick={signOut} className="p-2.5 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 rounded-md">
                    <LogOut className="mr-2.5 h-4 w-4" />
                    <span className="font-medium">Terminar Sessão</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main content */}
          {/* Adicionando um leve background base para separar mais claramente o conteúdo main do header */}
          <main className="flex-1 overflow-auto bg-background">
            <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-[1600px] animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="mb-6 block sm:hidden">
                {/* Mobile version of title if present */}
                {title && (
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
                    {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
                  </div>
                )}
              </div>
              <div className="bg-background rounded-xl border border-border/40 shadow-sm min-h-[calc(100vh-140px)]">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}