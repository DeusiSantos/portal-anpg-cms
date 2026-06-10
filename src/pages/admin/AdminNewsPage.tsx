import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Pencil, Trash2, Eye, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { toast } from 'sonner';
import api from '@/service/api';

// Tipos da nova API
type NewsState = 1 | 2 | 3; // 1 = Draft, 2 = Published, 3 = Archived

interface NewsContent {
  lang: number; // 1 = Portuguese, 2 = English
  title: string;
  excerpt: string;
  content: string;
}

interface NewsItem {
  id: string;
  slug: string;
  state: NewsState;
  newsCategoryId: string;
  destaqueImageUrl: string;
  destaqueImagePath: string;
  contents: NewsContent[];
  createdAt: string;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  isDeleted: boolean;
  isActive: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
}

interface NewsResponse {
  items: NewsItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalActive: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface NewsCategory {
  id: string;
  name: string;
  isActive: boolean;
}

const STATE_LABELS: Record<NewsState, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  1: { label: 'Rascunho', variant: 'secondary' },
  2: { label: 'Publicado', variant: 'default' },
  3: { label: 'Arquivado', variant: 'outline' },
};

const STATE_OPTIONS = [
  { value: 'all', label: 'Todos os estados' },
  { value: '1', label: 'Rascunho' },
  { value: '2', label: 'Publicado' },
  { value: '3', label: 'Arquivado' },
];

const PAGE_SIZE = 10;

export default function AdminNewsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [deleteArticle, setDeleteArticle] = useState<NewsItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [stateFilter, setStateFilter] = useState<string>('all'); // Filtro por estado

  // Buscar categorias para mostrar o nome
  const { data: categories } = useQuery({
    queryKey: ['news-categories'],
    queryFn: async () => {
      const response = await api.get<{ items: NewsCategory[] }>('/news-categories', {
        params: { Page: 1, PageSize: 100 }
      });
      return response.data.items;
    },
  });

  const getCategoryName = (categoryId: string) => {
    const category = categories?.find(cat => cat.id === categoryId);
    return category?.name || categoryId;
  };

  // Fetch paginated news articles
  const { data: newsData, isLoading } = useQuery({
    queryKey: ['admin-news', currentPage, search, stateFilter],
    queryFn: async () => {
      const params: Record<string, string | number> = {
        Page: currentPage,
        PageSize: PAGE_SIZE,
      };
      
      if (search) {
        params.Search = search;
      }
      
      if (stateFilter && stateFilter !== 'all') {
        params.State = Number(stateFilter);
      }
      
      const response = await api.get<NewsResponse>('/news', { params });
      return response.data;
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/news/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
      toast.success('Notícia eliminada com sucesso');
      setDeleteArticle(null);
    },
    onError: (error: any) => {
      toast.error(`Erro ao eliminar: ${error.response?.data?.message || error.message}`);
    },
  });

  const totalCount = newsData?.totalCount || 0;
  const articles = newsData?.items || [];
  const totalPages = newsData?.totalPages || 1;

  // Reset to page 1 when search or filter changes
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleStateFilterChange = (value: string) => {
    setStateFilter(value);
    setCurrentPage(1);
  };

  const getStatusBadge = (state: NewsState) => {
    const config = STATE_LABELS[state];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getContentTitle = (contents: NewsContent[]) => {
    const portugueseContent = contents.find(c => c.lang === 1);
    return portugueseContent?.title || contents[0]?.title || 'Sem título';
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d MMM yyyy", { locale: pt });
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <AdminLayout title="Notícias" subtitle="Gerir artigos e publicações">
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Notícias</CardTitle>
                <CardDescription>Gerir artigos e comunicados de imprensa</CardDescription>
              </div>
              <Button asChild>
                <Link to="/admin/news/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Notícia
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
                  placeholder="Pesquisar notícias..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center gap-4">
                <Select value={stateFilter} onValueChange={handleStateFilterChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Todos os estados" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {totalCount} {totalCount === 1 ? 'notícia' : 'notícias'}
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
                      <TableHead>Slug</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Data de Criação</TableHead>
                      <TableHead>Activo</TableHead>
                      <TableHead className="text-right">Acções</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {articles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {search || stateFilter !== 'all' ? 'Nenhuma notícia encontrada com os filtros aplicados.' : 'Ainda não existem notícias. Crie a primeira!'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      articles.map((article) => (
                        <TableRow key={article.id}>
                          <TableCell className="font-medium max-w-[300px] truncate">
                            {getContentTitle(article.contents)}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                            {article.slug}
                          </TableCell>
                          <TableCell>{getStatusBadge(article.state)}</TableCell>
                          <TableCell>
                            {getCategoryName(article.newsCategoryId)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {formatDate(article.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={article.isActive ? 'default' : 'secondary'}>
                              {article.isActive ? 'Sim' : 'Não'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {article.state === 2 && article.isActive && (
                                <Button variant="ghost" size="icon" asChild>
                                  <Link to={`/news/${article?.id}`} target="_blank">
                                    <Eye className="h-4 w-4" />
                                  </Link>
                                </Button>
                              )}
                              <Button variant="ghost" size="icon" asChild>
                                <Link to={`/admin/news/${article.id}`}>
                                  <Pencil className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteArticle(article)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
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
      <AlertDialog open={!!deleteArticle} onOpenChange={() => setDeleteArticle(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Notícia</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que deseja eliminar "{deleteArticle && getContentTitle(deleteArticle.contents)}"?
              Esta acção não pode ser revertida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteArticle && deleteMutation.mutate(deleteArticle.id)}
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