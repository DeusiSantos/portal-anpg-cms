-- =============================================
-- ANPG BACKOFFICE - DATABASE SCHEMA
-- =============================================

-- 1. Create role enum type
CREATE TYPE public.app_role AS ENUM (
  'admin',
  'editor_comunicacao',
  'editor_tecnico',
  'gestor_investidores',
  'viewer'
);

-- 2. Create department enum type
CREATE TYPE public.department AS ENUM (
  'administracao',
  'comunicacao',
  'tecnico',
  'investimentos',
  'ti'
);

-- =============================================
-- USER ROLES TABLE (separate from profiles for security)
-- =============================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  department public.department,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- HELPER FUNCTIONS (SECURITY DEFINER)
-- =============================================

-- Check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- Check if user can manage content (admin or editor_comunicacao)
CREATE OR REPLACE FUNCTION public.can_manage_content(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin') OR public.has_role(_user_id, 'editor_comunicacao')
$$;

-- Check if user can manage operational data (admin or editor_tecnico)
CREATE OR REPLACE FUNCTION public.can_manage_operations(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin') OR public.has_role(_user_id, 'editor_tecnico')
$$;

-- Check if user can manage investors (admin or gestor_investidores)
CREATE OR REPLACE FUNCTION public.can_manage_investors(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin') OR public.has_role(_user_id, 'gestor_investidores')
$$;

-- Check if user has any backoffice access
CREATE OR REPLACE FUNCTION public.has_backoffice_access(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
  )
$$;

-- =============================================
-- NEWS ARTICLES TABLE
-- =============================================
CREATE TABLE public.news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  featured_image TEXT,
  author_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  category TEXT DEFAULT 'geral',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- CMS PAGES TABLE
-- =============================================
CREATE TABLE public.cms_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  meta_description TEXT,
  author_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PETROLEUM BLOCKS TABLE
-- =============================================
CREATE TABLE public.petroleum_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_name TEXT NOT NULL UNIQUE,
  basin TEXT,
  operator TEXT,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'awarded', 'producing', 'exploration', 'development')),
  water_depth_m INTEGER,
  area_km2 NUMERIC(10,2),
  consortium JSONB DEFAULT '[]'::jsonb,
  coordinates JSONB,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.petroleum_blocks ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PRODUCTION STATISTICS TABLE
-- =============================================
CREATE TABLE public.production_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id UUID REFERENCES public.petroleum_blocks(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER CHECK (month >= 1 AND month <= 12),
  oil_production_bpd NUMERIC(12,2),
  gas_production_mmscfd NUMERIC(12,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.production_statistics ENABLE ROW LEVEL SECURITY;

-- =============================================
-- EXPRESSIONS OF INTEREST TABLE
-- =============================================
CREATE TABLE public.expressions_of_interest (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT,
  blocks_of_interest TEXT[],
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_by UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.expressions_of_interest ENABLE ROW LEVEL SECURITY;

-- =============================================
-- INVESTOR DOCUMENTS TABLE
-- =============================================
CREATE TABLE public.investor_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general' CHECK (category IN ('legislation', 'contracts', 'brochures', 'technical', 'general')),
  file_url TEXT NOT NULL,
  file_size_bytes BIGINT,
  uploaded_by UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.investor_documents ENABLE ROW LEVEL SECURITY;

-- =============================================
-- AUDIT LOGS TABLE
-- =============================================
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES - USER ROLES
-- =============================================
CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- =============================================
-- RLS POLICIES - PROFILES
-- =============================================
CREATE POLICY "Backoffice users can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_backoffice_access(auth.uid()));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL
  USING (public.is_admin(auth.uid()));

-- =============================================
-- RLS POLICIES - NEWS ARTICLES
-- =============================================
CREATE POLICY "Anyone can read published articles"
  ON public.news_articles FOR SELECT
  USING (status = 'published' AND published_at IS NOT NULL);

CREATE POLICY "Content editors can manage articles"
  ON public.news_articles FOR ALL
  USING (public.can_manage_content(auth.uid()));

CREATE POLICY "Backoffice users can view all articles"
  ON public.news_articles FOR SELECT
  USING (public.has_backoffice_access(auth.uid()));

-- =============================================
-- RLS POLICIES - CMS PAGES
-- =============================================
CREATE POLICY "Anyone can read published pages"
  ON public.cms_pages FOR SELECT
  USING (status = 'published' AND published_at IS NOT NULL);

CREATE POLICY "Content editors can manage pages"
  ON public.cms_pages FOR ALL
  USING (public.can_manage_content(auth.uid()));

CREATE POLICY "Backoffice users can view all pages"
  ON public.cms_pages FOR SELECT
  USING (public.has_backoffice_access(auth.uid()));

-- =============================================
-- RLS POLICIES - PETROLEUM BLOCKS
-- =============================================
CREATE POLICY "Anyone can read blocks"
  ON public.petroleum_blocks FOR SELECT
  USING (true);

CREATE POLICY "Operations editors can manage blocks"
  ON public.petroleum_blocks FOR ALL
  USING (public.can_manage_operations(auth.uid()));

-- =============================================
-- RLS POLICIES - PRODUCTION STATISTICS
-- =============================================
CREATE POLICY "Anyone can read production stats"
  ON public.production_statistics FOR SELECT
  USING (true);

CREATE POLICY "Operations editors can manage stats"
  ON public.production_statistics FOR ALL
  USING (public.can_manage_operations(auth.uid()));

-- =============================================
-- RLS POLICIES - EXPRESSIONS OF INTEREST
-- =============================================
CREATE POLICY "Investor managers can manage EOIs"
  ON public.expressions_of_interest FOR ALL
  USING (public.can_manage_investors(auth.uid()));

CREATE POLICY "Backoffice users can view EOIs"
  ON public.expressions_of_interest FOR SELECT
  USING (public.has_backoffice_access(auth.uid()));

-- =============================================
-- RLS POLICIES - INVESTOR DOCUMENTS
-- =============================================
CREATE POLICY "Anyone can read public documents"
  ON public.investor_documents FOR SELECT
  USING (is_public = true);

CREATE POLICY "Investor managers can manage documents"
  ON public.investor_documents FOR ALL
  USING (public.can_manage_investors(auth.uid()));

CREATE POLICY "Backoffice users can view all documents"
  ON public.investor_documents FOR SELECT
  USING (public.has_backoffice_access(auth.uid()));

-- =============================================
-- RLS POLICIES - AUDIT LOGS
-- =============================================
CREATE POLICY "Only admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- =============================================
-- UPDATED_AT TRIGGER FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_news_articles_updated_at
  BEFORE UPDATE ON public.news_articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cms_pages_updated_at
  BEFORE UPDATE ON public.cms_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_petroleum_blocks_updated_at
  BEFORE UPDATE ON public.petroleum_blocks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_production_statistics_updated_at
  BEFORE UPDATE ON public.production_statistics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expressions_of_interest_updated_at
  BEFORE UPDATE ON public.expressions_of_interest
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_investor_documents_updated_at
  BEFORE UPDATE ON public.investor_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- AUDIT LOG TRIGGER FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION public.audit_log_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, new_data)
    VALUES (auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_data, new_data)
    VALUES (auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_data)
    VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Apply audit triggers to main tables
CREATE TRIGGER audit_news_articles
  AFTER INSERT OR UPDATE OR DELETE ON public.news_articles
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();

CREATE TRIGGER audit_cms_pages
  AFTER INSERT OR UPDATE OR DELETE ON public.cms_pages
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();

CREATE TRIGGER audit_petroleum_blocks
  AFTER INSERT OR UPDATE OR DELETE ON public.petroleum_blocks
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();

CREATE TRIGGER audit_expressions_of_interest
  AFTER INSERT OR UPDATE OR DELETE ON public.expressions_of_interest
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();

CREATE TRIGGER audit_investor_documents
  AFTER INSERT OR UPDATE OR DELETE ON public.investor_documents
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();

CREATE TRIGGER audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();

-- =============================================
-- STORAGE BUCKETS
-- =============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('news-images', 'news-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('investor-docs', 'investor-docs', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('cms-assets', 'cms-assets', true);

-- Storage policies for news-images (public read)
CREATE POLICY "Anyone can view news images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'news-images');

CREATE POLICY "Content editors can upload news images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'news-images' AND public.can_manage_content(auth.uid()));

CREATE POLICY "Content editors can delete news images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'news-images' AND public.can_manage_content(auth.uid()));

-- Storage policies for investor-docs (private)
CREATE POLICY "Investor managers can view investor docs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'investor-docs' AND public.can_manage_investors(auth.uid()));

CREATE POLICY "Investor managers can upload investor docs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'investor-docs' AND public.can_manage_investors(auth.uid()));

CREATE POLICY "Investor managers can delete investor docs"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'investor-docs' AND public.can_manage_investors(auth.uid()));

-- Storage policies for cms-assets (public read)
CREATE POLICY "Anyone can view cms assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'cms-assets');

CREATE POLICY "Content editors can upload cms assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'cms-assets' AND public.can_manage_content(auth.uid()));

CREATE POLICY "Content editors can delete cms assets"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'cms-assets' AND public.can_manage_content(auth.uid()));

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_news_articles_status ON public.news_articles(status);
CREATE INDEX idx_news_articles_slug ON public.news_articles(slug);
CREATE INDEX idx_cms_pages_slug ON public.cms_pages(slug);
CREATE INDEX idx_petroleum_blocks_status ON public.petroleum_blocks(status);
CREATE INDEX idx_petroleum_blocks_basin ON public.petroleum_blocks(basin);
CREATE INDEX idx_production_statistics_block_id ON public.production_statistics(block_id);
CREATE INDEX idx_expressions_of_interest_status ON public.expressions_of_interest(status);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);