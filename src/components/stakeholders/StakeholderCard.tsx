
import { Stakeholder } from '@/hooks/useStakeholders';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useDialogState } from '@/hooks/useDialogState';
import { useStakeholderStatusUpdate } from '@/hooks/useStakeholderStatusUpdate';
import { useStakeholderCardActions } from './card/useStakeholderCardActions';
import { StakeholderCardHeader } from './card/StakeholderCardHeader';
import { StakeholderCardContent } from './card/StakeholderCardContent';
import { StakeholderCardDialogs } from './card/StakeholderCardDialogs';

interface StakeholderCardProps {
  stakeholder: Stakeholder;
}

export const StakeholderCard = ({ stakeholder }: StakeholderCardProps) => {
  const { activeDialog, openDialog, closeDialog, isDialogOpen } = useDialogState();
  const { updateStakeholderStatus, isUpdating } = useStakeholderStatusUpdate();
  const { handlePhoneCall, handleEmailSend } = useStakeholderCardActions();

  const handleMenuAction = (action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    switch (action) {
      case 'details':
        openDialog('details');
        break;
      case 'edit':
        openDialog('edit');
        break;
      case 'assign':
        openDialog('assign');
        break;
      case 'delete':
        openDialog('delete');
        break;
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    await updateStakeholderStatus(
      stakeholder, 
      newStatus as 'active' | 'inactive' | 'pending' | 'suspended'
    );
  };

  const onPhoneCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    handlePhoneCall(stakeholder);
  };

  const onEmailSend = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleEmailSend(stakeholder);
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <StakeholderCardHeader
            stakeholder={stakeholder}
            onMenuAction={handleMenuAction}
            onStatusChange={handleStatusChange}
            isUpdating={isUpdating(stakeholder.id)}
          />
        </CardHeader>
        
        <CardContent>
          <StakeholderCardContent
            stakeholder={stakeholder}
            onPhoneCall={onPhoneCall}
            onEmailSend={onEmailSend}
          />
        </CardContent>
      </Card>

      <StakeholderCardDialogs
        stakeholder={stakeholder}
        isDialogOpen={isDialogOpen}
        closeDialog={closeDialog}
      />
    </>
  );
};
