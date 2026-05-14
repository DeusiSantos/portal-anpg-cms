import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight, Play, BarChart3, Shield, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHeroSlides, HeroSlideData } from "@/hooks/useHeroSlides";
import { usePageData } from "@/hooks/pages/usePageData";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";
import slideLuanda from "@/assets/slides/cidade-luanda.jpg";
import slideRefinaria from "@/assets/slides/refinaria-noite.jpg";
import slideDalia from "@/assets/slides/fpso-dalia.jpg";
import slidePazflor from "@/assets/slides/fpso-pazflor.jpg";
import slideMiradouro from "@/assets/slides/miradouro-lua.jpg";

const defaultSlides = [
  { image: slidePazflor },
  { image: slideLuanda },
  { image: slideRefinaria },
  { image: slideDalia },
  { image: slideMiradouro },
];

const defaultQuickAccess = [
  {
    iconKey: "TrendingUp",
    titleKey: "nav.investment",
    descriptionKey: "services.tenders.description",
    href: "/investor-portal",
  },
  {
    iconKey: "Shield",
    titleKey: "services.regulation.title",
    descriptionKey: "services.regulation.description",
    href: "/regulation",
  },
  {
    iconKey: "BarChart3",
    titleKey: "nav.data",
    descriptionKey: "services.analytics.description",
    href: "/ep-data",
  },
];

const iconMap: Record<string, React.ReactNode> = {
  TrendingUp: <TrendingUp className="w-6 h-6" />,
  Shield: <Shield className="w-6 h-6" />,
  BarChart3: <BarChart3 className="w-6 h-6" />,
};

export function HeroSection() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === "en";
  const { data: homeData } = usePageData("home");
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const { data: cmsSlides, isLoading: slidesLoading } = useHeroSlides();
  const slides = cmsSlides?.length ? cmsSlides.slice(0, 6) : defaultSlides;
  const quickAccessItems = homeData?.hero?.quickAccess?.length ? homeData.hero.quickAccess : defaultQuickAccess;

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Fade(),
    Autoplay({ delay: 6000, stopOnInteraction: false, stopOnMouseEnter: true }),
  ]);

  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Carousel Background */}
      <div ref={emblaRef} className="absolute inset-0 z-0 overflow-hidden">
        <div className="flex h-full">
          {slides.map((slide: HeroSlideData | { image: string }, idx: number) => {
            const imageUrl = 'image' in slide ? slide.image : slide.image;
            const title = 'title_pt' in slide && !isEn ? slide.title_pt :
                         'title_en' in slide ? (slide as HeroSlideData).title_en : '';

            return (
              <div key={idx} className="flex-[0_0_100%] min-w-0 h-full relative">
                <img
                  src={imageUrl}
                  alt={title || `Slide ${idx + 1}`}
                  className="w-full h-full object-cover scale-110"
                  onError={(e) => {
                    console.error('Failed to load slide image:', imageUrl);
                    e.currentTarget.src = '/placeholder-image.jpg';
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute inset-0 z-[1] hero-overlay" />

      {/* Floating Orbs */}
      <div className="absolute inset-0 z-[2] overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-primary/5 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-40 -left-32 w-64 h-64 rounded-full bg-primary/10 blur-2xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      {/* Geometric pattern */}
      <div className="absolute inset-0 z-[3] opacity-[0.03]">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,hsl(var(--primary))_49%,hsl(var(--primary))_51%,transparent_52%)] bg-[length:60px_60px]" />
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 z-[4] opacity-40 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_black_100%)]" />

      {/* Content */}
      <motion.div
        style={{ opacity, y: contentY }}
        className="relative z-10 container mx-auto px-6 lg:px-8 pt-24"
      >
        <div className="max-w-4xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
          >
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse-slow" />
            <span className="text-sm text-primary-foreground font-medium">
              {homeData?.hero?.subtitle || t("hero.subtitle")}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="hero-title text-primary-foreground mb-6"
          >
            {homeData?.hero?.title || t("hero.title")}<br />
            <span className="text-primary">{homeData?.hero?.titleHighlight || t("hero.titleHighlight")}</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hero-subtitle text-primary-foreground/80 max-w-2xl mb-10"
          >
            {homeData?.hero?.description || t("hero.description")}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <Button variant="hero" size="xl" className="group">
              {homeData?.hero?.ctaPrimary || t("hero.ctaPrimary")}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="heroOutline" size="xl" className="group">
              <Play className="w-5 h-5" />
              {homeData?.hero?.ctaSecondary || t("hero.ctaSecondary")}
            </Button>
          </motion.div>
        </div>

        {/* Quick Access Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 lg:mt-24 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {quickAccessItems.map((item: any, idx: number) => (
            <QuickAccessCard
              key={idx}
              icon={iconMap[item.iconKey] || <TrendingUp className="w-6 h-6" />}
              titleKey={item.titleKey}
              title={item.title}
              descriptionKey={item.descriptionKey}
              description={item.description}
              href={item.href}
              delay={0.6 + idx * 0.1}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Slide Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full glass flex items-center justify-center text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-all"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full glass flex items-center justify-center text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-all"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {slides.map((_: any, idx: number) => (
            <button
              key={idx}
              onClick={() => scrollTo(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === selectedIndex
                  ? "w-8 bg-primary"
                  : "w-2 bg-primary-foreground/40 hover:bg-primary-foreground/60"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-primary-foreground/60 uppercase tracking-widest">
            {homeData?.hero?.scrollHint || t("hero.scrollHint")}
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-primary-foreground/30 flex items-start justify-center p-2"
          >
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-primary-foreground rounded-full"
            />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

interface QuickAccessCardProps {
  icon: React.ReactNode;
  titleKey?: string;
  title?: string;
  descriptionKey?: string;
  description?: string;
  href: string;
  delay: number;
}

function QuickAccessCard({ icon, titleKey, title, descriptionKey, description, href, delay }: QuickAccessCardProps) {
  const { t } = useTranslation();

  return (
    <motion.a
      href={href}
      initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group glass-dark rounded-sm p-6 hover:bg-primary-foreground/5 transition-all duration-300 cursor-pointer"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-sm bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <div>
          <h3 className="text-primary-foreground font-semibold mb-1 group-hover:text-primary transition-colors">
            {title || (titleKey ? t(titleKey) : "")}
          </h3>
          <p className="text-sm text-primary-foreground/60">
            {description || (descriptionKey ? t(descriptionKey) : "")}
          </p>
        </div>
      </div>
    </motion.a>
  );
}
