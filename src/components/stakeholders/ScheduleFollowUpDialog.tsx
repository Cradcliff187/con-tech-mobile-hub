import { useState } from 'react';
import { ResponsiveDialog } from '@/components/common/ResponsiveDialog';
import { TouchFriendlyButton } from '@/components/common/TouchFriendlyButton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useStakeholders } from '@/hooks/useStakeholders';
import { useToast } from '@/hooks/use-toast';
import type { Stakeholder } from '@/hooks/useStakeholders';

interface ScheduleFollowUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stakeholder: Stakeholder | null;
  onScheduled?: () => void;
}

export const ScheduleFollowUpDialog = ({
  open,
  onOpenChange,
  stakeholder,
  onScheduled
}: ScheduleFollowUpDialogProps) => {
  const [followUpDate, setFollowUpDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { scheduleFollowUp } = useStakeholders();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stakeholder || !followUpDate) return;

    setLoading(true);
    try {
      const { error } = await scheduleFollowUp(stakeholder.id, followUpDate, notes);
      
      if (!error) {
        onScheduled?.();
        onOpenChange(false);
        setFollowUpDate('');
        setNotes('');
        toast({
          title: "Follow-up scheduled",
          description: `Follow-up scheduled for ${new Date(followUpDate).toLocaleDateString()}`
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!stakeholder) return null;

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Schedule Follow-up"
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="stakeholder-name">Stakeholder</Label>
          <div className="p-3 bg-slate-50 rounded-md">
            <p className="font-medium text-slate-900">
              {stakeholder.company_name || stakeholder.contact_person}
            </p>
            {stakeholder.next_followup_date && (
              <p className="text-sm text-slate-600">
                Current follow-up: {new Date(stakeholder.next_followup_date).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="followup-date">Follow-up Date</Label>
          <Input
            id="followup-date"
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this follow-up..."
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
            disabled={loading || !followUpDate}
            className="order-1 sm:order-2"
          >
            {loading ? 'Scheduling...' : 'Schedule Follow-up'}
          </TouchFriendlyButton>
        </div>
      </form>
    </ResponsiveDialog>
  );
};