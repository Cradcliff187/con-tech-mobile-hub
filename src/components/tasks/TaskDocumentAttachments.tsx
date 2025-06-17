
import React, { useState, useEffect } from 'react';
import { FileText, Paperclip, X, Upload, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTaskDocuments } from '@/hooks/useTaskDocuments';
import { useDocuments } from '@/hooks/useDocuments';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { DocumentUpload } from '@/components/documents/DocumentUpload';

interface TaskDocumentAttachmentsProps {
  taskId: string;
  projectId?: string;
  variant?: 'full' | 'compact';
  className?: string;
}

export const TaskDocumentAttachments: React.FC<TaskDocumentAttachmentsProps> = ({
  taskId,
  projectId,
  variant = 'full',
  className
}) => {
  const [isAttachDialogOpen, setIsAttachDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const { taskDocuments, loading, fetchTaskDocuments, attachDocument, detachDocument } = useTaskDocuments(taskId);
  const { documents } = useDocuments(projectId);

  useEffect(() => {
    fetchTaskDocuments();
  }, [fetchTaskDocuments]);

  const availableDocuments = documents.filter(
    doc => !taskDocuments.some(taskDoc => taskDoc.document_id === doc.id)
  );

  const handleAttachDocument = async (documentId: string) => {
    await attachDocument(documentId);
    setIsAttachDialogOpen(false);
  };

  const handleDetachDocument = async (attachmentId: string) => {
    await detachDocument(attachmentId);
  };

  const handleUploadComplete = () => {
    setIsUploadDialogOpen(false);
    // Refresh documents will happen automatically via useDocuments hook
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1 text-sm text-slate-600">
          <Paperclip size={14} />
          <span>{taskDocuments.length}</span>
        </div>
        {taskDocuments.length > 0 && (
          <div className="flex gap-1">
            {taskDocuments.slice(0, 3).map((taskDoc) => (
              <Badge key={taskDoc.id} variant="secondary" className="text-xs">
                {taskDoc.document?.category}
              </Badge>
            ))}
            {taskDocuments.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{taskDocuments.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
          <Paperclip size={16} />
          Task Documents ({taskDocuments.length})
        </h4>
        <div className="flex gap-2">
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs">
                <Upload size={14} className="mr-1" />
                Upload New
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Document for Task</DialogTitle>
              </DialogHeader>
              <DocumentUpload
                projectId={projectId}
                onUploadComplete={handleUploadComplete}
                variant="inline"
              />
            </DialogContent>
          </Dialog>

          <Dialog open={isAttachDialogOpen} onOpenChange={setIsAttachDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs">
                <FolderOpen size={14} className="mr-1" />
                Attach Existing
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Attach Existing Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableDocuments.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No available documents to attach
                  </p>
                ) : (
                  availableDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-2 border border-slate-200 rounded"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FileText size={16} className="text-slate-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">
                            {doc.name}
                          </p>
                          {doc.category && (
                            <Badge variant="secondary" className="text-xs">
                              {doc.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAttachDocument(doc.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-xs"
                      >
                        Attach
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-4">
          <LoadingSpinner size="sm" text="Loading documents..." />
        </div>
      ) : taskDocuments.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-4">
          No documents attached to this task
        </p>
      ) : (
        <div className="space-y-2">
          {taskDocuments.map((taskDoc) => (
            <div
              key={taskDoc.id}
              className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FileText size={16} className="text-slate-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {taskDoc.document?.name}
                  </p>
                  {taskDoc.document?.category && (
                    <Badge variant="secondary" className="text-xs">
                      {taskDoc.document.category}
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDetachDocument(taskDoc.id)}
                className="text-slate-500 hover:text-slate-700 p-1"
              >
                <X size={14} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
