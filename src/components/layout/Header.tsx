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

interface LucideIcon {
  // Tipo simplificado para o ícone
}

// Interface do item do menu baseada na API retornada
interface MenuItemFromAPI {
  id: string;
  labelPt: string;
  labelEn: string;
  url: string;
  icon: string;
  group: string;
  father: string;
  order: number;
  visibleStatus: 'Yes' | 'No';
  newTabStatus: 'Active' | 'Inactive';
}

// Interface da resposta da API
interface ApiMenuResponse {
  menuItems: {
    pageIndex: number;
    pageSize: number;
    count: number;
    data: MenuItemFromAPI[];
  };
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

// Fallback menu quando não há dados da API
const FALLBACK_MENU: NavItem[] = [
  { label: "Institucional", href: "/about" },
  { label: "Exploração", href: "/exploration" },
  { label: "Oportunidades", href: "/opportunities" },
  { label: "Media", href: "/media" },
  { label: "Contactos", href: "/contacts" },
];

function buildMenuHierarchy(items: MenuItemFromAPI[]): MenuItemFromAPI[] {
  if (!items || items.length === 0) return [];
  
  const itemsMap = new Map<string, MenuItemFromAPI>();
  const rootItems: MenuItemFromAPI[] = [];
  
  // Primeiro, mapear todos os itens por ID
  items.forEach(item => {
    itemsMap.set(item.id, { ...item });
  });
  
  // Construir hierarquia
  items.forEach(item => {
    if (!item.father || item.father === '') {
      rootItems.push(item);
    }
  });
  
  return rootItems;
}

function getChildren(itemId: string, allItems: MenuItemFromAPI[]): MenuItemFromAPI[] {
  return allItems.filter(item => item.father === itemId);
}

function cmsToNavItems(cmsItems: MenuItemFromAPI[]): NavItem[] {
  if (!cmsItems || cmsItems.length === 0) return FALLBACK_MENU;
  
  // Filtrar apenas itens visíveis e de grupo 'main' (principal)
  const visibleItems = cmsItems.filter(item => 
    item.visibleStatus === 'Yes' && item.group === 'main'
  );
  
  if (visibleItems.length === 0) return FALLBACK_MENU;
  
  // Obter itens de topo (sem pai)
  const topLevelItems = visibleItems.filter(item => !item.father || item.father === '');
  
  // Ordenar por ordem
  const sortedItems = [...topLevelItems].sort((a, b) => a.order - b.order);
  
  return sortedItems.map((item) => {
    // Buscar filhos deste item
    const children = visibleItems.filter(child => child.father === item.id);
    const hasChildren = children.length > 0;
    
    // Determinar número de colunas baseado na quantidade de filhos
    const columns = hasChildren 
      ? (children.length >= 5 ? 3 : children.length >= 3 ? 2 : 1)
      : 1;
    
    return {
      label: item.labelPt, // Usar labelPt como padrão
      href: item.url || "#",
      megaMenuColumns: hasChildren ? (columns as 1 | 2 | 3) : undefined,
      submenu: hasChildren
        ? children
            .sort((a, b) => a.order - b.order)
            .map((child) => ({
              label: child.labelPt,
              description: child.labelEn || "",
              href: child.url || "#",
              icon: getIcon(child.icon) || Building2,
            }))
        : undefined,
    };
  });
}

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpenSubmenu, setMobileOpenSubmenu] = useState<string | null>(null);
  const { t, i18n } = useTranslation();
  const { settings } = useSiteSettings();
  
  // Buscar menus da API
  const { data: apiResponse, isLoading } = useQuery({
    queryKey: ['header-menu-items'],
    queryFn: async () => {
      const { data } = await api.get<ApiMenuResponse>('/menus');
      console.log('Menu API Response:', data);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
  
  // Extrair os items da resposta da API
  const menuItems = apiResponse?.menuItems?.data || [];
  
  // Filtrar itens por visibilidade e grupo principal, e construir hierarquia
  const visibleMenuItems = menuItems.filter(item => 
    item.visibleStatus === 'Yes' && item.group === 'main'
  );
  
  // Converter para formato de navegação
  let navigation: NavItem[] = FALLBACK_MENU;
  
  if (visibleMenuItems.length > 0) {
    navigation = cmsToNavItems(visibleMenuItems);
  }

  const logoWhite = settings?.logo?.dark || logoWhiteStatic;
  const logoRed = settings?.logo?.light || logoRedStatic;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getItemKey = (item: NavItem) => item.label || item.nameKey || item.href;
  const getItemLabel = (item: NavItem) => {
    // Se tiver label, usa direto
    if (item.label) return item.label;
    // Se tiver nameKey, traduz
    if (item.nameKey) return t(item.nameKey);
    return "";
  };

  // Loading state
  if (isLoading) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-background shadow-md py-4">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="h-16 w-32 bg-muted animate-pulse rounded" />
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
        isScrolled ? "bg-background/95 backdrop-blur-md shadow-md py-4" : "bg-transparent py-8"
      )}
    >
      <div className="container mx-auto px-6 lg:px-8">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="relative z-10">
            <motion.img
              src={isScrolled ? logoRed : logoWhite}
              alt="ANPG - Agência Nacional de Petróleo, Gás e Biocombustíveis"
              className="h-16 md:h-20 w-auto transition-all duration-300"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navigation.map((item, index) => {
              const key = getItemKey(item);
              const label = getItemLabel(item);
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="relative"
                  onMouseEnter={() => item.submenu && setOpenDropdown(key)}
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
                    {item.submenu && (
                      <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", openDropdown === key && "rotate-180")} />
                    )}
                  </Link>

                  <AnimatePresence>
                    {item.submenu && openDropdown === key && (
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
                {navigation.map((item) => {
                  const key = getItemKey(item);
                  const label = getItemLabel(item);
                  return (
                    <div key={key}>
                      {item.submenu ? (
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
                                {item.submenu.map((subItem) => {
                                  const Icon = subItem.icon;
                                  const subLabel = subItem.label || (subItem.nameKey ? t(subItem.nameKey) : "");
                                  return (
                                    <Link
                                      key={subItem.href}
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