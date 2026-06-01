import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  MapPin,
  Phone,
  Mail,
  Linkedin,
  Twitter,
  Youtube,
  Facebook,
  Instagram
} from "lucide-react";
import logoWhite from "@/assets/logo-white.svg";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useMenuItemsByGroup } from "@/hooks/useCMSData";
import { useApiPageByKey } from "@/hooks/pages/useApiPages";

function safeParseJson(raw: any): any {
  if (!raw) return null;
  if (typeof raw === 'object') return raw;
  try { return JSON.parse(raw); } catch { return null; }
}

export function Footer() {
  const { t, i18n } = useTranslation();
  const { settings } = useSiteSettings();
  const isEn = i18n.language === "en";
  const lang = isEn ? 'en' : 'pt';

  // Dados do backend (página /footer)
  const footerPage = useApiPageByKey('footer');
  const apiData: Record<string, string> | null = footerPage
    ? safeParseJson(footerPage.content?.[lang as 'pt' | 'en'])
    : null;

  // Buscar menus para o rodapé - grupo "footer"
  const { data: footerMenus } = useMenuItemsByGroup("footer", isEn);

  // Organizar menus por parentId para criar hierarquia
  const organizeFooterMenus = () => {
    if (!footerMenus || footerMenus.length === 0) return { institutional: [], investors: [], resources: [], services: [] };

    const topLevelItems = footerMenus.filter(item => !item.parentId);
    const result: { [key: string]: any[] } = {
      institutional: [],
      investors: [],
      resources: [],
      services: []
    };

    topLevelItems.forEach(parent => {
      const children = footerMenus.filter(item => item.parentId === parent.id);
      const parentLabel = parent.label.toLowerCase();

      if (parentLabel.includes('institucional') || parentLabel.includes('institutional')) {
        result.institutional = children;
      } else if (parentLabel.includes('investidor') || parentLabel.includes('investor')) {
        result.investors = children;
      } else if (parentLabel.includes('recurso') || parentLabel.includes('resource')) {
        result.resources = children;
      } else if (parentLabel.includes('serviço') || parentLabel.includes('service')) {
        result.services = children;
      }
    });

    return result;
  };

  const footerSections = organizeFooterMenus();

  // Prioridade: backend API → SiteSettings → fallback estático
  const logoUrl = apiData?.logoLight || apiData?.logoDark || settings.logo?.dark || logoWhite;
  const contact = {
    address: apiData?.address || settings.contact?.address || "Edifício Torres do Carmo - Torre 2\nAv. de Portugal, Rua Lopes de Lima\nMunicípio de Luanda, Angola",
    phone:   apiData?.phone   || settings.contact?.phone   || "+244 226 428 000",
    email:   apiData?.email   || settings.contact?.email   || "info@anpg.co.ao",
    hours:   apiData?.hours   || settings.contact?.hours   || "",
  };
  const social = {
    linkedin:  apiData?.linkedin  || settings.social?.linkedin  || "https://linkedin.com",
    twitter:   apiData?.twitter   || settings.social?.twitter   || "https://twitter.com",
    youtube:   apiData?.youtube   || settings.social?.youtube   || "https://youtube.com",
    facebook:  apiData?.facebook  || settings.social?.facebook  || "",
    instagram: apiData?.instagram || settings.social?.instagram || "",
  };
  const footerText = {
    copyright: apiData?.copyright  || settings.footer?.copyright || "",
    tagline:   apiData?.description || settings.footer?.tagline  || "",
  };

  return (
    <footer className="bg-foreground text-pearl">
      {/* Main Footer */}
      <div className="container mx-auto px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/">
              <img src={logoUrl} alt="ANPG" className="h-24 w-auto mb-6" />
            </Link>
            <p className="text-pearl/70 text-sm leading-relaxed mb-8 max-w-xs">
              {footerText.tagline || t("footer.description")}
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                <span className="text-pearl/70 whitespace-pre-line">{contact.address}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-pearl/70">{contact.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-pearl/70">{contact.email}</span>
              </div>
            </div>
          </div>

          {/* Institutional Column */}
          <div>
            <h4 className="footer-heading text-primary-foreground mb-4">
              {t("footer.institutional")}
            </h4>
            {footerSections.institutional.length > 0 ? (
              <ul className="space-y-3">
                {footerSections.institutional.map((item) => (
                  <li key={item.id}>
                    <Link to={item.url || "#"} className="footer-link text-pearl/70 hover:text-primary transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-3">
                <li><Link to="/about" className="footer-link text-pearl/70 hover:text-primary transition-colors">{t("footer.aboutUs")}</Link></li>
                <li><Link to="/about/anpg" className="footer-link text-pearl/70 hover:text-primary transition-colors">{t("footer.anpg")}</Link></li>
                <li><Link to="/about/social-responsibility" className="footer-link text-pearl/70 hover:text-primary transition-colors">{t("footer.socialResponsibility")}</Link></li>
                <li><Link to="/about/history" className="footer-link text-pearl/70 hover:text-primary transition-colors">{t("footer.history")}</Link></li>
              </ul>
            )}
          </div>

          {/* Investors Column */}
          <div>
            <h4 className="footer-heading text-primary-foreground mb-4">
              {t("footer.investors")}
            </h4>
            {footerSections.investors.length > 0 ? (
              <ul className="space-y-3">
                {footerSections.investors.map((item) => (
                  <li key={item.id}>
                    <Link to={item.url || "#"} className="footer-link text-pearl/70 hover:text-primary transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-3">
                <li><Link to="/opportunities" className="footer-link text-pearl/70 hover:text-primary transition-colors">{t("footer.opportunities")}</Link></li>
                <li><Link to="/investor-portal" className="footer-link text-pearl/70 hover:text-primary transition-colors">{t("footer.investorPortal")}</Link></li>
                <li><Link to="/ep-data/maps" className="footer-link text-pearl/70 hover:text-primary transition-colors">{t("footer.availableBlocks")}</Link></li>
                <li><Link to="/faq" className="footer-link text-pearl/70 hover:text-primary transition-colors">{t("footer.faq")}</Link></li>
                <li><Link to="/contacts" className="footer-link text-pearl/70 hover:text-primary transition-colors">{t("footer.contacts")}</Link></li>
              </ul>
            )}
          </div>

          {/* Resources Column */}
          <div>
            <h4 className="footer-heading text-primary-foreground mb-4">
              {t("footer.resources")}
            </h4>
            {footerSections.resources.length > 0 ? (
              <ul className="space-y-3">
                {footerSections.resources.map((item) => (
                  <li key={item.id}>
                    <Link to={item.url || "#"} className="footer-link text-pearl/70 hover:text-primary transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-3">
                <li><Link to="/ep-data" className="footer-link text-pearl/70 hover:text-primary transition-colors">{t("footer.epData")}</Link></li>
                <li><Link to="/production" className="footer-link text-pearl/70 hover:text-primary transition-colors">{t("footer.production")}</Link></li>
                <li><Link to="/exploration" className="footer-link text-pearl/70 hover:text-primary transition-colors">{t("footer.exploration")}</Link></li>
                <li><Link to="/media" className="footer-link text-pearl/70 hover:text-primary transition-colors">{t("footer.media")}</Link></li>
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-pearl/10">
        <div className="container mx-auto px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-xs text-pearl/50">
              <span>{footerText.copyright || t("footer.copyright")}</span>
              <div className="flex items-center gap-4">
                <Link to="/privacy" className="hover:text-pearl transition-colors">
                  {t("footer.privacy")}
                </Link>
                <Link to="/terms" className="hover:text-pearl transition-colors">
                  {t("footer.terms")}
                </Link>
                <Link to="/admin/login" className="hover:text-primary transition-colors">
                  Backoffice
                </Link>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {social.linkedin && (
                <a
                  href={social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pearl/50 hover:text-primary transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {social.twitter && (
                <a
                  href={social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pearl/50 hover:text-primary transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {social.youtube && (
                <a
                  href={social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pearl/50 hover:text-primary transition-colors"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              )}
              {social.facebook && (
                <a
                  href={social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pearl/50 hover:text-primary transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {social.instagram && (
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pearl/50 hover:text-primary transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}