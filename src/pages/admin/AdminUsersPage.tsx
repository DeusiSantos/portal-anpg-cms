// pages/admin/AdminUsersPage.tsx
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Label } from '@/components/ui/label';
import { Search, Loader2, UserPlus, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import api from '@/service/api';

// Interfaces baseadas na resposta da API
interface Contact {
  email: string;
  phoneNumber: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  code: string;
  isActive: boolean;
}

interface UserProfile {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  birthdate: string | null;
  gender: string;
  identification: any | null;
  contact: Contact;
  address: any | null;
  roleId: string;
  role: Role;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  isDeleted: boolean;
  isActive: boolean;
}

interface UsersResponse {
  items: UserProfile[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalActive: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface CreateUserRequest {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  roleId: string;
}

interface UpdateUserRequest {
  fullName?: string;
  phoneNumber?: string;
  roleId?: string;
  isActive?: boolean;
}

// Buscar roles disponíveis
const fetchRoles = async (): Promise<Role[]> => {
  const response = await api.get('/roles', {
    params: { page: 1, pageSize: 100, IsActive: true }
  });
  return response.data?.items || [];
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    roleId: '',
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar roles ao carregar
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const rolesData = await fetchRoles();
        setRoles(rolesData);
        if (rolesData.length > 0) {
          setFormData(prev => ({ ...prev, roleId: rolesData[0].id }));
        }
      } catch (error) {
        console.error('Erro ao carregar roles:', error);
      }
    };
    loadRoles();
  }, []);

  // Query para buscar utilizadores
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['users-profiles'],
    queryFn: async () => {
      const response = await api.get<UsersResponse>('/users-profiles', {
        params: { page: 1, pageSize: 100 }
      });
      return response.data;
    },
  });

  // Mutation para criar utilizador
  const createMutation = useMutation({
    mutationFn: async (userData: CreateUserRequest) => {
      const response = await api.post('/users-profiles', userData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-profiles'] });
      setDialogOpen(false);
      resetForm();
      toast({
        title: 'Sucesso',
        description: 'Utilizador criado com sucesso!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.response?.data?.message || 'Erro ao criar utilizador',
        variant: 'destructive',
      });
    },
  });

  // Mutation para atualizar utilizador (PATCH)
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserRequest }) => {
      const response = await api.patch(`/users-profiles/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-profiles'] });
      setDialogOpen(false);
      setEditingUser(null);
      resetForm();
      toast({
        title: 'Sucesso',
        description: 'Utilizador atualizado com sucesso!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.response?.data?.message || 'Erro ao atualizar utilizador',
        variant: 'destructive',
      });
    },
  });

  // Mutation para desativar/ativar utilizador
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await api.patch(`/users-profiles/${id}`, { isActive });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-profiles'] });
      toast({
        title: 'Sucesso',
        description: 'Status do utilizador atualizado!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.response?.data?.message || 'Erro ao atualizar status',
        variant: 'destructive',
      });
    },
  });

  const users = data?.items || [];
  const totalCount = data?.totalCount || 0;

  const filteredUsers = users.filter(
    (user) =>
      user.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      user.contact?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      password: '',
      phoneNumber: '',
      roleId: roles[0]?.id || '',
    });
  };

  const handleEdit = (user: UserProfile) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName || '',
      email: user.contact?.email || '',
      password: '',
      phoneNumber: user.contact?.phoneNumber || '',
      roleId: user.roleId || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingUser) {
      const updateData: UpdateUserRequest = {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        roleId: formData.roleId,
      };
      updateMutation.mutate({ id: editingUser.id, data: updateData });
    } else {
      if (!formData.password) {
        toast({
          title: 'Erro',
          description: 'A palavra-passe é obrigatória para novos utilizadores.',
          variant: 'destructive',
        });
        return;
      }
      createMutation.mutate(formData);
    }
  };

  const getRoleName = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role?.name || role?.code || roleId;
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default" className="bg-green-500">Ativo</Badge>
    ) : (
      <Badge variant="secondary">Inativo</Badge>
    );
  };

  const isLoadingData = isLoading || isFetching;

  return (
    <AdminLayout title="Gestão de Utilizadores" subtitle="Gerir contas e permissões">
      <main className="container mx-auto px-4 py-8">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar utilizadores..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => {
            setEditingUser(null);
            resetForm();
            setDialogOpen(true);
          }}>
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Utilizador
          </Button>
        </div>

        {/* Users Table */}
        <div className="bg-background rounded-lg border">
          {isLoadingData ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center p-12 text-muted-foreground">
              {search ? 'Nenhum utilizador encontrado.' : 'Ainda não existem utilizadores.'}
            </div>
          ) : (
            <>
              <div className="p-4 border-b">
                <p className="text-sm text-muted-foreground">
                  Total de utilizadores: <span className="font-semibold">{totalCount}</span>
                </p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilizador</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.fullName}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{user.contact?.email || '-'}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {getRoleName(user.roleId)}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.contact?.phoneNumber || '-'}</TableCell>
                      <TableCell>{getStatusBadge(user.isActive)}</TableCell>
                      <TableCell>
                        {user.createdAt
                          ? format(new Date(user.createdAt), "dd/MM/yyyy", { locale: pt })
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(user)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleActiveMutation.mutate({ 
                              id: user.id, 
                              isActive: !user.isActive 
                            })}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </div>
      </main>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Editar Utilizador' : 'Criar Novo Utilizador'}</DialogTitle>
            <DialogDescription>
              {editingUser 
                ? 'Edite as informações do utilizador.' 
                : 'Preencha os dados para criar um novo utilizador.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome Completo *</Label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@dominio.com"
                disabled={!!editingUser}
              />
            </div>
            {!editingUser && (
              <div className="space-y-2">
                <Label>Palavra-passe *</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="+244 923 456 789"
              />
            </div>
            <div className="space-y-2">
              <Label>Role *</Label>
              <Select value={formData.roleId} onValueChange={(v) => setFormData({ ...formData, roleId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione uma role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name} - {role.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingUser ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}