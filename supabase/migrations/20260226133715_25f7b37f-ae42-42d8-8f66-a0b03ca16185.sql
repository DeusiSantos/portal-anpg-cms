
-- Add geological and technical fields to petroleum_blocks
ALTER TABLE public.petroleum_blocks
  ADD COLUMN IF NOT EXISTS discovery_year integer,
  ADD COLUMN IF NOT EXISTS geological_formation text,
  ADD COLUMN IF NOT EXISTS reservoir_type text,
  ADD COLUMN IF NOT EXISTS estimated_reserves_mmboe numeric,
  ADD COLUMN IF NOT EXISTS license_start date,
  ADD COLUMN IF NOT EXISTS license_end date,
  ADD COLUMN IF NOT EXISTS total_wells integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS active_wells integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fpso_name text,
  ADD COLUMN IF NOT EXISTS geological_notes text;
