import { useEffect, useState } from 'react';
import i18n from '@/i18n';
import { STATIC_PAGE_DATA } from '@/data/staticPageData';
import { useAllApiPages, getBackendUrl, findApiPage } from './useApiPages';

function resolveLanguage(raw: any): any {
  if (!raw) return raw;
  const hasLangKeys = raw.pt !== undefined || raw.en !== undefined;
  if (!hasLangKeys) return raw;
  const lang = i18n.language === 'en' ? 'en' : 'pt';
  return raw[lang] ?? raw.pt ?? raw;
}

function safeParseJson(str: string): any {
  try { return typeof str === 'string' ? JSON.parse(str) : str; } catch { return null; }
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

  const { data: allPages } = useAllApiPages();

  const backendUrl = getBackendUrl(pageKey);
  const apiPage = allPages ? findApiPage(allPages, pageKey, backendUrl) : null;

  let apiRaw: any = null;
  if (apiPage?.content) {
    const pt = safeParseJson(apiPage.content.pt);
    const en = safeParseJson(apiPage.content.en);
    if (pt && en) apiRaw = { pt, en };
    else if (pt) apiRaw = pt;
  }

  const rawData = apiRaw ?? STATIC_PAGE_DATA[pageKey] ?? null;

  // lang em estado força re-render quando o idioma muda
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const data = lang ? resolveLanguage(rawData) : resolveLanguage(rawData);

  return { data, rawData, isLoading: false, error: null };
}
