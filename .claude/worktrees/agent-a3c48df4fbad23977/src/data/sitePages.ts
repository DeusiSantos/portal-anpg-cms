export interface SitePageConfig {
  pageKey: string;
  label: string;
  labelEn: string;
  url: string;
  category: string;
  sections: string[];
}

export const SITE_PAGES: SitePageConfig[] = [
  // Institucional
  { pageKey: 'home', label: 'Homepage', labelEn: 'Homepage', url: '/', category: 'Institucional', sections: ['hero', 'stats', 'services', 'about', 'investment', 'cta', 'news'] },
  { pageKey: 'about', label: 'Sobre Nós', labelEn: 'About Us', url: '/about', category: 'Institucional', sections: ['intro', 'mission', 'values'] },
  { pageKey: 'anpg', label: 'A ANPG', labelEn: 'ANPG', url: '/about/anpg', category: 'Institucional', sections: ['intro', 'mission', 'social-responsibility'] },
  { pageKey: 'history', label: 'Nossa História', labelEn: 'Our History', url: '/about/history', category: 'Institucional', sections: ['intro'] },
  { pageKey: 'social-responsibility', label: 'Responsabilidade Social', labelEn: 'Social Responsibility', url: '/about/social-responsibility', category: 'Institucional', sections: ['intro', 'areas'] },
  { pageKey: 'contacts', label: 'Contactos', labelEn: 'Contacts', url: '/contacts', category: 'Institucional', sections: ['intro'] },
  { pageKey: 'faq', label: 'FAQ', labelEn: 'FAQ', url: '/faq', category: 'Institucional', sections: [] },
  { pageKey: 'whistleblower', label: 'Canal de Denúncias', labelEn: 'Whistleblower', url: '/whistleblower', category: 'Institucional', sections: ['intro', 'how-it-works'] },
  { pageKey: 'privacy', label: 'Privacidade', labelEn: 'Privacy', url: '/privacy', category: 'Institucional', sections: ['intro'] },
  { pageKey: 'terms', label: 'Termos de Uso', labelEn: 'Terms of Use', url: '/terms', category: 'Institucional', sections: ['intro'] },

  // Regulação
  { pageKey: 'regulation', label: 'Regulação', labelEn: 'Regulation', url: '/regulation', category: 'Regulação', sections: ['intro', 'areas'] },
  { pageKey: 'licensing', label: 'Licenciamento', labelEn: 'Licensing', url: '/regulation/licensing', category: 'Regulação', sections: ['intro', 'process'] },
  { pageKey: 'oversight', label: 'Fiscalização', labelEn: 'Oversight', url: '/regulation/oversight', category: 'Regulação', sections: ['intro', 'areas'] },
  { pageKey: 'tenders', label: 'Licitações', labelEn: 'Tenders', url: '/regulation/tenders', category: 'Regulação', sections: ['intro'] },

  // Exploração
  { pageKey: 'exploration', label: 'Exploração', labelEn: 'Exploration', url: '/exploration', category: 'Exploração & Produção', sections: ['intro', 'highlights'] },
  { pageKey: 'seismic-campaigns', label: 'Campanhas Sísmicas', labelEn: 'Seismic Campaigns', url: '/exploration/seismic-campaigns', category: 'Exploração & Produção', sections: ['intro'] },
  { pageKey: 'processing', label: 'Processamento', labelEn: 'Processing', url: '/exploration/processing', category: 'Exploração & Produção', sections: ['intro'] },
  { pageKey: 'new-areas', label: 'Novas Áreas', labelEn: 'New Areas', url: '/exploration/new-areas', category: 'Exploração & Produção', sections: ['intro'] },

  // Produção
  { pageKey: 'production', label: 'Produção', labelEn: 'Production', url: '/production', category: 'Exploração & Produção', sections: ['intro', 'stats'] },
  { pageKey: 'production-history', label: 'Histórico de Produção', labelEn: 'Production History', url: '/production/history', category: 'Exploração & Produção', sections: ['intro'] },

  // Oportunidades
  { pageKey: 'opportunities', label: 'Oportunidades', labelEn: 'Opportunities', url: '/opportunities', category: 'Oportunidades', sections: ['intro', 'areas'] },
  { pageKey: 'tender-2025', label: 'Concurso 2025', labelEn: 'Tender 2025', url: '/opportunities/tender-2025', category: 'Oportunidades', sections: ['intro', 'timeline', 'blocks'] },
  { pageKey: 'permanent-offer', label: 'Oferta Permanente', labelEn: 'Permanent Offer', url: '/opportunities/permanent-offer', category: 'Oportunidades', sections: ['intro'] },
  { pageKey: 'gas', label: 'Gás Natural', labelEn: 'Natural Gas', url: '/opportunities/gas', category: 'Oportunidades', sections: ['intro', 'highlights'] },
  { pageKey: 'energy-integration', label: 'Biocombustíveis', labelEn: 'Biofuels', url: '/opportunities/energy-integration', category: 'Oportunidades', sections: ['intro'] },
  { pageKey: 'local-content', label: 'Conteúdo Local', labelEn: 'Local Content', url: '/local-content', category: 'Oportunidades', sections: ['intro', 'areas'] },

  // Media
  { pageKey: 'media', label: 'Media', labelEn: 'Media', url: '/media', category: 'Media & Dados', sections: [] },
  { pageKey: 'events', label: 'Eventos', labelEn: 'Events', url: '/media/events', category: 'Media & Dados', sections: [] },

  // Dados
  { pageKey: 'sustainability', label: 'Sustentabilidade', labelEn: 'Sustainability', url: '/sustainability', category: 'Media & Dados', sections: ['intro', 'pillars'] },
  { pageKey: 'ep-data', label: 'Dados de E&P', labelEn: 'E&P Data', url: '/ep-data', category: 'Media & Dados', sections: ['intro'] },
  { pageKey: 'data', label: 'Dados & Analytics', labelEn: 'Data & Analytics', url: '/data', category: 'Media & Dados', sections: ['intro'] },
];

export const SITE_PAGE_CATEGORIES = [
  'Institucional',
  'Regulação',
  'Exploração & Produção',
  'Oportunidades',
  'Media & Dados',
];
