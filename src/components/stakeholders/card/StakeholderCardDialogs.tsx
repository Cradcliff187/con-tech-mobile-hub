
import { Stakeholder } from '@/hooks/useStakeholders';
import { EditStakeholderDialog } from '../EditStakeholderDialog';
import { DeleteStakeholderDialog } from '../DeleteStakeholderDialog';
import { AssignStakeholderDialog } from '../AssignStakeholderDialog';
import { StakeholderDetail } from '../StakeholderDetail';

interface StakeholderCardDialogsProps {
  stakeholder: Stakeholder;
  isDialogOpen: (dialogId: string) => boolean;
  closeDialog: () => void;
}

export const StakeholderCardDialogs = ({ 
  stakeholder, 
  isDialogOpen, 
  closeDialog 
}: StakeholderCardDialogsProps) => {
  return (
    <>
      <StakeholderDetail
        open={isDialogOpen('details')}
        onOpenChange={(open) => !open && closeDialog()}
        stakeholderId={stakeholder.id}
      />

      <EditStakeholderDialog
        open={isDialogOpen('edit')}
        onOpenChange={(open) => !open && closeDialog()}
        stakeholder={stakeholder}
      />

      <DeleteStakeholderDialog
        open={isDialogOpen('delete')}
        onOpenChange={(open) => !open && closeDialog()}
        stakeholder={stakeholder}
      />

      <AssignStakeholderDialog
        open={isDialogOpen('assign')}
        onOpenChange={(open) => !open && closeDialog()}
        stakeholder={stakeholder}
      />
    </>
  );
};
