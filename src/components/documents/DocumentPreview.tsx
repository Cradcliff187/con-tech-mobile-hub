
import React, { useState, useEffect } from 'react';
import { Loader2, Download, X, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getFileTypeInfo, formatFileSize } from '@/utils/fileTypeHelpers';
import { useDocuments } from '@/hooks/useDocuments';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

  const renderPreviewContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
          <span className="ml-2 text-slate-600">Loading preview...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadPreview} variant="outline">
            Retry
          </Button>
        </div>
      );
    }

    if (!fileTypeInfo.canPreview) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <div className="mb-4">
            <div className="text-4xl mb-2">📄</div>
            <h3 className="text-lg font-medium text-slate-800">{fileTypeInfo.displayName}</h3>
            <p className="text-slate-600 mt-2">Preview not available for this file type</p>
            <p className="text-sm text-slate-500 mt-1">
              Size: {formatFileSize(document.file_size)}
            </p>
          </div>
          <Button onClick={handleDownload} className="flex items-center gap-2">
            <Download size={16} />
            Download to View
          </Button>
        </div>
      );
    }

    switch (fileTypeInfo.category) {
      case 'pdf':
        return (
          <div className="w-full h-full">
            <iframe
              src={previewUrl || ''}
              className="w-full h-full border-0"
              title={document.name}
              style={{ minHeight: '500px' }}
            />
          </div>
        );

      case 'image':
        return (
          <div className="flex items-center justify-center p-4">
            <img
              src={previewUrl || ''}
              alt={document.name}
              className="max-w-full max-h-full object-contain"
              style={{ 
                transform: `scale(${zoom / 100})`,
                transition: 'transform 0.2s ease'
              }}
            />
          </div>
        );

      case 'text':
        return (
          <div className="p-4">
            <pre className="whitespace-pre-wrap text-sm text-slate-800 bg-slate-50 p-4 rounded-lg overflow-auto max-h-96">
              {textContent}
            </pre>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-96">
            <p className="text-slate-600">Preview not supported</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-slate-800 truncate">
            {document.name}
          </h3>
          <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
            <span>{fileTypeInfo.displayName}</span>
            <span>{formatFileSize(document.file_size)}</span>
            <span>
              Uploaded by {document.uploader?.full_name || document.uploader?.email || 'Unknown'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          {fileTypeInfo.category === 'image' && fileTypeInfo.canPreview && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoom(Math.max(25, zoom - 25))}
                disabled={zoom <= 25}
              >
                <ZoomOut size={16} />
              </Button>
              <span className="text-sm text-slate-600 min-w-[3rem] text-center">
                {zoom}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoom(Math.min(200, zoom + 25))}
                disabled={zoom >= 200}
              >
                <ZoomIn size={16} />
              </Button>
            </>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="flex items-center gap-2"
          >
            <Download size={16} />
            Download
          </Button>
          
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={16} />
            </Button>
          )}
        </div>
      </div>

      {/* Preview Content */}
      <div className="min-h-[400px]">
        {renderPreviewContent()}
      </div>
    </div>
  );
};
