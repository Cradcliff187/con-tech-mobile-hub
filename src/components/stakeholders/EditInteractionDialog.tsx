import { useState, useEffect } from 'react';
import { ResponsiveDialog } from '@/components/common/ResponsiveDialog';
import { TouchFriendlyButton } from '@/components/common/TouchFriendlyButton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useContactInteractions, InteractionType, ContactInteraction } from '@/hooks/useContactInteractions';
import { useToast } from '@/hooks/use-toast';
import { Phone, Mail, Users, MapPin, FileText, Calendar } from 'lucide-react';

interface EditInteractionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interaction: ContactInteraction | null;
  onInteractionSaved?: () => void;
}

export const EditInteractionDialog = ({
  open,
  onOpenChange,
  interaction,
  onInteractionSaved
}: EditInteractionDialogProps) => {
  const [formData, setFormData] = useState({
    interaction_type: '' as InteractionType,
    interaction_date: '',
    duration_minutes: '',
    subject: '',
    notes: '',
    outcome: '',
    follow_up_required: false,
    follow_up_date: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { updateInteraction } = useContactInteractions();
  const { toast } = useToast();

  const interactionTypes = [
    { value: 'call' as InteractionType, label: 'Phone Call', icon: Phone },
    { value: 'email' as InteractionType, label: 'Email', icon: Mail },
    { value: 'meeting' as InteractionType, label: 'Meeting', icon: Users },
    { value: 'site_visit' as InteractionType, label: 'Site Visit', icon: MapPin },
    { value: 'proposal' as InteractionType, label: 'Proposal', icon: FileText },
    { value: 'follow_up' as InteractionType, label: 'Follow-up', icon: Calendar }
  ];

  // Load interaction data when dialog opens
  useEffect(() => {
    if (open && interaction) {
      setFormData({
        interaction_type: interaction.interaction_type,
        interaction_date: interaction.interaction_date,
        duration_minutes: interaction.duration_minutes?.toString() || '',
        subject: interaction.subject || '',
        notes: interaction.notes || '',
        outcome: interaction.outcome || '',
        follow_up_required: interaction.follow_up_required,
        follow_up_date: interaction.follow_up_date || ''
      });
    }
  }, [open, interaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interaction || !formData.interaction_type) {
      toast({
        title: "Validation Error",
        description: "Please select an interaction type",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await updateInteraction(interaction.id, {
        interaction_type: formData.interaction_type,
        interaction_date: formData.interaction_date,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : undefined,
        subject: formData.subject || undefined,
        notes: formData.notes || undefined,
        outcome: formData.outcome || undefined,
        follow_up_required: formData.follow_up_required,
        follow_up_date: formData.follow_up_required && formData.follow_up_date ? formData.follow_up_date : undefined
      });

      if (!error) {
        onInteractionSaved?.();
      }
    } finally {
      setLoading(false);
    }
  };

  if (!interaction) return null;

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Interaction"
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Interaction Type */}
        <div className="space-y-2">
          <Label htmlFor="interaction-type">Interaction Type *</Label>
          <Select 
            value={formData.interaction_type} 
            onValueChange={(value: InteractionType) => setFormData(prev => ({ ...prev, interaction_type: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select interaction type" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {interactionTypes.map(({ value, label, icon: Icon }) => (
                <SelectItem key={value} value={value}>
                  <div className="flex items-center gap-2">
                    <Icon size={16} />
                    {label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date and Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="interaction-date">Date *</Label>
            <Input
              id="interaction-date"
              type="date"
              value={formData.interaction_date}
              onChange={(e) => setFormData(prev => ({ ...prev, interaction_date: e.target.value }))}
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              placeholder="e.g., 30"
              value={formData.duration_minutes}
              onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: e.target.value }))}
            />
          </div>
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            placeholder="Brief description of the interaction"
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Detailed notes about the interaction..."
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
          />
        </div>

        {/* Outcome */}
        <div className="space-y-2">
          <Label htmlFor="outcome">Outcome</Label>
          <Input
            id="outcome"
            placeholder="What was the result or next step?"
            value={formData.outcome}
            onChange={(e) => setFormData(prev => ({ ...prev, outcome: e.target.value }))}
          />
        </div>

        {/* Follow-up */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="follow-up-required"
              checked={formData.follow_up_required}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ 
                  ...prev, 
                  follow_up_required: checked === true,
                  follow_up_date: checked ? prev.follow_up_date : ''
                }))
              }
            />
            <Label htmlFor="follow-up-required">Schedule follow-up</Label>
          </div>
          
          {formData.follow_up_required && (
            <div className="space-y-2">
              <Label htmlFor="follow-up-date">Follow-up Date</Label>
              <Input
                id="follow-up-date"
                type="date"
                value={formData.follow_up_date}
                onChange={(e) => setFormData(prev => ({ ...prev, follow_up_date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          )}
        </div>

        {/* Actions */}
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
            disabled={loading || !formData.interaction_type}
            className="order-1 sm:order-2"
          >
            {loading ? 'Saving...' : 'Update Interaction'}
          </TouchFriendlyButton>
        </div>
      </form>
    </ResponsiveDialog>
  );
};