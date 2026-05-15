// src/data/pageSchemas.ts

export interface SitePageConfig {
  pageKey: string;
  label: string;
  labelEn: string;
  url: string;
  category: string;
  sections: string[];
}

// ==================== SCHEMAS DAS PÁGINAS ====================

export const PAGE_SCHEMAS: Record<string, any> = {
  // ==================== ABOUT ====================
  about: {
    // Estrutura PT/EN: cada campo existe dentro de pt: {} e en: {}
    pt: {
      type: 'object',
      group: 'pt',
      label: 'Português',
      properties: {
        title: { type: 'string', required: true, label: 'Título Principal' },
        titleHighlight: { type: 'string', label: 'Palavra Destacada' },
        subtitle: { type: 'string', label: 'Subtítulo' },
        description: { type: 'string', isLongText: true, label: 'Descrição SEO' },
        breadcrumbLabel: { type: 'string', label: 'Label do Breadcrumb' },
        content: {
          type: 'object',
          label: 'Conteúdo Principal',
          properties: {
            mission: { type: 'string', isLongText: true, label: 'Missão' },
            vision: { type: 'string', isLongText: true, label: 'Visão' },
            intro: { type: 'string', isLongText: true, label: 'Introdução' },
            role: { type: 'string', isLongText: true, label: 'Papel da ANPG' },
            pcaMessage: { type: 'string', isLongText: true, label: 'Mensagem do PCA' },
            pcaName: { type: 'string', label: 'Nome do PCA' },
            pcaTitle: { type: 'string', label: 'Título do PCA' },
          },
        },
        strategicObjectives: {
          type: 'object',
          label: 'Objectivos Estratégicos',
          properties: {
            label: { type: 'string', label: 'Label da Secção (ex: Estratégia)' },
            title: { type: 'string', label: 'Título da Secção' },
            items: {
              type: 'array',
              label: 'Itens dos Objectivos',
              items: {
                type: 'object',
                properties: {
                  key: { type: 'string', label: 'Chave (identificador)' },
                  label: { type: 'string', isLongText: true, label: 'Texto do Objectivo' },
                },
              },
            },
          },
        },
        values: {
          type: 'object',
          label: 'Valores (6 itens)',
          properties: {
            integrity: {
              type: 'object',
              label: 'Integridade',
              properties: {
                title: { type: 'string', label: 'Título' },
                description: { type: 'string', isLongText: true, label: 'Descrição' },
              },
            },
            transparency: {
              type: 'object',
              label: 'Transparência',
              properties: {
                title: { type: 'string', label: 'Título' },
                description: { type: 'string', isLongText: true, label: 'Descrição' },
              },
            },
            excellence: {
              type: 'object',
              label: 'Excelência',
              properties: {
                title: { type: 'string', label: 'Título' },
                description: { type: 'string', isLongText: true, label: 'Descrição' },
              },
            },
            sustainability: {
              type: 'object',
              label: 'Sustentabilidade',
              properties: {
                title: { type: 'string', label: 'Título' },
                description: { type: 'string', isLongText: true, label: 'Descrição' },
              },
            },
            innovation: {
              type: 'object',
              label: 'Inovação',
              properties: {
                title: { type: 'string', label: 'Título' },
                description: { type: 'string', isLongText: true, label: 'Descrição' },
              },
            },
            collaboration: {
              type: 'object',
              label: 'Colaboração',
              properties: {
                title: { type: 'string', label: 'Título' },
                description: { type: 'string', isLongText: true, label: 'Descrição' },
              },
            },
          },
        },
        cta: {
          type: 'object',
          label: 'Chamada para Ação (CTA)',
          properties: {
            title: { type: 'string', label: 'Título do CTA' },
            description: { type: 'string', isLongText: true, label: 'Descrição do CTA' },
            buttonPrimaryText: { type: 'string', label: 'Texto Botão Principal' },
            buttonPrimaryLink: { type: 'string', label: 'Link Botão Principal' },
            buttonSecondaryText: { type: 'string', label: 'Texto Botão Secundário' },
            buttonSecondaryLink: { type: 'string', label: 'Link Botão Secundário' },
          },
        },
      },
    },
    en: {
      type: 'object',
      group: 'en',
      label: 'English',
      properties: {
        title: { type: 'string', required: true, label: 'Title' },
        titleHighlight: { type: 'string', label: 'Highlighted Word' },
        subtitle: { type: 'string', label: 'Subtitle' },
        description: { type: 'string', isLongText: true, label: 'SEO Description' },
        breadcrumbLabel: { type: 'string', label: 'Breadcrumb Label' },
        content: {
          type: 'object',
          label: 'Main Content',
          properties: {
            mission: { type: 'string', isLongText: true, label: 'Mission' },
            vision: { type: 'string', isLongText: true, label: 'Vision' },
            intro: { type: 'string', isLongText: true, label: 'Introduction' },
            role: { type: 'string', isLongText: true, label: 'ANPG Role' },
            pcaMessage: { type: 'string', isLongText: true, label: 'Chairman Message' },
            pcaName: { type: 'string', label: 'Chairman Name' },
            pcaTitle: { type: 'string', label: 'Chairman Title' },
          },
        },
        strategicObjectives: {
          type: 'object',
          label: 'Strategic Objectives',
          properties: {
            label: { type: 'string', label: 'Section Label (ex: Strategy)' },
            title: { type: 'string', label: 'Section Title' },
            items: {
              type: 'array',
              label: 'Objective Items',
              items: {
                type: 'object',
                properties: {
                  key: { type: 'string', label: 'Key (identifier)' },
                  label: { type: 'string', isLongText: true, label: 'Objective Text' },
                },
              },
            },
          },
        },
        values: {
          type: 'object',
          label: 'Values (6 items)',
          properties: {
            integrity: {
              type: 'object',
              label: 'Integrity',
              properties: {
                title: { type: 'string', label: 'Title' },
                description: { type: 'string', isLongText: true, label: 'Description' },
              },
            },
            transparency: {
              type: 'object',
              label: 'Transparency',
              properties: {
                title: { type: 'string', label: 'Title' },
                description: { type: 'string', isLongText: true, label: 'Description' },
              },
            },
            excellence: {
              type: 'object',
              label: 'Excellence',
              properties: {
                title: { type: 'string', label: 'Title' },
                description: { type: 'string', isLongText: true, label: 'Description' },
              },
            },
            sustainability: {
              type: 'object',
              label: 'Sustainability',
              properties: {
                title: { type: 'string', label: 'Title' },
                description: { type: 'string', isLongText: true, label: 'Description' },
              },
            },
            innovation: {
              type: 'object',
              label: 'Innovation',
              properties: {
                title: { type: 'string', label: 'Title' },
                description: { type: 'string', isLongText: true, label: 'Description' },
              },
            },
            collaboration: {
              type: 'object',
              label: 'Collaboration',
              properties: {
                title: { type: 'string', label: 'Title' },
                description: { type: 'string', isLongText: true, label: 'Description' },
              },
            },
          },
        },
        cta: {
          type: 'object',
          label: 'Call to Action (CTA)',
          properties: {
            title: { type: 'string', label: 'CTA Title' },
            description: { type: 'string', isLongText: true, label: 'CTA Description' },
            buttonPrimaryText: { type: 'string', label: 'Primary Button Text' },
            buttonPrimaryLink: { type: 'string', label: 'Primary Button Link' },
            buttonSecondaryText: { type: 'string', label: 'Secondary Button Text' },
            buttonSecondaryLink: { type: 'string', label: 'Secondary Button Link' },
          },
        },
      },
    },
  },

  // ==================== EXPLORAÇÃO ====================
  exploration: {
    title: { type: 'string', required: true, group: 'main', label: 'Título' },
    subtitle: { type: 'string', group: 'main', label: 'Subtítulo' },
    seismicCampaigns: { type: 'string', group: 'seismic', label: 'Campanhas Sísmicas' },
    seismicCampaignsDesc: { type: 'string', isLongText: true, group: 'seismic', label: 'Descrição das Campanhas' },
    seismicCampaignsSubtitle: { type: 'string', group: 'seismic', label: 'Subtítulo Campanhas' },
    seismicCampaignsContent: { type: 'string', isLongText: true, group: 'seismic', label: 'Conteúdo Campanhas' },
    processing: { type: 'string', group: 'processing', label: 'Processamento' },
    processingDesc: { type: 'string', isLongText: true, group: 'processing', label: 'Descrição Processamento' },
    processingSubtitle: { type: 'string', group: 'processing', label: 'Subtítulo Processamento' },
    processingContent: { type: 'string', isLongText: true, group: 'processing', label: 'Conteúdo Processamento' },
    newAreas: { type: 'string', group: 'newAreas', label: 'Novas Áreas' },
    newAreasDesc: { type: 'string', isLongText: true, group: 'newAreas', label: 'Descrição Novas Áreas' },
    newAreasSubtitle: { type: 'string', group: 'newAreas', label: 'Subtítulo Novas Áreas' },
    newAreasContent: { type: 'string', isLongText: true, group: 'newAreas', label: 'Conteúdo Novas Áreas' },
    seismic2d: { type: 'string', group: 'maps', label: 'Sísmica 2D' },
    seismic2dDesc: { type: 'string', group: 'maps', label: 'Descrição 2D' },
    seismic2dSubtitle: { type: 'string', group: 'maps', label: 'Subtítulo 2D' },
    seismic2dContent: { type: 'string', isLongText: true, group: 'maps', label: 'Conteúdo 2D' },
    seismic3d: { type: 'string', group: 'maps', label: 'Sísmica 3D' },
    seismic3dDesc: { type: 'string', group: 'maps', label: 'Descrição 3D' },
    seismic3dSubtitle: { type: 'string', group: 'maps', label: 'Subtítulo 3D' },
    seismic3dContent: { type: 'string', isLongText: true, group: 'maps', label: 'Conteúdo 3D' },
    seismic4d: { type: 'string', group: 'maps', label: 'Sísmica 4D' },
    seismic4dDesc: { type: 'string', group: 'maps', label: 'Descrição 4D' },
    seismic4dSubtitle: { type: 'string', group: 'maps', label: 'Subtítulo 4D' },
    seismic4dContent: { type: 'string', isLongText: true, group: 'maps', label: 'Conteúdo 4D' },
  },

  // ==================== ANPG ====================
  anpg: {
    // Estrutura PT/EN: cada campo existe dentro de pt: {} e en: {}
    pt: {
      type: 'object',
      group: 'pt',
      label: 'Português',
      properties: {
        title: { type: 'string', required: true, label: 'Título' },
        titleHighlight: { type: 'string', label: 'Palavra Destacada' },
        subtitle: { type: 'string', label: 'Subtítulo' },
        description: { type: 'string', isLongText: true, label: 'Descrição SEO' },
        breadcrumbLabel: { type: 'string', label: 'Label do Breadcrumb' },
        breadcrumbAbout: { type: 'string', label: 'Breadcrumb "Sobre nós"' },
        content: {
          type: 'object',
          label: 'Conteúdo Principal',
          properties: {
            intro: { type: 'string', isLongText: true, label: 'Introdução' },
            role: { type: 'string', isLongText: true, label: 'Papel da ANPG' },
            vision: { type: 'string', isLongText: true, label: 'Visão' },
          },
        },
        board: {
          type: 'object',
          label: 'Conselho de Administração',
          properties: {
            title: { type: 'string', label: 'Título da Secção' },
            members: {
              type: 'array',
              label: 'Membros',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', label: 'ID (slug)' },
                  slug: { type: 'string', label: 'Slug (foto)' },
                  name: { type: 'string', label: 'Nome Completo' },
                  role: { type: 'string', label: 'Cargo' },
                  pelouro: { type: 'string', label: 'Pelouro' },
                  isPCA: { type: 'string', label: 'É PCA? (true/false)' },
                  email: { type: 'string', label: 'Email' },
                  phone: { type: 'string', label: 'Telefone' },
                  biography: { type: 'string', isLongText: true, label: 'Biografia' },
                  institutionalMessage: { type: 'string', isLongText: true, label: 'Mensagem Institucional' },
                },
              },
            },
            supervision: {
              type: 'object',
              label: 'Órgãos de Fiscalização',
              properties: {
                title: { type: 'string', label: 'Título' },
                items: {
                  type: 'array',
                  label: 'Itens',
                  items: { type: 'object', properties: { name: { type: 'string', label: 'Nome' } } },
                },
              },
            },
          },
        },
        institutional: {
          type: 'object',
          label: 'Conteúdo Institucional',
          properties: {
            purpose: {
              type: 'object',
              label: 'Propósito',
              properties: {
                title: { type: 'string', label: 'Título' },
                desc: { type: 'string', isLongText: true, label: 'Descrição' },
              },
            },
            principles: {
              type: 'object',
              label: 'Princípios',
              properties: {
                title: { type: 'string', label: 'Título' },
                subtitle: { type: 'string', label: 'Subtítulo' },
                items: {
                  type: 'array',
                  label: 'Itens',
                  items: {
                    type: 'object',
                    properties: {
                      title: { type: 'string', label: 'Título' },
                      desc: { type: 'string', isLongText: true, label: 'Descrição' },
                    },
                  },
                },
              },
            },
            objectives: {
              type: 'object',
              label: 'Objectivos',
              properties: {
                title: { type: 'string', label: 'Título' },
                items: { type: 'array', label: 'Itens', items: { type: 'string', label: 'Item' } },
              },
            },
            socialResp: {
              type: 'object',
              label: 'Responsabilidade Social',
              properties: {
                title: { type: 'string', label: 'Título' },
                desc: { type: 'string', isLongText: true, label: 'Descrição' },
              },
            },
            environment: {
              type: 'object',
              label: 'Ambiente e Segurança',
              properties: {
                title: { type: 'string', label: 'Título' },
                desc: { type: 'string', isLongText: true, label: 'Descrição' },
              },
            },
          },
        },
      },
    },
    en: {
      type: 'object',
      group: 'en',
      label: 'English',
      properties: {
        title: { type: 'string', required: true, label: 'Title' },
        titleHighlight: { type: 'string', label: 'Highlighted Word' },
        subtitle: { type: 'string', label: 'Subtitle' },
        description: { type: 'string', isLongText: true, label: 'SEO Description' },
        breadcrumbLabel: { type: 'string', label: 'Breadcrumb Label' },
        content: {
          type: 'object',
          label: 'Main Content',
          properties: {
            intro: { type: 'string', isLongText: true, label: 'Introduction' },
            role: { type: 'string', isLongText: true, label: 'ANPG Role' },
            vision: { type: 'string', isLongText: true, label: 'Vision' },
          },
        },
        board: {
          type: 'object',
          label: 'Board of Directors',
          properties: {
            title: { type: 'string', label: 'Section Title' },
            members: {
              type: 'array',
              label: 'Members',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', label: 'ID (slug)' },
                  slug: { type: 'string', label: 'Slug (photo)' },
                  name: { type: 'string', label: 'Full Name' },
                  role: { type: 'string', label: 'Role' },
                  pelouro: { type: 'string', label: 'Portfolio' },
                  isPCA: { type: 'string', label: 'Is Chairman? (true/false)' },
                  email: { type: 'string', label: 'Email' },
                  phone: { type: 'string', label: 'Phone' },
                  biography: { type: 'string', isLongText: true, label: 'Biography' },
                  institutionalMessage: { type: 'string', isLongText: true, label: 'Institutional Message' },
                },
              },
            },
            supervision: {
              type: 'object',
              label: 'Oversight Bodies',
              properties: {
                title: { type: 'string', label: 'Title' },
                items: {
                  type: 'array',
                  label: 'Items',
                  items: { type: 'object', properties: { name: { type: 'string', label: 'Name' } } },
                },
              },
            },
          },
        },
        institutional: {
          type: 'object',
          label: 'Institutional Content',
          properties: {
            purpose: {
              type: 'object',
              label: 'Purpose',
              properties: {
                title: { type: 'string', label: 'Title' },
                desc: { type: 'string', isLongText: true, label: 'Description' },
              },
            },
            principles: {
              type: 'object',
              label: 'Principles',
              properties: {
                title: { type: 'string', label: 'Title' },
                subtitle: { type: 'string', label: 'Subtitle' },
                items: {
                  type: 'array',
                  label: 'Items',
                  items: {
                    type: 'object',
                    properties: {
                      title: { type: 'string', label: 'Title' },
                      desc: { type: 'string', isLongText: true, label: 'Description' },
                    },
                  },
                },
              },
            },
            objectives: {
              type: 'object',
              label: 'Objectives',
              properties: {
                title: { type: 'string', label: 'Title' },
                items: { type: 'array', label: 'Items', items: { type: 'string', label: 'Item' } },
              },
            },
            socialResp: {
              type: 'object',
              label: 'Social Responsibility',
              properties: {
                title: { type: 'string', label: 'Title' },
                desc: { type: 'string', isLongText: true, label: 'Description' },
              },
            },
            environment: {
              type: 'object',
              label: 'Environment & Safety',
              properties: {
                title: { type: 'string', label: 'Title' },
                desc: { type: 'string', isLongText: true, label: 'Description' },
              },
            },
          },
        },
      },
    },
  },

  // ==================== MENSAGEM DO PCA ====================
  pcaMessage: {
    title: { type: 'string', required: true, label: 'Título' },
    subtitle: { type: 'string', label: 'Subtítulo' },
    description: { type: 'string', isLongText: true, label: 'Descrição SEO' },
    name: { type: 'string', label: 'Nome do PCA' },
    role: { type: 'string', label: 'Cargo do PCA' },
    paragraphs: {
      type: 'array',
      label: 'Parágrafos da Mensagem',
      items: { type: 'string', label: 'Parágrafo' },
    },
    highlights: {
      type: 'array',
      label: 'Pontos Destacados',
      items: { type: 'string', label: 'Ponto' },
    },
    closing: { type: 'string', isLongText: true, label: 'Frase de Encerramento' },
  },

  // ==================== HISTÓRIA ====================
  history: {
    title: { type: 'string', required: true, label: 'Título' },
    subtitle: { type: 'string', label: 'Subtítulo' },
    description: { type: 'string', isLongText: true, label: 'Descrição' },
    breadcrumbAbout: { type: 'string', label: 'Breadcrumb "Sobre Nós"' },
    intro: { type: 'string', isLongText: true, label: 'Introdução' },
    timelineTitle: { type: 'string', label: 'Título da Linha do Tempo' },
    today: { type: 'string', label: 'Hoje' },
    eras: {
      type: 'object',
      label: 'Eras',
      properties: {
        pioneering: { type: 'string', label: 'Pioneirismo' },
        growth: { type: 'string', label: 'Crescimento' },
        expansion: { type: 'string', label: 'Expansão' },
        modernization: { type: 'string', label: 'Modernização' },
      },
    },
    stats: {
      type: 'object',
      label: 'Estatísticas',
      properties: {
        years: { type: 'string', label: 'Anos' },
        peakProduction: { type: 'string', label: 'Pico de Produção' },
        sonangolCreation: { type: 'string', label: 'Criação Sonangol' },
        anpgCreation: { type: 'string', label: 'Criação ANPG' },
      },
    },
    timeline: {
      type: 'array',
      label: 'Linha do Tempo',
      items: {
        type: 'object',
        properties: {
          year: { type: 'string', label: 'Ano' },
          title: { type: 'string', label: 'Título' },
          description: { type: 'string', isLongText: true, label: 'Descrição' },
        },
      },
    },
  },

  // ==================== RESPONSABILIDADE SOCIAL ====================
  socialResponsibility: {
    title: { type: 'string', required: true, label: 'Título' },
    subtitle: { type: 'string', label: 'Subtítulo' },
    description: { type: 'string', isLongText: true, label: 'Descrição' },
    impactStats: {
      type: 'array',
      label: 'Estatísticas de Impacto',
      items: {
        type: 'object',
        properties: {
          value: { type: 'string', label: 'Valor' },
          label: { type: 'string', label: 'Label' },
          icon: { type: 'string', label: 'Ícone' },
        },
      },
    },
    introTitle: { type: 'string', label: 'Título Introdução' },
    introP1: { type: 'string', isLongText: true, label: 'Parágrafo 1' },
    introP2: { type: 'string', isLongText: true, label: 'Parágrafo 2' },
    objectivesTitle: { type: 'string', label: 'Título Objectivos' },
    objectivesList: {
      type: 'array',
      label: 'Lista de Objectivos',
      items: { type: 'string', label: 'Objectivo' },
    },
    missionTitle: { type: 'string', label: 'Título Missão' },
    missionP1: { type: 'string', isLongText: true, label: 'Missão Parágrafo 1' },
    missionP2: { type: 'string', isLongText: true, label: 'Missão Parágrafo 2' },
    areasTitle: { type: 'string', label: 'Título Áreas' },
    areas: {
      type: 'array',
      label: 'Áreas de Actuação',
      items: {
        type: 'object',
        properties: {
          key: { type: 'string', label: 'Chave' },
          title: { type: 'string', label: 'Título' },
          description: { type: 'string', isLongText: true, label: 'Descrição' },
          stats: { type: 'string', label: 'Estatísticas' },
        },
      },
    },
    legalTitle: { type: 'string', label: 'Título Enquadramento Legal' },
    legalText: { type: 'string', isLongText: true, label: 'Texto Legal' },
    sdgTitle: { type: 'string', label: 'Título ODS' },
    sdgGoals: {
      type: 'array',
      label: 'Objectivos de Desenvolvimento Sustentável',
      items: {
        type: 'object',
        properties: {
          number: { type: 'string', label: 'Número ODS' },
          title: { type: 'string', label: 'Título' },
          description: { type: 'string', isLongText: true, label: 'Descrição' },
        },
      },
    },
    partnersTitle: { type: 'string', label: 'Título Parceiros' },
    partnersDescription: { type: 'string', isLongText: true, label: 'Descrição Parceiros' },
    partners: {
      type: 'array',
      label: 'Parceiros',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', label: 'Nome' },
          type: { type: 'string', label: 'Tipo' },
        },
      },
    },
  },

  // ==================== CONTACTOS ====================
  contacts: {
    title: { type: 'string', required: true, label: 'Título' },
    subtitle: { type: 'string', label: 'Subtítulo' },
    description: { type: 'string', isLongText: true, label: 'Descrição' },
    infoTitle: { type: 'string', label: 'Título da Informação' },
    infoDescription: { type: 'string', isLongText: true, label: 'Descrição da Informação' },
    mapPlaceholder: { type: 'string', label: 'Placeholder do Mapa' },
    mapTitle: { type: 'string', label: 'Título do Mapa' },
    openInMaps: { type: 'string', label: 'Abrir no Google Maps' },
    headquarters: { type: 'string', label: 'Sede' },
    info: {
      type: 'object',
      label: 'Informações',
      properties: {
        address: { type: 'object', properties: { title: { type: 'string', label: 'Título Endereço' } } },
        phone: { type: 'object', properties: { title: { type: 'string', label: 'Título Telefone' } } },
        email: { type: 'object', properties: { title: { type: 'string', label: 'Título Email' } } },
        hours: {
          type: 'object',
          properties: {
            title: { type: 'string', label: 'Título Horário' },
            content: { type: 'string', label: 'Conteúdo Horário' },
          },
        },
      },
    },
  },

  // ==================== OPORTUNIDADES ====================
  opportunities: {
    title: { type: 'string', required: true, label: 'Título' },
    subtitle: { type: 'string', label: 'Subtítulo' },
    description: { type: 'string', isLongText: true, label: 'Descrição' },
    items: {
      type: 'array',
      label: 'Itens de Oportunidade',
      items: {
        type: 'object',
        properties: {
          icon: { type: 'string', label: 'Ícone (Gift, FileCheck, Archive)' },
          title: { type: 'string', label: 'Título' },
          description: { type: 'string', isLongText: true, label: 'Descrição' },
          href: { type: 'string', label: 'Link' },
        },
      },
    },
  },

  // ==================== LICITAÇÃO 2025 ====================
  tender2025: {
    title: { type: 'string', required: true, label: 'Título' },
    subtitle: { type: 'string', label: 'Subtítulo' },
    description: { type: 'string', isLongText: true, label: 'Descrição' },
  },

  // ==================== OFERTA PERMANENTE ====================
  permanentOffer: {
    title: { type: 'string', required: true, label: 'Título' },
    subtitle: { type: 'string', label: 'Subtítulo' },
    description: { type: 'string', isLongText: true, label: 'Descrição' },
    intro: { type: 'string', isLongText: true, label: 'Introdução' },
    howItWorksTitle: { type: 'string', label: 'Título Como Funciona' },
    howItWorks: {
      type: 'array',
      label: 'Como Funciona',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', label: 'Título' },
          desc: { type: 'string', isLongText: true, label: 'Descrição' },
        },
      },
    },
    advantagesTitle: { type: 'string', label: 'Título Vantagens' },
    advantages: {
      type: 'array',
      label: 'Vantagens',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', label: 'Título' },
          desc: { type: 'string', isLongText: true, label: 'Descrição' },
        },
      },
    },
    availableBlocksTitle: { type: 'string', label: 'Título Blocos Disponíveis' },
    availableBlocksIntro: { type: 'string', isLongText: true, label: 'Introdução Blocos' },
    blocks: {
      type: 'array',
      label: 'Blocos',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', label: 'Nome' },
          basin: { type: 'string', label: 'Bacia' },
          area: { type: 'string', label: 'Área' },
          status: { type: 'string', label: 'Estado' },
          depth: { type: 'string', label: 'Profundidade' },
        },
      },
    },
    blockHeaders: {
      type: 'object',
      label: 'Cabeçalhos da Tabela',
      properties: {
        name: { type: 'string', label: 'Bloco' },
        basin: { type: 'string', label: 'Bacia' },
        area: { type: 'string', label: 'Área' },
        depth: { type: 'string', label: 'Profundidade' },
        status: { type: 'string', label: 'Estado' },
      },
    },
    eligibilityTitle: { type: 'string', label: 'Título Elegibilidade' },
    eligibility: {
      type: 'array',
      label: 'Elegibilidade',
      items: { type: 'string', label: 'Item' },
    },
    ctaTitle: { type: 'string', label: 'Título CTA' },
    ctaDesc: { type: 'string', isLongText: true, label: 'Descrição CTA' },
    ctaButton: { type: 'string', label: 'Botão CTA' },
    ctaEmail: { type: 'string', label: 'Email CTA' },
    statusAvailable: { type: 'string', label: 'Status Disponível' },
    statusNegotiating: { type: 'string', label: 'Status Em Negociação' },
  },

  // ==================== LICITAÇÃO 2023 ====================
  tender2023: {
    title: { type: 'string', required: true, label: 'Título' },
    subtitle: { type: 'string', label: 'Subtítulo' },
    description: { type: 'string', isLongText: true, label: 'Descrição' },
    introTitle: { type: 'string', label: 'Título Introdução' },
    introDescription: { type: 'string', isLongText: true, label: 'Descrição Introdução' },
    introStatus: { type: 'string', label: 'Status (ex: Concurso Encerrado)' },
    resultsTitle: { type: 'string', label: 'Título Resultados' },
    results: {
      type: 'array',
      label: 'Resultados',
      items: {
        type: 'object',
        properties: {
          value: { type: 'string', label: 'Valor' },
          title: { type: 'string', label: 'Título' },
          description: { type: 'string', label: 'Descrição' },
        },
      },
    },
    timelineTitle: { type: 'string', label: 'Título Cronograma' },
    timeline: {
      type: 'array',
      label: 'Cronograma',
      items: {
        type: 'object',
        properties: {
          phase: { type: 'string', label: 'Fase' },
          date: { type: 'string', label: 'Data' },
          description: { type: 'string', isLongText: true, label: 'Descrição' },
        },
      },
    },
  },

  // ==================== GÁS ====================
  gas: {
    title: { type: 'string', required: true, label: 'Título' },
    subtitle: { type: 'string', label: 'Subtítulo' },
    intro: { type: 'string', isLongText: true, label: 'Introdução' },
    highlights: {
      type: 'array',
      label: 'Destaques',
      items: {
        type: 'object',
        properties: {
          key: { type: 'string', label: 'Chave' },
          title: { type: 'string', label: 'Título' },
          desc: { type: 'string', label: 'Descrição' },
        },
      },
    },
    opportunitiesTitle: { type: 'string', label: 'Título Oportunidades' },
    p1: { type: 'string', isLongText: true, label: 'Parágrafo 1' },
    p2: { type: 'string', isLongText: true, label: 'Parágrafo 2' },
  },

  // ==================== CANAL DE DENÚNCIAS ====================
  whistleblower: {
    title: { type: 'string', required: true, label: 'Título' },
    subtitle: { type: 'string', label: 'Subtítulo' },
    features: {
      type: 'array',
      label: 'Características',
      items: {
        type: 'object',
        properties: {
          key: { type: 'string', label: 'Chave' },
          title: { type: 'string', label: 'Título' },
          desc: { type: 'string', label: 'Descrição' },
        },
      },
    },
    p1: { type: 'string', isLongText: true, label: 'Parágrafo 1' },
    p2: { type: 'string', isLongText: true, label: 'Parágrafo 2' },
    p3: { type: 'string', isLongText: true, label: 'Parágrafo 3' },
    howToTitle: { type: 'string', label: 'Título Como Submeter' },
    email: { type: 'string', label: 'Email' },
    phone: { type: 'string', label: 'Telefone' },
    disclaimer: { type: 'string', label: 'Aviso Legal' },
  },

  // ==================== DADOS DE E&P ====================
  epData: {
    title: { type: 'string', required: true, label: 'Título' },
    subtitle: { type: 'string', label: 'Subtítulo' },
    description: { type: 'string', isLongText: true, label: 'Descrição' },
    items: {
      type: 'array',
      label: 'Itens de Navegação',
      items: {
        type: 'object',
        properties: {
          icon: { type: 'string', label: 'Ícone (Database, Layers, Image, Map)' },
          title: { type: 'string', label: 'Título' },
          description: { type: 'string', isLongText: true, label: 'Descrição' },
          href: { type: 'string', label: 'Link' },
        },
      },
    },
  },

  // ==================== PLATAFORMA IONA ====================
  iona: {
    title: { type: 'string', required: true, label: 'Título' },
    subtitle: { type: 'string', label: 'Subtítulo' },
    description: { type: 'string', isLongText: true, label: 'Descrição' },
    introTitle: { type: 'string', label: 'Título Introdução' },
    introDescription: { type: 'string', isLongText: true, label: 'Descrição Introdução' },
    featuresTitle: { type: 'string', label: 'Título Funcionalidades' },
    features: {
      type: 'array',
      label: 'Funcionalidades',
      items: {
        type: 'object',
        properties: {
          icon: { type: 'string', label: 'Ícone' },
          title: { type: 'string', label: 'Título' },
          description: { type: 'string', isLongText: true, label: 'Descrição' },
        },
      },
    },
    accessTitle: { type: 'string', label: 'Título Como Aceder' },
  },

  // ==================== OASIS ====================
  oasis: {
    title: { type: 'string', required: true, label: 'Título' },
    subtitle: { type: 'string', label: 'Subtítulo' },
    description: { type: 'string', isLongText: true, label: 'Descrição' },
    introTitle: { type: 'string', label: 'Título Introdução' },
    introDescription: { type: 'string', isLongText: true, label: 'Descrição Introdução' },
    categoriesTitle: { type: 'string', label: 'Título Categorias' },
    categories: {
      type: 'array',
      label: 'Categorias de Dados',
      items: {
        type: 'object',
        properties: {
          icon: { type: 'string', label: 'Ícone' },
          title: { type: 'string', label: 'Título' },
          description: { type: 'string', isLongText: true, label: 'Descrição' },
        },
      },
    },
    accessTitle: { type: 'string', label: 'Título Como Aceder' },
  },

  // ==================== PACOTES DE DADOS ====================
  dataPackages: {
    title: { type: 'string', required: true, label: 'Título' },
    subtitle: { type: 'string', label: 'Subtítulo' },
    description: { type: 'string', isLongText: true, label: 'Descrição' },
    introTitle: { type: 'string', label: 'Título Introdução' },
    introDescription: { type: 'string', isLongText: true, label: 'Descrição Introdução' },
    packagesTitle: { type: 'string', label: 'Título Pacotes' },
    packages: {
      type: 'array',
      label: 'Pacotes Disponíveis',
      items: {
        type: 'object',
        properties: {
          icon: { type: 'string', label: 'Ícone' },
          title: { type: 'string', label: 'Título' },
          description: { type: 'string', isLongText: true, label: 'Descrição' },
          price: { type: 'string', label: 'Preço/Info' },
        },
      },
    },
    processTitle: { type: 'string', label: 'Título Processo de Aquisição' },
    processSteps: {
      type: 'array',
      label: 'Passos do Processo',
      items: { type: 'string', label: 'Passo' },
    },
  },

  // ==================== MAPA DE CONCESSÕES ====================
  epMaps: {
    title: { type: 'string', required: true, label: 'Título' },
    subtitle: { type: 'string', label: 'Subtítulo' },
    description: { type: 'string', isLongText: true, label: 'Descrição' },
    basinDistribution: { type: 'string', label: 'Distribuição por Bacia' },
    basinDistributionDesc: { type: 'string', label: 'Descrição Distribuição' },
    blocks: { type: 'string', label: 'Blocos' },
    concessionsMap: { type: 'string', label: 'Mapa de Concessões' },
    concessionsMapDesc: { type: 'string', label: 'Descrição Mapa' },
    mapView: { type: 'string', label: 'Vista Mapa' },
    listView: { type: 'string', label: 'Vista Lista' },
    downloadPdf: { type: 'string', label: 'Download PDF' },
    topOperators: { type: 'string', label: 'Principais Operadores' },
    topOperatorsDesc: { type: 'string', label: 'Descrição Operadores' },
    operatedBlocks: { type: 'string', label: 'Blocos Operados' },
    inProduction: { type: 'string', label: 'Em Produção' },
    loadingMap: { type: 'string', label: 'A carregar mapa' },
    updatedData: { type: 'string', label: 'Dados Actualizados' },
    updatedDataDesc: { type: 'string', label: 'Descrição Actualização' },
    officialPortal: { type: 'string', label: 'Portal Oficial' },
  },

  // ==================== DETALHES DO BLOCO ====================
  blockDetails: {
    title: { type: 'string', required: true, label: 'Título' },
    subtitle: { type: 'string', label: 'Subtítulo' },
    description: { type: 'string', isLongText: true, label: 'Descrição' },
    notFound: { type: 'string', label: 'Não Encontrado' },
    notFoundDesc: { type: 'string', label: 'Descrição Não Encontrado' },
  },

  // ==================== CONFERÊNCIA 2021 ====================
  conference2021: {
    title: { type: 'string', required: true, label: 'Título' },
    subtitle: { type: 'string', label: 'Subtítulo' },
    description: { type: 'string', isLongText: true, label: 'Descrição' },
    introTitle: { type: 'string', label: 'Título Introdução' },
    introDate: { type: 'string', label: 'Data' },
    introLocation: { type: 'string', label: 'Localização' },
    introDescription: { type: 'string', isLongText: true, label: 'Descrição Introdução' },
    highlightsTitle: { type: 'string', label: 'Título Destaques' },
    highlights: {
      type: 'array',
      label: 'Destaques',
      items: {
        type: 'object',
        properties: {
          value: { type: 'string', label: 'Valor' },
          title: { type: 'string', label: 'Título' },
          description: { type: 'string', label: 'Descrição' },
        },
      },
    },
    topicsTitle: { type: 'string', label: 'Título Temas' },
    topics: {
      type: 'array',
      label: 'Temas Abordados',
      items: { type: 'string', label: 'Tema' },
    },
  },

  // ==================== CONFERÊNCIA 2023 ====================
  conference2023: {
    title: { type: 'string', required: true, label: 'Título' },
    subtitle: { type: 'string', label: 'Subtítulo' },
    description: { type: 'string', isLongText: true, label: 'Descrição' },
    introTitle: { type: 'string', label: 'Título Introdução' },
    introDate: { type: 'string', label: 'Data' },
    introLocation: { type: 'string', label: 'Localização' },
    introDescription: { type: 'string', isLongText: true, label: 'Descrição Introdução' },
    highlightsTitle: { type: 'string', label: 'Título Destaques' },
    highlights: {
      type: 'array',
      label: 'Destaques',
      items: {
        type: 'object',
        properties: {
          value: { type: 'string', label: 'Valor' },
          title: { type: 'string', label: 'Título' },
          description: { type: 'string', label: 'Descrição' },
        },
      },
    },
    topicsTitle: { type: 'string', label: 'Título Temas' },
    topics: {
      type: 'array',
      label: 'Temas Abordados',
      items: { type: 'string', label: 'Tema' },
    },
  },

  // ==================== MEDIA ====================
  media: {
    title: { type: 'string', required: true, label: 'Título' },
    subtitle: { type: 'string', label: 'Subtítulo' },
    description: { type: 'string', isLongText: true, label: 'Descrição' },
    tabs: {
      type: 'object',
      label: 'Tabs',
      properties: {
        news: { type: 'string', label: 'Notícias' },
        publications: { type: 'string', label: 'Publicações' },
        videos: { type: 'string', label: 'Vídeos' },
        press: { type: 'string', label: 'Recortes' },
        events: { type: 'string', label: 'Eventos' },
      },
    },
    search: { type: 'string', label: 'Busca Notícias (placeholder)' },
    searchPublications: { type: 'string', label: 'Busca Publicações (placeholder)' },
    searchVideos: { type: 'string', label: 'Busca Vídeos (placeholder)' },
    searchPress: { type: 'string', label: 'Busca Recortes (placeholder)' },
    searchEvents: { type: 'string', label: 'Busca Eventos (placeholder)' },
    clearFilters: { type: 'string', label: 'Limpar filtros' },
    allYears: { type: 'string', label: 'Todos os anos' },
    allEventCategories: { type: 'string', label: 'Todas as categorias (eventos)' },
    byAuthor: { type: 'string', label: 'Prefixo "Por " (autor)' },
    downloadLabel: { type: 'string', label: 'Label Download' },
    noPdf: { type: 'string', label: 'Sem PDF' },
    externalSource: { type: 'string', label: 'Fonte externa' },
    eventPeriod: {
      type: 'object',
      label: 'Período de Eventos',
      properties: {
        all: { type: 'string', label: 'Todos' },
        upcoming: { type: 'string', label: 'Próximos' },
        past: { type: 'string', label: 'Passados' },
      },
    },
    dateFilters: {
      type: 'object',
      label: 'Filtros de Data',
      properties: {
        all: { type: 'string', label: 'Todas' },
        week: { type: 'string', label: 'Semana' },
        month: { type: 'string', label: 'Mês' },
        quarter: { type: 'string', label: 'Trimestre' },
        year: { type: 'string', label: 'Ano' },
      },
    },
    sort: {
      type: 'object',
      label: 'Ordenação',
      properties: {
        newest: { type: 'string', label: 'Mais recentes' },
        oldest: { type: 'string', label: 'Mais antigas' },
      },
    },
    clear: { type: 'string', label: 'Limpar' },
    categories: {
      type: 'object',
      label: 'Categorias',
      properties: {
        all: { type: 'string', label: 'Todas' },
        press: { type: 'string', label: 'Comunicado' },
        tender: { type: 'string', label: 'Licitação' },
        highlight: { type: 'string', label: 'Destaque' },
        production: { type: 'string', label: 'Produção' },
      },
    },
    noResults: { type: 'string', label: 'Sem resultados' },
    empty: {
      type: 'object',
      label: 'Mensagens Vazias',
      properties: {
        publications: { type: 'string', label: 'Publicações' },
        videos: { type: 'string', label: 'Vídeos' },
        press: { type: 'string', label: 'Recortes' },
        events: { type: 'string', label: 'Eventos' },
      },
    },
    resultsCount: { type: 'string', label: 'Contador resultados' },
    pageInfo: { type: 'string', label: 'Info página' },
    publicationsTitle: { type: 'string', label: 'Título Publicações' },
    publicationsDescription: { type: 'string', label: 'Descrição Publicações' },
    viewAllPublications: { type: 'string', label: 'Ver todas publicações' },
    videosTitle: { type: 'string', label: 'Título Vídeos' },
    videosDescription: { type: 'string', label: 'Descrição Vídeos' },
    viewMoreVideos: { type: 'string', label: 'Ver mais vídeos' },
    pressTitle: { type: 'string', label: 'Título Recortes' },
    pressDescription: { type: 'string', label: 'Descrição Recortes' },
    viewMorePress: { type: 'string', label: 'Ver mais recortes' },
    eventsTitle: { type: 'string', label: 'Título Eventos' },
    eventsDescription: { type: 'string', label: 'Descrição Eventos' },
    viewAllEvents: { type: 'string', label: 'Ver todos eventos' },
  },

  // ==================== EVENTOS ====================
  events: {
    title: { type: 'string', required: true, label: 'Título' },
    subtitle: { type: 'string', label: 'Subtítulo' },
    description: { type: 'string', isLongText: true, label: 'Descrição' },
    search: { type: 'string', label: 'Placeholder Pesquisa' },
    noResults: { type: 'string', label: 'Sem resultados' },
    viewDetails: { type: 'string', label: 'Ver detalhes' },
    upcoming: { type: 'string', label: 'Label Próximo' },
    clear: { type: 'string', label: 'Limpar filtros' },
    dateFilters: {
      type: 'object',
      label: 'Filtros de Data',
      properties: {
        all: { type: 'string', label: 'Todos' },
        week: { type: 'string', label: 'Semana' },
        month: { type: 'string', label: 'Mês' },
        quarter: { type: 'string', label: 'Trimestre' },
        year: { type: 'string', label: 'Ano' },
      },
    },
    sort: {
      type: 'object',
      label: 'Ordenação',
      properties: {
        newest: { type: 'string', label: 'Mais recentes' },
        oldest: { type: 'string', label: 'Mais antigos' },
      },
    },
    status: {
      type: 'object',
      label: 'Estado',
      properties: {
        all: { type: 'string', label: 'Todos' },
        upcoming: { type: 'string', label: 'Próximos' },
        past: { type: 'string', label: 'Passados' },
      },
    },
    events: {
      type: 'array',
      label: 'Lista de Eventos',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', label: 'ID' },
          slug: { type: 'string', label: 'Slug (URL)' },
          title: { type: 'string', label: 'Título' },
          description: { type: 'string', isLongText: true, label: 'Descrição' },
          location: { type: 'string', label: 'Localização' },
          startAt: { type: 'string', label: 'Data Início (ISO)' },
          endAt: { type: 'string', label: 'Data Fim (ISO)' },
          image: { type: 'string', label: 'URL Imagem' },
        },
      },
    },
  },

  // ==================== PRODUÇÃO ====================
  production: {
    title: { type: 'string', required: true, label: 'Título' },
    subtitle: { type: 'string', label: 'Subtítulo' },
    description: { type: 'string', isLongText: true, label: 'Descrição' },
    keyIndicators: { type: 'string', label: 'Indicadores Chave' },
    historicalTitle: { type: 'string', label: 'Título Histórico' },
    historicalSubtitle: { type: 'string', label: 'Subtítulo Histórico' },
    oilLabel: { type: 'string', label: 'Label Petróleo' },
    gasLabel: { type: 'string', label: 'Label Gás' },
    oilName: { type: 'string', label: 'Nome Petróleo' },
    gasName: { type: 'string', label: 'Nome Gás' },
    monthlyTitle: { type: 'string', label: 'Título Mensal' },
    monthlySubtitle: { type: 'string', label: 'Subtítulo Mensal' },
    productionLabel: { type: 'string', label: 'Label Produção' },
    operatorTitle: { type: 'string', label: 'Título Operador' },
    operatorSubtitle: { type: 'string', label: 'Subtítulo Operador' },
    quotaLabel: { type: 'string', label: 'Label Quota' },
    basinTitle: { type: 'string', label: 'Título Bacia' },
    basinSubtitle: { type: 'string', label: 'Subtítulo Bacia' },
    tableTitle: { type: 'string', label: 'Título Tabela' },
    tableSubtitle: { type: 'string', label: 'Subtítulo Tabela' },
    tableOperator: { type: 'string', label: 'Operador' },
    tableProduction: { type: 'string', label: 'Produção' },
    tableQuota: { type: 'string', label: 'Quota' },
    tableTrend: { type: 'string', label: 'Tendência' },
    trendStable: { type: 'string', label: 'Estável' },
    defaultStats: {
      type: 'object',
      label: 'Estatísticas Padrão',
      properties: {
        oilProduction: { type: 'string', label: 'Produção Petróleo' },
        gasProduction: { type: 'string', label: 'Produção Gás' },
        activeBlocks: { type: 'string', label: 'Blocos Activos' },
        intlOperators: { type: 'string', label: 'Operadores Internacionais' },
      },
    },
  },

  // ==================== HISTÓRICO DE PRODUÇÃO ====================
  productionHistory: {
    title: { type: 'string', required: true, label: 'Título' },
    subtitle: { type: 'string', label: 'Subtítulo' },
    description: { type: 'string', isLongText: true, label: 'Descrição' },
  },

  // ==================== CONTEÚDO LOCAL ====================
  localContent: {
    title: { type: 'string', required: true, label: 'Título' },
    subtitle: { type: 'string', label: 'Subtítulo' },
    description: { type: 'string', isLongText: true, label: 'Descrição' },
    introHeading: { type: 'string', label: 'Título Introdução' },
    introP1: { type: 'string', isLongText: true, label: 'Parágrafo 1' },
    introP2: { type: 'string', isLongText: true, label: 'Parágrafo 2' },
    introP2Bold: { type: 'string', label: 'Destaque Parágrafo 2' },
    statsHeading: { type: 'string', label: 'Título Estatísticas' },
    statsSubheading: { type: 'string', label: 'Subtítulo Estatísticas' },
    stats: {
      type: 'array',
      label: 'Estatísticas',
      items: {
        type: 'object',
        properties: {
          value: { type: 'string', label: 'Valor' },
          label: { type: 'string', label: 'Label' },
          description: { type: 'string', label: 'Descrição' },
        },
      },
    },
    regimesHeading: { type: 'string', label: 'Título Regimes' },
    regimesSubheading: { type: 'string', label: 'Subtítulo Regimes' },
    regimes: {
      type: 'array',
      label: 'Regimes',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', label: 'Título' },
          description: { type: 'string', isLongText: true, label: 'Descrição' },
          threshold: { type: 'string', label: 'Limiar' },
          color: { type: 'string', label: 'Cor' },
        },
      },
    },
    regimesFootnote: { type: 'string', isLongText: true, label: 'Nota de Rodapé Regimes' },
    registrationHeading: { type: 'string', label: 'Título Registo' },
    registrationSubheading: { type: 'string', label: 'Subtítulo Registo' },
    registrationStepsHeading: { type: 'string', label: 'Título Passos de Registo' },
    registrationSteps: {
      type: 'array',
      label: 'Passos de Registo',
      items: { type: 'string', label: 'Passo' },
    },
    registrationFormUrl: { type: 'string', label: 'URL Formulário' },
    registrationFormLabel: { type: 'string', label: 'Label Formulário' },
    registrationListsUrl: { type: 'string', label: 'URL Listas' },
    registrationListsLabel: { type: 'string', label: 'Label Listas' },
    dashboardHeading: { type: 'string', label: 'Título Dashboard' },
    dashboardSubheading: { type: 'string', label: 'Subtítulo Dashboard' },
    dashboardEmbedUrl: { type: 'string', label: 'URL Embed Dashboard' },
    docsHeading: { type: 'string', label: 'Título Documentação' },
    docsManualTitle: { type: 'string', label: 'Título Manual' },
    docsManualDescription: { type: 'string', label: 'Descrição Manual' },
    docsManualUrl: { type: 'string', label: 'URL Manual' },
    docsManualLabel: { type: 'string', label: 'Label Manual' },
    docsDecreeTitle: { type: 'string', label: 'Título Decreto' },
    docsDecreeDescription: { type: 'string', label: 'Descrição Decreto' },
    docsDecreeUrl: { type: 'string', label: 'URL Decreto' },
    docsDecreeLabel: { type: 'string', label: 'Label Decreto' },
  },

  // ==================== PORTAL DO INVESTIDOR ====================
  investorPortal: {
    title: { type: 'string', required: true, label: 'Título' },
    subtitle: { type: 'string', label: 'Subtítulo' },
    description: { type: 'string', isLongText: true, label: 'Descrição' },
    welcomeMessage: { type: 'string', isLongText: true, label: 'Mensagem de Boas-vindas' },
    highlights: {
      type: 'array',
      label: 'Destaques',
      items: {
        type: 'object',
        properties: {
          value: { type: 'string', label: 'Valor' },
          label: { type: 'string', label: 'Label' },
        },
      },
    },
  },

  // ==================== PRIVACIDADE ====================
  privacy: {
    title: { type: 'string', required: true, label: 'Título' },
    subtitle: { type: 'string', label: 'Subtítulo' },
    description: { type: 'string', isLongText: true, label: 'Descrição' },
    intro: { type: 'string', isLongText: true, label: 'Introdução' },
    lastUpdated: { type: 'string', label: 'Última atualização' },
    sections: {
      type: 'array',
      label: 'Secções',
      items: {
        type: 'object',
        properties: {
          key: { type: 'string', label: 'Chave' },
          title: { type: 'string', label: 'Título' },
          content: { type: 'string', isLongText: true, label: 'Conteúdo' },
        },
      },
    },
    dpo: {
      type: 'object',
      label: 'Encarregado Protecção Dados',
      properties: {
        title: { type: 'string', label: 'Título' },
        entity: { type: 'string', label: 'Entidade' },
        email: { type: 'string', label: 'Email' },
        address: { type: 'string', label: 'Morada' },
      },
    },
  },

  // ==================== TERMOS ====================
  terms: {
    title: { type: 'string', required: true, label: 'Título' },
    subtitle: { type: 'string', label: 'Subtítulo' },
    description: { type: 'string', isLongText: true, label: 'Descrição' },
    intro: { type: 'string', isLongText: true, label: 'Introdução' },
    lastUpdated: { type: 'string', label: 'Última atualização' },
    sections: {
      type: 'array',
      label: 'Secções',
      items: {
        type: 'object',
        properties: {
          key: { type: 'string', label: 'Chave' },
          title: { type: 'string', label: 'Título' },
          content: { type: 'string', isLongText: true, label: 'Conteúdo' },
        },
      },
    },
    updates: {
      type: 'object',
      label: 'Actualizações',
      properties: {
        title: { type: 'string', label: 'Título' },
        content: { type: 'string', isLongText: true, label: 'Conteúdo' },
      },
    },
    questions: { type: 'string', label: 'Questões' },
  },

  // ==================== ENERGIA E BIOCOMBUSTÍVEIS ====================
  energyIntegration: {
    title: { type: 'string', required: true, label: 'Título' },
    subtitle: { type: 'string', label: 'Subtítulo' },
    intro: { type: 'string', isLongText: true, label: 'Introdução' },
    areasTitle: { type: 'string', label: 'Título Áreas' },
    areas: {
      type: 'array',
      label: 'Áreas de Actuação',
      items: {
        type: 'object',
        properties: {
          key: { type: 'string', label: 'Chave' },
          title: { type: 'string', label: 'Título' },
          desc: { type: 'string', isLongText: true, label: 'Descrição' },
        },
      },
    },
    statsTitle: { type: 'string', label: 'Título Estatísticas' },
    stats: {
      type: 'array',
      label: 'Estatísticas',
      items: {
        type: 'object',
        properties: {
          key: { type: 'string', label: 'Chave' },
          value: { type: 'string', label: 'Valor' },
          label: { type: 'string', label: 'Label' },
        },
      },
    },
    timelineTitle: { type: 'string', label: 'Título Timeline' },
    timeline: {
      type: 'array',
      label: 'Timeline',
      items: {
        type: 'object',
        properties: {
          year: { type: 'string', label: 'Ano' },
          title: { type: 'string', label: 'Título' },
          desc: { type: 'string', isLongText: true, label: 'Descrição' },
        },
      },
    },
    contactTitle: { type: 'string', label: 'Título Contacto' },
    contactIntro: { type: 'string', label: 'Introdução Contacto' },
    contactFields: {
      type: 'object',
      label: 'Campos do Formulário',
      properties: {
        name: { type: 'string', label: 'Nome' },
        email: { type: 'string', label: 'Email' },
        organization: { type: 'string', label: 'Organização' },
        interest: { type: 'string', label: 'Interesse' },
        message: { type: 'string', label: 'Mensagem' },
        submit: { type: 'string', label: 'Enviar' },
        submitting: { type: 'string', label: 'A enviar' },
        successTitle: { type: 'string', label: 'Título Sucesso' },
        successDesc: { type: 'string', label: 'Descrição Sucesso' },
      },
    },
    interestOptions: {
      type: 'object',
      label: 'Opções de Interesse',
      properties: {
        biofuels: { type: 'string', label: 'Biocombustíveis' },
        transition: { type: 'string', label: 'Transição' },
        sustainability: { type: 'string', label: 'Sustentabilidade' },
        partnerships: { type: 'string', label: 'Parcerias' },
        other: { type: 'string', label: 'Outro' },
      },
    },
  },

  // ==================== LICENCIAMENTO ====================
  licensing: {
    title: { type: 'string', required: true, label: 'Título' },
    subtitle: { type: 'string', label: 'Subtítulo' },
    description: { type: 'string', isLongText: true, label: 'Descrição' },
    intro: { type: 'string', isLongText: true, label: 'Introdução' },
    licenseTypesTitle: { type: 'string', label: 'Título Tipos de Licença' },
    licenseTypes: {
      type: 'array',
      label: 'Tipos de Licença',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', label: 'Título' },
          description: { type: 'string', label: 'Descrição' },
          duration: { type: 'string', label: 'Duração' },
        },
      },
    },
    processTitle: { type: 'string', label: 'Título Processo' },
    processSubtitle: { type: 'string', label: 'Subtítulo Processo' },
    processSteps: {
      type: 'array',
      label: 'Passos do Processo',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', label: 'Título' },
          description: { type: 'string', label: 'Descrição' },
        },
      },
    },
    ctaTitle: { type: 'string', label: 'Título CTA' },
    ctaDescription: { type: 'string', label: 'Descrição CTA' },
    ctaOpportunities: { type: 'string', label: 'Botão Oportunidades' },
    ctaContact: { type: 'string', label: 'Botão Contactar' },
  },

  // ==================== FISCALIZAÇÃO ====================
  oversight: {
    title: { type: 'string', required: true, label: 'Título' },
    subtitle: { type: 'string', label: 'Subtítulo' },
    description: { type: 'string', isLongText: true, label: 'Descrição' },
    intro: { type: 'string', isLongText: true, label: 'Introdução' },
    stats: {
      type: 'array',
      label: 'Estatísticas',
      items: {
        type: 'object',
        properties: {
          value: { type: 'string', label: 'Valor' },
          label: { type: 'string', label: 'Label' },
        },
      },
    },
    areasTitle: { type: 'string', label: 'Título Áreas' },
    areas: {
      type: 'array',
      label: 'Áreas de Fiscalização',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', label: 'Título' },
          description: { type: 'string', label: 'Descrição' },
        },
      },
    },
    complianceTitle: { type: 'string', label: 'Título Conformidade' },
    complianceIntro: { type: 'string', label: 'Introdução Conformidade' },
    complianceAreas: {
      type: 'array',
      label: 'Áreas de Conformidade',
      items: { type: 'string', label: 'Área' },
    },
    reportingTitle: { type: 'string', label: 'Título Reporte' },
    reportingDescription: { type: 'string', label: 'Descrição Reporte' },
    emergencyLine: { type: 'string', label: 'Linha de Emergência' },
  },

  // ==================== LICITAÇÕES (Página) ====================
  tendersPage: {
    title: { type: 'string', required: true, label: 'Título' },
    subtitle: { type: 'string', label: 'Subtítulo' },
    description: { type: 'string', isLongText: true, label: 'Descrição' },
    intro: { type: 'string', isLongText: true, label: 'Introdução' },
    activeTitle: { type: 'string', label: 'Título Activas' },
    activeTenders: {
      type: 'array',
      label: 'Licitações Activas',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', label: 'ID' },
          title: { type: 'string', label: 'Título' },
          status: { type: 'string', label: 'Status' },
          blocks: { type: 'number', label: 'Blocos' },
          deadline: { type: 'string', label: 'Prazo' },
          href: { type: 'string', label: 'Link' },
        },
      },
    },
    statusActive: { type: 'string', label: 'Status Em Curso' },
    statusOngoing: { type: 'string', label: 'Status Permanente' },
    blocksLabel: { type: 'string', label: 'Label Blocos' },
    viewDetails: { type: 'string', label: 'Ver detalhes' },
    phasesTitle: { type: 'string', label: 'Título Fases' },
    phasesSubtitle: { type: 'string', label: 'Subtítulo Fases' },
    phases: {
      type: 'array',
      label: 'Fases',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', label: 'Título' },
          description: { type: 'string', label: 'Descrição' },
        },
      },
    },
    pastTitle: { type: 'string', label: 'Título Anteriores' },
    pastTenders: {
      type: 'array',
      label: 'Licitações Anteriores',
      items: {
        type: 'object',
        properties: {
          year: { type: 'string', label: 'Ano' },
          title: { type: 'string', label: 'Título' },
          blocksOffered: { type: 'number', label: 'Blocos Oferecidos' },
          blocksAwarded: { type: 'number', label: 'Blocos Atribuídos' },
          investment: { type: 'string', label: 'Investimento' },
          href: { type: 'string', label: 'Link' },
        },
      },
    },
    blocksOffered: { type: 'string', label: 'Label Blocos Oferecidos' },
    blocksAwarded: { type: 'string', label: 'Label Blocos Atribuídos' },
    investmentCaptured: { type: 'string', label: 'Label Investimento' },
  },

  // ==================== LICITAÇÃO 2025 CONTEÚDO ====================
  tender2025Content: {
    launchDate: { type: 'string', label: 'Data Lançamento' },
    bannerTitle: { type: 'string', label: 'Título Banner' },
    bannerDescription: { type: 'string', isLongText: true, label: 'Descrição Banner' },
    bannerHighlight: { type: 'string', label: 'Destaque Banner' },
    objectivesTitle: { type: 'string', label: 'Título Objectivos' },
    objectivesSubtitle: { type: 'string', label: 'Subtítulo Objectivos' },
    objectives: {
      type: 'array',
      label: 'Objectivos',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', label: 'Título' },
          description: { type: 'string', label: 'Descrição' },
        },
      },
    },
    phasesTitle: { type: 'string', label: 'Título Fases' },
    phasesSubtitle: { type: 'string', label: 'Subtítulo Fases' },
    phases: {
      type: 'array',
      label: 'Fases',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', label: 'Título' },
          description: { type: 'string', label: 'Descrição' },
          period: { type: 'string', label: 'Período' },
          status: { type: 'string', label: 'Status' },
        },
      },
    },
    statusInProgress: { type: 'string', label: 'Status Em curso' },
    mapTitle: { type: 'string', label: 'Título Mapa' },
    mapSubtitle: { type: 'string', label: 'Subtítulo Mapa' },
    documentsTitle: { type: 'string', label: 'Título Documentos' },
    documentsSubtitle: { type: 'string', label: 'Subtítulo Documentos' },
    documents: {
      type: 'array',
      label: 'Documentos',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', label: 'Título' },
          description: { type: 'string', label: 'Descrição' },
          type: { type: 'string', label: 'Tipo' },
          size: { type: 'string', label: 'Tamanho' },
        },
      },
    },
    faqTitle: { type: 'string', label: 'Título FAQ' },
    faqSubtitle: { type: 'string', label: 'Subtítulo FAQ' },
    ctaTitle: { type: 'string', label: 'Título CTA' },
    ctaDescription: { type: 'string', label: 'Descrição CTA' },
    ctaInterest: { type: 'string', label: 'Botão Interesse' },
    ctaContact: { type: 'string', label: 'Botão Contactar' },
    heroInterest: { type: 'string', label: 'Hero Interesse' },
    heroBrochure: { type: 'string', label: 'Hero Brochura' },
  },

  // ==================== DADOS & ANALYTICS ====================
  dataPage: {
    title: { type: 'string', required: true, label: 'Título' },
    subtitle: { type: 'string', label: 'Subtítulo' },
    description: { type: 'string', isLongText: true, label: 'Descrição' },
    intro: { type: 'string', isLongText: true, label: 'Introdução' },
    metrics: {
      type: 'array',
      label: 'Métricas',
      items: {
        type: 'object',
        properties: {
          value: { type: 'string', label: 'Valor' },
          label: { type: 'string', label: 'Label' },
          description: { type: 'string', label: 'Descrição' },
        },
      },
    },
    resourcesTitle: { type: 'string', label: 'Título Recursos' },
    resources: {
      type: 'array',
      label: 'Recursos',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', label: 'Título' },
          description: { type: 'string', label: 'Descrição' },
          href: { type: 'string', label: 'Link' },
        },
      },
    },
    publicationsTitle: { type: 'string', label: 'Título Publicações' },
    viewAll: { type: 'string', label: 'Ver Todas' },
    publications: {
      type: 'array',
      label: 'Publicações',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', label: 'Título' },
          type: { type: 'string', label: 'Tipo' },
          date: { type: 'string', label: 'Data' },
        },
      },
    },
    dashboardTitle: { type: 'string', label: 'Título Dashboard' },
    dashboardDescription: { type: 'string', label: 'Descrição Dashboard' },
    dashboardCta: { type: 'string', label: 'Botão Dashboard' },
  },

  // ==================== REGULAÇÃO ====================
  regulation: {
    title: { type: 'string', required: true, label: 'Título' },
    subtitle: { type: 'string', label: 'Subtítulo' },
    description: { type: 'string', isLongText: true, label: 'Descrição SEO' },
    intro: { type: 'string', isLongText: true, label: 'Introdução' },
    areasTitle: { type: 'string', label: 'Título Áreas' },
    regulatoryAreas: {
      type: 'array',
      label: 'Áreas de Actuação',
      items: {
        type: 'object',
        properties: {
          icon: { type: 'string', label: 'Ícone (FileCheck, Shield, Globe2)' },
          title: { type: 'string', label: 'Título' },
          description: { type: 'string', isLongText: true, label: 'Descrição' },
          href: { type: 'string', label: 'Link' },
        },
      },
    },
    legalFrameworkTitle: { type: 'string', label: 'Título Quadro Legal' },
    legalFrameworkSubtitle: { type: 'string', label: 'Subtítulo Quadro Legal' },
    legalFramework: {
      type: 'array',
      label: 'Instrumentos Legais',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', label: 'Título' },
          reference: { type: 'string', label: 'Referência Legal' },
          description: { type: 'string', isLongText: true, label: 'Descrição' },
        },
      },
    },
    principlesTitle: { type: 'string', label: 'Título Princípios' },
    principles: {
      type: 'array',
      label: 'Princípios Regulatórios',
      items: { type: 'string', label: 'Princípio' },
    },
  },

  // ==================== SUSTENTABILIDADE ====================
  sustainability: {
    title: { type: 'string', required: true, label: 'Título' },
    subtitle: { type: 'string', label: 'Subtítulo' },
    description: { type: 'string', isLongText: true, label: 'Descrição SEO' },
    intro: { type: 'string', isLongText: true, label: 'Introdução' },
    statsTitle: { type: 'string', label: 'Título Estatísticas' },
    stats: {
      type: 'array',
      label: 'Metas Ambientais',
      items: {
        type: 'object',
        properties: {
          value: { type: 'string', label: 'Valor' },
          label: { type: 'string', label: 'Label' },
          description: { type: 'string', label: 'Descrição' },
        },
      },
    },
    pillarsTitle: { type: 'string', label: 'Título Pilares' },
    pillars: {
      type: 'array',
      label: 'Pilares da Sustentabilidade',
      items: {
        type: 'object',
        properties: {
          iconKey: { type: 'string', label: 'Ícone (Wind, Droplets, TreePine, Recycle, Sun, Leaf)' },
          title: { type: 'string', label: 'Título' },
          description: { type: 'string', isLongText: true, label: 'Descrição' },
        },
      },
    },
    initiativesTitle: { type: 'string', label: 'Título Iniciativas' },
    initiatives: {
      type: 'array',
      label: 'Iniciativas em Curso',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', label: 'Título' },
          description: { type: 'string', isLongText: true, label: 'Descrição' },
          status: { type: 'string', label: 'Estado' },
        },
      },
    },
    sdgTitle: { type: 'string', label: 'Título ODS' },
    sdgIntro: { type: 'string', isLongText: true, label: 'Introdução ODS' },
    sdgGoals: {
      type: 'array',
      label: 'Objectivos de Desenvolvimento Sustentável',
      items: {
        type: 'object',
        properties: {
          number: { type: 'number', label: 'Número ODS' },
          title: { type: 'string', label: 'Título' },
          iconKey: { type: 'string', label: 'Ícone' },
        },
      },
    },
  },

  // ==================== HISTÓRICO PRODUÇÃO CONTEÚDO ====================
  productionHistoryContent: {
    title: { type: 'string', required: true, label: 'Título' },
    subtitle: { type: 'string', label: 'Subtítulo' },
    description: { type: 'string', isLongText: true, label: 'Descrição SEO' },
    downloadReport: { type: 'string', label: 'Download Relatório' },
    statsLabels: {
      type: 'object',
      label: 'Labels Estatísticas',
      properties: {
        start: { type: 'string', label: 'Início' },
        firstExport: { type: 'string', label: 'Primeira exportação' },
        historicPeak: { type: 'string', label: 'Pico Histórico' },
        peakUnit: { type: 'string', label: 'Unidade Pico' },
        current: { type: 'string', label: 'Actual' },
        currentUnit: { type: 'string', label: 'Unidade Actual' },
        gas: { type: 'string', label: 'Gás' },
        gasUnit: { type: 'string', label: 'Unidade Gás' },
      },
    },
    longTermTitle: { type: 'string', label: 'Título Longo Prazo' },
    longTermSubtitle: { type: 'string', label: 'Subtítulo Longo Prazo' },
    declineNote: { type: 'string', isLongText: true, label: 'Nota Declínio' },
    monthlyTitle: { type: 'string', label: 'Título Mensal' },
    monthlySubtitle: { type: 'string', label: 'Subtítulo Mensal' },
    chartLabels: {
      type: 'object',
      label: 'Labels Gráfico',
      properties: {
        production: { type: 'string', label: 'Produção' },
        oil: { type: 'string', label: 'Petróleo' },
        gas: { type: 'string', label: 'Gás' },
      },
    },
    decadeTitle: { type: 'string', label: 'Título Década' },
    decadeSubtitle: { type: 'string', label: 'Subtítulo Década' },
    decadeLabels: {
      type: 'object',
      label: 'Labels Década',
      properties: {
        peak: { type: 'string', label: 'Pico' },
        average: { type: 'string', label: 'Média' },
      },
    },
    milestonesTitle: { type: 'string', label: 'Título Marcos' },
    milestonesSubtitle: { type: 'string', label: 'Subtítulo Marcos' },
    milestones: {
      type: 'array',
      label: 'Marcos',
      items: {
        type: 'object',
        properties: {
          year: { type: 'string', label: 'Ano' },
          title: { type: 'string', label: 'Título' },
          description: { type: 'string', label: 'Descrição' },
        },
      },
    },
    ctaTitle: { type: 'string', label: 'Título CTA' },
    ctaDescription: { type: 'string', label: 'Descrição CTA' },
    ctaDashboard: { type: 'string', label: 'Botão Dashboard' },
    ctaData: { type: 'string', label: 'Botão Dados' },
  },

  // ==================== HOME ====================
  home: {
    hero: {
      type: 'object',
      label: 'Secção Hero',
      properties: {
        subtitle: { type: 'string', label: 'Subtítulo (Badge)' },
        title: { type: 'string', label: 'Título Principal' },
        titleHighlight: { type: 'string', label: 'Título Destacado' },
        description: { type: 'string', isLongText: true, label: 'Descrição' },
        ctaPrimary: { type: 'string', label: 'Botão Primário' },
        ctaSecondary: { type: 'string', label: 'Botão Secundário' },
        scrollHint: { type: 'string', label: 'Texto de Scroll' },
        quickAccess: {
          type: 'array',
          label: 'Acesso Rápido (3 cartões)',
          items: {
            type: 'object',
            properties: {
              iconKey: { type: 'string', label: 'Ícone (TrendingUp | Shield | BarChart3)' },
              title: { type: 'string', label: 'Título' },
              description: { type: 'string', label: 'Descrição' },
              href: { type: 'string', label: 'URL' },
            },
          },
        },
      },
    },
    stats: {
      type: 'object',
      label: 'Secção Estatísticas',
      properties: {
        label: { type: 'string', label: 'Label da Secção' },
        title: { type: 'string', label: 'Título' },
        subtitle: { type: 'string', isLongText: true, label: 'Subtítulo' },
        exploreData: { type: 'string', label: 'Link Explorar Dados' },
        items: {
          type: 'array',
          label: 'Estatísticas (4 itens)',
          items: {
            type: 'object',
            properties: {
              value: { type: 'string', label: 'Valor Numérico' },
              suffix: { type: 'string', label: 'Sufixo (ex: M, B+, +)' },
              label: { type: 'string', label: 'Label' },
              description: { type: 'string', label: 'Descrição' },
            },
          },
        },
      },
    },
    about: {
      type: 'object',
      label: 'Secção Sobre a ANPG',
      properties: {
        label: { type: 'string', label: 'Label da Secção' },
        title: { type: 'string', label: 'Título' },
        titleHighlight: { type: 'string', label: 'Título Destacado' },
        description: { type: 'string', isLongText: true, label: 'Descrição' },
        yearsExperience: { type: 'string', label: 'Texto Anos de Experiência' },
        cta: { type: 'string', label: 'Texto do Botão' },
        values: {
          type: 'array',
          label: 'Valores (4 itens)',
          items: {
            type: 'object',
            properties: {
              iconKey: { type: 'string', label: 'Ícone (Shield | Target | Globe | Lightbulb)' },
              title: { type: 'string', label: 'Título' },
              description: { type: 'string', label: 'Descrição' },
            },
          },
        },
      },
    },
    services: {
      type: 'object',
      label: 'Secção Serviços',
      properties: {
        label: { type: 'string', label: 'Label da Secção' },
        title: { type: 'string', label: 'Título' },
        subtitle: { type: 'string', isLongText: true, label: 'Subtítulo' },
        items: {
          type: 'array',
          label: 'Serviços (6 itens)',
          items: {
            type: 'object',
            properties: {
              iconKey: { type: 'string', label: 'Ícone' },
              title: { type: 'string', label: 'Título' },
              description: { type: 'string', isLongText: true, label: 'Descrição' },
              href: { type: 'string', label: 'URL' },
            },
          },
        },
      },
    },
    investment: {
      type: 'object',
      label: 'Secção Investimento',
      properties: {
        label: { type: 'string', label: 'Label da Secção' },
        title: { type: 'string', label: 'Título' },
        titleHighlight: { type: 'string', label: 'Título Destacado' },
        description: { type: 'string', isLongText: true, label: 'Descrição' },
        ctaGuide: { type: 'string', label: 'Botão Guia do Investidor' },
        ctaBlocks: { type: 'string', label: 'Botão Ver Blocos' },
        featuredBlocks: { type: 'string', label: 'Título Blocos em Destaque' },
        viewAllBlocks: { type: 'string', label: 'Link Ver Todos os Blocos' },
        location: { type: 'string', label: 'Localização no Mapa' },
        highlights: {
          type: 'array',
          label: 'Destaques (lista)',
          items: { type: 'string', label: 'Item' },
        },
      },
    },
    news: {
      type: 'object',
      label: 'Secção Notícias',
      properties: {
        label: { type: 'string', label: 'Label da Secção' },
        title: { type: 'string', label: 'Título' },
        viewAll: { type: 'string', label: 'Botão Ver Todas' },
      },
    },
    cta: {
      type: 'object',
      label: 'Secção CTA',
      properties: {
        title: { type: 'string', label: 'Título' },
        description: { type: 'string', isLongText: true, label: 'Descrição' },
        contactInvestments: { type: 'string', label: 'Botão Contactar Investimentos' },
        scheduleMeeting: { type: 'string', label: 'Botão Agendar Reunião' },
      },
    },
  },

  // ==================== FAQ ====================
  faq: {
    title: { type: 'string', required: true, label: 'Título' },
    subtitle: { type: 'string', label: 'Subtítulo' },
    description: { type: 'string', isLongText: true, label: 'Descrição SEO' },
    intro: { type: 'string', isLongText: true, label: 'Texto Introdutório' },
    contactCtaText: { type: 'string', isLongText: true, label: 'Texto CTA Contacto' },
    contactCtaLink: { type: 'string', label: 'Label Link Contacto' },
    noFaqs: { type: 'string', label: 'Mensagem sem FAQs' },
  },

  // ==================== ARQUIVO DE NOTÍCIAS ====================
  newsArchive: {
    title: { type: 'string', required: true, label: 'Título' },
    subtitle: { type: 'string', label: 'Subtítulo' },
    searchPlaceholder: { type: 'string', label: 'Placeholder Pesquisa' },
    filterLabel: { type: 'string', label: 'Label Filtros' },
    clearFilters: { type: 'string', label: 'Limpar Filtros' },
    noResults: { type: 'string', label: 'Sem Resultados' },
    noResultsDesc: { type: 'string', label: 'Descrição Sem Resultados' },
    backToMedia: { type: 'string', label: 'Botão Voltar' },
  },

  // ==================== MEMBRO DO CONSELHO ====================
  boardMember: {
    pt: {
      type: 'object',
      group: 'pt',
      label: 'Português',
      properties: {
        loadingTitle: { type: 'string', label: 'Título A Carregar' },
        notFoundTitle: { type: 'string', label: 'Título Não Encontrado' },
        notFoundMessage: { type: 'string', label: 'Mensagem Não Encontrado' },
        backToBoard: { type: 'string', label: 'Botão Voltar ao Conselho' },
        backToAnpg: { type: 'string', label: 'Botão Voltar à ANPG' },
        biographyTitle: { type: 'string', label: 'Título Biografia' },
        messageTitle: { type: 'string', label: 'Título Mensagem' },
        contactTitle: { type: 'string', label: 'Título Contactos' },
        pelouroTitle: { type: 'string', label: 'Título Cargo & Pelouro' },
        titleLabel: { type: 'string', label: 'Label Título' },
        portfolioLabel: { type: 'string', label: 'Label Pelouro' },
        noBiography: { type: 'string', label: 'Sem Biografia' },
      },
    },
    en: {
      type: 'object',
      group: 'en',
      label: 'English',
      properties: {
        loadingTitle: { type: 'string', label: 'Loading Title' },
        notFoundTitle: { type: 'string', label: 'Not Found Title' },
        notFoundMessage: { type: 'string', label: 'Not Found Message' },
        backToBoard: { type: 'string', label: 'Back to Board Button' },
        backToAnpg: { type: 'string', label: 'Back to ANPG Button' },
        biographyTitle: { type: 'string', label: 'Biography Title' },
        messageTitle: { type: 'string', label: 'Message Title' },
        contactTitle: { type: 'string', label: 'Contact Title' },
        pelouroTitle: { type: 'string', label: 'Position & Portfolio Title' },
        titleLabel: { type: 'string', label: 'Title Label' },
        portfolioLabel: { type: 'string', label: 'Portfolio Label' },
        noBiography: { type: 'string', label: 'No Biography Text' },
      },
    },
  },

  // ==================== DETALHE DE EVENTO ====================
  eventDetail: {
    loadingTitle: { type: 'string', label: 'Título A Carregar' },
    subtitle: { type: 'string', label: 'Subtítulo Página' },
    notFoundTitle: { type: 'string', label: 'Título Não Encontrado' },
    notFoundHeading: { type: 'string', label: 'Cabeçalho Não Encontrado' },
    notFoundMessage: { type: 'string', label: 'Mensagem Não Encontrado' },
    backButton: { type: 'string', label: 'Botão Voltar' },
    shareLabel: { type: 'string', label: 'Label Partilhar' },
    registerButton: { type: 'string', label: 'Botão Registar' },
    mapButton: { type: 'string', label: 'Botão Ver Mapa' },
    relatedTitle: { type: 'string', label: 'Título Eventos Relacionados' },
    viewAllButton: { type: 'string', label: 'Botão Ver Todos' },
    statusUpcoming: { type: 'string', label: 'Estado: Em breve' },
    statusOngoing: { type: 'string', label: 'Estado: A decorrer' },
    statusFinished: { type: 'string', label: 'Estado: Finalizado' },
  },

  // ==================== DETALHE DE NOTÍCIA ====================
  newsDetail: {
    loadingTitle: { type: 'string', label: 'Título A Carregar' },
    subtitle: { type: 'string', label: 'Subtítulo Página' },
    notFoundTitle: { type: 'string', label: 'Título Não Encontrado' },
    notFoundHeading: { type: 'string', label: 'Cabeçalho Não Encontrado' },
    notFoundMessage: { type: 'string', label: 'Mensagem Não Encontrado' },
    backButton: { type: 'string', label: 'Botão Voltar' },
    shareLabel: { type: 'string', label: 'Label Partilhar' },
    relatedTitle: { type: 'string', label: 'Título Notícias Relacionadas' },
    viewAllButton: { type: 'string', label: 'Botão Ver Todas' },
  },
};

