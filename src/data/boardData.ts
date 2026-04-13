import paulinoPhoto from "@/assets/board/paulino-jeronimo.jpg";
import arturPhoto from "@/assets/board/artur-custodio.jpg";
import anaPhoto from "@/assets/board/ana-miala.jpg";
import nicolaPhoto from "@/assets/board/nicola-mvuayi.jpg";
import alcidesPhoto from "@/assets/board/alcides-andrade.jpg";

export interface Department {
  name: string;
  nameEn: string;
  acronym: string;
  subDepartments?: { name: string; nameEn: string }[];
}

export interface OfficeContact {
  phone?: string;
  email?: string;
  office?: string;
  officeEn?: string;
}

export interface BoardMember {
  id: string;
  slug: string;
  name: string;
  role: string;
  roleEn: string;
  isPCA: boolean;
  initials: string;
  photo: string;
  bio: string;
  bioEn: string;
  message: string;
  messageEn: string;
  contact: OfficeContact;
  departments: Department[];
}

export const boardMembers: BoardMember[] = [
  {
    id: "pca",
    slug: "paulino-jeronimo",
    name: "Paulino Jerónimo",
    role: "Presidente do Conselho de Administração",
    roleEn: "Chairman of the Board of Directors",
    isPCA: true,
    initials: "PJ",
    photo: paulinoPhoto,
    bio: "Engenheiro de Petróleos com mais de 30 anos de experiência no sector petrolífero angolano. Liderou diversas iniciativas estratégicas no upstream e na regulação do sector energético nacional, contribuindo para o crescimento sustentável da produção de hidrocarbonetos em Angola.",
    bioEn: "Petroleum Engineer with over 30 years of experience in the Angolan oil sector. He has led various strategic initiatives in upstream and national energy sector regulation, contributing to the sustainable growth of hydrocarbon production in Angola.",
    message: "A ANPG tem como missão gerir, regular e promover a exploração e produção de hidrocarbonetos em Angola de forma eficiente, transparente e sustentável. Trabalhamos para maximizar o valor dos recursos petrolíferos nacionais em benefício de todos os angolanos.",
    messageEn: "ANPG's mission is to manage, regulate and promote the exploration and production of hydrocarbons in Angola efficiently, transparently and sustainably. We work to maximise the value of national petroleum resources for the benefit of all Angolans.",
    contact: {
      phone: "+244 226 428 001",
      email: "presidencia@anpg.co.ao",
      office: "Gabinete da Presidência, Edifício Torres do Carmo - Torre 2, Luanda",
      officeEn: "Office of the Chairman, Torres do Carmo Building - Tower 2, Luanda",
    },
    departments: [
      {
        name: "Gabinete de Apoio ao Conselho de Administração",
        nameEn: "Board of Directors Support Office",
        acronym: "GACA",
      },
      {
        name: "Gabinete de Planeamento Estratégico",
        nameEn: "Strategic Planning Office",
        acronym: "GPE",
      },
      {
        name: "Gabinete Jurídico",
        nameEn: "Legal Office",
        acronym: "GABJUR",
      },
      {
        name: "Gabinete de Auditoria e Integridade",
        nameEn: "Audit and Integrity Office",
        acronym: "GAI",
      },
    ],
  },
  {
    id: "admin1",
    slug: "artur-custodio",
    name: "Artur Custódio",
    role: "Administrador",
    roleEn: "Board Member",
    isPCA: false,
    initials: "AC",
    photo: arturPhoto,
    bio: "Profissional com vasta experiência em tecnologias de informação, segurança industrial e gestão ambiental no sector energético. Tem liderado a transformação digital da ANPG e a implementação de políticas de sustentabilidade e conteúdo local.",
    bioEn: "Professional with extensive experience in information technology, industrial safety and environmental management in the energy sector. He has led ANPG's digital transformation and the implementation of sustainability and local content policies.",
    message: "A inovação tecnológica e a sustentabilidade ambiental são pilares fundamentais para o futuro do sector petrolífero angolano. Estamos comprometidos em desenvolver soluções que conciliem o progresso económico com a preservação do meio ambiente.",
    messageEn: "Technological innovation and environmental sustainability are fundamental pillars for the future of Angola's petroleum sector. We are committed to developing solutions that reconcile economic progress with environmental preservation.",
    contact: {
      phone: "+244 226 428 002",
      email: "gti@anpg.co.ao",
      office: "Gabinete do Administrador, Edifício Torres do Carmo - Torre 2, Luanda",
      officeEn: "Board Member Office, Torres do Carmo Building - Tower 2, Luanda",
    },
    departments: [
      {
        name: "Gabinete de Tecnologias de Informação",
        nameEn: "Information Technology Office",
        acronym: "GTI",
      },
      {
        name: "Gabinete de Segurança e Ambiente",
        nameEn: "Safety and Environment Office",
        acronym: "GSA",
      },
      {
        name: "Núcleo do Conteúdo Local",
        nameEn: "Local Content Unit",
        acronym: "NCL",
      },
      {
        name: "Núcleo dos Biocombustíveis",
        nameEn: "Biofuels Unit",
        acronym: "NB",
      },
    ],
  },
  {
    id: "admin2",
    slug: "ana-miala",
    name: "Ana Miala",
    role: "Administradora",
    roleEn: "Board Member",
    isPCA: false,
    initials: "AM",
    photo: anaPhoto,
    bio: "Engenheira Geóloga com experiência consolidada nas áreas de exploração e produção petrolífera. Tem desempenhado um papel fundamental na supervisão das operações técnicas e no controlo das concessões petrolíferas em Angola.",
    bioEn: "Geological Engineer with consolidated experience in petroleum exploration and production. She has played a key role in supervising technical operations and controlling petroleum concessions in Angola.",
    message: "A exploração responsável dos nossos recursos naturais exige rigor técnico e compromisso com as melhores práticas internacionais. As nossas equipas técnicas trabalham incansavelmente para garantir a excelência operacional em todas as concessões.",
    messageEn: "The responsible exploration of our natural resources requires technical rigour and commitment to international best practices. Our technical teams work tirelessly to ensure operational excellence across all concessions.",
    contact: {
      phone: "+244 226 428 003",
      email: "dex@anpg.co.ao",
      office: "Gabinete da Administradora, Edifício Torres do Carmo - Torre 2, Luanda",
      officeEn: "Board Member Office, Torres do Carmo Building - Tower 2, Luanda",
    },
    departments: [
      {
        name: "Direcção de Exploração",
        nameEn: "Exploration Directorate",
        acronym: "DEX",
        subDepartments: [
          { name: "Departamento de Geologia", nameEn: "Geology Department" },
          { name: "Departamento de Geofísica", nameEn: "Geophysics Department" },
          { name: "Departamento de Novas Zonas de Exploração", nameEn: "New Exploration Zones Department" },
        ],
      },
      {
        name: "Direcção de Produção",
        nameEn: "Production Directorate",
        acronym: "PRO",
        subDepartments: [
          { name: "Departamento de Sondagem", nameEn: "Drilling Department" },
          { name: "Departamento de Produção", nameEn: "Production Department" },
          { name: "Departamento de Reservatórios", nameEn: "Reservoirs Department" },
          { name: "Departamento de Instalações Petrolíferas", nameEn: "Petroleum Facilities Department" },
        ],
      },
      {
        name: "Direcção de Controlo das Concessões",
        nameEn: "Concessions Control Directorate",
        acronym: "DCC",
      },
    ],
  },
  {
    id: "admin3",
    slug: "nicola-mvuayi",
    name: "Nicola Isabel Lemos de Mvuayi",
    role: "Administradora",
    roleEn: "Board Member",
    isPCA: false,
    initials: "NM",
    photo: nicolaPhoto,
    bio: "Gestora com formação em recursos humanos e administração financeira. Tem liderado a modernização dos processos administrativos e financeiros da ANPG, bem como iniciativas de comunicação institucional e responsabilidade social.",
    bioEn: "Manager with training in human resources and financial administration. She has led the modernisation of ANPG's administrative and financial processes, as well as institutional communication and social responsibility initiatives.",
    message: "O capital humano é o nosso recurso mais valioso. Investimos continuamente na formação e desenvolvimento profissional das nossas equipas, promovendo um ambiente de trabalho inclusivo e comprometido com a excelência.",
    messageEn: "Human capital is our most valuable resource. We continuously invest in the training and professional development of our teams, promoting an inclusive work environment committed to excellence.",
    contact: {
      phone: "+244 226 428 004",
      email: "drh@anpg.co.ao",
      office: "Gabinete da Administradora, Edifício Torres do Carmo - Torre 2, Luanda",
      officeEn: "Board Member Office, Torres do Carmo Building - Tower 2, Luanda",
    },
    departments: [
      {
        name: "Direcção de Recursos Humanos",
        nameEn: "Human Resources Directorate",
        acronym: "DRH",
        subDepartments: [
          { name: "Departamento de Recrutamento, Formação e Carreiras", nameEn: "Recruitment, Training and Careers Department" },
          { name: "Departamento Administrativo e Contencioso Laboral", nameEn: "Administrative and Labour Litigation Department" },
        ],
      },
      {
        name: "Direcção de Administração e Finanças",
        nameEn: "Administration and Finance Directorate",
        acronym: "DAF",
        subDepartments: [
          { name: "Departamento de Finanças", nameEn: "Finance Department" },
          { name: "Departamento Administrativo", nameEn: "Administrative Department" },
          { name: "Secretaria Geral", nameEn: "General Secretariat" },
        ],
      },
      {
        name: "Gabinete de Comunicação",
        nameEn: "Communications Office",
        acronym: "GC",
      },
      {
        name: "Núcleo de Responsabilidade Social",
        nameEn: "Social Responsibility Unit",
        acronym: "NRS",
      },
    ],
  },
  {
    id: "admin4",
    slug: "alcides-andrade",
    name: "Alcides Andrade",
    role: "Administrador",
    roleEn: "Board Member",
    isPCA: false,
    initials: "AA",
    photo: alcidesPhoto,
    bio: "Especialista em negociações e economia das concessões petrolíferas. Tem vasta experiência na gestão contratual, comercialização de hidrocarbonetos e análise económica de projectos de exploração e produção.",
    bioEn: "Specialist in negotiations and petroleum concession economics. He has extensive experience in contract management, hydrocarbon commercialisation and economic analysis of exploration and production projects.",
    message: "A gestão eficiente das concessões e a transparência nas negociações são essenciais para atrair investimento e maximizar o retorno dos recursos petrolíferos para Angola. Trabalhamos com padrões internacionais de excelência.",
    messageEn: "Efficient concession management and transparency in negotiations are essential to attract investment and maximise the return on petroleum resources for Angola. We work to international standards of excellence.",
    contact: {
      phone: "+244 226 428 005",
      email: "dneg@anpg.co.ao",
      office: "Gabinete do Administrador, Edifício Torres do Carmo - Torre 2, Luanda",
      officeEn: "Board Member Office, Torres do Carmo Building - Tower 2, Luanda",
    },
    departments: [
      {
        name: "Direcção de Negociações",
        nameEn: "Negotiations Directorate",
        acronym: "DNEG",
        subDepartments: [
          { name: "Departamento de Contratos das Concessões", nameEn: "Concession Contracts Department" },
          { name: "Departamento de Negociações", nameEn: "Negotiations Department" },
          { name: "Núcleo de Comercialização", nameEn: "Commercialisation Unit" },
        ],
      },
      {
        name: "Direcção de Economia das Concessões",
        nameEn: "Concessions Economics Directorate",
        acronym: "DEC",
        subDepartments: [
          { name: "Departamento de Estudos Económicos", nameEn: "Economic Studies Department" },
          { name: "Departamento de Auditoria dos Custos Recuperáveis", nameEn: "Recoverable Costs Audit Department" },
          { name: "Departamento de Gestão do Património", nameEn: "Asset Management Department" },
          { name: "Departamento de Homologação dos Custos Recuperáveis", nameEn: "Recoverable Costs Approval Department" },
        ],
      },
      {
        name: "Gabinete de Arquivo e Gestão de Dados",
        nameEn: "Archive and Data Management Office",
        acronym: "GAD",
      },
      {
        name: "Gabinete de Segurança Institucional",
        nameEn: "Institutional Security Office",
        acronym: "GSI",
      },
    ],
  },
];

export const supervisionBodies = [
  { name: "Conselho Fiscal", nameEn: "Fiscal Council" },
  { name: "Conselho Técnico", nameEn: "Technical Council" },
];

export function getBoardMemberBySlug(slug: string): BoardMember | undefined {
  return boardMembers.find((m) => m.slug === slug);
}
