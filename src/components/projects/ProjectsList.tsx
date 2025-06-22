
import React from 'react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useProjectsListState } from '@/components/projects/hooks/useProjectsListState';
import { ProjectsListFilters } from '@/components/projects/ProjectsListFilters';
import { ProjectsQuickFilters } from '@/components/projects/ProjectsQuickFilters';
import { ProjectsDisplay } from '@/components/projects/ProjectsDisplay';
import { CreateProjectDialog } from '@/components/dashboard/CreateProjectDialog';
import { EditProjectDialog } from '@/components/projects/EditProjectDialog';
import { DeleteProjectDialog } from '@/components/projects/DeleteProjectDialog';

export const ProjectsList = () => {
  const {
    projects,
    filteredProjects,
    loading,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    filters,
    showCreateDialog,
    setShowCreateDialog,
    showEditDialog,
    setShowEditDialog,
    showDeleteDialog,
    setShowDeleteDialog,
    selectedProject,
    canEdit,
    canDelete,
    filterOptions,
    quickFilterCounts,
    activeFiltersCount,
    handleFilterChange,
    handleQuickFilter,
    clearFilters,
    handleViewProject,
    handleEditProject,
    handleDeleteProject,
    handleArchiveProject
  } = useProjectsListState();

  // Quick filter configuration
  const quickFilters = [
    { key: 'all', label: 'All', count: quickFilterCounts.all },
    { key: 'active', label: 'Active', count: quickFilterCounts.active },
    { key: 'planning', label: 'Planning', count: quickFilterCounts.planning },
    { key: 'on-hold', label: 'On Hold', count: quickFilterCounts['on-hold'] },
    { key: 'completed', label: 'Completed', count: quickFilterCounts.completed },
    { key: 'archived', label: 'Archived', count: quickFilterCounts.archived }
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <ProjectsListFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        filterOptions={filterOptions}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Quick Filter Buttons */}
      <ProjectsQuickFilters
        quickFilters={quickFilters}
        activeFilter={filters.status}
        onFilterClick={handleQuickFilter}
      />

      {/* Projects Display */}
      <ProjectsDisplay
        filteredProjects={filteredProjects}
        projects={projects}
        viewMode={viewMode}
        setViewMode={setViewMode}
        canEdit={canEdit}
        canDelete={canDelete}
        activeFiltersCount={activeFiltersCount}
        searchQuery={searchQuery}
        onCreateProject={() => setShowCreateDialog(true)}
        onViewProject={handleViewProject}
        onEditProject={handleEditProject}
        onDeleteProject={handleDeleteProject}
        onArchiveProject={handleArchiveProject}
      />

      {/* Create Project Dialog */}
      <CreateProjectDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      {/* Edit Project Dialog */}
      {selectedProject && (
        <EditProjectDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          project={selectedProject}
        />
      )}

      {/* Delete Project Dialog */}
      {selectedProject && (
        <DeleteProjectDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          project={selectedProject}
        />
      )}
    </div>
  );
};
