
-- =============================================
-- FASE 1: CMS COMPLETO - TABELAS BASE
-- =============================================

-- 1. CONTENT BLOCKS - Secções editáveis do site (hero, stats, services, etc.)
CREATE TABLE public.content_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_key TEXT NOT NULL,
  section_key TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  language TEXT NOT NULL DEFAULT 'pt',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(page_key, section_key, language)
);

ALTER TABLE public.content_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active content blocks"
  ON public.content_blocks FOR SELECT
  USING (is_active = true);

CREATE POLICY "Content editors can manage content blocks"
  ON public.content_blocks FOR ALL
  USING (can_manage_content(auth.uid()));

CREATE TRIGGER update_content_blocks_updated_at
  BEFORE UPDATE ON public.content_blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. MENU ITEMS - Navegação dinâmica
CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
  label_pt TEXT NOT NULL,
  label_en TEXT,
  url TEXT,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  menu_group TEXT NOT NULL DEFAULT 'main',
  open_in_new_tab BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read visible menu items"
  ON public.menu_items FOR SELECT
  USING (is_visible = true);

CREATE POLICY "Content editors can manage menu items"
  ON public.menu_items FOR ALL
  USING (can_manage_content(auth.uid()));

CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. BOARD MEMBERS - Conselho de Administração
CREATE TABLE public.board_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  title_pt TEXT NOT NULL,
  title_en TEXT,
  role_pt TEXT,
  role_en TEXT,
  bio_pt TEXT,
  bio_en TEXT,
  message_pt TEXT,
  message_en TEXT,
  photo_url TEXT,
  email TEXT,
  phone TEXT,
  office_location TEXT,
  group_key TEXT NOT NULL DEFAULT 'board',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.board_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active board members"
  ON public.board_members FOR SELECT
  USING (is_active = true);

CREATE POLICY "Content editors can manage board members"
  ON public.board_members FOR ALL
  USING (can_manage_content(auth.uid()));

CREATE TRIGGER update_board_members_updated_at
  BEFORE UPDATE ON public.board_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. FAQ ITEMS
CREATE TABLE public.faq_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_pt TEXT NOT NULL,
  question_en TEXT,
  answer_pt TEXT NOT NULL,
  answer_en TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active FAQ items"
  ON public.faq_items FOR SELECT
  USING (is_active = true);

CREATE POLICY "Content editors can manage FAQ items"
  ON public.faq_items FOR ALL
  USING (can_manage_content(auth.uid()));

CREATE TRIGGER update_faq_items_updated_at
  BEFORE UPDATE ON public.faq_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. PAGE BANNERS - Heroes por página
CREATE TABLE public.page_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_key TEXT NOT NULL UNIQUE,
  title_pt TEXT,
  title_en TEXT,
  subtitle_pt TEXT,
  subtitle_en TEXT,
  image_url TEXT,
  overlay_opacity NUMERIC DEFAULT 0.6,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.page_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active banners"
  ON public.page_banners FOR SELECT
  USING (is_active = true);

CREATE POLICY "Content editors can manage banners"
  ON public.page_banners FOR ALL
  USING (can_manage_content(auth.uid()));

CREATE TRIGGER update_page_banners_updated_at
  BEFORE UPDATE ON public.page_banners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. HISTORY EVENTS - Timeline histórica
CREATE TABLE public.history_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  title_pt TEXT NOT NULL,
  title_en TEXT,
  description_pt TEXT,
  description_en TEXT,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.history_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active history events"
  ON public.history_events FOR SELECT
  USING (is_active = true);

CREATE POLICY "Content editors can manage history events"
  ON public.history_events FOR ALL
  USING (can_manage_content(auth.uid()));

CREATE TRIGGER update_history_events_updated_at
  BEFORE UPDATE ON public.history_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add audit triggers to all new tables
CREATE TRIGGER audit_content_blocks
  AFTER INSERT OR UPDATE OR DELETE ON public.content_blocks
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

CREATE TRIGGER audit_menu_items
  AFTER INSERT OR UPDATE OR DELETE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

CREATE TRIGGER audit_board_members
  AFTER INSERT OR UPDATE OR DELETE ON public.board_members
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

CREATE TRIGGER audit_faq_items
  AFTER INSERT OR UPDATE OR DELETE ON public.faq_items
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

CREATE TRIGGER audit_page_banners
  AFTER INSERT OR UPDATE OR DELETE ON public.page_banners
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

CREATE TRIGGER audit_history_events
  AFTER INSERT OR UPDATE OR DELETE ON public.history_events
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();
