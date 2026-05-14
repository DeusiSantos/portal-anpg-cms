/**
 * WordPress News Card Component
 * Card para exibição de notícias do WordPress
 */

import { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MappedNewsItem } from '@/lib/wordpress';
import { getCategoryLabel, getCategoryColor } from '@/data/newsData';

interface WPNewsCardProps {
  news: MappedNewsItem;
  variant?: 'featured' | 'default' | 'compact';
  index?: number;
}

export const WPNewsCard = memo(function WPNewsCard({
  news,
  variant = 'default',
  index = 0,
}: WPNewsCardProps) {
  if (variant === 'featured') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="group"
      >
        <Link to={`/news/${news.id}`} className="block">
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-6">
            <img
              src={news.image}
              alt={news.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
              <span className={cn(
                'inline-block px-3 py-1 rounded-full text-xs font-medium border mb-4',
                getCategoryColor(news.category)
              )}>
                {getCategoryLabel(news.category)}
              </span>
              
              <h3 className="text-2xl lg:text-3xl font-bold text-white mb-3 group-hover:text-primary transition-colors line-clamp-2">
                {news.title}
              </h3>
              
              <p className="text-white/80 text-lg mb-4 line-clamp-2">
                {news.excerpt}
              </p>
              
              <div className="flex items-center gap-4 text-white/60 text-sm">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {news.date}
                </span>
                {news.author && (
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    {news.author}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }
  
  if (variant === 'compact') {
    return (
      <motion.article
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="group"
      >
        <Link
          to={`/news/${news.id}`}
          className="flex items-start gap-4 p-4 rounded-xl hover:bg-secondary/50 transition-colors"
        >
          <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={news.image}
              alt={news.title}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <span className={cn(
              'inline-block px-2 py-0.5 rounded text-[10px] font-medium border mb-1.5',
              getCategoryColor(news.category)
            )}>
              {getCategoryLabel(news.category)}
            </span>
            
            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 text-sm">
              {news.title}
            </h4>
            
            <span className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {news.date}
            </span>
          </div>
        </Link>
      </motion.article>
    );
  }
  
  // Default variant
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group"
    >
      <Link
        to={`/news/${news.id}`}
        className="block bg-background rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg h-full"
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={news.image}
            alt={news.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        <div className="p-6">
          <span className={cn(
            'inline-block px-2.5 py-1 rounded-full text-xs font-medium border mb-3',
            getCategoryColor(news.category)
          )}>
            {getCategoryLabel(news.category)}
          </span>
          
          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
            {news.title}
          </h3>
          
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
            {news.excerpt}
          </p>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {news.date}
            </span>
            
            <span className="text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
              Ler mais
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
});

/**
 * Skeleton loader para cards
 */
export const WPNewsCardSkeleton = ({ variant = 'default' }: { variant?: 'featured' | 'default' | 'compact' }) => {
  if (variant === 'featured') {
    return (
      <div className="animate-pulse">
        <div className="aspect-[16/9] rounded-2xl bg-muted" />
      </div>
    );
  }
  
  if (variant === 'compact') {
    return (
      <div className="flex items-start gap-4 p-4 animate-pulse">
        <div className="w-20 h-20 rounded-lg bg-muted flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-16" />
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-3 bg-muted rounded w-24" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="rounded-2xl border border-border overflow-hidden animate-pulse">
      <div className="aspect-[16/10] bg-muted" />
      <div className="p-6 space-y-3">
        <div className="h-5 bg-muted rounded w-20" />
        <div className="h-5 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
      </div>
    </div>
  );
};
