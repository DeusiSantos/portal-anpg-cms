import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePendingCounts } from '@/hooks/useCMSData';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Newspaper,
  FileText,
  MapPin,
  BarChart3,
  Briefcase,
  FolderOpen,
  Users,
  History,
  LogOut,
  Settings,
  BookOpen,
  LayoutGrid,
  Menu,
  UserCheck,
  HelpCircle,
  Image,
  Clock,
  SlidersHorizontal,
  Globe,
  ExternalLink,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  permission: 'admin' | 'content' | 'operations' | 'investors';
  badgeKey?: string;
}

const contentItems: NavItem[] = [
  { title: 'Páginas do Site', href: '/admin/site-pages', icon: Globe, permission: 'content' },
  { title: 'Homepage', href: '/admin/homepage-content', icon: SlidersHorizontal, permission: 'content' },
  { title: 'Notícias', href: '/admin/news', icon: Newspaper, permission: 'content', badgeKey: 'draftNews' },
  { title: 'Banners', href: '/admin/page-banners', icon: Image, permission: 'content' },
  { title: 'Blocos de Conteúdo', href: '/admin/content-blocks', icon: LayoutGrid, permission: 'content' },
  { title: 'Slides Hero', href: '/admin/hero-slides', icon: SlidersHorizontal, permission: 'content' },
  { title: 'Menu / Navegação', href: '/admin/menu-items', icon: Menu, permission: 'content' },
  { title: 'Conselho Admin.', href: '/admin/board-members', icon: UserCheck, permission: 'content' },
  { title: 'FAQ', href: '/admin/faq', icon: HelpCircle, permission: 'content' },
  { title: 'Central de Media', href: '/admin/media', icon: Image, permission: 'content' },
  { title: 'Linha do Tempo', href: '/admin/history-events', icon: Clock, permission: 'content' },
  { title: 'Base Conhecimento', href: '/admin/knowledge-base', icon: BookOpen, permission: 'content' },
  { title: 'Páginas CMS', href: '/admin/pages', icon: FileText, permission: 'content' },
];

const operationsItems: NavItem[] = [
  { title: 'Blocos Petrolíferos', href: '/admin/blocks', icon: MapPin, permission: 'operations' },
  { title: 'Produção', href: '/admin/production', icon: BarChart3, permission: 'operations' },
];

const investorItems: NavItem[] = [
  { title: 'Investidores', href: '/admin/investors', icon: Users, permission: 'investors', badgeKey: 'pendingInvestors' },
  { title: 'Expressões Interesse', href: '/admin/eoi', icon: Briefcase, permission: 'investors', badgeKey: 'pendingEois' },
  { title: 'Documentos', href: '/admin/documents', icon: FolderOpen, permission: 'investors' },
];

const systemItems: NavItem[] = [
  { title: 'Utilizadores', href: '/admin/users', icon: Users, permission: 'admin' },
  { title: 'Audit Logs', href: '/admin/audit', icon: History, permission: 'admin' },
  { title: 'Configurações', href: '/admin/settings', icon: Settings, permission: 'admin' },
];

export function AdminSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { isAdmin, canManageContent, canManageOperations, canManageInvestors, signOut } = useAuth();
  const { data: pending } = usePendingCounts();

  const badgeCounts: Record<string, number> = {
    draftNews: pending?.draftNews ?? 0,
    pendingInvestors: pending?.pendingInvestors ?? 0,
    pendingEois: pending?.pendingEois ?? 0,
  };

  const hasPermission = (permission: string) => {
    switch (permission) {
      case 'admin': return isAdmin;
      case 'content': return canManageContent;
      case 'operations': return canManageOperations;
      case 'investors': return canManageInvestors;
      default: return true;
    }
  };

  const isActive = (href: string) => location.pathname === href;

  const renderGroup = (label: string, items: NavItem[]) => {
    const filtered = items.filter(i => hasPermission(i.permission));
    if (filtered.length === 0) return null;

    return (
      <SidebarGroup key={label}>
        <SidebarGroupLabel>{label}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {filtered.map((item) => {
              const count = item.badgeKey ? badgeCounts[item.badgeKey] : 0;
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={collapsed ? `${item.title}${count ? ` (${count})` : ''}` : undefined}
                  >
                    <Link to={item.href} className="flex items-center justify-between w-full">
                      <span className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </span>
                      {count > 0 && !collapsed && (
                        <Badge variant="destructive" className="ml-auto h-5 min-w-5 px-1.5 text-[10px] font-bold">
                          {count}
                        </Badge>
                      )}
                      {count > 0 && collapsed && (
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b px-4 py-3">
        <Link to="/admin" className="flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5 text-primary shrink-0" />
          {!collapsed && <span className="font-semibold text-sm">Backoffice ANPG</span>}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* Dashboard */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === '/admin'}
                  tooltip={collapsed ? 'Dashboard' : undefined}
                >
                  <Link to="/admin">
                    <LayoutDashboard className="h-4 w-4" />
                    {!collapsed && <span>Dashboard</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {renderGroup('Conteúdo', contentItems)}
        {renderGroup('Operações', operationsItems)}
        {renderGroup('Investidores', investorItems)}
        {renderGroup('Sistema', systemItems)}
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        <div className="flex flex-col gap-1">
          <Button variant="ghost" size="sm" asChild className="justify-start">
            <a href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              {!collapsed && 'Ver Website'}
            </a>
          </Button>
          <Button variant="ghost" size="sm" onClick={signOut} className="justify-start text-destructive hover:text-destructive">
            <LogOut className="h-4 w-4 mr-2" />
            {!collapsed && 'Terminar Sessão'}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
