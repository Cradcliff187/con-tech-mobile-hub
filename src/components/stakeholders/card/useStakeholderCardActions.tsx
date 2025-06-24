
import { useToast } from '@/hooks/use-toast';
import { formatPhoneNumber } from '@/utils/addressFormatting';
import { Stakeholder } from '@/hooks/useStakeholders';

export const useStakeholderCardActions = () => {
  const { toast } = useToast();

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

  const handlePhoneCall = async (stakeholder: Stakeholder) => {
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

  const handleEmailSend = async (stakeholder: Stakeholder) => {
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

  return {
    handlePhoneCall,
    handleEmailSend
  };
};
