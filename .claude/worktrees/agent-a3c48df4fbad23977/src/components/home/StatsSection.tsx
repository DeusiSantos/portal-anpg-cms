import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useContentBlock } from "@/hooks/useCMSData";

function useCountUp(end: number, duration: number = 2, inView: boolean) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!inView) return;
    
    let startTime: number | null = null;
    const startValue = 0;
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = startValue + (end - startValue) * easeOutQuart;
      setCount(currentCount);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [end, duration, inView]);
  
  return count;
}

interface StatCardProps {
  value: number;
  suffix: string;
  label: string;
  description: string;
  index: number;
  inView: boolean;
}

function StatCard({ value, suffix, label, description, index, inView }: StatCardProps) {
  const count = useCountUp(value, 2.5, inView);
  const displayValue = value % 1 !== 0 
    ? count.toFixed(1) 
    : Math.round(count).toString();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="text-center p-8"
    >
      <div className="stat-number">
        {displayValue}
        <span className="text-3xl md:text-4xl">{suffix}</span>
      </div>
      <div className="stat-label">{label}</div>
      <p className="text-sm text-muted-foreground/70 mt-2">{description}</p>
    </motion.div>
  );
}

export function StatsSection() {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const { data: cmsBlock } = useContentBlock("home", "stats");

  // CMS content shape: { label, title, subtitle, exploreData, items: [{ value, suffix, label, description }] }
  const cmsContent = cmsBlock?.content;

  const defaultStats = [
    { value: 1.1, suffix: "M", label: t("stats.barrelsDay"), description: t("stats.oilProduction") },
    { value: 47, suffix: "", label: t("stats.activeBlocks"), description: t("stats.explorationProduction") },
    { value: 12, suffix: "B+", label: t("stats.invested"), description: t("stats.lastFiveYears") },
    { value: 35, suffix: "+", label: t("stats.operators"), description: t("stats.internationalCompanies") },
  ];

  const stats = cmsContent?.items?.length
    ? (cmsContent.items as { value: number; suffix: string; label: string; description: string }[])
    : defaultStats;

  return (
    <section className="relative bg-secondary/50 overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="container mx-auto px-6 lg:px-8 section-padding relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-widest mb-4 block">
            {cmsContent?.label || t("stats.label")}
          </span>
          <h2 className="section-title mb-4">
            {cmsContent?.title || t("stats.title")}
          </h2>
          <p className="section-subtitle mx-auto">
            {cmsContent?.subtitle || t("stats.subtitle")}
          </p>
        </motion.div>

        <div 
          ref={ref}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x divide-border"
        >
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              description={stat.description}
              index={index}
              inView={inView}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <a
            href="/ep-data"
            className="inline-flex items-center gap-2 text-primary font-medium hover:underline underline-offset-4"
          >
            {cmsContent?.exploreData || t("stats.exploreData")}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
