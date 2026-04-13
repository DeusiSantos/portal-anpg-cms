import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useDashboardCounts } from '@/hooks/useCMSData';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow, subDays, format, startOfDay } from 'date-fns';
import { pt } from 'date-fns/locale';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  Newspaper,
  FileText,
  MapPin,
  BarChart3,
  Briefcase,
  FolderOpen,
  Users,
  Globe,
  SlidersHorizontal,
  Clock,
  Activity,
} from 'lucide-react';

const quickLinks = [
  { title: 'Páginas do Site', href: '/admin/site-pages', icon: Globe, color: 'bg-primary' },
  { title: 'Notícias', href: '/admin/news', icon: Newspaper, color: 'bg-status-info' },
  { title: 'Homepage', href: '/admin/homepage-content', icon: SlidersHorizontal, color: 'bg-primary/80' },
  { title: 'Blocos Petrolíferos', href: '/admin/blocks', icon: MapPin, color: 'bg-status-warning/80' },
  { title: 'Produção', href: '/admin/production', icon: BarChart3, color: 'bg-status-success' },
  { title: 'Investidores', href: '/admin/investors', icon: Users, color: 'bg-primary/80' },
];

function useRecentActivity() {
  return useQuery({
    queryKey: ['admin-recent-activity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('id, action, table_name, record_id, created_at, user_id, new_data')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
  });
}

function useActivityChart() {
  return useQuery({
    queryKey: ['admin-activity-chart'],
    queryFn: async () => {
      const since = subDays(new Date(), 6);
      const { data, error } = await supabase
        .from('audit_logs')
        .select('action, created_at')
        .gte('created_at', since.toISOString());
      if (error) throw error;

      const days: Record<string, { date: string; label: string; inserts: number; updates: number; deletes: number }> = {};
      for (let i = 6; i >= 0; i--) {
        const d = startOfDay(subDays(new Date(), i));
        const key = format(d, 'yyyy-MM-dd');
        days[key] = { date: key, label: format(d, 'EEE dd', { locale: pt }), inserts: 0, updates: 0, deletes: 0 };
      }

      (data || []).forEach((row) => {
        const key = format(new Date(row.created_at), 'yyyy-MM-dd');
        if (!days[key]) return;
        if (row.action === 'INSERT') days[key].inserts++;
        else if (row.action === 'UPDATE') days[key].updates++;
        else if (row.action === 'DELETE') days[key].deletes++;
      });

      return Object.values(days);
    },
  });
}

const chartConfig = {
  inserts: { label: 'Criações', color: 'hsl(var(--primary))' },
  updates: { label: 'Edições', color: 'hsl(var(--status-warning, 45 93% 47%))' },
  deletes: { label: 'Remoções', color: 'hsl(var(--destructive))' },
};

function getActionLabel(action: string, tableName: string, newData: any) {
  const tableLabels: Record<string, string> = {
    news_articles: 'Notícia',
    content_blocks: 'Bloco de Conteúdo',
    page_banners: 'Banner',
    board_members: 'Membro do CA',
    faq_items: 'FAQ',
    menu_items: 'Menu',
    media_items: 'Media',
    petroleum_blocks: 'Bloco Petrolífero',
    production_statistics: 'Produção',
    site_settings: 'Configuração',
    history_events: 'Evento Histórico',
    cms_pages: 'Página CMS',
    knowledge_base: 'Base Conhecimento',
  };
  const actionLabels: Record<string, string> = { INSERT: 'criou', UPDATE: 'editou', DELETE: 'removeu' };
  const table = tableLabels[tableName] || tableName;
  const act = actionLabels[action] || action;
  const name = newData?.title || newData?.block_name || newData?.page_key || newData?.full_name || '';
  return `${act} ${table}${name ? `: ${name}` : ''}`;
}

export default function AdminDashboard() {
  const { profile, isAdmin, canManageContent, canManageOperations, canManageInvestors } = useAuth();
  const { data: counts } = useDashboardCounts();
  const { data: activity } = useRecentActivity();

  const { data: chartData } = useActivityChart();

  const hasPermission = (permission: string) => {
    switch (permission) {
      case 'admin': return isAdmin;
      case 'content': return canManageContent;
      case 'operations': return canManageOperations;
      case 'investors': return canManageInvestors;
      default: return true;
    }
  };

  return (
    <AdminLayout title="Dashboard" subtitle="Visão geral do backoffice">
      <div className="p-6 space-y-8">
        {/* Welcome */}
        <div>
          <h2 className="text-2xl font-bold">Bem-vindo, {profile?.full_name?.split(' ')[0]}</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Seleccione um módulo na barra lateral para gerir o conteúdo do site.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{counts?.newsCount ?? '--'}</div>
              <p className="text-sm text-muted-foreground">Notícias publicadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{counts?.blocksCount ?? '--'}</div>
              <p className="text-sm text-muted-foreground">Blocos activos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{counts?.eoisCount ?? '--'}</div>
              <p className="text-sm text-muted-foreground">EOIs pendentes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{counts?.docsCount ?? '--'}</div>
              <p className="text-sm text-muted-foreground">Documentos</p>
            </CardContent>
          </Card>
        </div>

        {/* Activity Chart */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Actividade dos últimos 7 dias</CardTitle>
            </div>
            <CardDescription>Operações registadas nos logs de auditoria</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData && chartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[220px] w-full">
                <BarChart data={chartData} barGap={2} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} width={30} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="inserts" fill="var(--color-inserts)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="updates" fill="var(--color-updates)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="deletes" fill="var(--color-deletes)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">Sem dados de actividade.</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Links + Activity Feed */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-3">Acesso Rápido</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {quickLinks.map((link) => (
                <Link key={link.href} to={link.href}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardHeader className="pb-2">
                      <div className={`w-10 h-10 rounded-lg ${link.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <link.icon className="h-5 w-5 text-white" />
                      </div>
                      <CardTitle className="text-sm">{link.title}</CardTitle>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Actividade Recente
            </h3>
            <Card>
              <CardContent className="p-0">
                {!activity || activity.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground">Sem actividade recente.</p>
                ) : (
                  <div className="divide-y">
                    {activity.map((log) => (
                      <div key={log.id} className="px-4 py-3">
                        <p className="text-sm">
                          <Badge variant={log.action === 'INSERT' ? 'default' : log.action === 'DELETE' ? 'destructive' : 'secondary'} className="text-[10px] mr-2">
                            {log.action === 'INSERT' ? 'Novo' : log.action === 'DELETE' ? 'Removido' : 'Editado'}
                          </Badge>
                          {getActionLabel(log.action, log.table_name, log.new_data)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: pt })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
