
import { useState } from 'react';
import { Stakeholder } from '@/hooks/useStakeholders';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Phone, Mail, MapPin, Users, Star, MoreHorizontal, Edit, Trash, UserPlus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EditStakeholderDialog } from './EditStakeholderDialog';
import { DeleteStakeholderDialog } from './DeleteStakeholderDialog';
import { AssignStakeholderDialog } from './AssignStakeholderDialog';
import { StakeholderDetail } from './StakeholderDetail';
import { formatAddress, formatPhoneNumber } from '@/utils/addressFormatting';
import { useToast } from '@/hooks/use-toast';

interface StakeholderCardProps {
  stakeholder: Stakeholder;
}

export const StakeholderCard = ({ stakeholder }: StakeholderCardProps) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const { toast } = useToast();

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

  const handlePhoneCall = async () => {
    if (!stakeholder.phone) return;

    try {
      // Try to open phone app
      window.location.href = `tel:${stakeholder.phone}`;
      
      // Show success toast after a brief delay
      setTimeout(() => {
        toast({
          title: "Opening phone app",
          description: `Calling ${formatPhoneNumber(stakeholder.phone)}`
        });
      }, 100);
    } catch (error) {
      console.error('Failed to open phone app:', error);
      // Fallback to copying phone number
      await copyToClipboard(stakeholder.phone, 'phone');
    }
  };

  const handleEmailSend = async () => {
    if (!stakeholder.email) return;

    try {
      // Create mailto URL with pre-filled subject
      const subject = encodeURIComponent(`Contact: ${stakeholder.company_name || stakeholder.contact_person || 'Stakeholder'}`);
      const mailtoUrl = `mailto:${stakeholder.email}?subject=${subject}`;
      
      // Try to open email client
      window.location.href = mailtoUrl;
      
      // Show success toast after a brief delay
      setTimeout(() => {
        toast({
          title: "Opening email client",
          description: `Composing email to ${stakeholder.email}`
        });
      }, 100);
    } catch (error) {
      console.error('Failed to open email client:', error);
      // Fallback to copying email address
      await copyToClipboard(stakeholder.email, 'email');
    }
  };

  const formattedAddress = formatAddress(stakeholder);
  const formattedPhone = formatPhoneNumber(stakeholder.phone);

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader 
          className="pb-3 cursor-pointer"
          onClick={() => setShowDetailDialog(true)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800 truncate">
                {stakeholder.company_name || 'Individual'}
              </h3>
              {stakeholder.contact_person && (
                <p className="text-sm text-slate-600 truncate">{stakeholder.contact_person}</p>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 min-h-[32px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white">
                <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                  <Edit size={16} className="mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowAssignDialog(true)}>
                  <UserPlus size={16} className="mr-2" />
                  Assign to Project
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600"
                >
                  <Trash size={16} className="mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <Badge className={getTypeColor(stakeholder.stakeholder_type)}>
              {stakeholder.stakeholder_type}
            </Badge>
            <Badge className={getStatusColor(stakeholder.status)}>
              {stakeholder.status}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {formattedPhone && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); handlePhoneCall(); }}
                className="p-0 h-auto font-normal text-slate-600 hover:text-orange-600"
              >
                <Phone size={16} className="mr-2" />
                <span>{formattedPhone}</span>
              </Button>
            </div>
          )}
          
          {stakeholder.email && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); handleEmailSend(); }}
                className="p-0 h-auto font-normal text-slate-600 hover:text-orange-600"
              >
                <Mail size={16} className="mr-2" />
                <span className="truncate">{stakeholder.email}</span>
              </Button>
            </div>
          )}
          
          {formattedAddress && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin size={16} />
              <span className="truncate">{formattedAddress}</span>
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
            <span className="text-sm font-medium">{stakeholder.rating.toFixed(1)}</span>
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
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        stakeholderId={stakeholder.id}
      />

      <EditStakeholderDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        stakeholder={stakeholder}
      />

      <DeleteStakeholderDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        stakeholder={stakeholder}
      />

      <AssignStakeholderDialog
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        stakeholder={stakeholder}
      />
    </>
  );
};
