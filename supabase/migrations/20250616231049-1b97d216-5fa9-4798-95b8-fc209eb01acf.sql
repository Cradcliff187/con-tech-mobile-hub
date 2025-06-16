
-- Create documents storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false);

-- Create RLS policies for the documents bucket
-- Policy to allow authenticated users to upload files
CREATE POLICY "Users can upload documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'documents' AND
  auth.uid() IS NOT NULL
);

-- Policy to allow users to read their own files and files in their projects
CREATE POLICY "Users can read documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'documents' AND
  auth.uid() IS NOT NULL AND
  (
    -- Users can read files they uploaded
    owner = auth.uid() OR
    -- Users can read files in projects they have access to
    EXISTS (
      SELECT 1 FROM public.documents d
      JOIN public.projects p ON d.project_id = p.id
      WHERE d.file_path = storage.objects.name AND
      (p.project_manager_id = auth.uid() OR public.is_approved_company_user())
    )
  )
);

-- Policy to allow users to delete their own files
CREATE POLICY "Users can delete their documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'documents' AND
  auth.uid() IS NOT NULL AND
  owner = auth.uid()
);

-- Policy to allow users to update their own files
CREATE POLICY "Users can update their documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'documents' AND
  auth.uid() IS NOT NULL AND
  owner = auth.uid()
);
