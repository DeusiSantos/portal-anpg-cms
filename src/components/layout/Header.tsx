// Header.tsx - CORRIGIDO
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ChevronDown, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import logoWhiteStatic from "@/assets/logo-white.svg";
import logoRedStatic from "@/assets/logo-color.svg";
import { LanguageToggle } from "@/components/LanguageToggle";
import { MegaMenu, MegaMenuItem } from "@/components/layout/MegaMenu";
import { cn } from "@/lib/utils";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { getIcon } from "@/lib/iconMap";
import api from "@/service/api";
import { useQuery } from "@tanstack/react-query";

// Interface do item do menu baseada na nova API
interface MenuContent {
  lang: number;
  label: string;
}

interface MenuItem {
  id: string;
  group: string;
  url: string;
  icon: string | null;
  parentId: string | null;
  displayOrder: number;
  openInNewTab: boolean;
  contents: MenuContent[];
  isActive: boolean;
  createdAt: string;
}

interface MenusResponse {
  items: MenuItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalActive: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Interface para navegação
interface NavItem {
  nameKey?: string;
  label?: string;
  href: string;
  submenu?: { 
    nameKey?: string; 
    label?: string; 
    descriptionKey?: string; 
    description?: string; 
    href: string; 
    icon: any;
  }[];
  megaMenuColumns?: 1 | 2 | 3;
}

// Função para obter label do menu por idioma
const getMenuLabel = (item: MenuItem, lang: number): string => {
  const content = item.contents?.find(c => c.lang === lang);
  return content?.label || 'Sem label';
};

// Função para construir hierarquia de menus
const buildMenuHierarchy = (items: MenuItem[], isEn: boolean): NavItem[] => {
  if (!items || items.length === 0) return [];
  
  const lang = isEn ? 2 : 1;
  
  // CORRIGIDO: Filtrar itens do grupo "main" (menu principal) e ativos
  const mainItems = items.filter(item => 
    item.group === 'main' && item.isActive === true
  );
  
  console.log('📋 Main items filtrados:', mainItems.length);
  
  if (mainItems.length === 0) return [];
  
  // Itens de topo (sem parentId)
  const topLevelItems = mainItems
    .filter(item => !item.parentId)
    .sort((a, b) => a.displayOrder - b.displayOrder);
  
  console.log('📋 Top level items:', topLevelItems.map(i => getMenuLabel(i, lang)));
  
  if (topLevelItems.length === 0) return [];
  
  // Função para obter filhos de um item
  const getChildren = (parentId: string): MenuItem[] => {
    return mainItems
      .filter(item => item.parentId === parentId)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  };
  
  // Construir navegação
  const navigation: NavItem[] = topLevelItems.map(item => {
    const children = getChildren(item.id);
    const hasChildren = children.length > 0;
    
    console.log(`📋 Item "${getMenuLabel(item, lang)}" tem ${children.length} filhos`);
    
    // Determinar número de colunas baseado na quantidade de filhos
    const columns = hasChildren 
      ? (children.length >= 6 ? 3 : children.length >= 3 ? 2 : 1)
      : 1;
    
    return {
      label: getMenuLabel(item, lang),
      href: item.url || '#',
      megaMenuColumns: hasChildren ? (columns as 1 | 2 | 3) : undefined,
      submenu: hasChildren 
        ? children.map(child => {
            const Icon = getIcon(child.icon);
            return {
              label: getMenuLabel(child, lang),
              href: child.url || '#',
              icon: Icon || Building2,
            };
          })
        : undefined,
    };
  });
  
  console.log('✅ Navegação construída:', navigation.map(n => n.label));
  
  return navigation;
};

// Fallback menu quando não há dados da API (baseado na resposta da API)
const FALLBACK_MENU: NavItem[] = [
  { label: "Sobre nós", href: "/about" },
  { label: "Exploração", href: "/exploration" },
  { label: "Oportunidades", href: "/opportunities" },
  { label: "Media", href: "/media" },
  { label: "Responsabilidades", href: "/regulation" },
  { label: "Dados de E&P", href: "/ep-data" },
  { label: "Produção", href: "/production" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpenSubmenu, setMobileOpenSubmenu] = useState<string | null>(null);
  const { t, i18n } = useTranslation();
  const { settings } = useSiteSettings();
  
  const isEn = i18n.language === 'en';

  // CORRIGIDO: Buscar todos os menus (sem filtrar por group na query)
  // Vamos buscar todos e filtrar no cliente
  const { data: menusResponse, isLoading } = useQuery({
    queryKey: ['main-menu-items', isEn],
    queryFn: async () => {
      // Buscar todos os menus ativos (sem filtro de group)
      const response = await api.get<MenusResponse>('/cms/menus', {
        params: { page: 1, pageSize: 100, IsActive: true }
      });
      console.log('📦 Resposta da API de menus:', response.data);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const allMenuItems = menusResponse?.items || [];
  
  // Construir navegação a partir dos dados da API
  let navigation: NavItem[] = FALLBACK_MENU;
  
  if (allMenuItems.length > 0) {
    const builtMenu = buildMenuHierarchy(allMenuItems, isEn);
    if (builtMenu.length > 0) {
      navigation = builtMenu;
    }
  }

  const logoWhite = settings?.logo?.dark || logoWhiteStatic;
  const logoRed = settings?.logo?.light || logoRedStatic;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getItemKey = (item: NavItem, index: number) => item.label || item.nameKey || `nav-${index}`;
  const getItemLabel = (item: NavItem) => {
    if (item.label) return item.label;
    if (item.nameKey) return t(item.nameKey);
    return "";
  };

  // Fechar dropdown ao clicar fora (efeito global)
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdown(null);
    };
    if (openDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdown]);

  // Loading state
  if (isLoading) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-background shadow-md py-3">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="h-10 md:h-14 w-24 md:w-32 bg-muted animate-pulse rounded" />
            <div className="hidden lg:flex items-center gap-4">
              <div className="w-20 h-8 bg-muted animate-pulse rounded" />
              <div className="w-20 h-8 bg-muted animate-pulse rounded" />
              <div className="w-20 h-8 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled ? "bg-background/95 backdrop-blur-md shadow-md py-3" : "bg-transparent py-4 md:py-6 lg:py-8"
      )}
    >
      <div className="container mx-auto px-6 lg:px-8">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="relative z-10">
            <motion.img
              src={isScrolled ? logoRed : logoWhite}
              alt="ANPG - Agência Nacional de Petróleo, Gás e Biocombustíveis"
              className="h-10 md:h-14 lg:h-16 w-auto transition-all duration-300"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navigation.map((item, index) => {
              const key = getItemKey(item, index);
              const label = getItemLabel(item);
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="relative"
                  onMouseEnter={() => hasSubmenu && setOpenDropdown(key)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors rounded-sm",
                      isScrolled
                        ? "text-foreground hover:text-primary hover:bg-secondary"
                        : "text-primary-foreground hover:text-primary-foreground/80 hover:bg-primary-foreground/10",
                      openDropdown === key && (isScrolled ? "text-primary" : "text-primary")
                    )}
                  >
                    {label}
                    {hasSubmenu && (
                      <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", openDropdown === key && "rotate-180")} />
                    )}
                  </Link>

                  <AnimatePresence>
                    {hasSubmenu && openDropdown === key && item.submenu && (
                      <MegaMenu
                        items={item.submenu.map((sub) => ({
                          nameKey: sub.nameKey || "",
                          label: sub.label,
                          descriptionKey: sub.descriptionKey || "",
                          description: sub.description,
                          href: sub.href,
                          icon: sub.icon,
                        })) as MegaMenuItem[]}
                        columns={item.megaMenuColumns || 2}
                        onItemClick={() => setOpenDropdown(null)}
                      />
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Language Toggle */}
          <motion.div 
            className="hidden lg:flex items-center gap-4" 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.5 }}
          >
            <LanguageToggle isScrolled={isScrolled} />
          </motion.div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-3">
            <LanguageToggle isScrolled={isScrolled} />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                "p-2 rounded-sm transition-colors",
                isScrolled 
                  ? "text-foreground hover:bg-secondary" 
                  : "text-primary-foreground hover:bg-primary-foreground/10"
              )}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-background border-t border-border max-h-[80vh] overflow-y-auto"
          >
            <div className="container mx-auto px-6 py-6">
              <nav className="flex flex-col gap-2">
                {navigation.map((item, index) => {
                  const key = getItemKey(item, index);
                  const label = getItemLabel(item);
                  const hasSubmenu = item.submenu && item.submenu.length > 0;
                  
                  return (
                    <div key={key}>
                      {hasSubmenu ? (
                        <>
                          <button
                            onClick={() => setMobileOpenSubmenu(mobileOpenSubmenu === key ? null : key)}
                            className="w-full flex items-center justify-between text-foreground font-medium py-3 hover:text-primary transition-colors"
                          >
                            {label}
                            <ChevronDown 
                              className={cn(
                                "w-5 h-5 transition-transform duration-200", 
                                mobileOpenSubmenu === key && "rotate-180"
                              )} 
                            />
                          </button>
                          <AnimatePresence>
                            {mobileOpenSubmenu === key && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="pl-2 border-l-2 border-primary/30 ml-2"
                              >
                                {item.submenu?.map((subItem, subIndex) => {
                                  const Icon = subItem.icon;
                                  const subLabel = subItem.label || (subItem.nameKey ? t(subItem.nameKey) : "");
                                  return (
                                    <Link
                                      key={subIndex}
                                      to={subItem.href}
                                      className="flex items-start gap-3 py-3 hover:bg-secondary rounded-md px-2 transition-colors"
                                      onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                      <div className="flex-shrink-0 w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                                        <Icon className="w-4 h-4 text-primary" />
                                      </div>
                                      <span className="block text-sm font-medium text-foreground">
                                        {subLabel}
                                      </span>
                                    </Link>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      ) : (
                        <Link
                          to={item.href}
                          className="block text-foreground font-medium py-3 hover:text-primary transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {label}
                        </Link>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}