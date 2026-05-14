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
import { Badge } from "@/components/ui/badge";
import api from "@/service/api";

// Tipos da nova API
interface FAQContent {
  lang: number;
  question: string;
  answer: string;
}

interface FAQCategoryContent {
  lang: number;
  name: string;
}

interface FAQCategory {
  id: string;
  displayOrder: number;
  contents: FAQCategoryContent[];
  isActive: boolean;
}

interface FAQItem {
  id: string;
  faqCategoryId: string;
  faqCategory?: FAQCategory;
  displayOrder: number;
  contents: FAQContent[];
  isActive: boolean;
  createdAt: string;
}

interface FAQResponse {
  items: FAQItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalActive: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface CategoryResponse {
  items: FAQCategory[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalActive: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Função para buscar categorias de FAQ
const fetchCategories = async (): Promise<FAQCategory[]> => {
  try {
    const response = await api.get<CategoryResponse>('/faq-categories', {
      params: { Page: 1, PageSize: 100 }
    });
    return response.data.items.filter(cat => cat.isActive);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return [];
  }
};

// Função para buscar FAQs da API
const fetchFAQs = async (): Promise<FAQItem[]> => {
  try {
    const response = await api.get<FAQResponse>('/faqs', {
      params: { Page: 1, PageSize: 100 }
    });
    
    // Filtra apenas FAQs ativas
    const activeFAQs = response.data.items.filter(faq => faq.isActive);
    
    // Ordena por ordem de exibição
    return activeFAQs.sort((a, b) => a.displayOrder - b.displayOrder);
  } catch (error) {
    console.error('Erro ao buscar FAQs:', error);
    throw error;
  }
};

// Função para obter o conteúdo em português
const getPortugueseContent = <T extends { contents: Array<{ lang: number } & any> }>(
  item: T
): T['contents'][0] | undefined => {
  return item.contents?.find(c => c.lang === 1);
};

// Função para obter o conteúdo em inglês
const getEnglishContent = <T extends { contents: Array<{ lang: number } & any> }>(
  item: T
): T['contents'][0] | undefined => {
  return item.contents?.find(c => c.lang === 2);
};

export default function FAQPage() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === "en";

  // Buscar categorias
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['faq-categories-public'],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000,
  });

  // Buscar FAQs
  const { data: faqs = [], isLoading: faqsLoading, error } = useQuery({
    queryKey: ['faqs-public'],
    queryFn: fetchFAQs,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = categoriesLoading || faqsLoading;

  // Agrupar FAQs por categoria
  const groupFAQsByCategory = (faqs: FAQItem[], categories: FAQCategory[]) => {
    const groups: { category: FAQCategory; faqs: FAQItem[] }[] = [];
    
    // Para cada categoria, buscar FAQs associadas
    categories.forEach(category => {
      const categoryFaqs = faqs.filter(faq => faq.faqCategoryId === category.id);
      if (categoryFaqs.length > 0) {
        groups.push({
          category,
          faqs: categoryFaqs.sort((a, b) => a.displayOrder - b.displayOrder),
        });
      }
    });
    
    // Adicionar FAQs sem categoria (se houver)
    const uncategorizedFaqs = faqs.filter(faq => 
      !categories.some(cat => cat.id === faq.faqCategoryId)
    );
    
    if (uncategorizedFaqs.length > 0) {
      // Criar uma categoria virtual para FAQs sem categoria
      const virtualCategory: FAQCategory = {
        id: 'uncategorized',
        displayOrder: 999,
        contents: [
          { lang: 1, name: isEn ? 'General' : 'Geral' },
          { lang: 2, name: 'General' },
        ],
        isActive: true,
      };
      groups.push({
        category: virtualCategory,
        faqs: uncategorizedFaqs,
      });
    }
    
    // Ordenar grupos por ordem de exibição da categoria
    return groups.sort((a, b) => a.category.displayOrder - b.category.displayOrder);
  };

  const faqGroups = groupFAQsByCategory(faqs, categories);

  // Função para obter o nome da categoria no idioma correto
  const getCategoryName = (category: FAQCategory): string => {
    if (isEn) {
      const enContent = getEnglishContent(category);
      return enContent?.name || category.contents?.[0]?.name || 'General';
    }
    const ptContent = getPortugueseContent(category);
    return ptContent?.name || category.contents?.[0]?.name || 'Geral';
  };

  // Função para obter pergunta no idioma correto
  const getQuestion = (faq: FAQItem): string => {
    if (isEn) {
      const enContent = getEnglishContent(faq);
      if (enContent?.question && enContent.question.trim() !== '') {
        return enContent.question;
      }
    }
    const ptContent = getPortugueseContent(faq);
    return ptContent?.question || 'Sem pergunta';
  };

  // Função para obter resposta no idioma correto
  const getAnswer = (faq: FAQItem): string => {
    if (isEn) {
      const enContent = getEnglishContent(faq);
      if (enContent?.answer && enContent.answer.trim() !== '') {
        return enContent.answer;
      }
    }
    const ptContent = getPortugueseContent(faq);
    return ptContent?.answer || 'Sem resposta';
  };

  // Verificar se o FAQ tem conteúdo válido no idioma atual
  const hasValidContent = (faq: FAQItem): boolean => {
    if (isEn) {
      const enContent = getEnglishContent(faq);
      return !!(enContent?.question?.trim() && enContent?.answer?.trim());
    }
    const ptContent = getPortugueseContent(faq);
    return !!(ptContent?.question?.trim() && ptContent?.answer?.trim());
  };

  // Filtrar FAQs que têm conteúdo válido no idioma atual
  const processFaqGroups = () => {
    return faqGroups
      .map(group => ({
        ...group,
        faqs: group.faqs.filter(hasValidContent),
      }))
      .filter(group => group.faqs.length > 0);
  };

  const processedGroups = processFaqGroups();
  const totalFaqs = processedGroups.reduce((acc, group) => acc + group.faqs.length, 0);

  const breadcrumbs = [{ labelKey: "faq.breadcrumb" }];

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
        ) : processedGroups.length > 0 && totalFaqs > 0 ? (
          processedGroups.map(({ category, faqs: groupFaqs }) => (
            <div key={category.id} className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-semibold tracking-tight">
                  {getCategoryName(category)}
                </h2>
                <Badge variant="outline" className="text-sm">
                  {groupFaqs.length} {isEn ? "questions" : "perguntas"}
                </Badge>
              </div>
              
              <Accordion type="single" collapsible className="space-y-3">
                {groupFaqs.map((faq, index) => (
                  <AccordionItem
                    key={faq.id}
                    value={`${category.id}-${index}`}
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
          ))
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