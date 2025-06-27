
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Calendar, DollarSign, Users, Activity } from 'lucide-react';
import { Project } from '@/types/database';
import { format } from 'date-fns';

interface ProjectContextPanelProps {
  project: Project | null;
  className?: string;
}

export const ProjectContextPanel: React.FC<ProjectContextPanelProps> = ({ 
  project, 
  className = '' 
}) => {
  if (!project) {
    return (
      <Card className={`${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-slate-600">Project Context</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-slate-400">
            <div className="text-center">
              <Building2 className="mx-auto h-8 w-8 mb-2" />
              <p className="text-sm">Select a project to see context</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'planning': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'planning': return 'bg-blue-50 text-blue-700';
      case 'active': return 'bg-orange-50 text-orange-700';
      case 'punch_list': return 'bg-purple-50 text-purple-700';
      case 'closeout': return 'bg-slate-50 text-slate-700';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-slate-700 flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Project Context
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Project Name & Status */}
        <div>
          <h3 className="font-medium text-slate-900 mb-2">{project.name}</h3>
          <div className="flex items-center gap-2 mb-2">
            <Badge className={`text-xs ${getStatusColor(project.status)}`}>
              {project.status}
            </Badge>
            {project.phase && (
              <Badge variant="outline" className={`text-xs ${getPhaseColor(project.phase)}`}>
                {project.phase}
              </Badge>
            )}
          </div>
          {project.description && (
            <p className="text-sm text-slate-600 line-clamp-2">{project.description}</p>
          )}
        </div>

        {/* Project Metrics */}
        <div className="grid grid-cols-2 gap-3">
          {/* Progress */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-slate-600">
              <Activity className="h-3 w-3" />
              Progress
            </div>
            <div className="text-sm font-medium">{project.progress || 0}%</div>
            <div className="w-full bg-slate-200 rounded-full h-1.5">
              <div 
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${project.progress || 0}%` }}
              />
            </div>
          </div>

          {/* Budget */}
          {project.budget && (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-slate-600">
                <DollarSign className="h-3 w-3" />
                Budget
              </div>
              <div className="text-sm font-medium">
                ${(project.budget / 1000).toFixed(0)}k
              </div>
              {project.spent !== undefined && (
                <div className="text-xs text-slate-500">
                  ${(project.spent / 1000).toFixed(0)}k spent
                </div>
              )}
            </div>
          )}
        </div>

        {/* Timeline */}
        {(project.start_date || project.end_date) && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-xs text-slate-600">
              <Calendar className="h-3 w-3" />
              Timeline
            </div>
            <div className="text-sm space-y-1">
              {project.start_date && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Start:</span>
                  <span className="font-medium">
                    {format(new Date(project.start_date), 'MMM d, yyyy')}
                  </span>
                </div>
              )}
              {project.end_date && (
                <div className="flex justify-between">
                  <span className="text-slate-500">End:</span>
                  <span className="font-medium">
                    {format(new Date(project.end_date), 'MMM d, yyyy')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Location */}
        {project.location && (
          <div className="space-y-1">
            <div className="text-xs text-slate-600">Location</div>
            <div className="text-sm font-medium">{project.location}</div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="pt-2 border-t border-slate-100">
          <div className="text-xs text-slate-500 mb-1">Quick Stats</div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50 rounded p-2">
              <div className="text-xs font-medium">Phase</div>
              <div className="text-xs text-slate-600 capitalize">
                {project.phase || 'Planning'}
              </div>
            </div>
            <div className="bg-slate-50 rounded p-2">
              <div className="text-xs font-medium">Status</div>
              <div className="text-xs text-slate-600 capitalize">
                {project.status}
              </div>
            </div>
            <div className="bg-slate-50 rounded p-2">
              <div className="text-xs font-medium">Progress</div>
              <div className="text-xs text-slate-600">
                {project.progress || 0}%
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
