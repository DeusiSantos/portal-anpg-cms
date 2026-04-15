import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  Save, 
  Eye, 
  Loader2, 
  ArrowLeft, 
  X, 
  Upload,
  Send,
  CheckCircle,
  XCircle,
  Archive,
  Trash2,
  Clock,
  Edit,
  FileCheck,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { cn } from '@/lib/utils';
import api from '@/service/api';

const CATEGORIES = [
  { value: 'geral', label: 'Geral' },
  { value: 'producao', label: 'Produção' },
  { value: 'exploracao', label: 'Exploração' },
  { value: 'licitacao', label: 'Licitação' },
  { value: 'institucional', label: 'Institucional' },
  { value: 'sustentabilidade', label: 'Sustentabilidade' },
];

// Definição dos estados possíveis (exatamente como no backend)
type NewsStatus = 
  | 'Draft' 
  | 'PendingReview' 
  | 'Reviewed' 
  | 'Approved' 
  | 'Published' 
  | 'Archived' 
  | 'Rejected' 
  | 'Deleted' 
  | 'RequestCorrection';

// Fluxo de transições baseado no backend
// Draft → PendingReview
// PendingReview → Reviewed | RequestCorrection | Rejected
// Reviewed → Approved | RequestCorrection
// RequestCorrection → Draft
// Approved → Published
// Published → Archived
// Rejected → (terminal)
// Archived → (terminal)
// Deleted → (terminal)

const STATUS_TRANSITIONS: Record<NewsStatus, NewsStatus[]> = {
  Draft: ['PendingReview'],
  PendingReview: ['Reviewed', 'RequestCorrection', 'Rejected'],
  Reviewed: ['Approved', 'RequestCorrection'],
  RequestCorrection: ['Draft'],
  Approved: ['Published'],
  Published: ['Archived'],
  Archived: [],
  Rejected: [],
  Deleted: []
};

const STATUS_CONFIG: Record<NewsStatus, { label: string; color: string; icon: any; description: string }> = {
  Draft: {
    label: 'Rascunho',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    icon: Edit,
    description: 'Rascunho inicial da notícia. Pode ser editado livremente.'
  },
  PendingReview: {
    label: 'Aguardando Revisão',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    icon: Clock,
    description: 'Notícia aguardando revisão. Um revisor irá analisar o conteúdo.'
  },
  Reviewed: {
    label: 'Revisado',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    icon: FileCheck,
    description: 'Notícia foi revisada. Aguardando aprovação ou correções.'
  },
  RequestCorrection: {
    label: 'Necessita Correção',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    icon: AlertCircle,
    description: 'Notícia precisa de correções. O autor deve fazer as alterações necessárias.'
  },
  Approved: {
    label: 'Aprovado',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    icon: CheckCircle,
    description: 'Notícia aprovada. Pronta para publicação.'
  },
  Published: {
    label: 'Publicado',
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    icon: Send,
    description: 'Notícia publicada no site. Visível para o público.'
  },
  Archived: {
    label: 'Arquivado',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    icon: Archive,
    description: 'Notícia arquivada. Não está visível no site principal.'
  },
  Rejected: {
    label: 'Rejeitado',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    icon: XCircle,
    description: 'Notícia rejeitada. Não será publicada.'
  },
  Deleted: {
    label: 'Eliminado',
    color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
    icon: Trash2,
    description: 'Notícia eliminada permanentemente.'
  }
};

interface Attachment {
  id: string;
  fileName: string;
  storedFileName: string;
  contentType: string;
  size: number;
}

interface NewsDocument {
  id: string;
  titlePt: string;
  slugOrURL: string | null;
  excerptPt: string;
  contentPt: string;
  titleEn: string;
  excerptEn: string;
  contentEn: string;
  publicationDate: string;
  category: string;
  contentCode: string;
  status: NewsStatus;
  attachments: Attachment[];
}

interface NewsFormData {
  id?: string;
  titlePt: string;
  slugOrURL: string;
  excerptPt: string;
  contentPt: string;
  titleEn: string;
  excerptEn: string;
  contentEn: string;
  category: string;
  publicationDate: string;
  uploadDocs?: File[];
}

