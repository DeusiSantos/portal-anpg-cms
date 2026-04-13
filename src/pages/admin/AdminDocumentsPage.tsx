import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
  DialogFooter,
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
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  ArrowLeft,
  Plus,
  Search,
  Pencil,
  Trash2,
  FolderOpen,
  Download,
  Eye,
  EyeOff,
  FileText,
  Upload,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type InvestorDocument = Tables<'investor_documents'>;

const CATEGORIES = [
  { value: 'general', label: 'Geral' },
  { value: 'legislation', label: 'Legislação' },
  { value: 'contracts', label: 'Contratos' },
  { value: 'reports', label: 'Relatórios' },
  { value: 'presentations', label: 'Apresentações' },
  { value: 'data_packages', label: 'Pacotes de Dados' },
];

const emptyDoc: Partial<TablesInsert<'investor_documents'>> = {
  document_name: '',
  description: '',
  category: 'general',
  is_public: false,
  file_url: '',
};

export default function AdminDocumentsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<InvestorDocument | null>(null);
  const [formData, setFormData] = useState<Partial<TablesInsert<'investor_documents'>>>(emptyDoc);
  const [deleteDoc, setDeleteDoc] = useState<InvestorDocument | null>(null);
  const [uploading, setUploading] = useState(false);

  // Fetch documents
  const { data: documents, isLoading } = useQuery({
    queryKey: ['admin-documents', filterCategory],
    queryFn: async () => {
      let query = supabase
        .from('investor_documents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (filterCategory !== 'all') {
        query = query.eq('category', filterCategory);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as InvestorDocument[];
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: TablesInsert<'investor_documents'>) => {
      const { error } = await supabase.from('investor_documents').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-documents'] });
      toast.success('Documento adicionado com sucesso');
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error(`Erro ao adicionar documento: ${error.message}`);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TablesUpdate<'investor_documents'> }) => {
      const { error } = await supabase.from('investor_documents').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-documents'] });
      toast.success('Documento actualizado com sucesso');
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error(`Erro ao actualizar documento: ${error.message}`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('investor_documents').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-documents'] });
      toast.success('Documento eliminado com sucesso');
      setDeleteDoc(null);
    },
    onError: (error) => {
      toast.error(`Erro ao eliminar documento: ${error.message}`);
    },
  });

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filePath = `documents/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('investor-docs')
      .upload(filePath, file);

    if (uploadError) {
      toast.error('Erro ao fazer upload do ficheiro');
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('investor-docs')
      .getPublicUrl(filePath);

    setFormData({
      ...formData,
      file_url: publicUrl,
      document_name: formData.document_name || file.name.replace(`.${fileExt}`, ''),
      file_size_bytes: file.size,
    });
    setUploading(false);
    toast.success('Ficheiro carregado com sucesso');
  };

  const handleOpenCreate = () => {
    setEditingDoc(null);
    setFormData(emptyDoc);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (doc: InvestorDocument) => {
    setEditingDoc(doc);
    setFormData({
      document_name: doc.document_name,
      description: doc.description || '',
      category: doc.category || 'general',
      is_public: doc.is_public || false,
      file_url: doc.file_url,
      file_size_bytes: doc.file_size_bytes || undefined,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingDoc(null);
    setFormData(emptyDoc);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.document_name || !formData.file_url) {
      toast.error('Nome e ficheiro são obrigatórios');
      return;
    }

    const submitData: TablesInsert<'investor_documents'> = {
      document_name: formData.document_name!,
      file_url: formData.file_url!,
      description: formData.description || null,
      category: formData.category || 'general',
      is_public: formData.is_public || false,
      file_size_bytes: formData.file_size_bytes || null,
      uploaded_by: user?.id || null,
    };

    if (editingDoc) {
      updateMutation.mutate({ id: editingDoc.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const filteredDocs = documents?.filter((doc) =>
    doc.document_name.toLowerCase().includes(search.toLowerCase()) ||
    doc.description?.toLowerCase().includes(search.toLowerCase())
  );

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getCategoryLabel = (category: string | null) => {
    return CATEGORIES.find(c => c.value === category)?.label || category || 'Geral';
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout title="Documentos do Investidor" subtitle="Gerir documentos do portal">

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Gestão de Documentos</CardTitle>
                <CardDescription>Gerir documentos disponíveis para investidores</CardDescription>
              </div>
              <Button onClick={handleOpenCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Documento
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar documentos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
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
                      <TableHead>Documento</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Tamanho</TableHead>
                      <TableHead>Visibilidade</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Acções</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocs?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Nenhum documento encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDocs?.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{doc.document_name}</p>
                                {doc.description && (
                                  <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                                    {doc.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{getCategoryLabel(doc.category)}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatFileSize(doc.file_size_bytes)}
                          </TableCell>
                          <TableCell>
                            {doc.is_public ? (
                              <Badge className="bg-status-success text-white">
                                <Eye className="h-3 w-3 mr-1" />
                                Público
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <EyeOff className="h-3 w-3 mr-1" />
                                Privado
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {format(new Date(doc.created_at), "d MMM yyyy", { locale: pt })}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" asChild>
                                <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(doc)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => setDeleteDoc(doc)}>
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
          </CardContent>
        </Card>
      </main>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingDoc ? 'Editar Documento' : 'Adicionar Documento'}</DialogTitle>
            <DialogDescription>
              {editingDoc ? 'Actualizar informações do documento' : 'Carregar um novo documento'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {/* File Upload */}
              {!editingDoc && (
                <div className="space-y-2">
                  <Label>Ficheiro *</Label>
                  <label className="flex flex-col items-center justify-center h-32 rounded-lg border-2 border-dashed border-muted-foreground/25 cursor-pointer hover:border-primary/50 transition-colors">
                    {uploading ? (
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : formData.file_url ? (
                      <div className="text-center">
                        <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Ficheiro carregado</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">Clique para carregar</span>
                      </>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                  </label>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="document_name">Nome do Documento *</Label>
                <Input
                  id="document_name"
                  value={formData.document_name || ''}
                  onChange={(e) => setFormData({ ...formData, document_name: e.target.value })}
                  placeholder="Ex: Relatório Anual 2024"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição do documento..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={formData.category || 'general'}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Documento Público</Label>
                  <p className="text-sm text-muted-foreground">
                    Acessível a todos os visitantes
                  </p>
                </div>
                <Switch
                  checked={formData.is_public || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving || uploading}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingDoc ? 'Actualizar' : 'Adicionar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteDoc} onOpenChange={() => setDeleteDoc(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Documento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que deseja eliminar "{deleteDoc?.document_name}"?
              Esta acção não pode ser revertida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDoc && deleteMutation.mutate(deleteDoc.id)}
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
