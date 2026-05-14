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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, ExternalLink } from 'lucide-react';
import api from '@/service/api';

// Tipos da API
interface MenuContent {
  lang: number;
  label: string;
}

interface MenuItem {
  id: string;
  group: string;
  url: string;
  icon: string | null;
  parentId: string | null;
  displayOrder: number;
  openInNewTab: boolean;
  contents: MenuContent[];
  isActive: boolean;
  createdAt: string;
}

interface MenusResponse {
  items: MenuItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalActive: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface MenuFormData {
  group: string;
  url: string;
  icon: string;
  parentId: string;
  displayOrder: number;
  openInNewTab: boolean;
  labelPt: string;
  labelEn: string;
  isVisible: boolean;
}

// Função para obter label por idioma
const getLabel = (item: MenuItem, lang: number): string => {
  const content = item.contents?.find(c => c.lang === lang);
  return content?.label || 'Sem label';
};

export default function AdminMenuItemsPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<MenuFormData>({
    group: 'main',
    url: '',
    icon: '',
    parentId: '',
    displayOrder: 0,
    openInNewTab: false,
    labelPt: '',
    labelEn: '',
    isVisible: true,
  });

  // Buscar menus da API
  const { data: menusResponse, isLoading } = useQuery({
    queryKey: ['admin-menus'],
    queryFn: async () => {
      const response = await api.get<MenusResponse>('/cms/menus', {
        params: { Page: 1, PageSize: 100 }
      });
      return response.data;
    }
  });

  const items = menusResponse?.items || [];
  
  // Função recursiva para construir árvore de menus
  const buildMenuTree = (parentId: string | null = null): MenuItem[] => {
    return items
      .filter(item => item.parentId === parentId)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(item => ({
        ...item,
        children: buildMenuTree(item.id)
      }));
  };

  // Construir árvore de menus
  const menuTree = buildMenuTree(null);

  // Agrupar por grupo para exibição separada
  const getItemsByGroup = (group: string) => {
    return items.filter(item => item.group === group);
  };

