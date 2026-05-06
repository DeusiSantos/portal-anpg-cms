import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, ExternalLink } from 'lucide-react';
import api from '@/service/api';

// Interface para o item do menu baseada na API
interface MenuItem {
  id: string;
  labelPt: string;
  labelEn: string;
  url: string;
  icon: string;
  group: string;
  father: string;
  order: number;
  visibleStatus: 'Yes' | 'No';
  newTabStatus: 'Active' | 'Inactive';
}

// Interface para a resposta da API
interface ApiResponse {
  menuItems: {
    pageIndex: number;
    pageSize: number;
    count: number;
    data: MenuItem[];
  };
}

// Interface para criação/atualização - DTO da API
interface MenuItemsDto {
  id?: string;
  labelPt: string;
  labelEn: string;
  url: string;
  icon: string;
  group: string;
  father: string;
  order: number;
  visibleStatus: 'Yes' | 'No';
  newTabStatus: 'Active' | 'Inactive';
}

// Interface para o wrapper que a API espera
interface MenuItemsRequest {
  menuItems: MenuItemsDto;
}

export default function AdminMenuItemsPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    labelPt: '',
    labelEn: '',
    url: '',
    icon: '',
    group: 'main',
    father: '',
    order: 0,
    visibleStatus: 'Yes' as 'Yes' | 'No',
    newTabStatus: 'Inactive' as 'Active' | 'Inactive'
  });

  // Buscar menus da API
  const { data: response, isLoading } = useQuery({
    queryKey: ['admin-menu-items'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse>('/menus');
      console.log('API Response:', data); // Para debug
      return data;
    }
  });

  // Extrair os items da estrutura correta da API
  const items = response?.menuItems?.data || [];
  
  // Itens de topo (sem father/pai)
  const topLevelItems = items.filter(i => !i.father || i.father === '');
  
  // Função para obter filhos
  const getChildren = (parentId: string) => items.filter(i => i.father === parentId);

  // Criar mutation - POST com wrapper menuItems
  const createMutation = useMutation({
    mutationFn: async (data: MenuItemsDto) => {
      const request: MenuItemsRequest = { menuItems: data };
      const response = await api.post('/menus', request);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu-items'] });
      toast.success('Item criado com sucesso');
      handleClose();
    },
    onError: (e: any) => {
      console.error('Erro no POST:', e.response?.data);
      toast.error(`Erro ao criar: ${e.response?.data?.message || e.message}`);
    }
  });

  // Atualizar mutation - PUT com wrapper menuItems
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<MenuItemsDto> }) => {
      const request: MenuItemsRequest = {
        menuItems: {
          ...data,
          id: id
        } as MenuItemsDto
      };
      const response = await api.put('/menus', request);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu-items'] });
      toast.success('Item actualizado com sucesso');
      handleClose();
    },
    onError: (e: any) => {
      console.error('Erro no PUT:', e.response?.data);
      toast.error(`Erro ao actualizar: ${e.response?.data?.message || e.message}`);
    }
  });

  // Deletar mutation - DELETE com ID
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/menus/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu-items'] });
      toast.success('Item eliminado com sucesso');
      setDeleteItem(null);
    },
    onError: (e: any) => {
      console.error('Erro no DELETE:', e.response?.data);
      toast.error(`Erro ao eliminar: ${e.response?.data?.message || e.message}`);
    }
  });

  const handleClose = () => {
    setIsDialogOpen(false);
    setEditing(null);
    setFormData({
      labelPt: '', labelEn: '', url: '', icon: '',
      group: 'main', father: '', order: 0,
      visibleStatus: 'Yes', newTabStatus: 'Inactive'
    });
  };

  const handleEdit = (item: MenuItem) => {
    setEditing(item);
    setFormData({
      labelPt: item.labelPt,
      labelEn: item.labelEn || '',
      url: item.url || '',
      icon: item.icon || '',
      group: item.group,
      father: item.father || '',
      order: item.order,
      visibleStatus: item.visibleStatus,
      newTabStatus: item.newTabStatus
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.labelPt) {
      toast.error('Label PT é obrigatório');
      return;
    }

    const submitData: MenuItemsDto = {
      labelPt: formData.labelPt,
      labelEn: formData.labelEn,
      url: formData.url,
      icon: formData.icon,
      group: formData.group,
      father: formData.father,
      order: formData.order,
      visibleStatus: formData.visibleStatus,
      newTabStatus: formData.newTabStatus
    };

    if (editing) {
      updateMutation.mutate({ id: editing.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout title="Menu / Navegação" subtitle="Gerir itens de menu do site">
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Menu Items</CardTitle>
                <CardDescription>Gerir a estrutura de navegação do website (menus, submenus)</CardDescription>
              </div>
              <Button onClick={() => { handleClose(); setIsDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />Novo Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Label (PT)</TableHead>
                      <TableHead>Label (EN)</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Grupo</TableHead>
                      <TableHead>Ordem</TableHead>
                      <TableHead>Visível</TableHead>
                      <TableHead className="text-right">Acções</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topLevelItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Nenhum item de menu encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      topLevelItems.map(item => {
                        const children = getChildren(item.id);
                        return (
                          <React.Fragment key={item.id}>
                            <TableRow>
                              <TableCell className="font-medium">{item.labelPt}</TableCell>
                              <TableCell>{item.labelEn || '—'}</TableCell>
                              <TableCell className="flex items-center gap-1">
                                {item.url || '—'}
                                {item.newTabStatus === 'Active' && <ExternalLink className="h-3 w-3" />}
                              </TableCell>
                              <TableCell><Badge variant="outline">{item.group}</Badge></TableCell>
                              <TableCell>{item.order}</TableCell>
                              <TableCell>
                                <Badge variant={item.visibleStatus === 'Yes' ? 'default' : 'secondary'}>
                                  {item.visibleStatus === 'Yes' ? 'Sim' : 'Não'}
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
                            {children.map(child => (
                              <TableRow key={child.id} className="bg-muted/30">
                                <TableCell className="pl-8">↳ {child.labelPt}</TableCell>
                                <TableCell>{child.labelEn || '—'}</TableCell>
                                <TableCell>{child.url || '—'}</TableCell>
                                <TableCell><Badge variant="outline">{child.group}</Badge></TableCell>
                                <TableCell>{child.order}</TableCell>
                                <TableCell>
                                  <Badge variant={child.visibleStatus === 'Yes' ? 'default' : 'secondary'}>
                                    {child.visibleStatus === 'Yes' ? 'Sim' : 'Não'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(child)}>
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => setDeleteItem(child)}>
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </React.Fragment>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
            <div className="mt-4 text-sm text-muted-foreground">
              Total: {items.length} item(s) de menu
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Dialog para criar/editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Item' : 'Novo Item de Menu'}</DialogTitle>
            <DialogDescription>Configure o item de navegação</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Label PT *</Label>
                  <Input
                    value={formData.labelPt}
                    onChange={e => setFormData({ ...formData, labelPt: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Label EN</Label>
                  <Input
                    value={formData.labelEn}
                    onChange={e => setFormData({ ...formData, labelEn: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>URL</Label>
                  <Input
                    value={formData.url}
                    onChange={e => setFormData({ ...formData, url: e.target.value })}
                    placeholder="/exemplo ou https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ícone</Label>
                  <Input
                    value={formData.icon}
                    onChange={e => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="Ex: Home, Settings, User"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Grupo</Label>
                  <Select
                    value={formData.group}
                    onValueChange={v => setFormData({ ...formData, group: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main">Principal</SelectItem>
                      <SelectItem value="footer">Rodapé</SelectItem>
                      <SelectItem value="utility">Utilidades</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Item Pai</Label>
                  <Select
                    value={formData.father || 'none'}
                    onValueChange={v => setFormData({ ...formData, father: v === 'none' ? '' : v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— Nenhum (nível superior) —</SelectItem>
                      {topLevelItems
                        .filter(i => i.id !== editing?.id)
                        .map(i => (
                          <SelectItem key={i.id} value={i.id}>
                            {i.labelPt}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ordem</Label>
                  <Input
                    type="number"
                    value={formData.order}
                    onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.visibleStatus === 'Yes'}
                    onCheckedChange={v => setFormData({ ...formData, visibleStatus: v ? 'Yes' : 'No' })}
                  />
                  <Label>Visível no menu</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.newTabStatus === 'Active'}
                    onCheckedChange={v => setFormData({ ...formData, newTabStatus: v ? 'Active' : 'Inactive' })}
                  />
                  <Label>Abrir em nova aba</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editing ? 'Actualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog para confirmar exclusão */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Eliminação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja eliminar o item "{deleteItem?.labelPt}"?
              {getChildren(deleteItem?.id || '').length > 0 && (
                <span className="block mt-2 text-destructive">
                  Atenção: Este item tem sub-itens que ficarão sem pai!
                </span>
              )}
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