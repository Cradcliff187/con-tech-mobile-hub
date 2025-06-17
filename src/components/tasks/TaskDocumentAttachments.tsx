
import React, { useState } from 'react';
import { Paperclip, X, Eye, Download, Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTaskDocuments } from '@/hooks/useTaskDocuments';
import { useDocuments } from '@/hooks/useDocuments';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Task } from '@/types/database';
import { formatFileSize, getFileTypeInfo } from '@/utils/fileTypeHelpers';

interface TaskDocumentAttachmentsProps {
  task: Task;
  compact?: boolean;
}

export const TaskDocumentAttachments: React.FC<TaskDocumentAttachmentsProps> = ({ 
  task, 
  compact = false 
}) => {
  const [showAttachDialog, setShowAttachDialog] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState('');
  const [relationshipType, setRelationshipType] = useState<'attachment' | 'reference' | 'requirement'>('attachment');
  
  const { taskDocuments, loading, attachDocument, detachDocument, updateRelationshipType } = useTaskDocuments(task.id);
  const { documents, loading: documentsLoading, downloadDocument } = useDocuments(task.project_id);

  const availableDocuments = documents.filter(doc => 
    !taskDocuments.some(td => td.document_id === doc.id)
  );

  const handleAttachDocument = async () => {
    if (!selectedDocumentId) return;

    const result = await attachDocument(selectedDocumentId, relationshipType);
    if (!result.error) {
      setShowAttachDialog(false);
      setSelectedDocumentId('');
      setRelationshipType('attachment');
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

      {/* Attach Document Dialog */}
      {showAttachDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Attach Document</h3>
            
            <div className="space-y-4">
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
                      <div className="p-2 text-center text-slate-500">No available documents</div>
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
                onClick={handleAttachDocument}
                disabled={!selectedDocumentId}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Attach Document
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