  // Criar mutation
  const createMutation = useMutation({
    mutationFn: async (data: MenuFormData) => {
      const payload = {
        group: data.group,
        url: data.url,
        icon: data.icon || null,
        parentId: data.parentId || null,
        displayOrder: data.displayOrder,
        openInNewTab: data.openInNewTab,
        labelPt: data.labelPt,
        labelEn: data.labelEn || '',
        isVisible: data.isVisible,
      };
      const response = await api.post('/cms/menus', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menus'] });
      toast.success('Item criado com sucesso');
      handleClose();
    },
    onError: (e: any) => {
      console.error('Erro no POST:', e.response?.data);
      toast.error(`Erro ao criar: ${e.response?.data?.message || e.message}`);
    }
  });

  // Atualizar mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<MenuFormData> }) => {
      const payload: any = {};
      if (data.group !== undefined) payload.group = data.group;
      if (data.url !== undefined) payload.url = data.url;
      if (data.icon !== undefined) payload.icon = data.icon || null;
      if (data.parentId !== undefined) payload.parentId = data.parentId || null;
      if (data.displayOrder !== undefined) payload.displayOrder = data.displayOrder;
      if (data.openInNewTab !== undefined) payload.openInNewTab = data.openInNewTab;
      if (data.labelPt !== undefined) payload.labelPt = data.labelPt;
      if (data.labelEn !== undefined) payload.labelEn = data.labelEn || '';
      if (data.isVisible !== undefined) payload.isVisible = data.isVisible;
      
      const response = await api.patch(`/cms/menus/${id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menus'] });
      toast.success('Item actualizado com sucesso');
      handleClose();
    },
    onError: (e: any) => {
      console.error('Erro no PUT:', e.response?.data);
      toast.error(`Erro ao actualizar: ${e.response?.data?.message || e.message}`);
    }
  });

  // Deletar mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/cms/menus/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menus'] });
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
      group: 'main',
      url: '',
      icon: '',
      parentId: '',
      displayOrder: 0,
      openInNewTab: false,
      labelPt: '',
      labelEn: '',
      isVisible: true,
    });
  };

  const handleEdit = (item: MenuItem) => {
    setEditing(item);
    setFormData({
      group: item.group,
      url: item.url,
      icon: item.icon || '',
      parentId: item.parentId || '',
      displayOrder: item.displayOrder,
      openInNewTab: item.openInNewTab,
      labelPt: getLabel(item, 1),
      labelEn: getLabel(item, 2),
      isVisible: item.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.labelPt) {
      toast.error('Label PT é obrigatório');
      return;
    }

    if (editing) {
      updateMutation.mutate({ id: editing.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // Opções de grupo
  const groupOptions = [
    { value: 'main', label: 'Principal' },
    { value: 'footer-institutional', label: 'Rodapé - Institucional' },
    { value: 'footer-investors', label: 'Rodapé - Investidores' },
    { value: 'Administração', label: 'Administração' },
  ];

  // Componente para renderizar item de menu recursivamente
  const renderMenuItem = (item: MenuItem, level: number = 0, isChild: boolean = false) => {
    const children = items.filter(child => child.parentId === item.id);
    const indent = level * 20;
    
    return (
      <React.Fragment key={item.id}>
        <TableRow className={isChild ? "bg-muted/30" : ""}>
          <TableCell className="font-medium" style={{ paddingLeft: indent + 16 }}>
            {level > 0 && "↳ "}{getLabel(item, 1)}
          </TableCell>
          <TableCell>{getLabel(item, 2) || '—'}</TableCell>
          <TableCell className="flex items-center gap-1">
            {item.url || '—'}
            {item.openInNewTab && <ExternalLink className="h-3 w-3" />}
          </TableCell>
          <TableCell>{item.icon || '—'}</TableCell>
          <TableCell>{item.displayOrder}</TableCell>
          <TableCell>
            <Badge variant={item.isActive ? 'default' : 'secondary'}>
              {item.isActive ? 'Activo' : 'Inactivo'}
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
        {children.map(child => renderMenuItem(child, level + 1, true))}
      </React.Fragment>
    );
  };

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
              <div className="space-y-8">
                {/* Menu Principal */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Menu Principal</h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Label (PT)</TableHead>
                          <TableHead>Label (EN)</TableHead>
                          <TableHead>URL</TableHead>
                          <TableHead>Ícone</TableHead>
                          <TableHead>Ordem</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Acções</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getItemsByGroup('main')
                          .filter(item => !item.parentId)
                          .sort((a, b) => a.displayOrder - b.displayOrder)
                          .map(item => renderMenuItem(item, 0, false))}
                        {getItemsByGroup('main').filter(item => !item.parentId).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              Nenhum item no menu principal
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Rodapé - Institucional */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Rodapé - Institucional</h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Label (PT)</TableHead>
                          <TableHead>Label (EN)</TableHead>
                          <TableHead>URL</TableHead>
                          <TableHead>Ordem</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Acções</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getItemsByGroup('footer-institutional')
                          .sort((a, b) => a.displayOrder - b.displayOrder)
                          .map(item => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{getLabel(item, 1)}</TableCell>
                              <TableCell>{getLabel(item, 2) || '—'}</TableCell>
                              <TableCell>{item.url || '—'}</TableCell>
                              <TableCell>{item.displayOrder}</TableCell>
                              <TableCell>
                                <Badge variant={item.isActive ? 'default' : 'secondary'}>
                                  {item.isActive ? 'Activo' : 'Inactivo'}
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
                          ))}
                        {getItemsByGroup('footer-institutional').length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              Nenhum item no rodapé institucional
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Rodapé - Investidores */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Rodapé - Investidores</h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Label (PT)</TableHead>
                          <TableHead>Label (EN)</TableHead>
                          <TableHead>URL</TableHead>
                          <TableHead>Ordem</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Acções</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getItemsByGroup('footer-investors')
                          .sort((a, b) => a.displayOrder - b.displayOrder)
                          .map(item => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{getLabel(item, 1)}</TableCell>
                              <TableCell>{getLabel(item, 2) || '—'}</TableCell>
                              <TableCell>{item.url || '—'}</TableCell>
                              <TableCell>{item.displayOrder}</TableCell>
                              <TableCell>
                                <Badge variant={item.isActive ? 'default' : 'secondary'}>
                                  {item.isActive ? 'Activo' : 'Inactivo'}
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
                          ))}
                        {getItemsByGroup('footer-investors').length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              Nenhum item no rodapé de investidores
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Outros grupos */}
                {Object.keys(items.reduce((acc, item) => {
                  if (!acc[item.group] && !['main', 'footer-institutional', 'footer-investors'].includes(item.group)) {
                    acc[item.group] = true;
                  }
                  return acc;
                }, {} as Record<string, boolean>)).map(group => (
                  <div key={group}>
                    <h3 className="text-lg font-semibold mb-4 capitalize">{group}</h3>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Label (PT)</TableHead>
                            <TableHead>Label (EN)</TableHead>
                            <TableHead>URL</TableHead>
                            <TableHead>Ícone</TableHead>
                            <TableHead>Ordem</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acções</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items
                            .filter(item => item.group === group)
                            .sort((a, b) => a.displayOrder - b.displayOrder)
                            .map(item => (
                              <TableRow key={item.id}>
                                <TableCell className="font-medium">{getLabel(item, 1)}</TableCell>
                                <TableCell>{getLabel(item, 2) || '—'}</TableCell>
                                <TableCell>{item.url || '—'}</TableCell>
                                <TableCell>{item.icon || '—'}</TableCell>
                                <TableCell>{item.displayOrder}</TableCell>
                                <TableCell>
                                  <Badge variant={item.isActive ? 'default' : 'secondary'}>
                                    {item.isActive ? 'Activo' : 'Inactivo'}
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
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
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

              <div className="grid grid-cols-2 gap-4">
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
                      {groupOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Item Pai</Label>
                  <Select
                    value={formData.parentId || 'none'}
                    onValueChange={v => setFormData({ ...formData, parentId: v === 'none' ? '' : v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— Nenhum (nível superior) —</SelectItem>
                      {items
                        .filter(i => i.id !== editing?.id && i.group === formData.group)
                        .map(i => (
                          <SelectItem key={i.id} value={i.id}>
                            {getLabel(i, 1)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ordem</Label>
                  <Input
                    type="number"
                    value={formData.displayOrder}
                    onChange={e => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 pt-6">
                    <Switch
                      checked={formData.openInNewTab}
                      onCheckedChange={v => setFormData({ ...formData, openInNewTab: v })}
                    />
                    Abrir em nova aba
                  </Label>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isVisible}
                  onCheckedChange={v => setFormData({ ...formData, isVisible: v })}
                />
                <Label>Visível no menu</Label>
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
              Tem certeza que deseja eliminar o item "{deleteItem && getLabel(deleteItem, 1)}"?
              {deleteItem && items.filter(child => child.parentId === deleteItem.id).length > 0 && (
                <span className="block mt-2 text-destructive">
                  Atenção: Este item tem {items.filter(child => child.parentId === deleteItem.id).length} sub-item(ns) que ficarão sem pai!
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