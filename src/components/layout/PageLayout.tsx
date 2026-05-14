import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { PageHero } from "./PageHero";
import { PageBreadcrumb, BreadcrumbItem } from "./PageBreadcrumb";
import { SectionTransition } from "./SectionTransition";
import { useTranslation } from "react-i18next";
import { useBanners } from "@/hooks/useBanners";

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
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const { data: banners } = useBanners(pageKey || '');
  const banner = banners?.[0];

  const resolvedTitle = (isEn ? banner?.titleEn : banner?.titlePt) || title;
  const resolvedSubtitle = (isEn ? banner?.subtitleEn : banner?.subtitlePt) || subtitle;
  const resolvedImage = banner?.imageUrl || backgroundImage;

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
