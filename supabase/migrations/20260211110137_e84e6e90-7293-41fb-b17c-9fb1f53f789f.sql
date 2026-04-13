
-- Knowledge base table for SOBA chatbot
CREATE TABLE public.knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  language TEXT DEFAULT 'pt',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Public can read active entries (for the chatbot)
CREATE POLICY "Anyone can read active knowledge base entries"
  ON public.knowledge_base FOR SELECT
  USING (is_active = true);

-- Admins/editors can manage
CREATE POLICY "Authenticated users with backoffice access can insert"
  ON public.knowledge_base FOR INSERT
  WITH CHECK (public.has_backoffice_access(auth.uid()));

CREATE POLICY "Authenticated users with backoffice access can update"
  ON public.knowledge_base FOR UPDATE
  USING (public.has_backoffice_access(auth.uid()));

CREATE POLICY "Authenticated users with backoffice access can delete"
  ON public.knowledge_base FOR DELETE
  USING (public.has_backoffice_access(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_knowledge_base_updated_at
  BEFORE UPDATE ON public.knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
