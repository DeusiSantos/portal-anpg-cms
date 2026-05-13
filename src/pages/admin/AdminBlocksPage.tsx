import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Filter,
  Loader2,
  PlusCircle,
  Edit,
  X,
} from 'lucide-react';
import api from '@/service/api';

// Tipos da API
interface Basin {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

interface BasinsResponse {
  items: Basin[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalActive: number;
  totalPages: number;
}

interface OilBlockState {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

interface OilBlockStatesResponse {
  items: OilBlockState[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalActive: number;
  totalPages: number;
}

interface Operator {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

interface OperatorsResponse {
  items: Operator[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalActive: number;
  totalPages: number;
}

interface GeologicalFormation {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

interface GeologicalFormationsResponse {
  items: GeologicalFormation[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalActive: number;
  totalPages: number;
}

interface ReservoirType {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

interface ReservoirTypesResponse {
  items: ReservoirType[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalActive: number;
  totalPages: number;
}

interface OilBlock {
  id: string;
  name: string;
  basinId: string;
  basinName: string;
  oilBlockStateId: string;
  oilBlockStateName: string;
  operatorId: string;
  operatorName: string;
  areaKm2: number;
  waterDepthMeters: number;
  description: string;
  discoveryYear: number;
  estimatedReservesMMboe: number;
  geologicalFormationId: string;
  geologicalFormationName: string;
  reservoirTypeId: string;
  reservoirTypeName: string;
  licenseStartDate: string;
  licenseEndDate: string;
  totalWells: number;
  activeWells: number;
  fpsoName: string;
  geologicalNotes: string;
  isActive: boolean;
  createdAt: string;
}

interface OilBlocksResponse {
  items: OilBlock[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalActive: number;
  totalPages: number;
}

interface OilBlockFormData {
  name: string;
  basinId: string;
  oilBlockStateId: string;
  operatorId: string;
  areaKm2: number;
  waterDepthMeters: number;
  description: string;
  discoveryYear: number;
  estimatedReservesMMboe: number;
  geologicalFormationId: string;
  reservoirTypeId: string;
  licenseStartDate: string;
  licenseEndDate: string;
  totalWells: number;
  activeWells: number;
  fpsoName: string;
  geologicalNotes: string;
  isActive: boolean;
}

// Componente para gerenciar Bacias
function BasinsManager({ onBasinCreated }: { onBasinCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [editingBasin, setEditingBasin] = useState<Basin | null>(null);
  const [deleteBasin, setDeleteBasin] = useState<Basin | null>(null);

  const { data: basinsResponse, refetch } = useQuery({
    queryKey: ['basins-manager'],
    queryFn: async () => {
      const response = await api.get<BasinsResponse>('/operations/basins', {
        params: { Page: 1, PageSize: 100 }
      });
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await api.post('/operations/basins', { name });
      return response.data;
    },
    onSuccess: () => {
      refetch();
      onBasinCreated();
      toast.success('Bacia criada com sucesso');
      setName('');
      setOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar bacia');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const response = await api.patch(`/operations/basins/${id}`, { name });
      return response.data;
    },
    onSuccess: () => {
      refetch();
      onBasinCreated();
      toast.success('Bacia actualizada com sucesso');
      setEditingBasin(null);
      setName('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao actualizar bacia');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/operations/basins/${id}`);
      return response.data;
    },
    onSuccess: () => {
      refetch();
      onBasinCreated();
      toast.success('Bacia eliminada com sucesso');
      setDeleteBasin(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao eliminar bacia');
    },
  });

  const basins = basinsResponse?.items || [];

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="gap-1">
            <PlusCircle className="h-4 w-4" />
            Gerir Bacias
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Gestão de Bacias</DialogTitle>
            <DialogDescription>
              Adicione, edite ou remova bacias petrolíferas.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <Input
                placeholder="Nome da bacia"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1"
              />
              <Button onClick={() => {
                if (!name.trim()) {
                  toast.error('Nome da bacia é obrigatório');
                  return;
                }
                if (editingBasin) {
                  updateMutation.mutate({ id: editingBasin.id, name: name.trim() });
                } else {
                  createMutation.mutate(name.trim());
                }
              }} disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingBasin ? 'Actualizar' : 'Adicionar'}
              </Button>
            </div>
            {editingBasin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingBasin(null);
                  setName('');
                }}
                className="text-muted-foreground"
              >
                <X className="h-3 w-3 mr-1" />
                Cancelar edição
              </Button>
            )}
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="w-24 text-right">Acções</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {basins.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        Nenhuma bacia cadastrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    basins.map((basin) => (
                      <TableRow key={basin.id}>
                        <TableCell>{basin.name}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setEditingBasin(basin);
                                setName(basin.name);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteBasin(basin)}
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteBasin} onOpenChange={() => setDeleteBasin(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Bacia</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja eliminar a bacia "{deleteBasin?.name}"?
              Esta acção não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteBasin && deleteMutation.mutate(deleteBasin.id)}
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

// Componente para gerenciar Estados
function OilBlockStatesManager({ onStateCreated }: { onStateCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [editingState, setEditingState] = useState<OilBlockState | null>(null);
  const [deleteState, setDeleteState] = useState<OilBlockState | null>(null);

  const { data: statesResponse, refetch } = useQuery({
    queryKey: ['oil-block-states-manager'],
    queryFn: async () => {
      const response = await api.get<OilBlockStatesResponse>('/operations/oil-block-states', {
        params: { Page: 1, PageSize: 100 }
      });
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await api.post('/operations/oil-block-states', { name });
      return response.data;
    },
    onSuccess: () => {
      refetch();
      onStateCreated();
      toast.success('Estado criado com sucesso');
      setName('');
      setOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar estado');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const response = await api.patch(`/operations/oil-block-states/${id}`, { name });
      return response.data;
    },
    onSuccess: () => {
      refetch();
      onStateCreated();
      toast.success('Estado actualizado com sucesso');
      setEditingState(null);
      setName('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao actualizar estado');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/operations/oil-block-states/${id}`);
      return response.data;
    },
    onSuccess: () => {
      refetch();
      onStateCreated();
      toast.success('Estado eliminado com sucesso');
      setDeleteState(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao eliminar estado');
    },
  });

  const states = statesResponse?.items || [];

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="gap-1">
            <PlusCircle className="h-4 w-4" />
            Gerir Estados
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Gestão de Estados de Bloco</DialogTitle>
            <DialogDescription>
              Adicione, edite ou remova estados de blocos petrolíferos.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <Input
                placeholder="Nome do estado"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1"
              />
              <Button onClick={() => {
                if (!name.trim()) {
                  toast.error('Nome do estado é obrigatório');
                  return;
                }
                if (editingState) {
                  updateMutation.mutate({ id: editingState.id, name: name.trim() });
                } else {
                  createMutation.mutate(name.trim());
                }
              }} disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingState ? 'Actualizar' : 'Adicionar'}
              </Button>
            </div>
            {editingState && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingState(null);
                  setName('');
                }}
                className="text-muted-foreground"
              >
                <X className="h-3 w-3 mr-1" />
                Cancelar edição
              </Button>
            )}
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="w-24 text-right">Acções</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {states.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        Nenhum estado cadastrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    states.map((state) => (
                      <TableRow key={state.id}>
                        <TableCell>{state.name}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setEditingState(state);
                                setName(state.name);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteState(state)}
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteState} onOpenChange={() => setDeleteState(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Estado</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja eliminar o estado "{deleteState?.name}"?
              Esta acção não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteState && deleteMutation.mutate(deleteState.id)}
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

// Componente para gerenciar Operadores
function OperatorsManager({ onOperatorCreated }: { onOperatorCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [editingOperator, setEditingOperator] = useState<Operator | null>(null);
  const [deleteOperator, setDeleteOperator] = useState<Operator | null>(null);

  const { data: operatorsResponse, refetch } = useQuery({
    queryKey: ['operators-manager'],
    queryFn: async () => {
      const response = await api.get<OperatorsResponse>('/operations/operators', {
        params: { Page: 1, PageSize: 100 }
      });
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await api.post('/operations/operators', { name });
      return response.data;
    },
    onSuccess: () => {
      refetch();
      onOperatorCreated();
      toast.success('Operador criado com sucesso');
      setName('');
      setOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar operador');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const response = await api.patch(`/operations/operators/${id}`, { name });
      return response.data;
    },
    onSuccess: () => {
      refetch();
      onOperatorCreated();
      toast.success('Operador actualizado com sucesso');
      setEditingOperator(null);
      setName('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao actualizar operador');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/operations/operators/${id}`);
      return response.data;
    },
    onSuccess: () => {
      refetch();
      onOperatorCreated();
      toast.success('Operador eliminado com sucesso');
      setDeleteOperator(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao eliminar operador');
    },
  });

  const operators = operatorsResponse?.items || [];

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="gap-1">
            <PlusCircle className="h-4 w-4" />
            Gerir Operadores
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Gestão de Operadores</DialogTitle>
            <DialogDescription>
              Adicione, edite ou remova operadores de blocos petrolíferos.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <Input
                placeholder="Nome do operador"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1"
              />
              <Button onClick={() => {
                if (!name.trim()) {
                  toast.error('Nome do operador é obrigatório');
                  return;
                }
                if (editingOperator) {
                  updateMutation.mutate({ id: editingOperator.id, name: name.trim() });
                } else {
                  createMutation.mutate(name.trim());
                }
              }} disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingOperator ? 'Actualizar' : 'Adicionar'}
              </Button>
            </div>
            {editingOperator && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingOperator(null);
                  setName('');
                }}
                className="text-muted-foreground"
              >
                <X className="h-3 w-3 mr-1" />
                Cancelar edição
              </Button>
            )}
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="w-24 text-right">Acções</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {operators.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        Nenhum operador cadastrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    operators.map((operator) => (
                      <TableRow key={operator.id}>
                        <TableCell>{operator.name}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setEditingOperator(operator);
                                setName(operator.name);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteOperator(operator)}
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteOperator} onOpenChange={() => setDeleteOperator(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Operador</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja eliminar o operador "{deleteOperator?.name}"?
              Esta acção não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteOperator && deleteMutation.mutate(deleteOperator.id)}
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

// Componente para gerenciar Formações Geológicas
function GeologicalFormationsManager({ onFormationCreated }: { onFormationCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [editingFormation, setEditingFormation] = useState<GeologicalFormation | null>(null);
  const [deleteFormation, setDeleteFormation] = useState<GeologicalFormation | null>(null);

  const { data: formationsResponse, refetch } = useQuery({
    queryKey: ['geological-formations-manager'],
    queryFn: async () => {
      const response = await api.get<GeologicalFormationsResponse>('/operations/geological-formations', {
        params: { Page: 1, PageSize: 100 }
      });
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await api.post('/operations/geological-formations', { name });
      return response.data;
    },
    onSuccess: () => {
      refetch();
      onFormationCreated();
      toast.success('Formação geológica criada com sucesso');
      setName('');
      setOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar formação geológica');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const response = await api.patch(`/operations/geological-formations/${id}`, { name });
      return response.data;
    },
    onSuccess: () => {
      refetch();
      onFormationCreated();
      toast.success('Formação geológica actualizada com sucesso');
      setEditingFormation(null);
      setName('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao actualizar formação geológica');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/operations/geological-formations/${id}`);
      return response.data;
    },
    onSuccess: () => {
      refetch();
      onFormationCreated();
      toast.success('Formação geológica eliminada com sucesso');
      setDeleteFormation(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao eliminar formação geológica');
    },
  });

  const formations = formationsResponse?.items || [];

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="gap-1">
            <PlusCircle className="h-4 w-4" />
            Gerir Formações
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Gestão de Formações Geológicas</DialogTitle>
            <DialogDescription>
              Adicione, edite ou remova formações geológicas.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <Input
                placeholder="Nome da formação"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1"
              />
              <Button onClick={() => {
                if (!name.trim()) {
                  toast.error('Nome da formação é obrigatório');
                  return;
                }
                if (editingFormation) {
                  updateMutation.mutate({ id: editingFormation.id, name: name.trim() });
                } else {
                  createMutation.mutate(name.trim());
                }
              }} disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingFormation ? 'Actualizar' : 'Adicionar'}
              </Button>
            </div>
            {editingFormation && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingFormation(null);
                  setName('');
                }}
                className="text-muted-foreground"
              >
                <X className="h-3 w-3 mr-1" />
                Cancelar edição
              </Button>
            )}
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="w-24 text-right">Acções</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        Nenhuma formação cadastrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    formations.map((formation) => (
                      <TableRow key={formation.id}>
                        <TableCell>{formation.name}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setEditingFormation(formation);
                                setName(formation.name);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteFormation(formation)}
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteFormation} onOpenChange={() => setDeleteFormation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Formação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja eliminar a formação "{deleteFormation?.name}"?
              Esta acção não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteFormation && deleteMutation.mutate(deleteFormation.id)}
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

// Componente para gerenciar Tipos de Reservatório
function ReservoirTypesManager({ onTypeCreated }: { onTypeCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [editingType, setEditingType] = useState<ReservoirType | null>(null);
  const [deleteType, setDeleteType] = useState<ReservoirType | null>(null);

  const { data: typesResponse, refetch } = useQuery({
    queryKey: ['reservoir-types-manager'],
    queryFn: async () => {
      const response = await api.get<ReservoirTypesResponse>('/operations/reservoir-types', {
        params: { Page: 1, PageSize: 100 }
      });
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await api.post('/operations/reservoir-types', { name });
      return response.data;
    },
    onSuccess: () => {
      refetch();
      onTypeCreated();
      toast.success('Tipo de reservatório criado com sucesso');
      setName('');
      setOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar tipo de reservatório');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const response = await api.patch(`/operations/reservoir-types/${id}`, { name });
      return response.data;
    },
    onSuccess: () => {
      refetch();
      onTypeCreated();
      toast.success('Tipo de reservatório actualizado com sucesso');
      setEditingType(null);
      setName('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao actualizar tipo de reservatório');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/operations/reservoir-types/${id}`);
      return response.data;
    },
    onSuccess: () => {
      refetch();
      onTypeCreated();
      toast.success('Tipo de reservatório eliminado com sucesso');
      setDeleteType(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao eliminar tipo de reservatório');
    },
  });

  const types = typesResponse?.items || [];

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="gap-1">
            <PlusCircle className="h-4 w-4" />
            Gerir Tipos
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Gestão de Tipos de Reservatório</DialogTitle>
            <DialogDescription>
              Adicione, edite ou remova tipos de reservatório.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <Input
                placeholder="Nome do tipo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1"
              />
              <Button onClick={() => {
                if (!name.trim()) {
                  toast.error('Nome do tipo é obrigatório');
                  return;
                }
                if (editingType) {
                  updateMutation.mutate({ id: editingType.id, name: name.trim() });
                } else {
                  createMutation.mutate(name.trim());
                }
              }} disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingType ? 'Actualizar' : 'Adicionar'}
              </Button>
            </div>
            {editingType && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingType(null);
                  setName('');
                }}
                className="text-muted-foreground"
              >
                <X className="h-3 w-3 mr-1" />
                Cancelar edição
              </Button>
            )}
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="w-24 text-right">Acções</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {types.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        Nenhum tipo de reservatório cadastrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    types.map((type) => (
                      <TableRow key={type.id}>
                        <TableCell>{type.name}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setEditingType(type);
                                setName(type.name);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteType(type)}
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteType} onOpenChange={() => setDeleteType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Tipo de Reservatório</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja eliminar o tipo de reservatório "{deleteType?.name}"?
              Esta acção não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteType && deleteMutation.mutate(deleteType.id)}
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

// Componente principal
export default function AdminBlocksPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterBasin, setFilterBasin] = useState<string>('all');
  const [filterState, setFilterState] = useState<string>('all');
  const [filterOperator, setFilterOperator] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<OilBlock | null>(null);
  const [deleteBlock, setDeleteBlock] = useState<OilBlock | null>(null);
  const [formData, setFormData] = useState<OilBlockFormData>({
    name: '',
    basinId: '',
    oilBlockStateId: '',
    operatorId: '',
    areaKm2: 0,
    waterDepthMeters: 0,
    description: '',
    discoveryYear: 0,
    estimatedReservesMMboe: 0,
    geologicalFormationId: '',
    reservoirTypeId: '',
    licenseStartDate: '',
    licenseEndDate: '',
    totalWells: 0,
    activeWells: 0,
    fpsoName: '',
    geologicalNotes: '',
    isActive: true,
  });

  // Buscar bacias
  const { data: basinsResponse } = useQuery({
    queryKey: ['basins'],
    queryFn: async () => {
      const response = await api.get<BasinsResponse>('/operations/basins', {
        params: { Page: 1, PageSize: 100 }
      });
      return response.data;
    },
  });

  // Buscar estados
  const { data: statesResponse } = useQuery({
    queryKey: ['oil-block-states'],
    queryFn: async () => {
      const response = await api.get<OilBlockStatesResponse>('/operations/oil-block-states', {
        params: { Page: 1, PageSize: 100 }
      });
      return response.data;
    },
  });

  // Buscar operadores
  const { data: operatorsResponse } = useQuery({
    queryKey: ['operators'],
    queryFn: async () => {
      const response = await api.get<OperatorsResponse>('/operations/operators', {
        params: { Page: 1, PageSize: 100 }
      });
      return response.data;
    },
  });

  // Buscar formações geológicas
  const { data: formationsResponse } = useQuery({
    queryKey: ['geological-formations'],
    queryFn: async () => {
      const response = await api.get<GeologicalFormationsResponse>('/operations/geological-formations', {
        params: { Page: 1, PageSize: 100 }
      });
      return response.data;
    },
  });

  // Buscar tipos de reservatório
  const { data: reservoirTypesResponse } = useQuery({
    queryKey: ['reservoir-types'],
    queryFn: async () => {
      const response = await api.get<ReservoirTypesResponse>('/operations/reservoir-types', {
        params: { Page: 1, PageSize: 100 }
      });
      return response.data;
    },
  });

  // Buscar blocos
  const { data: blocksResponse, isLoading } = useQuery({
    queryKey: ['admin-oil-blocks'],
    queryFn: async () => {
      const response = await api.get<OilBlocksResponse>('/operations/oil-blocks', {
        params: { Page: 1, PageSize: 100 }
      });
      return response.data;
    },
  });

  const basins = basinsResponse?.items || [];
  const states = statesResponse?.items || [];
  const operators = operatorsResponse?.items || [];
  const formations = formationsResponse?.items || [];
  const reservoirTypes = reservoirTypesResponse?.items || [];
  const blocks = blocksResponse?.items || [];

  // Criar bloco
  const createMutation = useMutation({
    mutationFn: async (data: OilBlockFormData) => {
      const response = await api.post('/operations/oil-blocks', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-oil-blocks'] });
      toast.success('Bloco criado com sucesso');
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar bloco');
    },
  });

  // Atualizar bloco
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<OilBlockFormData> }) => {
      const response = await api.patch(`/operations/oil-blocks/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-oil-blocks'] });
      toast.success('Bloco actualizado com sucesso');
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao actualizar bloco');
    },
  });

  // Eliminar bloco
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/operations/oil-blocks/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-oil-blocks'] });
      toast.success('Bloco eliminado com sucesso');
      setDeleteBlock(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao eliminar bloco');
    },
  });

