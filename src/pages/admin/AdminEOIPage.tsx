import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  ArrowLeft,
  Search,
  Eye,
  Briefcase,
  Filter,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Building2,
  Globe,
} from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import type { Tables, TablesUpdate } from '@/integrations/supabase/types';

type EOI = Tables<'expressions_of_interest'>;

const STATUSES = [
  { value: 'pending', label: 'Pendente', icon: Clock, color: 'bg-status-warning' },
  { value: 'under_review', label: 'Em Análise', icon: Eye, color: 'bg-status-info' },
  { value: 'approved', label: 'Aprovado', icon: CheckCircle, color: 'bg-status-success' },
  { value: 'rejected', label: 'Rejeitado', icon: XCircle, color: 'bg-destructive' },
];

export default function AdminEOIPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedEOI, setSelectedEOI] = useState<EOI | null>(null);
  const [notes, setNotes] = useState('');

  // Fetch EOIs
  const { data: eois, isLoading } = useQuery({
    queryKey: ['admin-eois', filterStatus],
    queryFn: async () => {
      let query = supabase
        .from('expressions_of_interest')
        .select('*')
        .order('submitted_at', { ascending: false });
      
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as EOI[];
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TablesUpdate<'expressions_of_interest'> }) => {
      const { error } = await supabase.from('expressions_of_interest').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-eois'] });
      toast.success('EOI actualizado com sucesso');
      setSelectedEOI(null);
    },
    onError: (error) => {
      toast.error(`Erro ao actualizar EOI: ${error.message}`);
    },
  });

  const handleStatusChange = (eoi: EOI, newStatus: string) => {
    updateMutation.mutate({
      id: eoi.id,
      data: {
        status: newStatus,
        reviewed_by: user?.id || null,
        reviewed_at: new Date().toISOString(),
      },
    });
  };

  const handleSaveNotes = () => {
    if (!selectedEOI) return;
    updateMutation.mutate({
      id: selectedEOI.id,
      data: { notes },
    });
  };

  const filteredEOIs = eois?.filter((eoi) =>
    eoi.company_name.toLowerCase().includes(search.toLowerCase()) ||
    eoi.contact_person.toLowerCase().includes(search.toLowerCase()) ||
    eoi.email.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string | null) => {
    const statusConfig = STATUSES.find((s) => s.value === status) || STATUSES[0];
    return (
      <Badge variant="secondary" className={`${statusConfig.color} text-white`}>
        {statusConfig.label}
      </Badge>
    );
  };

  // Stats
  const pendingCount = eois?.filter(e => e.status === 'pending').length || 0;
  const underReviewCount = eois?.filter(e => e.status === 'under_review').length || 0;
  const approvedCount = eois?.filter(e => e.status === 'approved').length || 0;

  return (
    <AdminLayout title="Expressões de Interesse" subtitle="Gerir manifestações de interesse">

      <main className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-status-warning/10">
                  <Clock className="h-6 w-6 text-status-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-status-info/10">
                  <Eye className="h-6 w-6 text-status-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Em Análise</p>
                  <p className="text-2xl font-bold">{underReviewCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-status-success/10">
                  <CheckCircle className="h-6 w-6 text-status-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Aprovados</p>
                  <p className="text-2xl font-bold">{approvedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-muted">
                  <Briefcase className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{eois?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Submissões de Investidores</CardTitle>
            <CardDescription>Gerir expressões de interesse de potenciais investidores</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar empresa, contacto ou email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Estados</SelectItem>
                  {STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
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
                      <TableHead>Empresa</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Blocos</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Submetido</TableHead>
                      <TableHead className="text-right">Acções</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEOIs?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Nenhuma expressão de interesse encontrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEOIs?.map((eoi) => (
                        <TableRow key={eoi.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{eoi.company_name}</p>
                              <p className="text-sm text-muted-foreground">{eoi.country || '—'}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{eoi.contact_person}</p>
                              <p className="text-sm text-muted-foreground">{eoi.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {eoi.blocks_of_interest?.length ? (
                              <div className="flex flex-wrap gap-1">
                                {eoi.blocks_of_interest.slice(0, 3).map((block, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {block}
                                  </Badge>
                                ))}
                                {eoi.blocks_of_interest.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{eoi.blocks_of_interest.length - 3}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              '—'
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(eoi.status)}</TableCell>
                          <TableCell>
                            {format(new Date(eoi.submitted_at), "d MMM yyyy", { locale: pt })}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedEOI(eoi);
                                setNotes(eoi.notes || '');
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
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

      {/* Detail Dialog */}
      <Dialog open={!!selectedEOI} onOpenChange={() => setSelectedEOI(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Expressão de Interesse</DialogTitle>
            <DialogDescription>
              Detalhes da submissão de {selectedEOI?.company_name}
            </DialogDescription>
          </DialogHeader>
          {selectedEOI && (
            <div className="space-y-6 py-4">
              {/* Company Info */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Informação da Empresa
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Empresa</p>
                    <p className="font-medium">{selectedEOI.company_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">País</p>
                    <p className="font-medium">{selectedEOI.country || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <h4 className="font-semibold">Contacto</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Pessoa de Contacto</p>
                    <p className="font-medium">{selectedEOI.contact_person}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" /> Email
                    </p>
                    <p className="font-medium">{selectedEOI.email}</p>
                  </div>
                  {selectedEOI.phone && (
                    <div>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" /> Telefone
                      </p>
                      <p className="font-medium">{selectedEOI.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Blocks of Interest */}
              {selectedEOI.blocks_of_interest?.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold">Blocos de Interesse</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEOI.blocks_of_interest.map((block, i) => (
                      <Badge key={i} variant="secondary">
                        {block}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Message */}
              {selectedEOI.message && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Mensagem</h4>
                  <p className="text-sm bg-muted p-3 rounded-lg">{selectedEOI.message}</p>
                </div>
              )}

              {/* Status */}
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select
                  value={selectedEOI.status || 'pending'}
                  onValueChange={(value) => handleStatusChange(selectedEOI, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Internal Notes */}
              <div className="space-y-2">
                <Label>Notas Internas</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notas internas sobre este EOI..."
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedEOI(null)}>
              Fechar
            </Button>
            <Button onClick={handleSaveNotes} disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Guardar Notas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
