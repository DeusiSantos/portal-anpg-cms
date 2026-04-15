import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/layout/PageTransition";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// About pages
import AboutPage from "./pages/about/AboutPage";
import AnpgPage from "./pages/about/AnpgPage";
import HistoryPage from "./pages/about/HistoryPage";
import SocialResponsibilityPage from "./pages/about/SocialResponsibilityPage";
import BoardMemberPage from "./pages/about/BoardMemberPage";
import PcaMessagePage from "./pages/about/PcaMessagePage";
import ContactsPage from "./pages/ContactsPage";

// Opportunities pages
import OpportunitiesPage from "./pages/opportunities/OpportunitiesPage";
import Tender2025Page from "./pages/opportunities/Tender2025Page";
import PermanentOfferPage from "./pages/opportunities/PermanentOfferPage";
import Tender2023Page from "./pages/opportunities/Tender2023Page";
import EnergyIntegrationPage from "./pages/opportunities/EnergyIntegrationPage";
import GasPage from "./pages/opportunities/GasPage";

// Exploration pages
import ExplorationPage from "./pages/exploration/ExplorationPage";
import SeismicCampaignsPage from "./pages/exploration/SeismicCampaignsPage";
import ProcessingPage from "./pages/exploration/ProcessingPage";
import NewAreasPage from "./pages/exploration/NewAreasPage";
import SeismicMapPage from "./pages/exploration/SeismicMapPage";

// E&P Data pages
import EpDataPage from "./pages/ep-data/EpDataPage";
import IonaPage from "./pages/ep-data/IonaPage";
import OasisPage from "./pages/ep-data/OasisPage";
import DataPackagesPage from "./pages/ep-data/DataPackagesPage";
import EpMapsPage from "./pages/ep-data/EpMapsPage";
import BlockDetailsPage from "./pages/ep-data/BlockDetailsPage";
import Conference2021Page from "./pages/ep-data/Conference2021Page";
import Conference2023Page from "./pages/ep-data/Conference2023Page";

// Regulation pages
import RegulationPage from "./pages/regulation/RegulationPage";
import LicensingPage from "./pages/regulation/LicensingPage";
import OversightPage from "./pages/regulation/OversightPage";
import TendersPage from "./pages/regulation/TendersPage";

// Other pages
import MediaPage from "./pages/MediaPage";
import EventsPage from "./pages/media/EventsPage";
import NewsArchivePage from "./pages/NewsArchivePage";
import NewsDetailPage from "./pages/NewsDetailPage";
import ProductionPage from "./pages/ProductionPage";
import ProductionHistoryPage from "./pages/production/ProductionHistoryPage";
import LocalContentPage from "./pages/LocalContentPage";
import DataPage from "./pages/DataPage";
import SustainabilityPage from "./pages/SustainabilityPage";
import InvestorPortalPage from "./pages/investor/InvestorPortalPage";
import InvestorLoginPage from "./pages/investor/InvestorLoginPage";
import InvestorResetPasswordPage from "./pages/investor/InvestorResetPasswordPage";
import PrivacyPage from "./pages/legal/PrivacyPage";
import TermsPage from "./pages/legal/TermsPage";
import FAQPage from "./pages/FAQPage";
import WhistleblowerPage from "./pages/WhistleblowerPage";

