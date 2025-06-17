import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface DocumentRecord {
  id: string;
  project_id?: string;
  name: string;
  file_path: string;
  file_size?: number;
  file_type?: string;
  category?: string;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
  uploader?: {
    full_name?: string;
    email: string;
  };
  project?: {
    name: string;
  };
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'text/plain'
];

const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');
};

const validateFile = (file: File): { isValid: boolean; error?: string } => {
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds 10MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
    };
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `File type not allowed. Supported types: PDF, Word, Excel, images (PNG, JPG, GIF), and text files`
    };
  }

  return { isValid: true };
};

export const useDocuments = (projectId?: string) => {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchDocuments = useCallback(async () => {
    if (!user) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let query = supabase
        .from('documents')
        .select(`
          *,
          uploader:profiles!uploaded_by(full_name, email),
          project:projects(name)
        `)
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch documents: ${error.message}`);
      }
      
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
      toast({
        title: "Error loading documents",
        description: error instanceof Error ? error.message : "Failed to load documents",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, projectId, toast]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const uploadDocument = useCallback(async (
    file: File, 
    category: string, 
    targetProjectId?: string,
    description?: string
  ) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const validation = validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    setUploading(true);
    setUploadProgress(0);
    
    try {
      const sanitizedFileName = sanitizeFileName(file.name);
      const timestamp = Date.now();
      const projectPath = targetProjectId || projectId || 'general';
      const filePath = `${projectPath}/${timestamp}_${sanitizedFileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      const documentName = description || file.name;

      const { data, error } = await supabase
        .from('documents')
        .insert({
          name: documentName,
          file_path: uploadData.path,
          file_size: file.size,
          file_type: file.type,
          category,
          project_id: targetProjectId || projectId,
          uploaded_by: user.id
        })
        .select(`
          *,
          uploader:profiles!uploaded_by(full_name, email),
          project:projects(name)
        `)
        .single();

      if (error) {
        // Clean up uploaded file if database insert fails
        await supabase.storage.from('documents').remove([uploadData.path]);
        throw new Error(`Failed to save document metadata: ${error.message}`);
      }

      if (data) {
        setDocuments(prev => [data, ...prev]);
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [user, projectId]);

  const deleteDocument = useCallback(async (id: string, filePath: string) => {
    try {
      // Try to delete from storage first (non-blocking)
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath]);

      if (storageError) {
        console.warn('Storage deletion failed:', storageError);
        // Continue with database deletion even if storage fails
      }

      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete document: ${error.message}`);
      }

      setDocuments(prev => prev.filter(doc => doc.id !== id));
      return { error: null };
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }, []);

  const downloadDocument = useCallback(async (doc: DocumentRecord) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(doc.file_path, 3600);

      if (error) {
        throw new Error(`Failed to generate download link: ${error.message}`);
      }

      if (!data?.signedUrl) {
        throw new Error('Failed to generate download link');
      }

      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = doc.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return { error: null };
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  }, []);

  const shareDocument = useCallback(async (doc: DocumentRecord) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(doc.file_path, 604800);

      if (error) {
        throw new Error(`Failed to generate share link: ${error.message}`);
      }

      if (!data?.signedUrl) {
        throw new Error('Failed to generate share link');
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(data.signedUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = data.signedUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      return { error: null, url: data.signedUrl };
    } catch (error) {
      console.error('Error sharing document:', error);
      throw error;
    }
  }, []);

  return {
    documents,
    loading,
    uploading,
    uploadProgress,
    uploadDocument,
    deleteDocument,
    downloadDocument,
    shareDocument,
    refetch: fetchDocuments
  };
};
