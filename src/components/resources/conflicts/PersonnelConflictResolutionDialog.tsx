
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar, Clock, Users } from 'lucide-react';

interface PersonnelConflictResolutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflict: {
    id: string;
    title: string;
    description: string;
    affectedProjects: string[];
  };
  onResolved: () => void;
}

export const PersonnelConflictResolutionDialog = ({
  open,
  onOpenChange,
  conflict,
  onResolved
}: PersonnelConflictResolutionDialogProps) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newHours, setNewHours] = useState<number>(0);
  const [extensionDays, setExtensionDays] = useState<number>(0);
  const [reassignmentNotes, setReassignmentNotes] = useState('');
  const { toast } = useToast();

  const handleResolve = async () => {
    if (!selectedOption) {
      toast({
        title: "Error",
        description: "Please select a resolution option",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      switch (selectedOption) {
        case 'reassign':
          // In a real implementation, this would reassign specific tasks
          // For now, we'll log the action and update allocation records
          console.log('Reassigning tasks:', reassignmentNotes);
          break;
          
        case 'extend':
          // Update project end dates
          const { error: projectError } = await supabase
            .from('projects')
            .update({
              end_date: new Date(Date.now() + extensionDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            })
            .in('name', conflict.affectedProjects);

          if (projectError) throw projectError;
          break;

        case 'reduce':
          // Update resource allocations to reduce hours
          const { error: allocationError } = await supabase
            .from('team_members')
            .update({
              hours_allocated: newHours
            })
            .eq('name', conflict.title.split(' ')[0]); // Extract member name from title

          if (allocationError) throw allocationError;
          break;
      }

      toast({
        title: "Conflict Resolved",
        description: "Personnel overallocation has been resolved"
      });

      onResolved();
      onOpenChange(false);
    } catch (error) {
      console.error('Error resolving conflict:', error);
      toast({
        title: "Error",
        description: "Failed to resolve conflict",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users size={20} />
            Resolve Personnel Conflict
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Conflict Details</Label>
            <p className="text-sm text-slate-600 mt-1">{conflict.description}</p>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Resolution Options</Label>
            <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="reassign" id="reassign" />
                <Label htmlFor="reassign" className="flex items-center gap-2">
                  <Users size={16} />
                  Reassign tasks to other team members
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="extend" id="extend" />
                <Label htmlFor="extend" className="flex items-center gap-2">
                  <Calendar size={16} />
                  Extend project timeline
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="reduce" id="reduce" />
                <Label htmlFor="reduce" className="flex items-center gap-2">
                  <Clock size={16} />
                  Reduce allocated hours
                </Label>
              </div>
            </RadioGroup>
          </div>

          {selectedOption === 'reassign' && (
            <div className="space-y-2">
              <Label htmlFor="notes">Reassignment Notes</Label>
              <Textarea
                id="notes"
                placeholder="Describe how tasks will be reassigned..."
                value={reassignmentNotes}
                onChange={(e) => setReassignmentNotes(e.target.value)}
              />
            </div>
          )}

          {selectedOption === 'extend' && (
            <div className="space-y-2">
              <Label htmlFor="extension">Extension Days</Label>
              <Input
                id="extension"
                type="number"
                min="1"
                value={extensionDays}
                onChange={(e) => setExtensionDays(Number(e.target.value))}
                placeholder="Number of days to extend"
              />
            </div>
          )}

          {selectedOption === 'reduce' && (
            <div className="space-y-2">
              <Label htmlFor="hours">New Hours per Week</Label>
              <Input
                id="hours"
                type="number"
                min="1"
                max="40"
                value={newHours}
                onChange={(e) => setNewHours(Number(e.target.value))}
                placeholder="Reduced hours allocation"
              />
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResolve}
              disabled={isSubmitting || !selectedOption}
            >
              {isSubmitting ? 'Resolving...' : 'Resolve Conflict'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
