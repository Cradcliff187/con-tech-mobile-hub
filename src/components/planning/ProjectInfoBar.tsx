import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { Project } from '@/types/database';
import { format, differenceInDays } from 'date-fns';

interface ProjectInfoBarProps {
  project: Project;
}

export const ProjectInfoBar = ({ project }: ProjectInfoBarProps) => {
  const startDate = project.start_date ? new Date(project.start_date) : null;
  const endDate = project.end_date ? new Date(project.end_date) : null;
  
  const duration = startDate && endDate ? differenceInDays(endDate, startDate) : null;
  
  const formatDate = (date: Date) => format(date, 'MMM dd, yyyy');
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <Card className="p-4 border-l-4 border-l-orange-500">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-slate-800">{project.name}</h3>
            <Badge className={getStatusColor(project.status)}>
              {project.status.replace('-', ' ')}
            </Badge>
            {project.phase && (
              <Badge variant="outline" className="text-slate-600">
                {project.phase}
              </Badge>
            )}
          </div>
          
          {project.description && (
            <p className="text-sm text-slate-600 mb-3 line-clamp-2">{project.description}</p>
          )}
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={16} className="text-slate-500" />
            <div>
              <div className="text-slate-500">Start Date</div>
              <div className="font-medium text-slate-800">
                {startDate ? formatDate(startDate) : 'Not set'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={16} className="text-slate-500" />
            <div>
              <div className="text-slate-500">End Date</div>
              <div className="font-medium text-slate-800">
                {endDate ? formatDate(endDate) : 'Not set'}
              </div>
            </div>
          </div>
          
          {duration !== null && (
            <div className="flex items-center gap-2 text-sm">
              <Clock size={16} className="text-slate-500" />
              <div>
                <div className="text-slate-500">Duration</div>
                <div className="font-medium text-slate-800">
                  {duration} days
                </div>
              </div>
            </div>
          )}
          
          {project.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin size={16} className="text-slate-500" />
              <div>
                <div className="text-slate-500">Location</div>
                <div className="font-medium text-slate-800 truncate">
                  {project.location}
                </div>
              </div>
            </div>
          )}
          
          {project.client && (
            <div className="flex items-center gap-2 text-sm">
              <User size={16} className="text-slate-500" />
              <div>
                <div className="text-slate-500">Client</div>
                <div className="font-medium text-slate-800 truncate">
                  {project.client.company_name || project.client.contact_person}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};