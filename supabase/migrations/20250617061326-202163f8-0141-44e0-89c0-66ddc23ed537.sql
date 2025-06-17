
-- ConstructPro Document Storage System Migration
-- Phase 1: Clean up existing policies and implement ConstructPro permission patterns

-- Drop any existing RLS policies on documents table
DROP POLICY IF EXISTS "Users can view accessible documents" ON public.documents;
DROP POLICY IF EXISTS "Users can upload documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete documents" ON public.documents;

-- Drop existing storage policies for documents bucket
DROP POLICY IF EXISTS "Anyone can read documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own document files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own document files" ON storage.objects;
DROP POLICY IF EXISTS "Users can read documents" ON storage.objects;

-- Ensure documents table has RLS enabled
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create ConstructPro-aligned RLS policies for documents table

-- Policy: Company users can view all documents, external users only see documents in projects they have access to
CREATE POLICY "ConstructPro document view access" ON public.documents
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    -- Company users with approved status can see all documents
    public.is_approved_company_user() OR
    -- External users can see documents they uploaded
    uploaded_by = auth.uid() OR
    -- External users can see documents in projects they have access to
    (project_id IS NOT NULL AND public.user_can_access_project(project_id))
  )
);

-- Policy: Authenticated users can upload documents to projects they have access to
CREATE POLICY "ConstructPro document upload access" ON public.documents
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND
  uploaded_by = auth.uid() AND (
    -- Company users can upload to any project
    public.is_approved_company_user() OR
    -- External users can upload to projects they have access to
    (project_id IS NULL OR public.user_can_access_project(project_id))
  )
);

-- Policy: Users can update their own documents, company users can update any
CREATE POLICY "ConstructPro document update access" ON public.documents
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND (
    uploaded_by = auth.uid() OR
    public.is_approved_company_user()
  )
);

-- Policy: Users can delete their own documents, company users can delete any
CREATE POLICY "ConstructPro document delete access" ON public.documents
FOR DELETE USING (
  auth.uid() IS NOT NULL AND (
    uploaded_by = auth.uid() OR
    public.is_approved_company_user()
  )
);

-- Create clean storage policies for documents bucket

-- Public read access (since bucket is public)
CREATE POLICY "Public read access for documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'documents'
);

-- Authenticated users can upload documents
CREATE POLICY "Authenticated upload to documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'documents' AND
  auth.uid() IS NOT NULL
);

-- Users can update their own files
CREATE POLICY "Users can update own document files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'documents' AND
  auth.uid() IS NOT NULL AND
  owner = auth.uid()
);

-- Users can delete their own files
CREATE POLICY "Users can delete own document files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'documents' AND
  auth.uid() IS NOT NULL AND
  owner = auth.uid()
);

-- Ensure documents bucket is public (should already be set)
UPDATE storage.buckets 
SET public = true 
WHERE id = 'documents';
