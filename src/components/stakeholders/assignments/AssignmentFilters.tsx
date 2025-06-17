
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { Project } from '@/types/database';
import { validateSelectData, getSelectDisplayName } from '@/utils/selectHelpers';

interface AssignmentFiltersProps {
  projectFilter: string;
  setProjectFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  projects: Project[];
  projectsLoading: boolean;
}

export const AssignmentFilters = ({
  projectFilter,
  setProjectFilter,
  statusFilter,
  setStatusFilter,
  searchTerm,
  setSearchTerm,
  projects,
  projectsLoading
}: AssignmentFiltersProps) => {
  const validatedProjects = validateSelectData(projects);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
        <Input
          placeholder="Search assignments by stakeholder, role, or notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 min-h-[44px]"
        />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-full sm:w-48 min-h-[44px]">
            <SelectValue placeholder="Filter by project" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">All Projects</SelectItem>
            {projectsLoading ? (
              <SelectItem value="loading" disabled>Loading projects...</SelectItem>
            ) : (
              validatedProjects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {getSelectDisplayName(project, ['name'], 'Unnamed Project')}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 min-h-[44px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
