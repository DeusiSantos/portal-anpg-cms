import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FileCheck, Shield, BarChart3, ArrowUpRight, Scale, Globe2, Leaf
} from "lucide-react";
import { usePageData } from "@/hooks/pages/usePageData";

const defaultServicesData = [
  { iconKey: "FileCheck", title: "Licenciamento", description: "Gestão de concessões e licenças para exploração e produção de hidrocarbonetos.", href: "/regulation/licensing", color: "bg-primary/10 text-primary" },
  { iconKey: "Shield", title: "Fiscalização", description: "Supervisão e controlo das operações petrolíferas em todo o território nacional.", href: "/regulation/oversight", color: "bg-primary/10 text-primary" },
  { iconKey: "Scale", title: "Regulação", description: "Desenvolvimento e aplicação do quadro regulatório do sector energético.", href: "/regulation", color: "bg-primary/10 text-primary" },
  { iconKey: "Globe2", title: "Licitações", description: "Organização de processos para atribuição de direitos de exploração.", href: "/regulation/tenders", color: "bg-primary/10 text-primary" },
  { iconKey: "BarChart3", title: "Dados & Analytics", description: "Publicação de estatísticas e relatórios sobre o sector energético.", href: "/data", color: "bg-primary/10 text-primary" },
  { iconKey: "Leaf", title: "Sustentabilidade", description: "Promoção de práticas ambientalmente responsáveis no sector.", href: "/sustainability", color: "bg-primary/10 text-primary" },
];

const iconMap: Record<string, React.ReactNode> = {
  FileCheck: <FileCheck className="w-7 h-7" />,
  Shield: <Shield className="w-7 h-7" />,
  Scale: <Scale className="w-7 h-7" />,
  Globe2: <Globe2 className="w-7 h-7" />,
  BarChart3: <BarChart3 className="w-7 h-7" />,
  Leaf: <Leaf className="w-7 h-7" />,
};

export function ServicesSection() {
  const { data: homeData } = usePageData("home");
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const services = homeData?.services?.items?.length
    ? homeData.services.items.map((s: any) => ({ ...s, color: "bg-primary/10 text-primary" }))
    : defaultServicesData;

  return (
    <section ref={ref} className="section-padding bg-foreground text-primary-foreground overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-widest mb-4 block">
            {homeData?.services?.label || "Serviços & Competências"}
          </span>
          <h2 className="section-title mb-4 text-primary-foreground">
            {homeData?.services?.title || "Áreas de Actuação"}
          </h2>
          <p className="section-subtitle mx-auto text-pearl/70">
            {homeData?.services?.subtitle || ""}
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service: any, index: number) => (
            <motion.div
              key={service.title || index}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                to={service.href}
                className="group relative p-8 rounded-sm border border-pearl/10 hover:border-primary/50 bg-pearl/5 hover:bg-primary/10 transition-all duration-300 block h-full"
              >
                {/* Icon */}
                <div className={`w-14 h-14 rounded-sm ${service.color || "bg-primary/10 text-primary"} flex items-center justify-center mb-6`}>
                  {iconMap[service.iconKey] || <FileCheck className="w-7 h-7" />}
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-primary-foreground mb-3 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="text-pearl/70 text-sm leading-relaxed">
                  {service.description}
                </p>

                {/* Arrow */}
                <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="w-5 h-5 text-primary" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
