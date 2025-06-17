
import { useState } from 'react';
import { DocumentList } from './DocumentList';
import { DocumentFilters } from './DocumentFilters';
import { DocumentUpload } from './DocumentUpload';
import { ReceiptUpload } from './ReceiptUpload';
import { PhotoUpload } from './PhotoUpload';
import { Folder, AlertCircle } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorFallback } from '@/components/common/ErrorFallback';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Alert, AlertDescription } from '@/components/ui/alert';

const DocumentCenterContent = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { documents, loading, refetch } = useDocuments();

  const handleUploadComplete = () => {
    refetch().catch(console.error);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="animate-pulse">
            <div className="h-7 bg-slate-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-64"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-32 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-slate-200 rounded animate-pulse"></div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="h-16 bg-slate-200 rounded animate-pulse"></div>
          <div className="grid gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-800">Document Center</h2>
        
        <div className="flex flex-wrap gap-2">
          <PhotoUpload onUploadComplete={handleUploadComplete} />
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

      <ErrorBoundary
        fallback={
          <ErrorFallback
            title="Document Loading Error"
            description="There was a problem loading the documents. Please try refreshing the page."
            resetError={() => window.location.reload()}
            showHomeButton
          />
        }
      >
        <DocumentList 
          filter={filter} 
          searchTerm={searchTerm}
          documents={documents}
        />
      </ErrorBoundary>
    </div>
  );
};

export const DocumentCenter = () => {
  return (
    <ErrorBoundary showHomeButton>
      <DocumentCenterContent />
    </ErrorBoundary>
  );
};
