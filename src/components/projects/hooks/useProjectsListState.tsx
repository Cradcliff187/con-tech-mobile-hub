
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { Project } from '@/types/database';
import { getLifecycleStatus, getLifecycleStatusLabel } from '@/utils/lifecycle-status';

type ViewMode = 'grid' | 'table';

interface FilterState {
  status: string;
  phase: string;
  client: string;
  lifecycle_status: string; // New unified filter
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
    client: 'all',
    lifecycle_status: 'all'
  });

  // Initialize filters from URL params
  useEffect(() => {
    const statusFromUrl = searchParams.get('status') || 'all';
    const lifecycleStatusFromUrl = searchParams.get('lifecycle_status') || 'all';
    setFilters(prev => ({ 
      ...prev, 
      status: statusFromUrl, 
      lifecycle_status: lifecycleStatusFromUrl 
    }));
  }, [searchParams]);

  // Permission checks
  const canEdit = profile?.is_company_user && profile?.account_status === 'approved';
  const canDelete = profile?.is_company_user && 
                   profile?.account_status === 'approved' && 
                   (profile?.role === 'admin' || profile?.role === 'project_manager');

  // Get unique values for filters - now includes lifecycle status
  const filterOptions = useMemo(() => {
    const statuses = [...new Set(projects.map(p => p.status))];
    const phases = [...new Set(projects.map(p => p.phase))];
    const lifecycleStatuses = [...new Set(projects.map(p => getLifecycleStatus(p)))];
    const clients = [...new Set(projects.map(p => p.client?.company_name || p.client?.contact_person).filter(Boolean))];
    
    return { statuses, phases, lifecycleStatuses, clients };
  }, [projects]);

  // Calculate quick filter counts - updated to use lifecycle status
  const quickFilterCounts = useMemo(() => {
    const getCountByLifecycleStatus = (targetStatus: string) => {
      return projects.filter(p => {
        const lifecycleStatus = getLifecycleStatus(p);
        return lifecycleStatus === targetStatus;
      }).length;
    };

    return {
      all: projects.length,
      active: getCountByLifecycleStatus('construction_active'),
      planning: getCountByLifecycleStatus('pre_planning') + getCountByLifecycleStatus('planning_active'),
      'on-hold': getCountByLifecycleStatus('construction_hold'),
      completed: getCountByLifecycleStatus('project_completed'),
      archived: getCountByLifecycleStatus('project_cancelled')
    };
  }, [projects]);

  // Apply filters and search - updated to include lifecycle status filtering
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const lifecycleStatus = getLifecycleStatus(project);
      
      // Search filter
      const matchesSearch = !searchQuery || 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.location?.toLowerCase().includes(searchQuery.toLowerCase());

      // Legacy status filter - handle quick filter mapping
      let matchesStatus = true;
      if (filters.status !== 'all') {
        if (filters.status === 'archived') {
          matchesStatus = lifecycleStatus === 'project_cancelled';
        } else if (filters.status === 'planning') {
          matchesStatus = ['pre_planning', 'planning_active'].includes(lifecycleStatus);
        } else if (filters.status === 'active') {
          matchesStatus = lifecycleStatus === 'construction_active';
        } else if (filters.status === 'on-hold') {
          matchesStatus = lifecycleStatus === 'construction_hold';
        } else if (filters.status === 'completed') {
          matchesStatus = lifecycleStatus === 'project_completed';
        } else {
          matchesStatus = project.status === filters.status;
        }
      }

      // Lifecycle status filter (new unified filter)
      const matchesLifecycleStatus = filters.lifecycle_status === 'all' || 
        lifecycleStatus === filters.lifecycle_status;

      // Phase filter (legacy)
      const matchesPhase = filters.phase === 'all' || project.phase === filters.phase;

      // Client filter
      const matchesClient = filters.client === 'all' || 
        project.client?.company_name === filters.client ||
        project.client?.contact_person === filters.client;

      return matchesSearch && matchesStatus && matchesLifecycleStatus && matchesPhase && matchesClient;
    });
  }, [projects, searchQuery, filters]);

  // Handle filter changes
  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    
    // Update URL for status filter
    if (filterType === 'status' || filterType === 'lifecycle_status') {
      const newParams = new URLSearchParams(searchParams);
      if (value === 'all') {
        newParams.delete(filterType);
      } else {
        newParams.set(filterType, value);
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
    setFilters({ status: 'all', phase: 'all', client: 'all', lifecycle_status: 'all' });
    setSearchQuery('');
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('status');
    newParams.delete('lifecycle_status');
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
    const lifecycleStatus = getLifecycleStatus(project);
    if (lifecycleStatus === 'project_cancelled') {
      await unarchiveProject(project.id);
    } else {
      await archiveProject(project.id);
    }
  };

  // Active filters count - updated to include lifecycle status
  const activeFiltersCount = Object.entries(filters)
    .filter(([key, value]) => value !== 'all').length + (searchQuery ? 1 : 0);

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
