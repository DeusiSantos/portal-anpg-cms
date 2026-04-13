import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Pencil, Trash2, Bot, Search, BookOpen, Upload, FileText, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  language: string;
  is_active: boolean;
  document_url: string | null;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  { value: "general", label: "Geral" },
  { value: "institucional", label: "Institucional" },
  { value: "institutional", label: "Institutional (EN)" },
  { value: "história", label: "História" },
  { value: "history", label: "History (EN)" },
  { value: "regulação", label: "Regulação" },
  { value: "regulation", label: "Regulation (EN)" },
  { value: "licenciamento", label: "Licenciamento" },
  { value: "licensing", label: "Licensing (EN)" },
  { value: "fiscalização", label: "Fiscalização" },
  { value: "oversight", label: "Oversight (EN)" },
  { value: "licitações", label: "Licitações" },
  { value: "tenders", label: "Tenders (EN)" },
  { value: "exploração", label: "Exploração" },
  { value: "exploration", label: "Exploration (EN)" },
  { value: "produção", label: "Produção" },
  { value: "production", label: "Production (EN)" },
  { value: "gás", label: "Gás" },
  { value: "gas", label: "Gas (EN)" },
  { value: "dados", label: "Dados" },
  { value: "data", label: "Data (EN)" },
  { value: "investidor", label: "Investidor" },
  { value: "investor", label: "Investor (EN)" },
  { value: "sustentabilidade", label: "Sustentabilidade" },
  { value: "sustainability", label: "Sustainability (EN)" },
  { value: "biocombustíveis", label: "Biocombustíveis" },
  { value: "biofuels", label: "Biofuels (EN)" },
  { value: "compliance", label: "Compliance" },
  { value: "contactos", label: "Contactos" },
  { value: "contacts", label: "Contacts (EN)" },
  { value: "faq", label: "FAQ" },
  { value: "oportunidades", label: "Oportunidades" },
  { value: "opportunities", label: "Opportunities (EN)" },
  { value: "conteúdo local", label: "Conteúdo Local" },
  { value: "investment", label: "Investment (EN)" },
];

