import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, HelpCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/service/api";

interface FAQContent {
  lang: number;
  question: string;
  answer: string;
}

interface FAQItem {
  faqCategoryId: string;
  displayOrder: number;
  contents: FAQContent[];
  id: string;
  isActive: boolean;
  isDeleted: boolean;
}

interface FAQResponse {
  items: FAQItem[];
}

interface FormattedFAQ {
  id: string;
  question: string;
  answer: string;
  displayOrder: number;
}

const FAQ_CATEGORY_ID = "be8ed108-3f62-4fc4-a1e0-543e4d9d981e";

export function TenderFAQ() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  const [faqs, setFaqs] = useState<FormattedFAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchFAQs = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get<FAQResponse>('/faqs', {
          params: { FaqCategoryId: FAQ_CATEGORY_ID }
        });

        const activeItems = (response.data.items ?? []).filter(
          item => item.isActive === true && item.isDeleted === false
        );

        const formatted: FormattedFAQ[] = activeItems.map(item => {
          const content = item.contents.find(c => c.lang === (isEn ? 2 : 1)) || item.contents[0];
          return {
            id: item.id,
            question: content?.question || "Pergunta não disponível",
            answer: content?.answer || "Resposta não disponível",
            displayOrder: item.displayOrder,
          };
        });

        formatted.sort((a, b) => a.displayOrder - b.displayOrder);
        setFaqs(formatted);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar FAQs");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFAQs();
  }, [isEn]);

  const toggleItem = (id: string) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || faqs.length === 0) {
    return (
      <div className="text-center py-12 bg-secondary/30 rounded-xl">
        <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">
          {error
            ? "Erro ao carregar perguntas frequentes."
            : "Nenhuma pergunta frequente disponível no momento."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {faqs.map(faq => {
        const isOpen = openItems.has(faq.id);
        return (
          <div
            key={faq.id}
            className={cn(
              "rounded-xl border transition-all duration-300 overflow-hidden",
              isOpen
                ? "border-primary/30 bg-primary/5 shadow-md"
                : "border-border bg-secondary/30 hover:border-primary/20"
            )}
          >
            <button
              onClick={() => toggleItem(faq.id)}
              className="w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer hover:bg-primary/5 transition-colors"
            >
              <span className={cn("font-medium text-foreground pr-4", isOpen && "text-primary")}>
                {faq.question}
              </span>
              <ChevronDown
                className={cn(
                  "w-5 h-5 text-muted-foreground transition-transform duration-300 flex-shrink-0",
                  isOpen && "rotate-180 text-primary"
                )}
              />
            </button>

            <div className={cn(
              "transition-all duration-300 ease-in-out",
              isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            )}>
              <div className="px-5 pb-5 pt-0">
                <div className="h-px bg-border mb-4" />
                <p className="text-muted-foreground text-sm leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          </div>
        );
      })}

      <div className="text-center pt-4">
        <p className="text-sm text-muted-foreground">
          {isEn ? "Have other questions? " : "Tem outras questões? "}
          <a href="/contacts" className="text-primary hover:underline font-medium">
            {isEn ? "Contact us" : "Contacte-nos"}
          </a>
        </p>
      </div>
    </div>
  );
}
