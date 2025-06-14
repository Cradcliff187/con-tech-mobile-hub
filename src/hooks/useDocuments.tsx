
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

export const useDocuments = (projectId?: string) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
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

    setUploading(true);
    
    try {
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      // Use custom description or file name
      const documentName = description || file.name;

      // For now, we'll store file metadata without actual file upload
      // In a real scenario, you'd upload to Supabase Storage first
      const { data, error } = await supabase
        .from('documents')
        .insert({
          name: documentName,
          file_path: filePath,
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

      if (!error && data) {
        setDocuments(prev => [data, ...prev]);
      }

      return { data, error };
    } catch (err) {
      console.error('Upload error:', err);
      return { error: 'Upload failed' };
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (id: string) => {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (!error) {
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    }

    return { error };
  };

  return {
    documents,
    loading,
    uploading,
    uploadDocument,
    deleteDocument,
    refetch: fetchDocuments
  };
};
