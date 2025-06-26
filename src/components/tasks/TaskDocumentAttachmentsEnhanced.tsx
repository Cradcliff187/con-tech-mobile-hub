import React, { useState } from 'react';
import { Paperclip, X, Download, Plus, FileText, Upload, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTaskDocuments } from '@/hooks/useTaskDocuments';
import { useDocuments } from '@/hooks/useDocuments';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Task } from '@/types/database';
import { formatFileSize, getFileTypeInfo } from '@/utils/fileTypeHelpers';
import { useToast } from '@/hooks/use-toast';

interface TaskDocumentAttachmentsEnhancedProps {
  task: Task;
  compact?: boolean;
}

export const TaskDocumentAttachmentsEnhanced: React.FC<TaskDocumentAttachmentsEnhancedProps> = ({ 
  task, 
  compact = false 
}) => {
  const [showAttachDialog, setShowAttachDialog] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState('');
  const [relationshipType, setRelationshipType] = useState<'attachment' | 'reference' | 'requirement'>('attachment');
  const [activeTab, setActiveTab] = useState('existing');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const { taskDocuments, loading, attachDocument, detachDocument, updateRelationshipType } = useTaskDocuments(task.id);
  const { documents, loading: documentsLoading, downloadDocument, uploadDocument, canUpload } = useDocuments(task.project_id);
  const { toast } = useToast();

  const availableDocuments = documents.filter(doc => 
    !taskDocuments.some(td => td.document_id === doc.id)
  );

  const handleAttachExisting = async () => {
    if (!selectedDocumentId) return;

    const result = await attachDocument(selectedDocumentId, relationshipType);
    if (!result.error) {
      setShowAttachDialog(false);
      setSelectedDocumentId('');
      setRelationshipType('attachment');
    }
  };

  const handleUploadAndAttach = async () => {
    if (!uploadFile) return;

    setUploading(true);
    try {
      // Upload the document first
      const uploadResult = await uploadDocument(
        uploadFile, 
        'other', // Default category for task attachments
        task.project_id,
        `Task Attachment: ${uploadFile.name}`
      );

      if (uploadResult.data && uploadResult.data.id) {
        // Then attach it to the task
        const attachResult = await attachDocument(uploadResult.data.id, relationshipType);
        
        if (!attachResult.error) {
          toast({
            title: "Document uploaded and attached",
            description: `${uploadFile.name} has been successfully uploaded and attached to the task.`
          });
          setShowAttachDialog(false);
          setUploadFile(null);
          setRelationshipType('attachment');
        }
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload document",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
    }
  };

  const getRelationshipBadgeVariant = (type: string) => {
    switch (type) {
      case 'requirement': return 'destructive' as const;
      case 'reference': return 'secondary' as const;
      default: return 'default' as const;
    }
  };

  const getRelationshipLabel = (type: string) => {
    switch (type) {
      case 'requirement': return 'Required';
      case 'reference': return 'Reference';
      default: return 'Attached';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2">
        <LoadingSpinner size="sm" />
        <span className="text-sm text-slate-500">Loading documents...</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Paperclip size={16} className="text-slate-400" />
        <span className="text-sm text-slate-600">
          {taskDocuments.length} document{taskDocuments.length !== 1 ? 's' : ''}
        </span>
        {taskDocuments.some(td => td.relationship_type === 'requirement') && (
          <Badge variant="destructive" className="text-xs">
            Required docs
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-slate-800">Task Documents</h4>
        <Button
          onClick={() => setShowAttachDialog(true)}
          size="sm"
          variant="outline"
          className="text-blue-600 border-blue-200 hover:bg-blue-50"
        >
          <Plus size={16} className="mr-1" />
          Attach
        </Button>
      </div>

      {taskDocuments.length === 0 ? (
        <div className="text-center py-6 text-slate-500">
          <FileText size={32} className="mx-auto mb-2 text-slate-300" />
          <p className="text-sm">No documents attached to this task</p>
        </div>
      ) : (
        <div className="space-y-2">
          {taskDocuments.map((taskDoc) => {
            const doc = taskDoc.document;
            if (!doc) return null;

            const fileTypeInfo = getFileTypeInfo(doc.file_type, doc.name);

            // Create a DocumentRecord-compatible object for downloadDocument
            const documentRecord = {
              ...doc,
              updated_at: doc.updated_at || doc.created_at,
              uploaded_by: undefined,
              project_id: task.project_id
            };

            return (
              <div
                key={taskDoc.id}
                className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="text-slate-400">
                    {fileTypeInfo.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {doc.name}
                      </p>
                      <Badge
                        variant={getRelationshipBadgeVariant(taskDoc.relationship_type)}
                        className="text-xs"
                      >
                        {getRelationshipLabel(taskDoc.relationship_type)}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      {fileTypeInfo.displayName} • {formatFileSize(doc.file_size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Select
                    value={taskDoc.relationship_type}
                    onValueChange={(value) =>
                      updateRelationshipType(taskDoc.id, value as 'attachment' | 'reference' | 'requirement')
                    }
                  >
                    <SelectTrigger className="w-24 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="attachment">Attached</SelectItem>
                      <SelectItem value="reference">Reference</SelectItem>
                      <SelectItem value="requirement">Required</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => downloadDocument(documentRecord)}
                  >
                    <Download size={14} />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => detachDocument(taskDoc.id)}
                  >
                    <X size={14} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Enhanced Attach Document Dialog */}
      {showAttachDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Attach Document</h3>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="existing">Existing Docs</TabsTrigger>
                <TabsTrigger value="upload" disabled={!canUpload()}>Upload New</TabsTrigger>
              </TabsList>
              
              <TabsContent value="existing" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Select Document
                  </label>
                  <Select value={selectedDocumentId} onValueChange={setSelectedDocumentId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a document..." />
                    </SelectTrigger>
                    <SelectContent>
                      {documentsLoading ? (
                        <div className="p-2 text-center text-slate-500">Loading...</div>
                      ) : availableDocuments.length === 0 ? (
                        <div className="p-2 text-center text-slate-500">
                          No available documents. Try uploading a new one.
                        </div>
                      ) : (
                        availableDocuments.map((doc) => (
                          <SelectItem key={doc.id} value={doc.id}>
                            {doc.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Relationship Type
                  </label>
                  <Select 
                    value={relationshipType} 
                    onValueChange={(value) => setRelationshipType(value as 'attachment' | 'reference' | 'requirement')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="attachment">Attachment</SelectItem>
                      <SelectItem value="reference">Reference</SelectItem>
                      <SelectItem value="requirement">Requirement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={() => setShowAttachDialog(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAttachExisting}
                    disabled={!selectedDocumentId}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Attach Document
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="upload" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Upload New Document
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="upload-input"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
                    />
                    <label htmlFor="upload-input" className="cursor-pointer">
                      <FolderOpen size={32} className="mx-auto mb-2 text-slate-400" />
                      <p className="text-sm text-slate-600">
                        Click to select a file
                      </p>
                      {uploadFile && (
                        <p className="text-xs text-slate-500 mt-1">
                          Selected: {uploadFile.name}
                        </p>
                      )}
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Relationship Type
                  </label>
                  <Select 
                    value={relationshipType} 
                    onValueChange={(value) => setRelationshipType(value as 'attachment' | 'reference' | 'requirement')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="attachment">Attachment</SelectItem>
                      <SelectItem value="reference">Reference</SelectItem>
                      <SelectItem value="requirement">Requirement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={() => setShowAttachDialog(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUploadAndAttach}
                    disabled={!uploadFile || uploading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {uploading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={16} className="mr-2" />
                        Upload & Attach
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
};
