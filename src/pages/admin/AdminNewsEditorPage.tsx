import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Save, 
  Eye, 
  Loader2, 
  ArrowLeft, 
  X, 
  Upload,
  Send,
  XCircle,
  Archive,
  Trash2,
  Clock,
  Edit,
  FileCheck,
  AlertCircle,
  History,
  ChevronRight,
  Calendar,
  User,
  Globe,
  FileText,
  ThumbsUp,
  RotateCcw,
  MessageSquare,
  AlertTriangle,
  Mail
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

// Status que exigem comentário obrigatório
const REQUIRED_COMMENT_STATUSES: NewsStatus[] = ['Rejected', 'RequestCorrection', 'Approved', 'Archived'];

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
    icon: ThumbsUp,
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

interface HistoryItem {
  id: string;
  entityId: string;
  entityName: string;
  fromStatus: string;
  toStatus: string;
  comment: string | null;
  changedBy: string | null;
  userName: string | null;
  ipAddress: string;
  createdAt: string;
}

interface HistoryResponse {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: HistoryItem[];
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

// Componente de Timeline de Histórico com scroll e paginação
function HistoryTimeline({ 
  history, 
  isLoading, 
  onLoadMore, 
  hasMore, 
  isFetchingMore,
  totalCount 
}: { 
  history: HistoryItem[]; 
  isLoading: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
  isFetchingMore: boolean;
  totalCount: number;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const bottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 100;
    
    if (bottom && hasMore && !isFetchingMore && !isLoading) {
      onLoadMore();
    }
  };

  if (isLoading && history.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-secondary/50 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Nenhum histórico de tramitação encontrado</p>
      </div>
    );
  }

  // Ordenar do mais recente para o mais antigo
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="flex flex-col h-full">
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="relative pl-8 space-y-4 flex-1 overflow-y-auto pr-2"
        style={{ maxHeight: 'calc(85vh - 180px)' }}
      >
        <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />
        
