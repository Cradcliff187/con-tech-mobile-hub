
import { MapPin, Calendar, User } from 'lucide-react';
import { formatAddress } from '@/utils/addressFormatting';
import { getUnifiedLifecycleStatus } from '@/utils/unified-lifecycle-utils';
import { EnhancedUnifiedStatusBadge } from '@/components/ui/enhanced-unified-status-badge';

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    progress: number;
    budget?: number;
    spent?: number;
    end_date?: string;
    status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
    phase: 'planning' | 'active' | 'punch_list' | 'closeout' | 'completed';
    lifecycle_status?: string;
    unified_lifecycle_status?: string;
    location?: string;
    street_address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    client?: {
      id: string;
      company_name?: string;
      contact_person?: string;
      stakeholder_type: string;
    };
  };
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const unifiedStatus = getUnifiedLifecycleStatus(project as any);

  const progressColor = project.progress >= 75 ? 'bg-green-500' : 
                       project.progress >= 50 ? 'bg-orange-500' : 'bg-blue-500';

  const formatCurrency = (amount?: number) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact'
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getClientDisplayName = () => {
    if (!project.client) return null;
    return project.client.company_name || project.client.contact_person || 'Unknown Client';
  };

  const formattedLocation = formatAddress({
    street_address: project.street_address,
    city: project.city,
    state: project.state,
    zip_code: project.zip_code,
    address: project.location
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800 line-clamp-2 flex-1 mr-3">
          {project.name}
        </h3>
        <div className="shrink-0">
          <EnhancedUnifiedStatusBadge 
            status={unifiedStatus} 
            size="sm"
            showIcon={true}
          />
        </div>
      </div>

      <div className="space-y-3">
        {project.client && (
          <div className="flex items-center text-sm text-slate-600">
            <User size={16} className="mr-2 shrink-0" />
            <span className="font-medium text-slate-700">Client:</span>
            <span className="ml-1 truncate">{getClientDisplayName()}</span>
          </div>
        )}

        {formattedLocation && (
          <div className="flex items-center text-sm text-slate-600">
            <MapPin size={16} className="mr-2 shrink-0" />
            <span className="truncate">{formattedLocation}</span>
          </div>
        )}

        {project.end_date && (
          <div className="flex items-center text-sm text-slate-600">
            <Calendar size={16} className="mr-2 shrink-0" />
            <span>Due: {formatDate(project.end_date)}</span>
          </div>
        )}

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600">Progress</span>
            <span className="font-medium text-slate-800">{project.progress}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${progressColor}`}
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {project.budget && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600">Budget</span>
              <span className="font-medium text-slate-800">
                {formatCurrency(project.spent)} / {formatCurrency(project.budget)}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-orange-500 transition-all duration-300"
                style={{ width: `${project.budget > 0 ? ((project.spent || 0) / project.budget) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
