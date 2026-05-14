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
import { useMenuItems } from "@/hooks/useCMSData";

export function Footer() {
  const { t } = useTranslation();
  const { settings } = useSiteSettings();
  
  // Buscar menus para o rodapé - grupos específicos da nova API
  const { data: footerInstitutional } = useMenuItems("footer-institutional");
  const { data: footerInvestors } = useMenuItems("footer-investors");

  // Get dynamic settings with fallbacks
  const logoUrl = settings.logo?.dark || logoWhite;
  const contact = {
    address: settings.contact?.address || "Edifício Torres do Carmo - Torre 2\nAv. de Portugal, Rua Lopes de Lima\nMunicípio de Luanda, Angola",
    phone: settings.contact?.phone || "+244 226 428 000",
    email: settings.contact?.email || "info@anpg.co.ao"
  };
  const social = {
    linkedin: settings.social?.linkedin || "https://linkedin.com",
    twitter: settings.social?.twitter || "https://twitter.com",
    youtube: settings.social?.youtube || "https://youtube.com",
    facebook: settings.social?.facebook || "",
    instagram: settings.social?.instagram || ""
  };
  const footerText = {
    copyright: settings.footer?.copyright || "",
    tagline: settings.footer?.tagline || ""
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

          {/* Institutional Column - Dinâmico do CMS */}
          {footerInstitutional && footerInstitutional.length > 0 && (
            <div>
              <h4 className="footer-heading text-primary-foreground mb-4">
                {t("footer.institutional")}
              </h4>
              <ul className="space-y-3">
                {footerInstitutional.map((item) => (
                  <li key={item.id}>
                    <Link to={item.url || "#"} className="footer-link text-pearl/70 hover:text-primary transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Investors Column - Dinâmico do CMS */}
          {footerInvestors && footerInvestors.length > 0 && (
            <div>
              <h4 className="footer-heading text-primary-foreground mb-4">
                {t("footer.investors")}
              </h4>
              <ul className="space-y-3">
                {footerInvestors.map((item) => (
                  <li key={item.id}>
                    <Link to={item.url || "#"} className="footer-link text-pearl/70 hover:text-primary transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Links úteis - Fallback caso não haja dados do CMS */}
          {(!footerInstitutional || footerInstitutional.length === 0) && (
            <div>
              <h4 className="footer-heading text-primary-foreground mb-4">
                {t("footer.institutional")}
              </h4>
              <ul className="space-y-3">
                <li><Link to="/about" className="footer-link text-pearl/70 hover:text-primary transition-colors">{t("footer.aboutUs")}</Link></li>
                <li><Link to="/about/anpg" className="footer-link text-pearl/70 hover:text-primary transition-colors">{t("footer.anpg")}</Link></li>
                <li><Link to="/about/social-responsibility" className="footer-link text-pearl/70 hover:text-primary transition-colors">{t("footer.socialResponsibility")}</Link></li>
                <li><Link to="/about/history" className="footer-link text-pearl/70 hover:text-primary transition-colors">{t("footer.history")}</Link></li>
              </ul>
            </div>
          )}

          {(!footerInvestors || footerInvestors.length === 0) && (
            <div>
              <h4 className="footer-heading text-primary-foreground mb-4">
                {t("footer.investors")}
              </h4>
              <ul className="space-y-3">
                <li><Link to="/opportunities" className="footer-link text-pearl/70 hover:text-primary transition-colors">{t("footer.opportunities")}</Link></li>
                <li><Link to="/investor-portal" className="footer-link text-pearl/70 hover:text-primary transition-colors">{t("footer.investorPortal")}</Link></li>
                <li><Link to="/ep-data/maps" className="footer-link text-pearl/70 hover:text-primary transition-colors">{t("footer.availableBlocks")}</Link></li>
                <li><Link to="/faq" className="footer-link text-pearl/70 hover:text-primary transition-colors">{t("footer.faq")}</Link></li>
                <li><Link to="/contacts" className="footer-link text-pearl/70 hover:text-primary transition-colors">{t("footer.contacts")}</Link></li>
              </ul>
            </div>
          )}
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