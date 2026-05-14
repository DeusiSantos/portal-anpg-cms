
-- Allow investors to view non-public investor documents (they have 'investor' role)
CREATE POLICY "Investors can view all documents"
  ON public.investor_documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'investor'
    )
  );
