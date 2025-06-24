
import { Stakeholder } from '@/hooks/useStakeholders';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Edit, Trash, UserPlus, Eye } from 'lucide-react';
import { GlobalStatusDropdown } from '@/components/ui/global-status-dropdown';

interface StakeholderCardHeaderProps {
  stakeholder: Stakeholder;
  onMenuAction: (action: string, e: React.MouseEvent) => void;
  onStatusChange: (newStatus: string) => Promise<void>;
  isUpdating: boolean;
}

export const StakeholderCardHeader = ({ 
  stakeholder, 
  onMenuAction, 
  onStatusChange, 
  isUpdating 
}: StakeholderCardHeaderProps) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'subcontractor': return 'bg-blue-100 text-blue-800';
      case 'employee': return 'bg-green-100 text-green-800';
      case 'vendor': return 'bg-purple-100 text-purple-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-2">
          <h3 className="font-semibold text-slate-800 break-words">
            {stakeholder.company_name || 'Individual'}
          </h3>
          {stakeholder.contact_person && (
            <p className="text-sm text-slate-600 break-words">{stakeholder.contact_person}</p>
          )}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 min-h-[32px] flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white">
            <DropdownMenuItem onClick={(e) => onMenuAction('details', e)}>
              <Eye size={16} className="mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => onMenuAction('edit', e)}>
              <Edit size={16} className="mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => onMenuAction('assign', e)}>
              <UserPlus size={16} className="mr-2" />
              Assign to Project
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => onMenuAction('delete', e)}
              className="text-red-600"
            >
              <Trash size={16} className="mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <Badge className={getTypeColor(stakeholder.stakeholder_type)}>
          {stakeholder.stakeholder_type}
        </Badge>
        <GlobalStatusDropdown
          entityType="stakeholder"
          currentStatus={stakeholder.status}
          onStatusChange={onStatusChange}
          isUpdating={isUpdating}
          size="sm"
          confirmCriticalChanges={true}
        />
      </div>
    </div>
  );
};