  const handleOpenCreate = () => {
    setEditingBlock(null);
    setFormData({
      name: '',
      basinId: '',
      oilBlockStateId: '',
      operatorId: '',
      areaKm2: 0,
      waterDepthMeters: 0,
      description: '',
      discoveryYear: 0,
      estimatedReservesMMboe: 0,
      geologicalFormationId: '',
      reservoirTypeId: '',
      licenseStartDate: '',
      licenseEndDate: '',
      totalWells: 0,
      activeWells: 0,
      fpsoName: '',
      geologicalNotes: '',
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (block: OilBlock) => {
    setEditingBlock(block);
    setFormData({
      name: block.name,
      basinId: block.basinId,
      oilBlockStateId: block.oilBlockStateId,
      operatorId: block.operatorId,
      areaKm2: block.areaKm2,
      waterDepthMeters: block.waterDepthMeters,
      description: block.description || '',
      discoveryYear: block.discoveryYear || 0,
      estimatedReservesMMboe: block.estimatedReservesMMboe || 0,
      geologicalFormationId: block.geologicalFormationId || '',
      reservoirTypeId: block.reservoirTypeId || '',
      licenseStartDate: block.licenseStartDate?.split('T')[0] || '',
      licenseEndDate: block.licenseEndDate?.split('T')[0] || '',
      totalWells: block.totalWells || 0,
      activeWells: block.activeWells || 0,
      fpsoName: block.fpsoName || '',
      geologicalNotes: block.geologicalNotes || '',
      isActive: block.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingBlock(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error('Nome do bloco é obrigatório');
      return;
    }

    if (!formData.basinId) {
      toast.error('Selecione uma bacia');
      return;
    }

    if (!formData.oilBlockStateId) {
      toast.error('Selecione um estado');
      return;
    }

    if (!formData.operatorId) {
      toast.error('Selecione um operador');
      return;
    }

    if (editingBlock) {
      updateMutation.mutate({ id: editingBlock.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  // Filtrar blocos
  const filteredBlocks = blocks.filter((block) => {
    const matchesSearch =
      block.name.toLowerCase().includes(search.toLowerCase()) ||
      block.operatorName?.toLowerCase().includes(search.toLowerCase());
    const matchesBasin = filterBasin === 'all' || block.basinId === filterBasin;
    const matchesState = filterState === 'all' || block.oilBlockStateId === filterState;
    const matchesOperator = filterOperator === 'all' || block.operatorId === filterOperator;
    return matchesSearch && matchesBasin && matchesState && matchesOperator;
  });

  const getStateBadge = (stateName: string) => {
    const stateColors: Record<string, string> = {
      'Disponível': 'bg-status-success',
      'Licenciado': 'bg-status-info',
      'Exploração': 'bg-status-warning',
      'Produção': 'bg-primary',
      'Devolvido': 'bg-status-neutral',
    };
    const color = stateColors[stateName] || 'bg-secondary';
    return (
      <Badge className={`${color} text-white`}>
        {stateName}
      </Badge>
    );
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout title="Blocos Petrolíferos" subtitle="Gerir blocos de exploração e produção">
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Gestão de Blocos</CardTitle>
                <CardDescription>
                  Gerir blocos petrolíferos, concessões e operadores
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <BasinsManager onBasinCreated={() => queryClient.invalidateQueries({ queryKey: ['basins'] })} />
                <OilBlockStatesManager onStateCreated={() => queryClient.invalidateQueries({ queryKey: ['oil-block-states'] })} />
                <OperatorsManager onOperatorCreated={() => queryClient.invalidateQueries({ queryKey: ['operators'] })} />
                <GeologicalFormationsManager onFormationCreated={() => queryClient.invalidateQueries({ queryKey: ['geological-formations'] })} />
                <ReservoirTypesManager onTypeCreated={() => queryClient.invalidateQueries({ queryKey: ['reservoir-types'] })} />
                <Button onClick={handleOpenCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Bloco
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por nome ou operador..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterBasin} onValueChange={setFilterBasin}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Bacia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Bacias</SelectItem>
                  {basins.map((basin) => (
                    <SelectItem key={basin.id} value={basin.id}>
                      {basin.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterState} onValueChange={setFilterState}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Estados</SelectItem>
                  {states.map((state) => (
                    <SelectItem key={state.id} value={state.id}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterOperator} onValueChange={setFilterOperator}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Operador" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Operadores</SelectItem>
                  {operators.map((operator) => (
                    <SelectItem key={operator.id} value={operator.id}>
                      {operator.name}
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
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Bacia</TableHead>
                      <TableHead>Operador</TableHead>
                      <TableHead>Área (km²)</TableHead>
                      <TableHead>Prof. Água (m)</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acções</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBlocks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Nenhum bloco encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBlocks.map((block) => (
                        <TableRow key={block.id}>
                          <TableCell className="font-medium">{block.name}</TableCell>
                          <TableCell>{block.basinName || '—'}</TableCell>
                          <TableCell>{block.operatorName || '—'}</TableCell>
                          <TableCell>
                            {block.areaKm2 ? block.areaKm2.toLocaleString() : '—'}
                          </TableCell>
                          <TableCell>
                            {block.waterDepthMeters ? block.waterDepthMeters.toLocaleString() : '—'}
                          </TableCell>
                          <TableCell>{getStateBadge(block.oilBlockStateName)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenEdit(block)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteBlock(block)}
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

            <div className="mt-4 text-sm text-muted-foreground">
              {filteredBlocks.length} bloco(s) encontrado(s)
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBlock ? 'Editar Bloco' : 'Criar Novo Bloco'}
            </DialogTitle>
            <DialogDescription>
              {editingBlock
                ? 'Actualizar informações do bloco petrolífero'
                : 'Preencha os dados do novo bloco petrolífero'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Bloco *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Bloco 15"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Operador *</Label>
                  <Select
                    value={formData.operatorId}
                    onValueChange={(value) => setFormData({ ...formData, operatorId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar operador" />
                    </SelectTrigger>
                    <SelectContent>
                      {operators.map((operator) => (
                        <SelectItem key={operator.id} value={operator.id}>
                          {operator.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bacia *</Label>
                  <Select
                    value={formData.basinId}
                    onValueChange={(value) => setFormData({ ...formData, basinId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar bacia" />
                    </SelectTrigger>
                    <SelectContent>
                      {basins.map((basin) => (
                        <SelectItem key={basin.id} value={basin.id}>
                          {basin.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Estado *</Label>
                  <Select
                    value={formData.oilBlockStateId}
                    onValueChange={(value) => setFormData({ ...formData, oilBlockStateId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state.id} value={state.id}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Área (km²)</Label>
                  <Input
                    type="number"
                    value={formData.areaKm2 || ''}
                    onChange={(e) => setFormData({ ...formData, areaKm2: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Profundidade da Água (m)</Label>
                  <Input
                    type="number"
                    value={formData.waterDepthMeters || ''}
                    onChange={(e) => setFormData({ ...formData, waterDepthMeters: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Geological Information */}
              <div className="border-t pt-4 mt-2">
                <p className="text-sm font-medium text-muted-foreground mb-4">Informação Geológica e Licença</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ano de Descoberta</Label>
                    <Input
                      type="number"
                      value={formData.discoveryYear || ''}
                      onChange={(e) => setFormData({ ...formData, discoveryYear: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Reservas Estimadas (MMboe)</Label>
                    <Input
                      type="number"
                      value={formData.estimatedReservesMMboe || ''}
                      onChange={(e) => setFormData({ ...formData, estimatedReservesMMboe: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label>Formação Geológica</Label>
                    <Select
                      value={formData.geologicalFormationId}
                      onValueChange={(value) => setFormData({ ...formData, geologicalFormationId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar formação" />
                      </SelectTrigger>
                      <SelectContent>
                        {formations.map((formation) => (
                          <SelectItem key={formation.id} value={formation.id}>
                            {formation.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de Reservatório</Label>
                    <Select
                      value={formData.reservoirTypeId}
                      onValueChange={(value) => setFormData({ ...formData, reservoirTypeId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {reservoirTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label>Início da Licença</Label>
                    <Input
                      type="date"
                      value={formData.licenseStartDate}
                      onChange={(e) => setFormData({ ...formData, licenseStartDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fim da Licença</Label>
                    <Input
                      type="date"
                      value={formData.licenseEndDate}
                      onChange={(e) => setFormData({ ...formData, licenseEndDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label>Total de Poços</Label>
                    <Input
                      type="number"
                      value={formData.totalWells || ''}
                      onChange={(e) => setFormData({ ...formData, totalWells: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Poços Activos</Label>
                    <Input
                      type="number"
                      value={formData.activeWells || ''}
                      onChange={(e) => setFormData({ ...formData, activeWells: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nome do FPSO</Label>
                    <Input
                      value={formData.fpsoName}
                      onChange={(e) => setFormData({ ...formData, fpsoName: e.target.value })}
                      placeholder="Ex: FPSO Dália"
                    />
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <Label>Notas Geológicas</Label>
                  <Textarea
                    value={formData.geologicalNotes}
                    onChange={(e) => setFormData({ ...formData, geologicalNotes: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="isActive">Activo</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingBlock ? 'Guardar Alterações' : 'Criar Bloco'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteBlock} onOpenChange={() => setDeleteBlock(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Bloco</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que deseja eliminar o bloco "{deleteBlock?.name}"?
              Esta acção não pode ser revertida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteBlock && deleteMutation.mutate(deleteBlock.id)}
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