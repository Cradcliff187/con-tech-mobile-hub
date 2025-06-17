
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Filter, Download, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog';
import { CreateProjectDialog } from '@/components/dashboard/CreateProjectDialog';

interface TimelineHeaderProps {
  showFilters: boolean;
  onToggleFilters: () => void;
}

export const TimelineHeader: React.FC<TimelineHeaderProps> = ({
  showFilters,
  onToggleFilters
}) => {
  const [showCreateTaskDialog, setShowCreateTaskDialog] = useState(false);
  const [showCreateProjectDialog, setShowCreateProjectDialog] = useState(false);
  const { profile } = useAuth();

  // Permission checks
  const isCompanyUser = profile?.is_company_user && profile?.account_status === 'approved';
  const canCreateProjects = isCompanyUser && (profile?.role === 'admin' || profile?.role === 'project_manager');

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Timeline</h1>
          <p className="text-gray-600 mt-1">Track project progress and task dependencies</p>
        </div>
        <div className="flex items-center gap-3">
          {isCompanyUser && (
            <Button 
              onClick={() => setShowCreateTaskDialog(true)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Task
            </Button>
          )}
          {canCreateProjects && (
            <Button 
              onClick={() => setShowCreateProjectDialog(true)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onToggleFilters}>
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <CreateTaskDialog 
        open={showCreateTaskDialog}
        onOpenChange={setShowCreateTaskDialog}
      />

      <CreateProjectDialog 
        open={showCreateProjectDialog}
        onOpenChange={setShowCreateProjectDialog}
      />
    </>
  );
};
