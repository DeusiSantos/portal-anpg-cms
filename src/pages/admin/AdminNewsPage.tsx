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
import { Plus, Search, Pencil, Trash2, Eye, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { toast } from 'sonner';
import api from '@/service/api';


interface NewsItem {
  id: string;
  titlePt: string;
  slugOrURL: string | null;
  excerptPt: string;
  contentPt: string;
  titleEn: string;
  excerptEn: string;
  contentEn: string;
  publicationDate: string;
  category: string;
  contentCode: string;
  status: string;
}

interface NewsResponse {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: NewsItem[];
}

const PAGE_SIZE = 10;

export default function AdminNewsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [deleteArticle, setDeleteArticle] = useState<NewsItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch paginated news articles
  const { data: newsData, isLoading } = useQuery({
    queryKey: ['admin-news', currentPage, search],
    queryFn: async () => {
      const response = await api.get<{ news: NewsResponse }>('/news', {
        params: {
          PageIndex: currentPage - 1, // API uses 0-based index
          PageSize: PAGE_SIZE,
          ...(search && { search }), // Add search param if needed
        },
      });
      return response.data.news;
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

  const totalCount = newsData?.count || 0;
  const articles = newsData?.data || [];
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'draft':
      return <Badge variant="secondary">Rascunho</Badge>;

    case 'pendingreview':
      return <Badge className="bg-yellow-500 text-white">Revisão</Badge>;

    case 'reviewed':
      return <Badge className="bg-blue-500 text-white">Revisado</Badge>;

    case 'approved':
      return <Badge className="bg-emerald-600 text-white">Aprovado</Badge>;

    case 'published':
      return <Badge className="bg-green-600 text-white">Publicado</Badge>;

    case 'archived':
      return <Badge variant="outline">Arquivado</Badge>;

    case 'rejected':
      return <Badge className="bg-red-600 text-white">Rejeitado</Badge>;

    case 'deleted':
      return <Badge className="bg-gray-800 text-white">Eliminado</Badge>;

    case 'requestcorrection':
      return <Badge className="bg-orange-500 text-white">Correção Solicitada</Badge>;

    default:
      return <Badge variant="outline">{status || 'Rascunho'}</Badge>;
  }
};

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      geral: 'Geral',
      producao: 'Produção',
      exploracao: 'Exploração',
      licitacao: 'Licitação',
      institucional: 'Institucional',
      sustentabilidade: 'Sustentabilidade',
    };
    return categories[category] || category;
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
            {/* Search */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar notícias..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
              <span className="text-sm text-muted-foreground">
                {totalCount} {totalCount === 1 ? 'notícia' : 'notícias'}
              </span>
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
                      <TableHead>Título (PT)</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Acções</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {articles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          {search ? 'Nenhuma notícia encontrada.' : 'Ainda não existem notícias. Crie a primeira!'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      articles.map((article) => (
                        <TableRow key={article.id}>
                          <TableCell className="font-medium">{article.titlePt}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {article.contentCode}
                          </TableCell>
                          <TableCell>{getStatusBadge(article.status)}</TableCell>
                          <TableCell className="capitalize">
                            {getCategoryLabel(article.category)}
                          </TableCell>
                          <TableCell>
                            {format(new Date(article.publicationDate), "d MMM yyyy", { locale: pt })}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {article.status?.toLowerCase() === 'published' && (
                                <Button variant="ghost" size="icon" asChild>
                                  <Link to={`/news/${article.slugOrURL || article.id}`} target="_blank">
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
              Tem a certeza que deseja eliminar "{deleteArticle?.titlePt}"?
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