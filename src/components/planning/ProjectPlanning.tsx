
import { useState, useEffect } from 'react';
import { SimpleGanttChart } from './SimpleGanttChart';
import { TaskHierarchy } from './TaskHierarchy';
import { ResourcePlanning } from './ResourcePlanning';
import { MilestonePlanning } from './MilestonePlanning';
import { ClientFilter } from '@/components/projects/ClientFilter';
import { ProjectQuickActions } from '@/components/common/ProjectQuickActions';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Calendar, Users, Target, BarChart3, Shield, Lock, Clock, CalendarDays, CalendarRange } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'react-router-dom';
import { validateSelectData, getSelectDisplayName } from '@/utils/selectHelpers';
import { ExportOptionsDialog } from '@/components/reports/ExportOptionsDialog';
import { useDialogState } from '@/hooks/useDialogState';
import { ProjectInfoBar } from './ProjectInfoBar';

export const ProjectPlanning = () => {
  const [searchParams] = useSearchParams();
  const projectFromUrl = searchParams.get('project');
  
  const [activeView, setActiveView] = useState<'gantt' | 'hierarchy' | 'resources' | 'milestones'>('gantt');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<'days' | 'weeks' | 'months'>('weeks');
  const { projects, loading } = useProjects();
  const { profile } = useAuth();
  const { activeDialog, openDialog, closeDialog, isDialogOpen } = useDialogState();

  // Role-based access control
  const isCompanyUser = profile?.is_company_user && profile?.account_status === 'approved';
  const canEditPlanning = isCompanyUser && ['admin', 'project_manager', 'site_supervisor'].includes(profile?.role || '');
  const canViewPlanning = isCompanyUser || ['stakeholder', 'client', 'vendor'].includes(profile?.role || '');

  useEffect(() => {
    if (projectFromUrl && projects.length > 0) {
      if (selectedProjectId !== projectFromUrl) {
        const project = projects.find(p => p.id === projectFromUrl);
        if (project) {
          setSelectedProjectId(projectFromUrl);
          setSelectedClientId(project.client_id || undefined);
        }
      }
    }
  }, [projectFromUrl, projects, selectedProjectId]);

  const views = [
    { id: 'gantt', label: 'Gantt Chart', icon: BarChart3 },
    { id: 'hierarchy', label: 'Task Hierarchy', icon: Target },
    { id: 'resources', label: 'Resource Planning', icon: Users },
    { id: 'milestones', label: 'Milestones', icon: Calendar }
  ];

  // Filter projects by selected client and user access
  const filteredProjects = selectedClientId 
    ? projects.filter(p => p.client_id === selectedClientId)
    : projects;

  // Validate project data to prevent SelectItem errors
  const validatedProjects = validateSelectData(filteredProjects);

  const selectedProject = selectedProjectId ? projects.find(p => p.id === selectedProjectId) : null;

  const handleExportClick = () => {
    if (!selectedProjectId) {
      return;
    }
    openDialog('export');
  };

  const handleViewModeChange = (newViewMode: string) => {
    if (newViewMode === 'days' || newViewMode === 'weeks' || newViewMode === 'months') {
      setViewMode(newViewMode);
    }
  };

  // Show access denied for unauthorized users
  if (!canViewPlanning) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Lock size={48} className="text-slate-400 mb-4" />
        <h3 className="text-lg font-medium text-slate-600 mb-2">Access Restricted</h3>
        <p className="text-slate-500 text-center">
          Project planning access is limited to approved company users and assigned stakeholders.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-slate-800">Project Planning</h2>
            {!canEditPlanning && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Shield size={12} />
                Read Only
              </Badge>
            )}
          </div>
          <p className="text-slate-600">Plan and visualize your construction project timeline</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Mode Selector - Only show for Gantt view */}
          {activeView === 'gantt' && selectedProjectId && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">View:</span>
              <ToggleGroup 
                value={viewMode} 
                onValueChange={handleViewModeChange} 
                type="single"
                size="sm"
                disabled={!canEditPlanning}
              >
                <ToggleGroupItem value="days" className="flex items-center gap-1">
                  <Clock size={14} />
                  Days
                </ToggleGroupItem>
                <ToggleGroupItem value="weeks" className="flex items-center gap-1">
                  <CalendarDays size={14} />
                  Weeks
                </ToggleGroupItem>
                <ToggleGroupItem value="months" className="flex items-center gap-1">
                  <CalendarRange size={14} />
                  Months
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          )}
          
          {selectedProject && (
            <ProjectQuickActions
              project={selectedProject}
              context="planning"
              variant="compact"
            />
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExportClick}
            disabled={!selectedProjectId}
          >
            Export Plan
          </Button>
          {canEditPlanning && (
            <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
              Save Changes
            </Button>
          )}
        </div>
      </div>

      {/* Project and Client Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-slate-700 whitespace-nowrap">Filter by Client:</label>
            <ClientFilter 
              selectedClientId={selectedClientId}
              onClientChange={setSelectedClientId}
              className="flex-1"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-slate-700 whitespace-nowrap">Select Project:</label>
            <Select 
              value={selectedProjectId} 
              onValueChange={setSelectedProjectId}
              disabled={!canEditPlanning && !selectedProjectId}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Choose a project..." />
              </SelectTrigger>
              <SelectContent>
                {loading ? (
                  <SelectItem value="loading" disabled>Loading projects...</SelectItem>
                ) : validatedProjects.length === 0 && selectedClientId ? (
                  <SelectItem value="no-projects" disabled>No projects found for the selected client.</SelectItem>
                ) : validatedProjects.length === 0 ? (
                  <SelectItem value="no-projects" disabled>No projects available</SelectItem>
                ) : (
                  validatedProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {getSelectDisplayName(project, ['name'], 'Unnamed Project')} {project.client && `- ${project.client.company_name || project.client.contact_person}`}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Project Information */}
      {selectedProject && (
        <ProjectInfoBar project={selectedProject} />
      )}

      {/* View Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="border-b border-slate-200">
          <div className="flex overflow-x-auto">
            {views.map((view) => {
              const Icon = view.icon;
              return (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeView === view.id
                      ? 'border-orange-500 text-orange-600 bg-orange-50'
                      : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={16} />
                  {view.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {selectedProjectId ? (
            <>
              {activeView === 'gantt' && <SimpleGanttChart projectId={selectedProjectId} viewMode={viewMode} />}
              {activeView === 'hierarchy' && <TaskHierarchy projectId={selectedProjectId} />}
              {activeView === 'resources' && <ResourcePlanning projectId={selectedProjectId} />}
              {activeView === 'milestones' && <MilestonePlanning projectId={selectedProjectId} />}
            </>
          ) : (
            <div className="text-center py-12">
              <Target size={48} className="mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">Select a Project to Begin Planning</h3>
              <p className="text-slate-500">Choose a project from the dropdown above to view and edit its planning details.</p>
              {filteredProjects.length === 0 && selectedClientId && (
                <p className="text-slate-500 mt-2">No projects found for the selected client.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <ExportOptionsDialog
        open={isDialogOpen('export')}
        onOpenChange={(open) => !open && closeDialog()}
        selectedProjectId={selectedProjectId}
        context="planning"
        activeView={activeView}
      />
    </div>
  );
};
