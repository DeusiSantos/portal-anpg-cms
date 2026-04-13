import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

interface SiteSettings {
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

const defaultSettings: SiteSettings = {
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

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: defaultSettings,
  isLoading: true,
  refetch: async () => {},
});

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value');

      if (error) throw error;

      if (data) {
        const newSettings = { ...defaultSettings };
        data.forEach((row) => {
          const key = row.setting_key as keyof SiteSettings;
          if (key in newSettings) {
            newSettings[key] = row.setting_value as any;
          }
        });
        setSettings(newSettings);
      }
    } catch (error) {
      console.error('Error fetching site settings:', error);
    } finally {
      setIsLoading(false);
    }
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
