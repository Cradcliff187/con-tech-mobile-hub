
import React, { useState } from 'react';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { GlobalStatusDropdown } from '@/components/ui/global-status-dropdown';
import { EnhancedStatusTransitionDialog } from '@/components/common/EnhancedStatusTransitionDialog';
import { Plus, Grid3X3, List, MoreHorizontal, Eye, Edit, Trash2, Archive, ArchiveRestore } from 'lucide-react';
import { Project } from '@/types/database';
import { getUnifiedLifecycleStatus, updateProjectStatus } from '@/utils/unified-lifecycle-utils';
import { UnifiedLifecycleStatus } from '@/types/unified-lifecycle';
import { toast } from '@/hooks/use-toast';

type ViewMode = 'grid' | 'table';

interface ProjectsDisplayProps {
  filteredProjects: Project[];
  projects: Project[];
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  canEdit: boolean;
  canDelete: boolean;
  activeFiltersCount: number;
  searchQuery: string;
  onCreateProject: () => void;
  onViewProject: (project: Project) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  onArchiveProject: (project: Project) => void;
  onStatusChange?: (project: Project, newStatus: string) => void;
}

export const ProjectsDisplay = ({
  filteredProjects,
  projects,
  viewMode,
  setViewMode,
  canEdit,
  canDelete,
  activeFiltersCount,
  searchQuery,
  onCreateProject,
  onViewProject,
  onEditProject,
  onDeleteProject,
  onArchiveProject,
  onStatusChange
}: ProjectsDisplayProps) => {
  const [statusTransitionDialog, setStatusTransitionDialog] = useState<{
    open: boolean;
    project?: Project;
    targetStatus?: UnifiedLifecycleStatus;
  }>({ open: false });
  const [updatingProjects, setUpdatingProjects] = useState<Set<string>>(new Set());

  const handleStatusChange = async (project: Project, newStatus: string) => {
    if (!canEdit) return;

    const currentStatus = getUnifiedLifecycleStatus(project);
    const targetStatus = newStatus as UnifiedLifecycleStatus;

    // For critical status changes, show confirmation dialog
    if (['cancelled', 'on_hold'].includes(targetStatus)) {
      setStatusTransitionDialog({
        open: true,
        project,
        targetStatus
      });
      return;
    }

    // For other status changes, update directly
    await performStatusUpdate(project, targetStatus);
  };

  const performStatusUpdate = async (project: Project, newStatus: UnifiedLifecycleStatus) => {
    setUpdatingProjects(prev => new Set(prev).add(project.id));

    try {
      const result = await updateProjectStatus(project.id, newStatus);
      
      if (result.success) {
        toast({
          title: "Status Updated",
          description: `Project status changed to ${newStatus.replace('_', ' ')}`,
        });
        
        // Call the parent's status change handler if provided
        if (onStatusChange) {
          onStatusChange(project, newStatus);
        }
      } else {
        throw new Error(result.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Status update failed:', error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : 'Failed to update project status',
        variant: "destructive"
      });
    } finally {
      setUpdatingProjects(prev => {
        const newSet = new Set(prev);
        newSet.delete(project.id);
        return newSet;
      });
    }
  };

  const handleTransitionConfirm = async () => {
    if (statusTransitionDialog.project && statusTransitionDialog.targetStatus) {
      await performStatusUpdate(statusTransitionDialog.project, statusTransitionDialog.targetStatus);
      setStatusTransitionDialog({ open: false });
    }
  };

  // Table columns for DataTable
  const tableColumns = [
    {
      key: 'name',
      header: 'Project Name',
      sortable: true,
      accessor: (project: Project) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-800">{project.name}</span>
          {project.description && (
            <span className="text-sm text-slate-500 truncate max-w-xs">{project.description}</span>
          )}
        </div>
      ),
      mobileLabel: 'Project'
    },
    {
      key: 'unified_lifecycle_status',
      header: 'Status',
      filterable: true,
      accessor: (project: Project) => {
        const unifiedStatus = getUnifiedLifecycleStatus(project);
        const isUpdating = updatingProjects.has(project.id);
        
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <GlobalStatusDropdown
              entityType="project"
              currentStatus={unifiedStatus}
              onStatusChange={(newStatus) => handleStatusChange(project, newStatus)}
              showAsDropdown={canEdit}
              size="sm"
              disabled={!canEdit}
              isUpdating={isUpdating}
            />
          </div>
        );
      }
    },
    {
      key: 'client',
      header: 'Client',
      accessor: (project: Project) => (
        <span className="text-sm">
          {project.client?.company_name || project.client?.contact_person || 'No client'}
        </span>
      ),
      mobileLabel: 'Client'
    },
    {
      key: 'progress',
      header: 'Progress',
      accessor: (project: Project) => (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-slate-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full bg-blue-500 transition-all duration-300"
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <span className="text-sm font-medium">{project.progress}%</span>
        </div>
      ),
      mobileLabel: 'Progress'
    },
    {
      key: 'budget',
      header: 'Budget',
      accessor: (project: Project) => (
        <div className="text-right">
          {project.budget ? (
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(project.budget)}
              </span>
              {project.spent && (
                <span className="text-xs text-slate-500">
                  Spent: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(project.spent)}
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-400">No budget</span>
          )}
        </div>
      ),
      mobileLabel: 'Budget'
    },
    {
      key: 'updated_at',
      header: 'Last Updated',
      sortable: true,
      accessor: (project: Project) => (
        <span className="text-sm text-slate-500">
          {new Date(project.updated_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </span>
      ),
      mobileLabel: 'Updated'
    }
  ];

  if (filteredProjects.length === 0) {
    return (
      <EmptyState
        icon={<Plus size={48} />}
        title="No projects found"
        description={
          activeFiltersCount > 0 
            ? "No projects match your current filters. Try adjusting your search criteria."
            : searchQuery 
              ? "No projects match your search criteria." 
              : "Get started by creating your first project."
        }
        actions={!searchQuery && activeFiltersCount === 0 && canEdit ? [
          { 
            label: "Create Project", 
            onClick: onCreateProject,
            icon: <Plus size={16} />
          }
        ] : []}
      />
    );
  }

  return (
    <>
      {/* View Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="hidden sm:flex border rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="px-3"
          >
            <Grid3X3 size={16} />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            className="px-3"
          >
            <List size={16} />
          </Button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="relative group">
              <div 
                className="cursor-pointer" 
                onClick={() => onViewProject(project)}
              >
                <ProjectCard project={project} />
              </div>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-white shadow-sm">
                      <MoreHorizontal size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewProject(project)}>
                      <Eye size={16} />
                      View Project
                    </DropdownMenuItem>
                    {canEdit && (
                      <DropdownMenuItem onClick={() => onEditProject(project)}>
                        <Edit size={16} />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {canEdit && (
                      <DropdownMenuItem onClick={() => onArchiveProject(project)}>
                        {getUnifiedLifecycleStatus(project) === 'cancelled' ? (
                          <>
                            <ArchiveRestore size={16} />
                            Restore
                          </>
                        ) : (
                          <>
                            <Archive size={16} />
                            Archive
                          </>
                        )}
                      </DropdownMenuItem>
                    )}
                    {canDelete && (
                      <DropdownMenuItem 
                        onClick={() => onDeleteProject(project)}
                        className="text-red-600"
                      >
                        <Trash2 size={16} />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <DataTable
          data={filteredProjects}
          columns={tableColumns}
          searchable={false}
          sortable={true}
          pagination={true}
          pageSize={10}
          mobileCardView={true}
          onRowClick={onViewProject}
          actions={(project: Project) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewProject(project)}>
                  <Eye size={16} />
                  View
                </DropdownMenuItem>
                {canEdit && (
                  <DropdownMenuItem onClick={() => onEditProject(project)}>
                    <Edit size={16} />
                    Edit
                  </DropdownMenuItem>
                )}
                {canEdit && (
                  <DropdownMenuItem onClick={() => onArchiveProject(project)}>
                    {getUnifiedLifecycleStatus(project) === 'cancelled' ? (
                      <>
                        <ArchiveRestore size={16} />
                        Restore
                      </>
                    ) : (
                      <>
                        <Archive size={16} />
                        Archive
                      </>
                    )}
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <DropdownMenuItem 
                    onClick={() => onDeleteProject(project)}
                    className="text-red-600"
                  >
                    <Trash2 size={16} />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        />
      )}

      <div className="text-sm text-slate-500 text-center">
        Showing {filteredProjects.length} of {projects.length} projects
        {activeFiltersCount > 0 && ` (${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''} active)`}
      </div>

      {/* Status Transition Dialog */}
      {statusTransitionDialog.open && statusTransitionDialog.project && statusTransitionDialog.targetStatus && (
        <EnhancedStatusTransitionDialog
          open={statusTransitionDialog.open}
          onOpenChange={(open) => setStatusTransitionDialog({ open })}
          projectId={statusTransitionDialog.project.id}
          currentStatus={getUnifiedLifecycleStatus(statusTransitionDialog.project)}
          targetStatus={statusTransitionDialog.targetStatus}
          project={statusTransitionDialog.project}
          onConfirm={handleTransitionConfirm}
          isLoading={updatingProjects.has(statusTransitionDialog.project.id)}
        />
      )}
    </>
  );
};
