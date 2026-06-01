import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { MapPin, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageData } from "@/hooks/pages/usePageData";
import angolaCoast from "@/assets/angola-coast.jpg";

export function InvestmentSection() {
  const { data: homeData } = usePageData("home");
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const image = angolaCoast;

  const defaultHighlights = [
    "Acesso a 47 blocos petrolíferos onshore e offshore",
    "Regime fiscal competitivo e estável",
    "Infraestrutura de classe mundial",
    "Apoio regulatório dedicado aos investidores",
    "Reservas comprovadas superiores a 8 mil milhões de barris",
  ];

  const highlights: string[] = homeData?.investment?.highlights?.length
    ? homeData.investment.highlights
    : defaultHighlights;

  const blocks = [
    { name: "Bloco 15/06", status: "Produção", operator: "Eni" },
    { name: "Bloco 31", status: "Produção", operator: "BP" },
    { name: "Bloco 17", status: "Produção", operator: "TotalEnergies" },
    { name: "Bloco 32", status: "Desenvolvimento", operator: "TotalEnergies" },
  ];

  return (
    <section ref={ref} className="relative section-padding bg-background overflow-hidden">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content Column */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-sm font-semibold text-primary uppercase tracking-widest mb-4 block">
              {homeData?.investment?.label || "Oportunidades de Investimento"}
            </span>
            <h2 className="section-title mb-6">
              {homeData?.investment?.title || "Invista hoje no futuro"}<br />
              <span className="text-primary">{homeData?.investment?.titleHighlight || "energético de Angola."}</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              {homeData?.investment?.description || ""}
            </p>

            {/* Highlights */}
            <ul className="space-y-4 mb-10">
              {highlights.map((item: string, index: number) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-foreground">{item}</span>
                </motion.li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-4">
              <Button variant="hero" size="lg" className="group">
                {homeData?.investment?.ctaGuide || "Guia do Investidor"}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="heroOutlineLight" size="lg">
                {homeData?.investment?.ctaBlocks || "Ver Blocos Disponíveis"}
              </Button>
            </div>
          </motion.div>

          {/* Visual Column */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8 }}
            className="relative lg:pb-10"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
              <img src={image} alt="Angola coastline" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/20 to-transparent" />
              <div className="absolute top-6 left-6 flex items-center gap-2 text-primary-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{homeData?.investment?.location || "Luanda, Angola"}</span>
              </div>
            </div>

            {/* Blocks Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-4 lg:absolute lg:mt-0 lg:-bottom-8 lg:left-auto lg:-right-8 bg-background rounded-sm p-6 shadow-hero border border-border w-full lg:max-w-xs"
            >
              <h4 className="font-semibold text-foreground mb-4">{homeData?.investment?.featuredBlocks || "Blocos em Destaque"}</h4>
              <div className="space-y-3">
                {blocks.map((block: any) => (
                  <div key={block.name} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{block.name}</span>
                    <span className="text-muted-foreground">{block.operator}</span>
                  </div>
                ))}
              </div>
              <a href="/ep-data/maps" className="mt-4 text-primary text-sm font-medium flex items-center gap-1 hover:underline">
                {homeData?.investment?.viewAllBlocks || "Ver todos os blocos"}
                <ArrowRight className="w-3 h-3" />
              </a>
            </motion.div>

            <div className="absolute -z-10 -top-8 -right-8 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
