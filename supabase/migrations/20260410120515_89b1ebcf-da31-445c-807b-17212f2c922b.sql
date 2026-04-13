
DROP TRIGGER IF EXISTS audit_investor_registrations ON public.investor_registrations;
DROP TRIGGER IF EXISTS audit_news_articles ON public.news_articles;
DROP TRIGGER IF EXISTS audit_user_roles ON public.user_roles;
DROP TRIGGER IF EXISTS audit_profiles ON public.profiles;
DROP TRIGGER IF EXISTS audit_petroleum_blocks ON public.petroleum_blocks;
DROP TRIGGER IF EXISTS audit_production_statistics ON public.production_statistics;
DROP TRIGGER IF EXISTS audit_site_settings ON public.site_settings;

CREATE TRIGGER audit_investor_registrations
  AFTER INSERT OR UPDATE OR DELETE ON public.investor_registrations
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();

CREATE TRIGGER audit_news_articles
  AFTER INSERT OR UPDATE OR DELETE ON public.news_articles
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();

CREATE TRIGGER audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();

CREATE TRIGGER audit_profiles
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();

CREATE TRIGGER audit_petroleum_blocks
  AFTER INSERT OR UPDATE OR DELETE ON public.petroleum_blocks
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();

CREATE TRIGGER audit_production_statistics
  AFTER INSERT OR UPDATE OR DELETE ON public.production_statistics
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();

CREATE TRIGGER audit_site_settings
  AFTER INSERT OR UPDATE OR DELETE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();
