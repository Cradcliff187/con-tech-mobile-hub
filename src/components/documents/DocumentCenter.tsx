
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DocumentList } from './DocumentList';
import { DocumentFilters } from './DocumentFilters';
import { SmartDocumentUpload } from './SmartDocumentUpload';
import { DocumentTestPanel } from './DocumentTestPanel';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, TestTube, FileText, Upload, Camera, Plus } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
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
  const { profile } = useAuth();
  const currentProject = projectId ? projects.find(p => p.id === projectId) : undefined;

  // Sync filter with URL category changes
  useEffect(() => {
    setFilter(urlCategory);
  }, [urlCategory]);

  const handleUploadComplete = () => {
    refetch().catch(console.error);
  };

  const getPhaseDescription = () => {
    if (!currentProject) return "Manage and organize all project documents in one place";
    
    switch (currentProject.phase) {
      case 'planning':
        return "Upload plans, permits, and contracts to establish project foundation";
      case 'active':
        return "Track progress with photos, reports, and receipts";
      case 'punch_list':
        return "Complete final inspections and document punch list items";
      case 'closeout':
        return "Finalize project documentation and warranties";
      case 'completed':
        return "Access completed project documentation and records";
      default:
        return "Manage project documents and track progress";
    }
  };

  const getProjectBadge = () => {
    if (!currentProject) return undefined;
    
    const statusLabels = {
      'planning': 'Planning',
      'active': 'Active',
      'on-hold': 'On Hold',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };
    
    const badgeVariants = {
      'planning': 'outline' as const,
      'active': 'default' as const,
      'on-hold': 'secondary' as const,
      'completed': 'default' as const,
      'cancelled': 'destructive' as const
    };
    
    return {
      text: statusLabels[currentProject.status] || currentProject.status,
      variant: badgeVariants[currentProject.status] || 'outline' as const
    };
  };

  const getMetaInfo = () => {
    const meta = [];
    
    if (documents.length > 0) {
      meta.push({
        label: "Documents",
        value: documents.length.toString(),
        icon: <FileText size={16} />
      });
    }
    
    if (currentProject) {
      meta.push({
        label: "Progress",
        value: `${currentProject.progress}%`,
        icon: undefined
      });
    }
    
    return meta;
  };

  const getPageActions = () => {
    const actions = [];
    
    // Test Panel Toggle - Development only
    if (process.env.NODE_ENV === 'development') {
      actions.push({
        label: showTestPanel ? 'Hide Tests' : 'Show Tests',
        onClick: () => setShowTestPanel(!showTestPanel),
        variant: 'outline' as const,
        icon: <TestTube size={16} />
      });
    }
    
    return actions;
  };

  const getPrimaryAction = () => {
    if (!canUpload()) return undefined;
    
    return {
      label: "Smart Upload",
      onClick: () => {}, // This will be handled by the SmartDocumentUpload component
      icon: <Upload size={16} />
    };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1">
              <Skeleton className="h-7 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
              <div className="flex items-center gap-4 mt-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>

        {/* Filters Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
        </div>

        {/* Document List Skeleton */}
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={currentProject ? `${currentProject.name} Documents` : 'Document Center'}
        description={getPhaseDescription()}
        badge={getProjectBadge()}
        meta={getMetaInfo()}
        actions={getPageActions()}
        primaryAction={getPrimaryAction()}
        variant="default"
      />

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

      {/* Smart Upload Component */}
      {canUpload() && (
        <SmartDocumentUpload
          projectId={currentProject?.id}
          onUploadComplete={handleUploadComplete}
          variant="inline"
          className="mb-6"
        />
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
