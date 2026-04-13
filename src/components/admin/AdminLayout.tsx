import { useState, useEffect } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { OnboardingWizard } from './OnboardingWizard';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';

function getRoleBadge(role: string) {
  const roleLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
    admin: { label: 'Admin', variant: 'destructive' },
    editor_comunicacao: { label: 'Comunicação', variant: 'default' },
    editor_tecnico: { label: 'Técnico', variant: 'secondary' },
    gestor_investidores: { label: 'Investidores', variant: 'outline' },
    viewer: { label: 'Viewer', variant: 'outline' },
  };
  return roleLabels[role] || { label: role, variant: 'outline' as const };
}

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const { profile, roles, user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  useEffect(() => {
    if (!user || onboardingChecked) return;
    supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data && !(data as any).onboarding_completed) {
          setShowOnboarding(true);
        }
        setOnboardingChecked(true);
      });
  }, [user, onboardingChecked]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="bg-background border-b sticky top-0 z-50 h-14 flex items-center px-4 gap-4">
            <SidebarTrigger />

            {title && (
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-semibold truncate">{title}</h1>
                {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
              </div>
            )}

            {!title && <div className="flex-1" />}

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium">{profile?.full_name}</p>
                <div className="flex gap-1 justify-end">
                  {roles.map((r, i) => {
                    const { label, variant } = getRoleBadge(r.role);
                    return (
                      <Badge key={i} variant={variant} className="text-[10px] px-1.5 py-0">
                        {label}
                      </Badge>
                    );
                  })}
                </div>
              </div>
              <Button variant="ghost" size="icon" asChild>
                <Link to="/admin/settings">
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>

      <OnboardingWizard
        open={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
      />
    </SidebarProvider>
  );
}
