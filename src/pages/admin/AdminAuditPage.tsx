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
}

interface HistoryResponse {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: WorkflowHistory[];
}

const ENTITY_TYPES = [
  { value: 'Identity', label: 'Identidade' },
  { value: 'News', label: 'Notícias' },
  { value: 'PetroleumBlock', label: 'Bloco Petrolífero' },
  { value: 'ProductionStatistics', label: 'Estatísticas de Produção' },
  { value: 'InvestorDocument', label: 'Documentos Investidor' },
  { value: 'ExpressionOfInterest', label: 'EOI' },
];

const STATUS_COLORS: Record<string, string> = {
  Draft: 'bg-gray-500',
  PendingReview: 'bg-yellow-500',
  Reviewed: 'bg-blue-500',
  Approved: 'bg-green-500',
  Published: 'bg-purple-500',
  RequestCorrection: 'bg-red-500',
  Rejected: 'bg-red-700',
  Archived: 'bg-gray-700',
};

const getStatusBadge = (status: string) => {
  const color = STATUS_COLORS[status] || 'bg-gray-500';
  return (
    <Badge className={`${color} text-white`}>
      {status}
    </Badge>
  );
};

export default function AdminAuditPage() {
  const [search, setSearch] = useState('');
  const [filterEntity, setFilterEntity] = useState<string>('all');
  const [pageIndex, setPageIndex] = useState(0);
  const [selectedHistory, setSelectedHistory] = useState<WorkflowHistory | null>(null);
  const pageSize = 20;

  // Fetch workflow history
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['workflow-history', filterEntity, pageIndex],
    queryFn: async () => {
      const params = new URLSearchParams({
        PageIndex: pageIndex.toString(),
        PageSize: pageSize.toString(),
      });
      
      const response = await api.get(`/workflow/history?${params}`);
      
      // Acessar a estrutura correta: response.data.histories
      const historyData = response.data?.histories || response.data;
      
      return {
        items: historyData?.data || [],
        totalCount: historyData?.count || 0,
        pageIndex: historyData?.pageIndex || 0,
        pageSize: historyData?.pageSize || pageSize,
      };
    },
  });

  const histories = data?.items || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Filtrar por entidade (client-side filter)
  const filteredHistories = histories.filter((history) => {
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      history.entityName?.toLowerCase().includes(searchLower) ||
      history.entityId?.toLowerCase().includes(searchLower) ||
      history.userName?.toLowerCase().includes(searchLower) ||
      history.ipAddress?.includes(searchLower) ||
      history.comment?.toLowerCase().includes(searchLower);
    
    const matchesEntity = filterEntity === 'all' || history.entityName === filterEntity;
    
    return matchesSearch && matchesEntity;
  });

  const getEntityLabel = (entityName: string) => {
    return ENTITY_TYPES.find(e => e.value === entityName)?.label || entityName;
  };

  const handlePreviousPage = () => {
    if (pageIndex > 0) {
      setPageIndex(pageIndex - 1);
    }
  };

  const handleNextPage = () => {
    if (pageIndex + 1 < totalPages) {
      setPageIndex(pageIndex + 1);
    }
  };

  return (
    <AdminLayout title="Workflow History" subtitle="Histórico de alterações de estado do workflow">
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Workflow</CardTitle>
            <CardDescription>
              Registo de todas as alterações de estado das entidades no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por entidade, ID, utilizador, IP ou comentário..."
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
                        <TableHead>Entidade</TableHead>
                        <TableHead>Status Anterior</TableHead>
                        <TableHead>Novo Status</TableHead>
                        <TableHead>Utilizador</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead className="text-right">Detalhes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHistories.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
                              <Badge variant="outline">
                                {getEntityLabel(history.entityName)}
                              </Badge>
                            </TableCell>
                            <TableCell>{getStatusBadge(history.fromStatus)}</TableCell>
                            <TableCell>{getStatusBadge(history.toStatus)}</TableCell>
                            <TableCell>
                              {history.userName || history.changedBy || 'Sistema'}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {history.ipAddress}
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
            <div className="space-y-6 py-4">
              {/* Status Transition */}
              <div className="flex items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="text-center flex-1">
                  <p className="text-sm text-muted-foreground mb-2">De</p>
                  {getStatusBadge(selectedHistory.fromStatus)}
                </div>
                <div className="text-2xl text-muted-foreground">→</div>
                <div className="text-center flex-1">
                  <p className="text-sm text-muted-foreground mb-2">Para</p>
                  {getStatusBadge(selectedHistory.toStatus)}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">ID da Entidade</p>
                  <p className="font-mono text-xs mt-1 break-all">{selectedHistory.entityId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Entidade</p>
                  <p className="font-medium mt-1">{getEntityLabel(selectedHistory.entityName)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Utilizador</p>
                  <p className="font-medium mt-1">{selectedHistory.userName || selectedHistory.changedBy || 'Sistema'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">IP Address</p>
                  <p className="font-mono text-xs mt-1">{selectedHistory.ipAddress}</p>
                </div>
              </div>

              {/* Comment */}
              {selectedHistory.comment && (
                <div className="space-y-2">
                  <p className="text-muted-foreground text-sm">Comentário</p>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-sm">{selectedHistory.comment}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}