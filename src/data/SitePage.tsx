// data/pageSchemas.ts

export type PageData = Record<string, any>;

export const PAGE_SCHEMAS: Record<string, any> = {
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

  // ==================== SOBRE ====================
  about: {
    title: { type: 'string', required: true, group: 'main', label: 'Título' },
    subtitle: { type: 'string', group: 'main', label: 'Subtítulo' },
    description: { type: 'string', isLongText: true, group: 'main', label: 'Descrição' },
    content: {
      type: 'object',
      group: 'content',
      label: 'Conteúdo',
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
      group: 'objectives',
      label: 'Objectivos Estratégicos',
      properties: {
        title: { type: 'string', label: 'Título' },
        items: {
          type: 'array',
          label: 'Itens',
          items: {
            type: 'object',
            properties: {
              key: { type: 'string', label: 'Chave' },
              value: { type: 'string', isLongText: true, label: 'Valor' },
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
    description: { type: 'string', isLongText: true, label: 'Descrição' },
    role: { type: 'string', label: 'Cargo' },
    p1: { type: 'string', isLongText: true, label: 'Parágrafo 1' },
    p2: { type: 'string', isLongText: true, label: 'Parágrafo 2' },
    p3: { type: 'string', isLongText: true, label: 'Parágrafo 3' },
    p4: { type: 'string', isLongText: true, label: 'Parágrafo 4' },
    p5: { type: 'string', isLongText: true, label: 'Parágrafo 5' },
    p6: { type: 'string', isLongText: true, label: 'Parágrafo 6' },
    highlight1: { type: 'string', label: 'Destaque 1' },
    highlight2: { type: 'string', label: 'Destaque 2' },
    highlight3: { type: 'string', label: 'Destaque 3' },
    closing: { type: 'string', isLongText: true, label: 'Encerramento' },
  },

  // ==================== ANPG ====================
  anpg: {
    title: { type: 'string', required: true, label: 'Título' },
    subtitle: { type: 'string', label: 'Subtítulo' },
    description: { type: 'string', isLongText: true, label: 'Descrição' },
    content: {
      type: 'object',
      label: 'Conteúdo',
      properties: {
        intro: { type: 'string', isLongText: true, label: 'Introdução' },
        role: { type: 'string', isLongText: true, label: 'Papel' },
        vision: { type: 'string', isLongText: true, label: 'Visão' },
      },
    },
    board: {
      type: 'object',
      label: 'Conselho de Administração',
      properties: {
        title: { type: 'string', label: 'Título' },
        members: {
          type: 'array',
          label: 'Membros',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', label: 'ID' },
              name: { type: 'string', label: 'Nome' },
              role: { type: 'string', label: 'Cargo' },
            },
          },
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
          items: {
            type: 'object',
            properties: {
              key: { type: 'string', label: 'Chave' },
              value: { type: 'string', label: 'Valor' },
            },
          },
        },
      },
    },
    institutional: {
      type: 'object',
      label: 'Institucional',
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
                  key: { type: 'string', label: 'Chave' },
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
            items: {
              type: 'array',
              label: 'Itens',
              items: { type: 'string', label: 'Item' },
            },
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
          label: 'Ambiente',
          properties: {
            title: { type: 'string', label: 'Título' },
            desc: { type: 'string', isLongText: true, label: 'Descrição' },
          },
        },
      },
    },
  },

  // ==================== HISTÓRIA ====================
  history: {
    title: { type: 'string', required: true, label: 'Título' },
    subtitle: { type: 'string', label: 'Subtítulo' },
    description: { type: 'string', isLongText: true, label: 'Descrição' },
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
    content: {
      type: 'object',
      label: 'Conteúdo',
      properties: {
        intro: { type: 'string', isLongText: true, label: 'Introdução' },
        areas: {
          type: 'array',
          label: 'Áreas',
          items: {
            type: 'object',
            properties: {
              key: { type: 'string', label: 'Chave' },
              title: { type: 'string', label: 'Título' },
              description: { type: 'string', isLongText: true, label: 'Descrição' },
            },
          },
        },
        environment: {
          type: 'object',
          label: 'Ambiente',
          properties: {
            title: { type: 'string', label: 'Título' },
            description: { type: 'string', isLongText: true, label: 'Descrição' },
          },
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
  },

  // ==================== PLATAFORMA IONA ====================
  iona: {
    title: { type: 'string', required: true, label: 'Título' },
    subtitle: { type: 'string', label: 'Subtítulo' },
    description: { type: 'string', isLongText: true, label: 'Descrição' },
  },

  // ==================== OASIS ====================
  oasis: {
    title: { type: 'string', required: true, label: 'Título' },
    subtitle: { type: 'string', label: 'Subtítulo' },
    description: { type: 'string', isLongText: true, label: 'Descrição' },
  },

  // ==================== PACOTES DE DADOS ====================
  dataPackages: {
    title: { type: 'string', required: true, label: 'Título' },
    subtitle: { type: 'string', label: 'Subtítulo' },
    description: { type: 'string', isLongText: true, label: 'Descrição' },
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
  },

  // ==================== CONFERÊNCIA 2023 ====================
  conference2023: {
    title: { type: 'string', required: true, label: 'Título' },
    subtitle: { type: 'string', label: 'Subtítulo' },
    description: { type: 'string', isLongText: true, label: 'Descrição' },
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
    search: { type: 'string', label: 'Placeholder Busca' },
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
  },

  // ==================== PORTAL DO INVESTIDOR ====================
  investorPortal: {
    title: { type: 'string', required: true, label: 'Título' },
    subtitle: { type: 'string', label: 'Subtítulo' },
    description: { type: 'string', isLongText: true, label: 'Descrição' },
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

  // ==================== HISTÓRICO PRODUÇÃO CONTEÚDO ====================
  productionHistoryContent: {
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
};

// ==================== SITE PAGES ====================
export const SITE_PAGES = [
  { pageKey: 'exploration', label: 'Exploração', url: '/exploration' },
  { pageKey: 'about', label: 'Sobre a ANPG', url: '/about' },
  { pageKey: 'pcaMessage', label: 'Mensagem do PCA', url: '/pca-message' },
  { pageKey: 'anpg', label: 'ANPG', url: '/anpg' },
  { pageKey: 'history', label: 'História', url: '/history' },
  { pageKey: 'socialResponsibility', label: 'Responsabilidade Social', url: '/social-responsibility' },
  { pageKey: 'contacts', label: 'Contactos', url: '/contacts' },
  { pageKey: 'opportunities', label: 'Oportunidades', url: '/opportunities' },
  { pageKey: 'tender2025', label: 'Licitação 2025', url: '/opportunities/tender-2025' },
  { pageKey: 'permanentOffer', label: 'Oferta Permanente', url: '/opportunities/permanent-offer' },
  { pageKey: 'tender2023', label: 'Licitação 2023', url: '/opportunities/tender-2023' },
  { pageKey: 'gas', label: 'Gás', url: '/gas' },
  { pageKey: 'whistleblower', label: 'Canal de Denúncias', url: '/whistleblower' },
  { pageKey: 'epData', label: 'Dados de E&P', url: '/ep-data' },
  { pageKey: 'iona', label: 'Plataforma IONA', url: '/ep-data/iona' },
  { pageKey: 'oasis', label: 'OASIS', url: '/ep-data/oasis' },
  { pageKey: 'dataPackages', label: 'Pacotes de Dados', url: '/ep-data/packages' },
  { pageKey: 'epMaps', label: 'Mapa de Concessões', url: '/ep-data/maps' },
  { pageKey: 'blockDetails', label: 'Detalhes do Bloco', url: '/ep-data/block/:id' },
  { pageKey: 'conference2021', label: 'Conferência 2021', url: '/ep-data/conference/2021' },
  { pageKey: 'conference2023', label: 'Conferência 2023', url: '/ep-data/conference/2023' },
  { pageKey: 'media', label: 'Media', url: '/media' },
  { pageKey: 'events', label: 'Eventos', url: '/media/events' },
  { pageKey: 'production', label: 'Produção', url: '/production' },
  { pageKey: 'productionHistory', label: 'Histórico de Produção', url: '/production/history' },
  { pageKey: 'localContent', label: 'Conteúdo Local', url: '/local-content' },
  { pageKey: 'investorPortal', label: 'Portal do Investidor', url: '/investor-portal' },
  { pageKey: 'privacy', label: 'Política de Privacidade', url: '/privacy' },
  { pageKey: 'terms', label: 'Termos de Utilização', url: '/terms' },
  { pageKey: 'energyIntegration', label: 'Integração Energética', url: '/energy-integration' },
  { pageKey: 'licensing', label: 'Licenciamento', url: '/licensing' },
  { pageKey: 'oversight', label: 'Fiscalização', url: '/oversight' },
  { pageKey: 'tendersPage', label: 'Licitações', url: '/tenders' },
  { pageKey: 'tender2025Content', label: 'Conteúdo Licitação 2025', url: '/opportunities/tender-2025' },
  { pageKey: 'dataPage', label: 'Dados & Analytics', url: '/data' },
  { pageKey: 'productionHistoryContent', label: 'Conteúdo Histórico Produção', url: '/production/history' },
];