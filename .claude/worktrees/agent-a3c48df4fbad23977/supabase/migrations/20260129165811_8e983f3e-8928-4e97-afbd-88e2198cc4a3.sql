-- Create site_settings table for general configuration
CREATE TABLE public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  description text,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (for frontend display)
CREATE POLICY "Anyone can read site settings"
  ON public.site_settings
  FOR SELECT
  USING (true);

-- Only admins can manage settings
CREATE POLICY "Admins can manage site settings"
  ON public.site_settings
  FOR ALL
  USING (is_admin(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add audit trigger
CREATE TRIGGER audit_site_settings
  AFTER INSERT OR UPDATE OR DELETE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_log_trigger();

-- Insert default settings
INSERT INTO public.site_settings (setting_key, setting_value, description) VALUES
  ('logo', '{"light": "", "dark": ""}', 'Logo URLs for light and dark modes'),
  ('contact', '{"address": "Edifício Torres do Carmo - Torre 2, Avenida de Portugal, Rua Lopes de Lima, Município de Luanda, Angola", "phone": "+244 226 428 000", "email": "info@anpg.co.ao", "hours": "Segunda a Sexta, 08:00 - 17:00"}', 'Contact information'),
  ('social', '{"facebook": "", "linkedin": "", "twitter": "", "youtube": "", "instagram": ""}', 'Social media URLs'),
  ('footer', '{"copyright": "© 2024 ANPG - Agência Nacional de Petróleo, Gás e Biocombustíveis. Todos os direitos reservados.", "tagline": "Regulando o sector petrolífero angolano com transparência e excelência"}', 'Footer texts');