export default function AdminNewsEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = !id || id === 'new';

  const [formData, setFormData] = useState<NewsFormData>({
    titlePt: '',
    slugOrURL: '',
    excerptPt: '',
    contentPt: '',
    titleEn: '',
    excerptEn: '',
    contentEn: '',
    category: 'geral',
    publicationDate: new Date().toISOString(),
    uploadDocs: [],
  });

  const [currentStatus, setCurrentStatus] = useState<NewsStatus>('Draft');
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>([]);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedNextStatus, setSelectedNextStatus] = useState<NewsStatus | null>(null);
  const [statusComment, setStatusComment] = useState('');

  // Fetch article if editing
  useEffect(() => {
    if (!isNew && id) {
      fetchArticle();
    }
  }, [id, isNew]);

  const fetchArticle = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<{ news: NewsDocument }>(`/news/${id}`);
      const article = response.data.news;
      
      setFormData({
        id: article.id,
        titlePt: article.titlePt || '',
        slugOrURL: article.slugOrURL || '',
        excerptPt: article.excerptPt || '',
        contentPt: article.contentPt || '',
        titleEn: article.titleEn || '',
        excerptEn: article.excerptEn || '',
        contentEn: article.contentEn || '',
        category: article.category || 'geral',
        publicationDate: article.publicationDate || new Date().toISOString(),
        uploadDocs: [],
      });
      
      setCurrentStatus(article.status);
      
      if (article.attachments && article.attachments.length > 0) {
        setExistingAttachments(article.attachments);
        const imageAttachment = article.attachments.find(att => 
          att.contentType?.startsWith('image/')
        );
        if (imageAttachment) {
          fetchAttachmentImage(imageAttachment.id);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar artigo:', error);
      toast.error('Erro ao carregar os dados da notícia');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAttachmentImage = async (attachmentId: string) => {
    if (!id) return;
    
    setIsImageLoading(true);
    try {
      const response = await api.get(`/news/${id}/attachments/${attachmentId}`, {
        responseType: 'blob',
      });
      
      const imageUrl = URL.createObjectURL(response.data);
      setCurrentImageUrl(imageUrl);
    } catch (error) {
      console.error('Erro ao carregar imagem:', error);
    } finally {
      setIsImageLoading(false);
    }
  };

  // Mutation para mudar o status
  const statusChangeMutation = useMutation({
    mutationFn: async ({ status, comment }: { status: NewsStatus; comment?: string }) => {
      if (!id) throw new Error('ID da notícia não encontrado');
      
      const payload: { status: NewsStatus; comment?: string } = { status };
      if (comment && comment.trim()) {
        payload.comment = comment.trim();
      }
      
      console.log('Enviando para API:', payload);
      
      const response = await api.post(`/workflow/news/${id}/status`, payload);
      return response.data;
    },
    onSuccess: (data, variables) => {
      toast.success(`Estado alterado para ${STATUS_CONFIG[variables.status].label}`);
      fetchArticle();
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
      setShowStatusModal(false);
      setSelectedNextStatus(null);
      setStatusComment('');
    },
    onError: (error: any) => {
      console.error('Erro detalhado:', error.response?.data);
      toast.error(`Erro ao alterar estado: ${error.response?.data?.message || error.message}`);
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!id) throw new Error('ID da notícia não encontrado');
      
      const formDataToSend = new FormData();
      formDataToSend.append('uploadDocs', file);
      
      const response = await api.post(`/news/${id}/attachments?documentId=${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    },
    onSuccess: () => {
      toast.success('Imagem actualizada com sucesso');
      fetchArticle();
      setSelectedImageFile(null);
    },
    onError: (error: any) => {
      toast.error(`Erro ao actualizar imagem: ${error.response?.data?.message || error.message}`);
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (attachmentId: string) => {
      if (!id) throw new Error('ID da notícia não encontrado');
      await api.delete(`/news/${id}/attachments/${attachmentId}`);
    },
    onSuccess: () => {
      toast.success('Imagem removida com sucesso');
      if (currentImageUrl) {
        URL.revokeObjectURL(currentImageUrl);
        setCurrentImageUrl('');
      }
      setExistingAttachments([]);
      fetchArticle();
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover imagem: ${error.response?.data?.message || error.message}`);
    },
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  useEffect(() => {
    return () => {
      if (currentImageUrl) {
        URL.revokeObjectURL(currentImageUrl);
      }
    };
  }, [currentImageUrl]);

  const saveMutation = useMutation({
    mutationFn: async (data: NewsFormData) => {
      if (isNew) {
        const formDataToSend = new FormData();
        
        formDataToSend.append('titlePt', data.titlePt);
        formDataToSend.append('slugOrURL', data.slugOrURL);
        formDataToSend.append('excerptPt', data.excerptPt);
        formDataToSend.append('contentPt', data.contentPt);
        formDataToSend.append('titleEn', data.titleEn);
        formDataToSend.append('excerptEn', data.excerptEn);
        formDataToSend.append('contentEn', data.contentEn);
        formDataToSend.append('category', data.category);
        formDataToSend.append('publicationDate', data.publicationDate);
        
        if (data.uploadDocs && data.uploadDocs.length > 0) {
          formDataToSend.append('uploadDocs', data.uploadDocs[0]);
        }
        
        const response = await api.post('/news', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        return response.data;
      } else {
        const updateData = {
          news: {
            id: id,
            titlePt: data.titlePt,
            slugOrURL: data.slugOrURL,
            excerptPt: data.excerptPt,
            contentPt: data.contentPt,
            titleEn: data.titleEn,
            excerptEn: data.excerptEn,
            contentEn: data.contentEn,
            publicationDate: data.publicationDate,
            category: data.category,
          }
        };
        
        const response = await api.put('/news', updateData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
      toast.success(isNew ? 'Notícia criada com sucesso' : 'Notícia actualizada com sucesso');
      
      if (isNew) {
        navigate('/admin/news');
      } else {
        fetchArticle();
      }
    },
    onError: (error: any) => {
      toast.error(`Erro ao guardar: ${error.response?.data?.message || error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titlePt) {
      toast.error('Título é obrigatório');
      return;
    }

    const dataToSubmit = {
      ...formData,
      slugOrURL: formData.slugOrURL || generateSlug(formData.titlePt),
    };

    saveMutation.mutate(dataToSubmit);
  };

  const handleStatusChange = (nextStatus: NewsStatus) => {
    setSelectedNextStatus(nextStatus);
    setStatusComment('');
    setShowStatusModal(true);
  };

  const confirmStatusChange = () => {
    if (selectedNextStatus) {
      statusChangeMutation.mutate({ 
        status: selectedNextStatus, 
        comment: statusComment 
      });
    }
  };

  const handleImageUpload = () => {
    if (selectedImageFile) {
      uploadImageMutation.mutate(selectedImageFile);
    }
  };

  const handleRemoveImage = () => {
    if (existingAttachments.length > 0) {
      const imageAttachment = existingAttachments.find(att => 
        att.contentType?.startsWith('image/')
      );
      if (imageAttachment) {
        deleteImageMutation.mutate(imageAttachment.id);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImageFile(file);
      
      if (currentImageUrl) {
        URL.revokeObjectURL(currentImageUrl);
      }
      const previewUrl = URL.createObjectURL(file);
      setCurrentImageUrl(previewUrl);
    }
  };

  const StatusBadge = ({ status }: { status: NewsStatus }) => {
    const config = STATUS_CONFIG[status];
    const Icon = config?.icon || Edit;
    return (
      <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium", config?.color)}>
        <Icon className="w-4 h-4" />
        {config?.label || status}
      </div>
    );
  };

  // Obter os próximos estados baseado no fluxo do backend
  const availableNextStates = STATUS_TRANSITIONS[currentStatus] || [];

  // Verificar se o usuário pode editar baseado no status
  const canEdit = !['Rejected', 'Deleted', 'Archived'].includes(currentStatus);
  
  // Verificar se precisa de comentário obrigatório
  const requiresComment = selectedNextStatus === 'RequestCorrection' || selectedNextStatus === 'Rejected';

  // Obter a mensagem de descrição para o próximo estado
  const getTransitionDescription = (from: NewsStatus, to: NewsStatus): string => {
    const descriptions: Record<string, string> = {
      'Draft_PendingReview': 'Enviar notícia para revisão',
      'PendingReview_Reviewed': 'Marcar como revisado',
      'PendingReview_RequestCorrection': 'Solicitar correções ao autor',
      'PendingReview_Rejected': 'Rejeitar notícia',
      'Reviewed_Approved': 'Aprovar notícia para publicação',
      'Reviewed_RequestCorrection': 'Solicitar correções adicionais',
      'RequestCorrection_Draft': 'Voltar para rascunho para correções',
      'Approved_Published': 'Publicar notícia no site',
      'Published_Archived': 'Arquivar notícia'
    };
    return descriptions[`${from}_${to}`] || `Mover para ${STATUS_CONFIG[to].label}`;
  };

  if (isLoading) {
    return (
      <AdminLayout title="Editor de Notícias">
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Editor de Notícias">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/news')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para notícias
          </Button>
          
          {!isNew && (
            <StatusBadge status={currentStatus} />
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Conteúdo (Português)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="titlePt">Título (PT) *</Label>
                  <Input
                    id="titlePt"
                    value={formData.titlePt}
                    onChange={(e) => {
                      const title = e.target.value;
                      setFormData({
                        ...formData,
                        titlePt: title,
                        slugOrURL: formData.slugOrURL || generateSlug(title),
                      });
                    }}
                    placeholder="Título da notícia"
                    required
                    disabled={!canEdit}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slugOrURL">Slug (URL)</Label>
                  <Input
                    id="slugOrURL"
                    value={formData.slugOrURL}
                    onChange={(e) => setFormData({ ...formData, slugOrURL: e.target.value })}
                    placeholder="titulo-da-noticia"
                    disabled={!canEdit}
                  />
                  <p className="text-xs text-muted-foreground">
                    Deixe em branco para gerar automaticamente
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerptPt">Excerto (PT)</Label>
                  <Textarea
                    id="excerptPt"
                    value={formData.excerptPt}
                    onChange={(e) => setFormData({ ...formData, excerptPt: e.target.value })}
                    placeholder="Breve descrição da notícia..."
                    rows={3}
                    disabled={!canEdit}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Conteúdo (PT)</Label>
                  <RichTextEditor
                    content={formData.contentPt}
                    onChange={(html) => setFormData({ ...formData, contentPt: html })}
                    placeholder="Escreva o conteúdo da notícia..."
                    
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conteúdo em Inglês (EN)</CardTitle>
                <CardDescription>Traduções opcionais — se vazias, será exibido o conteúdo em Português</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="titleEn">Title (EN)</Label>
                  <Input
                    id="titleEn"
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    placeholder="Article title in English"
                    disabled={!canEdit}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerptEn">Excerpt (EN)</Label>
                  <Textarea
                    id="excerptEn"
                    value={formData.excerptEn}
                    onChange={(e) => setFormData({ ...formData, excerptEn: e.target.value })}
                    placeholder="Brief description in English..."
                    rows={3}
                
                  />
                </div>

                <div className="space-y-2">
                  <Label>Content (EN)</Label>
                  <RichTextEditor
                    content={formData.contentEn}
                    onChange={(html) => setFormData({ ...formData, contentEn: html })}
                    placeholder="Write the article content in English..."
                
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Publicação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    disabled={!canEdit}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Data de Publicação</Label>
                  <Input
                    type="datetime-local"
                    value={formData.publicationDate.slice(0, 16)}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      publicationDate: new Date(e.target.value).toISOString() 
                    })}
                    disabled={!canEdit}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Workflow Status Card */}
            {!isNew && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    Workflow da Notícia
                  </CardTitle>
                  <CardDescription>
                    {STATUS_CONFIG[currentStatus]?.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-2">Estado Actual</div>
                    <StatusBadge status={currentStatus} />
                  </div>

                  {availableNextStates.length > 0 && (
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-foreground">Próximos Estados</div>
                      <div className="grid gap-2">
                        {availableNextStates.map((nextState) => {
                          const config = STATUS_CONFIG[nextState];
                          const Icon = config.icon;
                          return (
                            <Button
                              key={nextState}
                              type="button"
                              variant="outline"
                              onClick={() => handleStatusChange(nextState)}
                              className="justify-start gap-3 h-auto py-3 px-4"
                              disabled={statusChangeMutation.isPending}
                            >
                              <Icon className="w-5 h-5" />
                              <div className="text-left">
                                <div className="font-medium">{config.label}</div>
                                <div className="text-xs text-muted-foreground">
                                  {getTransitionDescription(currentStatus, nextState)}
                                </div>
                              </div>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Mensagens contextuais */}
                  {currentStatus === 'RequestCorrection' && (
                    <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                            Esta notícia necessita de correções
                          </p>
                          <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
                            Faça as alterações necessárias e submeta novamente para revisão.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStatus === 'Rejected' && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-red-800 dark:text-red-300">
                            Notícia Rejeitada
                          </p>
                          <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                            Esta notícia foi rejeitada e não pode ser modificada.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStatus === 'Deleted' && (
                    <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-950/20 rounded-lg border border-rose-200 dark:border-rose-800">
                      <div className="flex items-start gap-2">
                        <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-rose-800 dark:text-rose-300">
                            Notícia Eliminada
                          </p>
                          <p className="text-xs text-rose-700 dark:text-rose-400 mt-1">
                            Esta notícia foi eliminada permanentemente.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStatus === 'Published' && (
                    <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-start gap-2">
                        <Send className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                            Notícia Publicada
                          </p>
                          <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                            Esta notícia está visível no site. Pode ser arquivada se necessário.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStatus === 'Archived' && (
                    <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="flex items-start gap-2">
                        <Archive className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-purple-800 dark:text-purple-300">
                            Notícia Arquivada
                          </p>
                          <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">
                            Esta notícia está arquivada e não está visível no site principal.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Imagem de Destaque</CardTitle>
                <CardDescription>
                  {isNew 
                    ? 'Envie uma imagem para a notícia (opcional)' 
                    : 'Gerir imagem de destaque da notícia'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isNew ? (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFormData({ ...formData, uploadDocs: [e.target.files[0]] });
                      }
                    }}
                    className="w-full p-2 border rounded-md"
                  />
                ) : (
                  <>
                    <div className="space-y-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="w-full p-2 border rounded-md"
                        disabled={!canEdit}
                      />
                      
                      {selectedImageFile && (
                        <Button
                          type="button"
                          onClick={handleImageUpload}
                          disabled={uploadImageMutation.isPending}
                          className="w-full gap-2"
                        >
                          {uploadImageMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                          {uploadImageMutation.isPending ? 'A enviar...' : 'Enviar imagem'}
                        </Button>
                      )}
                    </div>
                    
                    {(currentImageUrl || selectedImageFile) && (
                      <div className="mt-4 relative">
                        <p className="text-sm text-muted-foreground mb-2">
                          {selectedImageFile ? 'Nova imagem (aguardando envio):' : 'Imagem atual:'}
                        </p>
                        <div className="relative inline-block w-full">
                          <img 
                            src={currentImageUrl} 
                            alt="Preview" 
                            className="w-full h-48 object-cover rounded-md"
                          />
                          {!selectedImageFile && existingAttachments.length > 0 && canEdit && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 h-6 w-6"
                              onClick={handleRemoveImage}
                              disabled={deleteImageMutation.isPending}
                            >
                              {deleteImageMutation.isPending ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <X className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    {isImageLoading && (
                      <div className="flex justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                type="submit"
                className="flex-1 gap-2"
                disabled={saveMutation.isPending || !canEdit}
              >
                {saveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saveMutation.isPending ? 'A guardar...' : 'Guardar'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => window.open(`/news/${formData.slugOrURL || generateSlug(formData.titlePt)}`, '_blank')}
                disabled={!formData.titlePt}
              >
                <Eye className="h-4 w-4" />
                Pré-visualizar
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Modal de Confirmação de Mudança de Estado */}
      {showStatusModal && selectedNextStatus && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={cn("p-2 rounded-full", STATUS_CONFIG[selectedNextStatus].color)}>
                  {(() => {
                    const Icon = STATUS_CONFIG[selectedNextStatus].icon;
                    return <Icon className="w-5 h-5" />;
                  })()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {STATUS_CONFIG[selectedNextStatus].label}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {getTransitionDescription(currentStatus, selectedNextStatus)}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="comment">
                    Comentário {requiresComment && <span className="text-red-500">*</span>}
                  </Label>
                  <Textarea
                    id="comment"
                    value={statusComment}
                    onChange={(e) => setStatusComment(e.target.value)}
                    placeholder="Adicione um comentário sobre esta alteração..."
                    rows={3}
                    className="mt-1"
                    required={requiresComment}
                  />
                  {requiresComment && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Este comentário é obrigatório para esta transição
                    </p>
                  )}
                </div>
                
                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowStatusModal(false);
                      setSelectedNextStatus(null);
                      setStatusComment('');
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={confirmStatusChange}
                    disabled={statusChangeMutation.isPending || (requiresComment && !statusComment.trim())}
                    className="gap-2"
                  >
                    {statusChangeMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    Confirmar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}