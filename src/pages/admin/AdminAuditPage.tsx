// AdminAuditPage.tsx - Sem colunas ID, De e Para
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  Search,
  Filter,
  Loader2,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import api from '@/service/api';

interface WorkflowHistory {
  id: string;
  entityId: string;
  entityName: string;
  fromStatus: string;
  toStatus: string;
  comment: string | null;
  changedBy: string | null;
  userName: string | null;
  ipAddress: string;
  createdAt: string;
  action: string | null;
}

interface AuditTrialDto {
  id: string;
  action: string | null;
  entityName: string | null;
  entityPrimaryKey: string | null;
  before: string | null;
  after: string | null;
  userName: string | null;
  userEmail: string | null;
  createdAt: string;
}

interface AuditTrialsPaged {
  items: AuditTrialDto[];
  totalCount?: number;
  page?: number;
  pageSize?: number;
}

// Função para extrair status do JSON before/after
const extractStatus = (jsonStr: string | null): string => {
  if (!jsonStr) return '—';
  
  try {
    const data = JSON.parse(jsonStr);
    return data.Status || data.state || data.status || '—';
  } catch {
    return jsonStr.replace(/\s+/g, ' ').trim().slice(0, 48) || '—';
  }
};

// Função para extrair nome da entidade da ação
const extractEntityNameFromAction = (action: string | null): string => {
  if (!action) return '(desconhecido)';
  
  if (action.includes('Menu')) return 'Menu';
  if (action.includes('News')) return 'News';
  if (action.includes('PetroleumBlock')) return 'PetroleumBlock';
  if (action.includes('ProductionStatistics')) return 'ProductionStatistics';
  if (action.includes('InvestorDocument')) return 'InvestorDocument';
  if (action.includes('ExpressionOfInterest')) return 'ExpressionOfInterest';
  if (action.includes('Identity')) return 'Identity';
  if (action.includes('Faq')) return 'Faq';
  if (action.includes('Workflow')) return 'Workflow';
  
  return action.split('_')[0] || '(desconhecido)';
};

function auditTrialToRow(a: AuditTrialDto): WorkflowHistory {
  return {
    id: a.id,
    entityId: a.entityPrimaryKey || "",
    entityName: a.entityName || extractEntityNameFromAction(a.action),
    fromStatus: extractStatus(a.before),
    toStatus: extractStatus(a.after),
    comment: a.action,
    changedBy: a.userEmail,
    userName: a.userName,
    ipAddress: "—",
    createdAt: a.createdAt,
    action: a.action,
  };
}

const ENTITY_TYPES = [
  { value: 'Identity', label: 'Identidade' },
  { value: 'News', label: 'Notícias' },
  { value: 'PetroleumBlock', label: 'Bloco Petrolífero' },
  { value: 'ProductionStatistics', label: 'Estatísticas de Produção' },
  { value: 'InvestorDocument', label: 'Documentos Investidor' },
  { value: 'ExpressionOfInterest', label: 'EOI' },
  { value: 'Menu', label: 'Menu' },
  { value: 'Faq', label: 'FAQ' },
  { value: 'Workflow', label: 'Workflow' },
  { value: 'User', label: 'Utilizador' },
  { value: 'Role', label: 'Perfil' },
  { value: 'Permission', label: 'Permissão' },
  { value: 'ContentBlock', label: 'Bloco de Conteúdo' },
  { value: 'SiteSetting', label: 'Configuração do Site' },
  { value: 'AuditTrial', label: 'Auditoria' },
];

const ACTION_LABELS: Record<string, string> = {
  'Created': 'Criado',
  'Updated': 'Atualizado',
  'Deleted': 'Eliminado',
  'Published': 'Publicado',
  'Archived': 'Arquivado',
  'Restored': 'Restaurado',
  'StatusChanged': 'Status Alterado',
  'Submitted': 'Submetido',
  'Approved': 'Aprovado',
  'Rejected': 'Rejeitado',
  'Reviewed': 'Revisto',
};

const getActionLabel = (action: string | null): string => {
  if (!action) return '—';
  for (const [key, label] of Object.entries(ACTION_LABELS)) {
    if (action.includes(key)) return label;
  }
  return action;
};

