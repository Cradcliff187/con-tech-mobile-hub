
-- Create task_documents junction table for proper task-document relationships
CREATE TABLE public.task_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  relationship_type text NOT NULL DEFAULT 'attachment',
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id),
  
  -- Ensure unique task-document pairs
  UNIQUE(task_id, document_id)
);

-- Add constraint to validate relationship types
ALTER TABLE public.task_documents 
ADD CONSTRAINT valid_relationship_type 
CHECK (relationship_type IN ('attachment', 'reference', 'requirement'));

-- Enable RLS on task_documents table
ALTER TABLE public.task_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view task documents for projects they have access to
CREATE POLICY "Users can view task documents for accessible projects" 
ON public.task_documents 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.tasks t
    JOIN public.projects p ON t.project_id = p.id
    WHERE t.id = task_documents.task_id
    AND (
      p.project_manager_id = auth.uid() OR
      public.is_approved_company_user()
    )
  )
);

-- RLS Policy: Users can create task document relationships for projects they manage
CREATE POLICY "Users can create task documents for managed projects" 
ON public.task_documents 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tasks t
    JOIN public.projects p ON t.project_id = p.id
    WHERE t.id = task_documents.task_id
    AND (
      p.project_manager_id = auth.uid() OR
      public.is_approved_company_user()
    )
  )
);

-- RLS Policy: Users can delete task document relationships for projects they manage
CREATE POLICY "Users can delete task documents for managed projects" 
ON public.task_documents 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.tasks t
    JOIN public.projects p ON t.project_id = p.id
    WHERE t.id = task_documents.task_id
    AND (
      p.project_manager_id = auth.uid() OR
      public.is_approved_company_user()
    )
  )
);

-- Create indexes for better performance
CREATE INDEX idx_task_documents_task_id ON public.task_documents(task_id);
CREATE INDEX idx_task_documents_document_id ON public.task_documents(document_id);
CREATE INDEX idx_task_documents_relationship_type ON public.task_documents(relationship_type);

-- Add updated_at trigger
CREATE TRIGGER update_task_documents_updated_at
    BEFORE UPDATE ON public.task_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
