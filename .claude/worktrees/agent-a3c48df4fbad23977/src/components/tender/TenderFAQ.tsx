import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Quem pode participar na Licitação 2025?",
    answer: "Podem participar entidades nacionais ou estrangeiras, desde que cumpram os requisitos de qualificação técnica e financeira estabelecidos no caderno de encargos. As empresas devem demonstrar experiência comprovada em exploração e produção de hidrocarbonetos."
  },
  {
    question: "Qual é o prazo para submissão das propostas?",
    answer: "Após o lançamento oficial no 4º Trimestre de 2025, os concorrentes terão um período de 30 a 40 dias para submeter as suas propostas. As datas exactas serão comunicadas aquando do lançamento oficial da licitação."
  },
  {
    question: "Que tipo de contrato será utilizado?",
    answer: "Será utilizado o modelo de Contrato de Partilha de Produção (CPP), conforme estabelecido pela legislação angolana. O modelo de contrato estará disponível para consulta após o lançamento oficial da licitação."
  },
  {
    question: "Como posso aceder aos pacotes de dados técnicos?",
    answer: "Os pacotes de dados técnicos, incluindo informação sísmica e geológica, estarão disponíveis mediante solicitação formal à ANPG. Poderão ser aplicadas taxas de acesso aos dados, conforme regulamentação vigente."
  },
  {
    question: "Qual é a duração do período de exploração?",
    answer: "O período inicial de exploração é tipicamente de 4 a 5 anos, podendo ser prorrogado mediante justificação técnica e aprovação da Concessionária Nacional. Os termos específicos serão detalhados no contrato."
  },
  {
    question: "Existe participação obrigatória de empresas angolanas?",
    answer: "Sim, em conformidade com a política de conteúdo local, é incentivada a participação de empresas angolanas nos consórcios. Os requisitos específicos de participação nacional serão detalhados no caderno de encargos."
  },
  {
    question: "Como será feita a avaliação das propostas?",
    answer: "A avaliação será realizada com base em critérios técnicos (programa de trabalho, investimento proposto, capacidade operacional) e comerciais (bónus de assinatura, participação do Estado, compromissos de conteúdo local). Os pesos relativos serão definidos no edital."
  },
  {
    question: "Posso submeter propostas para múltiplos blocos?",
    answer: "Sim, os concorrentes podem submeter propostas para múltiplos blocos, desde que demonstrem capacidade técnica e financeira para operar em todos os blocos pretendidos. Cada proposta será avaliada independentemente."
  },
  {
    question: "Como manifestar interesse antes do lançamento oficial?",
    answer: "Pode manifestar o seu interesse através do formulário disponível nesta página ou contactando directamente a ANPG. Os interessados registados receberão informações actualizadas sobre o processo, incluindo a data de lançamento oficial."
  },
  {
    question: "Quais são os requisitos ambientais?",
    answer: "Todas as operações devem cumprir a legislação ambiental angolana e as melhores práticas internacionais. É obrigatória a apresentação de um Estudo de Impacto Ambiental (EIA) antes do início das actividades de exploração."
  }
];

export function TenderFAQ() {
  return (
    <div className="space-y-6">
      <Accordion type="single" collapsible className="space-y-3">
        {faqs.map((faq, index) => (
          <AccordionItem
            key={index}
            value={`item-${index}`}
            className="bg-secondary/50 border border-border rounded-xl px-6 data-[state=open]:bg-primary/5 data-[state=open]:border-primary/30 transition-all duration-300"
          >
            <AccordionTrigger className="text-left hover:no-underline py-5 text-foreground font-medium">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span>{faq.question}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-5 pl-8">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="text-center pt-4">
        <p className="text-sm text-muted-foreground">
          Tem outras questões?{" "}
          <a href="/contacts" className="text-primary hover:underline font-medium">
            Contacte-nos
          </a>
        </p>
      </div>
    </div>
  );
}
