import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Pencil,
  Trash2,
  BarChart3,
  Filter,
  Loader2,
  TrendingUp,
  Droplets,
  Flame,
} from 'lucide-react';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type ProductionStat = Tables<'production_statistics'>;
type PetroleumBlock = Tables<'petroleum_blocks'>;

const MONTHS = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => currentYear - i);

const emptyStats: Partial<TablesInsert<'production_statistics'>> = {
  year: currentYear,
  month: new Date().getMonth() + 1,
  oil_production_bpd: undefined,
  gas_production_mmscfd: undefined,
  block_id: '',
  notes: '',
};

export default function AdminProductionPage() {
  const queryClient = useQueryClient();
  
  const [filterYear, setFilterYear] = useState<string>(String(currentYear));
  const [filterMonth, setFilterMonth] = useState<string>('all');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStats, setEditingStats] = useState<ProductionStat | null>(null);
  const [formData, setFormData] = useState<Partial<TablesInsert<'production_statistics'>>>(emptyStats);
  const [deleteStats, setDeleteStats] = useState<ProductionStat | null>(null);

  // Fetch production stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-production', filterYear, filterMonth],
    queryFn: async () => {
      let query = supabase
        .from('production_statistics')
        .select('*')
        .order('year', { ascending: false })
        .order('month', { ascending: false });
      
      if (filterYear !== 'all') {
        query = query.eq('year', parseInt(filterYear));
      }
      if (filterMonth !== 'all') {
        query = query.eq('month', parseInt(filterMonth));
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ProductionStat[];
    },
  });

  // Fetch blocks for dropdown
  const { data: blocks } = useQuery({
    queryKey: ['admin-blocks-dropdown'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('petroleum_blocks')
        .select('id, block_name')
        .order('block_name');
      if (error) throw error;
      return data as Pick<PetroleumBlock, 'id' | 'block_name'>[];
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: TablesInsert<'production_statistics'>) => {
      const { error } = await supabase.from('production_statistics').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-production'] });
      toast.success('Estatísticas adicionadas com sucesso');
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error(`Erro ao adicionar estatísticas: ${error.message}`);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TablesUpdate<'production_statistics'> }) => {
      const { error } = await supabase.from('production_statistics').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-production'] });
      toast.success('Estatísticas actualizadas com sucesso');
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error(`Erro ao actualizar estatísticas: ${error.message}`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('production_statistics').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-production'] });
      toast.success('Estatísticas eliminadas com sucesso');
      setDeleteStats(null);
    },
    onError: (error) => {
      toast.error(`Erro ao eliminar estatísticas: ${error.message}`);
    },
  });

  const handleOpenCreate = () => {
    setEditingStats(null);
    setFormData(emptyStats);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (stat: ProductionStat) => {
    setEditingStats(stat);
    setFormData({
      year: stat.year,
      month: stat.month || undefined,
      oil_production_bpd: stat.oil_production_bpd ? Number(stat.oil_production_bpd) : undefined,
      gas_production_mmscfd: stat.gas_production_mmscfd ? Number(stat.gas_production_mmscfd) : undefined,
      block_id: stat.block_id || '',
      notes: stat.notes || '',
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingStats(null);
    setFormData(emptyStats);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.year) {
      toast.error('Ano é obrigatório');
      return;
    }

    const submitData: TablesInsert<'production_statistics'> = {
      year: formData.year!,
      month: formData.month || null,
      oil_production_bpd: formData.oil_production_bpd || null,
      gas_production_mmscfd: formData.gas_production_mmscfd || null,
      block_id: formData.block_id || null,
      notes: formData.notes || null,
    };

    if (editingStats) {
      updateMutation.mutate({ id: editingStats.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const getBlockName = (blockId: string | null) => {
    if (!blockId) return 'Agregado';
    return blocks?.find(b => b.id === blockId)?.block_name || 'Desconhecido';
  };

  // Calculate totals
  const totalOil = stats?.reduce((sum, s) => sum + (Number(s.oil_production_bpd) || 0), 0) || 0;
  const totalGas = stats?.reduce((sum, s) => sum + (Number(s.gas_production_mmscfd) || 0), 0) || 0;

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout title="Produção" subtitle="Gerir estatísticas de produção">

      <main className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-status-info/10">
                  <Droplets className="h-6 w-6 text-status-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Produção de Petróleo</p>
                  <p className="text-2xl font-bold">{totalOil.toLocaleString()} BPD</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-status-warning/10">
                  <Flame className="h-6 w-6 text-status-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Produção de Gás</p>
                  <p className="text-2xl font-bold">{totalGas.toLocaleString()} MMSCF/D</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-status-success/10">
                  <TrendingUp className="h-6 w-6 text-status-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registos</p>
                  <p className="text-2xl font-bold">{stats?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Dados de Produção</CardTitle>
                <CardDescription>Estatísticas mensais de produção de petróleo e gás</CardDescription>
              </div>
              <Button onClick={handleOpenCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Dados
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Anos</SelectItem>
                  {YEARS.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterMonth} onValueChange={setFilterMonth}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Meses</SelectItem>
                  {MONTHS.map((month) => (
                    <SelectItem key={month.value} value={String(month.value)}>
                      {month.label}
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
                      <TableHead>Período</TableHead>
                      <TableHead>Bloco</TableHead>
                      <TableHead className="text-right">Petróleo (BPD)</TableHead>
                      <TableHead className="text-right">Gás (MMSCF/D)</TableHead>
                      <TableHead>Notas</TableHead>
                      <TableHead className="text-right">Acções</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Nenhuma estatística encontrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      stats?.map((stat) => (
                        <TableRow key={stat.id}>
                          <TableCell className="font-medium">
                            {stat.month ? `${MONTHS[stat.month - 1]?.label} ` : ''}{stat.year}
                          </TableCell>
                          <TableCell>{getBlockName(stat.block_id)}</TableCell>
                          <TableCell className="text-right font-mono">
                            {stat.oil_production_bpd ? Number(stat.oil_production_bpd).toLocaleString() : '—'}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {stat.gas_production_mmscfd ? Number(stat.gas_production_mmscfd).toLocaleString() : '—'}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {stat.notes || '—'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(stat)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => setDeleteStats(stat)}>
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
            <DialogTitle>{editingStats ? 'Editar Estatísticas' : 'Adicionar Estatísticas'}</DialogTitle>
            <DialogDescription>
              {editingStats ? 'Actualizar dados de produção' : 'Adicionar novos dados de produção'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ano *</Label>
                  <Select
                    value={String(formData.year)}
                    onValueChange={(v) => setFormData({ ...formData, year: parseInt(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {YEARS.map((year) => (
                        <SelectItem key={year} value={String(year)}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Mês</Label>
                  <Select
                    value={formData.month ? String(formData.month) : ''}
                    onValueChange={(v) => setFormData({ ...formData, month: v ? parseInt(v) : undefined })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Opcional" />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map((month) => (
                        <SelectItem key={month.value} value={String(month.value)}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Bloco</Label>
                <Select
                  value={formData.block_id || ''}
                  onValueChange={(v) => setFormData({ ...formData, block_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Agregado (todos os blocos)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Agregado</SelectItem>
                    {blocks?.map((block) => (
                      <SelectItem key={block.id} value={block.id}>
                        {block.block_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Petróleo (BPD)</Label>
                  <Input
                    type="number"
                    value={formData.oil_production_bpd || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      oil_production_bpd: e.target.value ? Number(e.target.value) : undefined,
                    })}
                    placeholder="Ex: 1200000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gás (MMSCF/D)</Label>
                  <Input
                    type="number"
                    value={formData.gas_production_mmscfd || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      gas_production_mmscfd: e.target.value ? Number(e.target.value) : undefined,
                    })}
                    placeholder="Ex: 500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notas</Label>
                <Textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Observações adicionais..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingStats ? 'Actualizar' : 'Adicionar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteStats} onOpenChange={() => setDeleteStats(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Estatísticas</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que deseja eliminar estes dados de produção?
              Esta acção não pode ser revertida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteStats && deleteMutation.mutate(deleteStats.id)}
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
