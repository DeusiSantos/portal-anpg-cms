export interface NewsItem {
  id: string;
  slug?: string;
  title: string;
  date: string;
  category: string;
  image: string;
  excerpt: string;
  content: string;
  url?: string;
  author?: string;
  tags?: string[];
}

export const newsItems: NewsItem[] = [
  {
    id: "universidades-biocombustiveis",
    title: "UNIVERSIDADES APRESENTAM À ANPG PROJECTOS NO DOMÍNIO DOS BIOCOMBUSTÍVEIS",
    date: "26 de Janeiro, 2026",
    category: "highlight",
    image: "https://anpg.co.ao/wp-content/uploads/2026/01/Thumbmail_biocombustivel.jpg",
    excerpt: "Instituições de ensino superior apresentam projectos inovadores para o desenvolvimento do sector de biocombustíveis em Angola.",
    author: "ANPG Comunicação",
    tags: ["Biocombustíveis", "Universidades", "Inovação", "Energia"],
    content: `
A Agência Nacional de Petróleo, Gás e Biocombustíveis (ANPG) recebeu na sua sede, em Luanda, representantes de várias instituições de ensino superior angolanas que apresentaram projectos de investigação e desenvolvimento no domínio dos biocombustíveis.

## Objectivos do Encontro

O encontro teve como principal objectivo conhecer as iniciativas académicas que podem contribuir para o desenvolvimento do sector de biocombustíveis em Angola, alinhando-se com a estratégia nacional de diversificação energética.

### Projectos Apresentados

Entre os projectos apresentados destacam-se:

- **Produção de biodiesel a partir de óleos vegetais residuais**: Desenvolvido pela Universidade Agostinho Neto, este projecto visa aproveitar óleos usados para a produção de combustível sustentável.

- **Bioetanol a partir de resíduos agrícolas**: A Universidade Católica de Angola apresentou um estudo sobre a viabilidade de produção de etanol a partir de subprodutos da agricultura nacional.

- **Algas como fonte de biocombustível**: Investigadores da Universidade Mandume Ya Ndemufayo expuseram um projecto piloto de cultivo de microalgas para produção energética.

## Compromisso da ANPG

O Presidente do Conselho de Administração da ANPG, Paulino Jerónimo, reafirmou o compromisso da agência em apoiar iniciativas que promovam a transição energética e a redução da dependência de combustíveis fósseis.

> "Estamos empenhados em criar um ecossistema favorável ao desenvolvimento de biocombustíveis em Angola. O conhecimento académico é fundamental para alcançarmos os nossos objectivos de sustentabilidade energética", afirmou Paulino Jerónimo.

## Próximos Passos

A ANPG comprometeu-se a:

1. Estabelecer parcerias formais com as universidades participantes
2. Criar um fundo de apoio à investigação em biocombustíveis
3. Organizar um simpósio anual sobre energias renováveis
4. Facilitar o acesso a infraestruturas laboratoriais

O sector de biocombustíveis representa uma oportunidade estratégica para Angola diversificar a sua matriz energética e criar novos postos de trabalho, contribuindo simultaneamente para a redução das emissões de carbono.
    `,
  },
  {
    id: "programa-estagio-profissional-2026",
    title: "ANPG E AZULE ENERGY ABREM CANDIDATURAS PARA A 8.ª EDIÇÃO DO PROGRAMA DE ESTÁGIO PROFISSIONAL E COMUNITÁRIO",
    date: "23 de Janeiro, 2026",
    category: "press",
    image: "https://anpg.co.ao/wp-content/uploads/2026/01/Estagios_profissionais_hmpg_700x400px.jpg",
    excerpt: "Nova edição do programa de estágios abre oportunidades para jovens angolanos no sector petrolífero.",
    author: "ANPG Comunicação",
    tags: ["Estágios", "Formação", "Jovens", "Emprego"],
    content: `
A Agência Nacional de Petróleo, Gás e Biocombustíveis (ANPG) e a Azule Energy anunciam a abertura de candidaturas para a 8.ª edição do Programa de Estágio Profissional e Comunitário, uma iniciativa que visa proporcionar experiência prática a jovens angolanos recém-formados.

## Sobre o Programa

O programa oferece uma oportunidade única para jovens licenciados adquirirem experiência profissional em empresas do sector petrolífero, contribuindo simultaneamente para o desenvolvimento das suas comunidades.

### Vagas Disponíveis

Esta edição conta com **120 vagas** distribuídas em duas modalidades:

- **Estágio Profissional (80 vagas)**: Formação técnica em empresas do sector petrolífero
- **Estágio Comunitário (40 vagas)**: Projectos de desenvolvimento social em comunidades rurais

## Requisitos de Candidatura

Os candidatos devem cumprir os seguintes requisitos:

1. Nacionalidade angolana
2. Idade entre 21 e 30 anos
3. Licenciatura concluída nos últimos 3 anos
4. Disponibilidade para trabalhar a tempo inteiro durante 12 meses
5. Conhecimentos de informática na óptica do utilizador

### Áreas de Formação Prioritárias

- Engenharia (Petróleo, Química, Mecânica, Civil)
- Geologia e Geofísica
- Gestão e Economia
- Direito
- Comunicação Social
- Tecnologias de Informação

## Benefícios

Os estagiários seleccionados terão direito a:

- Bolsa de estágio mensal
- Seguro de saúde
- Transporte
- Mentoria profissional
- Certificado de conclusão

## Como Candidatar-se

As candidaturas decorrem de **23 de Janeiro a 28 de Fevereiro de 2026** através do portal oficial da ANPG.

> "Este programa é um investimento no futuro de Angola. Ao formar jovens qualificados, estamos a garantir a sustentabilidade do sector petrolífero e o desenvolvimento do país", disse o Director de Recursos Humanos da ANPG.

Os resultados serão divulgados em Março de 2026, com início dos estágios previsto para Abril.
    `,
  },
  {
    id: "projectos-estruturantes-conselho-consultivo",
    title: "ANPG APRESENTA DEZ PROJECTOS ESTRUTURANTES DO SECTOR PETROLÍFERO EM CONSELHO CONSULTIVO",
    date: "31 de Dezembro, 2025",
    category: "highlight",
    image: "https://anpg.co.ao/wp-content/uploads/2025/12/web_Conselho_consultivo.jpg",
    excerpt: "Conselho consultivo analisa projectos estratégicos para o futuro do sector petrolífero angolano.",
    author: "ANPG Comunicação",
    tags: ["Estratégia", "Investimentos", "Sector Petrolífero"],
    content: `
A Agência Nacional de Petróleo, Gás e Biocombustíveis (ANPG) apresentou ao seu Conselho Consultivo dez projectos estruturantes que irão moldar o futuro do sector petrolífero angolano nos próximos anos.

## Contexto Estratégico

O encontro realizou-se na sede da ANPG e contou com a presença de representantes do Governo, operadoras petrolíferas e especialistas do sector. Os projectos apresentados visam modernizar a indústria, aumentar a eficiência operacional e garantir a sustentabilidade ambiental.

### Os Dez Projectos Estruturantes

1. **Modernização do Sistema de Licenciamento**: Digitalização completa do processo de atribuição de concessões
2. **Centro de Excelência em E&P**: Criação de um centro de investigação e formação avançada
3. **Plataforma Nacional de Dados Geológicos**: Sistema integrado de gestão de dados exploratórios
4. **Programa de Eficiência Energética**: Redução do consumo energético nas operações upstream
5. **Hub de Gás Natural**: Desenvolvimento de infraestruturas para monetização do gás
6. **Fundo de Abandono de Campos**: Mecanismo financeiro para descomissionamento responsável
7. **Iniciativa de Conteúdo Local 2.0**: Reforço da participação de empresas angolanas
8. **Sistema de Monitorização Ambiental**: Rede de sensores para controlo de emissões
9. **Academia do Petróleo**: Programa de formação contínua para profissionais do sector
10. **Incubadora de Tecnologias Petrolíferas**: Apoio a startups nacionais

## Investimento Previsto

O conjunto de projectos representa um investimento total estimado em **2,5 mil milhões de dólares** ao longo de cinco anos, com financiamento misto público-privado.

### Impacto Esperado

- Criação de **15.000 novos postos de trabalho** directos e indirectos
- Aumento de **20%** na eficiência operacional do sector
- Redução de **30%** nas emissões de gases com efeito de estufa
- Incremento de **40%** na participação de empresas nacionais

## Próximas Etapas

O Conselho Consultivo aprovou por unanimidade a continuidade do desenvolvimento dos projectos, recomendando:

- Criação de grupos de trabalho específicos para cada projecto
- Definição de cronogramas detalhados de implementação
- Identificação de parceiros estratégicos internacionais
- Estabelecimento de métricas de acompanhamento

> "Estes projectos representam a visão de Angola para um sector petrolífero moderno, eficiente e sustentável. Estamos a construir as bases para as próximas décadas", afirmou o Presidente da ANPG.
    `,
  },
  {
    id: "consulta-publica-biocombustiveis",
    title: "SECTOR PETROLÍFERO LEVA À CONSULTA PÚBLICA LEI SOBRE BIOCOMBUSTÍVEIS",
    date: "31 de Dezembro, 2025",
    category: "press",
    image: "https://anpg.co.ao/wp-content/uploads/2025/12/web_Consultivo_Biocombustiveis.jpg",
    excerpt: "Nova legislação sobre biocombustíveis é submetida a consulta pública para contribuições da sociedade.",
    author: "ANPG Comunicação",
    tags: ["Legislação", "Biocombustíveis", "Consulta Pública"],
    content: `
O Ministério dos Recursos Minerais, Petróleo e Gás, através da ANPG, submeteu à consulta pública o anteprojecto de lei sobre biocombustíveis, marcando um passo decisivo na diversificação da matriz energética nacional.

## Objectivos da Nova Legislação

O anteprojecto visa estabelecer o quadro legal para a produção, distribuição e comercialização de biocombustíveis em Angola, criando incentivos para o investimento privado e definindo padrões de qualidade.

### Principais Disposições

O documento contempla:

- **Definição de metas obrigatórias**: Percentagens mínimas de biocombustíveis na mistura com combustíveis fósseis
- **Regime de incentivos fiscais**: Isenções e reduções de impostos para produtores
- **Certificação de sustentabilidade**: Requisitos ambientais e sociais para a produção
- **Programa nacional de biocombustíveis**: Estratégia de longo prazo com metas quinquenais

## Participação Pública

A consulta pública decorre durante 60 dias, de 1 de Janeiro a 1 de Março de 2026. Os cidadãos e instituições podem participar através de:

1. Portal da ANPG (www.anpg.co.ao)
2. Sessões presenciais nas capitais provinciais
3. Envio de contribuições por escrito

### Sectores Convidados a Participar

- Empresas agrícolas e agro-industriais
- Distribuidores de combustíveis
- Associações ambientais
- Instituições de ensino e investigação
- Sociedade civil organizada

## Impacto Económico

Estudos preliminares indicam que o sector de biocombustíveis pode gerar:

- **50.000 empregos** directos na cadeia produtiva
- **Redução de 15%** nas importações de combustíveis
- **Valorização de culturas** como cana-de-açúcar, milho e mandioca
- **Desenvolvimento rural** em todas as províncias

> "Esta lei representa um marco histórico. Angola está a posicionar-se como líder regional na transição para energias mais limpas", destacou a Ministra dos Recursos Minerais, Petróleo e Gás.

## Próximos Passos

Após a consulta pública, o anteprojecto será revisto e submetido à Assembleia Nacional para aprovação. A entrada em vigor está prevista para o segundo semestre de 2026.
    `,
  },
  {
    id: "producao-ndola-sul",
    title: "ANPG, CABGOC E PARCEIROS DO BLOCO 0 REGISTAM INÍCIO DE PRODUÇÃO DO PROJECTO N'DOLA SUL",
    date: "25 de Dezembro, 2025",
    category: "production",
    image: "https://anpg.co.ao/wp-content/uploads/2025/12/Bloco_0_Projecto-Ndola-Sul.jpg",
    excerpt: "Marco histórico com o início de produção do projecto N'Dola Sul no Bloco 0.",
    author: "ANPG Comunicação",
    tags: ["Produção", "Bloco 0", "CABGOC", "N'Dola Sul"],
    content: `
A ANPG, em conjunto com a CABGOC (Cabinda Gulf Oil Company) e os parceiros do Bloco 0, anunciou o início da produção do projecto N'Dola Sul, um marco significativo para a indústria petrolífera angolana.

## Detalhes do Projecto

O campo N'Dola Sul está localizado em águas profundas do Bloco 0, na província de Cabinda, e representa um investimento de aproximadamente **1,2 mil milhões de dólares**.

### Características Técnicas

- **Profundidade**: 800 metros de lâmina d'água
- **Reservas estimadas**: 200 milhões de barris de petróleo
- **Produção inicial**: 30.000 barris por dia
- **Pico de produção previsto**: 50.000 barris por dia
- **Vida útil estimada**: 20 anos

## Consórcio do Bloco 0

O Bloco 0 é operado pela CABGOC (subsidiária da Chevron) com a seguinte composição:

| Empresa | Participação |
|---------|--------------|
| CABGOC (Operador) | 39,2% |
| Sonangol | 41% |
| TotalEnergies | 10% |
| Eni | 9,8% |

## Impacto Económico

O projecto N'Dola Sul contribuirá significativamente para a economia nacional:

- **Receitas fiscais**: Estimadas em 500 milhões de dólares anuais
- **Emprego local**: 500 postos de trabalho directos
- **Conteúdo local**: 60% dos contratos atribuídos a empresas angolanas

### Tecnologia Inovadora

O desenvolvimento utilizou tecnologias de ponta:

1. Sistema de produção submarina avançado
2. Injecção de água para maximização da recuperação
3. Monitorização remota em tempo real
4. Sistemas de segurança de última geração

## Cerimónia de Inauguração

A cerimónia de início de produção contou com a presença de:

- Ministro dos Recursos Minerais, Petróleo e Gás
- Presidente do Conselho de Administração da ANPG
- Representantes da Chevron e parceiros
- Autoridades provinciais de Cabinda

> "O N'Dola Sul demonstra que Angola continua a ser um destino atraente para investimentos petrolíferos. Este projecto reforça a nossa capacidade produtiva e gera benefícios para todo o país", afirmou o Presidente da ANPG.

## Perspectivas Futuras

O sucesso do N'Dola Sul abre caminho para o desenvolvimento de outros campos no Bloco 0, com potencial para adicionar mais 100.000 barris diários à produção nacional até 2030.
    `,
  },
  {
    id: "panorama-energetico-2035",
    title: "ANPG AVALIA PANORAMA ENERGÉTICO E OPORTUNIDADES PARA ANGOLA ATÉ 2035",
    date: "12 de Dezembro, 2025",
    category: "highlight",
    image: "https://anpg.co.ao/wp-content/uploads/2025/12/Capa_website_Energetico.jpg",
    excerpt: "Análise estratégica das oportunidades e desafios do sector energético angolano para a próxima década.",
    author: "ANPG Comunicação",
    tags: ["Estratégia", "Energia", "Futuro", "Transição Energética"],
    content: `
A ANPG divulgou um estudo abrangente sobre o panorama energético de Angola e as oportunidades de desenvolvimento para o período até 2035, oferecendo uma visão estratégica para orientar políticas e investimentos.

## Contexto Global

O estudo analisa as tendências globais do sector energético e o seu impacto em Angola:

- Transição energética acelerada nos países desenvolvidos
- Crescimento da procura por gás natural
- Aumento dos investimentos em energias renováveis
- Novas tecnologias de captura de carbono

### Cenários Prospectivos

O documento apresenta três cenários para o sector energético angolano:

1. **Cenário Base**: Manutenção das políticas actuais
2. **Cenário Acelerado**: Transição energética rápida
3. **Cenário Optimizado**: Desenvolvimento equilibrado

## Oportunidades Identificadas

### Sector Petrolífero

- Exploração de novas bacias sedimentares
- Desenvolvimento de campos marginais
- Recuperação melhorada em campos maduros
- Monetização de reservas de gás associado

### Gás Natural

O estudo destaca o gás natural como ponte para a transição energética:

- Projecto Angola LNG (expansão)
- Gasificação doméstica
- Indústria petroquímica
- Geração de electricidade

### Energias Renováveis

Angola possui potencial significativo em:

- **Solar**: 5,5 kWh/m²/dia de radiação média
- **Hídrica**: 18.000 MW de potencial instalável
- **Eólica**: Zonas costeiras com ventos favoráveis
- **Biomassa**: Resíduos agrícolas e florestais

## Investimentos Necessários

O estudo estima necessidades de investimento de:

| Sector | 2025-2030 | 2030-2035 |
|--------|-----------|-----------|
| Upstream O&G | $25 mil milhões | $20 mil milhões |
| Gás Natural | $10 mil milhões | $15 mil milhões |
| Renováveis | $5 mil milhões | $10 mil milhões |
| Infraestruturas | $8 mil milhões | $12 mil milhões |

## Recomendações Estratégicas

O relatório conclui com recomendações:

1. Diversificar a base produtiva de hidrocarbonetos
2. Acelerar o desenvolvimento do sector do gás
3. Investir em capacitação técnica nacional
4. Criar incentivos para energias limpas
5. Fortalecer parcerias internacionais

> "Este estudo é um instrumento fundamental para a tomada de decisões. Angola tem recursos e oportunidades para se tornar um líder energético regional", concluiu o Presidente da ANPG.

O documento completo está disponível para consulta no portal da ANPG.
    `,
  },
];

export const getCategoryLabel = (category: string) => {
  switch (category) {
    case "press": return "Comunicado";
    case "tender": return "Licitação";
    case "highlight": return "Destaque";
    case "production": return "Produção";
    case "imprensa": return "Imprensa";
    default: return category;
  }
};

export const getCategoryColor = (category: string) => {
  switch (category) {
    case "press": return "bg-status-info/10 text-status-info-foreground border-status-info/20";
    case "tender": return "bg-status-warning/10 text-status-warning-foreground border-status-warning/20";
    case "highlight": return "bg-primary/10 text-primary border-primary/20";
    case "production": return "bg-status-success/10 text-status-success-foreground border-status-success/20";
    case "imprensa": return "bg-purple-50 text-purple-700 border-purple-200";
    default: return "bg-muted text-muted-foreground";
  }
};
