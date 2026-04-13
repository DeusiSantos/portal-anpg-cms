-- Add offer_type column to distinguish permanent offer blocks from tender blocks
ALTER TABLE public.petroleum_blocks 
ADD COLUMN offer_type text NOT NULL DEFAULT 'tender';

-- Add depth_category for display purposes (Onshore, Deepwater, Ultra-Deepwater)
ALTER TABLE public.petroleum_blocks 
ADD COLUMN depth_category text;

-- Create index for filtering by offer_type
CREATE INDEX idx_petroleum_blocks_offer_type ON public.petroleum_blocks(offer_type);