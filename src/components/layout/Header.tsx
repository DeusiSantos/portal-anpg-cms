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
import { useMenuItems, type CMSMenuItem } from "@/hooks/useCMSData";
import { getIcon } from "@/lib/iconMap";

// Hardcoded fallback navigation (used while CMS data loads)
import { LucideIcon } from "lucide-react";

interface NavItem {
  nameKey?: string;
  label?: string;
  href: string;
  submenu?: { nameKey?: string; label?: string; descriptionKey?: string; description?: string; href: string; icon: LucideIcon }[];
  megaMenuColumns?: 1 | 2 | 3;
}

function cmsToNavItems(cmsItems: CMSMenuItem[]): NavItem[] {
  return cmsItems.map((item) => {
    const hasChildren = item.children.length > 0;
    const columns = item.children.length >= 5 ? 3 : item.children.length >= 3 ? 2 : 1;

    return {
      label: item.label,
      href: item.url || "#",
      megaMenuColumns: hasChildren ? (columns as 1 | 2 | 3) : undefined,
      submenu: hasChildren
        ? item.children.map((child) => ({
            label: child.label,
            description: child.description || "",
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
  const { t } = useTranslation();
  const { settings } = useSiteSettings();
  const { data: cmsMenuItems } = useMenuItems();

  const logoWhite = settings.logo?.dark || logoWhiteStatic;
  const logoRed = settings.logo?.light || logoRedStatic;

  // Convert CMS menu items to nav items
  const navigation: NavItem[] = cmsMenuItems ? cmsToNavItems(cmsMenuItems) : [];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getItemKey = (item: NavItem) => item.label || item.nameKey || item.href;
  const getItemLabel = (item: NavItem) => item.label || (item.nameKey ? t(item.nameKey) : "");

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled ? "bg-background/95 backdrop-blur-md shadow-md py-4" : "bg-transparent py-8"
      )}
    >
      <div className="container mx-auto px-6 lg:px-8">
        <nav className="flex items-center justify-between">
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
          <motion.div className="hidden lg:flex items-center gap-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <LanguageToggle isScrolled={isScrolled} />
          </motion.div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-3">
            <LanguageToggle isScrolled={isScrolled} />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn("p-2 rounded-sm transition-colors", isScrolled ? "text-foreground hover:bg-secondary" : "text-primary-foreground hover:bg-primary-foreground/10")}
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
                            <ChevronDown className={cn("w-5 h-5 transition-transform duration-200", mobileOpenSubmenu === key && "rotate-180")} />
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
                                      <span className="block text-sm font-medium text-foreground">{subLabel}</span>
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