export default function AdminAuditPage() {
  const [search, setSearch] = useState('');
  const [filterEntity, setFilterEntity] = useState<string>('all');
  const [pageIndex, setPageIndex] = useState(0);
  const [selectedHistory, setSelectedHistory] = useState<WorkflowHistory | null>(null);
  const pageSize = 20;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['audit-trials', filterEntity, pageIndex],
    queryFn: async () => {
      const response = await api.get<AuditTrialsPaged>('/audit-trials', {
        params: {
          Page: pageIndex + 1,
          PageSize: pageSize,
        },
      });
      const items = (response.data.items ?? []).map(auditTrialToRow);
      return {
        items,
        totalCount: response.data.totalCount ?? items.length,
      };
    },
  });

  const histories = data?.items || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const filteredHistories = histories.filter((history) => {
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      history.entityName?.toLowerCase().includes(searchLower) ||
      history.userName?.toLowerCase().includes(searchLower) ||
      history.comment?.toLowerCase().includes(searchLower);
    
    const matchesEntity = filterEntity === 'all' || history.entityName === filterEntity;
    
    return matchesSearch && matchesEntity;
  });

  const getEntityLabel = (entityName: string) => {
    return ENTITY_TYPES.find(e => e.value === entityName)?.label || entityName;
  };

  const handlePreviousPage = () => {
    if (pageIndex > 0) setPageIndex(pageIndex - 1);
  };

  const handleNextPage = () => {
    if (pageIndex + 1 < totalPages) setPageIndex(pageIndex + 1);
  };

  return (
    <AdminLayout title="Auditoria" subtitle="Histórico de alterações do sistema">
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Auditoria</CardTitle>
            <CardDescription>
              Registo de todas as alterações e ações realizadas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por entidade, utilizador ou ação..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterEntity} onValueChange={setFilterEntity}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Tipo de Entidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Entidades</SelectItem>
                  {ENTITY_TYPES.map((entity) => (
                    <SelectItem key={entity.value} value={entity.value}>
                      {entity.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Loading State */}
            {(isLoading || isFetching) && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* Table */}
            {!isLoading && (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Ação</TableHead>
                        <TableHead>Entidade</TableHead>
                        <TableHead>Utilizador</TableHead>
                        <TableHead className="text-right">Detalhes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHistories.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            Nenhum registo encontrado
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredHistories.map((history) => (
                          <TableRow key={history.id}>
                            <TableCell className="font-mono text-sm whitespace-nowrap">
                              {format(new Date(history.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: pt })}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {getActionLabel(history.comment)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {getEntityLabel(history.entityName)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {history.userName || history.changedBy || 'Sistema'}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedHistory(history)}
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

                {/* Pagination */}
                {totalCount > 0 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Mostrando {pageIndex * pageSize + 1} - {Math.min((pageIndex + 1) * pageSize, totalCount)} de {totalCount} registos
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreviousPage}
                        disabled={pageIndex === 0}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={pageIndex + 1 >= totalPages}
                      >
                        Próxima
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Detail Dialog */}
      <Dialog open={!!selectedHistory} onOpenChange={() => setSelectedHistory(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalhes da Transição</DialogTitle>
            <DialogDescription>
              {selectedHistory && (
                <>
                  {getEntityLabel(selectedHistory.entityName)} • {format(new Date(selectedHistory.createdAt), "dd/MM/yyyy 'às' HH:mm:ss", { locale: pt })}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedHistory && (
            <div className="space-y-4 py-4">
              {/* Ação */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Ação</p>
                <Badge variant="secondary" className="text-base">
                  {getActionLabel(selectedHistory.comment)}
                </Badge>
              </div>

              {/* Utilizador */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Utilizador</p>
                <p className="font-medium">{selectedHistory.userName || selectedHistory.changedBy || 'Sistema'}</p>
              </div>

              {/* Data */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Data/Hora</p>
                <p className="font-mono text-sm">
                  {format(new Date(selectedHistory.createdAt), "dd/MM/yyyy 'às' HH:mm:ss", { locale: pt })}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}