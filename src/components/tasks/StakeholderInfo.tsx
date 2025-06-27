
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Users } from 'lucide-react';

interface StakeholderInfoProps {
  assignee?: {
    id: string;
    full_name?: string;
    email: string;
    avatar_url?: string;
  };
  assignedStakeholder?: {
    id: string;
    contact_person?: string;
    company_name?: string;
    stakeholder_type: string;
  };
  stakeholderAssignments?: Array<{
    id: string;
    stakeholder: {
      id: string;
      contact_person?: string;
      company_name?: string;
      stakeholder_type: string;
    };
    assignment_role?: string;
  }>;
  size?: 'sm' | 'md';
  compact?: boolean;
}

export const StakeholderInfo: React.FC<StakeholderInfoProps> = ({
  assignee,
  assignedStakeholder,
  stakeholderAssignments = [],
  size = 'md',
  compact = false
}) => {
  const getStakeholderTypeColor = (type: string) => {
    switch (type) {
      case 'employee': return 'bg-blue-100 text-blue-800';
      case 'contractor': return 'bg-orange-100 text-orange-800';
      case 'vendor': return 'bg-purple-100 text-purple-800';
      case 'client': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return '?';
  };

  const getDisplayName = (person: { full_name?: string; email?: string; contact_person?: string }) => {
    if ('full_name' in person) {
      return person.full_name || person.email;
    }
    return person.contact_person;
  };

  const getDisplayInitials = (person: { full_name?: string; email?: string; contact_person?: string }) => {
    if ('full_name' in person) {
      return getInitials(person.full_name, person.email);
    }
    return getInitials(person.contact_person);
  };

  // Determine primary stakeholder (prioritize employee assignee, then stakeholder assignments)
  const primaryStakeholder = assignee || 
    (stakeholderAssignments.length > 0 ? stakeholderAssignments[0].stakeholder : assignedStakeholder);
  
  const additionalAssignments = stakeholderAssignments.length > 1 ? stakeholderAssignments.slice(1) : [];
  const totalAssignments = stakeholderAssignments.length + (assignedStakeholder && !assignee ? 1 : 0);

  if (!primaryStakeholder && !assignedStakeholder) {
    return (
      <div className="flex items-center gap-1 text-slate-400">
        <User size={size === 'sm' ? 12 : 14} />
        <span className={`${size === 'sm' ? 'text-xs' : 'text-sm'}`}>Unassigned</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <Avatar className={`${size === 'sm' ? 'h-5 w-5' : 'h-6 w-6'}`}>
          <AvatarFallback className="text-xs bg-slate-200">
            {primaryStakeholder ? getDisplayInitials(primaryStakeholder) : '?'}
          </AvatarFallback>
        </Avatar>
        {totalAssignments > 1 && (
          <div className="flex items-center gap-0.5">
            <Users size={size === 'sm' ? 10 : 12} className="text-slate-500" />
            <span className="text-xs text-slate-500">+{totalAssignments - 1}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Primary Assignment */}
      {primaryStakeholder && (
        <div className="flex items-center gap-2">
          <Avatar className={`${size === 'sm' ? 'h-5 w-5' : 'h-6 w-6'}`}>
            <AvatarFallback className="text-xs bg-slate-200">
              {getDisplayInitials(primaryStakeholder)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`${size === 'sm' ? 'text-xs' : 'text-sm'} font-medium text-slate-800 truncate`}>
                {getDisplayName(primaryStakeholder)}
              </span>
              {!assignee && 'stakeholder_type' in primaryStakeholder && (
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getStakeholderTypeColor(primaryStakeholder.stakeholder_type)}`}
                >
                  {primaryStakeholder.stakeholder_type}
                </Badge>
              )}
            </div>
            {!assignee && 'company_name' in primaryStakeholder && primaryStakeholder.company_name && (
              <div className={`${size === 'sm' ? 'text-xs' : 'text-sm'} text-slate-500 truncate`}>
                {primaryStakeholder.company_name}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Additional Assignments Indicator */}
      {additionalAssignments.length > 0 && (
        <div className="flex items-center gap-1 pl-8">
          <Users size={12} className="text-slate-400" />
          <span className="text-xs text-slate-500">
            +{additionalAssignments.length} more assigned
          </span>
        </div>
      )}

      {/* Legacy single stakeholder assignment */}
      {assignedStakeholder && !assignee && stakeholderAssignments.length === 0 && (
        <div className="flex items-center gap-2">
          <Avatar className={`${size === 'sm' ? 'h-5 w-5' : 'h-6 w-6'}`}>
            <AvatarFallback className="text-xs bg-slate-200">
              {getInitials(assignedStakeholder.contact_person)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`${size === 'sm' ? 'text-xs' : 'text-sm'} font-medium text-slate-800 truncate`}>
                {assignedStakeholder.contact_person}
              </span>
              <Badge 
                variant="outline" 
                className={`text-xs ${getStakeholderTypeColor(assignedStakeholder.stakeholder_type)}`}
              >
                {assignedStakeholder.stakeholder_type}
              </Badge>
            </div>
            {assignedStakeholder.company_name && (
              <div className={`${size === 'sm' ? 'text-xs' : 'text-sm'} text-slate-500 truncate`}>
                {assignedStakeholder.company_name}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
