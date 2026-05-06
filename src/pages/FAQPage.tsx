import { useTranslation } from "react-i18next";
import { HelpCircle } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/service/api";
import { Badge } from "@/components/ui/badge";

interface FAQItem {
  id: string;
  questionPt: string;
  answerPt: string;
  questionEn: string;
  answerEn: string;
  category: string;
  order: number;
  status: string;
}

interface FAQResponse {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: FAQItem[];
}

// Função para buscar FAQs da API
const fetchFAQs = async (): Promise<FAQItem[]> => {
  try {
    const response = await api.get<{ faqs: FAQResponse }>('/faqs');
    
    // Acessa os dados dentro da estrutura correta
    const faqsData = response.data?.faqs?.data || [];
    
    // Filtra apenas FAQs ativas
    const activeFAQs = faqsData.filter((faq: FAQItem) => faq.status === 'Active');
    
    // Ordena por ordem
    return activeFAQs.sort((a: FAQItem, b: FAQItem) => a.order - b.order);
  } catch (error) {
    console.error('Erro ao buscar FAQs:', error);
    throw error;
  }
};

export default function FAQPage() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === "en";

  const { data: faqs, isLoading, error } = useQuery({
    queryKey: ['faqs-public'],
    queryFn: fetchFAQs,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const breadcrumbs = [{ labelKey: "faq.breadcrumb" }];

  // Agrupar FAQs por categoria
  const groupFAQsByCategory = (faqs: FAQItem[]) => {
    const groups: Record<string, FAQItem[]> = {};
    
    faqs?.forEach((faq) => {
      const category = faq.category || 'general';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(faq);
    });
    
    // Ordenar categorias
    return groups;
  };

  const faqGroups = faqs ? groupFAQsByCategory(faqs) : {};

  // Função para obter o texto da categoria traduzido
  const getCategoryTranslation = (category: string): string => {
    const categoryMap: Record<string, string> = {
      general: isEn ? "General" : "Geral",
      licensing: isEn ? "Licensing" : "Licenciamento",
      production: isEn ? "Production" : "Produção",
      investment: isEn ? "Investment" : "Investimento",
      technical: isEn ? "Technical" : "Técnico",
    };
    return categoryMap[category] || category;
  };

  // Função para obter pergunta no idioma correto
  const getQuestion = (faq: FAQItem): string => {
    if (isEn && faq.questionEn && faq.questionEn.trim() !== '') {
      return faq.questionEn;
    }
    return faq.questionPt;
  };

  // Função para obter resposta no idioma correto
  const getAnswer = (faq: FAQItem): string => {
    if (isEn && faq.answerEn && faq.answerEn.trim() !== '') {
      return faq.answerEn;
    }
    return faq.answerPt;
  };

  // Verificar se o FAQ tem conteúdo
  const hasValidContent = (faq: FAQItem): boolean => {
    return (faq.questionPt && faq.questionPt.trim() !== '') || 
           (faq.answerPt && faq.answerPt.trim() !== '');
  };

  // Filtrar FAQs válidas
  const validFaqs = faqs?.filter(hasValidContent) || [];

  if (error) {
    return (
      <PageLayout
        pageKey="faq"
        titleKey="faq.hero.title"
        descriptionKey="faq.hero.description"
        icon={<HelpCircle className="w-8 h-8" />}
        breadcrumbs={breadcrumbs}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <HelpCircle className="w-16 h-16 text-red-500 mx-auto mb-4 opacity-50" />
            <p className="text-red-500 mb-4">
              {isEn 
                ? "Error loading FAQs. Please try again later." 
                : "Erro ao carregar FAQs. Por favor, tente novamente mais tarde."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="text-primary hover:underline"
            >
              {isEn ? "Reload page" : "Recarregar página"}
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      pageKey="faq"
      titleKey="faq.hero.title"
      descriptionKey="faq.hero.description"
      icon={<HelpCircle className="w-8 h-8" />}
      breadcrumbs={breadcrumbs}
    >
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center">
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("faq.intro")}
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : validFaqs.length > 0 ? (
          Object.entries(faqGroups).map(([category, questions]) => {
            // Filtrar perguntas válidas por categoria
            const validQuestions = questions.filter(hasValidContent);
            
            if (validQuestions.length === 0) return null;
            
            return (
              <div key={category} className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {getCategoryTranslation(category)}
                  </h2>
                  <Badge variant="outline" className="text-sm">
                    {validQuestions.length} {isEn ? "questions" : "perguntas"}
                  </Badge>
                </div>
                
                <Accordion type="single" collapsible className="space-y-3">
                  {validQuestions.map((faq, index) => (
                    <AccordionItem
                      key={faq.id}
                      value={`${category}-${index}`}
                      className="bg-secondary/50 border border-border rounded-xl px-6 hover:bg-secondary/70 transition-all duration-200"
                    >
                      <AccordionTrigger className="text-left py-5 hover:no-underline">
                        <div className="flex items-start gap-3">
                          <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="font-medium">
                            {getQuestion(faq)}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-5 pl-8 text-muted-foreground leading-relaxed">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          {getAnswer(faq).split('\n').map((paragraph, idx) => (
                            paragraph.trim() && (
                              <p key={idx} className="mb-2 last:mb-0">
                                {paragraph}
                              </p>
                            )
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <HelpCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              {isEn 
                ? "No FAQs available at the moment." 
                : "Sem FAQs disponíveis no momento."}
            </p>
          </div>
        )}

        <div className="text-center pt-8 pb-4 border-t border-border">
          <p className="text-muted-foreground mb-4">
            {t("faq.contactCta.text")}
          </p>
          <Link
            to="/contacts"
            className="inline-flex items-center gap-2 text-primary hover:underline font-medium transition-all duration-200 hover:gap-3"
          >
            {t("faq.contactCta.link")}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}