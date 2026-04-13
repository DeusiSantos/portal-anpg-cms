import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { PageHero } from "./PageHero";
import { PageBreadcrumb, BreadcrumbItem } from "./PageBreadcrumb";
import { SectionTransition } from "./SectionTransition";
import { usePageBanner } from "@/hooks/useCMSData";

interface PageLayoutProps {
  titleKey?: string;
  title?: string;
  subtitleKey?: string;
  subtitle?: string;
  descriptionKey?: string;
  description?: string;
  backgroundImage?: string;
  icon?: ReactNode;
  heroChildren?: ReactNode;
  breadcrumbs: BreadcrumbItem[];
  children: ReactNode;
  /** CMS page_key to auto-fetch banner overrides */
  pageKey?: string;
}

export function PageLayout({
  titleKey,
  title,
  subtitleKey,
  subtitle,
  descriptionKey,
  description,
  backgroundImage,
  icon,
  heroChildren,
  breadcrumbs,
  children,
  pageKey,
}: PageLayoutProps) {
  // Fetch CMS banner override if pageKey is provided
  const { data: cmsBanner } = usePageBanner(pageKey);

  // CMS values override static props (fallback to static)
  const resolvedTitle = cmsBanner?.title || title;
  const resolvedSubtitle = cmsBanner?.subtitle || subtitle;
  const resolvedImage = cmsBanner?.image_url || backgroundImage;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <PageHero
        titleKey={!resolvedTitle ? titleKey : undefined}
        title={resolvedTitle}
        subtitleKey={!resolvedSubtitle ? subtitleKey : undefined}
        subtitle={resolvedSubtitle}
        descriptionKey={descriptionKey}
        description={description}
        backgroundImage={resolvedImage}
        icon={icon}
      >
        {heroChildren}
      </PageHero>

      {/* Breadcrumb */}
      <PageBreadcrumb items={breadcrumbs} />

      {/* Main Content */}
      <main className="flex-1 bg-background">
        <SectionTransition>
          <div className="container mx-auto px-6 lg:px-8 py-16 lg:py-24">
            {children}
          </div>
        </SectionTransition>
      </main>

      <Footer />
    </div>
  );
}
