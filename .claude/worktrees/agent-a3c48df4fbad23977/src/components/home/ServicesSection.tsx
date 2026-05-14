import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { 
  FileCheck, Shield, BarChart3, ArrowUpRight, Scale, Globe2, Leaf
} from "lucide-react";
import { useContentBlock } from "@/hooks/useCMSData";

const defaultServices = [
  { iconKey: "FileCheck", titleKey: "services.licensing.title", descriptionKey: "services.licensing.description", href: "/regulation/licensing", color: "bg-primary/10 text-primary" },
  { iconKey: "Shield", titleKey: "services.oversight.title", descriptionKey: "services.oversight.description", href: "/regulation/oversight", color: "bg-primary/10 text-primary" },
  { iconKey: "Scale", titleKey: "services.regulation.title", descriptionKey: "services.regulation.description", href: "/regulation", color: "bg-primary/10 text-primary" },
  { iconKey: "Globe2", titleKey: "services.tenders.title", descriptionKey: "services.tenders.description", href: "/regulation/tenders", color: "bg-primary/10 text-primary" },
  { iconKey: "BarChart3", titleKey: "services.analytics.title", descriptionKey: "services.analytics.description", href: "/data", color: "bg-primary/10 text-primary" },
  { iconKey: "Leaf", titleKey: "services.sustainability.title", descriptionKey: "services.sustainability.description", href: "/sustainability", color: "bg-primary/10 text-primary" },
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
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  // CMS content block with fallback
  const { data: cmsBlock } = useContentBlock("home", "services");
  const cms = cmsBlock?.content;
  const services = cms?.items?.length ? cms.items : defaultServices;

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
            {cms?.label || t("services.label")}
          </span>
          <h2 className="section-title mb-4 text-primary-foreground">
            {cms?.title || t("services.title")}
          </h2>
          <p className="section-subtitle mx-auto text-pearl/70">
            {cms?.subtitle || t("services.subtitle")}
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service: any, index: number) => (
            <motion.div
              key={service.titleKey || index}
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
                  {service.title || (service.titleKey ? t(service.titleKey) : "")}
                </h3>
                <p className="text-pearl/70 text-sm leading-relaxed">
                  {service.description || (service.descriptionKey ? t(service.descriptionKey) : "")}
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
