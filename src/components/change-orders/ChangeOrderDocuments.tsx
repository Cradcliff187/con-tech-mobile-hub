import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useChangeOrderDocuments } from '@/hooks/useChangeOrders';
import { useDocuments } from '@/hooks/useDocuments';
import { Download, FileText, X, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { SmartDocumentUpload } from '@/components/documents/SmartDocumentUpload';

interface ChangeOrderDocumentsProps {
  changeOrderId: string;
  projectId: string;
  readOnly?: boolean;
}

export const ChangeOrderDocuments = ({ changeOrderId, projectId, readOnly = false }: ChangeOrderDocumentsProps) => {
  const { documents, loading, attachDocument, detachDocument } = useChangeOrderDocuments(changeOrderId);
  const { downloadDocument } = useDocuments();
  const [showUpload, setShowUpload] = useState(false);

  const handleDownload = async (doc: any) => {
    try {
      if (doc.document) {
        await downloadDocument(doc.document);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const handleDetach = async (documentId: string) => {
    try {
      await detachDocument(documentId);
    } catch (error) {
      console.error('Error detaching document:', error);
    }
  };

  const handleUploadComplete = () => {
    // Upload completed - refresh documents
    setShowUpload(false);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Supporting Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-slate-200 rounded w-1/3"></div>
            <div className="h-8 bg-slate-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Supporting Documents</CardTitle>
            {documents.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {documents.length}/5
              </Badge>
            )}
          </div>
          {!readOnly && documents.length < 5 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowUpload(!showUpload)}
            >
              <Upload className="w-4 h-4 mr-2" />
              Add Documents
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showUpload && !readOnly && documents.length < 5 && (
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-4">
            <SmartDocumentUpload
              projectId={projectId}
              variant="inline"
              onUploadComplete={handleUploadComplete}
              className="border-none p-0"
            />
          </div>
        )}

        {documents.length >= 5 && !readOnly && (
          <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
            Maximum of 5 documents allowed per change order.
          </div>
        )}

        {documents.length === 0 ? (
          <div className="text-center py-6 text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>No documents attached to this change order</p>
            {!readOnly && (
              <p className="text-sm">Click "Add Documents" to attach supporting files</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <FileText className="w-5 h-5 text-slate-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {doc.document?.name || 'Unknown Document'}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-slate-500">
                      <span>
                        Uploaded {format(new Date(doc.uploaded_at), 'MMM dd, yyyy')}
                      </span>
                      {doc.document?.file_size && (
                        <>
                          <span>•</span>
                          <span>
                            {(doc.document.file_size / 1024 / 1024).toFixed(1)} MB
                          </span>
                        </>
                      )}
                      {doc.document?.file_type && (
                        <>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs">
                            {doc.document.file_type.split('/')[1]?.toUpperCase()}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(doc)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  {!readOnly && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDetach(doc.document_id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};