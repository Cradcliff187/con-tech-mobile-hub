
import { FileText, Image, File, Folder, Download, Share, Trash2, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDocuments } from '@/hooks/useDocuments';
import { useToast } from '@/hooks/use-toast';

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

interface DocumentListProps {
  filter: string;
  searchTerm: string;
  documents: Document[];
}

export const DocumentList = ({ filter, searchTerm, documents }: DocumentListProps) => {
  const { deleteDocument } = useDocuments();
  const { toast } = useToast();

  const getFileIcon = (category?: string, fileType?: string) => {
    if (category === 'receipts') {
      return <Receipt className="text-green-600" size={20} />;
    }
    
    if (category === 'photos' || fileType?.startsWith('image/')) {
      return <Image className="text-green-500" size={20} />;
    }
    
    if (fileType?.includes('pdf') || category === 'plans' || category === 'permits' || category === 'contracts' || category === 'reports') {
      return <FileText className="text-red-500" size={20} />;
    }
    
    return <File className="text-slate-500" size={20} />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      const { error } = await deleteDocument(id);
      if (error) {
        toast({
          title: "Delete Failed",
          description: "Failed to delete document",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Document deleted successfully"
        });
      }
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesFilter = filter === 'all' || doc.category === filter;
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.project?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.uploader?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      <div className="divide-y divide-slate-100">
        {filteredDocuments.map((doc) => (
          <div key={doc.id} className="p-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {getFileIcon(doc.category, doc.file_type)}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-slate-800 truncate">
                    {doc.name}
                  </h4>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                    <span>{getCategoryLabel(doc.category)}</span>
                    <span>{formatFileSize(doc.file_size)}</span>
                    <span>Modified: {new Date(doc.updated_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                    <span>Project: {doc.project?.name || 'No project'}</span>
                    <span>By: {doc.uploader?.full_name || doc.uploader?.email || 'Unknown'}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 text-slate-500 hover:text-slate-700"
                >
                  <Share size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 text-slate-500 hover:text-slate-700"
                >
                  <Download size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 text-slate-500 hover:text-red-600"
                  onClick={() => handleDelete(doc.id, doc.name)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredDocuments.length === 0 && (
        <div className="p-8 text-center">
          <FileText size={48} className="mx-auto mb-4 text-slate-400" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">No Documents Found</h3>
          <p className="text-slate-500">
            {documents.length === 0 
              ? "Upload your first document to get started"
              : "No documents match your current filters"
            }
          </p>
        </div>
      )}
    </div>
  );
};
