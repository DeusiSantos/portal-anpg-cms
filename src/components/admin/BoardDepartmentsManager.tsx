import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, Building, ChevronRight } from 'lucide-react';

interface Department {
  id: string;
  member_id: string;
  name_pt: string;
  name_en: string | null;
  acronym: string;
  sort_order: number;
  is_active: boolean;
}

interface SubDepartment {
  id: string;
  department_id: string;
  name_pt: string;
  name_en: string | null;
  sort_order: number;
}

interface Props {
  memberId: string;
  memberName: string;
}

export function BoardDepartmentsManager({ memberId, memberName }: Props) {
  const queryClient = useQueryClient();
  const [deptDialog, setDeptDialog] = useState(false);
  const [subDeptDialog, setSubDeptDialog] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [editingSub, setEditingSub] = useState<SubDepartment | null>(null);
  const [deleteDept, setDeleteDept] = useState<Department | null>(null);
  const [deleteSub, setDeleteSub] = useState<SubDepartment | null>(null);
  const [parentDeptId, setParentDeptId] = useState<string>('');

  const [deptForm, setDeptForm] = useState({ name_pt: '', name_en: '', acronym: '', sort_order: 0 });
  const [subForm, setSubForm] = useState({ name_pt: '', name_en: '', sort_order: 0 });

  const queryKey = ['admin-board-departments', memberId];

  const { data: departments, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data: depts, error } = await supabase
        .from('board_departments')
        .select('*')
        .eq('member_id', memberId)
        .order('sort_order');
      if (error) throw error;

      const deptIds = depts.map(d => d.id);
      let subs: SubDepartment[] = [];
      if (deptIds.length > 0) {
        const { data, error: subErr } = await supabase
          .from('board_sub_departments')
          .select('*')
          .in('department_id', deptIds)
          .order('sort_order');
        if (subErr) throw subErr;
        subs = (data || []) as SubDepartment[];
      }

      return depts.map(d => ({ ...d, subs: subs.filter(s => s.department_id === d.id) }));
    },
  });

  // Department mutations
  const createDept = useMutation({
    mutationFn: async (data: typeof deptForm) => {
      const { error } = await supabase.from('board_departments').insert({ ...data, member_id: memberId, name_en: data.name_en || null });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); toast.success('Departamento criado'); closeDeptDialog(); },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  const updateDept = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof deptForm }) => {
      const { error } = await supabase.from('board_departments').update({ ...data, name_en: data.name_en || null }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); toast.success('Departamento actualizado'); closeDeptDialog(); },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  const removeDept = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('board_departments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); toast.success('Departamento eliminado'); setDeleteDept(null); },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  // Sub-department mutations
  const createSub = useMutation({
    mutationFn: async (data: typeof subForm & { department_id: string }) => {
      const { error } = await supabase.from('board_sub_departments').insert({ ...data, name_en: data.name_en || null });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); toast.success('Sub-departamento criado'); closeSubDialog(); },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  const updateSub = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof subForm }) => {
      const { error } = await supabase.from('board_sub_departments').update({ ...data, name_en: data.name_en || null }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); toast.success('Sub-departamento actualizado'); closeSubDialog(); },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  const removeSub = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('board_sub_departments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); toast.success('Sub-departamento eliminado'); setDeleteSub(null); },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  const closeDeptDialog = () => {
    setDeptDialog(false);
    setEditingDept(null);
    setDeptForm({ name_pt: '', name_en: '', acronym: '', sort_order: 0 });
  };

  const closeSubDialog = () => {
    setSubDeptDialog(false);
    setEditingSub(null);
    setParentDeptId('');
    setSubForm({ name_pt: '', name_en: '', sort_order: 0 });
  };

  const openEditDept = (d: Department) => {
    setEditingDept(d);
    setDeptForm({ name_pt: d.name_pt, name_en: d.name_en || '', acronym: d.acronym, sort_order: d.sort_order });
    setDeptDialog(true);
  };

  const openNewSub = (deptId: string) => {
    setParentDeptId(deptId);
    setSubForm({ name_pt: '', name_en: '', sort_order: 0 });
    setSubDeptDialog(true);
  };

  const openEditSub = (s: SubDepartment) => {
    setEditingSub(s);
    setParentDeptId(s.department_id);
    setSubForm({ name_pt: s.name_pt, name_en: s.name_en || '', sort_order: s.sort_order });
    setSubDeptDialog(true);
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground">Pelouro de {memberName}</h3>
        <Button type="button" size="sm" variant="outline" onClick={() => { closeDeptDialog(); setDeptDialog(true); }}>
          <Plus className="h-3.5 w-3.5 mr-1" />Departamento
        </Button>
      </div>

      {(!departments || departments.length === 0) ? (
        <p className="text-sm text-muted-foreground text-center py-6">Nenhum departamento associado</p>
      ) : (
        <Accordion type="multiple" className="space-y-2">
          {departments.map((dept) => (
            <AccordionItem key={dept.id} value={dept.id} className="border rounded-lg px-4">
              <AccordionTrigger className="py-3 hover:no-underline">
                <div className="flex items-center gap-2 text-left">
                  <Building className="w-4 h-4 text-primary/70" />
                  <span className="font-medium text-sm">{dept.name_pt}</span>
                  <Badge variant="outline" className="text-[10px] ml-1">{dept.acronym}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">EN: {dept.name_en || '—'}</span>
                    <span className="text-xs text-muted-foreground">• Ordem: {dept.sort_order}</span>
                    <div className="ml-auto flex gap-1">
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDept(dept)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeleteDept(dept)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                    </div>
                  </div>

                  {dept.subs && dept.subs.length > 0 && (
                    <div className="ml-4 space-y-1.5">
                      {dept.subs.map(sub => (
                        <div key={sub.id} className="flex items-center gap-2 py-1 px-2 rounded bg-secondary/40 text-xs">
                          <ChevronRight className="w-3 h-3 text-muted-foreground" />
                          <span className="flex-1">{sub.name_pt}</span>
                          <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEditSub(sub)}><Pencil className="h-3 w-3" /></Button>
                          <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => setDeleteSub(sub)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button type="button" variant="ghost" size="sm" className="text-xs h-7" onClick={() => openNewSub(dept.id)}>
                    <Plus className="h-3 w-3 mr-1" />Sub-departamento
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Department Dialog */}
      <Dialog open={deptDialog} onOpenChange={setDeptDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{editingDept ? 'Editar Departamento' : 'Novo Departamento'}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); if (!deptForm.name_pt || !deptForm.acronym) { toast.error('Nome PT e sigla são obrigatórios'); return; } editingDept ? updateDept.mutate({ id: editingDept.id, data: deptForm }) : createDept.mutate(deptForm); }}>
            <div className="grid gap-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-2"><Label>Nome PT *</Label><Input value={deptForm.name_pt} onChange={e => setDeptForm({...deptForm, name_pt: e.target.value})} required /></div>
                <div className="space-y-2"><Label>Sigla *</Label><Input value={deptForm.acronym} onChange={e => setDeptForm({...deptForm, acronym: e.target.value})} required /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-2"><Label>Nome EN</Label><Input value={deptForm.name_en} onChange={e => setDeptForm({...deptForm, name_en: e.target.value})} /></div>
                <div className="space-y-2"><Label>Ordem</Label><Input type="number" value={deptForm.sort_order} onChange={e => setDeptForm({...deptForm, sort_order: Number(e.target.value)})} /></div>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={closeDeptDialog}>Cancelar</Button>
              <Button type="submit" disabled={createDept.isPending || updateDept.isPending}>
                {(createDept.isPending || updateDept.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingDept ? 'Guardar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Sub-department Dialog */}
      <Dialog open={subDeptDialog} onOpenChange={setSubDeptDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{editingSub ? 'Editar Sub-departamento' : 'Novo Sub-departamento'}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); if (!subForm.name_pt) { toast.error('Nome PT é obrigatório'); return; } editingSub ? updateSub.mutate({ id: editingSub.id, data: subForm }) : createSub.mutate({ ...subForm, department_id: parentDeptId }); }}>
            <div className="grid gap-4">
              <div className="space-y-2"><Label>Nome PT *</Label><Input value={subForm.name_pt} onChange={e => setSubForm({...subForm, name_pt: e.target.value})} required /></div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-2"><Label>Nome EN</Label><Input value={subForm.name_en} onChange={e => setSubForm({...subForm, name_en: e.target.value})} /></div>
                <div className="space-y-2"><Label>Ordem</Label><Input type="number" value={subForm.sort_order} onChange={e => setSubForm({...subForm, sort_order: Number(e.target.value)})} /></div>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={closeSubDialog}>Cancelar</Button>
              <Button type="submit" disabled={createSub.isPending || updateSub.isPending}>
                {(createSub.isPending || updateSub.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingSub ? 'Guardar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Department Confirm */}
      <AlertDialog open={!!deleteDept} onOpenChange={() => setDeleteDept(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Eliminar Departamento</AlertDialogTitle>
            <AlertDialogDescription>Eliminar "{deleteDept?.name_pt}" e todos os seus sub-departamentos? Esta acção não pode ser revertida.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteDept && removeDept.mutate(deleteDept.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {removeDept.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Sub-department Confirm */}
      <AlertDialog open={!!deleteSub} onOpenChange={() => setDeleteSub(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Eliminar Sub-departamento</AlertDialogTitle>
            <AlertDialogDescription>Eliminar "{deleteSub?.name_pt}"?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteSub && removeSub.mutate(deleteSub.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {removeSub.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
