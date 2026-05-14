import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  ExternalLink,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Loader2,
  Eye,
  Copy,
  TrendingUp,
  Percent,
  CalendarDays,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { toast } from "sonner";
import { format, subMonths, startOfMonth, isAfter } from "date-fns";
import { pt } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

type Registration = {
  id: string;
  full_name: string;
  email: string;
  company_name: string;
  country: string | null;
  phone: string | null;
  sector: string | null;
  message: string | null;
  status: string;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
};

export default function AdminInvestorsPage() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [credentialsDialog, setCredentialsDialog] = useState<{ email: string; password: string } | null>(null);

  const { data: registrations = [], isLoading } = useQuery({
    queryKey: ["investor-registrations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("investor_registrations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Registration[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (registrationId: string) => {
      const { data, error } = await supabase.functions.invoke("approve-investor", {
        body: { registrationId, action: "approve" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["investor-registrations"] });
      if (data?.credentials) {
        setCredentialsDialog({
          email: data.credentials.email,
          password: data.credentials.temporaryPassword || data.credentials.password,
        });
      }
      toast.success("Investidor aprovado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao aprovar: ${error.message}`);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ registrationId, reason }: { registrationId: string; reason: string }) => {
      const { data, error } = await supabase.functions.invoke("approve-investor", {
        body: { registrationId, action: "reject", rejectionReason: reason },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investor-registrations"] });
      setShowRejectDialog(false);
      setRejectionReason("");
      toast.success("Registo rejeitado.");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao rejeitar: ${error.message}`);
    },
  });

  const filtered = registrations.filter((r) => {
    const matchesSearch =
      r.full_name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.company_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: registrations.length,
    pending: registrations.filter((r) => r.status === "pending").length,
    approved: registrations.filter((r) => r.status === "approved").length,
    rejected: registrations.filter((r) => r.status === "rejected").length,
  };

  const approvalRate = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;

  // Registrations by month (last 6 months)
  const monthlyData = useMemo(() => {
    const months: { month: string; registos: number; aprovados: number; rejeitados: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i));
      const monthEnd = startOfMonth(subMonths(new Date(), i - 1));
      const monthRegs = registrations.filter((r) => {
        const d = new Date(r.created_at);
        return isAfter(d, monthStart) && !isAfter(d, monthEnd);
      });
      months.push({
        month: format(monthStart, "MMM yy", { locale: pt }),
        registos: monthRegs.length,
        aprovados: monthRegs.filter((r) => r.status === "approved").length,
        rejeitados: monthRegs.filter((r) => r.status === "rejected").length,
      });
    }
    return months;
  }, [registrations]);

  // Status distribution for pie chart
  const pieData = useMemo(() => [
    { name: "Pendentes", value: stats.pending, color: "hsl(var(--muted-foreground))" },
    { name: "Aprovados", value: stats.approved, color: "hsl(var(--primary))" },
    { name: "Rejeitados", value: stats.rejected, color: "hsl(var(--destructive))" },
  ].filter((d) => d.value > 0), [stats]);

  // Last 5 approved investors
  const recentApproved = useMemo(() =>
    registrations
      .filter((r) => r.status === "approved" && r.reviewed_at)
      .sort((a, b) => new Date(b.reviewed_at!).getTime() - new Date(a.reviewed_at!).getTime())
      .slice(0, 5),
  [registrations]);

  const statusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="gap-1"><Clock className="w-3 h-3" />Pendente</Badge>;
      case "approved":
        return <Badge className="gap-1 bg-primary"><CheckCircle className="w-3 h-3" />Aprovado</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />Rejeitado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  return (
    <AdminLayout title="Gestão de Investidores" subtitle="Aprovar e gerir registos de investidores">

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card><CardContent className="pt-4 text-center"><div className="text-2xl font-bold">{stats.total}</div><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><div className="text-2xl font-bold text-status-warning">{stats.pending}</div><p className="text-xs text-muted-foreground">Pendentes</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><div className="text-2xl font-bold text-status-success">{stats.approved}</div><p className="text-xs text-muted-foreground">Aprovados</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><div className="text-2xl font-bold text-destructive">{stats.rejected}</div><p className="text-xs text-muted-foreground">Rejeitados</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><div className="text-2xl font-bold text-primary flex items-center justify-center gap-1"><Percent className="w-4 h-4" />{approvalRate}</div><p className="text-xs text-muted-foreground">Taxa Aprovação</p></CardContent></Card>
        </div>

        {/* Dashboard Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly registrations chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Registos por Mês (últimos 6 meses)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis allowDecimals={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="registos" name="Registos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="aprovados" name="Aprovados" fill="hsl(var(--primary) / 0.5)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Distribuição</CardTitle>
            </CardHeader>
            <CardContent>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value}`}>
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">Sem dados</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent approvals */}
        {recentApproved.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                Últimas Aprovações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentApproved.map((r) => (
                  <div key={r.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <div className="font-medium text-sm">{r.full_name}</div>
                      <div className="text-xs text-muted-foreground">{r.company_name} · {r.email}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {r.reviewed_at && format(new Date(r.reviewed_at), "dd MMM yyyy", { locale: pt })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por nome, email ou empresa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {["all", "pending", "approved", "rejected"].map((s) => (
              <Button
                key={s}
                variant={statusFilter === s ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(s)}
              >
                {s === "all" ? "Todos" : s === "pending" ? "Pendentes" : s === "approved" ? "Aprovados" : "Rejeitados"}
              </Button>
            ))}
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>Sem registos encontrados</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>País</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acções</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((reg) => (
                    <TableRow key={reg.id}>
                      <TableCell className="font-medium">{reg.full_name}</TableCell>
                      <TableCell>{reg.company_name}</TableCell>
                      <TableCell className="text-muted-foreground">{reg.email}</TableCell>
                      <TableCell>{reg.country || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(reg.created_at), "dd MMM yyyy", { locale: pt })}
                      </TableCell>
                      <TableCell>{statusBadge(reg.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedReg(reg)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {reg.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => approveMutation.mutate(reg.id)}
                                disabled={approveMutation.isPending}
                                className="bg-primary hover:bg-primary/90"
                              >
                                {approveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => { setSelectedReg(reg); setShowRejectDialog(true); }}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedReg && !showRejectDialog} onOpenChange={(o) => { if (!o) setSelectedReg(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Registo</DialogTitle>
          </DialogHeader>
          {selectedReg && (
            <div className="space-y-3 text-sm">
              <div><strong>Nome:</strong> {selectedReg.full_name}</div>
              <div><strong>Email:</strong> {selectedReg.email}</div>
              <div><strong>Empresa:</strong> {selectedReg.company_name}</div>
              <div><strong>País:</strong> {selectedReg.country || "—"}</div>
              <div><strong>Telefone:</strong> {selectedReg.phone || "—"}</div>
              <div><strong>Sector:</strong> {selectedReg.sector || "—"}</div>
              <div><strong>Mensagem:</strong> {selectedReg.message || "—"}</div>
              <div><strong>Estado:</strong> {statusBadge(selectedReg.status)}</div>
              <div><strong>Data:</strong> {format(new Date(selectedReg.created_at), "dd/MM/yyyy HH:mm", { locale: pt })}</div>
              {selectedReg.rejection_reason && <div><strong>Motivo Rejeição:</strong> {selectedReg.rejection_reason}</div>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={(o) => { if (!o) { setShowRejectDialog(false); setRejectionReason(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Registo</DialogTitle>
            <DialogDescription>
              Indique o motivo da rejeição para {selectedReg?.full_name}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Motivo da rejeição..."
            maxLength={500}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowRejectDialog(false); setRejectionReason(""); }}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedReg && rejectMutation.mutate({ registrationId: selectedReg.id, reason: rejectionReason })}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Confirmar Rejeição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Credentials Dialog */}
      <Dialog open={!!credentialsDialog} onOpenChange={(o) => { if (!o) setCredentialsDialog(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conta Criada com Sucesso</DialogTitle>
            <DialogDescription>
              Partilhe estas credenciais de forma segura com o investidor.
            </DialogDescription>
          </DialogHeader>
          {credentialsDialog && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div><span className="text-xs text-muted-foreground">Email</span><div className="font-mono text-sm">{credentialsDialog.email}</div></div>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(credentialsDialog.email)}><Copy className="w-4 h-4" /></Button>
                </div>
                <div className="flex items-center justify-between">
                  <div><span className="text-xs text-muted-foreground">Password Temporária</span><div className="font-mono text-sm">{credentialsDialog.password}</div></div>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(credentialsDialog.password)}><Copy className="w-4 h-4" /></Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                ⚠️ Esta password temporária só é exibida uma vez. Partilhe-a de forma segura com o investidor.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setCredentialsDialog(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
