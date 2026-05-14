import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Search, Loader2, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
interface User {
  id: string;
  fullName: string;
  email: string;
  position: string;
  phoneNumber: string;
  roles: string[];
  status: string;
  createdAt: string;
}

interface UsersResponse {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: User[];
}

const ROLES = [
  { value: 'admin', label: 'Administrador' },
  { value: 'editor_comunicacao', label: 'Editor Comunicação' },
  { value: 'editor_tecnico', label: 'Editor Técnico' },
  { value: 'gestor_investidores', label: 'Gestor Investidores' },
  { value: 'viewer', label: 'Visualizador' },
];

const POSITIONS = [
  { value: 'gerente', label: 'Gerente' },
  { value: 'coordenador', label: 'Coordenador' },
  { value: 'analista', label: 'Analista' },
  { value: 'tecnico', label: 'Técnico' },
  { value: 'assistente', label: 'Assistente' },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    password: '',
    position: '',
    phone: '',
    role: '',
  });
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // A API ANPG CMS (v1) não expõe CRUD de utilizadores neste Swagger — apenas auth/me, etc.
      setUsers([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.fullName || !newUser.email || !newUser.password || !newUser.role) {
      toast({
        title: 'Erro',
        description: 'Por favor preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);

    try {
      toast({
        title: 'Indisponível',
        description:
          'A gestão de utilizadores não está exposta nesta versão da API. Contacte o administrador do backend.',
        variant: 'destructive',
      });
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: 'Erro ao criar utilizador',
        description: error.response?.data?.message || 'Ocorreu um erro ao criar o utilizador.',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    const roleConfig = ROLES.find((r) => r.value === role);
    const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      admin: 'destructive',
      editor_comunicacao: 'default',
      editor_tecnico: 'secondary',
      gestor_investidores: 'outline',
      viewer: 'outline',
    };
    return (
      <Badge variant={variants[role] || 'outline'} className="text-xs">
        {roleConfig?.label || role}
      </Badge>
    );
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

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      Ativo: { label: 'Ativo', variant: 'default' },
      Inativo: { label: 'Inativo', variant: 'secondary' },
      Suspenso: { label: 'Suspenso', variant: 'destructive' },
    };
    const config = statusConfig[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <AdminLayout title="Gestão de Utilizadores" subtitle="Gerir contas e permissões">
      <main className="container mx-auto px-4 py-8">
        <p className="text-sm text-muted-foreground mb-6 max-w-3xl">
          A API publicada (Swagger) não inclui endpoints de listagem ou criação de utilizadores — apenas autenticação (<code className="text-xs">auth/login</code>, <code className="text-xs">auth/me</code>). Os utilizadores devem ser geridos no backoffice servido pela equipa de backend ou quando esses endpoints forem adicionados.
        </p>
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
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Utilizador
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Novo Utilizador</DialogTitle>
                <DialogDescription>
                  Adicione um novo utilizador ao backoffice com as permissões adequadas.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome Completo *</Label>
                  <Input
                    value={newUser.fullName}
                    onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                    placeholder="Nome do utilizador"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="email@dominio.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Palavra-passe *</Label>
                  <Input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role *</Label>
                  <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione uma role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cargo/Posição</Label>
                  <Select value={newUser.position} onValueChange={(v) => setNewUser({ ...newUser, position: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione um cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      {POSITIONS.map((pos) => (
                        <SelectItem key={pos.value} value={pos.value}>
                          {pos.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    type="tel"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    placeholder="+244 923 456 789"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateUser} disabled={creating}>
                  {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Criar Utilizador
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Users Table */}
        <div className="bg-background rounded-lg border">
          {loading ? (
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
                    <TableHead>Roles</TableHead>
                    <TableHead>Posição</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
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
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles?.map((role) => (
                            <span key={role}>{getRoleBadge(role)}</span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">
                        {POSITIONS.find((p) => p.value === user.position)?.label || user.position || '-'}
                      </TableCell>
                      <TableCell>{user.phoneNumber || '-'}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        {user.createdAt
                          ? format(new Date(user.createdAt), "d MMM yyyy", { locale: pt })
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </div>
      </main>
    </AdminLayout>
  );
}