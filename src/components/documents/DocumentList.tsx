
import React, { memo, useCallback, useState } from 'react';
import { FileText, Image, File, Download, Share, Trash2, Receipt, AlertCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDocuments } from '@/hooks/useDocuments';
import { useToast } from '@/hooks/use-toast';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { ResponsiveDialog } from '@/components/common/ResponsiveDialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorFallback } from '@/components/common/ErrorFallback';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TouchFriendlyButton } from '@/components/common/TouchFriendlyButton';
import { useDialogState } from '@/hooks/useDialogState';
import { DocumentPreviewDialog } from './DocumentPreviewDialog';
import { getFileTypeInfo, formatFileSize } from '@/utils/fileTypeHelpers';

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

interface DocumentListProps {
  filter: string;
  searchTerm: string;
  documents: DocumentRecord[];
}

const DocumentItem = memo(({ doc }: { doc: DocumentRecord }) => {
  const { deleteDocument, downloadDocument, shareDocument, canDelete } = useDocuments();
  const { toast } = useToast();
  const { activeDialog, openDialog, closeDialog, isDialogOpen } = useDialogState();
  const [previewDocument, setPreviewDocument] = useState<DocumentRecord | null>(null);

  const downloadOperation = useAsyncOperation({
    successMessage: "Download started successfully",
    errorMessage: "Failed to download document. Please try again."
  });

  const shareOperation = useAsyncOperation({
    successMessage: "Shareable link copied to clipboard (expires in 7 days)",
    errorMessage: "Failed to generate share link. Please try again."
  });

  const deleteOperation = useAsyncOperation({
    successMessage: "Document deleted successfully",
    errorMessage: "Failed to delete document. Please try again."
  });

  const fileTypeInfo = getFileTypeInfo(doc.file_type, doc.name);

  const getFileIcon = (category?: string, fileType?: string) => {
    if (category === 'receipts') {
      return <Receipt className="text-green-600" size={20} />;
    }
    
    const typeInfo = getFileTypeInfo(fileType, doc.name);
    switch (typeInfo.category) {
      case 'image':
        return <Image className="text-green-500" size={20} />;
      case 'pdf':
        return <FileText className="text-red-500" size={20} />;
      case 'office':
        return <FileText className="text-blue-500" size={20} />;
      case 'text':
        return <FileText className="text-slate-500" size={20} />;
      default:
        return <File className="text-slate-500" size={20} />;
    }
  };

  const getCategoryLabel = (category?: string) => {
    const categoryMap: Record<string, string> = {
      'plans': 'Plans & Drawings',
      'permits': 'Permits',
      'contracts': 'Contracts',
      'photos': 'Photos',
      'reports': 'Reports',
      'safety': 'Safety',
      'receipts': 'Receipts',
      'other': 'Other'
    };
    return categoryMap[category || 'other'] || 'Unknown';
  };

  const handlePreview = useCallback(() => {
    console.log('Opening preview for document:', doc.name, 'Type:', doc.file_type);
    setPreviewDocument(doc);
  }, [doc]);

  const handleDownload = useCallback(async () => {
    try {
      await downloadOperation.execute(() => downloadDocument(doc));
      console.log('Download completed for:', doc.name);
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Failed to download document",
        variant: "destructive"
      });
    }
  }, [doc, downloadDocument, downloadOperation, toast]);

  const handleShare = useCallback(async () => {
    try {
      await shareOperation.execute(() => shareDocument(doc));
      console.log('Share completed for:', doc.name);
    } catch (error) {
      console.error('Share failed:', error);
      toast({
        title: "Share failed",
        description: error instanceof Error ? error.message : "Failed to generate share link",
        variant: "destructive"
      });
    }
  }, [doc, shareDocument, shareOperation, toast]);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      await deleteOperation.execute(() => deleteDocument(doc.id, doc.file_path));
      console.log('Delete completed for:', doc.name);
      closeDialog();
    } catch (error) {
      console.error('Delete failed:', error);
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete document",
        variant: "destructive"
      });
    }
  }, [doc.id, doc.file_path, deleteDocument, deleteOperation, closeDialog, toast]);

  const isLoading = downloadOperation.loading || shareOperation.loading || deleteOperation.loading;
  const userCanDelete = canDelete(doc);

  return (
    <>
      <div className="p-4 hover:bg-slate-50 transition-colors duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {getFileIcon(doc.category, doc.file_type)}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-slate-800 truncate">
                {doc.name}
              </h4>
              <div className="flex flex-wrap items-center gap-2 lg:gap-4 text-xs text-slate-500 mt-1">
                <span>{getCategoryLabel(doc.category)}</span>
                <span>{formatFileSize(doc.file_size)}</span>
                <span className="hidden sm:inline">Modified: {new Date(doc.updated_at).toLocaleDateString()}</span>
                {fileTypeInfo.canPreview && (
                  <span className="text-green-600 font-medium">Preview Available</span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 lg:gap-4 text-xs text-slate-500 mt-1">
                <span className="truncate">Project: {doc.project?.name || 'No project'}</span>
                <span className="truncate">By: {doc.uploader?.full_name || doc.uploader?.email || 'Unknown'}</span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons - Mobile-First Layout */}
          <div className="flex items-center gap-1 ml-2 lg:gap-2">
            {fileTypeInfo.canPreview && (
              <Button
                variant="ghost"
                size="sm"
                className="p-2 lg:p-1 text-slate-500 hover:text-blue-600 transition-colors duration-200"
                onClick={handlePreview}
                disabled={isLoading}
                title="Preview document"
              >
                <Eye size={16} />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="p-2 lg:p-1 text-slate-500 hover:text-slate-700 transition-colors duration-200"
              onClick={handleShare}
              disabled={isLoading}
              title="Share document"
            >
              {shareOperation.loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Share size={16} />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-2 lg:p-1 text-slate-500 hover:text-slate-700 transition-colors duration-200"
              onClick={handleDownload}
              disabled={isLoading}
              title="Download document"
            >
              {downloadOperation.loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Download size={16} />
              )}
            </Button>
            {userCanDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="p-2 lg:p-1 text-slate-500 hover:text-red-600 transition-colors duration-200"
                onClick={() => openDialog('delete')}
                disabled={isLoading}
                title="Delete document"
              >
                {deleteOperation.loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Trash2 size={16} />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Preview Dialog */}
      <DocumentPreviewDialog
        document={previewDocument}
        open={!!previewDocument}
        onOpenChange={(open) => !open && setPreviewDocument(null)}
        onDownload={handleDownload}
      />

      {/* Delete Confirmation Dialog */}
      <ResponsiveDialog
        open={isDialogOpen('delete')}
        onOpenChange={(open) => !open && closeDialog()}
        title="Delete Document"
        className="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete "{doc.name}"? This action cannot be undone.
          </p>
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t">
            <TouchFriendlyButton
              variant="outline"
              onClick={() => closeDialog()}
              disabled={deleteOperation.loading}
              className="order-2 sm:order-1"
            >
              Cancel
            </TouchFriendlyButton>
            <TouchFriendlyButton
              onClick={handleDeleteConfirm}
              disabled={deleteOperation.loading}
              className="order-1 sm:order-2 bg-red-600 hover:bg-red-700"
            >
              {deleteOperation.loading ? 'Deleting...' : 'Delete'}
            </TouchFriendlyButton>
          </div>
        </div>
      </ResponsiveDialog>
    </>
  );
});

DocumentItem.displayName = 'DocumentItem';

export const DocumentList = memo(({ filter, searchTerm, documents }: DocumentListProps) => {
  const filteredDocuments = documents.filter(doc => {
    const matchesFilter = filter === 'all' || doc.category === filter;
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.project?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.uploader?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (filteredDocuments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 lg:p-12 text-center">
        <FileText size={48} className="mx-auto mb-4 text-slate-300" />
        <h3 className="text-lg font-medium text-slate-600 mb-2">
          {searchTerm || filter !== 'all' ? 'No documents match your criteria' : 'No documents yet'}
        </h3>
        <p className="text-slate-500 text-sm">
          {searchTerm || filter !== 'all' 
            ? 'Try adjusting your search or filter settings'
            : 'Upload your first document to get started'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 divide-y divide-slate-200">
      {filteredDocuments.map((doc) => (
        <DocumentItem key={doc.id} doc={doc} />
      ))}
    </div>
  );
});

DocumentList.displayName = 'DocumentList';
