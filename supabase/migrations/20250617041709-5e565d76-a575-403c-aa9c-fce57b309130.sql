
-- Fix the documents storage bucket and add proper RLS policies

-- First, update the documents bucket to be public for previews
UPDATE storage.buckets 
SET public = true 
WHERE id = 'documents';

-- Add RLS policies for the documents table
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view documents in projects they have access to
CREATE POLICY "Users can view accessible documents" ON public.documents
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    -- Users can see documents they uploaded
    uploaded_by = auth.uid() OR
    -- Company users can see all documents
    public.is_approved_company_user() OR
    -- Users can see documents in projects they have access to
    (project_id IS NOT NULL AND public.user_can_access_project(project_id))
  )
);

-- Policy: Authenticated users can upload documents
CREATE POLICY "Users can upload documents" ON public.documents
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND
  uploaded_by = auth.uid()
);

-- Policy: Users can update their own documents or company users can update any
CREATE POLICY "Users can update documents" ON public.documents
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND (
    uploaded_by = auth.uid() OR
    public.is_approved_company_user()
  )
);

-- Policy: Users can delete their own documents or company users can delete any
CREATE POLICY "Users can delete documents" ON public.documents
FOR DELETE USING (
  auth.uid() IS NOT NULL AND (
    uploaded_by = auth.uid() OR
    public.is_approved_company_user()
  )
);

-- Update storage policies to work with public bucket
DROP POLICY IF EXISTS "Users can read documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their documents" ON storage.objects;

-- New storage policies for public bucket with proper access control
CREATE POLICY "Anyone can read documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'documents'
);

-- Policy for uploading files
CREATE POLICY "Authenticated users can upload documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'documents' AND
  auth.uid() IS NOT NULL
);

-- Policy for updating files (only file owner)
CREATE POLICY "Users can update their own document files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'documents' AND
  auth.uid() IS NOT NULL AND
  owner = auth.uid()
);

-- Policy for deleting files (only file owner)
CREATE POLICY "Users can delete their own document files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'documents' AND
  auth.uid() IS NOT NULL AND
  owner = auth.uid()
);
