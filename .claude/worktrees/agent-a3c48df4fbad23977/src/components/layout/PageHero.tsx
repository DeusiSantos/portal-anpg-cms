import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ReactNode } from "react";

interface PageHeroProps {
  titleKey?: string;
  title?: string;
  subtitleKey?: string;
  subtitle?: string;
  descriptionKey?: string;
  description?: string;
  backgroundImage?: string;
  icon?: ReactNode;
  children?: ReactNode;
}

export function PageHero({
  titleKey,
  title,
  subtitleKey,
  subtitle,
  descriptionKey,
  description,
  backgroundImage,
  icon,
  children,
}: PageHeroProps) {
  const { t } = useTranslation();

  const displayTitle = title || (titleKey ? t(titleKey) : '');
  const displaySubtitle = subtitle || (subtitleKey ? t(subtitleKey) : '');
  const displayDescription = description || (descriptionKey ? t(descriptionKey) : '');

  return (
    <section className="relative min-h-[40vh] lg:min-h-[50vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        {backgroundImage ? (
          <img
            src={backgroundImage}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary via-primary/90 to-primary/80" />
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/50" />
        
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-2xl" />
        </div>
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 lg:px-8 py-24 lg:py-32">
        <div className="max-w-4xl">
          {/* Icon */}
          {icon && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 rounded-xl bg-primary/20 backdrop-blur-sm flex items-center justify-center mb-6 border border-primary/30"
            >
              {icon}
            </motion.div>
          )}

          {/* Subtitle/Label */}
          {displaySubtitle && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 text-primary font-medium text-sm uppercase tracking-wider mb-4">
                <span className="w-8 h-px bg-primary" />
                {displaySubtitle}
              </span>
            </motion.div>
          )}

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight"
          >
            {displayTitle}
          </motion.h1>

          {/* Description */}
          {displayDescription && (
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl leading-relaxed"
            >
              {displayDescription}
            </motion.p>
          )}

          {/* Additional content */}
          {children && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8"
            >
              {children}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
