import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  ArrowLeft,
  Search,
  History,
  Filter,
  Loader2,
  Eye,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import type { Tables } from '@/integrations/supabase/types';

type AuditLog = Tables<'audit_logs'>;

const ACTIONS = [
  { value: 'INSERT', label: 'Criação', icon: Plus, color: 'bg-status-success' },
  { value: 'UPDATE', label: 'Actualização', icon: Pencil, color: 'bg-status-info' },
  { value: 'DELETE', label: 'Eliminação', icon: Trash2, color: 'bg-destructive' },
];

const TABLES = [
  { value: 'news_articles', label: 'Notícias' },
  { value: 'cms_pages', label: 'Páginas CMS' },
  { value: 'petroleum_blocks', label: 'Blocos Petrolíferos' },
  { value: 'production_statistics', label: 'Estatísticas de Produção' },
  { value: 'investor_documents', label: 'Documentos' },
  { value: 'investor_registrations', label: 'Registos Investidor' },
  { value: 'expressions_of_interest', label: 'EOIs' },
  { value: 'profiles', label: 'Perfis' },
  { value: 'user_roles', label: 'Roles' },
  { value: 'site_settings', label: 'Configurações' },
];

export default function AdminAuditPage() {
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterTable, setFilterTable] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Fetch audit logs
  const { data: logs, isLoading } = useQuery({
    queryKey: ['admin-audit-logs', filterAction, filterTable],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      
      if (filterAction !== 'all') {
        query = query.eq('action', filterAction);
      }
      if (filterTable !== 'all') {
        query = query.eq('table_name', filterTable);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as AuditLog[];
    },
  });

  // Fetch user profiles for display
  const { data: profiles } = useQuery({
    queryKey: ['admin-profiles-map'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, email');
      if (error) throw error;
      return data.reduce((map, profile) => {
        map[profile.user_id] = profile;
        return map;
      }, {} as Record<string, { full_name: string; email: string }>);
    },
  });

  const filteredLogs = logs?.filter((log) => {
    const searchLower = search.toLowerCase();
    const tableName = TABLES.find(t => t.value === log.table_name)?.label || log.table_name;
    const userName = profiles?.[log.user_id || '']?.full_name || '';
    return (
      tableName.toLowerCase().includes(searchLower) ||
      userName.toLowerCase().includes(searchLower) ||
      log.record_id?.toLowerCase().includes(searchLower)
    );
  });

  const getActionBadge = (action: string) => {
    const actionConfig = ACTIONS.find((a) => a.value === action) || ACTIONS[0];
    const Icon = actionConfig.icon;
    return (
      <Badge variant="secondary" className={`${actionConfig.color} text-white`}>
        <Icon className="h-3 w-3 mr-1" />
        {actionConfig.label}
      </Badge>
    );
  };

  const getTableLabel = (tableName: string) => {
    return TABLES.find(t => t.value === tableName)?.label || tableName;
  };

  const getUserName = (userId: string | null) => {
    if (!userId) return 'Sistema';
    return profiles?.[userId]?.full_name || 'Desconhecido';
  };

  const formatJson = (data: unknown) => {
    if (!data) return null;
    return JSON.stringify(data, null, 2);
  };

  return (
    <AdminLayout title="Audit Logs" subtitle="Histórico de acções no sistema">

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Alterações</CardTitle>
            <CardDescription>
              Registo de todas as alterações efectuadas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por tabela, utilizador ou ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Acção" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Acções</SelectItem>
                  {ACTIONS.map((action) => (
                    <SelectItem key={action.value} value={action.value}>
                      {action.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterTable} onValueChange={setFilterTable}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Tabela" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Tabelas</SelectItem>
                  {TABLES.map((table) => (
                    <SelectItem key={table.value} value={table.value}>
                      {table.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Acção</TableHead>
                      <TableHead>Tabela</TableHead>
                      <TableHead>Utilizador</TableHead>
                      <TableHead>ID do Registo</TableHead>
                      <TableHead className="text-right">Detalhes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Nenhum registo encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs?.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-sm">
                            {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: pt })}
                          </TableCell>
                          <TableCell>{getActionBadge(log.action)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{getTableLabel(log.table_name)}</Badge>
                          </TableCell>
                          <TableCell>{getUserName(log.user_id)}</TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {log.record_id?.slice(0, 8)}...
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedLog(log)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Stats */}
            <div className="mt-4 text-sm text-muted-foreground">
              {filteredLogs?.length || 0} registo(s) encontrado(s)
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Log</DialogTitle>
            <DialogDescription>
              {selectedLog && (
                <>
                  {getTableLabel(selectedLog.table_name)} • {format(new Date(selectedLog.created_at), "dd/MM/yyyy 'às' HH:mm:ss", { locale: pt })}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-6 py-4">
              {/* Meta Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Acção</p>
                  <div className="mt-1">{getActionBadge(selectedLog.action)}</div>
                </div>
                <div>
                  <p className="text-muted-foreground">Utilizador</p>
                  <p className="font-medium mt-1">{getUserName(selectedLog.user_id)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">ID do Registo</p>
                  <p className="font-mono text-xs mt-1">{selectedLog.record_id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">IP Address</p>
                  <p className="font-mono text-xs mt-1">{selectedLog.ip_address || '—'}</p>
                </div>
              </div>

              {/* Old Data */}
              {selectedLog.old_data && (
                <div className="space-y-2">
                  <p className="font-semibold text-sm">Dados Anteriores</p>
                  <pre className="bg-destructive/5 dark:bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-xs overflow-x-auto">
                    {formatJson(selectedLog.old_data)}
                  </pre>
                </div>
              )}

              {/* New Data */}
              {selectedLog.new_data && (
                <div className="space-y-2">
                  <p className="font-semibold text-sm">Dados Novos</p>
                  <pre className="bg-status-success/5 dark:bg-status-success/10 border border-status-success/20 rounded-lg p-4 text-xs overflow-x-auto">
                    {formatJson(selectedLog.new_data)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
