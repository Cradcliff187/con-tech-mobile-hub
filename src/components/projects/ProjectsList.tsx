import React, { useState, useMemo } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Search, Grid3X3, List, MoreHorizontal, Eye, Edit, Trash2, Archive, X } from 'lucide-react';
import { CreateProjectDialog } from '@/components/dashboard/CreateProjectDialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/ui/empty-state';
import { useSearchParams } from 'react-router-dom';
import { Project } from '@/types/database';

type ViewMode = 'grid' | 'table';

interface FilterState {
  status: string;
  phase: string;
  client: string;
}

export const ProjectsList = () => {
  const { projects, loading } = useProjects();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('table'); // Changed default from 'grid' to 'table'
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    phase: 'all',
    client: 'all'
  });

  // Get unique values for filters
  const filterOptions = useMemo(() => {
    const statuses = [...new Set(projects.map(p => p.status))];
    const phases = [...new Set(projects.map(p => p.phase))];
    const clients = [...new Set(projects.map(p => p.client?.company_name || p.client?.contact_person).filter(Boolean))];
    
    return { statuses, phases, clients };
  }, [projects]);

  // Apply filters and search
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      // Search filter
      const matchesSearch = !searchQuery || 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.location?.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = filters.status === 'all' || project.status === filters.status;

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
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({ status: 'all', phase: 'all', client: 'all' });
    setSearchQuery('');
  };

  // Project actions
  const handleViewProject = (project: Project) => {
    setSearchParams({ section: 'planning', project: project.id });
  };

  const handleEditProject = (project: Project) => {
    console.log('Edit project:', project.id);
    // TODO: Implement edit functionality
  };

  const handleArchiveProject = (project: Project) => {
    console.log('Archive project:', project.id);
    // TODO: Implement archive functionality
  };

  const handleDeleteProject = (project: Project) => {
    console.log('Delete project:', project.id);
    // TODO: Implement delete functionality with confirmation
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
      key: 'status',
      header: 'Status',
      filterable: true,
      accessor: (project: Project) => (
        <Badge variant={
          project.status === 'active' ? 'default' :
          project.status === 'completed' ? 'secondary' :
          project.status === 'on-hold' ? 'outline' : 'outline'
        }>
          {project.status.replace('-', ' ')}
        </Badge>
      )
    },
    {
      key: 'phase',
      header: 'Phase',
      filterable: true,
      accessor: (project: Project) => (
        <Badge variant="outline">
          {project.phase.replace('_', ' ')}
        </Badge>
      )
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

  // Active filters count
  const activeFiltersCount = Object.values(filters).filter(value => value !== 'all').length + (searchQuery ? 1 : 0);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Projects</h1>
          <p className="text-slate-600">Manage and overview all your construction projects</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
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
          <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
            <Plus size={20} />
            New Project
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {filterOptions.statuses.map(status => (
                <SelectItem key={status} value={status}>
                  {status.replace('-', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.phase} onValueChange={(value) => handleFilterChange('phase', value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Phase" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Phases</SelectItem>
              {filterOptions.phases.map(phase => (
                <SelectItem key={phase} value={phase}>
                  {phase.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.client} onValueChange={(value) => handleFilterChange('client', value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {filterOptions.clients.map(client => (
                <SelectItem key={client} value={client}>
                  {client}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="flex items-center gap-1"
            >
              <X size={14} />
              Clear ({activeFiltersCount})
            </Button>
          )}
        </div>
      </div>

      {/* Projects Display */}
      {filteredProjects.length === 0 ? (
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
          actions={!searchQuery && activeFiltersCount === 0 ? [
            { 
              label: "Create Project", 
              onClick: () => setShowCreateDialog(true),
              icon: <Plus size={16} />
            }
          ] : []}
        />
      ) : (
        <>
          {viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <div key={project.id} className="relative group">
                  <div 
                    className="cursor-pointer" 
                    onClick={() => handleViewProject(project)}
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
                        <DropdownMenuItem onClick={() => handleViewProject(project)}>
                          <Eye size={16} />
                          View Project
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditProject(project)}>
                          <Edit size={16} />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleArchiveProject(project)}>
                          <Archive size={16} />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteProject(project)}
                          className="text-red-600"
                        >
                          <Trash2 size={16} />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Table View */
            <DataTable
              data={filteredProjects}
              columns={tableColumns}
              searchable={false} // We handle search externally
              sortable={true}
              pagination={true}
              pageSize={10}
              mobileCardView={true}
              onRowClick={handleViewProject}
              actions={(project: Project) => (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewProject(project)}>
                      <Eye size={16} />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditProject(project)}>
                      <Edit size={16} />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleArchiveProject(project)}>
                      <Archive size={16} />
                      Archive
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteProject(project)}
                      className="text-red-600"
                    >
                      <Trash2 size={16} />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            />
          )}

          {/* Project Count */}
          <div className="text-sm text-slate-500 text-center">
            Showing {filteredProjects.length} of {projects.length} projects
            {activeFiltersCount > 0 && ` (${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''} active)`}
          </div>
        </>
      )}

      {/* Create Project Dialog */}
      <CreateProjectDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
};
