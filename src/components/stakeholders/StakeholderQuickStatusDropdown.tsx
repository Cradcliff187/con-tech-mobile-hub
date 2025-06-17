
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useStakeholderStatusUpdate } from '@/hooks/useStakeholderStatusUpdate';
import { Stakeholder } from '@/hooks/useStakeholders';

interface StakeholderQuickStatusDropdownProps {
  stakeholder: Stakeholder;
  showAsDropdown?: boolean;
}

export const StakeholderQuickStatusDropdown = ({ 
  stakeholder, 
  showAsDropdown = true 
}: StakeholderQuickStatusDropdownProps) => {
  const { updateStakeholderStatus, isUpdating } = useStakeholderStatusUpdate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-slate-100 text-slate-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === stakeholder.status) return;
    
    const showConfirmation = newStatus === 'suspended' || newStatus === 'inactive';
    await updateStakeholderStatus(
      stakeholder, 
      newStatus as 'active' | 'inactive' | 'pending' | 'suspended',
      showConfirmation
    );
  };

  if (!showAsDropdown) {
    return (
      <Badge className={getStatusColor(stakeholder.status)}>
        {stakeholder.status}
      </Badge>
    );
  }

  const updating = isUpdating(stakeholder.id);

  return (
    <div className="flex items-center gap-2">
      <Select
        value={stakeholder.status}
        onValueChange={handleStatusChange}
        disabled={updating}
      >
        <SelectTrigger className={`w-auto h-6 px-2 text-xs border-0 ${getStatusColor(stakeholder.status)}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-white">
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="suspended">Suspended</SelectItem>
        </SelectContent>
      </Select>
      {updating && (
        <Loader2 className="h-3 w-3 animate-spin text-slate-500" />
      )}
    </div>
  );
};
