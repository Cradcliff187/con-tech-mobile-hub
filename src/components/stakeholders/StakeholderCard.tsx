import { Stakeholder } from '@/hooks/useStakeholders';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Phone, Mail, MapPin, Users, Star, MoreHorizontal, Edit, Trash, UserPlus, Eye } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EditStakeholderDialog } from './EditStakeholderDialog';
import { DeleteStakeholderDialog } from './DeleteStakeholderDialog';
import { AssignStakeholderDialog } from './AssignStakeholderDialog';
import { StakeholderDetail } from './StakeholderDetail';
import { formatAddress, formatPhoneNumber } from '@/utils/addressFormatting';
import { useToast } from '@/hooks/use-toast';
import { useDialogState } from '@/hooks/useDialogState';
import { StakeholderQuickStatusDropdown } from './StakeholderQuickStatusDropdown';

interface StakeholderCardProps {
  stakeholder: Stakeholder;
}

export const StakeholderCard = ({ stakeholder }: StakeholderCardProps) => {
  const { toast } = useToast();
  const { activeDialog, openDialog, closeDialog, isDialogOpen } = useDialogState();

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'subcontractor': return 'bg-blue-100 text-blue-800';
      case 'employee': return 'bg-green-100 text-green-800';
      case 'vendor': return 'bg-purple-100 text-purple-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-slate-100 text-slate-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const copyToClipboard = async (text: string, type: 'phone' | 'email') => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: `${type === 'phone' ? 'Phone number' : 'Email address'} copied successfully`
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const handlePhoneCall = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!stakeholder.phone) return;

    try {
      window.location.href = `tel:${stakeholder.phone}`;
      
      setTimeout(() => {
        toast({
          title: "Opening phone app",
          description: `Calling ${formatPhoneNumber(stakeholder.phone)}`
        });
      }, 100);
    } catch (error) {
      console.error('Failed to open phone app:', error);
      await copyToClipboard(stakeholder.phone, 'phone');
    }
  };

  const handleEmailSend = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!stakeholder.email) return;

    try {
      const subject = encodeURIComponent(`Contact: ${stakeholder.company_name || stakeholder.contact_person || 'Stakeholder'}`);
      const mailtoUrl = `mailto:${stakeholder.email}?subject=${subject}`;
      
      window.location.href = mailtoUrl;
      
      setTimeout(() => {
        toast({
          title: "Opening email client",
          description: `Composing email to ${stakeholder.email}`
        });
      }, 100);
    } catch (error) {
      console.error('Failed to open email client:', error);
      await copyToClipboard(stakeholder.email, 'email');
    }
  };

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

  const formattedAddress = formatAddress(stakeholder);
  const formattedPhone = formatPhoneNumber(stakeholder.phone);

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
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
                <DropdownMenuItem onClick={(e) => handleMenuAction('details', e)}>
                  <Eye size={16} className="mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => handleMenuAction('edit', e)}>
                  <Edit size={16} className="mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => handleMenuAction('assign', e)}>
                  <UserPlus size={16} className="mr-2" />
                  Assign to Project
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => handleMenuAction('delete', e)}
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
            <StakeholderQuickStatusDropdown stakeholder={stakeholder} />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {formattedPhone && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePhoneCall}
                className="p-0 h-auto font-normal text-slate-600 hover:text-orange-600 break-words"
              >
                <Phone size={16} className="mr-2 flex-shrink-0" />
                <span>{formattedPhone}</span>
              </Button>
            </div>
          )}
          
          {stakeholder.email && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEmailSend}
                className="p-0 h-auto font-normal text-slate-600 hover:text-orange-600 break-all"
              >
                <Mail size={16} className="mr-2 flex-shrink-0" />
                <span>{stakeholder.email}</span>
              </Button>
            </div>
          )}
          
          {formattedAddress && (
            <div className="flex items-start gap-2 text-sm text-slate-600">
              <MapPin size={16} className="mt-0.5 flex-shrink-0" />
              <span className="break-words">{formattedAddress}</span>
            </div>
          )}
          
          {stakeholder.crew_size && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Users size={16} />
              <span>{stakeholder.crew_size} crew members</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Star size={16} className="text-yellow-500" />
            <span className="text-sm font-medium">
              {stakeholder.rating !== null ? stakeholder.rating.toFixed(1) : 'No rating'}
            </span>
          </div>
          
          {stakeholder.specialties && stakeholder.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {stakeholder.specialties.slice(0, 3).map((specialty, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {specialty}
                </Badge>
              ))}
              {stakeholder.specialties.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{stakeholder.specialties.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

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
