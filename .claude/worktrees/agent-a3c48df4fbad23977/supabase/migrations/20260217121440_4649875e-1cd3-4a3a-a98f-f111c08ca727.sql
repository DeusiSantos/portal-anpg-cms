-- RLS policies for cms-assets bucket uploads
CREATE POLICY "Backoffice users can upload cms assets"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'cms-assets'
  AND has_backoffice_access(auth.uid())
);

CREATE POLICY "Backoffice users can update cms assets"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'cms-assets'
  AND has_backoffice_access(auth.uid())
);

CREATE POLICY "Backoffice users can delete cms assets"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'cms-assets'
  AND has_backoffice_access(auth.uid())
);

CREATE POLICY "Anyone can read cms assets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'cms-assets');
