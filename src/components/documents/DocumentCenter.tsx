
import { useState } from 'react';
import { DocumentList } from './DocumentList';
import { DocumentFilters } from './DocumentFilters';
import { DocumentUpload } from './DocumentUpload';
import { ReceiptUpload } from './ReceiptUpload';
import { Folder } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';

export const DocumentCenter = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { documents, loading, refetch } = useDocuments();

  const handleUploadComplete = () => {
    refetch();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="text-slate-500 mt-2">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-800">Document Center</h2>
        
        <div className="flex gap-2">
          <DocumentUpload onUploadComplete={handleUploadComplete} />
          <ReceiptUpload onUploadComplete={handleUploadComplete} />
          <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2">
            <Folder size={20} />
            New Folder
          </button>
        </div>
      </div>

      <DocumentFilters 
        currentFilter={filter}
        onFilterChange={setFilter}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <DocumentList 
        filter={filter} 
        searchTerm={searchTerm}
        documents={documents}
      />
    </div>
  );
};
