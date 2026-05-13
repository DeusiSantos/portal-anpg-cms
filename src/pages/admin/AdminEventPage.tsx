import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Pagination, PaginationContent, PaginationEllipsis, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious
} from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Pencil, Trash2, Eye, Loader2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/service/api';

// Tipos da API
type EventStatus = 1 | 2 | 3; // 1 = Draft, 2 = Published, 3 = Archived

interface EventCategoryContent {
  lang: number;
  name: string;
}

interface EventCategory {
  id: string;
  slug: string;
  displayOrder: number;
  contents: EventCategoryContent[];
  isActive: boolean;
}

interface EventContent {
  lang: number;
  title: string;
  description: string;
  body: string;
}

interface EventItem {
  id: string;
  slug: string;
  startAt: string;
  endAt: string;
  location: string;
  mapUrl: string;
  registrationUrl: string;
  featuredImageUrl: string;
  categoryId: string;
  status: EventStatus;
  contents: EventContent[];
  isActive: boolean;
  createdAt: string;
}

interface EventsResponse {
  items: EventItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalActive: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// STATUS CONFIG
const STATUS_CONFIG: Record<EventStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  1: { label: 'Rascunho', variant: 'secondary' },
  2: { label: 'Publicado', variant: 'default' },
  3: { label: 'Arquivado', variant: 'outline' },
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos os estados' },
  { value: '1', label: 'Rascunho' },
  { value: '2', label: 'Publicado' },
  { value: '3', label: 'Arquivado' },
];

// Função para obter conteúdo por idioma
const getContentByLang = (contents: EventContent[], lang: number): EventContent | undefined => {
  return contents?.find(c => c.lang === lang);
};

export default function AdminEventPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [deleteItem, setDeleteItem] = useState<EventItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Buscar categorias
  const { data: categoriesData } = useQuery({
    queryKey: ['event-categories'],
    queryFn: async () => {
      const response = await api.get<{ items: EventCategory[] }>('/event-categories', {
        params: { page: 1, pageSize: 100 }
      });
      return response.data;
    },
  });

  // Buscar eventos
  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['admin-events', currentPage, search, statusFilter],
    queryFn: async () => {
      const params: Record<string, string | number> = {
        page: currentPage,
        pageSize: 10,
      };
      
      if (search) {
        params.search = search;
      }
      
      if (statusFilter && statusFilter !== 'all') {
        params.status = Number(statusFilter);
      }
      
      const response = await api.get<EventsResponse>('/events', { params });
      return response.data;
    },
  });

  const categories = categoriesData?.items || [];
  const events = eventsData?.items || [];
  const totalCount = eventsData?.totalCount || 0;
  const totalPages = eventsData?.totalPages || 1;

  // Eliminar evento
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/events/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      toast.success('Evento eliminado com sucesso');
      setDeleteItem(null);
    },
    onError: (error: any) => {
      console.error('Erro ao eliminar evento:', error);
      toast.error(error.response?.data?.message || 'Erro ao eliminar evento');
    },
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return 'Sem categoria';
    const ptContent = category.contents?.find(c => c.lang === 1);
    return ptContent?.name || categoryId;
  };

  const getStatusBadge = (status: EventStatus) => {
    const config = STATUS_CONFIG[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-PT');
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <AdminLayout title="Eventos" subtitle="Gerir eventos e agenda">
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Eventos</CardTitle>
                <CardDescription>Gerir eventos, conferências e actividades da ANPG</CardDescription>
              </div>
              <Button asChild>
                <Link to="/admin/events/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Evento
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar eventos..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center gap-4">
                <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Todos os estados" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {totalCount} {totalCount === 1 ? 'evento' : 'eventos'}
                </span>
              </div>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título (PT)</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Local</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Activo</TableHead>
                      <TableHead className="text-right">Acções</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {search || statusFilter !== 'all' ? 'Nenhum evento encontrado com os filtros aplicados.' : 'Ainda não existem eventos. Crie o primeiro!'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      events.map((event) => {
                        const ptContent = getContentByLang(event.contents, 1);
                        return (
                          <TableRow key={event.id}>
                            <TableCell className="font-medium max-w-[250px] truncate">
                              {ptContent?.title || 'Sem título'}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm">{formatDate(event.startAt)}</span>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[150px] truncate">
                              {event.location || '—'}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {getCategoryName(event.categoryId)}
                              </Badge>
                            </TableCell>
                            <TableCell>{getStatusBadge(event.status)}</TableCell>
                            <TableCell>
                              <Badge variant={event.isActive ? 'default' : 'secondary'}>
                                {event.isActive ? 'Sim' : 'Não'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {event.status === 2 && event.isActive && (
                                  <Button variant="ghost" size="icon" asChild>
                                    <Link to={`/events/${event.id}`} target="_blank">
                                      <Eye className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                )}
                                <Button variant="ghost" size="icon" asChild>
                                  <Link to={`/admin/events/${event.id}`}>
                                    <Pencil className="h-4 w-4" />
                                  </Link>
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => setDeleteItem(event)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) setCurrentPage(currentPage - 1);
                        }}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              isActive={page === currentPage}
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(page);
                              }}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}
                    
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                        }}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Evento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que deseja eliminar o evento "{deleteItem && (() => {
                const ptContent = getContentByLang(deleteItem.contents, 1);
                return ptContent?.title || 'Sem título';
              })()}"?
              Esta acção não pode ser revertida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteItem && deleteMutation.mutate(deleteItem.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}