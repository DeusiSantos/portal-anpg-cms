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
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
  DialogTrigger
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
import { Plus, Pencil, Trash2, Loader2, Users, PlusCircle, Edit, X } from 'lucide-react';
import api, { getFullImageUrl } from '@/service/api';
import { fileService } from '@/service/fileService';

// Tipos da API
interface GroupContent {
  lang: number;
  name: string;
}

interface CouncilGroup {
  id: string;
  displayOrder: number;
  contents: GroupContent[];
  isActive: boolean;
  createdAt: string;
}

interface GroupsResponse {
  items: CouncilGroup[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalActive: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface MemberContent {
  lang: number;
  title: string;
  pelouro: string;
  biography: string;
  institutionalMessage: string;
}

interface CouncilMember {
  id: string;
  fullName: string;
  slug: string;
  councilMemberGroupId: string;
  councilMemberGroup?: CouncilGroup;
  displayOrder: number;
  photoUrl: string | null;
  photoPath: string | null;
  email: string | null;
  phone: string | null;
  officeLocation: string | null;
  contents: MemberContent[];
  isActive: boolean;
  createdAt: string;
}

interface MembersResponse {
  items: CouncilMember[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalActive: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface GroupFormData {
  displayOrder: number;
  namePt: string;
  nameEn: string;
  isActive: boolean;
}

interface MemberFormData {
  fullName: string;
  slug: string;
  councilMemberGroupId: string;
  displayOrder: number;
  photoFile?: File;
  existingPhotoUrl?: string | null;
  email: string;
  phone: string;
  officeLocation: string;
  titlePt: string;
  pelouroPt: string;
  biographyPt: string;
  institutionalMessagePt: string;
  titleEn: string;
  pelouroEn: string;
  biographyEn: string;
  institutionalMessageEn: string;
  isActive: boolean;
}

// Função para obter nome do grupo em português
const getGroupNamePt = (group: CouncilGroup): string => {
  const ptContent = group.contents?.find(c => c.lang === 1);
  return ptContent?.name || 'Sem nome';
};

// Função para obter conteúdo do membro em português
const getMemberContentPt = (member: CouncilMember): MemberContent | undefined => {
  return member.contents?.find(c => c.lang === 1);
};

// Função para obter conteúdo do membro em inglês
const getMemberContentEn = (member: CouncilMember): MemberContent | undefined => {
  return member.contents?.find(c => c.lang === 2);
};

// Função para gerar slug a partir do nome
const generateSlug = (fullName: string): string => {
  const currentYear = new Date().getFullYear();
  return fullName
    .toLowerCase()                          // Converter para minúsculas
    .normalize('NFD')                       // Normalizar para separar caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '')        // Remover acentos
    .replace(/[^a-z0-9\s-]/g, '')           // Remover caracteres especiais
    .trim()                                 // Remover espaços do início e fim
    .replace(/\s+/g, '-')                   // Substituir espaços por hífens
    .replace(/-+/g, '-')                    // Substituir múltiplos hífens por um único
    .replace(/^-+|-+$/g, '')                // Remover hífens do início e fim
    + `-${currentYear}`;                    // Adicionar ano atual
};

// Modal de gestão de grupos (CRUD completo)
function GroupsManagerModal({ onGroupChanged }: { onGroupChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [editingGroup, setEditingGroup] = useState<CouncilGroup | null>(null);
  const [deleteGroup, setDeleteGroup] = useState<CouncilGroup | null>(null);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [nameEn, setNameEn] = useState('');

  const { data: groupsResponse, refetch } = useQuery({
    queryKey: ['groups-manager'],
    queryFn: async () => {
      const response = await api.get<GroupsResponse>('/administrative-council/groups', {
        params: { Page: 1, PageSize: 100 }
      });
      return response.data;
    },
  });

  const groups = groupsResponse?.items || [];

  const createMutation = useMutation({
    mutationFn: async (data: { namePt: string; nameEn: string; displayOrder: number; isActive: boolean }) => {
      const response = await api.post<CouncilGroup>('/administrative-council/groups', {
        displayOrder: data.displayOrder,
        namePt: data.namePt,
        nameEn: data.nameEn,
        isActive: data.isActive,
      });
      return response.data;
    },
    onSuccess: () => {
      refetch();
      onGroupChanged();
      toast.success('Grupo criado com sucesso');
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar grupo');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { namePt: string; nameEn: string; displayOrder: number; isActive: boolean } }) => {
      const response = await api.patch(`/administrative-council/groups/${id}`, {
        displayOrder: data.displayOrder,
        namePt: data.namePt,
        nameEn: data.nameEn,
        isActive: data.isActive,
      });
      return response.data;
    },
    onSuccess: () => {
      refetch();
      onGroupChanged();
      toast.success('Grupo actualizado com sucesso');
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao actualizar grupo');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/administrative-council/groups/${id}`);
      return response.data;
    },
    onSuccess: () => {
      refetch();
      onGroupChanged();
      toast.success('Grupo eliminado com sucesso');
      setDeleteGroup(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao eliminar grupo');
    },
  });

  const resetForm = () => {
    setName('');
    setNameEn('');
    setDisplayOrder(0);
    setIsActive(true);
    setEditingGroup(null);
  };

  const handleEdit = (group: CouncilGroup) => {
    const ptContent = group.contents?.find(c => c.lang === 1);
    const enContent = group.contents?.find(c => c.lang === 2);
    setEditingGroup(group);
    setName(ptContent?.name || '');
    setNameEn(enContent?.name || '');
    setDisplayOrder(group.displayOrder);
    setIsActive(group.isActive);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error('Nome do grupo em português é obrigatório');
      return;
    }

    const submitData = {
      namePt: name.trim(),
      nameEn: nameEn.trim() || '',
      displayOrder,
      isActive,
    };

    if (editingGroup) {
      updateMutation.mutate({ id: editingGroup.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) resetForm();
      }}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="gap-1">
            <PlusCircle className="h-4 w-4" />
            Gerir Grupos
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gestão de Grupos</DialogTitle>
            <DialogDescription>
              Adicione, edite ou remova grupos para organizar os membros do conselho.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Formulário de criação/edição */}
            <div className="space-y-4 p-4 rounded-lg border border-border bg-secondary/30">
              <h3 className="font-medium text-foreground">
                {editingGroup ? 'Editar Grupo' : 'Criar Novo Grupo'}
              </h3>
              
              <Tabs defaultValue="pt" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="pt">Português *</TabsTrigger>
                  <TabsTrigger value="en">English</TabsTrigger>
                </TabsList>
                <TabsContent value="pt" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Nome do Grupo (Português) *</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Conselho de Administração"
                    />
                  </div>
                </TabsContent>
                <TabsContent value="en" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Group Name (English)</Label>
                    <Input
                      value={nameEn}
                      onChange={(e) => setNameEn(e.target.value)}
                      placeholder="Ex: Board of Directors"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ordem de Exibição</Label>
                  <Input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                  />
                </div>
                <div className="flex items-end gap-2 pb-1">
                  <Switch
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                  <Label>Activo</Label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingGroup ? 'Actualizar Grupo' : 'Adicionar Grupo'}
                </Button>
                {editingGroup && (
                  <Button variant="ghost" onClick={resetForm}>
                    <X className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                )}
              </div>
            </div>

            {/* Lista de grupos existentes */}
            <div className="space-y-2">
              <h3 className="font-medium text-foreground">Grupos Existentes</h3>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome (PT)</TableHead>
                      <TableHead>Ordem</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="w-24 text-right">Acções</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groups.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          Nenhum grupo cadastrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      groups.map((group) => (
                        <TableRow key={group.id}>
                          <TableCell className="font-medium">{getGroupNamePt(group)}</TableCell>
                          <TableCell>{group.displayOrder}</TableCell>
                          <TableCell>
                            <Badge variant={group.isActive ? 'default' : 'secondary'}>
                              {group.isActive ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEdit(group)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => setDeleteGroup(group)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Group Confirmation */}
      <AlertDialog open={!!deleteGroup} onOpenChange={() => setDeleteGroup(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Grupo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja eliminar o grupo "{deleteGroup && getGroupNamePt(deleteGroup)}"?
              Esta acção não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteGroup && deleteMutation.mutate(deleteGroup.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function AdminBoardMembersPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CouncilMember | null>(null);
  const [deleteItem, setDeleteItem] = useState<CouncilMember | null>(null);
  const [formData, setFormData] = useState<MemberFormData>({
    fullName: '',
    slug: '',
    councilMemberGroupId: '',
    displayOrder: 0,
    email: '',
    phone: '',
    officeLocation: '',
    titlePt: '',
    pelouroPt: '',
    biographyPt: '',
    institutionalMessagePt: '',
    titleEn: '',
    pelouroEn: '',
    biographyEn: '',
    institutionalMessageEn: '',
    isActive: true,
  });
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string>('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Buscar grupos
  const { data: groupsData, isLoading: groupsLoading, refetch: refetchGroups } = useQuery({
    queryKey: ['admin-council-groups'],
    queryFn: async () => {
      const response = await api.get<GroupsResponse>('/administrative-council/groups', {
        params: { Page: 1, PageSize: 100 }
      });
      return response.data.items.filter(g => g.isActive);
    },
  });

  // Buscar membros
  const { data: membersData, isLoading: membersLoading, refetch: refetchMembers } = useQuery({
    queryKey: ['admin-council-members'],
    queryFn: async () => {
      const response = await api.get<MembersResponse>('/administrative-council/members', {
        params: { Page: 1, PageSize: 100 }
      });
      return response.data.items;
    },
  });

  const groups = groupsData || [];
  const members = membersData || [];
  const isLoading = groupsLoading || membersLoading;

  const handleGroupsChanged = () => {
    refetchGroups();
    // Se o grupo selecionado foi removido, limpar a seleção
    if (formData.councilMemberGroupId && !groups.find(g => g.id === formData.councilMemberGroupId)) {
      setFormData(prev => ({ ...prev, councilMemberGroupId: '' }));
    }
  };

  // Função para fazer upload de foto
  const handlePhotoUpload = async (file: File): Promise<string> => {
    setIsUploadingPhoto(true);
    try {
      const imageUrl = await fileService.uploadImage(file);
      toast.success('Foto enviada com sucesso!');
      return imageUrl;
    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast.error(error.message || 'Erro ao fazer upload da foto');
      throw error;
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Criar membro
  const createMutation = useMutation({
    mutationFn: async (data: MemberFormData) => {
      const formDataToSend = new FormData();
      
      formDataToSend.append('FullName', data.fullName);
      formDataToSend.append('Slug', data.slug);
      formDataToSend.append('CouncilMemberGroupId', data.councilMemberGroupId);
      formDataToSend.append('DisplayOrder', String(data.displayOrder));
      formDataToSend.append('Email', data.email || '');
      formDataToSend.append('Phone', data.phone || '');
      formDataToSend.append('OfficeLocation', data.officeLocation || '');
      formDataToSend.append('TitlePt', data.titlePt);
      formDataToSend.append('PelouroPt', data.pelouroPt || '');
      formDataToSend.append('BiographyPt', data.biographyPt || '');
      formDataToSend.append('InstitutionalMessagePt', data.institutionalMessagePt || '');
      formDataToSend.append('TitleEn', data.titleEn || '');
      formDataToSend.append('PelouroEn', data.pelouroEn || '');
      formDataToSend.append('BiographyEn', data.biographyEn || '');
      formDataToSend.append('InstitutionalMessageEn', data.institutionalMessageEn || '');
      formDataToSend.append('IsActive', String(data.isActive));

      if (data.photoFile) {
        formDataToSend.append('PhotoAttachment', data.photoFile);
      }

      const response = await api.post('/administrative-council/members/from-form', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });
      return response.data;
    },
    onSuccess: () => {
      refetchMembers();
      toast.success('Membro criado com sucesso');
      handleClose();
    },
    onError: (error: any) => {
      console.error('Erro ao criar membro:', error);
      toast.error(error.response?.data?.message || 'Erro ao criar membro');
    },
  });

  // Atualizar membro
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: MemberFormData }) => {
      const formDataToSend = new FormData();
      
      formDataToSend.append('FullName', data.fullName);
      formDataToSend.append('Slug', data.slug);
      formDataToSend.append('CouncilMemberGroupId', data.councilMemberGroupId);
      formDataToSend.append('DisplayOrder', String(data.displayOrder));
      formDataToSend.append('Email', data.email || '');
      formDataToSend.append('Phone', data.phone || '');
      formDataToSend.append('OfficeLocation', data.officeLocation || '');
      formDataToSend.append('TitlePt', data.titlePt);
      formDataToSend.append('PelouroPt', data.pelouroPt || '');
      formDataToSend.append('BiographyPt', data.biographyPt || '');
      formDataToSend.append('InstitutionalMessagePt', data.institutionalMessagePt || '');
      formDataToSend.append('TitleEn', data.titleEn || '');
      formDataToSend.append('PelouroEn', data.pelouroEn || '');
      formDataToSend.append('BiographyEn', data.biographyEn || '');
      formDataToSend.append('InstitutionalMessageEn', data.institutionalMessageEn || '');
      formDataToSend.append('IsActive', String(data.isActive));

      // Verificar se deve remover a foto
      const hasExistingPhoto = !!data.existingPhotoUrl;
      const hasNewPhoto = !!data.photoFile;
      const shouldRemovePhoto = !hasExistingPhoto && !hasNewPhoto;
      
      formDataToSend.append('RemovePhoto', String(shouldRemovePhoto));

      if (data.photoFile) {
        formDataToSend.append('PhotoAttachment', data.photoFile);
      }

      const response = await api.patch(`/administrative-council/members/${id}/from-form`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });
      return response.data;
    },
    onSuccess: () => {
      refetchMembers();
      toast.success('Membro actualizado com sucesso');
      handleClose();
    },
    onError: (error: any) => {
      console.error('Erro ao actualizar membro:', error);
      toast.error(error.response?.data?.message || 'Erro ao actualizar membro');
    },
  });

  // Eliminar membro
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/administrative-council/members/${id}`);
      return response.data;
    },
    onSuccess: () => {
      refetchMembers();
      toast.success('Membro eliminado com sucesso');
      setDeleteItem(null);
    },
    onError: (error: any) => {
      console.error('Erro ao eliminar membro:', error);
      toast.error(error.response?.data?.message || 'Erro ao eliminar membro');
    },
  });

  const handleClose = () => {
    setIsDialogOpen(false);
    setEditing(null);
    setSelectedPhotoFile(null);
    setCurrentPhotoUrl('');
    setFormData({
      fullName: '',
      slug: '',
      councilMemberGroupId: '',
      displayOrder: 0,
      email: '',
      phone: '',
      officeLocation: '',
      titlePt: '',
      pelouroPt: '',
      biographyPt: '',
      institutionalMessagePt: '',
      titleEn: '',
      pelouroEn: '',
      biographyEn: '',
      institutionalMessageEn: '',
      isActive: true,
    });
  };

  const handleEdit = (member: CouncilMember) => {
    const ptContent = getMemberContentPt(member);
    const enContent = getMemberContentEn(member);
    
    setEditing(member);
    setFormData({
      fullName: member.fullName,
      slug: member.slug,
      councilMemberGroupId: member.councilMemberGroupId,
      displayOrder: member.displayOrder,
      existingPhotoUrl: member.photoUrl,
      email: member.email || '',
      phone: member.phone || '',
      officeLocation: member.officeLocation || '',
      titlePt: ptContent?.title || '',
      pelouroPt: ptContent?.pelouro || '',
      biographyPt: ptContent?.biography || '',
      institutionalMessagePt: ptContent?.institutionalMessage || '',
      titleEn: enContent?.title || '',
      pelouroEn: enContent?.pelouro || '',
      biographyEn: enContent?.biography || '',
      institutionalMessageEn: enContent?.institutionalMessage || '',
      isActive: member.isActive,
    });
    
    if (member.photoUrl) {
      setCurrentPhotoUrl(getFullImageUrl(member.photoUrl));
    }
    
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName) {
      toast.error('Nome completo é obrigatório');
      return;
    }
    
    if (!formData.slug) {
      toast.error('Slug é obrigatório');
      return;
    }
    
    if (!formData.councilMemberGroupId) {
      toast.error('Selecione um grupo');
      return;
    }
    
    if (!formData.titlePt) {
      toast.error('Título em português é obrigatório');
      return;
    }
    
    const dataToSubmit = {
      ...formData,
      photoFile: selectedPhotoFile || undefined,
    };
    
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: dataToSubmit });
    } else {
      createMutation.mutate(dataToSubmit);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedPhotoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setCurrentPhotoUrl(previewUrl);
    }
  };

  const handleRemoveExistingPhoto = () => {
    setSelectedPhotoFile(null);
    setFormData(prev => ({ ...prev, existingPhotoUrl: null }));
    setCurrentPhotoUrl('');
    toast.info('Foto será removida ao guardar');
  };

  const getGroupName = (groupId: string): string => {
    const group = groups.find(g => g.id === groupId);
    return group ? getGroupNamePt(group) : 'Desconhecido';
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout title="Conselho de Administração" subtitle="Gerir membros do conselho">
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Membros</CardTitle>
                <CardDescription>Gerir membros do conselho, biografias e mensagens institucionais</CardDescription>
              </div>
              <div className="flex gap-2">
                <GroupsManagerModal onGroupChanged={handleGroupsChanged} />
                <Button onClick={() => { handleClose(); setIsDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Membro
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Título (PT)</TableHead>
                      <TableHead>Grupo</TableHead>
                      <TableHead>Ordem</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acções</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Nenhum membro registado
                        </TableCell>
                      </TableRow>
                    ) : (
                      members.map(m => {
                        const ptContent = getMemberContentPt(m);
                        return (
                          <TableRow key={m.id}>
                            <TableCell className="font-medium">{m.fullName}</TableCell>
                            <TableCell>{ptContent?.title || '—'}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {getGroupName(m.councilMemberGroupId)}
                              </Badge>
                            </TableCell>
                            <TableCell>{m.displayOrder}</TableCell>
                            <TableCell>
                              <Badge variant={m.isActive ? 'default' : 'secondary'}>
                                {m.isActive ? 'Activo' : 'Inactivo'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(m)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => setDeleteItem(m)}>
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
            <div className="mt-4 text-sm text-muted-foreground">
              {members.length} membro(s) em {groups.length} grupo(s)
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Modal de criação/edição de membro */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Membro' : 'Novo Membro'}</DialogTitle>
            <DialogDescription>Preencha todos os campos do perfil do membro</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="mb-4 grid grid-cols-4">
                <TabsTrigger value="info">Informações</TabsTrigger>
                <TabsTrigger value="bio">Biografia</TabsTrigger>
                <TabsTrigger value="message">Mensagem</TabsTrigger>
                <TabsTrigger value="contact">Contactos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info">
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome Completo *</Label>
                      <Input 
                        value={formData.fullName} 
                        onChange={e => {
                          const name = e.target.value;
                          setFormData({ 
                            ...formData, 
                            fullName: name,
                            slug: generateSlug(name)
                          });
                        }} 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Slug *</Label>
                      <Input 
                        value={formData.slug} 
                        onChange={e => setFormData({ ...formData, slug: e.target.value })} 
                        placeholder="gerado-automaticamente"
                        required 
                      />
                      <p className="text-xs text-muted-foreground">
                        Gerado automaticamente a partir do nome. Pode editar manualmente se necessário.
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Grupo *</Label>
                      <Select 
                        value={formData.councilMemberGroupId} 
                        onValueChange={v => setFormData({ ...formData, councilMemberGroupId: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um grupo" />
                        </SelectTrigger>
                        <SelectContent>
                          {groups.map(g => (
                            <SelectItem key={g.id} value={g.id}>
                              {getGroupNamePt(g)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Ordem de Exibição</Label>
                      <Input 
                        type="number" 
                        value={formData.displayOrder} 
                        onChange={e => setFormData({ ...formData, displayOrder: Number(e.target.value) })} 
                      />
                    </div>
                  </div>
                  
                  <Tabs defaultValue="pt" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="pt">Português *</TabsTrigger>
                      <TabsTrigger value="en">English</TabsTrigger>
                    </TabsList>
                    <TabsContent value="pt" className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Título (Português) *</Label>
                        <Input 
                          value={formData.titlePt} 
                          onChange={e => setFormData({ ...formData, titlePt: e.target.value })} 
                          placeholder="Ex: Presidente do Conselho"
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Pelouro (Português)</Label>
                        <Input 
                          value={formData.pelouroPt} 
                          onChange={e => setFormData({ ...formData, pelouroPt: e.target.value })} 
                          placeholder="Ex: Recursos Humanos"
                        />
                      </div>
                    </TabsContent>
                    <TabsContent value="en" className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Title (English)</Label>
                        <Input 
                          value={formData.titleEn} 
                          onChange={e => setFormData({ ...formData, titleEn: e.target.value })} 
                          placeholder="Ex: Chairman of the Board"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Portfolio (English)</Label>
                        <Input 
                          value={formData.pelouroEn} 
                          onChange={e => setFormData({ ...formData, pelouroEn: e.target.value })} 
                          placeholder="Ex: Human Resources"
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="space-y-2">
                    <Label>Foto do Membro</Label>
                    <div className="flex flex-col gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoSelect}
                        className="w-full p-2 border rounded-md"
                      />
                      {currentPhotoUrl && (
                        <div className="relative rounded-md overflow-hidden border">
                          <img 
                            src={currentPhotoUrl} 
                            alt="Preview" 
                            className="w-32 h-32 object-cover mx-auto"
                          />
                          {editing && !selectedPhotoFile && formData.existingPhotoUrl && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={handleRemoveExistingPhoto}
                              className="absolute top-2 right-2"
                            >
                              Remover
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={formData.isActive} 
                      onCheckedChange={v => setFormData({ ...formData, isActive: v })} 
                    />
                    <Label>Activo</Label>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="bio">
                <div className="grid gap-4">
                  <Tabs defaultValue="pt" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="pt">Português</TabsTrigger>
                      <TabsTrigger value="en">English</TabsTrigger>
                    </TabsList>
                    <TabsContent value="pt">
                      <div className="space-y-2">
                        <Label>Biografia (Português)</Label>
                        <Textarea 
                          value={formData.biographyPt} 
                          onChange={e => setFormData({ ...formData, biographyPt: e.target.value })} 
                          rows={10}
                        />
                      </div>
                    </TabsContent>
                    <TabsContent value="en">
                      <div className="space-y-2">
                        <Label>Biography (English)</Label>
                        <Textarea 
                          value={formData.biographyEn} 
                          onChange={e => setFormData({ ...formData, biographyEn: e.target.value })} 
                          rows={10}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </TabsContent>
              
              <TabsContent value="message">
                <div className="grid gap-4">
                  <Tabs defaultValue="pt" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="pt">Português</TabsTrigger>
                      <TabsTrigger value="en">English</TabsTrigger>
                    </TabsList>
                    <TabsContent value="pt">
                      <div className="space-y-2">
                        <Label>Mensagem Institucional (Português)</Label>
                        <Textarea 
                          value={formData.institutionalMessagePt} 
                          onChange={e => setFormData({ ...formData, institutionalMessagePt: e.target.value })} 
                          rows={10}
                        />
                      </div>
                    </TabsContent>
                    <TabsContent value="en">
                      <div className="space-y-2">
                        <Label>Institutional Message (English)</Label>
                        <Textarea 
                          value={formData.institutionalMessageEn} 
                          onChange={e => setFormData({ ...formData, institutionalMessageEn: e.target.value })} 
                          rows={10}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </TabsContent>
              
              <TabsContent value="contact">
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input 
                        type="email" 
                        value={formData.email} 
                        onChange={e => setFormData({ ...formData, email: e.target.value })} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefone</Label>
                      <Input 
                        value={formData.phone} 
                        onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Localização do Gabinete</Label>
                    <Input 
                      value={formData.officeLocation} 
                      onChange={e => setFormData({ ...formData, officeLocation: e.target.value })} 
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving || isUploadingPhoto}>
                {(isSaving || isUploadingPhoto) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
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
            <AlertDialogTitle>Eliminar Membro</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja eliminar "{deleteItem?.fullName}"?
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