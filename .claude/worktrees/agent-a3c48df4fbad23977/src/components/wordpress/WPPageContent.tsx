/**
 * WordPress Page Content Loader
 * Componente para carregar e exibir conteúdo de páginas WordPress
 */

import { useWPPage } from '@/hooks/useWordPress';
import { WPContent, WPContentSkeleton, WPContentError } from './WPContent';
import { KNOWN_PAGE_SLUGS } from '@/lib/wordpress';

interface WPPageContentProps {
  slug: keyof typeof KNOWN_PAGE_SLUGS | string;
  fallback?: React.ReactNode;
  showTitle?: boolean;
  className?: string;
}

/**
 * Carrega e exibe conteúdo de uma página WordPress
 */
export function WPPageContent({
  slug,
  fallback,
  showTitle = false,
  className,
}: WPPageContentProps) {
  // Resolve slug conhecido ou usa directamente
  const resolvedSlug = KNOWN_PAGE_SLUGS[slug as keyof typeof KNOWN_PAGE_SLUGS] || slug;
  
  const { data: page, isLoading, error, refetch } = useWPPage(resolvedSlug);
  
  if (isLoading) {
    return <WPContentSkeleton lines={8} />;
  }
  
  if (error || !page) {
    // Se tem fallback, mostra em vez de erro
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <WPContentError
        message="Não foi possível carregar o conteúdo"
        onRetry={() => refetch()}
      />
    );
  }
  
  return (
    <div className={className}>
      {showTitle && (
        <h1 className="text-3xl font-bold text-foreground mb-6">
          {page.title}
        </h1>
      )}
      <WPContent html={page.content} />
    </div>
  );
}

/**
 * Versão híbrida que usa WordPress se disponível, senão fallback
 */
export function WPPageContentHybrid({
  slug,
  children,
  className,
}: {
  slug: keyof typeof KNOWN_PAGE_SLUGS | string;
  children: React.ReactNode;
  className?: string;
}) {
  const resolvedSlug = KNOWN_PAGE_SLUGS[slug as keyof typeof KNOWN_PAGE_SLUGS] || slug;
  const { data: page, isLoading, isError } = useWPPage(resolvedSlug);
  
  // Se está a carregar e não tem erro, mostra loading
  if (isLoading) {
    return (
      <div className={className}>
        <WPContentSkeleton lines={8} />
      </div>
    );
  }
  
  // Se tem conteúdo WordPress, mostra-o
  if (page && !isError) {
    return (
      <div className={className}>
        <WPContent html={page.content} />
      </div>
    );
  }
  
  // Fallback para conteúdo estático
  return <div className={className}>{children}</div>;
}
