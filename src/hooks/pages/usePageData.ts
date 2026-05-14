import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import i18n from '@/i18n';
import { STATIC_PAGE_DATA } from '@/data/staticPageData';
import { supabase } from '@/integrations/supabase/client';

function resolveLanguage(raw: any): any {
  if (!raw) return raw;
  const hasLangKeys = raw.pt !== undefined || raw.en !== undefined;
  if (!hasLangKeys) return raw;
  const lang = i18n.language === 'en' ? 'en' : 'pt';
  return raw[lang] ?? raw.pt ?? raw;
}

interface UsePageDataReturn {
  data: any;
  rawData: any;
  isLoading: boolean;
  error: string | null;
}

export function usePageData(pageKey: string): UsePageDataReturn {
  const [lang, setLang] = useState(i18n.language);

  useEffect(() => {
    const onLangChange = (lng: string) => setLang(lng);
    i18n.on('languageChanged', onLangChange);
    return () => { i18n.off('languageChanged', onLangChange); };
  }, []);

  const { data: supabaseRow } = useQuery({
    queryKey: ['page-content', pageKey],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('page_content')
        .select('data')
        .eq('page_key', pageKey)
        .maybeSingle();
      if (error || !data) return null;
      return data.data as any;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  // Supabase tem prioridade; fallback para JSON estático
  const rawData = supabaseRow ?? STATIC_PAGE_DATA[pageKey] ?? null;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const data = lang ? resolveLanguage(rawData) : resolveLanguage(rawData);

  return { data, rawData, isLoading: false, error: null };
}