        {sortedHistory.map((item) => {
          const fromConfig = STATUS_CONFIG[item.fromStatus as NewsStatus];
          const toConfig = STATUS_CONFIG[item.toStatus as NewsStatus];
          const FromIcon = fromConfig?.icon || FileText;
          const ToIcon = toConfig?.icon || FileText;
          
          return (
            <div key={item.id} className="relative group">
              <div className="absolute -left-8 top-2 w-3 h-3 rounded-full bg-primary border-2 border-background" />
              
              <div className="bg-secondary/30 rounded-lg p-4 hover:bg-secondary/50 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary text-xs">
                      <FromIcon className="w-3 h-3" />
                      <span>{fromConfig?.label || item.fromStatus}</span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-xs">
                      <ToIcon className="w-3 h-3" />
                      <span>{toConfig?.label || item.toStatus}</span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.createdAt).toLocaleString('pt-PT')}
                  </span>
                </div>
                
                {item.comment && (
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-muted-foreground mt-0.5" />
                      <p className="text-sm text-muted-foreground">{item.comment}</p>
                    </div>
                  </div>
                )}
                
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground/60">
                  {item.ipAddress && (
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {item.ipAddress}
                    </span>
                  )}
                  {item.userName && (
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {item.userName}
                    </span>
                  )}
                  {item.changedBy && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {item.changedBy}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        {(isFetchingMore || (isLoading && history.length > 0)) && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        
        {!hasMore && history.length > 0 && (
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground">
              — Fim do histórico ({totalCount} registros) —
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente de Status Badge
function StatusBadge({ status, size = 'default' }: { status: NewsStatus; size?: 'sm' | 'default' }) {
  const config = STATUS_CONFIG[status];
  const Icon = config?.icon || Edit;
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 font-medium",
      size === 'sm' ? 'text-xs px-2 py-0.5 rounded-full' : 'text-sm px-3 py-1.5 rounded-full',
      config?.color
    )}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {config?.label || status}
    </div>
  );
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
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [activeTab, setActiveTab] = useState('pt');

  // Estados para paginação do histórico
  const [historyPage, setHistoryPage] = useState(0);
  const [allHistoryItems, setAllHistoryItems] = useState<HistoryItem[]>([]);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [isFetchingMoreHistory, setIsFetchingMoreHistory] = useState(false);
  const [totalHistoryCount, setTotalHistoryCount] = useState(0);

  // Query para buscar histórico com paginação
  const { data: historyData, isLoading: historyLoading, refetch: refetchHistory } = useQuery({
    queryKey: ['news-history', id, historyPage],
    queryFn: async () => {
      if (!id || isNew) return null;
      const response = await api.get(`/workflow/history`, {
        params: { 
          entityId: id, 
          PageIndex: historyPage, 
          PageSize: 10 
        }
      });
      // A API retorna { histories: { pageIndex, pageSize, count, data } }
      return response.data.histories as HistoryResponse;
    },
    enabled: !isNew && !!id && showHistoryModal,
  });

  // Efeito para acumular itens do histórico quando nova página chega
  useEffect(() => {
    if (historyData?.data) {
      if (historyPage === 0) {
        setAllHistoryItems(historyData.data);
      } else {
        setAllHistoryItems(prev => [...prev, ...historyData.data]);
      }
      setTotalHistoryCount(historyData.count);
      // Verificar se há mais páginas
      const totalPages = Math.ceil(historyData.count / historyData.pageSize);
      setHasMoreHistory(historyPage < totalPages - 1);
    }
  }, [historyData, historyPage]);

  // Resetar paginação quando o modal abrir
  useEffect(() => {
    if (showHistoryModal && id && !isNew) {
      setHistoryPage(0);
      setAllHistoryItems([]);
      setHasMoreHistory(true);
      setIsFetchingMoreHistory(false);
    }
  }, [showHistoryModal, id, isNew]);

  // Função para carregar mais itens
  const loadMoreHistory = () => {
    if (!hasMoreHistory || isFetchingMoreHistory || historyLoading) return;
    
    setIsFetchingMoreHistory(true);
    setHistoryPage(prev => prev + 1);
    // Resetar o estado de fetching após um pequeno delay
    setTimeout(() => {
      setIsFetchingMoreHistory(false);
    }, 500);
  };

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

  const statusChangeMutation = useMutation({
    mutationFn: async ({ status, comment }: { status: NewsStatus; comment?: string }) => {
      if (!id) throw new Error('ID da notícia não encontrado');
      
      const payload: { status: NewsStatus; comment?: string } = { status };
      if (comment && comment.trim()) {
        payload.comment = comment.trim();
      }
      
      const response = await api.post(`/workflow/news/${id}/status`, payload);
      return response.data;
    },
    onSuccess: (data, variables) => {
      toast.success(`Estado alterado para ${STATUS_CONFIG[variables.status].label}`);
      fetchArticle();
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
      queryClient.invalidateQueries({ queryKey: ['news-history', id] });
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
        headers: { 'Content-Type': 'multipart/form-data' },
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
          headers: { 'Content-Type': 'multipart/form-data' },
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
          headers: { 'Content-Type': 'application/json' },
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

  const availableNextStates = STATUS_TRANSITIONS[currentStatus] || [];
  const canEdit = !['Rejected', 'Deleted', 'Archived'].includes(currentStatus);
  const requiresComment = selectedNextStatus ? REQUIRED_COMMENT_STATUSES.includes(selectedNextStatus) : false;

  const getTransitionDescription = (from: NewsStatus, to: NewsStatus): string => {
    const descriptions: Record<string, string> = {
      'Draft_PendingReview': 'Submeter para revisão',
      'PendingReview_Reviewed': 'Marcar como revisado',
      'PendingReview_RequestCorrection': 'Solicitar correções ao autor',
      'PendingReview_Rejected': 'Rejeitar notícia',
      'Reviewed_Approved': 'Aprovar para publicação',
      'Reviewed_RequestCorrection': 'Solicitar correções adicionais',
      'RequestCorrection_Draft': 'Voltar para rascunho',
      'Approved_Published': 'Publicar no site',
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
        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/news')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          
          <div className="flex items-center gap-3">
            {!isNew && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHistoryModal(true)}
                  className="gap-2"
                >
                  <History className="h-4 w-4" />
                  Histórico
                </Button>
                <StatusBadge status={currentStatus} />
              </>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
          {/* Coluna Principal - Conteúdo */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pt" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Português
                </TabsTrigger>
                <TabsTrigger value="en" className="gap-2">
                  <Globe className="h-4 w-4" />
                  English
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="pt" className="mt-4 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Conteúdo em Português</CardTitle>
                    <CardDescription>Preencha os detalhes da notícia em português</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="titlePt">Título *</Label>
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
                        placeholder="Digite o título da notícia"
                        disabled={!canEdit}
                        className="text-lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="slugOrURL">Slug (URL amigável)</Label>
                      <Input
                        id="slugOrURL"
                        value={formData.slugOrURL}
                        onChange={(e) => setFormData({ ...formData, slugOrURL: e.target.value })}
                        placeholder="exemplo-de-url"
                        disabled={!canEdit}
                      />
                      <p className="text-xs text-muted-foreground">
                        Deixe em branco para gerar automaticamente a partir do título
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="excerptPt">Excerto / Resumo</Label>
                      <Textarea
                        id="excerptPt"
                        value={formData.excerptPt}
                        onChange={(e) => setFormData({ ...formData, excerptPt: e.target.value })}
                        placeholder="Breve resumo da notícia que aparecerá nas listagens..."
                        rows={3}
                        disabled={!canEdit}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Conteúdo Completo</Label>
                      <RichTextEditor
                        content={formData.contentPt}
                        onChange={(html) => setFormData({ ...formData, contentPt: html })}
                        placeholder="Escreva o conteúdo da notícia aqui..."
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="en" className="mt-4 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Content in English</CardTitle>
                    <CardDescription>
                      Optional translations — if empty, Portuguese content will be displayed
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="titleEn">Title</Label>
                      <Input
                        id="titleEn"
                        value={formData.titleEn}
                        onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                        placeholder="Enter the article title in English"
                        disabled={!canEdit}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="excerptEn">Excerpt</Label>
                      <Textarea
                        id="excerptEn"
                        value={formData.excerptEn}
                        onChange={(e) => setFormData({ ...formData, excerptEn: e.target.value })}
                        placeholder="Brief summary of the article..."
                        rows={3}
                        disabled={!canEdit}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Full Content</Label>
                      <RichTextEditor
                        content={formData.contentEn}
                        onChange={(html) => setFormData({ ...formData, contentEn: html })}
                        placeholder="Write the article content in English here..."
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Coluna Lateral - Configurações */}
          <div className="space-y-6">
            {/* Card de Publicação */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Configurações</CardTitle>
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

            {/* Card de Workflow - Apenas para edição */}
            {!isNew && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Fluxo de Aprovação
                  </CardTitle>
                  <CardDescription>
                    {STATUS_CONFIG[currentStatus]?.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Status atual em destaque */}
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-2">Estado Actual</div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={currentStatus} size="default" />
                    </div>
                  </div>

                  {/* Próximos estados disponíveis */}
                  {availableNextStates.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <div className="text-sm font-medium text-foreground mb-3">
                          Ações disponíveis
                        </div>
                        <div className="grid gap-2">
                          {availableNextStates.map((nextState) => {
                            const config = STATUS_CONFIG[nextState];
                            const Icon = config.icon;
                            const isDanger = nextState === 'Rejected';
                            const isWarning = nextState === 'RequestCorrection';
                            
                            return (
                              <Button
                                key={nextState}
                                type="button"
                                variant="outline"
                                onClick={() => handleStatusChange(nextState)}
                                className={cn(
                                  "justify-start gap-3 h-auto py-3 px-4",
                                  isDanger && "hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/20",
                                  isWarning && "hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20"
                                )}
                                disabled={statusChangeMutation.isPending}
                              >
                                <Icon className={cn(
                                  "w-5 h-5",
                                  isDanger && "text-red-500",
                                  isWarning && "text-orange-500"
                                )} />
                                <div className="text-left flex-1">
                                  <div className={cn(
                                    "font-medium",
                                    isDanger && "text-red-600 dark:text-red-400",
                                    isWarning && "text-orange-600 dark:text-orange-400"
                                  )}>
                                    {config.label}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {getTransitionDescription(currentStatus, nextState)}
                                  </div>
                                </div>
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Mensagens contextuais */}
                  {currentStatus === 'RequestCorrection' && (
                    <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                            Correções necessárias
                          </p>
                          <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
                            Faça as alterações solicitadas e submeta novamente para revisão.
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

                  {currentStatus === 'Published' && (
                    <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-start gap-2">
                        <Send className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                            Notícia Publicada
                          </p>
                          <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                            A notícia está visível no site. Pode ser arquivada se necessário.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Card de Imagem */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Imagem de Destaque</CardTitle>
                <CardDescription>
                  {isNew 
                    ? 'Envie uma imagem para a notícia (opcional)' 
                    : 'Gerencie a imagem principal da notícia'}
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
                    <div className="space-y-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="w-full p-2 border rounded-md text-sm"
                        disabled={!canEdit}
                      />
                      
                      {selectedImageFile && (
                        <Button
                          type="button"
                          onClick={handleImageUpload}
                          disabled={uploadImageMutation.isPending}
                          className="w-full gap-2"
                          size="sm"
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
                      <div className="relative">
                        <p className="text-xs text-muted-foreground mb-2">
                          {selectedImageFile ? 'Pré-visualização (aguardando envio):' : 'Imagem actual:'}
                        </p>
                        <div className="relative rounded-md overflow-hidden border">
                          <img 
                            src={currentImageUrl} 
                            alt="Preview" 
                            className="w-full h-40 object-cover"
                          />
                          {!selectedImageFile && existingAttachments.length > 0 && canEdit && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-7 w-7"
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
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Botões de Ação */}
            <div className="flex gap-3">
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
                Ver
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Modal de Mudança de Estado */}
      {showStatusModal && selectedNextStatus && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-md mx-4">
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
                  <Label htmlFor="comment" className="flex items-center gap-1">
                    Comentário
                    {requiresComment && (
                      <span className="text-red-500 text-xs">* obrigatório</span>
                    )}
                  </Label>
                  <Textarea
                    id="comment"
                    value={statusComment}
                    onChange={(e) => setStatusComment(e.target.value)}
                    placeholder={requiresComment 
                      ? "Por favor, justifique esta alteração de estado..." 
                      : "Comentário sobre esta alteração (opcional)"
                    }
                    rows={3}
                    className={cn(
                      "mt-1",
                      requiresComment && !statusComment.trim() && "border-red-300 focus-visible:ring-red-500"
                    )}
                  />
                  {requiresComment && !statusComment.trim() && (
                    <p className="text-xs text-red-500 mt-1">
                      Este comentário é obrigatório para esta transição
                    </p>
                  )}
                </div>
                
                <div className="flex gap-3 justify-end pt-2">
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

      {/* Modal de Histórico com Scroll e Paginação */}
      {showHistoryModal && !isNew && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-2xl mx-4 h-[85vh] flex flex-col">
            <div className="p-6 border-b flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <History className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Histórico de Tramitação</h3>
                    <p className="text-sm text-muted-foreground">
                      Acompanhe todas as alterações de estado desta notícia
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowHistoryModal(false);
                    // Resetar estado ao fechar
                    setHistoryPage(0);
                    setAllHistoryItems([]);
                    setHasMoreHistory(true);
                    setIsFetchingMoreHistory(false);
                  }}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <HistoryTimeline 
                history={allHistoryItems} 
                isLoading={historyLoading && historyPage === 0}
                onLoadMore={loadMoreHistory}
                hasMore={hasMoreHistory}
                isFetchingMore={isFetchingMoreHistory}
                totalCount={totalHistoryCount}
              />
            </div>
            
            {totalHistoryCount > 0 && (
              <div className="p-4 border-t bg-secondary/20 flex-shrink-0">
                <div className="text-xs text-muted-foreground text-center">
                  Total de {totalHistoryCount} registros | 
                  Mostrando {allHistoryItems.length} de {totalHistoryCount}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}