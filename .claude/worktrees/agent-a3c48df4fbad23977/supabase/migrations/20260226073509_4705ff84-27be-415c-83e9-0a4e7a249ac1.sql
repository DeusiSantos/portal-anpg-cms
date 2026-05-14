
-- Create board_departments table
CREATE TABLE public.board_departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.board_members(id) ON DELETE CASCADE,
  name_pt TEXT NOT NULL,
  name_en TEXT,
  acronym TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create board_sub_departments table
CREATE TABLE public.board_sub_departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  department_id UUID NOT NULL REFERENCES public.board_departments(id) ON DELETE CASCADE,
  name_pt TEXT NOT NULL,
  name_en TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.board_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_sub_departments ENABLE ROW LEVEL SECURITY;

-- RLS policies for board_departments
CREATE POLICY "Anyone can read active departments"
  ON public.board_departments FOR SELECT
  USING (is_active = true);

CREATE POLICY "Content editors can manage departments"
  ON public.board_departments FOR ALL
  USING (can_manage_content(auth.uid()));

-- RLS policies for board_sub_departments
CREATE POLICY "Anyone can read sub-departments"
  ON public.board_sub_departments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.board_departments
    WHERE id = board_sub_departments.department_id AND is_active = true
  ));

CREATE POLICY "Content editors can manage sub-departments"
  ON public.board_sub_departments FOR ALL
  USING (can_manage_content(auth.uid()));

-- Updated_at trigger for departments
CREATE TRIGGER update_board_departments_updated_at
  BEFORE UPDATE ON public.board_departments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Audit triggers
CREATE TRIGGER audit_board_departments
  AFTER INSERT OR UPDATE OR DELETE ON public.board_departments
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();

CREATE TRIGGER audit_board_sub_departments
  AFTER INSERT OR UPDATE OR DELETE ON public.board_sub_departments
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();

-- Index for fast lookups
CREATE INDEX idx_board_departments_member_id ON public.board_departments(member_id);
CREATE INDEX idx_board_sub_departments_dept_id ON public.board_sub_departments(department_id);
