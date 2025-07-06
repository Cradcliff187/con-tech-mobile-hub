import { useState } from 'react';
import { ResponsiveDialog } from '@/components/common/ResponsiveDialog';
import { TouchFriendlyButton } from '@/components/common/TouchFriendlyButton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useStakeholders } from '@/hooks/useStakeholders';
import { useToast } from '@/hooks/use-toast';
import type { Stakeholder, LeadStatus } from '@/hooks/useStakeholders';

interface UpdateLeadStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stakeholder: Stakeholder | null;
  onUpdated?: () => void;
}

export const UpdateLeadStatusDialog = ({
  open,
  onOpenChange,
  stakeholder,
  onUpdated
}: UpdateLeadStatusDialogProps) => {
  const [leadStatus, setLeadStatus] = useState<LeadStatus>('new');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { updateLeadStatus } = useStakeholders();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stakeholder) return;

    setLoading(true);
    try {
      const { error } = await updateLeadStatus(stakeholder.id, leadStatus, notes);
      
      if (!error) {
        onUpdated?.();
        onOpenChange(false);
        setNotes('');
        toast({
          title: "Lead status updated",
          description: `${stakeholder.company_name || stakeholder.contact_person} status changed to ${leadStatus.replace('_', ' ')}`
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const leadStatusOptions = [
    { value: 'new', label: 'New Lead' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'proposal_sent', label: 'Proposal Sent' },
    { value: 'negotiating', label: 'Negotiating' },
    { value: 'won', label: 'Won' },
    { value: 'lost', label: 'Lost' }
  ];

  if (!stakeholder) return null;

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Update Lead Status"
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="stakeholder-name">Stakeholder</Label>
          <div className="p-3 bg-slate-50 rounded-md">
            <p className="font-medium text-slate-900">
              {stakeholder.company_name || stakeholder.contact_person}
            </p>
            <p className="text-sm text-slate-600">
              Current: {stakeholder.lead_status?.replace('_', ' ') || 'New Lead'}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lead-status">New Lead Status</Label>
          <Select value={leadStatus} onValueChange={(value) => setLeadStatus(value as LeadStatus)}>
            <SelectTrigger>
              <SelectValue placeholder="Select lead status" />
            </SelectTrigger>
            <SelectContent>
              {leadStatusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this status change..."
            rows={3}
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
          <TouchFriendlyButton
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="order-2 sm:order-1"
          >
            Cancel
          </TouchFriendlyButton>
          <TouchFriendlyButton
            type="submit"
            disabled={loading}
            className="order-1 sm:order-2"
          >
            {loading ? 'Updating...' : 'Update Status'}
          </TouchFriendlyButton>
        </div>
      </form>
    </ResponsiveDialog>
  );
};