// Dados estáticos de fallback para todas as páginas
// Partilhado entre usePageData e AdminPageEditorPage

import homeData from '@/data/pages/home.json';
import aboutData from '@/data/pages/about.json';
import explorationData from '@/data/pages/exploration.json';
import pcaMessageData from '@/data/pages/pcaMessage.json';
import anpgData from '@/data/pages/anpg.json';
import historyData from '@/data/pages/history.json';
import socialResponsibilityData from '@/data/pages/socialResponsibility.json';
import contactsData from '@/data/pages/contacts.json';
import opportunitiesData from '@/data/pages/opportunities.json';
import tender2025Data from '@/data/pages/tender2025.json';
import permanentOfferData from '@/data/pages/permanentOffer.json';
import tender2023Data from '@/data/pages/tender2023.json';
import gasData from '@/data/pages/gas.json';
import whistleblowerData from '@/data/pages/whistleblower.json';
import epDataData from '@/data/pages/epData.json';
import ionaData from '@/data/pages/iona.json';
import oasisData from '@/data/pages/oasis.json';
import dataPackagesData from '@/data/pages/dataPackages.json';
import epMapsData from '@/data/pages/epMaps.json';
import blockDetailsData from '@/data/pages/blockDetails.json';
import conference2021Data from '@/data/pages/conference2021.json';
import conference2023Data from '@/data/pages/conference2023.json';
import mediaData from '@/data/pages/media.json';
import eventsData from '@/data/pages/events.json';
import productionData from '@/data/pages/production.json';
import productionHistoryData from '@/data/pages/productionHistory.json';
import localContentData from '@/data/pages/localContent.json';
import investorPortalData from '@/data/pages/investorPortal.json';
import privacyData from '@/data/pages/privacy.json';
import termsData from '@/data/pages/terms.json';
import energyIntegrationData from '@/data/pages/energyIntegration.json';
import licensingData from '@/data/pages/licensing.json';
import oversightData from '@/data/pages/oversight.json';
import tendersPageData from '@/data/pages/tendersPage.json';
import tender2025ContentData from '@/data/pages/tender2025Content.json';
import dataPageData from '@/data/pages/dataPage.json';
import productionHistoryContentData from '@/data/pages/productionHistoryContent.json';
import regulationData from '@/data/pages/regulation.json';
import sustainabilityData from '@/data/pages/sustainability.json';
import faqData from '@/data/pages/faq.json';
import newsArchiveData from '@/data/pages/newsArchive.json';
import boardMemberData from '@/data/pages/boardMember.json';
import eventDetailData from '@/data/pages/eventDetail.json';
import newsDetailData from '@/data/pages/newsDetail.json';

export const STATIC_PAGE_DATA: Record<string, any> = {
  home: homeData,
  about: aboutData,
  exploration: explorationData,
  pcaMessage: pcaMessageData,
  anpg: anpgData,
  history: historyData,
  socialResponsibility: socialResponsibilityData,
  contacts: contactsData,
  opportunities: opportunitiesData,
  tender2025: tender2025Data,
  permanentOffer: permanentOfferData,
  tender2023: tender2023Data,
  gas: gasData,
  whistleblower: whistleblowerData,
  epData: epDataData,
  iona: ionaData,
  oasis: oasisData,
  dataPackages: dataPackagesData,
  epMaps: epMapsData,
  blockDetails: blockDetailsData,
  conference2021: conference2021Data,
  conference2023: conference2023Data,
  media: mediaData,
  events: eventsData,
  production: productionData,
  productionHistory: productionHistoryData,
  localContent: localContentData,
  investorPortal: investorPortalData,
  privacy: privacyData,
  terms: termsData,
  energyIntegration: energyIntegrationData,
  licensing: licensingData,
  oversight: oversightData,
  tendersPage: tendersPageData,
  tender2025Content: tender2025ContentData,
  dataPage: dataPageData,
  productionHistoryContent: productionHistoryContentData,
  regulation: regulationData,
  sustainability: sustainabilityData,
  faq: faqData,
  newsArchive: newsArchiveData,
  boardMember: boardMemberData,
  eventDetail: eventDetailData,
  newsDetail: newsDetailData,
};
