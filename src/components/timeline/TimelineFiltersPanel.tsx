
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { validateSelectData, getSelectDisplayName } from '@/utils/selectHelpers';
import { Project } from '@/types/database';

interface TimelineFilters {
  status: string;
  category: string;
  priority: string;
}

interface TimelineFiltersPanelProps {
  selectedProject: string;
  filters: TimelineFilters;
  projects: Project[];
  projectsLoading: boolean;
  categories: string[];
  priorities: string[];
  onProjectChange: (value: string) => void;
  onFilterChange: (filterType: keyof TimelineFilters, value: string) => void;
}

export const TimelineFiltersPanel: React.FC<TimelineFiltersPanelProps> = ({
  selectedProject,
  filters,
  projects,
  projectsLoading,
  categories,
  priorities,
  onProjectChange,
  onFilterChange
}) => {
  const validatedProjects = validateSelectData(projects);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Project</label>
            <Select value={selectedProject} onValueChange={onProjectChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select value={filters.status} onValueChange={(value) => onFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="not-started">Not Started</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Category</label>
            <Select value={filters.category} onValueChange={(value) => onFilterChange('category', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Priority</label>
            <Select value={filters.priority} onValueChange={(value) => onFilterChange('priority', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {priorities.map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
