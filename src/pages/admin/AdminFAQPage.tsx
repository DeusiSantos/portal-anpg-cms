import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, HelpCircle } from 'lucide-react';
import api from '@/service/api';

const CATEGORIES = ['general', 'licensing', 'production', 'investment', 'technical'];

type FAQInput = {
  questionPt: string;
  answerPt: string;
  questionEn: string;
  answerEn: string;
  category: string;
  order: number;
  status: string;
};

const getErrorMessage = (error: any, fallback: string) => {
  return error?.response?.data?.message || error?.response?.data?.error || error?.message || fallback;
};

export default function AdminFAQPage() {
  const queryClient = useQueryClient();
  const [filterCategory, setFilterCategory] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [formData, setFormData] = useState({
    questionPt: '', 
    answerPt: '', 
    questionEn: '', 
    answerEn: '', 
    category: 'general', 
    order: 0, 
    status: 'Active'
  });

  // Buscar todos os FAQs
  const { data: items, isLoading, error } = useQuery({
    queryKey: ['admin-faq-items'],
    queryFn: async () => {
      try {
        const response = await api.get('/faqs');
        // Garante que sempre retorna um array de FAQs
        return response.data?.faqs?.data || [];
      } catch (err) {
        console.error('Erro ao buscar FAQs:', err);
        throw err;
      }
    }
  });

  // Criar FAQ
  const createMutation = useMutation<unknown, any, FAQInput>({
    mutationFn: async (data: FAQInput) => {
      const payload = {
        faq: {
          id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7),
          questionPt: data.questionPt,
          answerPt: data.answerPt,
          questionEn: data.questionEn || '',
          answerEn: data.answerEn || '',
          category: data.category,
          order: Number(data.order),
          status: data.status
        }
      };
      
      console.log('Enviando payload:', payload); // Para debug
      const response = await api.post('/faqs', payload);
      return response.data;
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['admin-faq-items'] }); 
      toast.success('FAQ criada com sucesso'); 
      handleClose(); 
    },
    onError: (e: any) => { 
      console.error('Erro detalhado:', e?.response || e);
      const errorMsg = getErrorMessage(e, 'Erro ao criar FAQ');
      toast.error(`Erro: ${errorMsg}`); 
    }
  });

  // Atualizar FAQ
  const updateMutation = useMutation<unknown, any, { id: string; data: FAQInput }>({
    mutationFn: async ({ id, data }: { id: string; data: FAQInput }) => {
      const payload = {
        faq: {
          id: id,
          questionPt: data.questionPt,
          answerPt: data.answerPt,
          questionEn: data.questionEn || '',
          answerEn: data.answerEn || '',
          category: data.category,
          order: Number(data.order),
          status: data.status
        }
      };
      
      console.log('Atualizando payload:', payload); // Para debug
      const response = await api.put(`/faqs/`, payload);
      return response.data;
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['admin-faq-items'] }); 
      toast.success('FAQ actualizada com sucesso'); 
      handleClose(); 
    },
    onError: (e: any) => { 
      console.error('Erro detalhado:', e?.response || e);
      const errorMsg = getErrorMessage(e, 'Erro ao actualizar FAQ');
      toast.error(`Erro: ${errorMsg}`); 
    }
  });

  // Eliminar FAQ
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await api.delete(`/faqs/${id}`);
      return response.data;
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['admin-faq-items'] }); 
      toast.success('FAQ eliminada com sucesso'); 
      setDeleteItem(null); 
    },
    onError: (e: any) => { 
      console.error('Erro detalhado:', e?.response || e);
      const errorMsg = getErrorMessage(e, 'Erro ao eliminar FAQ');
      toast.error(`Erro: ${errorMsg}`); 
    }
  });

  const handleClose = () => { 
    setIsDialogOpen(false); 
    setEditing(null); 
    setFormData({ 
      questionPt: '', 
      answerPt: '', 
      questionEn: '', 
      answerEn: '', 
      category: 'general', 
      order: 0, 
      status: 'Active'
    }); 
  };

  const handleEdit = (item) => {
    setEditing(item);
    setFormData({ 
      questionPt: item.questionPt, 
      answerPt: item.answerPt,
      questionEn: item.questionEn || '', 
      answerEn: item.answerEn || '', 
      category: item.category, 
      order: item.order || 0, 
      status: item.status || 'Active'
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.questionPt || !formData.answerPt) { 
      toast.error('Pergunta e resposta em português são obrigatórias'); 
      return; 
    }
    
    const submitData = { 
      questionPt: formData.questionPt, 
      answerPt: formData.answerPt,
      questionEn: formData.questionEn || '', 
      answerEn: formData.answerEn || '', 
      category: formData.category, 
      order: formData.order, 
      status: formData.status 
    };
    
    if (editing) { 
      updateMutation.mutate({ id: editing.id, data: submitData }); 
    } else { 
      createMutation.mutate(submitData); 
    }
  };

  const filtered = items?.filter(i => filterCategory === 'all' || i.category === filterCategory);
  const isSaving = createMutation.isPending || updateMutation.isPending;

  // Mostrar erro se houver
  if (error) {
    return (
      <AdminLayout title="FAQ" subtitle="Gerir perguntas frequentes">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-red-500">
                <p>Erro ao carregar FAQs: {error.message}</p>
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
              <Button onClick={() => { handleClose(); setIsDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Nova FAQ
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground self-center">
                {filtered?.length || 0} FAQ(s)
              </span>
            </div>

            {isLoading ? (
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
                    {filtered?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Nenhuma FAQ encontrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered?.map(item => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium max-w-md truncate">
                            {item.questionPt}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {item.category}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.order}</TableCell>
                          <TableCell>
                            <Badge variant={item.status === 'Active' ? 'default' : 'secondary'}>
                              {item.status === 'Active' ? 'Activa' : 'Inactiva'}
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
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar FAQ' : 'Nova FAQ'}</DialogTitle>
            <DialogDescription>Preencha a pergunta e resposta em ambos os idiomas</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Pergunta (Português) *</Label>
                <Input 
                  value={formData.questionPt} 
                  onChange={e => setFormData({...formData, questionPt: e.target.value})} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Pergunta (Inglês)</Label>
                <Input 
                  value={formData.questionEn} 
                  onChange={e => setFormData({...formData, questionEn: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Resposta (Português) *</Label>
                <Textarea 
                  value={formData.answerPt} 
                  onChange={e => setFormData({...formData, answerPt: e.target.value})} 
                  rows={4} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Resposta (Inglês)</Label>
                <Textarea 
                  value={formData.answerEn} 
                  onChange={e => setFormData({...formData, answerEn: e.target.value})} 
                  rows={4} 
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => (
                        <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ordem</Label>
                  <Input 
                    type="number" 
                    value={formData.order} 
                    onChange={e => setFormData({...formData, order: Number(e.target.value)})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Activa</SelectItem>
                      <SelectItem value="Inactive">Inactiva</SelectItem>
                    </SelectContent>
                  </Select>
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

      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar FAQ</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja eliminar esta pergunta frequente? Esta acção não pode ser desfeita.
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