import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowRight, Shield, Target, Globe, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useContentBlock } from "@/hooks/useCMSData";
import refineryImage from "@/assets/refinery.jpg";

const defaultValues = [
  {
    iconKey: "Shield",
    titleKey: "about.values.transparency.title",
    descriptionKey: "about.values.transparency.description",
  },
  {
    iconKey: "Target",
    titleKey: "about.values.excellence.title",
    descriptionKey: "about.values.excellence.description",
  },
  {
    iconKey: "Globe",
    titleKey: "about.values.sustainability.title",
    descriptionKey: "about.values.sustainability.description",
  },
  {
    iconKey: "Lightbulb",
    titleKey: "about.values.innovation.title",
    descriptionKey: "about.values.innovation.description",
  },
];

const iconMap: Record<string, React.ReactNode> = {
  Shield: <Shield className="w-5 h-5" />,
  Target: <Target className="w-5 h-5" />,
  Globe: <Globe className="w-5 h-5" />,
  Lightbulb: <Lightbulb className="w-5 h-5" />,
};

export function AboutSection() {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  // CMS content block with fallback
  const { data: cmsBlock } = useContentBlock("home", "about");
  const cms = cmsBlock?.content;
  const image = cms?.image || refineryImage;
  const statValue = cms?.statValue || "45+";
  const values = cms?.values?.length ? cms.values : defaultValues;

  return (
    <section ref={ref} className="section-padding bg-background overflow-hidden">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image Column */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
              <img
                src={image}
                alt="Modern refinery"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
              
              {/* Floating stat card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="absolute bottom-6 left-6 right-6 md:right-auto md:w-64 bg-background rounded-sm p-6 shadow-hero"
              >
                <div className="text-3xl font-bold text-primary mb-1">{statValue}</div>
                <div className="text-sm text-muted-foreground">
                  {cms?.statLabel || t("about.yearsExperience")}
                </div>
              </motion.div>
            </div>

            <div className="absolute -z-10 -bottom-8 -right-8 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          </motion.div>

          {/* Content Column */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-sm font-semibold text-primary uppercase tracking-widest mb-4 block">
              {cms?.label || t("about.label")}
            </span>
            <h2 className="section-title mb-6">
              {cms?.title || t("about.title")}<br />
              <span className="text-primary">{cms?.titleHighlight || t("about.titleHighlight")}</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              {cms?.description || t("about.description")}
            </p>

            {/* Values Grid */}
            <div className="grid grid-cols-2 gap-6 mb-10">
              {values.map((value: any, index: number) => (
                <motion.div
                  key={value.titleKey || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-sm bg-primary/10 flex items-center justify-center text-primary">
                    {iconMap[value.iconKey] || <Shield className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {value.title || (value.titleKey ? t(value.titleKey) : "")}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {value.description || (value.descriptionKey ? t(value.descriptionKey) : "")}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button variant="heroOutlineLight" size="lg" className="group">
              {cms?.cta || t("about.cta")}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
