
-- Add document_url column to knowledge_base for storing reference to uploaded documents
ALTER TABLE public.knowledge_base ADD COLUMN document_url text;
