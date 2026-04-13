
-- Create media_items table for publications, press clippings, events, and videos
CREATE TABLE public.media_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  media_type TEXT NOT NULL DEFAULT 'publication',
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  file_url TEXT,
  external_url TEXT,
  youtube_url TEXT,
  source TEXT,
  event_date TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add constraint for media_type values
ALTER TABLE public.media_items ADD CONSTRAINT media_items_type_check 
  CHECK (media_type IN ('publication', 'press_clipping', 'event', 'video'));

-- Enable RLS
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;

-- Anyone can read active items
CREATE POLICY "Anyone can read active media items"
  ON public.media_items
  FOR SELECT
  USING (is_active = true);

-- Content editors can manage
CREATE POLICY "Content editors can manage media items"
  ON public.media_items
  FOR ALL
  USING (can_manage_content(auth.uid()));

-- Index for fast filtering
CREATE INDEX idx_media_items_type ON public.media_items (media_type, sort_order);

-- Trigger for updated_at
CREATE TRIGGER update_media_items_updated_at
  BEFORE UPDATE ON public.media_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
