
import React, { useState, useEffect } from 'react';
import { getFileTypeInfo } from '@/utils/fileTypeHelpers';
import { useDocuments } from '@/hooks/useDocuments';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PreviewHeader } from './PreviewHeader';
import { PreviewContent } from './PreviewContent';

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

interface DocumentPreviewProps {
  document: DocumentRecord;
  onClose?: () => void;
  onDownload?: () => void;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  document,
  onClose,
  onDownload
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  
  const { downloadDocument } = useDocuments();
  const { toast } = useToast();
  
  const fileTypeInfo = getFileTypeInfo(document.file_type, document.name);

  useEffect(() => {
    loadPreview();
  }, [document]);

  const loadPreview = async () => {
    console.log('Loading preview for:', document.name, 'Type:', document.file_type, 'Path:', document.file_path);
    setLoading(true);
    setError(null);
    
    try {
      if (!fileTypeInfo.canPreview) {
        console.log('File type cannot be previewed:', fileTypeInfo.category);
        setLoading(false);
        return;
      }

      // For public bucket, we can construct the URL directly or use signed URL
      // Let's try the public URL first, then fall back to signed URL
      const publicUrl = `${supabase.supabaseUrl}/storage/v1/object/public/documents/${document.file_path}`;
      console.log('Trying public URL:', publicUrl);

      // Test if public URL works
      const testResponse = await fetch(publicUrl, { method: 'HEAD' });
      
      let finalUrl = publicUrl;
      
      if (!testResponse.ok) {
        console.log('Public URL failed, trying signed URL');
        // Fall back to signed URL
        const { data, error: urlError } = await supabase.storage
          .from('documents')
          .createSignedUrl(document.file_path, 3600);

        if (urlError || !data?.signedUrl) {
          throw new Error(`Failed to generate preview URL: ${urlError?.message || 'Unknown error'}`);
        }
        
        finalUrl = data.signedUrl;
        console.log('Using signed URL:', finalUrl);
      }

      if (fileTypeInfo.category === 'text') {
        console.log('Loading text content from:', finalUrl);
        // Fetch text content
        const response = await fetch(finalUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch text content: ${response.status} ${response.statusText}`);
        }
        const text = await response.text();
        setTextContent(text);
        console.log('Text content loaded, length:', text.length);
      } else {
        console.log('Setting preview URL for non-text file:', finalUrl);
        setPreviewUrl(finalUrl);
      }
    } catch (err) {
      console.error('Preview error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load preview';
      setError(errorMessage);
      toast({
        title: "Preview Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      if (onDownload) {
        onDownload();
      } else {
        await downloadDocument(document);
        toast({
          title: "Download started",
          description: `${document.name} is being downloaded`
        });
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Failed to download document",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      <PreviewHeader
        document={document}
        zoom={zoom}
        onZoomChange={setZoom}
        onDownload={handleDownload}
        onClose={onClose}
      />

      <div className="min-h-[400px]">
        <PreviewContent
          document={document}
          previewUrl={previewUrl}
          textContent={textContent}
          loading={loading}
          error={error}
          zoom={zoom}
          onRetry={loadPreview}
          onDownload={handleDownload}
        />
      </div>
    </div>
  );
};
