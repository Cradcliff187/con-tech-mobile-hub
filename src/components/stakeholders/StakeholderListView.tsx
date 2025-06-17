import React, { useState } from 'react';
import { Stakeholder } from '@/hooks/useStakeholders';
import { ResponsiveTable } from '@/components/common/ResponsiveTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Phone, Mail, MapPin, Edit, Trash, UserPlus, Eye } from 'lucide-react';
import { formatAddress, formatPhoneNumber } from '@/utils/addressFormatting';
import { useDialogState } from '@/hooks/useDialogState';
import { EditStakeholderDialog } from './EditStakeholderDialog';
import { DeleteStakeholderDialog } from './DeleteStakeholderDialog';
import { AssignStakeholderDialog } from './AssignStakeholderDialog';
import { StakeholderDetail } from './StakeholderDetail';
import { StakeholderQuickStatusDropdown } from './StakeholderQuickStatusDropdown';
import { useToast } from '@/hooks/use-toast';

interface StakeholderListViewProps {
  stakeholders: Stakeholder[];
}

export const StakeholderListView = ({ stakeholders }: StakeholderListViewProps) => {
  const { toast } = useToast();
  const { activeDialog, openDialog, closeDialog, isDialogOpen } = useDialogState();
  const [selectedStakeholder, setSelectedStakeholder] = useState<Stakeholder | null>(null);

  const handleAction = (action: string, stakeholder: Stakeholder) => {
    setSelectedStakeholder(stakeholder);
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

  const handlePhoneCall = async (phone: string) => {
    try {
      window.location.href = `tel:${phone}`;
      setTimeout(() => {
        toast({
          title: "Opening phone app",
          description: `Calling ${formatPhoneNumber(phone)}`
        });
      }, 100);
    } catch (error) {
      console.error('Failed to open phone app:', error);
    }
  };

  const handleEmailSend = async (email: string, stakeholder: Stakeholder) => {
    try {
      const subject = encodeURIComponent(`Contact: ${stakeholder.company_name || stakeholder.contact_person || 'Stakeholder'}`);
      const mailtoUrl = `mailto:${email}?subject=${subject}`;
      window.location.href = mailtoUrl;
      
      setTimeout(() => {
        toast({
          title: "Opening email client",
          description: `Composing email to ${email}`
        });
      }, 100);
    } catch (error) {
      console.error('Failed to open email client:', error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'subcontractor': return 'bg-blue-100 text-blue-800';
      case 'employee': return 'bg-green-100 text-green-800';
      case 'vendor': return 'bg-purple-100 text-purple-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name / Company',
      mobileLabel: 'Company',
      render: (value: any, stakeholder: Stakeholder) => (
        <div className="space-y-1">
          <div className="font-semibold text-slate-800 break-words">
            {stakeholder.company_name || 'Individual'}
          </div>
          {stakeholder.contact_person && (
            <div className="text-sm text-slate-600 break-words">
              {stakeholder.contact_person}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'contact',
      label: 'Contact Information',
      mobileLabel: 'Contact',
      render: (value: any, stakeholder: Stakeholder) => {
        const formattedPhone = formatPhoneNumber(stakeholder.phone);
        const formattedAddress = formatAddress(stakeholder);
        
        return (
          <div className="space-y-1 text-sm">
            {stakeholder.email && (
              <button
                onClick={() => handleEmailSend(stakeholder.email!, stakeholder)}
                className="flex items-center gap-2 text-slate-600 hover:text-orange-600 break-all"
              >
                <Mail size={14} />
                <span>{stakeholder.email}</span>
              </button>
            )}
            {formattedPhone && (
              <button
                onClick={() => handlePhoneCall(stakeholder.phone!)}
                className="flex items-center gap-2 text-slate-600 hover:text-orange-600"
              >
                <Phone size={14} />
                <span>{formattedPhone}</span>
              </button>
            )}
            {formattedAddress && (
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin size={14} />
                <span className="break-words">{formattedAddress}</span>
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'type_status',
      label: 'Type & Status',
      mobileLabel: 'Type/Status',
      render: (value: any, stakeholder: Stakeholder) => (
        <div className="space-y-2">
          <Badge className={getTypeColor(stakeholder.stakeholder_type)}>
            {stakeholder.stakeholder_type}
          </Badge>
          <StakeholderQuickStatusDropdown stakeholder={stakeholder} />
        </div>
      )
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (value: any, stakeholder: Stakeholder) => (
        <div className="flex items-center gap-1">
          <Star size={16} className="text-yellow-500" />
          <span className="text-sm font-medium">
            {stakeholder.rating !== null ? stakeholder.rating.toFixed(1) : 'No rating'}
          </span>
        </div>
      )
    },
    {
      key: 'specialties',
      label: 'Specialties',
      render: (value: any, stakeholder: Stakeholder) => (
        <div className="space-y-1">
          {stakeholder.specialties && stakeholder.specialties.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {stakeholder.specialties.slice(0, 2).map((specialty, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {specialty}
                </Badge>
              ))}
              {stakeholder.specialties.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{stakeholder.specialties.length - 2} more
                </Badge>
              )}
            </div>
          ) : (
            <span className="text-sm text-slate-400">None</span>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, stakeholder: Stakeholder) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction('details', stakeholder)}
            className="h-8 w-8 p-0"
          >
            <Eye size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction('edit', stakeholder)}
            className="h-8 w-8 p-0"
          >
            <Edit size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction('assign', stakeholder)}
            className="h-8 w-8 p-0"
          >
            <UserPlus size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction('delete', stakeholder)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
          >
            <Trash size={14} />
          </Button>
        </div>
      )
    }
  ];

  return (
    <>
      <ResponsiveTable
        columns={columns}
        data={stakeholders}
        emptyMessage="No stakeholders found"
        cardClassName="p-4 space-y-4"
      />

      {selectedStakeholder && (
        <>
          <StakeholderDetail
            open={isDialogOpen('details')}
            onOpenChange={(open) => !open && closeDialog()}
            stakeholderId={selectedStakeholder.id}
          />

          <EditStakeholderDialog
            open={isDialogOpen('edit')}
            onOpenChange={(open) => !open && closeDialog()}
            stakeholder={selectedStakeholder}
          />

          <DeleteStakeholderDialog
            open={isDialogOpen('delete')}
            onOpenChange={(open) => !open && closeDialog()}
            stakeholder={selectedStakeholder}
          />

          <AssignStakeholderDialog
            open={isDialogOpen('assign')}
            onOpenChange={(open) => !open && closeDialog()}
            stakeholder={selectedStakeholder}
          />
        </>
      )}
    </>
  );
};
