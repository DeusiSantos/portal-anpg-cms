import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '@/service/api';

interface LogoSettings {
  light: string;
  dark: string;
}

interface ContactSettings {
  address: string;
  phone: string;
  email: string;
  hours: string;
}

interface SocialSettings {
  facebook: string;
  linkedin: string;
  twitter: string;
  youtube: string;
  instagram: string;
}

interface FooterSettings {
  copyright: string;
  tagline: string;
}

export interface SiteSettings {
  logo: LogoSettings;
  contact: ContactSettings;
  social: SocialSettings;
  footer: FooterSettings;
}

interface SiteSettingsContextType {
  settings: SiteSettings;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export const defaultSettings: SiteSettings = {
  logo: { light: '', dark: '' },
  contact: {
    address: 'Edifício Torres do Carmo - Torre 2, Avenida de Portugal, Rua Lopes de Lima, Município de Luanda, Angola',
    phone: '+244 226 428 000',
    email: 'info@anpg.co.ao',
    hours: 'Segunda a Sexta, 08:00 - 17:00',
  },
  social: { facebook: '', linkedin: '', twitter: '', youtube: '', instagram: '' },
  footer: {
    copyright: '© 2026 ANPG - Agência Nacional de Petróleo, Gás e Biocombustíveis. Todos os direitos reservados.',
    tagline: 'Regulando o sector petrolífero angolano com transparência e excelência',
  },
};

const STORAGE_KEY = 'site_settings';

function mergeSettings(partial: Partial<SiteSettings>): SiteSettings {
  return {
    logo: { ...defaultSettings.logo, ...(partial.logo || {}) },
    contact: { ...defaultSettings.contact, ...(partial.contact || {}) },
    social: { ...defaultSettings.social, ...(partial.social || {}) },
    footer: { ...defaultSettings.footer, ...(partial.footer || {}) },
  };
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: defaultSettings,
  isLoading: true,
  refetch: async () => {},
});

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    // 1. localStorage override (saved by admin)
    try {
      const local = localStorage.getItem(STORAGE_KEY);
      if (local) {
        setSettings(mergeSettings(JSON.parse(local)));
        setIsLoading(false);
        return;
      }
    } catch {}

    // 2. API endpoint (optional, silent fail)
    try {
      const res = await api.get('/settings');
      if (res.data && typeof res.data === 'object') {
        setSettings(mergeSettings(res.data));
        setIsLoading(false);
        return;
      }
    } catch {}

    // 3. Static defaults
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, isLoading, refetch: fetchSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
}

/** Guardar secção de settings e sincronizar contexto */
export function saveSettings(section: keyof SiteSettings, value: any): void {
  try {
    const existing: Partial<SiteSettings> = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const updated = { ...existing, [section]: value };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Tentativa silenciosa de sincronizar com a API
    api.patch('/settings', updated).catch(() => {});
  } catch {}
}
