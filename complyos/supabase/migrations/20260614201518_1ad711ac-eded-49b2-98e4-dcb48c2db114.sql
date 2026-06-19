
CREATE POLICY "own ingest read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'ingest' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own ingest write" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'ingest' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own ingest update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'ingest' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own ingest delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'ingest' AND (storage.foldername(name))[1] = auth.uid()::text);
