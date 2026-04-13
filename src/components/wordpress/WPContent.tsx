/**
 * WordPress Content Renderer
 * Componente para renderizar conteúdo HTML do WordPress de forma segura
 */

import { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface WPContentProps {
  html: string;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | 'none';
}

/**
 * Processa e sanitiza HTML do WordPress
 */
const processWordPressHtml = (html: string): string => {
  // Remove scripts inline (segurança básica)
  let processed = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers
  processed = processed.replace(/\s*on\w+="[^"]*"/gi, '');
  processed = processed.replace(/\s*on\w+='[^']*'/gi, '');
  
  // Converte classes do WordPress para Tailwind compatíveis
  processed = processed.replace(/class="wp-block-image/g, 'class="wp-block-image rounded-lg overflow-hidden my-6');
  processed = processed.replace(/class="wp-block-quote/g, 'class="wp-block-quote border-l-4 border-primary pl-4 my-6 italic');
  processed = processed.replace(/class="wp-block-gallery/g, 'class="wp-block-gallery grid gap-4');
  
  // Adiciona classes a elementos sem classes
  processed = processed.replace(/<img(?![^>]*class=)/g, '<img class="rounded-lg w-full"');
  processed = processed.replace(/<blockquote(?![^>]*class=)/g, '<blockquote class="border-l-4 border-primary pl-4 my-6 italic bg-secondary/30 py-4 pr-4 rounded-r-lg"');
  processed = processed.replace(/<table(?![^>]*class=)/g, '<table class="w-full border-collapse"');
  processed = processed.replace(/<th(?![^>]*class=)/g, '<th class="border border-border bg-muted px-4 py-2 text-left font-semibold"');
  processed = processed.replace(/<td(?![^>]*class=)/g, '<td class="border border-border px-4 py-2"');
  
  // Melhora links externos
  processed = processed.replace(
    /<a\s+href="(https?:\/\/(?!anpg\.co\.ao)[^"]+)"/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer"'
  );
  
  return processed;
};

/**
 * Renderiza conteúdo HTML do WordPress
 */
export const WPContent = memo(function WPContent({ 
  html, 
  className,
  maxWidth = '4xl',
}: WPContentProps) {
  const processedHtml = useMemo(() => processWordPressHtml(html), [html]);
  
  const maxWidthClass = maxWidth !== 'none' ? `max-w-${maxWidth}` : '';
  
  return (
    <div
      className={cn(
        'wp-content prose prose-lg dark:prose-invert',
        'prose-headings:text-foreground prose-headings:font-bold',
        'prose-p:text-muted-foreground prose-p:leading-relaxed',
        'prose-strong:text-foreground',
        'prose-blockquote:border-primary prose-blockquote:text-muted-foreground',
        'prose-li:text-muted-foreground',
        'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
        'prose-img:rounded-lg',
        'prose-table:border-collapse',
        maxWidthClass,
        className
      )}
      dangerouslySetInnerHTML={{ __html: processedHtml }}
    />
  );
});

/**
 * Componente de loading para conteúdo WordPress
 */
export const WPContentSkeleton = ({ lines = 5 }: { lines?: number }) => {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-muted rounded"
          style={{ width: `${70 + Math.random() * 30}%` }}
        />
      ))}
    </div>
  );
};

/**
 * Componente de erro
 */
export const WPContentError = ({ 
  message = 'Erro ao carregar conteúdo',
  onRetry,
}: { 
  message?: string;
  onRetry?: () => void;
}) => {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-primary hover:underline"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
};
