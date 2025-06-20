
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DocumentList } from './DocumentList';
import { DocumentFilters } from './DocumentFilters';
import { DocumentQuickActions } from './DocumentQuickActions';
import { DocumentTestPanel } from './DocumentTestPanel';
import { AlertCircle, TestTube } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { useProjects } from '@/hooks/useProjects';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorFallback } from '@/components/common/ErrorFallback';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const DocumentCenterContent = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  const urlCategory = searchParams.get('category') || 'all';
  
  const [filter, setFilter] = useState(urlCategory);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTestPanel, setShowTestPanel] = useState(false);
  
  const { documents, loading, refetch, canUpload } = useDocuments(projectId || undefined);
  const { projects } = useProjects();
  const currentProject = projectId ? projects.find(p => p.id === projectId) : undefined;

  // Sync filter with URL category changes
  useEffect(() => {
    setFilter(urlCategory);
  }, [urlCategory]);

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
      {/* Header Section - Mobile-First Responsive */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">
            {currentProject ? `${currentProject.name} Documents` : 'Document Center'}
          </h2>
          {currentProject && (
            <p className="text-sm text-slate-500 mt-1">
              {currentProject.phase === 'planning' && 'Upload plans and permits to get started'}
              {currentProject.phase === 'active' && 'Track progress with photos and reports'}
              {currentProject.phase === 'completed' && 'Finalize project documentation'}
              {currentProject.phase === 'punch_list' && 'Complete final inspections and documentation'}
            </p>
          )}
        </div>
        
        {/* Quick Actions - Mobile Responsive */}
        <div className="flex flex-wrap gap-2 lg:gap-3">
          <DocumentQuickActions 
            project={currentProject}
            variant="inline"
            className="flex-wrap"
          />
          
          {/* Test Panel Toggle - Development only */}
          {process.env.NODE_ENV === 'development' && (
            <Button
              variant="outline"
              onClick={() => setShowTestPanel(!showTestPanel)}
              className="flex items-center gap-2 min-h-[44px]"
            >
              <TestTube size={16} />
              <span className="hidden sm:inline">{showTestPanel ? 'Hide Tests' : 'Show Tests'}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Access Message for Non-Company Users */}
      {!canUpload() && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Document upload is restricted. Contact your project manager for access.
          </AlertDescription>
        </Alert>
      )}

      {/* Test Panel - Development only */}
      {showTestPanel && process.env.NODE_ENV === 'development' && (
        <DocumentTestPanel />
      )}

      {/* Document Filters */}
      <DocumentFilters 
        currentFilter={filter}
        onFilterChange={setFilter}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Document List */}
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

      {/* Mobile Floating Action - Only on small screens */}
      {currentProject && canUpload() && (
        <div className="block sm:hidden">
          <DocumentQuickActions 
            project={currentProject}
            variant="floating"
          />
        </div>
      )}
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
