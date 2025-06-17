
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
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const fetchDocuments = useCallback(async () => {
    if (!user) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    console.log('Fetching documents for user:', user.id, 'Project:', projectId);
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
      
      console.log('Fetched documents:', data?.length || 0);
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

    console.log('Uploading document:', file.name, 'Size:', file.size, 'Type:', file.type);

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

      console.log('Uploading to path:', filePath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('File uploaded successfully:', uploadData.path);

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
        console.error('Database insert error:', error);
        await supabase.storage.from('documents').remove([uploadData.path]);
        throw new Error(`Failed to save document metadata: ${error.message}`);
      }

      console.log('Document metadata saved:', data.id);

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
    console.log('Deleting document:', id, 'File path:', filePath);
    try {
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath]);

      if (storageError) {
        console.warn('Storage deletion failed:', storageError);
      }

      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete document: ${error.message}`);
      }

      console.log('Document deleted successfully:', id);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      return { error: null };
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }, []);

  const downloadDocument = useCallback(async (doc: DocumentRecord) => {
    console.log('Downloading document:', doc.name, 'Path:', doc.file_path);
    try {
      const cleanPath = doc.file_path.startsWith('documents/') 
        ? doc.file_path.substring('documents/'.length)
        : doc.file_path;

      const publicUrl = `https://jjmedlilkxmrbacoitio.supabase.co/storage/v1/object/public/documents/${cleanPath}`;
      
      const testResponse = await fetch(publicUrl, { method: 'HEAD' });
      
      let downloadUrl = publicUrl;
      
      if (!testResponse.ok) {
        console.log('Public URL failed, using signed URL for download');
        const { data, error } = await supabase.storage
          .from('documents')
          .createSignedUrl(doc.file_path, 3600);

        if (error) {
          throw new Error(`Failed to generate download link: ${error.message}`);
        }

        if (!data?.signedUrl) {
          throw new Error('Failed to generate download link');
        }
        
        downloadUrl = data.signedUrl;
      }

      console.log('Using download URL:', downloadUrl);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = doc.name;
      link.target = '_blank';
      
      if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
        window.open(downloadUrl, '_blank');
      } else {
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      console.log('Download initiated for:', doc.name);
      return { error: null };
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  }, []);

  const shareDocument = useCallback(async (doc: DocumentRecord) => {
    console.log('Sharing document:', doc.name);
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(doc.file_path, 604800); // 7 days

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

      console.log('Share URL copied to clipboard');
      return { error: null, url: data.signedUrl };
    } catch (error) {
      console.error('Error sharing document:', error);
      throw error;
    }
  }, []);

  const previewDocument = useCallback(async (doc: DocumentRecord) => {
    console.log('Generating preview for document:', doc.name);
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(doc.file_path, 3600);

      if (error) {
        throw new Error(`Failed to generate preview link: ${error.message}`);
      }

      if (!data?.signedUrl) {
        throw new Error('Failed to generate preview link');
      }

      return { data: { signedUrl: data.signedUrl }, error: null };
    } catch (error) {
      console.error('Error generating preview:', error);
      throw error;
    }
  }, []);

  const canUpload = useCallback(() => {
    return user && profile && (
      (profile.is_company_user && profile.account_status === 'approved') ||
      (!profile.is_company_user && profile.account_status === 'approved')
    );
  }, [user, profile]);

  const canDelete = useCallback((document: DocumentRecord) => {
    if (!user || !profile) return false;
    
    // Users can delete their own documents
    if (document.uploaded_by === user.id) return true;
    
    // Company users can delete any document
    return profile.is_company_user && profile.account_status === 'approved';
  }, [user, profile]);

  return {
    documents,
    loading,
    uploading,
    uploadProgress,
    uploadDocument,
    deleteDocument,
    downloadDocument,
    shareDocument,
    previewDocument,
    refetch: fetchDocuments,
    canUpload,
    canDelete
  };
};
