import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface LanguageToggleProps {
  isScrolled?: boolean;
}

export function LanguageToggle({ isScrolled = false }: LanguageToggleProps) {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "pt" ? "en" : "pt";
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-sm text-sm font-medium transition-all duration-300",
        isScrolled
          ? "text-foreground hover:bg-secondary border border-border"
          : "text-primary-foreground hover:bg-primary-foreground/10 border border-primary-foreground/20"
      )}
      aria-label="Toggle language"
    >
      <Globe className="w-4 h-4" />
      <span className="uppercase">{i18n.language === "pt" ? "EN" : "PT"}</span>
    </button>
  );
}
