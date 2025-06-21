
import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Filter, Grid, List } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useDocuments } from '@/hooks/useDocuments';
import { useAuth } from '@/hooks/useAuth';
import { SmartDocumentUpload } from './SmartDocumentUpload';
import { DocumentList } from './DocumentList';
import { DocumentFilters } from './DocumentFilters';
import { DocumentQuickActions } from './DocumentQuickActions';
import { DocumentErrorBoundary } from './DocumentErrorBoundary';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export const DocumentCenter = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [activeFilters, setActiveFilters] = useState({
    category: '',
    dateRange: '',
    fileType: ''
  });

  const { projects } = useProjects();
  const { documents, loading, refetch } = useDocuments(projectId || undefined);
  const { profile } = useAuth();

  const currentProject = useMemo(() => 
    projects.find(p => p.id === projectId), 
    [projects, projectId]
  );

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      if (activeFilters.category && doc.category !== activeFilters.category) {
        return false;
      }
      if (activeFilters.fileType && !doc.file_type?.includes(activeFilters.fileType)) {
        return false;
      }
      // Add date range filtering if needed
      return true;
    });
  }, [documents, activeFilters]);

  const documentStats = useMemo(() => {
    const stats = {
      total: documents.length,
      byCategory: {} as Record<string, number>,
      totalSize: 0
    };

    documents.forEach(doc => {
      if (doc.category) {
        stats.byCategory[doc.category] = (stats.byCategory[doc.category] || 0) + 1;
      }
      if (doc.file_size) {
        stats.totalSize += doc.file_size;
      }
    });

    return stats;
  }, [documents]);

  const handleUploadComplete = () => {
    refetch();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <DocumentErrorBoundary fallbackMessage="Failed to load document center">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
              <FileText className="text-blue-600" size={28} />
              Document Center
            </h1>
            {currentProject && (
              <p className="text-slate-600 mt-1">
                Managing documents for <span className="font-semibold">{currentProject.name}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs sm:text-sm">
              {documentStats.total} documents
            </Badge>
            <Badge variant="outline" className="text-xs sm:text-sm">
              {(documentStats.totalSize / (1024 * 1024)).toFixed(1)} MB
            </Badge>
          </div>
        </div>

        {/* Quick Actions */}
        <DocumentQuickActions 
          project={currentProject}
          variant="inline"
          className="flex-wrap gap-2"
        />

        {/* Main Content */}
        <Tabs defaultValue="documents" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3">
            <TabsTrigger value="documents" className="text-xs sm:text-sm">
              Documents ({filteredDocuments.length})
            </TabsTrigger>
            <TabsTrigger value="upload" className="text-xs sm:text-sm">
              Upload
            </TabsTrigger>
            <TabsTrigger value="analytics" className="hidden sm:block text-xs sm:text-sm">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="space-y-4">
            {/* Filters and View Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <DocumentFilters
                activeFilters={activeFilters}
                onFiltersChange={setActiveFilters}
                className="flex-1"
              />
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors min-h-[44px] min-w-[44px] ${
                    viewMode === 'list' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'hover:bg-slate-100 text-slate-600'
                  }`}
                  aria-label="List view"
                >
                  <List size={18} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors min-h-[44px] min-w-[44px] ${
                    viewMode === 'grid' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'hover:bg-slate-100 text-slate-600'
                  }`}
                  aria-label="Grid view"
                >
                  <Grid size={18} />
                </button>
              </div>
            </div>

            {/* Document List */}
            <DocumentList 
              documents={filteredDocuments}
              viewMode={viewMode}
              onRefresh={refetch}
            />
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <SmartDocumentUpload
              projectId={projectId || undefined}
              onUploadComplete={handleUploadComplete}
              variant="inline"
              className="w-full"
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(documentStats.byCategory).map(([category, count]) => (
                <Card key={category}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium capitalize">
                      {category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{count}</div>
                    <p className="text-xs text-slate-500">documents</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DocumentErrorBoundary>
  );
};
