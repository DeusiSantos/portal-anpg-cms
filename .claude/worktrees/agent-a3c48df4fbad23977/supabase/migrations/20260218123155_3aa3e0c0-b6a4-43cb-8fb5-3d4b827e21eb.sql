
-- Add bilingual columns to media_items
ALTER TABLE public.media_items
  ADD COLUMN title_en text,
  ADD COLUMN description_en text;
