-- Add 'negotiating' to the status check constraint
ALTER TABLE public.petroleum_blocks DROP CONSTRAINT petroleum_blocks_status_check;
ALTER TABLE public.petroleum_blocks ADD CONSTRAINT petroleum_blocks_status_check 
  CHECK (status = ANY (ARRAY['available', 'awarded', 'producing', 'exploration', 'development', 'negotiating']));