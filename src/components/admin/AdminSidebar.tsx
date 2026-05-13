import React from 'react';
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
  ChevronRight,
  Calendar,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

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
  { title: 'Eventos', href: '/admin/events', icon: Calendar, permission: 'content', badgeKey: 'draftEvents' },
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
  const { user } = useAuth();
  const { data: pending } = usePendingCounts();

  const badgeCounts: Record<string, number> = {
    draftNews: pending?.draftNews ?? 0,
    pendingInvestors: pending?.pendingInvestors ?? 0,
    pendingEois: pending?.pendingEois ?? 0,
  };

  // Determinar permissões baseado no roleCode do AuthUser (em maiúsculas)
  const roleCode = user?.roleCode ?? '';
  const isAdmin = roleCode === 'ADMIN';
  const canManageContent = isAdmin || roleCode === 'CONTENT_MANAGER';
  const canManageOperations = isAdmin || roleCode === 'OPERATIONS_MANAGER';
  const canManageInvestors = isAdmin || roleCode === 'INVESTORS_MANAGER';

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

  const [openGroup, setOpenGroup] = React.useState<string | null>('Conteúdo');

  const handleGroupToggle = (label: string) => {
    setOpenGroup((prev) => (prev === label ? null : label));
  };

  const renderGroup = (label: string, items: NavItem[]) => {
    const filtered = items.filter(i => hasPermission(i.permission));
    if (filtered.length === 0) return null;

    const isOpen = openGroup === label;

    return (
      <Collapsible key={label} open={isOpen} onOpenChange={() => handleGroupToggle(label)} className="group/collapsible">
        <SidebarGroup className="py-1.5">
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex w-full items-center justify-between transition-colors group-data-[collapsible=icon]:hidden cursor-pointer rounded-md mb-1 p-1">
              <span className="font-semibold text-xs tracking-wider uppercase text-muted-foreground/80">{label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground/60 transition-transform group-data-[state=open]/collapsible:rotate-90" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                {filtered.map((item) => {
                  const count = item.badgeKey ? badgeCounts[item.badgeKey] : 0;
                  const active = isActive(item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={collapsed ? `${item.title}${count ? ` (${count})` : ''}` : undefined}
                        className={`transition-all duration-200 ${active ? 'bg-primary/10 text-primary font-medium hover:bg-primary/15' : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'}`}
                      >
                        <Link to={item.href} className="flex items-center justify-between w-full">
                          <span className="flex items-center gap-3">
                            <item.icon className={`h-4 w-4 ${active ? 'text-primary' : ''}`} />
                            {!collapsed && <span>{item.title}</span>}
                          </span>
                          {count > 0 && !collapsed && (
                            <Badge variant="destructive" className="ml-auto h-5 min-w-5 flex items-center justify-center px-1.5 text-[10px] font-bold border-none shadow-sm">
                              {count}
                            </Badge>
                          )}
                          {count > 0 && collapsed && (
                            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive shadow-sm ring-1 ring-background" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/40 bg-zinc-50/20 dark:bg-zinc-950/20">
      <SidebarHeader className="border-b border-border/40 px-4 py-4 flex group-data-[collapsible=icon]:justify-center">
        <Link to="/admin" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 group-data-[collapsible=icon]:bg-background shadow-sm border border-primary/10 group-data-[collapsible=icon]:border-border/50">
            <LayoutDashboard className="h-4 w-4 text-primary shrink-0" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-[13px] tracking-tight text-foreground">Backoffice</span>
              <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">ANPG</span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === '/admin'}
                  tooltip={collapsed ? 'Dashboard' : undefined}
                  className={`transition-all duration-200 ${location.pathname === '/admin' ? 'bg-primary/10 text-primary font-medium hover:bg-primary/15' : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'}`}
                >
                  <Link to="/admin" className="flex items-center gap-3">
                    <LayoutDashboard className={`h-4 w-4 ${location.pathname === '/admin' ? 'text-primary' : ''}`} />
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

      <SidebarFooter className="border-t border-border/40 p-3">
        <div className="flex flex-col gap-1">
          <Button variant="outline" size="sm" asChild className="justify-start w-full bg-primary border-border/50 font-medium transition-all shadow-sm group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0">
            <a href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2 group-data-[collapsible=icon]:mr-0 text-white" />
              <span className='text-white'>{!collapsed && 'Ver Website'}</span>
            </a>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}