export default function AdminKnowledgeBasePage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [language, setLanguage] = useState("pt");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDocumentUpload = async (file: File) => {
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Ficheiro demasiado grande (máx. 20MB)");
      return;
    }
    setUploading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        toast.error("Sessão expirada. Faça login novamente.");
        setUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/extract-document-text`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}` },
          body: formData }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Erro ao processar documento");
      }

      const result = await response.json();
      setDocumentUrl(result.document_url);
      
      // Auto-fill title if empty
      if (!title.trim()) {
        setTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
      }
      
      // Append or set extracted text
      if (result.extracted_text) {
        const prefix = content.trim() ? content + "\n\n---\n\n" : "";
        setContent(prefix + result.extracted_text);
        toast.success("Documento carregado e texto extraído com sucesso");
      } else {
        toast.success("Documento carregado (sem texto extraído)");
      }
    } catch (e) {
      console.error("Upload error:", e);
      toast.error(e instanceof Error ? e.message : "Erro ao carregar documento");
    }
    setUploading(false);
  };

  const fetchEntries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("knowledge_base")
      .select("*")
      .order("category")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar base de conhecimento");
      console.error(error);
    } else {
      setEntries((data as KnowledgeEntry[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setCategory("general");
    setLanguage("pt");
    setIsActive(true);
    setEditingEntry(null);
    setDocumentUrl(null);
  };

  const openEdit = (entry: KnowledgeEntry) => {
    setEditingEntry(entry);
    setTitle(entry.title);
    setContent(entry.content);
    setCategory(entry.category);
    setLanguage(entry.language);
    setIsActive(entry.is_active);
    setDocumentUrl(entry.document_url);
    setDialogOpen(true);
  };

  const openNew = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Título e conteúdo são obrigatórios");
      return;
    }
    setSaving(true);

    if (editingEntry) {
      const { error } = await supabase
        .from("knowledge_base")
        .update({ title, content, category, language, is_active: isActive, document_url: documentUrl })
        .eq("id", editingEntry.id);

      if (error) {
        toast.error("Erro ao atualizar");
        console.error(error);
      } else {
        toast.success("Entrada atualizada com sucesso");
      }
    } else {
      const { error } = await supabase
        .from("knowledge_base")
        .insert({
          title,
          content,
          category,
          language,
          is_active: isActive,
          created_by: user?.id,
          document_url: documentUrl });

      if (error) {
        toast.error("Erro ao criar entrada");
        console.error(error);
      } else {
        toast.success("Entrada criada com sucesso");
      }
    }

    setSaving(false);
    setDialogOpen(false);
    resetForm();
    fetchEntries();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem a certeza que deseja eliminar esta entrada?")) return;

    const { error } = await supabase
      .from("knowledge_base")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Erro ao eliminar");
      console.error(error);
    } else {
      toast.success("Entrada eliminada");
      fetchEntries();
    }
  };

  const filtered = entries.filter((e) => {
    const matchSearch =
      !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.content.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === "all" || e.category === filterCategory;
    return matchSearch && matchCategory;
  });

  return (
    <AdminLayout title="Base de Conhecimento" subtitle="Gerir conteúdo do SOBA">
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Bot className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Base de Conhecimento – SOBA</h1>
            <p className="text-sm text-muted-foreground">
              Gerir os conteúdos que alimentam o assistente virtual SOBA
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew}>
                <Plus className="h-4 w-4 mr-1" /> Nova Entrada
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingEntry ? "Editar Entrada" : "Nova Entrada"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                {/* Document Upload */}
                <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt,.doc,.docx,.csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleDocumentUpload(file);
                      e.target.value = "";
                    }}
                  />
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Documento (opcional)</p>
                      <p className="text-xs text-muted-foreground">
                        Faça upload de um PDF ou ficheiro de texto. O conteúdo será extraído automaticamente.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> A processar...</>
                      ) : (
                        <><Upload className="h-4 w-4 mr-1" /> Upload</>
                      )}
                    </Button>
                  </div>
                  {documentUrl && (
                    <div className="mt-3 flex items-center gap-2 p-2 bg-muted rounded text-sm">
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                      <span className="truncate flex-1 text-foreground">Documento anexado</span>
                      <a
                        href={documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline shrink-0"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setDocumentUrl(null)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Título *</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Processo de Licenciamento" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Conteúdo *</label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Descreva o conteúdo que o SOBA deve saber sobre este tema..."
                    rows={10}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Categoria</label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Idioma</label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt">Português</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="both">Ambos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-input"
                  />
                  <label htmlFor="is_active" className="text-sm text-foreground">Ativo (visível para o chatbot)</label>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleSave} disabled={saving || uploading}>
                    {saving ? "A guardar..." : editingEntry ? "Atualizar" : "Criar"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
          <Card className="hover:shadow-none hover:translate-y-0">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{entries.length}</p>
              <p className="text-xs text-muted-foreground">Total de Entradas</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-none hover:translate-y-0">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{entries.filter((e) => e.is_active).length}</p>
              <p className="text-xs text-muted-foreground">Ativas</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-none hover:translate-y-0">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {new Set(entries.map((e) => e.category)).size}
              </p>
              <p className="text-xs text-muted-foreground">Categorias</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-none hover:translate-y-0">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {entries.filter((e) => e.document_url).length}
              </p>
              <p className="text-xs text-muted-foreground">Com Documento</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-none hover:translate-y-0">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {entries.filter((e) => e.language === "both").length}
              </p>
              <p className="text-xs text-muted-foreground">Bilingue</p>
            </CardContent>
          </Card>
        </div>

        {/* Entries list */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">A carregar...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhuma entrada encontrada</p>
            <Button onClick={openNew} variant="outline" className="mt-3">
              <Plus className="h-4 w-4 mr-1" /> Adicionar primeira entrada
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((entry) => (
              <Card key={entry.id} className="hover:shadow-none hover:translate-y-0">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground truncate">{entry.title}</h3>
                        <Badge variant={entry.is_active ? "default" : "secondary"} className="text-[10px]">
                          {entry.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{entry.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-[10px]">
                          {CATEGORIES.find((c) => c.value === entry.category)?.label || entry.category}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {entry.language === "both" ? "PT/EN" : entry.language.toUpperCase()}
                        </Badge>
                        {entry.document_url && (
                          <a href={entry.document_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1">
                            <Badge variant="outline" className="text-[10px] text-primary">
                              <FileText className="h-3 w-3 mr-0.5" /> Doc
                            </Badge>
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(entry)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </AdminLayout>
  );
}
