import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, HelpCircle, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import api, { getFullImageUrl } from '@/service/api';
import { DialogTrigger } from '@radix-ui/react-dialog';

// Tipos da API
interface FAQContent {
  lang: number;
  question: string;
  answer: string;
}

interface FAQItem {
  id: string;
  faqCategoryId: string;
  faqCategory?: FAQCategory;
  displayOrder: number;
  contents: FAQContent[];
  createdAt: string;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  isDeleted: boolean;
  isActive: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
}

interface FAQResponse {
  items: FAQItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalActive: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface FAQCategoryContent {
  lang: number;
  name: string;
}

interface FAQCategory {
  id: string;
  displayOrder: number;
  contents: FAQCategoryContent[];
  createdAt: string;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  isDeleted: boolean;
  isActive: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
}

interface FAQCategoryResponse {
  items: FAQCategory[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalActive: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface FAQFormData {
  faqCategoryId: string;
  displayOrder: number;
  questionPt: string;
  answerPt: string;
  questionEn: string;
  answerEn: string;
  isActive: boolean;
}

interface CategoryFormData {
  displayOrder: number;
  namePt: string;
  nameEn: string;
  isActive: boolean;
}

// Função para obter nome da categoria em português
const getCategoryName = (category: FAQCategory | undefined): string => {
  if (!category) return 'Sem categoria';
  const ptContent = category.contents?.find(c => c.lang === 1);
  return ptContent?.name || 'Sem nome';
};

// Função para obter pergunta em português
const getQuestionPt = (contents: FAQContent[]): string => {
  const ptContent = contents?.find(c => c.lang === 1);
  return ptContent?.question || 'Sem pergunta';
};

// Modal de criação de categoria
function CreateCategoryModal({ onCategoryCreated }: { onCategoryCreated: (category: FAQCategory) => void }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CategoryFormData>({
    displayOrder: 0,
    namePt: '',
    nameEn: '',
    isActive: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.namePt.trim()) {
      toast.error('Nome da categoria em português é obrigatório');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post<FAQCategory>('/faq-categories', {
        displayOrder: formData.displayOrder,
        namePt: formData.namePt.trim(),
        nameEn: formData.nameEn.trim() || '',
        isActive: formData.isActive,
      });
      toast.success('Categoria criada com sucesso!');
      onCategoryCreated(response.data);
      setOpen(false);
      setFormData({
        displayOrder: 0,
        namePt: '',
        nameEn: '',
        isActive: true,
      });
    } catch (error: any) {
      console.error('Erro ao criar categoria:', error);
      toast.error(error.response?.data?.message || 'Erro ao criar categoria');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-1">
          <PlusCircle className="h-4 w-4" />
          Nova Categoria
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Categoria de FAQ</DialogTitle>
          <DialogDescription>
            Adicione uma nova categoria para organizar as perguntas frequentes.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Tabs defaultValue="pt" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pt">Português</TabsTrigger>
              <TabsTrigger value="en">English</TabsTrigger>
            </TabsList>
            <TabsContent value="pt" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="namePt">Nome da Categoria (Português) *</Label>
                <Input
                  id="namePt"
                  value={formData.namePt}
                  onChange={(e) => setFormData({ ...formData, namePt: e.target.value })}
                  placeholder="Ex: Geral, Suporte, etc."
                />
              </div>
            </TabsContent>
            <TabsContent value="en" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="nameEn">Category Name (English)</Label>
                <Input
                  id="nameEn"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  placeholder="Ex: General, Support, etc."
                />
              </div>
            </TabsContent>
          </Tabs>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ordem de Exibição</Label>
              <Input
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300"
                />
                Activo
              </Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            Criar Categoria
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminFAQPage() {
  const queryClient = useQueryClient();
  const [filterCategoryId, setFilterCategoryId] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FAQItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<FAQItem | null>(null);
  const [formData, setFormData] = useState<FAQFormData>({
    faqCategoryId: '',
    displayOrder: 0,
    questionPt: '',
    answerPt: '',
    questionEn: '',
    answerEn: '',
    isActive: true,
  });

  // Buscar categorias de FAQ
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['admin-faq-categories'],
    queryFn: async () => {
      const response = await api.get<FAQCategoryResponse>('/faq-categories', {
        params: { Page: 1, PageSize: 100 }
      });
      return response.data;
    },
  });

  // Buscar FAQs
  const { data: faqsData, isLoading, error } = useQuery({
    queryKey: ['admin-faq-items'],
    queryFn: async () => {
      const response = await api.get<FAQResponse>('/faqs', {
        params: { Page: 1, PageSize: 100 }
      });
      return response.data;
    },
  });

  // Criar FAQ
  const createMutation = useMutation({
    mutationFn: async (data: FAQFormData) => {
      const payload = {
        faqCategoryId: data.faqCategoryId,
        displayOrder: data.displayOrder,
        questionPt: data.questionPt,
        answerPt: data.answerPt,
        questionEn: data.questionEn || '',
        answerEn: data.answerEn || '',
        isActive: data.isActive,
      };
      const response = await api.post('/faqs', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faq-items'] });
      toast.success('FAQ criada com sucesso');
      handleClose();
    },
    onError: (error: any) => {
      console.error('Erro ao criar FAQ:', error);
      toast.error(error.response?.data?.message || 'Erro ao criar FAQ');
    },
  });

  // Atualizar FAQ
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FAQFormData }) => {
      const payload = {
        id,
        faqCategoryId: data.faqCategoryId,
        displayOrder: data.displayOrder,
        questionPt: data.questionPt,
        answerPt: data.answerPt,
        questionEn: data.questionEn || '',
        answerEn: data.answerEn || '',
        isActive: data.isActive,
      };
      const response = await api.patch(`/faqs/${id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faq-items'] });
      toast.success('FAQ actualizada com sucesso');
      handleClose();
    },
    onError: (error: any) => {
      console.error('Erro ao actualizar FAQ:', error);
      toast.error(error.response?.data?.message || 'Erro ao actualizar FAQ');
    },
  });

  // Eliminar FAQ
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/faqs/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faq-items'] });
      toast.success('FAQ eliminada com sucesso');
      setDeleteItem(null);
    },
    onError: (error: any) => {
      console.error('Erro ao eliminar FAQ:', error);
      toast.error(error.response?.data?.message || 'Erro ao eliminar FAQ');
    },
  });

  const handleClose = () => {
    setIsDialogOpen(false);
    setEditing(null);
    setFormData({
      faqCategoryId: '',
      displayOrder: 0,
      questionPt: '',
      answerPt: '',
      questionEn: '',
      answerEn: '',
      isActive: true,
    });
  };

  const handleEdit = (item: FAQItem) => {
    const ptContent = item.contents?.find(c => c.lang === 1);
    const enContent = item.contents?.find(c => c.lang === 2);
    
    setEditing(item);
    setFormData({
      faqCategoryId: item.faqCategoryId,
      displayOrder: item.displayOrder || 0,
      questionPt: ptContent?.question || '',
      answerPt: ptContent?.answer || '',
      questionEn: enContent?.question || '',
      answerEn: enContent?.answer || '',
      isActive: item.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.faqCategoryId) {
      toast.error('Selecione uma categoria');
      return;
    }
    
    if (!formData.questionPt || !formData.answerPt) {
      toast.error('Pergunta e resposta em português são obrigatórias');
      return;
    }
    
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleCategoryCreated = (newCategory: FAQCategory) => {
    queryClient.invalidateQueries({ queryKey: ['admin-faq-categories'] });
    setFormData(prev => ({ ...prev, faqCategoryId: newCategory.id }));
    toast.success(`Categoria "${getCategoryName(newCategory)}" adicionada e selecionada!`);
  };

  const categories = categoriesData?.items || [];
  const faqs = faqsData?.items || [];
  
  const filteredFaqs = filterCategoryId === 'all'
    ? faqs
    : faqs.filter(f => f.faqCategoryId === filterCategoryId);

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (error) {
    return (
      <AdminLayout title="FAQ" subtitle="Gerir perguntas frequentes">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-red-500">
                <p>Erro ao carregar FAQs: {(error as any)?.message}</p>
                <Button 
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-faq-items'] })}
                  className="mt-4"
                >
                  Tentar novamente
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="FAQ" subtitle="Gerir perguntas frequentes">
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>FAQ</CardTitle>
                <CardDescription>Gerir perguntas e respostas frequentes do website</CardDescription>
              </div>
              <div className="flex gap-2">
                <CreateCategoryModal onCategoryCreated={handleCategoryCreated} />
                <Button onClick={() => { handleClose(); setIsDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova FAQ
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <Select value={filterCategoryId} onValueChange={setFilterCategoryId}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {getCategoryName(cat)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground self-center">
                {filteredFaqs.length} FAQ(s)
              </span>
            </div>

            {isLoading || categoriesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pergunta (PT)</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Ordem</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acções</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFaqs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Nenhuma FAQ encontrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredFaqs.map(item => {
                        const category = categories.find(c => c.id === item.faqCategoryId);
                        return (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium max-w-md truncate">
                              {getQuestionPt(item.contents)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {getCategoryName(category)}
                              </Badge>
                            </TableCell>
                            <TableCell>{item.displayOrder}</TableCell>
                            <TableCell>
                              <Badge variant={item.isActive ? 'default' : 'secondary'}>
                                {item.isActive ? 'Activa' : 'Inactiva'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => setDeleteItem(item)}>
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
          </CardContent>
        </Card>
      </main>

      {/* Modal de FAQ */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar FAQ' : 'Nova FAQ'}</DialogTitle>
            <DialogDescription>Preencha a pergunta e resposta em ambos os idiomas</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Categoria *</Label>
                <Select 
                  value={formData.faqCategoryId} 
                  onValueChange={(v) => setFormData({ ...formData, faqCategoryId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {getCategoryName(cat)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Tabs defaultValue="pt" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="pt">Português *</TabsTrigger>
                  <TabsTrigger value="en">English</TabsTrigger>
                </TabsList>
                
                <TabsContent value="pt" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Pergunta (Português) *</Label>
                    <Input 
                      value={formData.questionPt} 
                      onChange={e => setFormData({ ...formData, questionPt: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Resposta (Português) *</Label>
                    <Textarea 
                      value={formData.answerPt} 
                      onChange={e => setFormData({ ...formData, answerPt: e.target.value })} 
                      rows={4} 
                      required 
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="en" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Question (English)</Label>
                    <Input 
                      value={formData.questionEn} 
                      onChange={e => setFormData({ ...formData, questionEn: e.target.value })} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Answer (English)</Label>
                    <Textarea 
                      value={formData.answerEn} 
                      onChange={e => setFormData({ ...formData, answerEn: e.target.value })} 
                      rows={4} 
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ordem de Exibição</Label>
                  <Input 
                    type="number" 
                    value={formData.displayOrder} 
                    onChange={e => setFormData({ ...formData, displayOrder: Number(e.target.value) })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    Activo
                  </Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editing ? 'Guardar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmação de eliminação */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar FAQ</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja eliminar "{deleteItem && getQuestionPt(deleteItem.contents)}"?
              Esta acção não pode ser desfeita.
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