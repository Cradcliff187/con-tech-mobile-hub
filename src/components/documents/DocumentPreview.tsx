
import React, { useState, useEffect } from 'react';
import { getFileTypeInfo } from '@/utils/fileTypeHelpers';
import { useDocuments } from '@/hooks/useDocuments';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PreviewHeader } from './PreviewHeader';
import { PreviewContent } from './PreviewContent';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorFallback } from '@/components/common/ErrorFallback';

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

      const cleanPath = document.file_path.startsWith('documents/') 
        ? document.file_path.substring('documents/'.length)
        : document.file_path;

      const publicUrl = `https://jjmedlilkxmrbacoitio.supabase.co/storage/v1/object/public/documents/${cleanPath}`;
      console.log('Trying public URL:', publicUrl);

      const testResponse = await fetch(publicUrl, { method: 'HEAD' });
      
      let finalUrl = publicUrl;
      
      if (!testResponse.ok) {
        console.log('Public URL failed, trying signed URL');
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="h-6 bg-slate-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-2/3 animate-pulse"></div>
            </div>
            <div className="flex gap-2 ml-4">
              <div className="h-8 w-16 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-8 w-8 bg-slate-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="min-h-[400px] flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading preview..." />
        </div>
      </div>
    );
  }

  if (error) {
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
          <ErrorFallback
            title="Preview Error"
            description={error}
            resetError={loadPreview}
            showHomeButton={false}
          />
        </div>
      </div>
    );
  }

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
          loading={false}
          error={null}
          zoom={zoom}
          onRetry={loadPreview}
          onDownload={handleDownload}
        />
      </div>
    </div>
  );
};
