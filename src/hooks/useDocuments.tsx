
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Document {
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
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { user } = useAuth();

  const fetchDocuments = async () => {
    if (!user) return;

    setLoading(true);
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
      console.error('Error fetching documents:', error);
    } else {
      setDocuments(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDocuments();
  }, [user, projectId]);

  const uploadDocument = async (
    file: File, 
    category: string, 
    targetProjectId?: string,
    description?: string
  ) => {
    if (!user) return { error: 'User not authenticated' };

    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      return { error: validation.error };
    }

    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Sanitize file name and create unique path
      const sanitizedFileName = sanitizeFileName(file.name);
      const timestamp = Date.now();
      const projectPath = targetProjectId || projectId || 'general';
      const filePath = `${projectPath}/${timestamp}_${sanitizedFileName}`;

      console.log('Uploading file to path:', filePath);

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        return { error: `Upload failed: ${uploadError.message}` };
      }

      console.log('File uploaded successfully:', uploadData);

      // Use custom description or file name
      const documentName = description || file.name;

      // Store document metadata in database
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
        // Try to clean up uploaded file
        await supabase.storage.from('documents').remove([uploadData.path]);
        return { error: `Failed to save document metadata: ${error.message}` };
      }

      if (data) {
        setDocuments(prev => [data, ...prev]);
      }

      return { data, error: null };
    } catch (err) {
      console.error('Upload exception:', err);
      return { error: 'Upload failed due to unexpected error' };
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteDocument = async (id: string, filePath: string) => {
    try {
      // Delete from storage first
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath]);

      if (storageError) {
        console.warn('Storage delete warning:', storageError);
      }

      // Delete from database
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (!error) {
        setDocuments(prev => prev.filter(doc => doc.id !== id));
      }

      return { error };
    } catch (err) {
      console.error('Delete exception:', err);
      return { error: 'Delete failed due to unexpected error' };
    }
  };

  const downloadDocument = async (document: Document) => {
    try {
      console.log('Downloading document:', document.file_path);
      
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.file_path, 3600); // 1 hour expiry

      if (error) {
        console.error('Download URL error:', error);
        return { error: `Failed to generate download link: ${error.message}` };
      }

      if (!data?.signedUrl) {
        return { error: 'Failed to generate download link' };
      }

      // Create download link and trigger download
      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = document.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return { error: null };
    } catch (err) {
      console.error('Download exception:', err);
      return { error: 'Download failed due to unexpected error' };
    }
  };

  const shareDocument = async (document: Document) => {
    try {
      console.log('Sharing document:', document.file_path);
      
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.file_path, 604800); // 7 days expiry

      if (error) {
        console.error('Share URL error:', error);
        return { error: `Failed to generate share link: ${error.message}` };
      }

      if (!data?.signedUrl) {
        return { error: 'Failed to generate share link' };
      }

      // Copy to clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(data.signedUrl);
      } else {
        // Fallback for browsers without clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = data.signedUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      return { error: null, url: data.signedUrl };
    } catch (err) {
      console.error('Share exception:', err);
      return { error: 'Share failed due to unexpected error' };
    }
  };

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