// ==================== SITE PAGES ====================
export const SITE_PAGES = [
  // ==================== PÁGINAS INSTITUCIONAIS ====================
  { pageKey: 'home', label: 'Página Inicial', labelEn: 'Home Page', url: '/', category: 'pages', sections: ['hero', 'stats', 'about', 'services', 'investment', 'news', 'cta'] },
  { pageKey: 'about', label: 'Sobre a ANPG', labelEn: 'About ANPG', url: '/about', category: 'pages', sections: ['content', 'strategicObjectives', 'values', 'cta'] },
  { pageKey: 'pcaMessage', label: 'Mensagem do PCA', labelEn: 'Chairman Message', url: '/anpg/pca-message', category: 'pages', sections: ['content'] },
  { pageKey: 'anpg', label: 'ANPG', labelEn: 'ANPG', url: '/about/anpg', category: 'pages', sections: ['content', 'board', 'supervision', 'institutional'] },
  { pageKey: 'history', label: 'História', labelEn: 'History', url: '/about/history', category: 'pages', sections: ['content', 'timeline'] },
  { pageKey: 'socialResponsibility', label: 'Responsabilidade Social', labelEn: 'Social Responsibility', url: '/about/social-responsibility', category: 'pages', sections: ['content'] },
  { pageKey: 'contacts', label: 'Contactos', labelEn: 'Contacts', url: '/contacts', category: 'pages', sections: ['content', 'info'] },
  { pageKey: 'whistleblower', label: 'Canal de Denúncias', labelEn: 'Whistleblower', url: '/whistleblower', category: 'pages', sections: ['content'] },
  { pageKey: 'localContent', label: 'Conteúdo Local', labelEn: 'Local Content', url: '/local-content', category: 'pages', sections: ['content'] },
  { pageKey: 'investorPortal', label: 'Portal do Investidor', labelEn: 'Investor Portal', url: '/investor-portal', category: 'pages', sections: ['content'] },
  { pageKey: 'exploration', label: 'Exploração', labelEn: 'Exploration', url: '/exploration', category: 'pages', sections: ['content'] },

  // ==================== OPORTUNIDADES ====================
  { pageKey: 'opportunities', label: 'Oportunidades', labelEn: 'Opportunities', url: '/opportunities', category: 'opportunities', sections: ['content'] },
  { pageKey: 'tender2025', label: 'Licitação 2025', labelEn: 'Tender 2025', url: '/opportunities/tender-2025', category: 'opportunities', sections: ['content'] },
  { pageKey: 'tender2025Content', label: 'Conteúdo Licitação 2025', labelEn: 'Tender 2025 Content', url: '/opportunities/tender-2025', category: 'opportunities', sections: ['content'] },
  { pageKey: 'permanentOffer', label: 'Oferta Permanente', labelEn: 'Permanent Offer', url: '/opportunities/permanent-offer', category: 'opportunities', sections: ['content', 'blocks', 'advantages'] },
  { pageKey: 'tender2023', label: 'Licitação 2023', labelEn: 'Tender 2023', url: '/opportunities/tender-2023', category: 'opportunities', sections: ['content'] },
  { pageKey: 'energyIntegration', label: 'Integração Energética', labelEn: 'Energy Integration', url: '/opportunities/energy-integration', category: 'opportunities', sections: ['content', 'areas', 'timeline'] },
  { pageKey: 'gas', label: 'Gás', labelEn: 'Gas', url: '/opportunities/gas', category: 'opportunities', sections: ['content'] },

  // ==================== DADOS DE E&P ====================
  { pageKey: 'epData', label: 'Dados de E&P', labelEn: 'E&P Data', url: '/ep-data', category: 'ep-data', sections: ['content'] },
  { pageKey: 'iona', label: 'Plataforma IONA', labelEn: 'IONA Platform', url: '/ep-data/iona', category: 'ep-data', sections: ['content'] },
  { pageKey: 'oasis', label: 'OASIS', labelEn: 'OASIS', url: '/ep-data/oasis', category: 'ep-data', sections: ['content'] },
  { pageKey: 'dataPackages', label: 'Pacotes de Dados', labelEn: 'Data Packages', url: '/ep-data/packages', category: 'ep-data', sections: ['content'] },
  { pageKey: 'epMaps', label: 'Mapa de Concessões', labelEn: 'Concession Map', url: '/ep-data/maps', category: 'ep-data', sections: ['content'] },
  { pageKey: 'blockDetails', label: 'Detalhes do Bloco', labelEn: 'Block Details', url: '/ep-data/blocks/:blockId', category: 'ep-data', sections: ['content'] },
  { pageKey: 'conference2021', label: 'Conferência 2021', labelEn: 'Conference 2021', url: '/ep-data/conference-2021', category: 'ep-data', sections: ['content'] },
  { pageKey: 'conference2023', label: 'Conferência 2023', labelEn: 'Conference 2023', url: '/ep-data/conference-2023', category: 'ep-data', sections: ['content'] },

  // ==================== MEDIA ====================
  { pageKey: 'media', label: 'Media', labelEn: 'Media', url: '/media', category: 'media', sections: ['content'] },
  { pageKey: 'events', label: 'Eventos', labelEn: 'Events', url: '/media/eventos', category: 'media', sections: ['content'] },
  { pageKey: 'newsArchive', label: 'Arquivo de Notícias', labelEn: 'News Archive', url: '/media/archive', category: 'media', sections: ['content'] },

  // ==================== PRODUÇÃO ====================
  { pageKey: 'production', label: 'Produção', labelEn: 'Production', url: '/production', category: 'production', sections: ['content', 'stats', 'charts'] },
  { pageKey: 'productionHistory', label: 'Histórico de Produção', labelEn: 'Production History', url: '/production/history', category: 'production', sections: ['content'] },
  { pageKey: 'productionHistoryContent', label: 'Conteúdo Histórico Produção', labelEn: 'Production History Content', url: '/production/history', category: 'production', sections: ['content'] },

  // ==================== REGULAÇÃO ====================
  { pageKey: 'regulation', label: 'Regulação', labelEn: 'Regulation', url: '/regulation', category: 'services', sections: ['content', 'areas', 'legal', 'principles'] },
  { pageKey: 'licensing', label: 'Licenciamento', labelEn: 'Licensing', url: '/regulation/licensing', category: 'services', sections: ['content'] },
  { pageKey: 'oversight', label: 'Fiscalização', labelEn: 'Oversight', url: '/regulation/oversight', category: 'services', sections: ['content'] },
  { pageKey: 'tendersPage', label: 'Licitações', labelEn: 'Tenders', url: '/regulation/tenders', category: 'services', sections: ['content'] },

  // ==================== SERVIÇOS ====================
  { pageKey: 'dataPage', label: 'Dados & Analytics', labelEn: 'Data & Analytics', url: '/data', category: 'services', sections: ['content'] },
  { pageKey: 'sustainability', label: 'Sustentabilidade', labelEn: 'Sustainability', url: '/sustainability', category: 'services', sections: ['content', 'stats', 'pillars', 'initiatives', 'sdg'] },

  // ==================== LEGAL ====================
  { pageKey: 'privacy', label: 'Política de Privacidade', labelEn: 'Privacy Policy', url: '/privacy', category: 'legal', sections: ['content'] },
  { pageKey: 'terms', label: 'Termos de Utilização', labelEn: 'Terms of Use', url: '/terms', category: 'legal', sections: ['content'] },

  // ==================== OUTRAS PÁGINAS ====================
  { pageKey: 'faq', label: 'FAQ', labelEn: 'FAQ', url: '/faq', category: 'pages', sections: ['content'] },
  { pageKey: 'boardMember', label: 'Membro do Conselho', labelEn: 'Board Member', url: '/about/board/:id', category: 'pages', sections: ['content'] },
  { pageKey: 'eventDetail', label: 'Detalhe de Evento', labelEn: 'Event Detail', url: '/events/:id', category: 'media', sections: ['content'] },
  { pageKey: 'newsDetail', label: 'Detalhe de Notícia', labelEn: 'News Detail', url: '/news/:id', category: 'media', sections: ['content'] },
];

export const SITE_PAGE_CATEGORIES = [
  { key: 'pages', label: 'Páginas Institucionais' },
  { key: 'opportunities', label: 'Oportunidades' },
  { key: 'ep-data', label: 'Dados de E&P' },
  { key: 'media', label: 'Media' },
  { key: 'production', label: 'Produção' },
  { key: 'services', label: 'Serviços' },
  { key: 'legal', label: 'Legal' },
];