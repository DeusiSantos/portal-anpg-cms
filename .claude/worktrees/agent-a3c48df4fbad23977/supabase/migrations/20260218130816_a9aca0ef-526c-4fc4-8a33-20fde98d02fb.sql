
-- Table for investor registration requests
CREATE TABLE public.investor_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  company_name text NOT NULL,
  country text,
  phone text,
  sector text,
  message text,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.investor_registrations ENABLE ROW LEVEL SECURITY;

-- Public can insert (register)
CREATE POLICY "Anyone can submit investor registration"
  ON public.investor_registrations
  FOR INSERT
  WITH CHECK (true);

-- Only backoffice can view
CREATE POLICY "Backoffice users can view registrations"
  ON public.investor_registrations
  FOR SELECT
  USING (has_backoffice_access(auth.uid()));

-- Investor managers can manage
CREATE POLICY "Investor managers can manage registrations"
  ON public.investor_registrations
  FOR ALL
  USING (can_manage_investors(auth.uid()));

-- Add 'investor' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'investor';

-- Trigger for updated_at
CREATE TRIGGER update_investor_registrations_updated_at
  BEFORE UPDATE ON public.investor_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Audit trigger
CREATE TRIGGER audit_investor_registrations
  AFTER INSERT OR UPDATE OR DELETE ON public.investor_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_log_trigger();
