
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { Project } from '@/types/database';

type ViewMode = 'grid' | 'table';

interface FilterState {
  status: string;
  phase: string;
  client: string;
}

export const useProjectsListState = () => {
  const { projects, loading, archiveProject, unarchiveProject } = useProjects();
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    phase: 'all',
    client: 'all'
  });

  // Initialize filters from URL params
  useEffect(() => {
    const statusFromUrl = searchParams.get('status') || 'all';
    setFilters(prev => ({ ...prev, status: statusFromUrl }));
  }, [searchParams]);

  // Permission checks
  const canEdit = profile?.is_company_user && profile?.account_status === 'approved';
  const canDelete = profile?.is_company_user && 
                   profile?.account_status === 'approved' && 
                   (profile?.role === 'admin' || profile?.role === 'project_manager');

  // Get unique values for filters
  const filterOptions = useMemo(() => {
    const statuses = [...new Set(projects.map(p => p.status))];
    const phases = [...new Set(projects.map(p => p.phase))];
    const clients = [...new Set(projects.map(p => p.client?.company_name || p.client?.contact_person).filter(Boolean))];
    
    return { statuses, phases, clients };
  }, [projects]);

  // Calculate quick filter counts
  const quickFilterCounts = useMemo(() => ({
    all: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    planning: projects.filter(p => p.status === 'planning').length,
    'on-hold': projects.filter(p => p.status === 'on-hold').length,
    completed: projects.filter(p => p.status === 'completed').length,
    archived: projects.filter(p => p.status === 'cancelled').length
  }), [projects]);

  // Apply filters and search
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      // Search filter
      const matchesSearch = !searchQuery || 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.location?.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter - handle quick filter mapping
      let matchesStatus = true;
      if (filters.status !== 'all') {
        if (filters.status === 'archived') {
          matchesStatus = project.status === 'cancelled';
        } else {
          matchesStatus = project.status === filters.status;
        }
      }

      // Phase filter
      const matchesPhase = filters.phase === 'all' || project.phase === filters.phase;

      // Client filter
      const matchesClient = filters.client === 'all' || 
        project.client?.company_name === filters.client ||
        project.client?.contact_person === filters.client;

      return matchesSearch && matchesStatus && matchesPhase && matchesClient;
    });
  }, [projects, searchQuery, filters]);

  // Handle filter changes
  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    
    // Update URL for status filter
    if (filterType === 'status') {
      const newParams = new URLSearchParams(searchParams);
      if (value === 'all') {
        newParams.delete('status');
      } else {
        newParams.set('status', value);
      }
      setSearchParams(newParams);
    }
  };

  // Handle quick filter clicks
  const handleQuickFilter = (filterKey: string) => {
    handleFilterChange('status', filterKey);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({ status: 'all', phase: 'all', client: 'all' });
    setSearchQuery('');
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('status');
    setSearchParams(newParams);
  };

  // Project actions
  const handleViewProject = (project: Project) => {
    setSearchParams({ section: 'planning', project: project.id });
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setShowEditDialog(true);
  };

  const handleDeleteProject = (project: Project) => {
    setSelectedProject(project);
    setShowDeleteDialog(true);
  };

  const handleArchiveProject = async (project: Project) => {
    if (project.status === 'cancelled') {
      await unarchiveProject(project.id);
    } else {
      await archiveProject(project.id);
    }
  };

  // Active filters count
  const activeFiltersCount = Object.values(filters).filter(value => value !== 'all').length + (searchQuery ? 1 : 0);

  return {
    // Data
    projects,
    filteredProjects,
    loading,
    profile,
    
    // State
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
    
    // Computed values
    canEdit,
    canDelete,
    filterOptions,
    quickFilterCounts,
    activeFiltersCount,
    
    // Actions
    handleFilterChange,
    handleQuickFilter,
    clearFilters,
    handleViewProject,
    handleEditProject,
    handleDeleteProject,
    handleArchiveProject
  };
};