// Admin pages
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminResetPasswordPage from "./pages/admin/AdminResetPasswordPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminNewsPage from "./pages/admin/AdminNewsPage";
import AdminNewsEditorPage from "./pages/admin/AdminNewsEditorPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminBlocksPage from "./pages/admin/AdminBlocksPage";
import AdminCMSPage from "./pages/admin/AdminCMSPage";
import AdminProductionPage from "./pages/admin/AdminProductionPage";
import AdminEOIPage from "./pages/admin/AdminEOIPage";
import AdminDocumentsPage from "./pages/admin/AdminDocumentsPage";
import AdminAuditPage from "./pages/admin/AdminAuditPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminKnowledgeBasePage from "./pages/admin/AdminKnowledgeBasePage";
import AdminContentBlocksPage from "./pages/admin/AdminContentBlocksPage";
import AdminMenuItemsPage from "./pages/admin/AdminMenuItemsPage";
import AdminBoardMembersPage from "./pages/admin/AdminBoardMembersPage";
import AdminFAQPage from "./pages/admin/AdminFAQPage";
import AdminPageBannersPage from "./pages/admin/AdminPageBannersPage";
import AdminHistoryEventsPage from "./pages/admin/AdminHistoryEventsPage";
import AdminHeroSlidesPage from "./pages/admin/AdminHeroSlidesPage";
import AdminHomepageContentPage from "./pages/admin/AdminHomepageContentPage";
import AdminMediaPage from "./pages/admin/AdminMediaPage";
import AdminInvestorsPage from "./pages/admin/AdminInvestorsPage";
import AdminSitePagesPage from "./pages/admin/AdminSitePagesPage";
import AdminPageEditorPage from "./pages/admin/AdminPageEditorPage";
import { SobaWidget } from "./components/chat/SobaWidget";
import { ScrollToTop } from "./components/ScrollToTop";
const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <ScrollToTop />
      <PageTransition key={location.pathname}>
        <Routes location={location}>
          <Route path="/" element={<Index />} />
          
          {/* About Us */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/about/pca-message" element={<PcaMessagePage />} />
          <Route path="/about/anpg" element={<AnpgPage />} />
          <Route path="/about/board/:slug" element={<BoardMemberPage />} />
          <Route path="/about/history" element={<HistoryPage />} />
          <Route path="/about/social-responsibility" element={<SocialResponsibilityPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          
          {/* Opportunities */}
          <Route path="/opportunities" element={<OpportunitiesPage />} />
          <Route path="/opportunities/tender-2025" element={<Tender2025Page />} />
          <Route path="/opportunities/permanent-offer" element={<PermanentOfferPage />} />
          <Route path="/opportunities/tender-2023" element={<Tender2023Page />} />
          <Route path="/opportunities/energy-integration" element={<EnergyIntegrationPage />} />
          <Route path="/opportunities/gas" element={<GasPage />} />
          
          {/* E&P Data */}
          <Route path="/ep-data" element={<EpDataPage />} />
          <Route path="/ep-data/iona" element={<IonaPage />} />
          <Route path="/ep-data/oasis" element={<OasisPage />} />
          <Route path="/ep-data/packages" element={<DataPackagesPage />} />
          <Route path="/ep-data/maps" element={<EpMapsPage />} />
          <Route path="/ep-data/blocks/:blockId" element={<BlockDetailsPage />} />
          <Route path="/ep-data/conference-2021" element={<Conference2021Page />} />
          <Route path="/ep-data/conference-2023" element={<Conference2023Page />} />
          
          {/* Exploration */}
          <Route path="/exploration" element={<ExplorationPage />} />
          <Route path="/exploration/seismic-campaigns" element={<SeismicCampaignsPage />} />
          <Route path="/exploration/processing" element={<ProcessingPage />} />
          <Route path="/exploration/new-areas" element={<NewAreasPage />} />
          <Route path="/exploration/seismic-2d" element={<SeismicMapPage type="2d" />} />
          <Route path="/exploration/seismic-3d" element={<SeismicMapPage type="3d" />} />
          <Route path="/exploration/seismic-4d" element={<SeismicMapPage type="4d" />} />
          
          {/* Regulation pages */}
          <Route path="/regulation" element={<RegulationPage />} />
          <Route path="/regulation/licensing" element={<LicensingPage />} />
          <Route path="/regulation/oversight" element={<OversightPage />} />
          <Route path="/regulation/tenders" element={<TendersPage />} />
          
          {/* Other pages */}
          <Route path="/media" element={<MediaPage />} />
          <Route path="/media/events" element={<EventsPage />} />
          <Route path="/media/archive" element={<NewsArchivePage />} />
          <Route path="/news/:newsId" element={<NewsDetailPage />} />
          <Route path="/production" element={<ProductionPage />} />
          <Route path="/production/history" element={<ProductionHistoryPage />} />
          <Route path="/local-content" element={<LocalContentPage />} />
          <Route path="/data" element={<DataPage />} />
          <Route path="/sustainability" element={<SustainabilityPage />} />
          <Route path="/investor-portal" element={<InvestorPortalPage />} />
          <Route path="/investor-portal/login" element={<InvestorLoginPage />} />
          <Route path="/investor-portal/reset-password" element={<InvestorResetPasswordPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/whistleblower" element={<WhistleblowerPage />} />
          
          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/reset-password" element={<AdminResetPasswordPage />} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/news" element={<ProtectedRoute requiredPermission="content"><AdminNewsPage /></ProtectedRoute>} />
          <Route path="/admin/news/:id" element={<ProtectedRoute requiredPermission="content"><AdminNewsEditorPage /></ProtectedRoute>} />
          <Route path="/admin/pages" element={<ProtectedRoute requiredPermission="content"><AdminCMSPage /></ProtectedRoute>} />
          <Route path="/admin/blocks" element={<ProtectedRoute requiredPermission="operations"><AdminBlocksPage /></ProtectedRoute>} />
          <Route path="/admin/production" element={<ProtectedRoute requiredPermission="operations"><AdminProductionPage /></ProtectedRoute>} />
          <Route path="/admin/eoi" element={<ProtectedRoute requiredPermission="investors"><AdminEOIPage /></ProtectedRoute>} />
          <Route path="/admin/documents" element={<ProtectedRoute requiredPermission="investors"><AdminDocumentsPage /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute requiredPermission="admin"><AdminUsersPage /></ProtectedRoute>} />
          <Route path="/admin/audit" element={<ProtectedRoute requiredPermission="admin"><AdminAuditPage /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute requiredPermission="admin"><AdminSettingsPage /></ProtectedRoute>} />
          <Route path="/admin/knowledge-base" element={<ProtectedRoute requiredPermission="content"><AdminKnowledgeBasePage /></ProtectedRoute>} />
          <Route path="/admin/content-blocks" element={<ProtectedRoute requiredPermission="content"><AdminContentBlocksPage /></ProtectedRoute>} />
          <Route path="/admin/menu-items" element={<ProtectedRoute requiredPermission="content"><AdminMenuItemsPage /></ProtectedRoute>} />
          <Route path="/admin/board-members" element={<ProtectedRoute requiredPermission="content"><AdminBoardMembersPage /></ProtectedRoute>} />
          <Route path="/admin/faq" element={<ProtectedRoute requiredPermission="content"><AdminFAQPage /></ProtectedRoute>} />
          <Route path="/admin/page-banners" element={<ProtectedRoute requiredPermission="content"><AdminPageBannersPage /></ProtectedRoute>} />
          <Route path="/admin/history-events" element={<ProtectedRoute requiredPermission="content"><AdminHistoryEventsPage /></ProtectedRoute>} />
          <Route path="/admin/hero-slides" element={<ProtectedRoute requiredPermission="content"><AdminHeroSlidesPage /></ProtectedRoute>} />
          <Route path="/admin/homepage-content" element={<ProtectedRoute requiredPermission="content"><AdminHomepageContentPage /></ProtectedRoute>} />
          <Route path="/admin/media" element={<ProtectedRoute requiredPermission="content"><AdminMediaPage /></ProtectedRoute>} />
          <Route path="/admin/investors" element={<ProtectedRoute requiredPermission="investors"><AdminInvestorsPage /></ProtectedRoute>} />
          <Route path="/admin/site-pages" element={<ProtectedRoute requiredPermission="content"><AdminSitePagesPage /></ProtectedRoute>} />
          <Route path="/admin/site-pages/:pageKey" element={<ProtectedRoute requiredPermission="content"><AdminPageEditorPage /></ProtectedRoute>} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </PageTransition>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnimatedRoutes />
          <SobaWidget />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
