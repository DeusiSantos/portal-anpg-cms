import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
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
  TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Search, Loader2, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  department: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: string;
}

const ROLES = [
  { value: 'admin', label: 'Administrador' },
  { value: 'editor_comunicacao', label: 'Editor Comunicação' },
  { value: 'editor_tecnico', label: 'Editor Técnico' },
  { value: 'gestor_investidores', label: 'Gestor Investidores' },
  { value: 'viewer', label: 'Visualizador' },
];

const DEPARTMENTS = [
  { value: 'administracao', label: 'Administração' },
  { value: 'comunicacao', label: 'Comunicação' },
  { value: 'tecnico', label: 'Técnico / E&P' },
  { value: 'investimentos', label: 'Investimentos' },
  { value: 'ti', label: 'Tecnologias de Informação' },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', fullName: '', password: '', role: '', department: '' });
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    
    // Fetch profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    } else {
      setUsers(profilesData || []);
    }

    // Fetch all roles
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role');

    if (rolesError) {
      console.error('Error fetching roles:', rolesError);
    } else {
      const rolesMap: Record<string, string[]> = {};
      rolesData?.forEach((r) => {
        if (!rolesMap[r.user_id]) {
          rolesMap[r.user_id] = [];
        }
        rolesMap[r.user_id].push(r.role);
      });
      setUserRoles(rolesMap);
    }

    setLoading(false);
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.fullName || !newUser.password || !newUser.role) {
      toast({
        title: 'Erro',
        description: 'Por favor preencha todos os campos obrigatórios.',
        variant: 'destructive' });
      return;
    }

    setCreating(true);

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: newUser.email,
      password: newUser.password,
      options: {
        data: {
          full_name: newUser.fullName } } });

    if (authError) {
      toast({
        title: 'Erro ao criar utilizador',
        description: authError.message,
        variant: 'destructive' });
      setCreating(false);
      return;
    }

    if (authData.user) {
      // Create profile
      await supabase.from('profiles').insert([{
        user_id: authData.user.id,
        full_name: newUser.fullName,
        email: newUser.email,
        department: (newUser.department || null) as 'administracao' | 'comunicacao' | 'tecnico' | 'investimentos' | 'ti' | null }]);

      // Assign role
      await supabase.from('user_roles').insert([{
        user_id: authData.user.id,
        role: newUser.role as 'admin' | 'editor_comunicacao' | 'editor_tecnico' | 'gestor_investidores' | 'viewer' }]);

      toast({
        title: 'Utilizador criado',
        description: `${newUser.fullName} foi adicionado com sucesso.` });

      setDialogOpen(false);
      setNewUser({ email: '', fullName: '', password: '', role: '', department: '' });
      fetchUsers();
    }

    setCreating(false);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    const roleConfig = ROLES.find((r) => r.value === role);
    const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      admin: 'destructive',
      editor_comunicacao: 'default',
      editor_tecnico: 'secondary',
      gestor_investidores: 'outline',
      viewer: 'outline' };
    return (
      <Badge variant={variants[role] || 'outline'} className="text-xs">
        {roleConfig?.label || role}
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Utilizador
              </Button>
            </DialogTrigger>
            <DialogContent>
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
                    placeholder="João Silva"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="joao.silva@anpg.co.ao"
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
                  <Label>Departamento</Label>
                  <Select value={newUser.department} onValueChange={(v) => setNewUser({ ...newUser, department: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione um departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept.value} value={dept.value}>
                          {dept.label}
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilizador</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Criado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.full_name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {userRoles[user.user_id]?.map((role) => (
                          <span key={role}>{getRoleBadge(role)}</span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">
                      {DEPARTMENTS.find((d) => d.value === user.department)?.label || '-'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(user.created_at), "d MMM yyyy", { locale: pt })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </main>
    </AdminLayout>
  );
}
