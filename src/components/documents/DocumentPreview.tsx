
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
    setLoading(true);
    setError(null);
    
    try {
      if (!fileTypeInfo.canPreview) {
        setLoading(false);
        return;
      }

      // Generate signed URL for preview
      const { data, error: urlError } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.file_path, 3600);

      if (urlError || !data?.signedUrl) {
        throw new Error('Failed to generate preview URL');
      }

      if (fileTypeInfo.category === 'text') {
        // Fetch text content
        const response = await fetch(data.signedUrl);
        const text = await response.text();
        setTextContent(text);
      } else {
        setPreviewUrl(data.signedUrl);
      }
    } catch (err) {
      console.error('Preview error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load preview');
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
